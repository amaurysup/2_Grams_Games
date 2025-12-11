import { supabase } from '../lib/supabase';
import type { User, AuthState, AuthContextType, Profile } from '../types';
import type { User as SupabaseUser } from '@supabase/supabase-js';

class AuthContext {
  private authState: AuthState = {
    isAuthenticated: false,
    user: null,
    loading: true
  };

  private listeners: Array<(state: AuthState) => void> = [];

  constructor() {
    this.initializeAuth();
  }

  private async initializeAuth() {
    // Récupérer la session actuelle
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      await this.setUserFromSupabase(session.user);
    } else {
      this.authState.loading = false;
      this.notify();
    }

    // Écouter les changements d'authentification
    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await this.setUserFromSupabase(session.user);
      } else {
        this.authState = {
          isAuthenticated: false,
          user: null,
          loading: false
        };
        this.notify();
      }
    });
  }

  /**
   * Récupère le profil depuis la table profiles
   */
  private async fetchProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, email, xp, level')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('⚠️ Profil non trouvé, utilisation des métadonnées auth');
        return null;
      }

      return data;
    } catch (err) {
      console.error('❌ Erreur récupération profil:', err);
      return null;
    }
  }

  private async setUserFromSupabase(supabaseUser: SupabaseUser) {
    // Récupérer le profil depuis la table profiles
    const profile = await this.fetchProfile(supabaseUser.id);

    const user: User = {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      // Priorité: profile.username > user_metadata.username > email prefix
      username: profile?.username || supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0] || 'User',
      isPremium: false,
      // Données du profil
      avatar_url: profile?.avatar_url || supabaseUser.user_metadata?.avatar_url,
      total_xp: profile?.xp || 0,
      level: profile?.level || 1
    };

    this.authState = {
      isAuthenticated: true,
      user: user,
      loading: false
    };
    
    this.notify();
  }

  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener);
    // Appeler immédiatement avec l'état actuel
    listener(this.authState);
    
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach(listener => listener(this.authState));
  }

  /**
   * Rafraîchit les données utilisateur depuis le profil
   * Utile après une mise à jour du profil (avatar, etc.)
   */
  async refreshUser(): Promise<void> {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await this.setUserFromSupabase(session.user);
    }
  }

  async signUp(email: string, password: string, username: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Vérifier si le username existe déjà
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username.toLowerCase())
        .single();
      
      if (existingProfile) {
        return { success: false, error: "Ce nom d'utilisateur est déjà pris" };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username
          }
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Créer le profil dans la table profiles
        await supabase.from('profiles').insert({
          id: data.user.id,
          email: email.toLowerCase(),
          username: username.toLowerCase()
        });
        
        return { success: true };
      }

      return { success: false, error: 'Une erreur est survenue lors de l\'inscription' };
    } catch (err) {
      return { success: false, error: 'Erreur réseau. Vérifiez votre connexion.' };
    }
  }

  async signIn(identifier: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      let email = identifier;
      
      // Si ce n'est pas un email (pas de @), essayer de trouver l'email par username
      if (!identifier.includes('@')) {
        // Chercher dans la table profiles si elle existe, sinon utiliser l'identifiant comme email
        const { data: profiles } = await supabase
          .from('profiles')
          .select('email')
          .eq('username', identifier.toLowerCase())
          .single();
        
        if (profiles?.email) {
          email = profiles.email;
        } else {
          // Si pas de table profiles ou pas trouvé, essayer quand même (peut-être que l'utilisateur a mis son email sans @)
          return { success: false, error: "Nom d'utilisateur non trouvé. Essayez avec votre email." };
        }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        return { success: true };
      }

      return { success: false, error: 'Une erreur est survenue lors de la connexion' };
    } catch (err) {
      return { success: false, error: 'Erreur réseau. Vérifiez votre connexion.' };
    }
  }

  async signOut(): Promise<void> {
    await supabase.auth.signOut();
  }

  getAuthState(): AuthState {
    return { ...this.authState };
  }
}

// Instance singleton
export const authContext = new AuthContext();

// Hook-like function pour utiliser dans les composants
export function useAuth(): AuthContextType {
  return {
    authState: authContext.getAuthState(),
    signUp: authContext.signUp.bind(authContext),
    signIn: authContext.signIn.bind(authContext),
    signOut: authContext.signOut.bind(authContext)
  };
}
