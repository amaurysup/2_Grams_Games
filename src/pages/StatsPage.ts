import { statsService } from '../services/StatsService';
import { achievementsService } from '../services/AchievementsService';
import type { UserStats } from '../types';

export class StatsPage {
  private container: HTMLElement;
  private stats: UserStats | null = null;
  private achievementCount: number = 0;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  async render(): Promise<void> {
    this.container.innerHTML = this.renderLoading();
    await this.loadStats();
    this.container.innerHTML = this.renderContent();
  }

  private renderLoading(): string {
    return `
      <div class="stats-page">
        <div class="stats-loading">
          <div class="loading-spinner"></div>
          <p>Chargement des statistiques...</p>
        </div>
      </div>
    `;
  }

  private async loadStats(): Promise<void> {
    this.stats = statsService.getStats();
    
    const achievements = achievementsService.getAllAchievements();
    this.achievementCount = achievements.filter(a => a.unlocked).length;
  }

  private renderContent(): string {
    const stats = this.stats;
    const wrapped = statsService.getWrappedStats();
    
    return `
      <div class="stats-page">
        <header class="stats-header">
          <h1>📊 Mes Statistiques</h1>
          <p class="stats-subtitle">Ton parcours de joueur</p>
        </header>

        <section class="stats-overview">
          <div class="stat-card primary">
            <div class="stat-icon">🎮</div>
            <div class="stat-value">${stats?.total_games_played || 0}</div>
            <div class="stat-label">Parties jouées</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">⏱️</div>
            <div class="stat-value">${wrapped.totalTime}</div>
            <div class="stat-label">Temps de jeu</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">🔥</div>
            <div class="stat-value">${stats?.current_streak || 0}</div>
            <div class="stat-label">Jours de suite</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">🏆</div>
            <div class="stat-value">${this.achievementCount}</div>
            <div class="stat-label">Succès débloqués</div>
          </div>
        </section>

        <section class="stats-section">
          <h2>⭐ Jeux les plus joués</h2>
          <div class="most-played-list">
            ${this.renderMostPlayedGames()}
          </div>
        </section>

        <section class="stats-section">
          <h2>📅 Activité récente</h2>
          <div class="activity-calendar">
            ${this.renderActivityCalendar()}
          </div>
        </section>

        <section class="stats-section">
          <h2>📈 Progression</h2>
          <div class="progression-stats">
            <div class="progression-item">
              <span class="progression-label">Niveau</span>
              <div class="progression-bar">
                <div class="progression-fill" style="width: ${this.getLevelProgress()}%"></div>
              </div>
              <span class="progression-value">Niveau ${wrapped.level}</span>
            </div>
            
            <div class="progression-item">
              <span class="progression-label">Thème favori</span>
              <div class="progression-info">
                <span class="progression-value">${wrapped.favoriteTheme || 'Aucun'}</span>
              </div>
            </div>
          </div>
        </section>

        <section class="stats-section">
          <h2>🎯 Records personnels</h2>
          <div class="records-grid">
            <div class="record-card">
              <span class="record-icon">🔥</span>
              <span class="record-value">${stats?.longest_streak || 0}</span>
              <span class="record-label">Plus longue série</span>
            </div>
            <div class="record-card">
              <span class="record-icon">📆</span>
              <span class="record-value">${stats?.last_played_at ? this.formatDate(stats.last_played_at) : '-'}</span>
              <span class="record-label">Dernière partie</span>
            </div>
            <div class="record-card">
              <span class="record-icon">🎲</span>
              <span class="record-value">${wrapped.favoriteGame || '-'}</span>
              <span class="record-label">Jeu favori</span>
            </div>
          </div>
        </section>
      </div>
    `;
  }

  private renderMostPlayedGames(): string {
    if (!this.stats) {
      return '<p class="no-data">Joue à des jeux pour voir tes favoris !</p>';
    }

    const gamesByCount = Object.entries(this.stats.games_played_by_game)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    if (gamesByCount.length === 0) {
      return '<p class="no-data">Joue à des jeux pour voir tes favoris !</p>';
    }

    return gamesByCount.map(([gameId, count], index) => `
      <div class="most-played-item" data-game-id="${gameId}">
        <span class="rank">#${index + 1}</span>
        <span class="game-name">${gameId}</span>
        <span class="play-count">${count} partie${count > 1 ? 's' : ''}</span>
      </div>
    `).join('');
  }

  private getLevelProgress(): number {
    const wrapped = statsService.getWrappedStats();
    // Simple progression within level
    return Math.min(100, ((wrapped.totalGames % 10) / 10) * 100);
  }

  private renderActivityCalendar(): string {
    // Use weekly_activity and monthly_activity from stats
    const days: string[] = [];
    const monthlyActivity = this.stats?.monthly_activity || Array(30).fill(0);
    
    // Show last 28 days (4 weeks)
    const last28Days = monthlyActivity.slice(-28);
    
    last28Days.forEach((activity, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (27 - i));
      
      let intensity = 0;
      if (activity > 0) intensity = 1;
      if (activity >= 3) intensity = 2;
      if (activity >= 5) intensity = 3;
      
      days.push(`
        <div class="calendar-day intensity-${intensity}" 
             title="${date.toLocaleDateString('fr-FR')}: ${activity} partie${activity !== 1 ? 's' : ''}">
        </div>
      `);
    });
    
    return `
      <div class="calendar-grid">
        ${days.join('')}
      </div>
      <div class="calendar-legend">
        <span>Moins</span>
        <div class="legend-day intensity-0"></div>
        <div class="legend-day intensity-1"></div>
        <div class="legend-day intensity-2"></div>
        <div class="legend-day intensity-3"></div>
        <span>Plus</span>
      </div>
    `;
  }

  private formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  }
}
