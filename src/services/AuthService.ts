import type { User, AuthState } from '../types';

export class AuthService {
  private authState: AuthState = {
    isAuthenticated: false,
    user: null
  };

  private listeners: Array<(state: AuthState) => void> = [];

  constructor() {
    // Charger l'état d'authentification depuis le localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      this.authState = {
        isAuthenticated: true,
        user: JSON.parse(savedUser)
      };
    }
  }

  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach(listener => listener(this.authState));
  }

  login(email: string, password: string): boolean {
    // Simulation de connexion (à remplacer par un vrai appel API)
    if (email && password) {
      const user: User = {
        id: 1,
        email: email,
        username: email.split('@')[0],
        isPremium: false
      };
      
      this.authState = {
        isAuthenticated: true,
        user: user
      };
      
      localStorage.setItem('user', JSON.stringify(user));
      this.notify();
      return true;
    }
    return false;
  }

  register(email: string, username: string, password: string): boolean {
    // Simulation d'inscription (à remplacer par un vrai appel API)
    if (email && username && password) {
      const user: User = {
        id: Date.now(),
        email: email,
        username: username,
        isPremium: false
      };
      
      this.authState = {
        isAuthenticated: true,
        user: user
      };
      
      localStorage.setItem('user', JSON.stringify(user));
      this.notify();
      return true;
    }
    return false;
  }

  logout(): void {
    this.authState = {
      isAuthenticated: false,
      user: null
    };
    localStorage.removeItem('user');
    this.notify();
  }

  getAuthState(): AuthState {
    return { ...this.authState };
  }

  isAuthenticated(): boolean {
    return this.authState.isAuthenticated;
  }

  getCurrentUser(): User | null {
    return this.authState.user;
  }
}
