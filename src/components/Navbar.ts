import { authContext } from '../context/AuthContext';

export class Navbar {
  private container: HTMLElement;
  private unsubscribe?: () => void;

  constructor(containerId: string) {
    const element = document.getElementById(containerId);
    if (!element) throw new Error(`Element with id ${containerId} not found`);
    
    this.container = element;
    
    // S'abonner aux changements d'authentification
    this.unsubscribe = authContext.subscribe((authState) => {
      if (!authState.loading) {
        this.render(authState.isAuthenticated, authState.user);
      }
    });
  }

  private render(isAuthenticated: boolean, user: any): void {

    this.container.innerHTML = `
      <nav class="navbar">
        <div class="nav-container">
          <h1 class="logo"><a href="#" data-route="/" style="color: inherit; text-decoration: none;">2 GRAMS GAMES</a></h1>
          <div class="nav-links">
            <a href="#" data-route="/" class="nav-link">Accueil</a>
            <a href="#" data-route="/games" class="nav-link">🎮 Jeux</a>
            ${isAuthenticated && user ? `
              <span class="nav-user">👤 ${user.email}</span>
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
      logoutBtn.addEventListener('click', async () => {
        await authContext.signOut();
        window.location.hash = '/';
      });
    }
  }

  destroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}
