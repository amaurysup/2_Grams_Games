import type { Challenge, UserChallenge, ChallengeType } from '../types';
import { toast } from '../components/Toast';

const CHALLENGES_STORAGE_KEY = '2gg_user_challenges';

// Générateur de défis quotidiens
const DAILY_CHALLENGE_TEMPLATES: Omit<Challenge, 'id' | 'expires_at'>[] = [
  {
    type: 'daily',
    title: 'Joueur du jour',
    description: 'Joue 3 jeux aujourd\'hui',
    action: 'play_games',
    target: 3,
    xp_reward: 30,
    icon: '🎮',
  },
  {
    type: 'daily',
    title: 'Explorateur',
    description: 'Essaie un jeu que tu n\'as jamais fait',
    action: 'play_unique',
    target: 1,
    xp_reward: 25,
    icon: '🧭',
  },
  {
    type: 'daily',
    title: 'Mode Chill',
    description: 'Joue 2 jeux du thème Chill',
    action: 'play_theme',
    target: 2,
    target_theme: 'chill',
    xp_reward: 35,
    icon: '😌',
  },
  {
    type: 'daily',
    title: 'Destruction massive',
    description: 'Joue 2 jeux du thème Destruction',
    action: 'play_theme',
    target: 2,
    target_theme: 'destruction',
    xp_reward: 35,
    icon: '💥',
  },
  {
    type: 'daily',
    title: 'Réflexion intense',
    description: 'Joue 2 jeux du thème Réflexion',
    action: 'play_theme',
    target: 2,
    target_theme: 'réflexion',
    xp_reward: 35,
    icon: '🧠',
  },
  {
    type: 'daily',
    title: 'Marathon',
    description: 'Joue pendant 30 minutes',
    action: 'play_duration',
    target: 1800,
    xp_reward: 40,
    icon: '⏱️',
  },
];

// Générateur de défis hebdomadaires
const WEEKLY_CHALLENGE_TEMPLATES: Omit<Challenge, 'id' | 'expires_at'>[] = [
  {
    type: 'weekly',
    title: 'Semaine de jeu',
    description: 'Joue 15 jeux cette semaine',
    action: 'play_games',
    target: 15,
    xp_reward: 150,
    icon: '🗓️',
  },
  {
    type: 'weekly',
    title: 'Variété',
    description: 'Joue à 10 jeux différents',
    action: 'play_unique',
    target: 10,
    xp_reward: 200,
    icon: '🎲',
  },
  {
    type: 'weekly',
    title: 'Social butterfly',
    description: 'Invite un ami à jouer',
    action: 'invite_friend',
    target: 1,
    xp_reward: 100,
    icon: '🦋',
  },
  {
    type: 'weekly',
    title: 'Temps de qualité',
    description: 'Joue pendant 2 heures au total',
    action: 'play_duration',
    target: 7200,
    xp_reward: 175,
    icon: '⏰',
  },
  {
    type: 'weekly',
    title: 'Tour complet',
    description: 'Joue au moins 1 jeu de chaque thème',
    action: 'play_theme',
    target: 6,
    xp_reward: 250,
    icon: '🌈',
  },
];

class ChallengesService {
  private userId: string | null = null;
  private activeChallenges: Challenge[] = [];
  private userProgress: Map<string, UserChallenge> = new Map();
  private listeners: Array<(challenge: Challenge) => void> = [];

  setUser(userId: string | null): void {
    this.userId = userId;
    if (userId) {
      this.loadChallenges();
    } else {
      this.activeChallenges = [];
      this.userProgress.clear();
    }
  }

  private async loadChallenges(): Promise<void> {
    if (!this.userId) return;

    // Charger depuis localStorage
    const stored = localStorage.getItem(`${CHALLENGES_STORAGE_KEY}_${this.userId}`);
    if (stored) {
      const data = JSON.parse(stored);
      this.activeChallenges = data.challenges || [];
      (data.progress || []).forEach((p: UserChallenge) => {
        this.userProgress.set(p.challenge_id, p);
      });
    }

    // Vérifier si on doit générer de nouveaux défis
    this.checkAndGenerateChallenges();
  }

  private saveToLocal(): void {
    if (!this.userId) return;
    const data = {
      challenges: this.activeChallenges,
      progress: Array.from(this.userProgress.values()),
    };
    localStorage.setItem(`${CHALLENGES_STORAGE_KEY}_${this.userId}`, JSON.stringify(data));
  }

  private checkAndGenerateChallenges(): void {
    const now = new Date();
    
    // Filtrer les défis expirés
    this.activeChallenges = this.activeChallenges.filter(c => new Date(c.expires_at) > now);
    
    // Vérifier s'il manque des défis quotidiens
    const dailyChallenges = this.activeChallenges.filter(c => c.type === 'daily');
    if (dailyChallenges.length < 3) {
      this.generateDailyChallenges(3 - dailyChallenges.length);
    }
    
    // Vérifier s'il manque des défis hebdomadaires
    const weeklyChallenges = this.activeChallenges.filter(c => c.type === 'weekly');
    if (weeklyChallenges.length < 2) {
      this.generateWeeklyChallenges(2 - weeklyChallenges.length);
    }
    
    this.saveToLocal();
  }

  private generateDailyChallenges(count: number): void {
    const existingIds = new Set(this.activeChallenges.map(c => c.title));
    const available = DAILY_CHALLENGE_TEMPLATES.filter(t => !existingIds.has(t.title));
    
    // Mélanger et prendre count éléments
    const shuffled = available.sort(() => Math.random() - 0.5).slice(0, count);
    
    // Date d'expiration: minuit ce soir
    const expiry = new Date();
    expiry.setHours(23, 59, 59, 999);
    
    shuffled.forEach(template => {
      const challenge: Challenge = {
        ...template,
        id: crypto.randomUUID(),
        expires_at: expiry.toISOString(),
      };
      this.activeChallenges.push(challenge);
    });
  }

  private generateWeeklyChallenges(count: number): void {
    const existingIds = new Set(this.activeChallenges.map(c => c.title));
    const available = WEEKLY_CHALLENGE_TEMPLATES.filter(t => !existingIds.has(t.title));
    
    const shuffled = available.sort(() => Math.random() - 0.5).slice(0, count);
    
    // Date d'expiration: dimanche 23:59
    const expiry = new Date();
    const daysUntilSunday = (7 - expiry.getDay()) % 7 || 7;
    expiry.setDate(expiry.getDate() + daysUntilSunday);
    expiry.setHours(23, 59, 59, 999);
    
    shuffled.forEach(template => {
      const challenge: Challenge = {
        ...template,
        id: crypto.randomUUID(),
        expires_at: expiry.toISOString(),
      };
      this.activeChallenges.push(challenge);
    });
  }

  // Obtenir tous les défis actifs avec leur progression
  getActiveChallenges(): Array<Challenge & { progress: number; completed: boolean }> {
    return this.activeChallenges.map(challenge => {
      const userChallenge = this.userProgress.get(challenge.id);
      return {
        ...challenge,
        progress: userChallenge?.progress || 0,
        completed: userChallenge?.completed || false,
      };
    });
  }

  // Obtenir les défis par type
  getChallengesByType(type: ChallengeType): Array<Challenge & { progress: number; completed: boolean }> {
    return this.getActiveChallenges().filter(c => c.type === type);
  }

  // Mettre à jour la progression d'un défi
  updateProgress(challengeId: string, increment: number = 1): boolean {
    if (!this.userId) return false;

    const challenge = this.activeChallenges.find(c => c.id === challengeId);
    if (!challenge) return false;

    let userChallenge = this.userProgress.get(challengeId);
    if (!userChallenge) {
      userChallenge = {
        challenge_id: challengeId,
        user_id: this.userId,
        progress: 0,
        completed: false,
        completed_at: null,
      };
    }

    // Déjà complété
    if (userChallenge.completed) return false;

    userChallenge.progress += increment;

    // Vérifier si complété
    if (userChallenge.progress >= challenge.target) {
      userChallenge.completed = true;
      userChallenge.completed_at = new Date().toISOString();
      this.notifyCompletion(challenge);
    }

    this.userProgress.set(challengeId, userChallenge);
    this.saveToLocal();

    return userChallenge.completed;
  }

  // Mettre à jour tous les défis selon une action
  updateChallengesByAction(
    action: string, 
    increment: number = 1, 
    theme?: string
  ): void {
    this.activeChallenges.forEach(challenge => {
      if (challenge.action !== action) return;
      
      // Si c'est un défi de thème, vérifier le thème
      if (challenge.action === 'play_theme' && challenge.target_theme) {
        if (theme?.toLowerCase() !== challenge.target_theme.toLowerCase()) return;
      }
      
      this.updateProgress(challenge.id, increment);
    });
  }

  private notifyCompletion(challenge: Challenge): void {
    toast.success(`🎯 Défi complété: ${challenge.title} (+${challenge.xp_reward} XP)`);
    this.listeners.forEach(listener => listener(challenge));
  }

  // S'abonner aux défis complétés
  onComplete(listener: (challenge: Challenge) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Calculer le total d'XP des défis complétés
  getCompletedXP(): number {
    let total = 0;
    this.userProgress.forEach((progress, id) => {
      if (progress.completed) {
        const challenge = this.activeChallenges.find(c => c.id === id);
        if (challenge) {
          total += challenge.xp_reward;
        }
      }
    });
    return total;
  }

  // Forcer la régénération des défis (pour debug)
  regenerateChallenges(): void {
    this.activeChallenges = [];
    this.userProgress.clear();
    this.checkAndGenerateChallenges();
  }
}

export const challengesService = new ChallengesService();
