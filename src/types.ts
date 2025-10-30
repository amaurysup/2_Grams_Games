export interface Game {
  id: number;
  title: string;
  description: string;
  icon: string;
  color: 'pink' | 'yellow' | 'turquoise';
  rules: string[];
  players: string;
  duration: string;
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
