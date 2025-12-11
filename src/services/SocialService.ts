import { supabase } from '../lib/supabase';
import type { Profile, Friendship, FriendshipStatus } from '../types';

/**
 * SocialService - Gestion du système d'amis
 * 
 * Utilise les tables:
 * - profiles: informations publiques des utilisateurs
 * - friendships: relations d'amitié entre utilisateurs
 */
class SocialServiceClass {
  
  /**
   * Recherche des utilisateurs par username (fuzzy search)
   * @param query - Terme de recherche
   * @returns Liste des profils correspondants
   */
  async searchUsers(query: string): Promise<Profile[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    try {
      // Recherche par username avec ILIKE pour fuzzy matching
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, xp, level')
        .ilike('username', `%${query.trim()}%`)
        .neq('id', user.id) // Exclure l'utilisateur actuel
        .limit(10);

      if (error) {
        console.error('❌ Erreur recherche utilisateurs:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('❌ Erreur réseau recherche:', err);
      return [];
    }
  }

  /**
   * Envoie une demande d'ami
   * @param toUserId - ID de l'utilisateur cible
   */
  async sendFriendRequest(toUserId: string): Promise<{ success: boolean; error?: string }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Non authentifié' };
    }

    if (user.id === toUserId) {
      return { success: false, error: 'Vous ne pouvez pas vous ajouter vous-même' };
    }

    try {
      // Vérifier si une relation existe déjà
      const { data: existing } = await supabase
        .from('friendships')
        .select('id, status')
        .or(`and(requester_id.eq.${user.id},receiver_id.eq.${toUserId}),and(requester_id.eq.${toUserId},receiver_id.eq.${user.id})`)
        .single();

      if (existing) {
        if (existing.status === 'accepted') {
          return { success: false, error: 'Vous êtes déjà amis' };
        }
        if (existing.status === 'pending') {
          return { success: false, error: 'Une demande est déjà en cours' };
        }
        if (existing.status === 'blocked') {
          return { success: false, error: 'Cette action n\'est pas possible' };
        }
      }

      // Créer la demande d'ami
      const { error } = await supabase
        .from('friendships')
        .insert({
          requester_id: user.id,
          receiver_id: toUserId,
          status: 'pending'
        });

      if (error) {
        console.error('❌ Erreur envoi demande:', error);
        if (error.code === '23505') { // Duplicate key
          return { success: false, error: 'Une demande existe déjà' };
        }
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      console.error('❌ Erreur réseau:', err);
      return { success: false, error: 'Erreur réseau' };
    }
  }

  /**
   * Accepte une demande d'ami
   * @param requestId - ID de la demande (friendships.id)
   */
  async acceptFriendRequest(requestId: string): Promise<{ success: boolean; error?: string }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Non authentifié' };
    }

    try {
      // Vérifier que l'utilisateur est bien le receiver
      const { data: request, error: fetchError } = await supabase
        .from('friendships')
        .select('*')
        .eq('id', requestId)
        .eq('receiver_id', user.id)
        .eq('status', 'pending')
        .single();

      if (fetchError || !request) {
        return { success: false, error: 'Demande non trouvée ou déjà traitée' };
      }

      // Mettre à jour le statut
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (error) {
        console.error('❌ Erreur acceptation:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      console.error('❌ Erreur réseau:', err);
      return { success: false, error: 'Erreur réseau' };
    }
  }

  /**
   * Rejette une demande d'ami
   * @param requestId - ID de la demande
   */
  async rejectFriendRequest(requestId: string): Promise<{ success: boolean; error?: string }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Non authentifié' };
    }

    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', requestId)
        .eq('receiver_id', user.id);

      if (error) {
        console.error('❌ Erreur rejet:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: 'Erreur réseau' };
    }
  }

  /**
   * Supprime un ami
   * @param friendshipId - ID de la relation d'amitié
   */
  async removeFriend(friendshipId: string): Promise<{ success: boolean; error?: string }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Non authentifié' };
    }

    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId);

      if (error) {
        console.error('❌ Erreur suppression ami:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: 'Erreur réseau' };
    }
  }

  /**
   * Récupère la liste des amis (status = 'accepted')
   */
  async getFriends(): Promise<{ profile: Profile; friendshipId: string }[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    try {
      // Récupérer les amitiés acceptées où l'utilisateur est requester ou receiver
      const { data, error } = await supabase
        .from('friendships')
        .select(`
          id,
          requester_id,
          receiver_id,
          requester:profiles!friendships_requester_id_fkey(id, username, avatar_url, xp, level),
          receiver:profiles!friendships_receiver_id_fkey(id, username, avatar_url, xp, level)
        `)
        .eq('status', 'accepted')
        .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`);

      if (error) {
        console.error('❌ Erreur récupération amis:', error);
        return [];
      }

      // Extraire le profil de l'ami (l'autre personne)
      return (data || []).map(friendship => {
        const isRequester = friendship.requester_id === user.id;
        const friendProfile = isRequester ? friendship.receiver : friendship.requester;
        
        return {
          profile: friendProfile as unknown as Profile,
          friendshipId: friendship.id
        };
      }).filter(f => f.profile !== null);
    } catch (err) {
      console.error('❌ Erreur réseau:', err);
      return [];
    }
  }

  /**
   * Récupère les demandes d'ami en attente (reçues)
   */
  async getPendingRequests(): Promise<Friendship[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('friendships')
        .select(`
          id,
          requester_id,
          receiver_id,
          status,
          created_at,
          requester:profiles!friendships_requester_id_fkey(id, username, avatar_url, xp, level)
        `)
        .eq('receiver_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erreur récupération demandes:', error);
        return [];
      }

      return (data || []).map(d => ({
        id: d.id,
        requester_id: d.requester_id,
        receiver_id: d.receiver_id,
        status: d.status as FriendshipStatus,
        created_at: d.created_at,
        requester: d.requester as unknown as Profile
      }));
    } catch (err) {
      console.error('❌ Erreur réseau:', err);
      return [];
    }
  }

  /**
   * Récupère les demandes envoyées (en attente)
   */
  async getSentRequests(): Promise<Friendship[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('friendships')
        .select(`
          id,
          requester_id,
          receiver_id,
          status,
          created_at,
          receiver:profiles!friendships_receiver_id_fkey(id, username, avatar_url, xp, level)
        `)
        .eq('requester_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erreur récupération demandes envoyées:', error);
        return [];
      }

      return (data || []).map(d => ({
        id: d.id,
        requester_id: d.requester_id,
        receiver_id: d.receiver_id,
        status: d.status as FriendshipStatus,
        created_at: d.created_at,
        receiver: d.receiver as unknown as Profile
      }));
    } catch (err) {
      console.error('❌ Erreur réseau:', err);
      return [];
    }
  }

  /**
   * Vérifie le statut d'amitié avec un utilisateur
   */
  async getFriendshipStatus(userId: string): Promise<{ status: FriendshipStatus | null; friendshipId?: string; isRequester?: boolean }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { status: null };

    try {
      const { data } = await supabase
        .from('friendships')
        .select('id, status, requester_id')
        .or(`and(requester_id.eq.${user.id},receiver_id.eq.${userId}),and(requester_id.eq.${userId},receiver_id.eq.${user.id})`)
        .single();

      if (!data) return { status: null };

      return {
        status: data.status as FriendshipStatus,
        friendshipId: data.id,
        isRequester: data.requester_id === user.id
      };
    } catch {
      return { status: null };
    }
  }

  /**
   * Annule une demande d'ami envoyée
   */
  async cancelFriendRequest(requestId: string): Promise<{ success: boolean; error?: string }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Non authentifié' };
    }

    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', requestId)
        .eq('requester_id', user.id)
        .eq('status', 'pending');

      if (error) {
        console.error('❌ Erreur annulation:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: 'Erreur réseau' };
    }
  }

  /**
   * Compte le nombre de demandes en attente
   */
  async getPendingCount(): Promise<number> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    try {
      const { count, error } = await supabase
        .from('friendships')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .eq('status', 'pending');

      if (error) return 0;
      return count || 0;
    } catch {
      return 0;
    }
  }
}

// Export singleton instance
export const SocialService = new SocialServiceClass();
