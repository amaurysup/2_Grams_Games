import { HomePage } from './pages/HomePage';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { GameDetailPage } from './pages/GameDetailPage';

export class Router {
  private appContainer: string;

  constructor(appContainerId: string) {
    this.appContainer = appContainerId;
    this.init();
  }

  private init(): void {
    window.addEventListener('hashchange', () => this.route());
    window.addEventListener('load', () => this.route());
    
    // Gérer les liens avec data-route
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const link = target.closest('[data-route]') as HTMLElement;
      
      if (link) {
        e.preventDefault();
        const route = link.dataset.route;
        if (route) {
          window.location.hash = route;
        }
      }
    });
  }

  private route(): void {
    const hash = window.location.hash.slice(1) || '/';
    
    // Gérer les erreurs d'authentification (ex: lien de confirmation expiré)
    if (hash.includes('error=')) {
      const urlParams = new URLSearchParams(hash.split('?')[1] || hash);
      const error = urlParams.get('error');
      const errorDescription = urlParams.get('error_description');
      
      if (error) {
        let message = 'Une erreur est survenue';
        if (error === 'access_denied' && errorDescription?.includes('expired')) {
          message = 'Le lien de confirmation a expiré. Veuillez vous reconnecter ou créer un nouveau compte.';
        }
        
        // Stocker le message d'erreur et rediriger vers login
        sessionStorage.setItem('authError', message);
        window.location.hash = '/login';
        return;
      }
    }

    const [path, ...params] = hash.split('/').filter(Boolean);

    // Nettoyer le conteneur
    const container = document.getElementById(this.appContainer);
    if (!container) return;
    container.innerHTML = '';

    switch (path) {
      case '':
      case 'home':
        new LandingPage(this.appContainer);
        break;
      
      case 'games':
        new HomePage(this.appContainer);
        break;
      
      case 'login':
        new LoginPage(this.appContainer);
        break;
      
      case 'register':
      case 'signup':
        new RegisterPage(this.appContainer);
        break;
      
      case 'game':
        const gameId = parseInt(params[0]);
        if (!isNaN(gameId)) {
          new GameDetailPage(this.appContainer, gameId);
        }
        break;
      
      default:
        new HomePage(this.appContainer);
    }

    // Scroll to top
    window.scrollTo(0, 0);
  }
}
