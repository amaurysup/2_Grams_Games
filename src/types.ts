export interface Game {
  id: string;
  theme_id: string;
  name: string;
  description: string;
  rules: string;
  created_at: string;
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
