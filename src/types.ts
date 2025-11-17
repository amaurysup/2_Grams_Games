export interface Game {
  id: string;
  name: string;
  description: string;
  rules: string;
  created_at: string;
  découverte: boolean;
  réflexion: boolean;
  destruction: boolean;
  embrouilles: boolean;
  chill: boolean;
  interactif: boolean;
  exploration: boolean;
  image?: string;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  emoji: string;
  created_at: string;
  games?: Game[];
}

export interface User {
  id: string;
  email: string;
  username: string;
  isPremium: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}

export type AuthContextType = {
  authState: AuthState;
  signUp: (email: string, password: string, username: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}
