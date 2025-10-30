import { AuthService } from '../services/AuthService';

export class Navbar {
  private container: HTMLElement;
  private authService: AuthService;

  constructor(containerId: string, authService: AuthService) {
    const element = document.getElementById(containerId);
    if (!element) throw new Error(`Element with id ${containerId} not found`);
    
    this.container = element;
    this.authService = authService;
    this.render();
    
    // S'abonner aux changements d'authentification
    this.authService.subscribe(() => this.render());
  }

  private render(): void {
    const isAuthenticated = this.authService.isAuthenticated();
    const user = this.authService.getCurrentUser();

    this.container.innerHTML = `
      <nav class="navbar">
        <div class="nav-container">
          <h1 class="logo">2 GRAMS GAMES</h1>
          <div class="nav-links">
            <a href="#" data-route="/" class="nav-link">Accueil</a>
            <a href="#" data-route="/games" class="nav-link">Jeux</a>
            <a href="#" data-route="/about" class="nav-link">À propos</a>
            ${isAuthenticated && user ? `
              <span class="nav-user">👤 ${user.username}</span>
              <button class="btn-logout" id="logoutBtn">Déconnexion</button>
            ` : `
              <a href="#" data-route="/login" class="btn-login">Se connecter</a>
            `}
          </div>
        </div>
      </nav>
    `;

    // Ajouter l'événement de déconnexion
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        this.authService.logout();
        window.location.hash = '/';
      });
    }
  }
}
