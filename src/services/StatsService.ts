import { supabase } from '../lib/supabase';
import type { UserStats, GameSession } from '../types';

const STATS_STORAGE_KEY = '2gg_user_stats';
const SESSIONS_STORAGE_KEY = '2gg_game_sessions';

class StatsService {
  private userId: string | null = null;
  private stats: UserStats | null = null;
  private currentSession: GameSession | null = null;
  private beforeUnloadHandler: ((e: BeforeUnloadEvent) => void) | null = null;

  constructor() {
    // Terminer automatiquement les sessions en cours si la page se ferme
    this.setupAutoEndSession();
  }

  private setupAutoEndSession(): void {
    this.beforeUnloadHandler = () => {
      if (this.currentSession) {
        // Terminer la session de manière synchrone avant que la page ne se ferme
        this.endGameSession(false);
      }
    };

    window.addEventListener('beforeunload', this.beforeUnloadHandler);
  }

  setUser(userId: string | null): void {
    this.userId = userId;
    if (userId) {
      this.loadStats();
    } else {
      this.stats = null;
    }
  }

  private getDefaultStats(userId: string): UserStats {
    return {
      user_id: userId,
      total_games_played: 0,
      total_time_played: 0,
      favorite_theme: null,
      games_played_by_theme: {},
      games_played_by_game: {},
      weekly_activity: [0, 0, 0, 0, 0, 0, 0],
      monthly_activity: Array(30).fill(0),
      longest_streak: 0,
      current_streak: 0,
      last_played_at: null,
    };
  }

  private async loadStats(): Promise<void> {
    if (!this.userId) return;

    // Essayer de charger depuis Supabase
    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', this.userId)
        .single();

      if (data && !error) {
        this.stats = data as UserStats;
        this.saveToLocal();
        return;
      }
    } catch (e) {
      console.log('Stats not found in Supabase, using local');
    }

    // Fallback sur localStorage
    const local = localStorage.getItem(`${STATS_STORAGE_KEY}_${this.userId}`);
    if (local) {
      this.stats = JSON.parse(local);
    } else {
      this.stats = this.getDefaultStats(this.userId);
    }
  }

  private saveToLocal(): void {
    if (!this.userId || !this.stats) return;
    localStorage.setItem(`${STATS_STORAGE_KEY}_${this.userId}`, JSON.stringify(this.stats));
  }

  private async saveToServer(): Promise<void> {
    if (!this.userId || !this.stats) return;

    try {
      await supabase
        .from('user_stats')
        .upsert(this.stats, { onConflict: 'user_id' });
    } catch (e) {
      console.error('Failed to save stats to server:', e);
    }
  }

  getStats(): UserStats | null {
    return this.stats;
  }

  // Démarrer une session de jeu
  startGameSession(gameId: string, gameName: string, playersCount: number = 1): void {
    if (!this.userId) return;

    this.currentSession = {
      id: crypto.randomUUID(),
      user_id: this.userId,
      game_id: gameId,
      game_name: gameName,
      started_at: new Date().toISOString(),
      ended_at: null,
      duration: 0,
      players_count: playersCount,
      completed: false,
    };
  }

  // Terminer une session de jeu
  endGameSession(completed: boolean = true): GameSession | null {
    if (!this.currentSession || !this.stats) return null;

    const session = this.currentSession;
    session.ended_at = new Date().toISOString();
    session.duration = Math.floor(
      (new Date(session.ended_at).getTime() - new Date(session.started_at).getTime()) / 1000
    );
    session.completed = completed;

    // Mettre à jour les stats
    this.stats.total_games_played++;
    this.stats.total_time_played += session.duration;
    this.stats.last_played_at = session.ended_at;

    // Stats par jeu
    const gameKey = session.game_id;
    this.stats.games_played_by_game[gameKey] = (this.stats.games_played_by_game[gameKey] || 0) + 1;

    // Activité hebdomadaire (jour de la semaine, 0 = lundi)
    const dayOfWeek = (new Date().getDay() + 6) % 7;
    this.stats.weekly_activity[dayOfWeek]++;

    // Activité mensuelle (dernier jour)
    this.stats.monthly_activity[this.stats.monthly_activity.length - 1]++;

    // Streak
    this.updateStreak();

    // Sauvegarder
    this.saveToLocal();
    this.saveToServer();

    // Sauvegarder la session
    this.saveSession(session);

    this.currentSession = null;
    return session;
  }

  private updateStreak(): void {
    if (!this.stats) return;

    const today = new Date().toDateString();
    const lastPlayed = this.stats.last_played_at 
      ? new Date(this.stats.last_played_at).toDateString() 
      : null;

    if (lastPlayed === today) {
      // Déjà joué aujourd'hui, pas de changement
      return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (lastPlayed === yesterday.toDateString()) {
      // Joué hier, continuer le streak
      this.stats.current_streak++;
    } else {
      // Streak cassé, recommencer
      this.stats.current_streak = 1;
    }

    if (this.stats.current_streak > this.stats.longest_streak) {
      this.stats.longest_streak = this.stats.current_streak;
    }
  }

  private saveSession(session: GameSession): void {
    if (!this.userId) return;

    // Sauvegarder localement
    const key = `${SESSIONS_STORAGE_KEY}_${this.userId}`;
    const sessions = JSON.parse(localStorage.getItem(key) || '[]') as GameSession[];
    sessions.push(session);
    
    // Garder seulement les 100 dernières sessions
    if (sessions.length > 100) {
      sessions.splice(0, sessions.length - 100);
    }
    
    localStorage.setItem(key, JSON.stringify(sessions));

    // Sauvegarder sur le serveur (fire and forget)
    void supabase.from('game_sessions').insert(session);
  }

  getRecentSessions(limit: number = 10): GameSession[] {
    if (!this.userId) return [];

    const key = `${SESSIONS_STORAGE_KEY}_${this.userId}`;
    const sessions = JSON.parse(localStorage.getItem(key) || '[]') as GameSession[];
    return sessions.slice(-limit).reverse();
  }

  // Calculer le thème favori
  getFavoriteTheme(): string | null {
    if (!this.stats) return null;

    const themes = this.stats.games_played_by_theme;
    let maxCount = 0;
    let favorite: string | null = null;

    for (const [theme, count] of Object.entries(themes)) {
      if (count > maxCount) {
        maxCount = count;
        favorite = theme;
      }
    }

    return favorite;
  }

  // Stats pour le "Wrapped"
  getWrappedStats(): {
    totalGames: number;
    totalTime: string;
    favoriteGame: string | null;
    favoriteTheme: string | null;
    longestStreak: number;
    level: number;
  } {
    if (!this.stats) {
      return {
        totalGames: 0,
        totalTime: '0h 0min',
        favoriteGame: null,
        favoriteTheme: null,
        longestStreak: 0,
        level: 1,
      };
    }

    // Convertir le temps en heures/minutes
    const hours = Math.floor(this.stats.total_time_played / 3600);
    const minutes = Math.floor((this.stats.total_time_played % 3600) / 60);
    const totalTime = `${hours}h ${minutes}min`;

    // Trouver le jeu favori
    let favoriteGame: string | null = null;
    let maxPlayed = 0;
    for (const [game, count] of Object.entries(this.stats.games_played_by_game)) {
      if (count > maxPlayed) {
        maxPlayed = count;
        favoriteGame = game;
      }
    }

    // Calculer le niveau (1 niveau tous les 10 jeux + 1h de jeu)
    const level = Math.floor(
      this.stats.total_games_played / 10 + 
      this.stats.total_time_played / 3600
    ) + 1;

    return {
      totalGames: this.stats.total_games_played,
      totalTime,
      favoriteGame,
      favoriteTheme: this.getFavoriteTheme(),
      longestStreak: this.stats.longest_streak,
      level,
    };
  }

  // Réinitialiser l'activité hebdomadaire (à appeler chaque semaine)
  rotateWeeklyActivity(): void {
    if (!this.stats) return;
    this.stats.weekly_activity = [0, 0, 0, 0, 0, 0, 0];
    this.saveToLocal();
  }

  // Faire défiler l'activité mensuelle (à appeler chaque jour)
  rotateMonthlyActivity(): void {
    if (!this.stats) return;
    this.stats.monthly_activity.shift();
    this.stats.monthly_activity.push(0);
    this.saveToLocal();
  }

  // Vérifier si une session est en cours
  hasActiveSession(): boolean {
    return this.currentSession !== null;
  }

  // Obtenir la session en cours
  getCurrentSession(): GameSession | null {
    return this.currentSession;
  }
}

export const statsService = new StatsService();
