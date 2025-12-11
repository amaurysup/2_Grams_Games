import { leaderboardService } from '../services/LeaderboardService';
import type { LeaderboardEntry, LeaderboardCategory, LeaderboardType } from '../types';

export class LeaderboardPage {
  private container: HTMLElement;
  private currentCategory: LeaderboardCategory = 'games_played';
  private currentType: LeaderboardType = 'all_time';
  private entries: LeaderboardEntry[] = [];
  private userRank: { rank: number; total: number } | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  async render(): Promise<void> {
    this.container.innerHTML = this.renderLoading();
    await this.loadLeaderboard();
    this.container.innerHTML = this.renderContent();
    this.attachEventListeners();
  }

  private renderLoading(): string {
    return `
      <div class="leaderboard-page">
        <div class="leaderboard-loading">
          <div class="loading-spinner"></div>
          <p>Chargement du classement...</p>
        </div>
      </div>
    `;
  }

  private async loadLeaderboard(): Promise<void> {
    this.entries = await leaderboardService.getLeaderboard(this.currentCategory, this.currentType, 50);
    // getUserRank requires userId - for now we skip it if we don't have userId
    this.userRank = null;
  }

  private renderContent(): string {
    return `
      <div class="leaderboard-page">
        <header class="leaderboard-header">
          <h1>🏆 Classement</h1>
          <p class="leaderboard-subtitle">Qui sera le meilleur joueur ?</p>
        </header>

        <div class="leaderboard-filters">
          <div class="filter-group">
            <label>Catégorie</label>
            <div class="filter-tabs">
              <button class="filter-tab ${this.currentCategory === 'xp' ? 'active' : ''}" data-category="xp">
                ⭐ XP
              </button>
              <button class="filter-tab ${this.currentCategory === 'games_played' ? 'active' : ''}" data-category="games_played">
                🎮 Parties
              </button>
              <button class="filter-tab ${this.currentCategory === 'time_played' ? 'active' : ''}" data-category="time_played">
                ⏱️ Temps
              </button>
              <button class="filter-tab ${this.currentCategory === 'achievements' ? 'active' : ''}" data-category="achievements">
                🏅 Succès
              </button>
            </div>
          </div>
          
          <div class="filter-group">
            <label>Période</label>
            <div class="filter-tabs">
              <button class="filter-tab period ${this.currentType === 'all_time' ? 'active' : ''}" data-type="all_time">
                Tout
              </button>
              <button class="filter-tab period ${this.currentType === 'monthly' ? 'active' : ''}" data-type="monthly">
                Mois
              </button>
              <button class="filter-tab period ${this.currentType === 'weekly' ? 'active' : ''}" data-type="weekly">
                Semaine
              </button>
            </div>
          </div>
        </div>

        ${this.userRank ? this.renderUserRank() : ''}

        <div class="leaderboard-podium">
          ${this.renderPodium()}
        </div>

        <div class="leaderboard-list">
          ${this.renderList()}
        </div>
      </div>
    `;
  }

  private renderUserRank(): string {
    if (!this.userRank) return '';
    return `
      <div class="user-rank-banner">
        <span class="rank-label">Ton classement</span>
        <span class="rank-value">#${this.userRank.rank} / ${this.userRank.total}</span>
      </div>
    `;
  }

  private renderPodium(): string {
    if (this.entries.length < 3) {
      return '<p class="no-data">Pas assez de joueurs pour le podium</p>';
    }

    const [first, second, third] = this.entries;
    
    return `
      <div class="podium">
        <div class="podium-place second">
          <div class="podium-avatar">${second.avatar_url || '👤'}</div>
          <div class="podium-name">${second.username}</div>
          <div class="podium-score">${this.formatScore(second.value)}</div>
          <div class="podium-block">2</div>
        </div>
        <div class="podium-place first">
          <div class="podium-crown">👑</div>
          <div class="podium-avatar">${first.avatar_url || '👤'}</div>
          <div class="podium-name">${first.username}</div>
          <div class="podium-score">${this.formatScore(first.value)}</div>
          <div class="podium-block">1</div>
        </div>
        <div class="podium-place third">
          <div class="podium-avatar">${third.avatar_url || '👤'}</div>
          <div class="podium-name">${third.username}</div>
          <div class="podium-score">${this.formatScore(third.value)}</div>
          <div class="podium-block">3</div>
        </div>
      </div>
    `;
  }

  private renderList(): string {
    const listEntries = this.entries.slice(3);
    
    if (listEntries.length === 0) {
      return '';
    }

    return listEntries.map((entry) => `
      <div class="leaderboard-entry" data-user-id="${entry.user_id}">
        <div class="entry-rank">#${entry.rank}</div>
        <div class="entry-avatar">${entry.avatar_url || '👤'}</div>
        <div class="entry-info">
          <span class="entry-name">${entry.username}</span>
          ${entry.level ? `<span class="entry-level">Niv. ${entry.level}</span>` : ''}
        </div>
        <div class="entry-score">${this.formatScore(entry.value)}</div>
      </div>
    `).join('');
  }

  private formatScore(value: number): string {
    switch (this.currentCategory) {
      case 'xp':
        return `${value.toLocaleString()} XP`;
      case 'games_played':
        return `${value} parties`;
      case 'time_played':
        const hours = Math.floor(value / 3600);
        const mins = Math.floor((value % 3600) / 60);
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
      case 'achievements':
        return `${value} succès`;
      default:
        return value.toString();
    }
  }

  private attachEventListeners(): void {
    // Category tabs
    this.container.querySelectorAll('.filter-tab[data-category]').forEach(tab => {
      tab.addEventListener('click', async (e) => {
        const category = (e.target as HTMLElement).dataset.category as LeaderboardCategory;
        if (category && category !== this.currentCategory) {
          this.currentCategory = category;
          await this.refresh();
        }
      });
    });

    // Type tabs (period)
    this.container.querySelectorAll('.filter-tab[data-type]').forEach(tab => {
      tab.addEventListener('click', async (e) => {
        const type = (e.target as HTMLElement).dataset.type as LeaderboardType;
        if (type && type !== this.currentType) {
          this.currentType = type;
          await this.refresh();
        }
      });
    });

    // Entry click - go to profile
    this.container.querySelectorAll('.leaderboard-entry').forEach(entry => {
      entry.addEventListener('click', () => {
        const userId = (entry as HTMLElement).dataset.userId;
        if (userId) {
          window.location.hash = `#/profile/${userId}`;
        }
      });
    });
  }

  private async refresh(): Promise<void> {
    await this.loadLeaderboard();
    this.container.innerHTML = this.renderContent();
    this.attachEventListeners();
  }
}
