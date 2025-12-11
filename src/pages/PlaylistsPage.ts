import { playlistsService, PRESET_PLAYLISTS } from '../services/PlaylistsService';
import type { Playlist, PresetPlaylist } from '../types';
import { toast } from '../components/Toast';

export class PlaylistsPage {
  private container: HTMLElement;
  private userPlaylists: Playlist[] = [];
  private selectedPlaylist: Playlist | PresetPlaylist | null = null;
  private isCreating = false;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  async render(): Promise<void> {
    this.container.innerHTML = this.renderLoading();
    await this.loadPlaylists();
    this.container.innerHTML = this.renderContent();
    this.attachEventListeners();
  }

  private renderLoading(): string {
    return `
      <div class="playlists-page">
        <div class="playlists-loading">
          <div class="loading-spinner"></div>
          <p>Chargement des playlists...</p>
        </div>
      </div>
    `;
  }

  private async loadPlaylists(): Promise<void> {
    this.userPlaylists = playlistsService.getUserPlaylists();
  }

  private renderContent(): string {
    return `
      <div class="playlists-page">
        <header class="playlists-header">
          <h1>🎵 Playlists de Jeux</h1>
          <p class="playlists-subtitle">Organise tes soirées comme un pro</p>
        </header>

        <section class="playlists-section">
          <div class="section-header">
            <h2>📚 Playlists Officielles</h2>
          </div>
          <div class="playlists-grid preset">
            ${PRESET_PLAYLISTS.map(p => this.renderPresetCard(p)).join('')}
          </div>
        </section>

        <section class="playlists-section">
          <div class="section-header">
            <h2>✨ Mes Playlists</h2>
            <button class="btn-create-playlist" id="create-playlist-btn">
              + Créer
            </button>
          </div>
          
          ${this.isCreating ? this.renderCreateForm() : ''}
          
          <div class="playlists-grid user">
            ${this.userPlaylists.length > 0 
              ? this.userPlaylists.map(p => this.renderUserPlaylistCard(p)).join('')
              : '<p class="no-playlists">Tu n\'as pas encore de playlist. Crée ta première !</p>'
            }
          </div>
        </section>

        ${this.selectedPlaylist ? this.renderPlaylistModal() : ''}
      </div>
    `;
  }

  private renderPresetCard(playlist: PresetPlaylist): string {
    return `
      <div class="playlist-card preset" data-preset-id="${playlist.id}">
        <div class="playlist-icon">${playlist.emoji}</div>
        <div class="playlist-info">
          <h3>${playlist.name}</h3>
          <p>${playlist.description}</p>
        </div>
        <div class="playlist-meta">
          <span>Filtre intelligent</span>
        </div>
      </div>
    `;
  }

  private renderUserPlaylistCard(playlist: Playlist): string {
    return `
      <div class="playlist-card user" data-playlist-id="${playlist.id}">
        <div class="playlist-icon">${playlist.emoji || '📋'}</div>
        <div class="playlist-info">
          <h3>${playlist.name}</h3>
          <p>${playlist.description || 'Aucune description'}</p>
        </div>
        <div class="playlist-meta">
          <span>${playlist.games.length} jeux</span>
          ${playlist.is_public ? '<span class="public-badge">Public</span>' : ''}
        </div>
        <button class="playlist-delete" data-delete-id="${playlist.id}" title="Supprimer">
          🗑️
        </button>
      </div>
    `;
  }

  private renderCreateForm(): string {
    return `
      <div class="create-playlist-form">
        <input type="text" id="playlist-name" placeholder="Nom de la playlist" maxlength="50" />
        <input type="text" id="playlist-description" placeholder="Description (optionnel)" maxlength="200" />
        <input type="text" id="playlist-icon" placeholder="Emoji (ex: 🎉)" maxlength="2" />
        <div class="form-actions">
          <button class="btn-cancel" id="cancel-create">Annuler</button>
          <button class="btn-save" id="save-playlist">Créer</button>
        </div>
      </div>
    `;
  }

  private renderPlaylistModal(): string {
    const playlist = this.selectedPlaylist!;
    const isPreset = 'filter' in playlist;
    const gameIds = isPreset ? [] : (playlist as Playlist).games;
    
    return `
      <div class="playlist-modal-overlay" id="playlist-modal">
        <div class="playlist-modal">
          <button class="modal-close" id="close-modal">✕</button>
          
          <div class="modal-header">
            <span class="modal-icon">${playlist.emoji || '📋'}</span>
            <h2>${playlist.name}</h2>
            ${!isPreset && (playlist as Playlist).is_public ? '<span class="public-badge">Public</span>' : ''}
          </div>
          
          <p class="modal-description">${playlist.description || ''}</p>
          
          ${isPreset ? `
            <div class="preset-info">
              <p>🔮 Cette playlist utilise un filtre intelligent pour trouver les meilleurs jeux.</p>
            </div>
          ` : `
            <div class="modal-games">
              <h3>Jeux inclus (${gameIds.length})</h3>
              <div class="games-list">
                ${gameIds.map((id: string) => `
                  <div class="game-item" data-game-id="${id}">
                    <span class="game-name">Jeu #${id}</span>
                    <button class="view-game">Voir →</button>
                  </div>
                `).join('')}
              </div>
            </div>
          `}
          
          <div class="modal-actions">
            <button class="btn-play-all" id="play-playlist">
              🎮 ${isPreset ? 'Découvrir les jeux' : 'Lancer la playlist'}
            </button>
            ${!isPreset ? `
              <button class="btn-share" id="share-playlist">
                📤 Partager
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  private attachEventListeners(): void {
    // Create playlist button
    const createBtn = document.getElementById('create-playlist-btn');
    createBtn?.addEventListener('click', () => {
      this.isCreating = true;
      this.refresh();
    });

    // Cancel create
    const cancelBtn = document.getElementById('cancel-create');
    cancelBtn?.addEventListener('click', () => {
      this.isCreating = false;
      this.refresh();
    });

    // Save playlist
    const saveBtn = document.getElementById('save-playlist');
    saveBtn?.addEventListener('click', async () => {
      await this.createPlaylist();
    });

    // Preset cards
    this.container.querySelectorAll('.playlist-card.preset').forEach(card => {
      card.addEventListener('click', () => {
        const id = (card as HTMLElement).dataset.presetId;
        const preset = PRESET_PLAYLISTS.find(p => p.id === id);
        if (preset) {
          this.selectedPlaylist = preset;
          this.refresh();
        }
      });
    });

    // User playlist cards
    this.container.querySelectorAll('.playlist-card.user').forEach(card => {
      card.addEventListener('click', (e) => {
        // Don't open modal if clicking delete
        if ((e.target as HTMLElement).closest('.playlist-delete')) return;
        
        const id = (card as HTMLElement).dataset.playlistId;
        const playlist = this.userPlaylists.find(p => p.id === id);
        if (playlist) {
          this.selectedPlaylist = playlist;
          this.refresh();
        }
      });
    });

    // Delete buttons
    this.container.querySelectorAll('.playlist-delete').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = (btn as HTMLElement).dataset.deleteId;
        if (id && confirm('Supprimer cette playlist ?')) {
          const success = await playlistsService.deletePlaylist(id);
          if (success) {
            toast.success('Playlist supprimée');
            await this.loadPlaylists();
            this.refresh();
          }
        }
      });
    });

    // Modal close
    const closeModal = document.getElementById('close-modal');
    closeModal?.addEventListener('click', () => {
      this.selectedPlaylist = null;
      this.refresh();
    });

    // Modal overlay click
    const modalOverlay = document.getElementById('playlist-modal');
    modalOverlay?.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        this.selectedPlaylist = null;
        this.refresh();
      }
    });

    // Play playlist
    const playBtn = document.getElementById('play-playlist');
    playBtn?.addEventListener('click', () => {
      if (this.selectedPlaylist) {
        const isPreset = 'filter' in this.selectedPlaylist;
        if (isPreset) {
          // For preset, go to home with filter applied
          window.location.hash = '#/';
        } else {
          const firstGameId = (this.selectedPlaylist as Playlist).games[0];
          if (firstGameId) {
            window.location.hash = `#/game/${firstGameId}`;
          }
        }
      }
    });

    // Share playlist
    const shareBtn = document.getElementById('share-playlist');
    shareBtn?.addEventListener('click', () => {
      if (this.selectedPlaylist && 'id' in this.selectedPlaylist && !('filter' in this.selectedPlaylist)) {
        const url = `${window.location.origin}/#/playlist/${this.selectedPlaylist.id}`;
        navigator.clipboard.writeText(url);
        toast.success('Lien copié !');
      }
    });

    // View game buttons
    this.container.querySelectorAll('.view-game').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const gameId = (btn.closest('.game-item') as HTMLElement)?.dataset.gameId;
        if (gameId) {
          window.location.hash = `#/game/${gameId}`;
        }
      });
    });
  }

  private async createPlaylist(): Promise<void> {
    const nameInput = document.getElementById('playlist-name') as HTMLInputElement;
    const descInput = document.getElementById('playlist-description') as HTMLInputElement;
    const iconInput = document.getElementById('playlist-icon') as HTMLInputElement;

    const name = nameInput?.value.trim();
    if (!name) {
      toast.error('Le nom est requis');
      return;
    }

    const playlist = await playlistsService.createPlaylist(
      name,
      descInput?.value.trim() || '',
      iconInput?.value.trim() || '📋'
    );

    if (playlist) {
      toast.success('Playlist créée !');
      this.isCreating = false;
      await this.loadPlaylists();
      this.refresh();
    } else {
      toast.error('Erreur lors de la création');
    }
  }

  private refresh(): void {
    this.container.innerHTML = this.renderContent();
    this.attachEventListeners();
  }
}
