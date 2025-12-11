import { themeService, VISUAL_THEMES } from '../services/ThemeService';
import { authContext } from '../context/AuthContext';
import type { ThemePreference, ThemeColors } from '../types';
import { toast } from '../components/Toast';

export class SettingsPage {
  private container: HTMLElement;
  private currentTheme: ThemePreference;
  private isAuthenticated = false;

  constructor(container: HTMLElement) {
    this.container = container;
    this.currentTheme = themeService.getTheme();
  }

  async render(): Promise<void> {
    // Check auth state
    authContext.subscribe((state) => {
      this.isAuthenticated = state.isAuthenticated;
    });
    
    this.container.innerHTML = this.renderContent();
    this.attachEventListeners();
  }

  private renderContent(): string {
    const themes = Object.entries(VISUAL_THEMES) as [ThemePreference, ThemeColors][];
    
    return `
      <div class="settings-page">
        <header class="settings-header">
          <h1>⚙️ Paramètres</h1>
        </header>

        <section class="settings-section">
          <h2>🎨 Thème</h2>
          <p class="section-description">Personnalise l'apparence de l'application</p>
          
          <div class="themes-grid">
            ${themes.map(([id, theme]) => `
              <div class="theme-card ${this.currentTheme === id ? 'active' : ''}" data-theme="${id}">
                <div class="theme-preview" style="
                  background: linear-gradient(135deg, ${theme.primary}, ${theme.secondary});
                  color: ${theme.text};
                ">
                  <div class="preview-header" style="background: ${theme.surface}"></div>
                  <div class="preview-content">
                    <div class="preview-card" style="background: ${theme.surface}"></div>
                    <div class="preview-card" style="background: ${theme.surface}"></div>
                  </div>
                </div>
                <div class="theme-info">
                  <span class="theme-name">${theme.name}</span>
                </div>
                ${this.currentTheme === id ? '<span class="theme-check">✓</span>' : ''}
              </div>
            `).join('')}
          </div>
        </section>

        <section class="settings-section">
          <h2>🔔 Notifications</h2>
          <p class="section-description">Gère tes préférences de notification</p>
          
          <div class="settings-options">
            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-label">Défis quotidiens</span>
                <span class="setting-description">Rappel pour les défis du jour</span>
              </div>
              <label class="toggle">
                <input type="checkbox" id="notif-challenges" checked />
                <span class="toggle-slider"></span>
              </label>
            </div>
            
            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-label">Nouveaux succès</span>
                <span class="setting-description">Notification quand tu débloques un succès</span>
              </div>
              <label class="toggle">
                <input type="checkbox" id="notif-achievements" checked />
                <span class="toggle-slider"></span>
              </label>
            </div>
            
            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-label">Demandes d'amis</span>
                <span class="setting-description">Notification pour les nouvelles demandes</span>
              </div>
              <label class="toggle">
                <input type="checkbox" id="notif-friends" checked />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
        </section>

        <section class="settings-section">
          <h2>🔒 Confidentialité</h2>
          <p class="section-description">Contrôle qui peut voir ton profil</p>
          
          <div class="settings-options">
            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-label">Profil public</span>
                <span class="setting-description">Les autres peuvent voir ton profil</span>
              </div>
              <label class="toggle">
                <input type="checkbox" id="privacy-public" checked />
                <span class="toggle-slider"></span>
              </label>
            </div>
            
            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-label">Afficher les stats</span>
                <span class="setting-description">Tes statistiques sont visibles</span>
              </div>
              <label class="toggle">
                <input type="checkbox" id="privacy-stats" checked />
                <span class="toggle-slider"></span>
              </label>
            </div>
            
            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-label">Apparaître dans le classement</span>
                <span class="setting-description">Visible dans les classements publics</span>
              </div>
              <label class="toggle">
                <input type="checkbox" id="privacy-leaderboard" checked />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
        </section>

        <section class="settings-section">
          <h2>📱 Application</h2>
          <p class="section-description">Paramètres généraux</p>
          
          <div class="settings-options">
            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-label">Sons</span>
                <span class="setting-description">Effets sonores dans les jeux</span>
              </div>
              <label class="toggle">
                <input type="checkbox" id="app-sounds" checked />
                <span class="toggle-slider"></span>
              </label>
            </div>
            
            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-label">Vibrations</span>
                <span class="setting-description">Retour haptique</span>
              </div>
              <label class="toggle">
                <input type="checkbox" id="app-vibration" checked />
                <span class="toggle-slider"></span>
              </label>
            </div>
            
            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-label">Animations</span>
                <span class="setting-description">Animations et transitions</span>
              </div>
              <label class="toggle">
                <input type="checkbox" id="app-animations" checked />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
        </section>

        ${this.isAuthenticated ? `
          <section class="settings-section danger-zone">
            <h2>⚠️ Zone de danger</h2>
            
            <div class="danger-actions">
              <button class="btn-danger" id="clear-data">
                🗑️ Effacer mes données locales
              </button>
              <button class="btn-danger" id="delete-account">
                💀 Supprimer mon compte
              </button>
            </div>
          </section>
        ` : ''}

        <footer class="settings-footer">
          <p>2 Grams Games v1.0.0</p>
          <p>Made with 🍺 by the team</p>
        </footer>
      </div>
    `;
  }

  private attachEventListeners(): void {
    // Theme selection
    this.container.querySelectorAll('.theme-card').forEach(card => {
      card.addEventListener('click', () => {
        const themeId = (card as HTMLElement).dataset.theme as ThemePreference;
        if (themeId) {
          this.currentTheme = themeId;
          themeService.setTheme(themeId);
          const themeName = VISUAL_THEMES[themeId]?.name || themeId;
          toast.success(`Thème "${themeName}" appliqué !`);
          this.refresh();
        }
      });
    });

    // Toggle switches - save to localStorage
    this.container.querySelectorAll('.toggle input').forEach(toggle => {
      toggle.addEventListener('change', (e) => {
        const input = e.target as HTMLInputElement;
        const settingId = input.id;
        localStorage.setItem(`setting_${settingId}`, String(input.checked));
        toast.info('Paramètre sauvegardé');
      });
      
      // Load saved state
      const savedValue = localStorage.getItem(`setting_${(toggle as HTMLInputElement).id}`);
      if (savedValue !== null) {
        (toggle as HTMLInputElement).checked = savedValue === 'true';
      }
    });

    // Clear local data
    const clearDataBtn = document.getElementById('clear-data');
    clearDataBtn?.addEventListener('click', () => {
      if (confirm('Effacer toutes tes données locales ? (stats, préférences, etc.)')) {
        const keysToKeep = ['sb-localhost-auth-token', 'sb-auth-token'];
        const allKeys = Object.keys(localStorage);
        allKeys.forEach(key => {
          if (!keysToKeep.some(k => key.includes(k))) {
            localStorage.removeItem(key);
          }
        });
        toast.success('Données locales effacées');
        setTimeout(() => window.location.reload(), 1000);
      }
    });

    // Delete account
    const deleteAccountBtn = document.getElementById('delete-account');
    deleteAccountBtn?.addEventListener('click', () => {
      if (confirm('⚠️ Es-tu sûr de vouloir supprimer ton compte ? Cette action est irréversible !')) {
        if (confirm('Dernière chance ! Confirme la suppression de ton compte.')) {
          toast.info('Fonction non implémentée (protection des données)');
          // In real app: await supabase.auth.admin.deleteUser(user.id)
        }
      }
    });
  }

  private refresh(): void {
    this.container.innerHTML = this.renderContent();
    this.attachEventListeners();
  }
}
