import { getRandomWord } from '../data/undercoverWords';

interface Player {
  name: string;
  role: 'word' | 'spy';
  hasRevealed: boolean;
}

interface GameState {
  secretWord: string;
  players: Player[];
  currentPlayerIndex: number;
  phase: 'setup' | 'names' | 'reveal' | 'playing' | 'finished';
}

export class UndercoverGame {
  private modal: HTMLElement;
  private gameState: GameState;
  private gameName: string;
  private userId: string;

  constructor(gameName: string, userId: string) {
    this.gameName = gameName;
    this.userId = userId;
    this.modal = document.createElement('div');
    this.modal.className = 'game-modal';
    
    this.gameState = {
      secretWord: '',
      players: [],
      currentPlayerIndex: 0,
      phase: 'setup'
    };
  }

  open() {
    document.body.appendChild(this.modal);
    this.renderPlayerSetup();
  }

  close() {
    this.saveGameState();
    this.modal.remove();
  }

  /**
   * Phase 1: Configuration du nombre de joueurs
   */
  private renderPlayerSetup() {
    this.gameState.phase = 'setup';
    this.modal.innerHTML = `
      <div class="game-modal-content undercover-setup">
        <button class="modal-close" aria-label="Fermer">✕</button>
        
        <div class="undercover-header">
          <h2>🕵️ ${this.gameName}</h2>
          <p class="undercover-subtitle">Trouve l'espion parmi vous...</p>
        </div>

        <div class="setup-content">
          <div class="setup-instruction">
            <span class="setup-icon">👥</span>
            <h3>Combien de joueurs ?</h3>
            <p>Entre 4 et 10 joueurs recommandés</p>
          </div>

          <div class="player-count-selector">
            <button class="btn-count-change" id="btn-decrease">-</button>
            <div class="player-count-display" id="player-count-display">4</div>
            <button class="btn-count-change" id="btn-increase">+</button>
          </div>

          <button class="btn-primary btn-next-step" id="btn-start-names">
            Suivant →
          </button>
        </div>
      </div>
    `;

    this.attachSetupListeners();
  }

  private attachSetupListeners() {
    const closeBtn = this.modal.querySelector('.modal-close');
    closeBtn?.addEventListener('click', () => this.close());

    let playerCount = 4;
    const display = this.modal.querySelector('#player-count-display');
    
    const decreaseBtn = this.modal.querySelector('#btn-decrease');
    decreaseBtn?.addEventListener('click', () => {
      if (playerCount > 4) {
        playerCount--;
        if (display) display.textContent = playerCount.toString();
      }
    });

    const increaseBtn = this.modal.querySelector('#btn-increase');
    increaseBtn?.addEventListener('click', () => {
      if (playerCount < 10) {
        playerCount++;
        if (display) display.textContent = playerCount.toString();
      }
    });

    const startBtn = this.modal.querySelector('#btn-start-names');
    startBtn?.addEventListener('click', () => {
      this.initializePlayers(playerCount);
      this.renderPlayerNames();
    });
  }

  /**
   * Initialise les joueurs avec des rôles aléatoires
   */
  private initializePlayers(count: number) {
    this.gameState.secretWord = getRandomWord();
    this.gameState.players = [];

    // Calculer le nombre d'espions (1/3 des joueurs, minimum 1)
    const spyCount = Math.max(1, Math.floor(count / 3));
    
    // Créer la liste des rôles
    const roles: Array<'word' | 'spy'> = [];
    for (let i = 0; i < spyCount; i++) {
      roles.push('spy');
    }
    for (let i = 0; i < count - spyCount; i++) {
      roles.push('word');
    }

    // Mélanger les rôles (Fisher-Yates shuffle)
    for (let i = roles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [roles[i], roles[j]] = [roles[j], roles[i]];
    }

    // Créer les joueurs avec les rôles mélangés
    for (let i = 0; i < count; i++) {
      this.gameState.players.push({
        name: '',
        role: roles[i],
        hasRevealed: false
      });
    }
  }

  /**
   * Phase 2: Saisie des pseudos
   */
  private renderPlayerNames() {
    this.gameState.phase = 'names';
    const playerInputs = this.gameState.players.map((_, index) => `
      <div class="form-group">
        <label for="player-name-${index}">Joueur ${index + 1}</label>
        <input 
          type="text" 
          id="player-name-${index}" 
          class="player-name-input"
          placeholder="Pseudo du joueur ${index + 1}"
          required
        />
      </div>
    `).join('');

    this.modal.innerHTML = `
      <div class="game-modal-content undercover-names">
        <button class="modal-close" aria-label="Fermer">✕</button>
        
        <div class="undercover-header">
          <h2>🕵️ ${this.gameName}</h2>
          <p class="undercover-subtitle">Entrez les pseudos des joueurs</p>
        </div>

        <div class="names-form">
          ${playerInputs}
          <button class="btn-primary btn-start-game" id="btn-start-reveal">
            Commencer le jeu 🎲
          </button>
        </div>
      </div>
    `;

    const closeBtn = this.modal.querySelector('.modal-close');
    closeBtn?.addEventListener('click', () => this.close());

    const startBtn = this.modal.querySelector('#btn-start-reveal');
    startBtn?.addEventListener('click', () => this.handleStartGame());
  }

  private handleStartGame() {
    // Récupérer les noms des joueurs
    let allNamesFilled = true;
    this.gameState.players.forEach((player, index) => {
      const input = this.modal.querySelector(`#player-name-${index}`) as HTMLInputElement;
      if (input && input.value.trim()) {
        player.name = input.value.trim();
      } else {
        allNamesFilled = false;
      }
    });

    if (!allNamesFilled) {
      alert('Veuillez remplir tous les pseudos !');
      return;
    }

    this.gameState.currentPlayerIndex = 0;
    this.renderRevealPhase();
  }

  /**
   * Phase 3: Révélation des cartes pour chaque joueur
   */
  private renderRevealPhase() {
    this.gameState.phase = 'reveal';
    const currentPlayer = this.gameState.players[this.gameState.currentPlayerIndex];
    const isLastPlayer = this.gameState.currentPlayerIndex === this.gameState.players.length - 1;

    this.modal.innerHTML = `
      <div class="game-modal-content undercover-reveal">
        <button class="modal-close" aria-label="Fermer">✕</button>
        
        <div class="undercover-header">
          <h2>🕵️ ${this.gameName}</h2>
          <p class="undercover-subtitle">Révélation des identités</p>
        </div>

        <div class="reveal-content">
          <div class="current-player-info">
            <h3>Tour de <span class="player-name-highlight">${currentPlayer.name}</span></h3>
            <p class="reveal-instruction">
              👀 ${currentPlayer.name}, prépare-toi à voir ta carte...<br>
              Les autres, ne regardez pas !
            </p>
          </div>

          <div class="card-reveal-container" id="card-container">
            <button class="btn-reveal" id="btn-reveal">
              <span class="reveal-icon">🃏</span>
              Révéler ma carte
            </button>
          </div>

          <div class="reveal-actions" id="reveal-actions" style="display: none;">
            <button class="btn-secondary btn-next-player" id="btn-next-player">
              ${isLastPlayer ? 'Commencer la partie 🎮' : 'Joueur suivant →'}
            </button>
          </div>
        </div>
      </div>
    `;

    const closeBtn = this.modal.querySelector('.modal-close');
    closeBtn?.addEventListener('click', () => this.close());

    const revealBtn = this.modal.querySelector('#btn-reveal');
    revealBtn?.addEventListener('click', () => this.revealCard());

    const nextBtn = this.modal.querySelector('#btn-next-player');
    nextBtn?.addEventListener('click', () => this.handleNextPlayer());
  }

  private revealCard() {
    const currentPlayer = this.gameState.players[this.gameState.currentPlayerIndex];
    currentPlayer.hasRevealed = true;

    const cardContainer = this.modal.querySelector('#card-container');
    const revealActions = this.modal.querySelector('#reveal-actions');

    if (cardContainer) {
      if (currentPlayer.role === 'spy') {
        cardContainer.innerHTML = `
          <div class="card card-spy">
            <div class="card-content">
              <div class="card-icon">🕵️</div>
              <h3 class="card-title">SPY</h3>
              <p class="card-message">Tu es l'espion !<br>Découvre le mot secret sans te faire démasquer...</p>
            </div>
          </div>
        `;
      } else {
        cardContainer.innerHTML = `
          <div class="card card-word">
            <div class="card-content">
              <div class="card-icon">💬</div>
              <h3 class="card-title">TON MOT</h3>
              <p class="card-secret-word">${this.gameState.secretWord}</p>
              <p class="card-message">Trouve les espions parmi vous !</p>
            </div>
          </div>
        `;
      }
    }

    if (revealActions) {
      (revealActions as HTMLElement).style.display = 'block';
    }
  }

  private handleNextPlayer() {
    if (this.gameState.currentPlayerIndex < this.gameState.players.length - 1) {
      this.gameState.currentPlayerIndex++;
      this.renderRevealPhase();
    } else {
      this.renderPlayingPhase();
    }
  }

  /**
   * Phase 4: Partie en cours
   */
  private renderPlayingPhase() {
    this.gameState.phase = 'playing';

    this.modal.innerHTML = `
      <div class="game-modal-content undercover-playing">
        <button class="modal-close" aria-label="Fermer">✕</button>
        
        <div class="undercover-header">
          <h2>🕵️ ${this.gameName}</h2>
          <p class="undercover-subtitle">La partie est lancée !</p>
        </div>

        <div class="playing-content">
          <div class="instructions-box">
            <h3>🎯 Comment jouer ?</h3>
            <ol class="game-rules">
              <li>Chacun votre tour, donnez un indice lié à votre mot (ou bluffez si vous êtes espion)</li>
              <li>Discutez et essayez de deviner qui sont les espions</li>
              <li>Votez pour éliminer un joueur suspect</li>
              <li>Les civils gagnent s'ils trouvent tous les espions</li>
              <li>Les espions gagnent s'ils devinent le mot secret ou survivent</li>
            </ol>
          </div>

          <div class="players-list-box">
            <h3>👥 Liste des joueurs</h3>
            <ul class="players-list">
              ${this.gameState.players.map(p => `
                <li class="player-item">
                  <span class="player-icon">🎭</span>
                  <span class="player-display-name">${p.name}</span>
                </li>
              `).join('')}
            </ul>
          </div>

          <div class="game-actions">
            <button class="btn-primary btn-new-game" id="btn-new-game">
              🔄 Nouvelle partie
            </button>
            <button class="btn-secondary btn-quit" id="btn-quit-game">
              🚪 Quitter
            </button>
          </div>
        </div>
      </div>
    `;

    const closeBtn = this.modal.querySelector('.modal-close');
    closeBtn?.addEventListener('click', () => this.close());

    const newGameBtn = this.modal.querySelector('#btn-new-game');
    newGameBtn?.addEventListener('click', () => {
      if (confirm('Commencer une nouvelle partie ?')) {
        this.renderPlayerSetup();
      }
    });

    const quitBtn = this.modal.querySelector('#btn-quit-game');
    quitBtn?.addEventListener('click', () => this.close());
  }

  /**
   * Sauvegarde de l'état du jeu
   */
  private saveGameState() {
    const key = `undercoverGame_${this.userId}`;
    try {
      localStorage.setItem(key, JSON.stringify(this.gameState));
      console.log('🕵️ Partie sauvegardée');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  }

  /**
   * Chargement de l'état du jeu
   */
  private loadGameState(): boolean {
    const key = `undercoverGame_${this.userId}`;
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        this.gameState = JSON.parse(saved);
        console.log('🕵️ Partie restaurée');
        return true;
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    }
    return false;
  }
}
