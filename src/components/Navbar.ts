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
          <a href="#" data-route="/" class="logo-link">
            <img src="/icons/icon-192x192.png" alt="2GG" class="navbar-logo" />
            <h1 class="logo">2 GRAMS GAMES</h1>
          </a>
          <div class="nav-links">
            <a href="#" data-route="/" class="nav-link">Accueil</a>
            <a href="#" data-route="/games" class="nav-link">🎮 Jeux</a>
            ${isAuthenticated && user ? `
              <a href="#" data-route="/leaderboard" class="nav-link">🏆</a>
              <a href="#" data-route="/friends" class="nav-link">👥</a>
              <div class="nav-user-menu">
                <button class="nav-user-btn" id="userMenuBtn">
                  👤 ${user.username || user.email?.split('@')[0]}
                </button>
                <div class="nav-dropdown" id="userDropdown">
                  <a href="#" data-route="/profile" class="dropdown-item">📊 Mon profil</a>
                  <a href="#" data-route="/stats" class="dropdown-item">📈 Statistiques</a>
                  <a href="#" data-route="/playlists" class="dropdown-item">🎵 Playlists</a>
                  <a href="#" data-route="/settings" class="dropdown-item">⚙️ Paramètres</a>
                  <hr class="dropdown-divider" />
                  <button class="dropdown-item logout" id="logoutBtn">🚪 Déconnexion</button>
                </div>
              </div>
            ` : `
              <a href="#" data-route="/login" class="btn-login">Se connecter</a>
            `}
          </div>
        </div>
      </nav>
    `;

    // User menu toggle
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');
    
    if (userMenuBtn && userDropdown) {
      userMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        userDropdown.classList.toggle('open');
      });
      
      // Close dropdown when clicking outside
      document.addEventListener('click', () => {
        userDropdown.classList.remove('open');
      });
    }

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
