import { HomePage } from './pages/HomePage';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { GameDetailPage } from './pages/GameDetailPage';
import { PartyModePage } from './pages/PartyModePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProfilePage } from './pages/ProfilePage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { PlaylistsPage } from './pages/PlaylistsPage';
import { FriendsPage } from './pages/FriendsPage';
import { SettingsPage } from './pages/SettingsPage';
import { StatsPage } from './pages/StatsPage';
import { SocialPage } from './pages/SocialPage';

// Parsed hash result interface
export interface ParsedHash {
  route: string;
  params: Record<string, string>;
  query: Record<string, string>;
}

/**
 * Parse the hash URL into route, params, and query string
 * Examples:
 *   #/game/12?foo=bar  → { route: 'game', params: { id: '12' }, query: { foo: 'bar' } }
 *   #/games?theme=chill → { route: 'games', params: {}, query: { theme: 'chill' } }
 *   #/ → { route: '', params: {}, query: {} }
 */
function parseHash(): ParsedHash {
  const hash = window.location.hash.slice(1) || '/';
  
  // Split hash and query string
  const [pathPart, queryPart] = hash.split('?');
  
  // Parse query string
  const query: Record<string, string> = {};
  if (queryPart) {
    const searchParams = new URLSearchParams(queryPart);
    searchParams.forEach((value, key) => {
      query[key] = value;
    });
  }
  
  // Parse route and path params
  const segments = pathPart.split('/').filter(Boolean);
  const route = segments[0] || '';
  
  // Extract params (segments after the route)
  const params: Record<string, string> = {};
  if (segments.length > 1) {
    // For routes like /game/:id
    params.id = segments[1];
    // Additional params if needed
    segments.slice(2).forEach((seg, index) => {
      params[`param${index}`] = seg;
    });
  }
  
  return { route, params, query };
}

export class Router {
  private appContainer: string;
  private boundHashChange: () => void;
  private boundClick: (e: Event) => void;
  private boundKeydown: (e: KeyboardEvent) => void;
  private initialized: boolean = false;

  constructor(appContainerId: string) {
    this.appContainer = appContainerId;
    
    // Bind handlers for proper cleanup
    this.boundHashChange = () => this.route();
    this.boundClick = (e: Event) => this.onClickDelegate(e);
    this.boundKeydown = (e: KeyboardEvent) => this.onKeydownDelegate(e);
    
    this.init();
  }

  private init(): void {
    // Prevent double listeners
    if (this.initialized) {
      this.cleanup();
    }
    
    window.addEventListener('hashchange', this.boundHashChange);
    window.addEventListener('load', this.boundHashChange);
    
    // Unified link interception for [data-route] links
    document.addEventListener('click', this.boundClick);
    document.addEventListener('keydown', this.boundKeydown);
    
    this.initialized = true;
    
    // Initial route on construction (if page already loaded)
    if (document.readyState === 'complete') {
      this.route();
    }
  }

  /**
   * Cleanup event listeners (prevents duplicates on HMR or re-init)
   */
  private cleanup(): void {
    window.removeEventListener('hashchange', this.boundHashChange);
    window.removeEventListener('load', this.boundHashChange);
    document.removeEventListener('click', this.boundClick);
    document.removeEventListener('keydown', this.boundKeydown);
  }

  /**
   * Unified click handler for [data-route] links
   * Works with nested elements inside links
   */
  private onClickDelegate(e: Event): void {
    const target = e.target as HTMLElement;
    const link = target.closest('[data-route]') as HTMLElement | null;
    
    if (!link) return;
    
    e.preventDefault();
    
    // Get route from data-route attribute or href
    const route = link.dataset.route || link.getAttribute('href')?.replace('#', '');
    
    if (route) {
      window.location.hash = route;
    }
  }

  /**
   * Handle keyboard navigation (Enter key on [data-route] elements)
   */
  private onKeydownDelegate(e: KeyboardEvent): void {
    if (e.key !== 'Enter') return;
    
    const target = e.target as HTMLElement;
    const link = target.closest('[data-route]') as HTMLElement | null;
    
    if (!link) return;
    
    e.preventDefault();
    
    const route = link.dataset.route || link.getAttribute('href')?.replace('#', '');
    
    if (route) {
      window.location.hash = route;
    }
  }

  /**
   * Get the current parsed hash (useful for pages to access query params)
   */
  static getParsedHash(): ParsedHash {
    return parseHash();
  }

  private route(): void {
    const parsed = parseHash();
    const { route, params, query } = parsed;
    
    console.log('🔍 Router - Parsed:', { route, params, query });
    
    // Handle authentication errors (e.g., expired confirmation link)
    // Check for error in query params
    if (query.error) {
      let message = 'Une erreur est survenue';
      if (query.error === 'access_denied' && query.error_description?.includes('expired')) {
        message = 'Le lien de confirmation a expiré. Veuillez vous reconnecter ou créer un nouveau compte.';
      }
      
      // Store error message and redirect to login
      sessionStorage.setItem('authError', message);
      window.location.hash = '/login';
      return;
    }

    // Clean the container
    const container = document.getElementById(this.appContainer);
    if (!container) return;
    container.innerHTML = '';

    // Route matching
    switch (route) {
      case '':
      case 'home':
        console.log('✅ Router - Chargement de LandingPage');
        this.showPartyFab(); // Réafficher le bouton party mode
        new LandingPage(this.appContainer);
        break;
      
      case 'games':
        console.log('✅ Router - Chargement de HomePage (jeux)', { query });
        this.showPartyFab(); // Réafficher le bouton party mode
        new HomePage(this.appContainer);
        break;
      
      case 'party':
        console.log('✅ Router - Chargement de PartyModePage');
        this.hidePartyFab(); // Cacher le bouton party mode
        new PartyModePage(this.appContainer);
        break;
      
      case 'login':
        new LoginPage(this.appContainer);
        break;
      
      case 'register':
      case 'signup':
        new RegisterPage(this.appContainer);
        break;
      
      case 'game':
        const gameId = params.id;
        if (gameId) {
          // Remove query string from gameId if present
          const cleanGameId = gameId.split('?')[0];
          new GameDetailPage(this.appContainer, cleanGameId);
        } else {
          // No game ID provided, show 404
          new NotFoundPage(this.appContainer);
        }
        break;
      
      case 'profile':
        const profileId = params.id;
        new ProfilePage(this.appContainer, profileId);
        break;

      case 'leaderboard':
        new LeaderboardPage(container).render();
        break;
      
      case 'playlists':
        new PlaylistsPage(container).render();
        break;
      
      case 'friends':
        new FriendsPage(container).render();
        break;
      
      case 'social':
        new SocialPage(this.appContainer);
        break;
      
      case 'settings':
        new SettingsPage(container).render();
        break;
      
      case 'stats':
        new StatsPage(container).render();
        break;
      
      default:
        // 404 fallback for unknown routes
        console.log('⚠️ Router - Route inconnue, affichage 404');
        new NotFoundPage(this.appContainer);
    }

    // Scroll to top after navigation (instant for SPA UX)
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }

  /**
   * Programmatic navigation
   */
  navigate(path: string): void {
    window.location.hash = path;
  }

  /**
   * Hide the party mode FAB button
   */
  private hidePartyFab(): void {
    const partyFab = document.getElementById('party-fab');
    if (partyFab) {
      partyFab.style.display = 'none';
    }
  }

  /**
   * Show the party mode FAB button
   */
  private showPartyFab(): void {
    const partyFab = document.getElementById('party-fab');
    if (partyFab) {
      partyFab.style.display = '';
    }
  }

  /**
   * Destroy router and cleanup listeners
   */
  destroy(): void {
    this.cleanup();
    this.initialized = false;
  }
}
