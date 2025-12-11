import { friendsService } from '../services/FriendsService';
import type { Friendship, FriendProfile } from '../types';
import { toast } from '../components/Toast';

export class FriendsPage {
  private container: HTMLElement;
  private friends: FriendProfile[] = [];
  private pendingRequests: Friendship[] = [];
  private activeTab: 'friends' | 'requests' | 'search' = 'friends';
  private searchResults: FriendProfile[] = [];
  private searchQuery = '';

  constructor(container: HTMLElement) {
    this.container = container;
  }

  async render(): Promise<void> {
    this.container.innerHTML = this.renderLoading();
    await this.loadData();
    this.container.innerHTML = this.renderContent();
    this.attachEventListeners();
  }

  private renderLoading(): string {
    return `
      <div class="friends-page">
        <div class="friends-loading">
          <div class="loading-spinner"></div>
          <p>Chargement des amis...</p>
        </div>
      </div>
    `;
  }

  private async loadData(): Promise<void> {
    this.friends = friendsService.getFriends();
    this.pendingRequests = friendsService.getPendingRequests();
  }

  private renderContent(): string {
    const requestCount = this.pendingRequests.length;
    
    return `
      <div class="friends-page">
        <header class="friends-header">
          <h1>👥 Amis</h1>
          <p class="friends-subtitle">${this.friends.length} ami${this.friends.length !== 1 ? 's' : ''}</p>
        </header>

        <div class="friends-tabs">
          <button class="friends-tab ${this.activeTab === 'friends' ? 'active' : ''}" data-tab="friends">
            Amis
          </button>
          <button class="friends-tab ${this.activeTab === 'requests' ? 'active' : ''}" data-tab="requests">
            Demandes
            ${requestCount > 0 ? `<span class="request-badge">${requestCount}</span>` : ''}
          </button>
          <button class="friends-tab ${this.activeTab === 'search' ? 'active' : ''}" data-tab="search">
            Rechercher
          </button>
        </div>

        <div class="friends-content">
          ${this.renderActiveTab()}
        </div>
      </div>
    `;
  }

  private renderActiveTab(): string {
    switch (this.activeTab) {
      case 'friends':
        return this.renderFriendsList();
      case 'requests':
        return this.renderRequests();
      case 'search':
        return this.renderSearch();
      default:
        return '';
    }
  }

  private renderFriendsList(): string {
    if (this.friends.length === 0) {
      return `
        <div class="empty-state">
          <span class="empty-icon">👋</span>
          <h3>Pas encore d'amis</h3>
          <p>Recherche des joueurs pour les ajouter !</p>
        </div>
      `;
    }

    const onlineFriends = this.friends.filter(f => f.status === 'online' || f.status === 'in_game');
    const offlineFriends = this.friends.filter(f => f.status === 'offline');

    return `
      ${onlineFriends.length > 0 ? `
        <div class="friends-section">
          <h3 class="section-title">🟢 En ligne (${onlineFriends.length})</h3>
          <div class="friends-list">
            ${onlineFriends.map(f => this.renderFriendCard(f, true)).join('')}
          </div>
        </div>
      ` : ''}
      
      ${offlineFriends.length > 0 ? `
        <div class="friends-section">
          <h3 class="section-title">⚫ Hors ligne (${offlineFriends.length})</h3>
          <div class="friends-list">
            ${offlineFriends.map(f => this.renderFriendCard(f, false)).join('')}
          </div>
        </div>
      ` : ''}
    `;
  }

  private renderFriendCard(friend: FriendProfile, isOnline: boolean): string {
    return `
      <div class="friend-card" data-friend-id="${friend.user_id}">
        <div class="friend-avatar">
          ${friend.avatar_url || '👤'}
          ${isOnline ? '<span class="online-indicator"></span>' : ''}
        </div>
        <div class="friend-info">
          <span class="friend-name">${friend.username}</span>
          <span class="friend-status">${isOnline ? (friend.current_game || 'En ligne') : this.formatLastSeen(friend.last_seen)}</span>
        </div>
        <div class="friend-actions">
          <button class="btn-icon view-profile" title="Voir le profil">👁️</button>
          <button class="btn-icon remove-friend" data-friend-id="${friend.user_id}" title="Retirer">❌</button>
        </div>
      </div>
    `;
  }

  private renderRequests(): string {
    return `
      <div class="requests-container">
        ${this.pendingRequests.length > 0 ? `
          <div class="requests-section">
            <h3 class="section-title">📥 Demandes reçues (${this.pendingRequests.length})</h3>
            <div class="requests-list">
              ${this.pendingRequests.map(r => this.renderReceivedRequest(r)).join('')}
            </div>
          </div>
        ` : `
          <div class="empty-state">
            <span class="empty-icon">📭</span>
            <h3>Aucune demande</h3>
            <p>Les demandes d'amis apparaîtront ici</p>
          </div>
        `}
      </div>
    `;
  }

  private renderReceivedRequest(request: Friendship): string {
    return `
      <div class="request-card received">
        <div class="request-avatar">👤</div>
        <div class="request-info">
          <span class="request-name">Utilisateur</span>
          <span class="request-time">${this.formatTime(request.created_at)}</span>
        </div>
        <div class="request-actions">
          <button class="btn-accept" data-request-id="${request.id}">✓ Accepter</button>
          <button class="btn-decline" data-request-id="${request.id}">✕</button>
        </div>
      </div>
    `;
  }

  private renderSearch(): string {
    return `
      <div class="search-container">
        <div class="search-input-wrapper">
          <input 
            type="text" 
            id="friend-search" 
            placeholder="Rechercher par nom d'utilisateur..." 
            value="${this.searchQuery}"
          />
          <button class="btn-search" id="search-btn">🔍</button>
        </div>
        
        <div class="search-results">
          ${this.searchQuery ? this.renderSearchResults() : `
            <div class="search-hint">
              <span>💡</span>
              <p>Entre un nom d'utilisateur pour rechercher</p>
            </div>
          `}
        </div>
      </div>
    `;
  }

  private renderSearchResults(): string {
    if (this.searchResults.length === 0) {
      return `
        <div class="empty-state">
          <span class="empty-icon">🔍</span>
          <h3>Aucun résultat</h3>
          <p>Aucun utilisateur trouvé pour "${this.searchQuery}"</p>
        </div>
      `;
    }

    return `
      <div class="search-results-list">
        ${this.searchResults.map(user => `
          <div class="search-result-card">
            <div class="result-avatar">${user.avatar_url || '👤'}</div>
            <div class="result-info">
              <span class="result-name">${user.username}</span>
              <span class="result-level">Niveau ${user.level}</span>
            </div>
            <button class="btn-add-friend" data-username="${user.username}">
              + Ajouter
            </button>
          </div>
        `).join('')}
      </div>
    `;
  }

  private formatLastSeen(lastSeen?: string): string {
    if (!lastSeen) return 'Hors ligne';
    const date = new Date(lastSeen);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 5) return 'Il y a quelques minutes';
    if (diffMins < 60) return `Il y a ${diffMins} minutes`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    return 'Vu récemment';
  }

  private formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return "À l'instant";
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR');
  }

  private attachEventListeners(): void {
    // Tab switching
    this.container.querySelectorAll('.friends-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        this.activeTab = (tab as HTMLElement).dataset.tab as typeof this.activeTab;
        this.refresh();
      });
    });

    // Friend card click (view profile)
    this.container.querySelectorAll('.friend-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if ((e.target as HTMLElement).closest('.friend-actions')) return;
        const friendId = (card as HTMLElement).dataset.friendId;
        if (friendId) {
          window.location.hash = `#/profile/${friendId}`;
        }
      });
    });

    // Remove friend
    this.container.querySelectorAll('.remove-friend').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const friendId = (btn as HTMLElement).dataset.friendId;
        if (friendId && confirm('Retirer cet ami ?')) {
          const result = await friendsService.removeFriend(friendId);
          if (result.success) {
            toast.success('Ami retiré');
            await this.loadData();
            this.refresh();
          }
        }
      });
    });

    // Accept request
    this.container.querySelectorAll('.btn-accept').forEach(btn => {
      btn.addEventListener('click', async () => {
        const requestId = (btn as HTMLElement).dataset.requestId;
        if (requestId) {
          const result = await friendsService.acceptRequest(requestId);
          if (result.success) {
            toast.success('Demande acceptée !');
            await this.loadData();
            this.refresh();
          }
        }
      });
    });

    // Decline request
    this.container.querySelectorAll('.btn-decline').forEach(btn => {
      btn.addEventListener('click', async () => {
        const requestId = (btn as HTMLElement).dataset.requestId;
        if (requestId) {
          const result = await friendsService.rejectRequest(requestId);
          if (result.success) {
            toast.info('Demande refusée');
            await this.loadData();
            this.refresh();
          }
        }
      });
    });

    // Search input
    const searchInput = document.getElementById('friend-search') as HTMLInputElement;
    const searchBtn = document.getElementById('search-btn');
    
    searchBtn?.addEventListener('click', async () => {
      await this.performSearch(searchInput?.value || '');
    });
    
    searchInput?.addEventListener('keypress', async (e) => {
      if (e.key === 'Enter') {
        await this.performSearch(searchInput.value);
      }
    });

    // Add friend from search
    this.container.querySelectorAll('.btn-add-friend').forEach(btn => {
      btn.addEventListener('click', async () => {
        const username = (btn as HTMLElement).dataset.username;
        if (username) {
          const result = await friendsService.sendFriendRequest(username);
          if (result.success) {
            toast.success('Demande envoyée !');
            (btn as HTMLButtonElement).disabled = true;
            (btn as HTMLElement).textContent = 'Envoyée ✓';
          } else {
            toast.error(result.error || 'Erreur');
          }
        }
      });
    });
  }

  private async performSearch(query: string): Promise<void> {
    this.searchQuery = query.trim();
    if (!this.searchQuery) {
      this.searchResults = [];
      this.refresh();
      return;
    }

    this.searchResults = await friendsService.searchUsers(this.searchQuery);
    this.refresh();
  }

  private refresh(): void {
    this.container.innerHTML = this.renderContent();
    this.attachEventListeners();
  }
}
