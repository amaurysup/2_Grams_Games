import { profileService } from '../services/ProfileService';
import { achievementsService } from '../services/AchievementsService';
import { statsService } from '../services/StatsService';
import { friendsService } from '../services/FriendsService';
import { authContext } from '../context/AuthContext';
import type { PublicProfile, Achievement } from '../types';

export class ProfilePage {
  private container: HTMLElement;
  private userId: string | null;
  private isOwnProfile: boolean;
  private profile: PublicProfile | null = null;
  private loading: boolean = true;

  constructor(containerId: string, userId?: string) {
    const element = document.getElementById(containerId);
    if (!element) throw new Error(`Element with id ${containerId} not found`);
    
    this.container = element;
    
    const authState = authContext.getAuthState();
    this.userId = userId || authState.user?.id || null;
    this.isOwnProfile = !userId || userId === authState.user?.id;
    
    void this.init();
  }

  private async init(): Promise<void> {
    this.render();
    await this.loadProfile();
  }

  private async loadProfile(): Promise<void> {
    if (!this.userId) {
      this.loading = false;
      this.render();
      return;
    }

    this.profile = await profileService.getProfile(this.userId);
    this.loading = false;
    this.render();
  }

  private render(): void {
    if (this.loading) {
      this.container.innerHTML = this.renderLoading();
      return;
    }

    if (!this.userId) {
      this.container.innerHTML = this.renderNotLoggedIn();
      return;
    }

    if (!this.profile) {
      this.container.innerHTML = this.renderNotFound();
      return;
    }

    this.container.innerHTML = `
      <div class="profile-page">
        ${this.renderHeader()}
        ${this.renderStats()}
        ${this.renderBadges()}
        ${this.renderAchievements()}
        ${this.isOwnProfile ? this.renderSettings() : this.renderFriendActions()}
      </div>
    `;

    this.attachEventListeners();
  }

  private renderLoading(): string {
    return `
      <div class="profile-page profile-page--loading">
        <div class="profile-skeleton">
          <div class="profile-skeleton__avatar"></div>
          <div class="profile-skeleton__name"></div>
          <div class="profile-skeleton__stats"></div>
        </div>
      </div>
    `;
  }

  private renderNotLoggedIn(): string {
    return `
      <div class="profile-page profile-page--empty">
        <div class="profile-empty">
          <span class="profile-empty__icon">👤</span>
          <h2>Connectez-vous</h2>
          <p>Pour voir votre profil et vos statistiques</p>
          <a href="#/login" class="btn btn-primary">Se connecter</a>
        </div>
      </div>
    `;
  }

  private renderNotFound(): string {
    return `
      <div class="profile-page profile-page--empty">
        <div class="profile-empty">
          <span class="profile-empty__icon">🔍</span>
          <h2>Profil non trouvé</h2>
          <p>Cet utilisateur n'existe pas ou a été supprimé</p>
          <a href="#/games" class="btn btn-secondary">Retour aux jeux</a>
        </div>
      </div>
    `;
  }

  private renderHeader(): string {
    const p = this.profile!;
    const xpInfo = achievementsService.getXPForNextLevel();
    
    return `
      <header class="profile-header">
        <div class="profile-header__avatar-wrapper">
          ${p.avatar_url 
            ? `<img src="${p.avatar_url}" alt="${p.username}" class="profile-header__avatar" />`
            : `<div class="profile-header__avatar profile-header__avatar--default">
                ${p.username.charAt(0).toUpperCase()}
               </div>`
          }
          ${this.isOwnProfile ? `
            <button class="profile-header__edit-avatar" id="editAvatarBtn" aria-label="Changer l'avatar">
              📷
            </button>
          ` : ''}
        </div>
        
        <div class="profile-header__info">
          <h1 class="profile-header__username">${p.username}</h1>
          ${p.bio ? `<p class="profile-header__bio">${p.bio}</p>` : ''}
          
          <div class="profile-header__level">
            <span class="profile-level-badge">Niveau ${p.level}</span>
            <div class="profile-xp-bar">
              <div class="profile-xp-bar__fill" style="width: ${xpInfo.progress}%"></div>
            </div>
            <span class="profile-xp-text">${xpInfo.current} / ${xpInfo.required} XP</span>
          </div>
        </div>
      </header>
    `;
  }

  private renderStats(): string {
    const p = this.profile!;
    const wrapped = statsService.getWrappedStats();
    
    return `
      <section class="profile-stats">
        <h2 class="profile-section-title">📊 Statistiques</h2>
        <div class="profile-stats-grid">
          <div class="profile-stat-card">
            <span class="profile-stat-card__value">${p.games_played}</span>
            <span class="profile-stat-card__label">Parties jouées</span>
          </div>
          <div class="profile-stat-card">
            <span class="profile-stat-card__value">${wrapped.totalTime}</span>
            <span class="profile-stat-card__label">Temps de jeu</span>
          </div>
          <div class="profile-stat-card">
            <span class="profile-stat-card__value">${p.achievements_count}</span>
            <span class="profile-stat-card__label">Achievements</span>
          </div>
          <div class="profile-stat-card">
            <span class="profile-stat-card__value">${wrapped.longestStreak}</span>
            <span class="profile-stat-card__label">Meilleur streak</span>
          </div>
        </div>
      </section>
    `;
  }

  private renderBadges(): string {
    const p = this.profile!;
    
    if (p.badges.length === 0) {
      return `
        <section class="profile-badges">
          <h2 class="profile-section-title">🏅 Badges</h2>
          <p class="profile-badges__empty">Aucun badge encore obtenu</p>
        </section>
      `;
    }

    return `
      <section class="profile-badges">
        <h2 class="profile-section-title">🏅 Badges</h2>
        <div class="profile-badges-grid">
          ${p.badges.map(badge => `
            <div class="profile-badge profile-badge--${badge.rarity}" title="${badge.description}">
              <span class="profile-badge__icon">${badge.icon}</span>
              <span class="profile-badge__name">${badge.name}</span>
            </div>
          `).join('')}
        </div>
      </section>
    `;
  }

  private renderAchievements(): string {
    const achievements = achievementsService.getAllAchievements();
    const unlocked = achievements.filter(a => a.unlocked);
    
    return `
      <section class="profile-achievements">
        <h2 class="profile-section-title">🏆 Achievements (${unlocked.length}/${achievements.length})</h2>
        
        <div class="profile-achievements-tabs">
          <button class="profile-tab profile-tab--active" data-tab="unlocked">Débloqués</button>
          <button class="profile-tab" data-tab="locked">À débloquer</button>
        </div>
        
        <div class="profile-achievements-content" id="achievementsContent">
          ${this.renderAchievementsList(unlocked, true)}
        </div>
      </section>
    `;
  }

  private renderAchievementsList(achievements: Array<Achievement & { unlocked: boolean; progress: number }>, showAll: boolean = false): string {
    const toShow = showAll ? achievements : achievements.slice(0, 6);
    
    if (toShow.length === 0) {
      return `<p class="profile-achievements__empty">Aucun achievement dans cette catégorie</p>`;
    }

    return `
      <div class="profile-achievements-grid">
        ${toShow.map(a => `
          <div class="profile-achievement ${a.unlocked ? 'profile-achievement--unlocked' : ''} profile-achievement--${a.rarity}">
            <span class="profile-achievement__icon">${a.unlocked ? a.icon : '🔒'}</span>
            <div class="profile-achievement__info">
              <span class="profile-achievement__name">${a.is_secret && !a.unlocked ? '???' : a.name}</span>
              <span class="profile-achievement__desc">${a.is_secret && !a.unlocked ? 'Achievement secret' : a.description}</span>
              ${!a.unlocked ? `
                <div class="profile-achievement__progress">
                  <div class="profile-achievement__progress-bar" style="width: ${(a.progress / a.requirement) * 100}%"></div>
                  <span>${a.progress}/${a.requirement}</span>
                </div>
              ` : ''}
            </div>
            <span class="profile-achievement__xp">+${a.xp_reward} XP</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  private renderSettings(): string {
    return `
      <section class="profile-settings">
        <h2 class="profile-section-title">⚙️ Paramètres</h2>
        <div class="profile-settings-list">
          <a href="#/settings" class="profile-settings-item">
            <span>🎨</span>
            <span>Thème et apparence</span>
            <span>›</span>
          </a>
          <a href="#/settings/account" class="profile-settings-item">
            <span>👤</span>
            <span>Modifier le profil</span>
            <span>›</span>
          </a>
          <button class="profile-settings-item profile-settings-item--danger" id="logoutBtn">
            <span>🚪</span>
            <span>Déconnexion</span>
            <span></span>
          </button>
        </div>
      </section>
    `;
  }

  private renderFriendActions(): string {
    const p = this.profile!;
    
    let actionButton = '';
    if (p.is_friend) {
      actionButton = `<button class="btn btn-secondary" id="removeFriendBtn">Retirer des amis</button>`;
    } else if (p.friendship_status === 'pending') {
      actionButton = `<button class="btn btn-secondary" disabled>Demande envoyée</button>`;
    } else {
      actionButton = `<button class="btn btn-primary" id="addFriendBtn">Ajouter en ami</button>`;
    }

    return `
      <section class="profile-actions">
        ${actionButton}
        <button class="btn btn-ghost" id="blockUserBtn">Bloquer</button>
      </section>
    `;
  }

  private attachEventListeners(): void {
    // Tabs
    const tabs = this.container.querySelectorAll('.profile-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('profile-tab--active'));
        tab.classList.add('profile-tab--active');
        
        const tabName = (tab as HTMLElement).dataset.tab;
        const content = this.container.querySelector('#achievementsContent');
        if (content && tabName) {
          const achievements = achievementsService.getAllAchievements();
          if (tabName === 'unlocked') {
            content.innerHTML = this.renderAchievementsList(achievements.filter(a => a.unlocked), true);
          } else {
            content.innerHTML = this.renderAchievementsList(achievements.filter(a => !a.unlocked && !a.is_secret), true);
          }
        }
      });
    });

    // Logout
    const logoutBtn = this.container.querySelector('#logoutBtn');
    logoutBtn?.addEventListener('click', async () => {
      await authContext.signOut();
      window.location.hash = '/';
    });

    // Friend actions
    const addFriendBtn = this.container.querySelector('#addFriendBtn');
    addFriendBtn?.addEventListener('click', async () => {
      if (this.profile) {
        await friendsService.sendFriendRequest(this.profile.username);
        this.loadProfile();
      }
    });

    const removeFriendBtn = this.container.querySelector('#removeFriendBtn');
    removeFriendBtn?.addEventListener('click', async () => {
      if (this.profile) {
        await friendsService.removeFriend(this.profile.user_id);
        this.loadProfile();
      }
    });

    // Edit avatar
    const editAvatarBtn = this.container.querySelector('#editAvatarBtn');
    editAvatarBtn?.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          await profileService.uploadAvatar(file);
          this.loadProfile();
        }
      };
      input.click();
    });
  }
}
