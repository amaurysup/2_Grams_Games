import { supabase } from '../lib/supabase';
import type { Achievement, UserAchievement, AchievementCategory } from '../types';
import { toast } from '../components/Toast';

// Liste des achievements disponibles
export const ACHIEVEMENTS: Achievement[] = [
  // Games category
  {
    id: 'first_game',
    name: 'Premier pas',
    description: 'Joue ton premier jeu',
    icon: '🎮',
    category: 'games',
    requirement: 1,
    xp_reward: 10,
    is_secret: false,
    rarity: 'common',
  },
  {
    id: 'games_10',
    name: 'Habitué',
    description: 'Joue 10 jeux',
    icon: '🎯',
    category: 'games',
    requirement: 10,
    xp_reward: 50,
    is_secret: false,
    rarity: 'common',
  },
  {
    id: 'games_50',
    name: 'Vétéran',
    description: 'Joue 50 jeux',
    icon: '🏅',
    category: 'games',
    requirement: 50,
    xp_reward: 200,
    is_secret: false,
    rarity: 'rare',
  },
  {
    id: 'games_100',
    name: 'Légende',
    description: 'Joue 100 jeux',
    icon: '👑',
    category: 'games',
    requirement: 100,
    xp_reward: 500,
    is_secret: false,
    rarity: 'epic',
  },
  {
    id: 'games_500',
    name: 'Maître du jeu',
    description: 'Joue 500 jeux',
    icon: '🌟',
    category: 'games',
    requirement: 500,
    xp_reward: 2000,
    is_secret: false,
    rarity: 'legendary',
  },

  // Time category
  {
    id: 'time_1h',
    name: 'Une petite heure',
    description: 'Joue pendant 1 heure au total',
    icon: '⏰',
    category: 'time',
    requirement: 3600,
    xp_reward: 30,
    is_secret: false,
    rarity: 'common',
  },
  {
    id: 'time_10h',
    name: 'Passionné',
    description: 'Joue pendant 10 heures au total',
    icon: '⏱️',
    category: 'time',
    requirement: 36000,
    xp_reward: 150,
    is_secret: false,
    rarity: 'rare',
  },
  {
    id: 'time_50h',
    name: 'No-life (gentil)',
    description: 'Joue pendant 50 heures au total',
    icon: '🕐',
    category: 'time',
    requirement: 180000,
    xp_reward: 500,
    is_secret: false,
    rarity: 'epic',
  },

  // Streak category
  {
    id: 'streak_3',
    name: 'Régulier',
    description: 'Joue 3 jours de suite',
    icon: '🔥',
    category: 'streak',
    requirement: 3,
    xp_reward: 30,
    is_secret: false,
    rarity: 'common',
  },
  {
    id: 'streak_7',
    name: 'Semaine parfaite',
    description: 'Joue 7 jours de suite',
    icon: '🔥',
    category: 'streak',
    requirement: 7,
    xp_reward: 100,
    is_secret: false,
    rarity: 'rare',
  },
  {
    id: 'streak_30',
    name: 'Mois de folie',
    description: 'Joue 30 jours de suite',
    icon: '🔥',
    category: 'streak',
    requirement: 30,
    xp_reward: 500,
    is_secret: false,
    rarity: 'epic',
  },

  // Social category
  {
    id: 'first_friend',
    name: 'Sociable',
    description: 'Ajoute ton premier ami',
    icon: '👥',
    category: 'social',
    requirement: 1,
    xp_reward: 20,
    is_secret: false,
    rarity: 'common',
  },
  {
    id: 'friends_10',
    name: 'Populaire',
    description: 'Ajoute 10 amis',
    icon: '🤝',
    category: 'social',
    requirement: 10,
    xp_reward: 100,
    is_secret: false,
    rarity: 'rare',
  },
  {
    id: 'first_review',
    name: 'Critique',
    description: 'Laisse ton premier avis',
    icon: '📝',
    category: 'social',
    requirement: 1,
    xp_reward: 15,
    is_secret: false,
    rarity: 'common',
  },
  {
    id: 'first_playlist',
    name: 'DJ des jeux',
    description: 'Crée ta première playlist',
    icon: '📋',
    category: 'social',
    requirement: 1,
    xp_reward: 25,
    is_secret: false,
    rarity: 'common',
  },

  // Special/Secret category
  {
    id: 'night_owl',
    name: 'Noctambule',
    description: 'Joue après minuit',
    icon: '🦉',
    category: 'special',
    requirement: 1,
    xp_reward: 50,
    is_secret: true,
    rarity: 'rare',
  },
  {
    id: 'early_bird',
    name: 'Lève-tôt',
    description: 'Joue avant 6h du matin',
    icon: '🐦',
    category: 'special',
    requirement: 1,
    xp_reward: 50,
    is_secret: true,
    rarity: 'rare',
  },
  {
    id: 'party_animal',
    name: 'Party Animal',
    description: 'Lance 10 Party Mode',
    icon: '🎉',
    category: 'special',
    requirement: 10,
    xp_reward: 100,
    is_secret: false,
    rarity: 'rare',
  },
  {
    id: 'explorer',
    name: 'Explorateur',
    description: 'Joue à un jeu de chaque thème',
    icon: '🧭',
    category: 'special',
    requirement: 6,
    xp_reward: 150,
    is_secret: false,
    rarity: 'epic',
  },
];

const ACHIEVEMENTS_STORAGE_KEY = '2gg_user_achievements';

class AchievementsService {
  private userId: string | null = null;
  private userAchievements: Map<string, UserAchievement> = new Map();
  private listeners: Array<(achievement: Achievement) => void> = [];

  setUser(userId: string | null): void {
    this.userId = userId;
    if (userId) {
      this.loadAchievements();
    } else {
      this.userAchievements.clear();
    }
  }

  private async loadAchievements(): Promise<void> {
    if (!this.userId) return;

    // Essayer de charger depuis Supabase
    try {
      const { data } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', this.userId);

      if (data) {
        data.forEach((ua: UserAchievement) => {
          this.userAchievements.set(ua.achievement_id, ua);
        });
        this.saveToLocal();
        return;
      }
    } catch (e) {
      console.log('Achievements not found in Supabase, using local');
    }

    // Fallback sur localStorage
    const local = localStorage.getItem(`${ACHIEVEMENTS_STORAGE_KEY}_${this.userId}`);
    if (local) {
      const parsed = JSON.parse(local) as UserAchievement[];
      parsed.forEach(ua => this.userAchievements.set(ua.achievement_id, ua));
    }
  }

  private saveToLocal(): void {
    if (!this.userId) return;
    const achievements = Array.from(this.userAchievements.values());
    localStorage.setItem(`${ACHIEVEMENTS_STORAGE_KEY}_${this.userId}`, JSON.stringify(achievements));
  }

  private async saveToServer(ua: UserAchievement): Promise<void> {
    try {
      await supabase.from('user_achievements').upsert(ua);
    } catch (e) {
      console.error('Failed to save achievement to server:', e);
    }
  }

  // Vérifier et débloquer un achievement
  checkAndUnlock(achievementId: string, currentProgress: number): boolean {
    if (!this.userId) return false;

    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement) return false;

    const existing = this.userAchievements.get(achievementId);
    
    // Déjà débloqué
    if (existing?.unlocked_at) return false;

    // Mettre à jour la progression
    const userAchievement: UserAchievement = {
      achievement_id: achievementId,
      user_id: this.userId,
      unlocked_at: currentProgress >= achievement.requirement ? new Date().toISOString() : '',
      progress: currentProgress,
    };

    // Débloquer si le requirement est atteint
    if (currentProgress >= achievement.requirement) {
      this.userAchievements.set(achievementId, userAchievement);
      this.saveToLocal();
      this.saveToServer(userAchievement);
      this.notifyUnlock(achievement);
      return true;
    }

    // Sinon, juste mettre à jour la progression
    this.userAchievements.set(achievementId, userAchievement);
    this.saveToLocal();
    return false;
  }

  private notifyUnlock(achievement: Achievement): void {
    // Toast notification
    toast.success(`🏆 Achievement débloqué: ${achievement.name}!`);
    
    // Notifier les listeners
    this.listeners.forEach(listener => listener(achievement));
  }

  // Obtenir tous les achievements avec leur statut
  getAllAchievements(): Array<Achievement & { unlocked: boolean; progress: number; unlocked_at?: string }> {
    return ACHIEVEMENTS.map(achievement => {
      const userAchievement = this.userAchievements.get(achievement.id);
      return {
        ...achievement,
        unlocked: !!userAchievement?.unlocked_at,
        progress: userAchievement?.progress || 0,
        unlocked_at: userAchievement?.unlocked_at,
      };
    });
  }

  // Obtenir les achievements par catégorie
  getByCategory(category: AchievementCategory): Array<Achievement & { unlocked: boolean; progress: number }> {
    return this.getAllAchievements().filter(a => a.category === category);
  }

  // Obtenir les achievements débloqués
  getUnlocked(): Array<Achievement & { unlocked_at: string }> {
    return this.getAllAchievements()
      .filter(a => a.unlocked && a.unlocked_at)
      .map(a => ({ ...a, unlocked_at: a.unlocked_at! }));
  }

  // Obtenir le nombre total d'XP gagné
  getTotalXP(): number {
    let total = 0;
    this.userAchievements.forEach((ua, id) => {
      if (ua.unlocked_at) {
        const achievement = ACHIEVEMENTS.find(a => a.id === id);
        if (achievement) {
          total += achievement.xp_reward;
        }
      }
    });
    return total;
  }

  // Calculer le niveau basé sur l'XP
  getLevel(): number {
    const xp = this.getTotalXP();
    // Formule: niveau = sqrt(xp / 100) + 1
    return Math.floor(Math.sqrt(xp / 100)) + 1;
  }

  // XP nécessaire pour le prochain niveau
  getXPForNextLevel(): { current: number; required: number; progress: number } {
    const level = this.getLevel();
    const xp = this.getTotalXP();
    const currentLevelXP = Math.pow(level - 1, 2) * 100;
    const nextLevelXP = Math.pow(level, 2) * 100;
    const required = nextLevelXP - currentLevelXP;
    const current = xp - currentLevelXP;
    return {
      current,
      required,
      progress: Math.min((current / required) * 100, 100),
    };
  }

  // S'abonner aux nouveaux achievements
  onUnlock(listener: (achievement: Achievement) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Vérifications spéciales basées sur le contexte
  checkTimeBasedAchievements(): void {
    const hour = new Date().getHours();
    
    // Noctambule (après minuit, avant 5h)
    if (hour >= 0 && hour < 5) {
      this.checkAndUnlock('night_owl', 1);
    }
    
    // Lève-tôt (5h-6h)
    if (hour >= 5 && hour < 6) {
      this.checkAndUnlock('early_bird', 1);
    }
  }
}

export const achievementsService = new AchievementsService();
