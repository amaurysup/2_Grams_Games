import { getRandomWord } from '../data/undercoverWords';
import { getPartyData } from '../pages/PartyModePage';
import { statsService } from '../services/StatsService';
import { achievementsService } from '../services/AchievementsService';
import { QuitGameButton } from '../components/QuitGameButton';

interface Player {
  name: string;
  role: 'word' | 'spy';
  hasRevealed: boolean;
  isEliminated: boolean;
}

interface GameState {
  secretWord: string;
  players: Player[];
  currentPlayerIndex: number;
  phase: 'setup' | 'names' | 'reveal' | 'playing' | 'elimination' | 'finished';
  currentRound: number;
}

export class UndercoverGame {
  private overlay: HTMLElement;
  private modal: HTMLElement;
  private gameState: GameState;
  private gameName: string;
  private userId: string;

  constructor(gameName: string, userId: string) {
    this.gameName = gameName;
    this.userId = userId;
    
    // Créer l'overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'game-modal-overlay';
    
    // Créer le modal
    this.modal = document.createElement('div');
    this.modal.className = 'game-modal';
    
    // Ajouter le modal dans l'overlay
    this.overlay.appendChild(this.modal);
    
    this.gameState = {
      secretWord: '',
      players: [],
      currentPlayerIndex: 0,
      phase: 'setup',
      currentRound: 1
    };
  }

  open() {
    document.body.appendChild(this.overlay);
    this.renderPlayerSetup();
  }

  close() {
    // Terminer la session si le jeu est en cours
    if (this.gameState.phase === 'playing' || this.gameState.phase === 'reveal' || this.gameState.phase === 'elimination') {
      const session = statsService.endGameSession(false); // Partie non complétée
      if (session) {
        achievementsService.checkAchievements();
      }
    }
    
    this.saveGameState();
    this.overlay.remove();
  }

  /**
   * Phase 1: Configuration du nombre de joueurs
   */
  private renderPlayerSetup() {
    this.gameState.phase = 'setup';
    
    // Vérifier si on vient du Party Mode
    const partyData = getPartyData();
    const defaultCount = partyData?.playerCount && partyData.playerCount >= 4 ? partyData.playerCount : 4;
    
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
            <div class="player-count-display" id="player-count-display">${defaultCount}</div>
            <button class="btn-count-change" id="btn-increase">+</button>
          </div>

          <button class="btn-primary btn-next-step" id="btn-start-names">
            Suivant →
          </button>
        </div>
      </div>
    `;

    this.attachSetupListeners(defaultCount);
  }

  private attachSetupListeners(initialCount: number = 4) {
    const closeBtn = this.modal.querySelector('.modal-close');
    closeBtn?.addEventListener('click', () => this.close());

    let playerCount = initialCount;
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
        hasRevealed: false,
        isEliminated: false
      });
    }
    
    // Réinitialiser le compteur de tours
    this.gameState.currentRound = 1;
  }

  /**
   * Phase 2: Saisie des pseudos
   */
  private renderPlayerNames() {
    this.gameState.phase = 'names';
    
    // Vérifier si on vient du Party Mode pour pré-remplir les noms
    const partyData = getPartyData();
    const defaultNames = partyData?.playerNames || [];
    
    const playerInputs = this.gameState.players.map((_, index) => {
      const defaultName = defaultNames[index] || '';
      return `
        <div class="form-group">
          <label for="player-name-${index}">Joueur ${index + 1}</label>
          <input 
            type="text" 
            id="player-name-${index}" 
            class="player-name-input"
            placeholder="Pseudo du joueur ${index + 1}"
            value="${defaultName}"
            required
          />
        </div>
      `;
    }).join('');

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
        console.log(`Joueur ${index} nommé: ${player.name}`);
      } else {
        allNamesFilled = false;
      }
    });

    if (!allNamesFilled) {
      alert('Veuillez remplir tous les pseudos !');
      return;
    }

    console.log('Tous les joueurs:', this.gameState.players.map(p => p.name));
    this.gameState.currentPlayerIndex = 0;
    
    // Démarrer le tracking de la session
    statsService.startGameSession(this.gameName, this.gameName, this.gameState.players.length);
    
    this.renderRevealPhase();
  }

  /**
   * Phase 3: Révélation des cartes pour chaque joueur
   */
  private renderRevealPhase() {
    this.gameState.phase = 'reveal';
    const currentPlayer = this.gameState.players[this.gameState.currentPlayerIndex];
    const isLastPlayer = this.gameState.currentPlayerIndex === this.gameState.players.length - 1;
    
    // Vérifier que le joueur a un nom
    const playerName = currentPlayer.name || `Joueur ${this.gameState.currentPlayerIndex + 1}`;
    
    console.log('Affichage révélation pour:', playerName, '- Index:', this.gameState.currentPlayerIndex);
    console.log('Joueur complet:', currentPlayer);

    this.modal.innerHTML = `
      <div class="game-modal-content undercover-reveal">
        <button class="modal-close" aria-label="Fermer">✕</button>
        
        <div class="undercover-header">
          <h2>🕵️ ${this.gameName}</h2>
          <p class="undercover-subtitle">Révélation des identités</p>
        </div>

        <div class="reveal-content">
          <div class="current-player-info">
            <h3>Tour de <span class="player-name-highlight">${playerName}</span></h3>
            <p class="reveal-instruction">
              👀 ${playerName}, prépare-toi à voir ta carte...<br>
              Les autres, ne regardez pas !
            </p>
          </div>

          <div class="card-reveal-container" id="card-container">
            <button class="btn-reveal" id="btn-reveal">
              <span class="reveal-icon">🃏</span>
              Révéler ma carte
            </button>
          </div>
        </div>
      </div>
    `;

    const closeBtn = this.modal.querySelector('.modal-close');
    closeBtn?.addEventListener('click', () => this.close());

    const revealBtn = this.modal.querySelector('#btn-reveal');
    revealBtn?.addEventListener('click', () => this.revealCard(isLastPlayer));
  }

  private revealCard(isLastPlayer: boolean) {
    const currentPlayer = this.gameState.players[this.gameState.currentPlayerIndex];
    currentPlayer.hasRevealed = true;
    
    console.log('Révélation pour:', currentPlayer.name, 'Role:', currentPlayer.role);

    const cardContainer = this.modal.querySelector('#card-container');

    if (cardContainer) {
      let cardHTML = '';
      
      if (currentPlayer.role === 'spy') {
        cardHTML = `
          <div class="card card-spy">
            <div class="card-content">
              <div class="card-icon">🕵️</div>
              <h3 class="card-title">SPY</h3>
              <p class="card-message">Tu es l'espion !<br>Découvre le mot secret sans te faire démasquer...</p>
            </div>
          </div>
        `;
      } else {
        cardHTML = `
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
      
      cardHTML += `
        <button class="btn-next-player" id="btn-next-player">
          ${isLastPlayer ? '🎮 Commencer la partie' : '➡️ Joueur suivant'}
        </button>
      `;
      
      cardContainer.innerHTML = cardHTML;
      console.log('Carte révélée, bouton ajouté');
      
      const nextBtn = cardContainer.querySelector('#btn-next-player') as HTMLButtonElement;
      if (nextBtn) {
        console.log('Bouton trouvé, ajout du listener');
        nextBtn.addEventListener('click', () => {
          console.log('Bouton cliqué !');
          this.handleNextPlayer();
        });
      } else {
        console.error('Bouton #btn-next-player non trouvé !');
      }
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
   * Phase 4: Partie en cours - Écran de jeu avec élimination
   */
  private renderPlayingPhase() {
    this.gameState.phase = 'playing';
    
    // Compter les joueurs encore en jeu
    const alivePlayers = this.gameState.players.filter(p => !p.isEliminated);

    this.modal.innerHTML = `
      <div class="game-modal-content undercover-playing">
        <button class="modal-close" aria-label="Fermer">✕</button>
        
        <div class="undercover-header">
          <h2>🕵️ ${this.gameName}</h2>
          <p class="undercover-subtitle">Tour ${this.gameState.currentRound}</p>
        </div>

        <div class="playing-content">
          <div class="round-info">
            <div class="round-badge">🔄 Tour ${this.gameState.currentRound}</div>
            <p class="players-remaining">
              <span class="alive-count">${alivePlayers.length}</span> joueurs encore en jeu
            </p>
          </div>

          <div class="instructions-box">
            <h3>🎯 Ce tour</h3>
            <ol class="game-rules">
              <li>Chacun votre tour, donnez un indice lié à votre mot</li>
              <li>Discutez et débattez entre vous</li>
              <li>Votez pour éliminer un joueur suspect</li>
            </ol>
          </div>

          <div class="players-list-box">
            <h3>👥 Joueurs en jeu</h3>
            <ul class="players-list">
              ${alivePlayers.map(p => `
                <li class="player-item">
                  <span class="player-icon">🎭</span>
                  <span class="player-display-name">${p.name}</span>
                </li>
              `).join('')}
            </ul>
            ${this.gameState.players.filter(p => p.isEliminated).length > 0 ? `
              <h4 class="eliminated-title">💀 Éliminés</h4>
              <ul class="players-list eliminated-list">
                ${this.gameState.players.filter(p => p.isEliminated).map(p => `
                  <li class="player-item eliminated">
                    <span class="player-icon">💀</span>
                    <span class="player-display-name">${p.name}</span>
                    <span class="role-reveal ${p.role === 'spy' ? 'spy-role' : 'civil-role'}">${p.role === 'spy' ? '🕵️ Spy' : '👤 Civil'}</span>
                  </li>
                `).join('')}
              </ul>
            ` : ''}
          </div>

          <div class="game-actions">
            <button class="btn-primary btn-eliminate" id="btn-start-elimination">
              ⚔️ Passer au vote d'élimination
            </button>
            <button class="btn-secondary btn-spy-wins" id="btn-spy-wins">
              🕵️ Un spy a deviné le mot !
            </button>
          </div>
        </div>
      </div>
    `;

    const closeBtn = this.modal.querySelector('.modal-close');
    closeBtn?.addEventListener('click', () => this.close());

    const eliminateBtn = this.modal.querySelector('#btn-start-elimination');
    eliminateBtn?.addEventListener('click', () => this.renderEliminationPhase());

    const spyWinsBtn = this.modal.querySelector('#btn-spy-wins');
    spyWinsBtn?.addEventListener('click', () => this.renderSpyVictory());
  }

  /**
   * Phase 5: Sélection du joueur à éliminer
   */
  private renderEliminationPhase() {
    this.gameState.phase = 'elimination';
    
    const alivePlayers = this.gameState.players.filter(p => !p.isEliminated);

    this.modal.innerHTML = `
      <div class="game-modal-content undercover-elimination">
        <button class="modal-close" aria-label="Fermer">✕</button>
        
        <div class="undercover-header">
          <h2>🕵️ ${this.gameName}</h2>
          <p class="undercover-subtitle">⚔️ Vote d'élimination - Tour ${this.gameState.currentRound}</p>
        </div>

        <div class="elimination-content">
          <div class="elimination-instruction">
            <span class="elimination-icon">🗳️</span>
            <h3>Qui a été éliminé ?</h3>
            <p>Sélectionnez le joueur que le groupe a décidé d'éliminer</p>
          </div>

          <div class="elimination-players">
            ${alivePlayers.map((p) => {
              const originalIndex = this.gameState.players.findIndex(pl => pl.name === p.name);
              return `
                <button class="btn-eliminate-player" data-player-index="${originalIndex}">
                  <span class="player-icon">🎭</span>
                  <span class="player-name">${p.name}</span>
                </button>
              `;
            }).join('')}
          </div>

          <button class="btn-secondary btn-cancel-elimination" id="btn-cancel">
            ← Retour au jeu
          </button>
        </div>
      </div>
    `;

    const closeBtn = this.modal.querySelector('.modal-close');
    closeBtn?.addEventListener('click', () => this.close());

    const cancelBtn = this.modal.querySelector('#btn-cancel');
    cancelBtn?.addEventListener('click', () => this.renderPlayingPhase());

    const playerButtons = this.modal.querySelectorAll('.btn-eliminate-player');
    playerButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLButtonElement;
        const playerIndex = parseInt(target.dataset.playerIndex || '0');
        this.eliminatePlayer(playerIndex);
      });
    });
  }

  /**
   * Élimine un joueur et vérifie la condition de victoire
   */
  private eliminatePlayer(playerIndex: number) {
    const player = this.gameState.players[playerIndex];
    player.isEliminated = true;

    // Vérifier les conditions de victoire
    const aliveSpies = this.gameState.players.filter(p => !p.isEliminated && p.role === 'spy');
    const aliveCivils = this.gameState.players.filter(p => !p.isEliminated && p.role === 'word');

    if (aliveSpies.length === 0) {
      // Tous les spies sont éliminés - Les civils gagnent !
      this.renderCivilVictory();
    } else if (aliveSpies.length >= aliveCivils.length) {
      // Les spies sont en majorité ou égalité - Les spies gagnent !
      this.renderSpyVictory();
    } else {
      // La partie continue
      this.renderEliminationResult(player);
    }
  }

  /**
   * Affiche le résultat de l'élimination
   */
  private renderEliminationResult(eliminatedPlayer: Player) {
    const isSpy = eliminatedPlayer.role === 'spy';
    
    this.modal.innerHTML = `
      <div class="game-modal-content undercover-result">
        <button class="modal-close" aria-label="Fermer">✕</button>
        
        <div class="undercover-header">
          <h2>🕵️ ${this.gameName}</h2>
          <p class="undercover-subtitle">Résultat du vote</p>
        </div>

        <div class="result-content">
          <div class="eliminated-reveal ${isSpy ? 'spy-eliminated' : 'civil-eliminated'}">
            <div class="eliminated-icon">${isSpy ? '🕵️' : '👤'}</div>
            <h3 class="eliminated-name">${eliminatedPlayer.name}</h3>
            <p class="eliminated-role">était ${isSpy ? 'un SPY !' : 'un CIVIL...'}</p>
          </div>

          ${isSpy ? `
            <div class="result-message good-news">
              <span>✅</span> Bien joué ! Vous avez éliminé un espion !
            </div>
          ` : `
            <div class="result-message bad-news">
              <span>❌</span> Dommage... C'était un civil innocent.
            </div>
          `}

          <div class="remaining-info">
            <p>🎭 Joueurs restants : ${this.gameState.players.filter(p => !p.isEliminated).length}</p>
            <p>🕵️ Espions restants : ???</p>
          </div>

          <button class="btn-primary btn-next-round" id="btn-next-round">
            ➡️ Tour suivant
          </button>
        </div>
      </div>
    `;

    const closeBtn = this.modal.querySelector('.modal-close');
    closeBtn?.addEventListener('click', () => this.close());

    const nextRoundBtn = this.modal.querySelector('#btn-next-round');
    nextRoundBtn?.addEventListener('click', () => {
      this.gameState.currentRound++;
      this.renderPlayingPhase();
    });
  }

  /**
   * Écran de victoire des civils
   */
  private renderCivilVictory() {
    this.gameState.phase = 'finished';
    
    // Terminer la session et mettre à jour les stats
    const session = statsService.endGameSession(true);
    if (session) {
      achievementsService.checkAchievements();
    }
    
    const spies = this.gameState.players.filter(p => p.role === 'spy');

    this.modal.innerHTML = `
      <div class="game-modal-content undercover-victory civil-victory">
        <button class="modal-close" aria-label="Fermer">✕</button>
        
        <div class="victory-content">
          <div class="victory-icon">🎉</div>
          <h2 class="victory-title">Victoire des Civils !</h2>
          <p class="victory-subtitle">Tous les espions ont été démasqués !</p>

          <div class="game-stats">
            <div class="stat-item">
              <span class="stat-icon">🔄</span>
              <span class="stat-value">${this.gameState.currentRound}</span>
              <span class="stat-label">Tours joués</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">🕵️</span>
              <span class="stat-value">${spies.length}</span>
              <span class="stat-label">Espions éliminés</span>
            </div>
          </div>

          <div class="spies-reveal">
            <h4>Les espions étaient :</h4>
            <ul class="spy-list">
              ${spies.map(s => `<li>🕵️ ${s.name}</li>`).join('')}
            </ul>
          </div>

          <div class="secret-word-reveal">
            <p>Le mot secret était :</p>
            <div class="word-reveal">${this.gameState.secretWord}</div>
          </div>

          <div class="game-actions">
            <button class="btn-primary btn-new-game" id="btn-new-game">
              🔄 Nouvelle partie
            </button>
            ${QuitGameButton.render()}
          </div>
        </div>
      </div>
    `;

    this.attachVictoryListeners();
  }

  /**
   * Écran de victoire des espions
   */
  private renderSpyVictory() {
    this.gameState.phase = 'finished';
    
    // Terminer la session et mettre à jour les stats
    const session = statsService.endGameSession(true);
    if (session) {
      achievementsService.checkAchievements();
    }
    
    const spies = this.gameState.players.filter(p => p.role === 'spy');
    const aliveSpies = spies.filter(p => !p.isEliminated);

    this.modal.innerHTML = `
      <div class="game-modal-content undercover-victory spy-victory">
        <button class="modal-close" aria-label="Fermer">✕</button>
        
        <div class="victory-content">
          <div class="victory-icon">🕵️</div>
          <h2 class="victory-title">Victoire des Espions !</h2>
          <p class="victory-subtitle">${aliveSpies.length > 0 ? 'Les espions ont survécu et pris le contrôle !' : 'Un espion a deviné le mot secret !'}</p>

          <div class="game-stats">
            <div class="stat-item">
              <span class="stat-icon">🔄</span>
              <span class="stat-value">${this.gameState.currentRound}</span>
              <span class="stat-label">Tours joués</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">🕵️</span>
              <span class="stat-value">${aliveSpies.length}/${spies.length}</span>
              <span class="stat-label">Espions survivants</span>
            </div>
          </div>

          <div class="spies-reveal">
            <h4>Les espions étaient :</h4>
            <ul class="spy-list">
              ${spies.map(s => `<li>${s.isEliminated ? '💀' : '🕵️'} ${s.name}</li>`).join('')}
            </ul>
          </div>

          <div class="secret-word-reveal">
            <p>Le mot secret était :</p>
            <div class="word-reveal">${this.gameState.secretWord}</div>
          </div>

          <div class="game-actions">
            <button class="btn-primary btn-new-game" id="btn-new-game">
              🔄 Nouvelle partie
            </button>
            ${QuitGameButton.render()}
          </div>
        </div>
      </div>
    `;

    this.attachVictoryListeners();
  }

  /**
   * Attache les listeners pour les écrans de victoire
   */
  private attachVictoryListeners() {
    const closeBtn = this.modal.querySelector('.modal-close');
    closeBtn?.addEventListener('click', () => this.close());

    const newGameBtn = this.modal.querySelector('#btn-new-game');
    newGameBtn?.addEventListener('click', () => this.renderPlayerSetup());

    QuitGameButton.attach(() => this.close());
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
}
