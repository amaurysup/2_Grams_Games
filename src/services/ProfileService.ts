import { supabase } from '../lib/supabase';
import type { PublicProfile, Badge } from '../types';
import { ACHIEVEMENTS } from './AchievementsService';

class ProfileService {
  private userId: string | null = null;
  private currentProfile: PublicProfile | null = null;

  setUser(userId: string | null): void {
    this.userId = userId;
    if (userId) {
      this.loadOwnProfile();
    } else {
      this.currentProfile = null;
    }
  }

  private async loadOwnProfile(): Promise<void> {
    if (!this.userId) return;
    this.currentProfile = await this.getProfile(this.userId);
  }

  // Obtenir le profil public d'un utilisateur
  async getProfile(userId: string): Promise<PublicProfile | null> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !profile) return null;

      // Récupérer les stats et achievements
      const stats = await this.getUserStats(userId);
      const badges = await this.getUserBadges(userId);
      const favoriteGames = await this.getFavoriteGames(userId);

      // Vérifier le statut d'amitié si c'est pas notre profil
      let friendshipStatus = undefined;
      let isFriend = false;
      if (this.userId && userId !== this.userId) {
        const { data: friendship } = await supabase
          .from('friendships')
          .select('status')
          .or(`and(user_id.eq.${this.userId},friend_id.eq.${userId}),and(user_id.eq.${userId},friend_id.eq.${this.userId})`)
          .single();
        
        if (friendship) {
          friendshipStatus = friendship.status;
          isFriend = friendship.status === 'accepted';
        }
      }

      return {
        user_id: userId,
        username: profile.username,
        avatar_url: profile.avatar_url,
        bio: profile.bio,
        level: stats.level,
        total_xp: stats.totalXp,
        achievements_count: stats.achievementsCount,
        games_played: stats.gamesPlayed,
        favorite_games: favoriteGames,
        badges,
        created_at: profile.created_at,
        is_friend: isFriend,
        friendship_status: friendshipStatus,
      };
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  }

  private async getUserStats(userId: string): Promise<{
    level: number;
    totalXp: number;
    achievementsCount: number;
    gamesPlayed: number;
  }> {
    try {
      // Depuis Supabase
      const { data: stats } = await supabase
        .from('user_stats')
        .select('total_games_played, total_time_played')
        .eq('user_id', userId)
        .single();

      const { data: achievements } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', userId)
        .not('unlocked_at', 'is', null);

      const achievementsCount = achievements?.length || 0;
      const gamesPlayed = stats?.total_games_played || 0;
      
      // Calculer XP total
      let totalXp = 0;
      achievements?.forEach(ua => {
        const achievement = ACHIEVEMENTS.find(a => a.id === ua.achievement_id);
        if (achievement) totalXp += achievement.xp_reward;
      });

      // Calculer niveau
      const level = Math.floor(Math.sqrt(totalXp / 100)) + 1;

      return { level, totalXp, achievementsCount, gamesPlayed };
    } catch {
      return { level: 1, totalXp: 0, achievementsCount: 0, gamesPlayed: 0 };
    }
  }

  private async getUserBadges(userId: string): Promise<Badge[]> {
    // Les badges sont générés à partir des achievements de rareté epic/legendary
    try {
      const { data: achievements } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', userId)
        .not('unlocked_at', 'is', null);

      const badges: Badge[] = [];
      achievements?.forEach(ua => {
        const achievement = ACHIEVEMENTS.find(a => a.id === ua.achievement_id);
        if (achievement && (achievement.rarity === 'epic' || achievement.rarity === 'legendary')) {
          badges.push({
            id: achievement.id,
            name: achievement.name,
            icon: achievement.icon,
            description: achievement.description,
            rarity: achievement.rarity,
          });
        }
      });

      return badges;
    } catch {
      return [];
    }
  }

  private async getFavoriteGames(userId: string): Promise<string[]> {
    try {
      const { data: stats } = await supabase
        .from('user_stats')
        .select('games_played_by_game')
        .eq('user_id', userId)
        .single();

      if (!stats?.games_played_by_game) return [];

      // Trier par nombre de fois joué et prendre les 5 premiers
      const entries = Object.entries(stats.games_played_by_game as Record<string, number>);
      entries.sort((a, b) => b[1] - a[1]);
      return entries.slice(0, 5).map(([gameId]) => gameId);
    } catch {
      return [];
    }
  }

  // Mettre à jour son propre profil
  async updateProfile(updates: {
    username?: string;
    bio?: string;
    avatar_url?: string;
  }): Promise<{ success: boolean; error?: string }> {
    if (!this.userId) {
      return { success: false, error: 'Non connecté' };
    }

    try {
      // Vérifier unicité du username
      if (updates.username) {
        const { data: existing } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', updates.username.toLowerCase())
          .neq('id', this.userId)
          .single();

        if (existing) {
          return { success: false, error: 'Ce nom d\'utilisateur est déjà pris' };
        }
        updates.username = updates.username.toLowerCase();
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', this.userId);

      if (error) throw error;

      await this.loadOwnProfile();
      return { success: true };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, error: 'Erreur lors de la mise à jour' };
    }
  }

  // Obtenir son propre profil
  getOwnProfile(): PublicProfile | null {
    return this.currentProfile;
  }

  // Rechercher des profils
  async searchProfiles(query: string): Promise<PublicProfile[]> {
    if (!query || query.length < 2) return [];

    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, bio, created_at')
        .ilike('username', `%${query}%`)
        .limit(10);

      return (data || []).map(p => ({
        user_id: p.id,
        username: p.username,
        avatar_url: p.avatar_url,
        bio: p.bio,
        level: 1,
        total_xp: 0,
        achievements_count: 0,
        games_played: 0,
        favorite_games: [],
        badges: [],
        created_at: p.created_at,
      }));
    } catch {
      return [];
    }
  }

  // Uploader un avatar
  async uploadAvatar(file: File): Promise<{ success: boolean; url?: string; error?: string }> {
    if (!this.userId) {
      return { success: false, error: 'Non connecté' };
    }

    // Vérifier le type et la taille
    if (!file.type.startsWith('image/')) {
      return { success: false, error: 'Le fichier doit être une image' };
    }

    if (file.size > 2 * 1024 * 1024) {
      return { success: false, error: 'L\'image doit faire moins de 2Mo' };
    }

    try {
      const ext = file.name.split('.').pop();
      const fileName = `${this.userId}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Mettre à jour le profil
      await this.updateProfile({ avatar_url: publicUrl });

      return { success: true, url: publicUrl };
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return { success: false, error: 'Erreur lors de l\'upload' };
    }
  }
}

export const profileService = new ProfileService();
