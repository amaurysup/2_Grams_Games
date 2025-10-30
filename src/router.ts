import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { GameDetailPage } from './pages/GameDetailPage';
import { AuthService } from './services/AuthService';

export class Router {
  private authService: AuthService;
  private appContainer: string;

  constructor(appContainerId: string, authService: AuthService) {
    this.appContainer = appContainerId;
    this.authService = authService;
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
    const [path, ...params] = hash.split('/').filter(Boolean);

    // Nettoyer le conteneur
    const container = document.getElementById(this.appContainer);
    if (!container) return;
    container.innerHTML = '';

    switch (path) {
      case '':
      case 'home':
        new HomePage(this.appContainer);
        break;
      
      case 'login':
        new LoginPage(this.appContainer, this.authService);
        break;
      
      case 'register':
        new RegisterPage(this.appContainer, this.authService);
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
