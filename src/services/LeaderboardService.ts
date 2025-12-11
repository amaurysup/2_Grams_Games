import { supabase } from '../lib/supabase';
import type { LeaderboardEntry, LeaderboardType, LeaderboardCategory } from '../types';

class LeaderboardService {
  private cache: Map<string, { data: LeaderboardEntry[]; timestamp: number }> = new Map();
  private CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  // Obtenir le leaderboard
  async getLeaderboard(
    category: LeaderboardCategory,
    type: LeaderboardType = 'all_time',
    limit: number = 50
  ): Promise<LeaderboardEntry[]> {
    const cacheKey = `${category}_${type}_${limit}`;
    
    // Vérifier le cache
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    try {
      let data: LeaderboardEntry[] = [];

      switch (category) {
        case 'games_played':
          data = await this.getGamesPlayedLeaderboard(type, limit);
          break;
        case 'time_played':
          data = await this.getTimePlayedLeaderboard(type, limit);
          break;
        case 'achievements':
          data = await this.getAchievementsLeaderboard(limit);
          break;
        case 'xp':
          data = await this.getXPLeaderboard(limit);
          break;
      }

      // Mettre en cache
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  }

  private async getGamesPlayedLeaderboard(type: LeaderboardType, limit: number): Promise<LeaderboardEntry[]> {
    let query = supabase
      .from('user_stats')
      .select('user_id, total_games_played, profiles!inner(username, avatar_url)')
      .order('total_games_played', { ascending: false })
      .limit(limit);

    // Filtrer par période
    if (type === 'weekly') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      query = query.gte('updated_at', weekAgo.toISOString());
    } else if (type === 'monthly') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      query = query.gte('updated_at', monthAgo.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map((row: any, index: number) => ({
      rank: index + 1,
      user_id: row.user_id,
      username: row.profiles?.username || 'Anonyme',
      avatar_url: row.profiles?.avatar_url,
      value: row.total_games_played,
    }));
  }

  private async getTimePlayedLeaderboard(type: LeaderboardType, limit: number): Promise<LeaderboardEntry[]> {
    let query = supabase
      .from('user_stats')
      .select('user_id, total_time_played, profiles!inner(username, avatar_url)')
      .order('total_time_played', { ascending: false })
      .limit(limit);

    if (type === 'weekly') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      query = query.gte('updated_at', weekAgo.toISOString());
    } else if (type === 'monthly') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      query = query.gte('updated_at', monthAgo.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map((row: any, index: number) => ({
      rank: index + 1,
      user_id: row.user_id,
      username: row.profiles?.username || 'Anonyme',
      avatar_url: row.profiles?.avatar_url,
      value: Math.floor(row.total_time_played / 60), // Convertir en minutes
    }));
  }

  private async getAchievementsLeaderboard(limit: number): Promise<LeaderboardEntry[]> {
    // Compter les achievements par utilisateur
    const { data, error } = await supabase
      .from('user_achievements')
      .select('user_id')
      .not('unlocked_at', 'is', null);

    if (error) throw error;

    // Grouper par user_id et compter
    const counts = new Map<string, number>();
    (data || []).forEach((row: any) => {
      counts.set(row.user_id, (counts.get(row.user_id) || 0) + 1);
    });

    // Trier et limiter
    const sorted = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);

    // Récupérer les profils
    const userIds = sorted.map(([id]) => id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .in('id', userIds);

    const profileMap = new Map((profiles || []).map(p => [p.id, p]));

    return sorted.map(([userId, count], index) => {
      const profile = profileMap.get(userId);
      return {
        rank: index + 1,
        user_id: userId,
        username: profile?.username || 'Anonyme',
        avatar_url: profile?.avatar_url,
        value: count,
      };
    });
  }

  private async getXPLeaderboard(limit: number): Promise<LeaderboardEntry[]> {
    // On utilise une vue ou on calcule à partir des achievements
    const { data, error } = await supabase
      .from('user_achievements')
      .select('user_id, achievement_id')
      .not('unlocked_at', 'is', null);

    if (error) throw error;

    // Importer les définitions d'achievements pour calculer l'XP
    const { ACHIEVEMENTS } = await import('./AchievementsService');
    
    // Calculer l'XP par utilisateur
    const xpByUser = new Map<string, number>();
    (data || []).forEach((row: any) => {
      const achievement = ACHIEVEMENTS.find(a => a.id === row.achievement_id);
      if (achievement) {
        xpByUser.set(row.user_id, (xpByUser.get(row.user_id) || 0) + achievement.xp_reward);
      }
    });

    // Trier et limiter
    const sorted = Array.from(xpByUser.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);

    // Récupérer les profils
    const userIds = sorted.map(([id]) => id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .in('id', userIds);

    const profileMap = new Map((profiles || []).map(p => [p.id, p]));

    return sorted.map(([userId, xp], index) => {
      const profile = profileMap.get(userId);
      const level = Math.floor(Math.sqrt(xp / 100)) + 1;
      return {
        rank: index + 1,
        user_id: userId,
        username: profile?.username || 'Anonyme',
        avatar_url: profile?.avatar_url,
        value: xp,
        level,
      };
    });
  }

  // Obtenir le rang d'un utilisateur spécifique
  async getUserRank(
    userId: string,
    category: LeaderboardCategory
  ): Promise<{ rank: number; total: number } | null> {
    const leaderboard = await this.getLeaderboard(category, 'all_time', 1000);
    const index = leaderboard.findIndex(e => e.user_id === userId);
    
    if (index === -1) {
      return { rank: leaderboard.length + 1, total: leaderboard.length + 1 };
    }
    
    return { rank: index + 1, total: leaderboard.length };
  }

  // Invalider le cache
  invalidateCache(): void {
    this.cache.clear();
  }
}

export const leaderboardService = new LeaderboardService();
