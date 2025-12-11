import { supabase } from '../lib/supabase';
import type { Game } from '../types';

type Phase = 'player-count' | 'swipe';

export class TinderModePage {
  private container: HTMLElement;
  private phase: Phase = 'player-count';
  private playerCount: number = 2;
  private allGames: Game[] = [];
  private filteredGames: Game[] = [];
  private currentGameIndex: number = 0;
  private startX: number = 0;
  private currentX: number = 0;
  private isDragging: boolean = false;

  constructor(containerId: string) {
    const element = document.getElementById(containerId);
    if (!element) throw new Error(`Element with id ${containerId} not found`);
    
    this.container = element;
    void this.init();
  }

  private async init(): Promise<void> {
    await this.loadGames();
    this.render();
  }

  private async loadGames(): Promise<void> {
    try {
      const { data: games, error } = await supabase
        .from('jeux')
        .select('*');
      
      if (error) throw error;
      this.allGames = games || [];
    } catch (error) {
      console.error('Erreur chargement jeux:', error);
      this.allGames = [];
    }
  }

  private filterGamesByPlayerCount(): void {
    this.filteredGames = this.allGames.filter(game => {
      const min = game.joueurs_min ?? 1;
      const max = game.joueurs_max ?? 99;
      return this.playerCount >= min && this.playerCount <= max;
    });
    
    // Mélanger aléatoirement les jeux filtrés
    this.shuffleArray(this.filteredGames);
    this.currentGameIndex = 0;
  }

  private shuffleArray(array: Game[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  private render(): void {
    if (this.phase === 'player-count') {
      this.renderPlayerCountPhase();
    } else {
      this.renderSwipePhase();
    }
  }

  private renderPlayerCountPhase(): void {
    this.container.innerHTML = `
      <div class="tinder-page">
        <div class="tinder-header">
          <a href="#/games" class="back-btn">← Retour</a>
          <h1>🔥 Mode Tinder</h1>
        </div>
        
        <div class="tinder-setup">
          <div class="setup-icon">👥</div>
          <h2>Combien de joueurs êtes-vous ?</h2>
          
          <div class="player-count-selector">
            <button class="count-btn" id="decrease-btn">−</button>
            <div class="player-count-display">
              <span id="player-count">${this.playerCount}</span>
              <span class="player-label">joueurs</span>
            </div>
            <button class="count-btn" id="increase-btn">+</button>
          </div>
          
          <button class="btn-start-tinder" id="start-btn">
            🎴 Découvrir les jeux
          </button>
        </div>
      </div>
    `;

    this.attachPlayerCountListeners();
  }

  private attachPlayerCountListeners(): void {
    const decreaseBtn = document.getElementById('decrease-btn');
    const increaseBtn = document.getElementById('increase-btn');
    const startBtn = document.getElementById('start-btn');
    const countDisplay = document.getElementById('player-count');

    decreaseBtn?.addEventListener('click', () => {
      if (this.playerCount > 1) {
        this.playerCount--;
        if (countDisplay) countDisplay.textContent = String(this.playerCount);
      }
    });

    increaseBtn?.addEventListener('click', () => {
      if (this.playerCount < 20) {
        this.playerCount++;
        if (countDisplay) countDisplay.textContent = String(this.playerCount);
      }
    });

    startBtn?.addEventListener('click', () => {
      this.filterGamesByPlayerCount();
      this.phase = 'swipe';
      this.render();
    });
  }

  private renderSwipePhase(): void {
    const currentGame = this.filteredGames[this.currentGameIndex];

    if (!currentGame) {
      this.renderNoMoreGames();
      return;
    }

    this.container.innerHTML = `
      <div class="tinder-page">
        <div class="tinder-header">
          <a href="#/games" class="back-btn">← Retour</a>
          <h1>🔥 Mode Tinder</h1>
          <div class="game-counter">${this.currentGameIndex + 1}/${this.filteredGames.length}</div>
        </div>

        <div class="tinder-instructions">
          <span class="swipe-hint swipe-left">← Passer</span>
          <span class="swipe-hint swipe-right">Jouer →</span>
        </div>

        <div class="tinder-card-container">
          <div class="tinder-card" id="tinder-card">
            <div class="card-image" style="background-image: url('${currentGame.image || '/placeholder-game.jpg'}')">
              <div class="card-gradient"></div>
            </div>
            <div class="card-content">
              <h2 class="card-title">${currentGame.name}</h2>
              <p class="card-description">${currentGame.description}</p>
              <div class="card-tags">
                ${this.getGameTags(currentGame)}
              </div>
              <div class="card-players">
                👥 ${this.formatPlayerCount(currentGame)}
              </div>
            </div>
            <div class="swipe-indicator swipe-left-indicator">✗</div>
            <div class="swipe-indicator swipe-right-indicator">♥</div>
          </div>
        </div>

        <div class="tinder-actions">
          <button class="action-btn action-pass" id="btn-pass">
            <span class="action-icon">✗</span>
            <span>Passer</span>
          </button>
          <button class="action-btn action-play" id="btn-play">
            <span class="action-icon">♥</span>
            <span>Jouer</span>
          </button>
        </div>
      </div>
    `;

    this.attachSwipeListeners();
  }

  private getGameTags(game: Game): string {
    const tags: string[] = [];
    if (game.chill) tags.push('😌 Chill');
    if (game.destruction) tags.push('💥 Destruction');
    if (game.découverte) tags.push('🔍 Découverte');
    if (game.embrouilles) tags.push('🤯 Embrouilles');
    if (game.réflexion) tags.push('🧠 Réflexion');
    if (game.exploration) tags.push('🗺️ Exploration');
    if (game.interactif) tags.push('🎮 Interactif');
    
    return tags.map(tag => `<span class="game-tag">${tag}</span>`).join('');
  }

  private formatPlayerCount(game: Game): string {
    const min = game.joueurs_min ?? 1;
    const max = game.joueurs_max;
    
    if (max === null || max === undefined || max > 20) {
      return `${min}+ joueurs`;
    }
    if (min === max) {
      return `${min} joueurs`;
    }
    return `${min}-${max} joueurs`;
  }

  private attachSwipeListeners(): void {
    const card = document.getElementById('tinder-card') as HTMLElement;
    const btnPass = document.getElementById('btn-pass');
    const btnPlay = document.getElementById('btn-play');

    if (!card) return;

    // Touch events pour mobile
    card.addEventListener('touchstart', (e) => this.handleDragStart(e.touches[0].clientX), { passive: true });
    card.addEventListener('touchmove', (e) => this.handleDragMove(e.touches[0].clientX, card), { passive: true });
    card.addEventListener('touchend', () => this.handleDragEnd(card));

    // Mouse events pour desktop
    card.addEventListener('mousedown', (e) => this.handleDragStart(e.clientX));
    card.addEventListener('mousemove', (e) => {
      if (this.isDragging) this.handleDragMove(e.clientX, card);
    });
    card.addEventListener('mouseup', () => this.handleDragEnd(card));
    card.addEventListener('mouseleave', () => {
      if (this.isDragging) this.handleDragEnd(card);
    });

    // Boutons
    btnPass?.addEventListener('click', () => this.swipeLeft());
    btnPlay?.addEventListener('click', () => this.swipeRight());
  }

  private handleDragStart(clientX: number): void {
    this.isDragging = true;
    this.startX = clientX;
    this.currentX = clientX;
  }

  private handleDragMove(clientX: number, card: HTMLElement): void {
    if (!this.isDragging) return;
    
    this.currentX = clientX;
    const deltaX = this.currentX - this.startX;
    const rotation = deltaX * 0.1;
    
    card.style.transform = `translateX(${deltaX}px) rotate(${rotation}deg)`;
    card.style.transition = 'none';

    // Afficher les indicateurs
    const leftIndicator = card.querySelector('.swipe-left-indicator') as HTMLElement;
    const rightIndicator = card.querySelector('.swipe-right-indicator') as HTMLElement;
    
    if (leftIndicator && rightIndicator) {
      if (deltaX < -50) {
        leftIndicator.style.opacity = String(Math.min(1, Math.abs(deltaX) / 150));
        rightIndicator.style.opacity = '0';
      } else if (deltaX > 50) {
        rightIndicator.style.opacity = String(Math.min(1, deltaX / 150));
        leftIndicator.style.opacity = '0';
      } else {
        leftIndicator.style.opacity = '0';
        rightIndicator.style.opacity = '0';
      }
    }
  }

  private handleDragEnd(card: HTMLElement): void {
    if (!this.isDragging) return;
    
    this.isDragging = false;
    const deltaX = this.currentX - this.startX;
    
    card.style.transition = 'transform 0.3s ease';

    if (deltaX < -100) {
      this.swipeLeft();
    } else if (deltaX > 100) {
      this.swipeRight();
    } else {
      // Reset position
      card.style.transform = 'translateX(0) rotate(0)';
      const leftIndicator = card.querySelector('.swipe-left-indicator') as HTMLElement;
      const rightIndicator = card.querySelector('.swipe-right-indicator') as HTMLElement;
      if (leftIndicator) leftIndicator.style.opacity = '0';
      if (rightIndicator) rightIndicator.style.opacity = '0';
    }
  }

  private swipeLeft(): void {
    const card = document.getElementById('tinder-card') as HTMLElement;
    if (card) {
      card.style.transition = 'transform 0.5s ease';
      card.style.transform = 'translateX(-150%) rotate(-30deg)';
    }

    setTimeout(() => {
      this.currentGameIndex++;
      if (this.currentGameIndex >= this.filteredGames.length) {
        // On a fait le tour, on re-mélange
        this.shuffleArray(this.filteredGames);
        this.currentGameIndex = 0;
      }
      this.render();
    }, 300);
  }

  private swipeRight(): void {
    const card = document.getElementById('tinder-card') as HTMLElement;
    const currentGame = this.filteredGames[this.currentGameIndex];
    
    if (card) {
      card.style.transition = 'transform 0.5s ease';
      card.style.transform = 'translateX(150%) rotate(30deg)';
    }

    setTimeout(() => {
      // Naviguer vers la page du jeu
      window.location.hash = `/game/${currentGame.id}`;
    }, 300);
  }

  private renderNoMoreGames(): void {
    this.container.innerHTML = `
      <div class="tinder-page">
        <div class="tinder-header">
          <a href="#/games" class="back-btn">← Retour</a>
          <h1>🔥 Mode Tinder</h1>
        </div>

        <div class="tinder-empty">
          <div class="empty-icon">😢</div>
          <h2>Aucun jeu disponible</h2>
          <p>Aucun jeu ne correspond à ${this.playerCount} joueurs.</p>
          <button class="btn-restart" id="btn-restart">
            🔄 Changer le nombre de joueurs
          </button>
        </div>
      </div>
    `;

    document.getElementById('btn-restart')?.addEventListener('click', () => {
      this.phase = 'player-count';
      this.render();
    });
  }
}
