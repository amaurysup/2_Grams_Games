import { supabase } from '../lib/supabase';
import type { Friendship, FriendProfile, FriendshipStatus } from '../types';
import { toast } from '../components/Toast';

class FriendsService {
  private userId: string | null = null;
  private friends: FriendProfile[] = [];
  private pendingRequests: Friendship[] = [];
  private listeners: Array<() => void> = [];

  setUser(userId: string | null): void {
    this.userId = userId;
    if (userId) {
      this.loadFriends();
      this.subscribeToChanges();
    } else {
      this.friends = [];
      this.pendingRequests = [];
    }
  }

  private async loadFriends(): Promise<void> {
    if (!this.userId) return;

    try {
      // Charger les amitiés acceptées
      const { data: friendships } = await supabase
        .from('friendships')
        .select('*')
        .or(`user_id.eq.${this.userId},friend_id.eq.${this.userId}`)
        .eq('status', 'accepted');

      if (friendships) {
        const friendIds = friendships.map(f => 
          f.user_id === this.userId ? f.friend_id : f.user_id
        );

        // Charger les profils des amis
        if (friendIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('*')
            .in('id', friendIds);

          this.friends = (profiles || []).map(p => ({
            user_id: p.id,
            username: p.username,
            avatar_url: p.avatar_url,
            level: p.level || 1,
            status: 'offline' as const,
            last_seen: p.last_seen,
          }));
        }
      }

      // Charger les demandes en attente
      const { data: pending } = await supabase
        .from('friendships')
        .select('*')
        .eq('friend_id', this.userId)
        .eq('status', 'pending');

      this.pendingRequests = (pending || []) as Friendship[];
      
      this.notifyListeners();
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  }

  private subscribeToChanges(): void {
    if (!this.userId) return;

    // S'abonner aux changements de friendships
    supabase
      .channel('friendships_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'friendships' },
        () => this.loadFriends()
      )
      .subscribe();
  }

  // Obtenir la liste des amis
  getFriends(): FriendProfile[] {
    return this.friends;
  }

  // Obtenir les demandes en attente
  getPendingRequests(): Friendship[] {
    return this.pendingRequests;
  }

  // Envoyer une demande d'ami
  async sendFriendRequest(friendUsername: string): Promise<{ success: boolean; error?: string }> {
    if (!this.userId) {
      return { success: false, error: 'Vous devez être connecté' };
    }

    try {
      // Trouver l'utilisateur par username
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, username')
        .eq('username', friendUsername.toLowerCase())
        .single();

      if (profileError || !profile) {
        return { success: false, error: 'Utilisateur non trouvé' };
      }

      if (profile.id === this.userId) {
        return { success: false, error: 'Vous ne pouvez pas vous ajouter vous-même' };
      }

      // Vérifier si une relation existe déjà
      const { data: existing } = await supabase
        .from('friendships')
        .select('*')
        .or(`and(user_id.eq.${this.userId},friend_id.eq.${profile.id}),and(user_id.eq.${profile.id},friend_id.eq.${this.userId})`)
        .single();

      if (existing) {
        if (existing.status === 'accepted') {
          return { success: false, error: 'Vous êtes déjà amis' };
        }
        if (existing.status === 'pending') {
          return { success: false, error: 'Une demande est déjà en attente' };
        }
        if (existing.status === 'blocked') {
          return { success: false, error: 'Impossible d\'ajouter cet utilisateur' };
        }
      }

      // Créer la demande
      const { error } = await supabase.from('friendships').insert({
        user_id: this.userId,
        friend_id: profile.id,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      toast.success(`Demande envoyée à ${profile.username}`);
      return { success: true };
    } catch (error) {
      console.error('Error sending friend request:', error);
      return { success: false, error: 'Erreur lors de l\'envoi de la demande' };
    }
  }

  // Accepter une demande d'ami
  async acceptRequest(friendshipId: string): Promise<{ success: boolean }> {
    if (!this.userId) return { success: false };

    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', friendshipId)
        .eq('friend_id', this.userId);

      if (error) throw error;

      toast.success('Demande acceptée !');
      await this.loadFriends();
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  }

  // Refuser une demande d'ami
  async rejectRequest(friendshipId: string): Promise<{ success: boolean }> {
    if (!this.userId) return { success: false };

    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId)
        .eq('friend_id', this.userId);

      if (error) throw error;

      toast.info('Demande refusée');
      await this.loadFriends();
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  }

  // Supprimer un ami
  async removeFriend(friendId: string): Promise<{ success: boolean }> {
    if (!this.userId) return { success: false };

    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .or(`and(user_id.eq.${this.userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${this.userId})`);

      if (error) throw error;

      toast.info('Ami supprimé');
      await this.loadFriends();
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  }

  // Bloquer un utilisateur
  async blockUser(userId: string): Promise<{ success: boolean }> {
    if (!this.userId) return { success: false };

    try {
      // Supprimer toute relation existante
      await supabase
        .from('friendships')
        .delete()
        .or(`and(user_id.eq.${this.userId},friend_id.eq.${userId}),and(user_id.eq.${userId},friend_id.eq.${this.userId})`);

      // Créer une relation bloquée
      await supabase.from('friendships').insert({
        user_id: this.userId,
        friend_id: userId,
        status: 'blocked',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      toast.info('Utilisateur bloqué');
      await this.loadFriends();
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  }

  // Vérifier le statut d'amitié avec un utilisateur
  async getFriendshipStatus(otherUserId: string): Promise<FriendshipStatus | null> {
    if (!this.userId) return null;

    try {
      const { data } = await supabase
        .from('friendships')
        .select('status')
        .or(`and(user_id.eq.${this.userId},friend_id.eq.${otherUserId}),and(user_id.eq.${otherUserId},friend_id.eq.${this.userId})`)
        .single();

      return data?.status as FriendshipStatus || null;
    } catch {
      return null;
    }
  }

  // Générer un code QR/lien d'ami
  generateFriendLink(): string {
    if (!this.userId) return '';
    const baseUrl = window.location.origin;
    return `${baseUrl}/#/add-friend/${this.userId}`;
  }

  // S'abonner aux changements
  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(l => l());
  }

  // Rechercher des utilisateurs
  async searchUsers(query: string): Promise<FriendProfile[]> {
    if (!query || query.length < 2) return [];

    try {
      // Rechercher dans la table profiles
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, level')
        .ilike('username', `%${query}%`)
        .neq('id', this.userId)
        .limit(10);

      if (error) {
        console.error('Erreur recherche profiles:', error.message);
        // Si la table profiles n'existe pas ou erreur, retourner un tableau vide
        return [];
      }

      if (!data || data.length === 0) {
        console.log('Aucun utilisateur trouvé pour:', query);
        return [];
      }

      return data.map(p => ({
        user_id: p.id,
        username: p.username || 'Utilisateur',
        avatar_url: p.avatar_url,
        level: p.level || 1,
        status: 'offline' as const,
      }));
    } catch (err) {
      console.error('Erreur recherche utilisateurs:', err);
      return [];
    }
  }
}

export const friendsService = new FriendsService();
