/**
 * Jeu Piccola - Version HARDCORE
 * Jeu de cartes de soirée avec 110 cartes
 */

import { PiccolaCard, getShuffledDeck, getCardWithRandomPlayers } from '../data/piccolaCards';

interface GameState {
  players: string[];
  deck: PiccolaCard[];
  currentCardIndex: number;
  cardsPlayed: number;
}

export class PiccolaGame {
  private container: HTMLElement;
  private gameState: GameState | null = null;
  private storageKey: string = '';

  constructor(container: HTMLElement) {
    this.container = container;
  }

  /**
   * Initialise le jeu
   */
  public start(userId: string): void {
    this.storageKey = `piccolaGame_${userId}`;
    
    // Vérifier s'il y a une partie sauvegardée
    const savedState = this.loadGameState();
    
    if (savedState) {
      this.gameState = savedState;
      this.renderGameScreen();
    } else {
      this.renderPlayerSetup();
    }
  }

  /**
   * Écran de configuration des joueurs
   */
  private renderPlayerSetup(): void {
    this.container.innerHTML = `
      <div class="piccola-modal-overlay">
        <div class="piccola-modal">
          <div class="piccola-header">
            <h2>🔥 Piccola HARDCORE 🔥</h2>
            <p>Préparez-vous pour une soirée de folie !</p>
          </div>

          <div class="piccola-setup">
            <div class="setup-section">
              <label for="player-count">Nombre de joueurs (3-10)</label>
              <input 
                type="number" 
                id="player-count" 
                min="3" 
                max="10" 
                value="4"
                class="setup-input"
              />
            </div>

            <div class="setup-section">
              <label>Prénoms des joueurs</label>
              <div id="player-names-container">
                <input type="text" class="player-name-input" placeholder="Joueur 1" data-player="1" />
                <input type="text" class="player-name-input" placeholder="Joueur 2" data-player="2" />
                <input type="text" class="player-name-input" placeholder="Joueur 3" data-player="3" />
                <input type="text" class="player-name-input" placeholder="Joueur 4" data-player="4" />
              </div>
            </div>

            <button id="start-game-btn" class="btn-primary">
              🎮 Commencer la partie
            </button>
          </div>

          <button id="close-piccola-btn" class="btn-close">✕</button>
        </div>
      </div>
    `;

    this.attachSetupListeners();
  }

  /**
   * Attache les listeners pour l'écran de setup
   */
  private attachSetupListeners(): void {
    const playerCountInput = document.getElementById('player-count') as HTMLInputElement;
    const startGameBtn = document.getElementById('start-game-btn');
    const closeBtn = document.getElementById('close-piccola-btn');

    // Mise à jour du nombre de champs de noms
    playerCountInput?.addEventListener('input', () => {
      const count = parseInt(playerCountInput.value) || 4;
      this.updatePlayerNameInputs(count);
    });

    // Démarrer la partie
    startGameBtn?.addEventListener('click', () => {
      const playerNames = this.collectPlayerNames();
      if (playerNames.length >= 3) {
        this.initializeGame(playerNames);
      } else {
        alert('Entrez au moins 3 prénoms pour commencer !');
      }
    });

    // Fermer le jeu
    closeBtn?.addEventListener('click', () => {
      this.container.innerHTML = '';
    });
  }

  /**
   * Met à jour les champs de saisie des prénoms
   */
  private updatePlayerNameInputs(count: number): void {
    const container = document.getElementById('player-names-container');
    if (!container) return;

    container.innerHTML = '';
    for (let i = 1; i <= count; i++) {
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'player-name-input';
      input.placeholder = `Joueur ${i}`;
      input.dataset.player = i.toString();
      container.appendChild(input);
    }
  }

  /**
   * Collecte les prénoms des joueurs
   */
  private collectPlayerNames(): string[] {
    const inputs = document.querySelectorAll('.player-name-input') as NodeListOf<HTMLInputElement>;
    const names: string[] = [];

    inputs.forEach(input => {
      const name = input.value.trim();
      if (name) {
        names.push(name);
      }
    });

    return names;
  }

  /**
   * Initialise une nouvelle partie
   */
  private initializeGame(players: string[]): void {
    this.gameState = {
      players,
      deck: getShuffledDeck(),
      currentCardIndex: 0,
      cardsPlayed: 0
    };

    this.saveGameState();
    this.renderGameScreen();
  }

  /**
   * Affiche l'écran de jeu
   */
  private renderGameScreen(): void {
    if (!this.gameState) return;

    const { currentCardIndex, deck, cardsPlayed, players } = this.gameState;

    // Vérifier si la partie est terminée
    if (currentCardIndex >= deck.length) {
      this.renderGameOver();
      return;
    }

    const currentCard = deck[currentCardIndex];
    const cardWithPlayers = getCardWithRandomPlayers(currentCard, players);

    // Couleur selon le type de carte
    const cardColors: { [key: string]: string } = {
      distribution: '#ff6b6b',
      question: '#4ecdc4',
      action: '#f39c12',
      vote: '#9b59b6',
      dare: '#e74c3c',
      misc: '#3498db'
    };

    const cardColor = cardColors[currentCard.type] || '#95a5a6';

    this.container.innerHTML = `
      <div class="piccola-modal-overlay">
        <div class="piccola-modal">
          <div class="piccola-header">
            <h2>🔥 Piccola HARDCORE 🔥</h2>
            <div class="game-progress">
              <span>Carte ${cardsPlayed + 1} / ${deck.length}</span>
              <span>•</span>
              <span>${players.length} joueurs</span>
            </div>
          </div>

          <div class="piccola-game">
            <div class="card-display" style="background: ${cardColor}">
              <div class="card-type">${this.getCardTypeLabel(currentCard.type)}</div>
              <div class="card-text">${cardWithPlayers.text}</div>
            </div>

            <div class="game-actions">
              <button id="next-card-btn" class="btn-primary">
                Carte suivante 👉
              </button>
            </div>

            <div class="game-options">
              <button id="save-quit-btn" class="btn-secondary">
                💾 Sauvegarder et quitter
              </button>
              <button id="stop-game-btn" class="btn-danger">
                🛑 Arrêter la partie
              </button>
            </div>
          </div>

          <button id="close-piccola-btn" class="btn-close">✕</button>
        </div>
      </div>
    `;

    this.attachGameListeners();
  }

  /**
   * Attache les listeners pour l'écran de jeu
   */
  private attachGameListeners(): void {
    const nextCardBtn = document.getElementById('next-card-btn');
    const saveQuitBtn = document.getElementById('save-quit-btn');
    const stopGameBtn = document.getElementById('stop-game-btn');
    const closeBtn = document.getElementById('close-piccola-btn');

    nextCardBtn?.addEventListener('click', () => {
      this.nextCard();
    });

    saveQuitBtn?.addEventListener('click', () => {
      this.saveGameState();
      alert('Partie sauvegardée ! 💾');
      this.container.innerHTML = '';
    });

    stopGameBtn?.addEventListener('click', () => {
      if (confirm('Voulez-vous vraiment arrêter la partie ? La progression sera perdue.')) {
        this.clearGameState();
        this.container.innerHTML = '';
      }
    });

    closeBtn?.addEventListener('click', () => {
      this.saveGameState();
      this.container.innerHTML = '';
    });
  }

  /**
   * Passe à la carte suivante
   */
  private nextCard(): void {
    if (!this.gameState) return;

    this.gameState.currentCardIndex++;
    this.gameState.cardsPlayed++;
    
    this.saveGameState();
    this.renderGameScreen();
  }

  /**
   * Affiche l'écran de fin de partie
   */
  private renderGameOver(): void {
    if (!this.gameState) return;

    this.container.innerHTML = `
      <div class="piccola-modal-overlay">
        <div class="piccola-modal">
          <div class="piccola-header">
            <h2>🎉 PARTIE TERMINÉE ! 🎉</h2>
          </div>

          <div class="game-over">
            <p class="game-over-text">
              Bravo ! Vous avez joué toutes les ${this.gameState.deck.length} cartes !
            </p>
            <p class="game-over-subtitle">
              J'espère que vous êtes encore en état... 😵
            </p>

            <div class="game-over-actions">
              <button id="new-game-btn" class="btn-primary">
                🔄 Nouvelle partie
              </button>
              <button id="close-game-btn" class="btn-secondary">
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.attachGameOverListeners();
  }

  /**
   * Attache les listeners pour l'écran de fin
   */
  private attachGameOverListeners(): void {
    const newGameBtn = document.getElementById('new-game-btn');
    const closeGameBtn = document.getElementById('close-game-btn');

    newGameBtn?.addEventListener('click', () => {
      this.clearGameState();
      this.renderPlayerSetup();
    });

    closeGameBtn?.addEventListener('click', () => {
      this.clearGameState();
      this.container.innerHTML = '';
    });
  }

  /**
   * Retourne le label du type de carte
   */
  private getCardTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      distribution: '🍺 DISTRIBUTION',
      question: '❓ QUESTION',
      action: '⚡ ACTION',
      vote: '🗳️ VOTE',
      dare: '🔥 DÉFI',
      misc: '🎲 SPÉCIAL'
    };
    return labels[type] || '🎴 CARTE';
  }

  /**
   * Sauvegarde l'état du jeu
   */
  private saveGameState(): void {
    if (this.gameState) {
      localStorage.setItem(this.storageKey, JSON.stringify(this.gameState));
    }
  }

  /**
   * Charge l'état du jeu sauvegardé
   */
  private loadGameState(): GameState | null {
    const saved = localStorage.getItem(this.storageKey);
    return saved ? JSON.parse(saved) : null;
  }

  /**
   * Supprime l'état du jeu sauvegardé
   */
  private clearGameState(): void {
    localStorage.removeItem(this.storageKey);
    this.gameState = null;
  }
}
