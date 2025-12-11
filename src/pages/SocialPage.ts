import { SocialService } from '../services/SocialService';
import type { Profile, Friendship } from '../types';
import { toast } from '../components/Toast';
import { supabase } from '../lib/supabase';

type TabType = 'friends' | 'add' | 'requests';

export class SocialPage {
  private container: HTMLElement;
  private activeTab: TabType = 'friends';
  private friends: { profile: Profile; friendshipId: string }[] = [];
  private pendingRequests: Friendship[] = [];
  private sentRequests: Friendship[] = [];
  private searchResults: Profile[] = [];
  private searchQuery: string = '';
  private isSearching: boolean = false;

  constructor(containerId: string) {
    const element = document.getElementById(containerId);
    if (!element) throw new Error(`Element with id ${containerId} not found`);
    
    this.container = element;
    void this.init();
  }

  private async init(): Promise<void> {
    // Vérifier l'authentification
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.hash = '/login';
      return;
    }

    this.renderLoading();
    await this.loadData();
    this.render();
  }

  private async loadData(): Promise<void> {
    try {
      const [friends, pending, sent] = await Promise.all([
        SocialService.getFriends(),
        SocialService.getPendingRequests(),
        SocialService.getSentRequests()
      ]);

      this.friends = friends;
      this.pendingRequests = pending;
      this.sentRequests = sent;
    } catch (err) {
      console.error('❌ Erreur chargement données sociales:', err);
      toast.error('Erreur lors du chargement');
    }
  }

  private renderLoading(): void {
    this.container.innerHTML = `
      <div class="social-page">
        <div class="social-loading">
          <div class="spinner">👥</div>
          <p>Chargement...</p>
        </div>
      </div>
    `;
  }

  private render(): void {
    const pendingCount = this.pendingRequests.length;

    this.container.innerHTML = `
      <div class="social-page">
        <header class="social-header">
          <h1 class="social-title">👥 Social</h1>
          <p class="social-subtitle">Gérez vos amis et vos demandes</p>
        </header>

        <nav class="social-tabs">
          <button class="social-tab ${this.activeTab === 'friends' ? 'social-tab--active' : ''}" data-tab="friends">
            🎮 Mes amis <span class="tab-count">${this.friends.length}</span>
          </button>
          <button class="social-tab ${this.activeTab === 'add' ? 'social-tab--active' : ''}" data-tab="add">
            ➕ Ajouter
          </button>
          <button class="social-tab ${this.activeTab === 'requests' ? 'social-tab--active' : ''}" data-tab="requests">
            📩 Demandes ${pendingCount > 0 ? `<span class="tab-badge">${pendingCount}</span>` : ''}
          </button>
        </nav>

        <div class="social-content">
          ${this.renderTabContent()}
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  private renderTabContent(): string {
    switch (this.activeTab) {
      case 'friends':
        return this.renderFriendsTab();
      case 'add':
        return this.renderAddTab();
      case 'requests':
        return this.renderRequestsTab();
      default:
        return '';
    }
  }

  private renderFriendsTab(): string {
    if (this.friends.length === 0) {
      return `
        <div class="social-empty">
          <div class="social-empty__icon">😢</div>
          <h3>Pas encore d'amis</h3>
          <p>Commencez à ajouter des amis pour jouer ensemble !</p>
          <button class="btn btn-primary" id="goToAddBtn">➕ Ajouter des amis</button>
        </div>
      `;
    }

    return `
      <div class="friends-list">
        ${this.friends.map(({ profile, friendshipId }) => `
          <div class="friend-card" data-friend-id="${profile.id}">
            <div class="friend-avatar">
              ${profile.avatar_url 
                ? `<img src="${profile.avatar_url}" alt="${profile.username}" class="friend-avatar__img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                   <span class="friend-avatar__fallback" style="display:none;">👤</span>`
                : `<span class="friend-avatar__fallback">👤</span>`}
            </div>
            <div class="friend-info">
              <div class="friend-name">${profile.username}</div>
              <div class="friend-level">Niveau ${profile.level || 1} • ${profile.xp || 0} XP</div>
            </div>
            <div class="friend-actions">
              <button class="btn btn-small btn-danger" data-remove-friend="${friendshipId}" title="Supprimer">
                ✕
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  private renderAddTab(): string {
    return `
      <div class="add-friend-section">
        <div class="search-container">
          <div class="search-bar search-bar--large">
            <span class="search-icon">🔍</span>
            <input 
              type="text" 
              id="userSearch" 
              class="search-input" 
              placeholder="Rechercher par nom d'utilisateur..."
              value="${this.searchQuery}"
              autocomplete="off"
            />
            ${this.searchQuery ? `<button class="search-clear" id="clearSearch">✕</button>` : ''}
          </div>
        </div>

        <div class="search-results">
          ${this.renderSearchResults()}
        </div>

        ${this.sentRequests.length > 0 ? `
          <div class="sent-requests">
            <h3 class="sent-requests__title">📤 Demandes envoyées</h3>
            ${this.sentRequests.map(request => `
              <div class="request-card request-card--sent">
                <div class="request-avatar">
                  ${request.receiver?.avatar_url 
                    ? `<img src="${request.receiver.avatar_url}" alt="${request.receiver.username}" class="request-avatar__img" />`
                    : `<span class="request-avatar__fallback">👤</span>`}
                </div>
                <div class="request-info">
                  <div class="request-name">${request.receiver?.username || 'Utilisateur'}</div>
                  <div class="request-status">En attente...</div>
                </div>
                <button class="btn btn-small btn-secondary" data-cancel-request="${request.id}">
                  Annuler
                </button>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }

  private renderSearchResults(): string {
    if (this.isSearching) {
      return `
        <div class="search-loading">
          <div class="spinner-small">🔄</div>
          <span>Recherche...</span>
        </div>
      `;
    }

    if (!this.searchQuery) {
      return `
        <div class="search-hint">
          <span class="search-hint__icon">💡</span>
          <span>Entrez au moins 2 caractères pour rechercher</span>
        </div>
      `;
    }

    if (this.searchResults.length === 0) {
      return `
        <div class="search-empty">
          <span class="search-empty__icon">🔍</span>
          <span>Aucun utilisateur trouvé pour "${this.searchQuery}"</span>
        </div>
      `;
    }

    return `
      <div class="users-list">
        ${this.searchResults.map(profile => {
          // Vérifier si déjà ami ou demande en cours
          const isFriend = this.friends.some(f => f.profile.id === profile.id);
          const hasSentRequest = this.sentRequests.some(r => r.receiver_id === profile.id);
          const hasPendingRequest = this.pendingRequests.some(r => r.requester_id === profile.id);

          let actionButton = '';
          if (isFriend) {
            actionButton = `<span class="status-badge status-badge--friend">✓ Ami</span>`;
          } else if (hasSentRequest) {
            actionButton = `<span class="status-badge status-badge--pending">⏳ En attente</span>`;
          } else if (hasPendingRequest) {
            actionButton = `<button class="btn btn-small btn-primary" data-accept-from-search="${profile.id}">Accepter</button>`;
          } else {
            actionButton = `<button class="btn btn-small btn-primary" data-add-friend="${profile.id}">➕ Ajouter</button>`;
          }

          return `
            <div class="user-card">
              <div class="user-avatar">
                ${profile.avatar_url 
                  ? `<img src="${profile.avatar_url}" alt="${profile.username}" class="user-avatar__img" />`
                  : `<span class="user-avatar__fallback">👤</span>`}
              </div>
              <div class="user-info">
                <div class="user-name">${profile.username}</div>
                <div class="user-level">Niveau ${profile.level || 1}</div>
              </div>
              <div class="user-actions">
                ${actionButton}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  private renderRequestsTab(): string {
    if (this.pendingRequests.length === 0) {
      return `
        <div class="social-empty">
          <div class="social-empty__icon">📭</div>
          <h3>Aucune demande</h3>
          <p>Vous n'avez pas de demandes d'ami en attente.</p>
        </div>
      `;
    }

    return `
      <div class="requests-list">
        ${this.pendingRequests.map(request => `
          <div class="request-card">
            <div class="request-avatar">
              ${request.requester?.avatar_url 
                ? `<img src="${request.requester.avatar_url}" alt="${request.requester.username}" class="request-avatar__img" />`
                : `<span class="request-avatar__fallback">👤</span>`}
            </div>
            <div class="request-info">
              <div class="request-name">${request.requester?.username || 'Utilisateur'}</div>
              <div class="request-time">${this.formatDate(request.created_at)}</div>
            </div>
            <div class="request-actions">
              <button class="btn btn-small btn-primary" data-accept-request="${request.id}">
                ✓ Accepter
              </button>
              <button class="btn btn-small btn-secondary" data-reject-request="${request.id}">
                ✕
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  private formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Aujourd'hui";
    if (days === 1) return 'Hier';
    if (days < 7) return `Il y a ${days} jours`;
    return date.toLocaleDateString('fr-FR');
  }

  private attachEventListeners(): void {
    // Tabs
    const tabs = this.container.querySelectorAll<HTMLButtonElement>('.social-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        this.activeTab = tab.dataset.tab as TabType;
        this.render();
      });
    });

    // Go to add tab button
    const goToAddBtn = this.container.querySelector('#goToAddBtn');
    goToAddBtn?.addEventListener('click', () => {
      this.activeTab = 'add';
      this.render();
    });

    // Search input
    const searchInput = this.container.querySelector<HTMLInputElement>('#userSearch');
    let searchTimeout: number;
    searchInput?.addEventListener('input', (e) => {
      const query = (e.target as HTMLInputElement).value;
      this.searchQuery = query;
      
      clearTimeout(searchTimeout);
      
      if (query.trim().length >= 2) {
        this.isSearching = true;
        this.updateSearchResults();
        
        searchTimeout = window.setTimeout(async () => {
          this.searchResults = await SocialService.searchUsers(query);
          this.isSearching = false;
          this.updateSearchResults();
        }, 300);
      } else {
        this.searchResults = [];
        this.isSearching = false;
        this.updateSearchResults();
      }
    });

    // Clear search
    const clearSearch = this.container.querySelector('#clearSearch');
    clearSearch?.addEventListener('click', () => {
      this.searchQuery = '';
      this.searchResults = [];
      this.render();
    });

    // Add friend buttons
    const addBtns = this.container.querySelectorAll<HTMLButtonElement>('[data-add-friend]');
    addBtns.forEach(btn => {
      btn.addEventListener('click', async () => {
        const userId = btn.dataset.addFriend;
        if (!userId) return;

        btn.disabled = true;
        btn.textContent = '...';

        const result = await SocialService.sendFriendRequest(userId);
        if (result.success) {
          toast.success('Demande envoyée !');
          await this.loadData();
          this.render();
        } else {
          toast.error(result.error || 'Erreur');
          btn.disabled = false;
          btn.textContent = '➕ Ajouter';
        }
      });
    });

    // Accept request buttons
    const acceptBtns = this.container.querySelectorAll<HTMLButtonElement>('[data-accept-request]');
    acceptBtns.forEach(btn => {
      btn.addEventListener('click', async () => {
        const requestId = btn.dataset.acceptRequest;
        if (!requestId) return;

        btn.disabled = true;
        const result = await SocialService.acceptFriendRequest(requestId);
        if (result.success) {
          toast.success('Ami ajouté !');
          await this.loadData();
          this.render();
        } else {
          toast.error(result.error || 'Erreur');
          btn.disabled = false;
        }
      });
    });

    // Reject request buttons
    const rejectBtns = this.container.querySelectorAll<HTMLButtonElement>('[data-reject-request]');
    rejectBtns.forEach(btn => {
      btn.addEventListener('click', async () => {
        const requestId = btn.dataset.rejectRequest;
        if (!requestId) return;

        btn.disabled = true;
        const result = await SocialService.rejectFriendRequest(requestId);
        if (result.success) {
          toast.info('Demande refusée');
          await this.loadData();
          this.render();
        } else {
          toast.error(result.error || 'Erreur');
          btn.disabled = false;
        }
      });
    });

    // Cancel sent request buttons
    const cancelBtns = this.container.querySelectorAll<HTMLButtonElement>('[data-cancel-request]');
    cancelBtns.forEach(btn => {
      btn.addEventListener('click', async () => {
        const requestId = btn.dataset.cancelRequest;
        if (!requestId) return;

        btn.disabled = true;
        const result = await SocialService.cancelFriendRequest(requestId);
        if (result.success) {
          toast.info('Demande annulée');
          await this.loadData();
          this.render();
        } else {
          toast.error(result.error || 'Erreur');
          btn.disabled = false;
        }
      });
    });

    // Remove friend buttons
    const removeBtns = this.container.querySelectorAll<HTMLButtonElement>('[data-remove-friend]');
    removeBtns.forEach(btn => {
      btn.addEventListener('click', async () => {
        const friendshipId = btn.dataset.removeFriend;
        if (!friendshipId) return;

        if (!confirm('Voulez-vous vraiment supprimer cet ami ?')) return;

        btn.disabled = true;
        const result = await SocialService.removeFriend(friendshipId);
        if (result.success) {
          toast.info('Ami supprimé');
          await this.loadData();
          this.render();
        } else {
          toast.error(result.error || 'Erreur');
          btn.disabled = false;
        }
      });
    });
  }

  private updateSearchResults(): void {
    const resultsContainer = this.container.querySelector('.search-results');
    if (resultsContainer) {
      resultsContainer.innerHTML = this.renderSearchResults();
      
      // Re-attach add friend listeners
      const addBtns = resultsContainer.querySelectorAll<HTMLButtonElement>('[data-add-friend]');
      addBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
          const userId = btn.dataset.addFriend;
          if (!userId) return;

          btn.disabled = true;
          btn.textContent = '...';

          const result = await SocialService.sendFriendRequest(userId);
          if (result.success) {
            toast.success('Demande envoyée !');
            await this.loadData();
            this.updateSearchResults();
          } else {
            toast.error(result.error || 'Erreur');
            btn.disabled = false;
            btn.textContent = '➕ Ajouter';
          }
        });
      });
    }
  }
}
