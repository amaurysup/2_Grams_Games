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
  id: number;
  email: string;
  username: string;
  isPremium: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}
