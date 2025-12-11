import { supabase } from '../lib/supabase';
import type { GameReview } from '../types';
import { toast } from '../components/Toast';

const REVIEWS_CACHE_KEY = '2gg_reviews_cache';

class ReviewsService {
  private userId: string | null = null;
  private username: string = '';
  private cache: Map<string, GameReview[]> = new Map();

  setUser(userId: string | null, username: string = ''): void {
    this.userId = userId;
    this.username = username;
  }

  // Obtenir les avis d'un jeu
  async getGameReviews(gameId: string, forceRefresh: boolean = false): Promise<GameReview[]> {
    // Vérifier le cache
    if (!forceRefresh && this.cache.has(gameId)) {
      return this.cache.get(gameId)!;
    }

    try {
      const { data, error } = await supabase
        .from('game_reviews')
        .select('*')
        .eq('game_id', gameId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const reviews = (data || []) as GameReview[];
      
      // Marquer si l'utilisateur actuel a liké
      if (this.userId) {
        const { data: likes } = await supabase
          .from('review_likes')
          .select('review_id')
          .eq('user_id', this.userId);
        
        const likedIds = new Set((likes || []).map(l => l.review_id));
        reviews.forEach(r => {
          r.user_liked = likedIds.has(r.id);
        });
      }

      this.cache.set(gameId, reviews);
      return reviews;
    } catch (error) {
      console.error('Error fetching reviews:', error);
      
      // Fallback sur localStorage
      const cached = localStorage.getItem(`${REVIEWS_CACHE_KEY}_${gameId}`);
      return cached ? JSON.parse(cached) : [];
    }
  }

  // Obtenir la note moyenne d'un jeu
  async getAverageRating(gameId: string): Promise<{ average: number; count: number }> {
    const reviews = await this.getGameReviews(gameId);
    if (reviews.length === 0) return { average: 0, count: 0 };
    
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return {
      average: Math.round((sum / reviews.length) * 10) / 10,
      count: reviews.length,
    };
  }

  // Ajouter un avis
  async addReview(
    gameId: string, 
    rating: number, 
    comment: string
  ): Promise<{ success: boolean; error?: string; review?: GameReview }> {
    if (!this.userId) {
      return { success: false, error: 'Vous devez être connecté pour laisser un avis' };
    }

    if (rating < 1 || rating > 5) {
      return { success: false, error: 'La note doit être entre 1 et 5' };
    }

    if (comment.length < 10) {
      return { success: false, error: 'Le commentaire doit faire au moins 10 caractères' };
    }

    // Vérifier si l'utilisateur a déjà laissé un avis
    const existing = await this.getUserReview(gameId);
    if (existing) {
      return { success: false, error: 'Vous avez déjà laissé un avis pour ce jeu' };
    }

    const review: Partial<GameReview> = {
      game_id: gameId,
      user_id: this.userId,
      username: this.username,
      rating,
      comment,
      likes_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await supabase
        .from('game_reviews')
        .insert(review)
        .select()
        .single();

      if (error) throw error;

      // Invalider le cache
      this.cache.delete(gameId);
      
      toast.success('Avis publié avec succès !');
      return { success: true, review: data as GameReview };
    } catch (error) {
      console.error('Error adding review:', error);
      return { success: false, error: 'Erreur lors de la publication de l\'avis' };
    }
  }

  // Obtenir l'avis de l'utilisateur actuel pour un jeu
  async getUserReview(gameId: string): Promise<GameReview | null> {
    if (!this.userId) return null;

    try {
      const { data, error } = await supabase
        .from('game_reviews')
        .select('*')
        .eq('game_id', gameId)
        .eq('user_id', this.userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as GameReview | null;
    } catch (error) {
      return null;
    }
  }

  // Modifier un avis
  async updateReview(
    reviewId: string, 
    rating: number, 
    comment: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.userId) {
      return { success: false, error: 'Vous devez être connecté' };
    }

    try {
      const { error } = await supabase
        .from('game_reviews')
        .update({ rating, comment, updated_at: new Date().toISOString() })
        .eq('id', reviewId)
        .eq('user_id', this.userId);

      if (error) throw error;

      // Invalider tout le cache
      this.cache.clear();
      
      toast.success('Avis modifié avec succès !');
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Erreur lors de la modification' };
    }
  }

  // Supprimer un avis
  async deleteReview(reviewId: string, gameId: string): Promise<{ success: boolean; error?: string }> {
    if (!this.userId) {
      return { success: false, error: 'Vous devez être connecté' };
    }

    try {
      const { error } = await supabase
        .from('game_reviews')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', this.userId);

      if (error) throw error;

      this.cache.delete(gameId);
      toast.success('Avis supprimé');
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Erreur lors de la suppression' };
    }
  }

  // Liker/unliker un avis
  async toggleLike(reviewId: string, gameId: string): Promise<{ success: boolean; liked: boolean }> {
    if (!this.userId) {
      toast.error('Connectez-vous pour liker');
      return { success: false, liked: false };
    }

    try {
      // Vérifier si déjà liké
      const { data: existing } = await supabase
        .from('review_likes')
        .select('*')
        .eq('review_id', reviewId)
        .eq('user_id', this.userId)
        .single();

      if (existing) {
        // Unlike
        await supabase
          .from('review_likes')
          .delete()
          .eq('review_id', reviewId)
          .eq('user_id', this.userId);

        await supabase.rpc('decrement_review_likes', { review_id: reviewId });
        
        this.cache.delete(gameId);
        return { success: true, liked: false };
      } else {
        // Like
        await supabase
          .from('review_likes')
          .insert({ review_id: reviewId, user_id: this.userId });

        await supabase.rpc('increment_review_likes', { review_id: reviewId });
        
        this.cache.delete(gameId);
        return { success: true, liked: true };
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      return { success: false, liked: false };
    }
  }

  // Signaler un avis
  async reportReview(reviewId: string, reason: string): Promise<{ success: boolean }> {
    if (!this.userId) {
      toast.error('Connectez-vous pour signaler');
      return { success: false };
    }

    try {
      await supabase.from('review_reports').insert({
        review_id: reviewId,
        user_id: this.userId,
        reason,
        created_at: new Date().toISOString(),
      });

      toast.success('Signalement envoyé, merci !');
      return { success: true };
    } catch (error) {
      toast.error('Erreur lors du signalement');
      return { success: false };
    }
  }
}

export const reviewsService = new ReviewsService();
