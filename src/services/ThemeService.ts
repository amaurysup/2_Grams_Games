import type { ThemePreference, ThemeColors } from '../types';

// Définition des thèmes disponibles
export const VISUAL_THEMES: Record<ThemePreference, ThemeColors> = {
  dark: {
    id: 'dark',
    name: 'Sombre',
    primary: '#FF1493',
    secondary: '#FFD700',
    background: '#0F0F14',
    surface: '#171722',
    text: '#F5F7FA',
    textSecondary: '#A7B0C0',
    accent: '#00CED1',
  },
  light: {
    id: 'light',
    name: 'Clair',
    primary: '#FF1493',
    secondary: '#E6B800',
    background: '#F5F7FA',
    surface: '#FFFFFF',
    text: '#1A1A2E',
    textSecondary: '#6B7280',
    accent: '#00A8B5',
  },
  neon: {
    id: 'neon',
    name: 'Néon',
    primary: '#FF00FF',
    secondary: '#00FF00',
    background: '#0A0A0A',
    surface: '#1A1A1A',
    text: '#FFFFFF',
    textSecondary: '#888888',
    accent: '#00FFFF',
  },
  sunset: {
    id: 'sunset',
    name: 'Coucher de soleil',
    primary: '#FF6B6B',
    secondary: '#FFE66D',
    background: '#2D1B2E',
    surface: '#3D2B3E',
    text: '#FFF5E6',
    textSecondary: '#C9B8C9',
    accent: '#FF8E53',
  },
  ocean: {
    id: 'ocean',
    name: 'Océan',
    primary: '#00CED1',
    secondary: '#48D1CC',
    background: '#0C1929',
    surface: '#162D50',
    text: '#E0F7FA',
    textSecondary: '#80DEEA',
    accent: '#7C4DFF',
  },
  system: {
    id: 'system',
    name: 'Système',
    primary: '#FF1493',
    secondary: '#FFD700',
    background: '#0F0F14',
    surface: '#171722',
    text: '#F5F7FA',
    textSecondary: '#A7B0C0',
    accent: '#00CED1',
  },
};

const THEME_STORAGE_KEY = '2gg_theme_preference';

class ThemeService {
  private currentTheme: ThemePreference = 'dark';
  private listeners: Array<(theme: ThemePreference) => void> = [];

  constructor() {
    this.loadTheme();
    this.watchSystemTheme();
  }

  private loadTheme(): void {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemePreference | null;
    if (saved && VISUAL_THEMES[saved]) {
      this.currentTheme = saved;
    } else {
      this.currentTheme = 'dark';
    }
    this.applyTheme(this.currentTheme);
  }

  private watchSystemTheme(): void {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', (e) => {
        if (this.currentTheme === 'system') {
          this.applyTheme('system', e.matches);
        }
      });
    }
  }

  private getSystemPreference(): boolean {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true; // Default to dark
  }

  getTheme(): ThemePreference {
    return this.currentTheme;
  }

  getThemeColors(): ThemeColors {
    if (this.currentTheme === 'system') {
      return this.getSystemPreference() ? VISUAL_THEMES.dark : VISUAL_THEMES.light;
    }
    return VISUAL_THEMES[this.currentTheme];
  }

  setTheme(theme: ThemePreference): void {
    this.currentTheme = theme;
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    this.applyTheme(theme);
    this.notifyListeners();
  }

  private applyTheme(theme: ThemePreference, systemIsDark?: boolean): void {
    const colors = theme === 'system' 
      ? (systemIsDark ?? this.getSystemPreference() ? VISUAL_THEMES.dark : VISUAL_THEMES.light)
      : VISUAL_THEMES[theme];

    const root = document.documentElement;
    
    // Appliquer les variables CSS
    root.style.setProperty('--theme-primary', colors.primary);
    root.style.setProperty('--theme-secondary', colors.secondary);
    root.style.setProperty('--theme-background', colors.background);
    root.style.setProperty('--theme-surface', colors.surface);
    root.style.setProperty('--theme-text', colors.text);
    root.style.setProperty('--theme-text-secondary', colors.textSecondary);
    root.style.setProperty('--theme-accent', colors.accent);

    // Ajouter une classe pour identifier le thème actif
    root.setAttribute('data-theme', theme === 'system' 
      ? (this.getSystemPreference() ? 'dark' : 'light') 
      : theme);
  }

  subscribe(listener: (theme: ThemePreference) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.currentTheme));
  }

  getAllThemes(): ThemeColors[] {
    return Object.values(VISUAL_THEMES);
  }
}

export const themeService = new ThemeService();
