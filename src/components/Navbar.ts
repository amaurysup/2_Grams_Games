import { authContext } from '../context/AuthContext';
import { SocialService } from '../services/SocialService';

export class Navbar {
  private container: HTMLElement;
  private unsubscribe?: () => void;
  private pendingCount: number = 0;

  constructor(containerId: string) {
    const element = document.getElementById(containerId);
    if (!element) throw new Error(`Element with id ${containerId} not found`);
    
    this.container = element;
    
    // S'abonner aux changements d'authentification
    this.unsubscribe = authContext.subscribe((authState) => {
      if (!authState.loading) {
        // Récupérer le nombre de demandes en attente (async, ne bloque pas le render)
        if (authState.isAuthenticated) {
          this.loadPendingCount();
        }
        this.render(authState.isAuthenticated, authState.user);
      }
    });
  }

  private async loadPendingCount(): Promise<void> {
    try {
      this.pendingCount = await SocialService.getPendingCount();
      // Re-render si le count a changé (optionnel, on peut le skip pour éviter le flash)
    } catch {
      this.pendingCount = 0;
    }
  }

  private renderUserAvatar(user: any): string {
    if (user.avatar_url) {
      return `<img src="${user.avatar_url}" alt="${user.username}" class="nav-user-avatar" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
              <span class="nav-user-avatar-fallback" style="display:none;">👤</span>`;
    }
    return `<span class="nav-user-avatar-fallback">👤</span>`;
  }

  private render(isAuthenticated: boolean, user: any): void {
    const displayName = user?.username || user?.email?.split('@')[0] || 'User';
    const pendingBadge = this.pendingCount > 0 
      ? `<span class="nav-badge">${this.pendingCount > 9 ? '9+' : this.pendingCount}</span>` 
      : '';

    this.container.innerHTML = `
      <nav class="navbar">
        <div class="nav-container">
          <a href="#" data-route="/" class="logo-link">
            <img src="/icons/icon-192x192.png" alt="2GG" class="navbar-logo" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
            <span class="navbar-logo-fallback" style="display:none;">🎲</span>
            <h1 class="logo">2 GRAMS GAMES</h1>
          </a>
          <div class="nav-links">
            <a href="#" data-route="/" class="nav-link">Accueil</a>
            <a href="#" data-route="/games" class="nav-link">🎮 Jeux</a>
            ${isAuthenticated && user ? `
              <a href="#" data-route="/leaderboard" class="nav-link">🏆</a>
              <a href="#" data-route="/social" class="nav-link nav-link--with-badge">
                👥${pendingBadge}
              </a>
              <div class="nav-user-menu">
                <button class="nav-user-btn" id="userMenuBtn">
                  ${this.renderUserAvatar(user)}
                  <span class="nav-user-name">${displayName}</span>
                </button>
                <div class="nav-dropdown" id="userDropdown">
                  <div class="dropdown-header">
                    <div class="dropdown-user-info">
                      ${user.avatar_url 
                        ? `<img src="${user.avatar_url}" alt="${displayName}" class="dropdown-avatar" />` 
                        : `<span class="dropdown-avatar-fallback">👤</span>`}
                      <div>
                        <div class="dropdown-username">${displayName}</div>
                        <div class="dropdown-level">Niveau ${user.level || 1} • ${user.total_xp || 0} XP</div>
                      </div>
                    </div>
                  </div>
                  <hr class="dropdown-divider" />
                  <a href="#" data-route="/profile" class="dropdown-item">📊 Mon profil</a>
                  <a href="#" data-route="/stats" class="dropdown-item">📈 Statistiques</a>
                  <a href="#" data-route="/social" class="dropdown-item">
                    👥 Amis ${pendingBadge}
                  </a>
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
