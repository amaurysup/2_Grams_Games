/**
 * "Je n'ai jamais" (Never Have I Ever) Game
 * A card-based drinking game with Party Mode integration
 */

import { Card } from '../components/Card';
import { NEVER_HAVE_I_EVER_QUESTIONS, NeverHaveIEverQuestion } from '../data/neverHaveIEverQuestions';
import { getPartyData } from '../pages/PartyModePage';
import { statsService } from '../services/StatsService';
import { achievementsService } from '../services/AchievementsService';
import { QuitGameButton } from '../components/QuitGameButton';

// Storage key for Party Mode players
const PARTY_PLAYERS_KEY = 'current_party_players';

interface Player {
  name: string;
  drinkCount: number;
}

interface GameState {
  players: Player[];
  currentQuestionIndex: number;
  questions: NeverHaveIEverQuestion[];
}

export class NeverHaveIEverGame {
  private container: HTMLElement;
  private gameState: GameState | null = null;
  private storageKey: string = '';
  private stylesInjected: boolean = false;
  private partyModeActive: boolean = false;
  private prefilledPlayers: string[] | null = null;

  constructor(container: HTMLElement, players?: string[]) {
    this.container = container;
    
    // Check if players were passed via constructor
    if (players && players.length > 0) {
      this.prefilledPlayers = players;
      this.partyModeActive = true;
    }
  }

  /**
   * Start the game
   */
  public start(userId: string): void {
    this.storageKey = `neverHaveIEver_${userId}`;
    this.injectStyles();
    
    // Check for Party Mode data if not already set via constructor
    if (!this.partyModeActive) {
      this.checkPartyMode();
    }
    
    // If Party Mode is active, skip setup and start immediately
    if (this.partyModeActive && this.prefilledPlayers) {
      this.initializeGame(this.prefilledPlayers);
    } else {
      // Check for saved game
      const savedState = this.loadGameState();
      if (savedState) {
        this.gameState = savedState;
        this.renderGameScreen();
      } else {
        this.renderPlayerCountSetup();
      }
    }
  }

  /**
   * Check if Party Mode data exists
   */
  private checkPartyMode(): void {
    // Check localStorage for Party Mode players
    const partyPlayersStr = localStorage.getItem(PARTY_PLAYERS_KEY);
    if (partyPlayersStr) {
      try {
        const partyPlayers = JSON.parse(partyPlayersStr);
        if (Array.isArray(partyPlayers) && partyPlayers.length > 0) {
          this.prefilledPlayers = partyPlayers;
          this.partyModeActive = true;
          return;
        }
      } catch {
        // Invalid data, continue with standard mode
      }
    }
    
    // Also check sessionStorage via getPartyData
    const partyData = getPartyData();
    if (partyData && partyData.playerNames && partyData.playerNames.length > 0) {
      this.prefilledPlayers = partyData.playerNames;
      this.partyModeActive = true;
    }
  }

  /**
   * Inject card styles into the page
   */
  private injectStyles(): void {
    if (this.stylesInjected) return;
    
    const styleId = 'never-have-i-ever-styles';
    if (document.getElementById(styleId)) {
      this.stylesInjected = true;
      return;
    }

    const styleEl = document.createElement('style');
    styleEl.id = styleId;
    styleEl.textContent = Card.getStyles() + this.getGameStyles();
    document.head.appendChild(styleEl);
    this.stylesInjected = true;
  }

  /**
   * Get game-specific styles
   */
  private getGameStyles(): string {
    return `
      .nhie-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.85);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2000;
        animation: fadeIn 0.3s ease;
      }

      .nhie-modal {
        background: linear-gradient(145deg, #1a1a2e 0%, #16213e 100%);
        border-radius: 30px;
        padding: 2rem;
        max-width: 500px;
        width: 95%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
        animation: slideUp 0.3s ease;
        position: relative;
      }

      .nhie-header {
        text-align: center;
        margin-bottom: 2rem;
      }

      .nhie-header h2 {
        font-size: 2rem;
        color: #fff;
        margin: 0 0 0.5rem 0;
      }

      .nhie-header p {
        color: #aaa;
        margin: 0;
      }

      .nhie-close-btn {
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: none;
        border: none;
        font-size: 2rem;
        color: #fff;
        cursor: pointer;
        opacity: 0.7;
        transition: opacity 0.2s, transform 0.2s;
      }

      .nhie-close-btn:hover {
        opacity: 1;
        transform: scale(1.1);
      }

      /* Setup screens */
      .nhie-setup {
        text-align: center;
      }

      .nhie-setup-section {
        margin-bottom: 2rem;
      }

      .nhie-setup-section label {
        display: block;
        color: #fff;
        font-size: 1.1rem;
        margin-bottom: 0.5rem;
      }

      .nhie-setup-input {
        width: 100%;
        padding: 1rem;
        font-size: 1.2rem;
        border: 2px solid rgba(255, 255, 255, 0.2);
        border-radius: 15px;
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
        text-align: center;
        outline: none;
        transition: border-color 0.3s;
      }

      .nhie-setup-input:focus {
        border-color: var(--pink, #ff6b9d);
      }

      .nhie-player-inputs {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-top: 1rem;
      }

      .nhie-player-input {
        padding: 0.8rem 1rem;
        font-size: 1rem;
        border: 2px solid rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
        outline: none;
        transition: border-color 0.3s;
      }

      .nhie-player-input:focus {
        border-color: var(--turquoise, #4ecdc4);
      }

      .nhie-player-input::placeholder {
        color: rgba(255, 255, 255, 0.5);
      }

      .nhie-btn {
        display: inline-block;
        padding: 1rem 2rem;
        font-size: 1.1rem;
        font-weight: 700;
        border: none;
        border-radius: 25px;
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
        margin-top: 1rem;
      }

      .nhie-btn:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      }

      .nhie-btn-primary {
        background: linear-gradient(135deg, var(--pink, #ff6b9d), #ff8fab);
        color: white;
      }

      .nhie-btn-secondary {
        background: linear-gradient(135deg, var(--turquoise, #4ecdc4), #52d3cb);
        color: white;
      }

      /* Game screen */
      .nhie-game {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.5rem;
      }

      .nhie-turn-indicator {
        background: rgba(255, 255, 255, 0.1);
        padding: 0.8rem 1.5rem;
        border-radius: 20px;
        color: #fff;
        font-size: 1.1rem;
      }

      .nhie-turn-indicator strong {
        color: var(--yellow, #ffe66d);
      }

      .nhie-deck-container {
        position: relative;
        min-height: 420px;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
      }

      .nhie-deck-stack {
        position: absolute;
        width: 280px;
        height: 400px;
      }

      .nhie-deck-card {
        position: absolute;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, var(--dark, #2d3436), #1a1a2e);
        border-radius: 20px;
        border: 3px solid rgba(255, 255, 255, 0.2);
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .nhie-deck-card:nth-child(1) { transform: rotate(-2deg) translateY(4px); }
      .nhie-deck-card:nth-child(2) { transform: rotate(1deg) translateY(2px); }
      .nhie-deck-card:nth-child(3) { transform: rotate(-0.5deg); }

      .nhie-deck-icon {
        font-size: 4rem;
        opacity: 0.5;
      }

      .nhie-card-wrapper {
        position: relative;
        z-index: 10;
      }

      .nhie-progress {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #aaa;
        font-size: 0.9rem;
      }

      .nhie-progress-bar {
        width: 150px;
        height: 8px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 4px;
        overflow: hidden;
      }

      .nhie-progress-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--pink, #ff6b9d), var(--turquoise, #4ecdc4));
        transition: width 0.3s ease;
      }

      .nhie-controls {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        width: 100%;
        align-items: center;
      }

      .nhie-action-btns {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        justify-content: center;
      }

      .nhie-btn-drink {
        background: linear-gradient(135deg, #e74c3c, #c0392b);
        color: white;
        padding: 0.8rem 1.5rem;
        border-radius: 20px;
        border: none;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.2s;
      }

      .nhie-btn-drink:hover {
        transform: scale(1.05);
      }

      .nhie-btn-next {
        background: linear-gradient(135deg, var(--turquoise, #4ecdc4), #26a69a);
        color: white;
        padding: 1rem 2rem;
        border-radius: 25px;
        border: none;
        font-size: 1.1rem;
        font-weight: 700;
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
      }

      .nhie-btn-next:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 30px rgba(78, 205, 196, 0.4);
      }

      /* Player actions section */
      .nhie-players-actions {
        width: 100%;
        text-align: center;
        margin: 1rem 0;
      }

      .nhie-instruction {
        color: #aaa;
        font-size: 0.95rem;
        margin-bottom: 1rem;
      }

      .nhie-player-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 0.8rem;
        justify-content: center;
      }

      .nhie-player-drink-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.3rem;
        padding: 0.8rem 1.2rem;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
        border: 2px solid rgba(255, 255, 255, 0.2);
        border-radius: 15px;
        color: #fff;
        cursor: pointer;
        transition: all 0.2s ease;
        min-width: 100px;
      }

      .nhie-player-drink-btn:hover:not(.clicked):not([disabled]) {
        background: linear-gradient(135deg, var(--pink, #ff6b9d), #ff8fab);
        border-color: var(--pink, #ff6b9d);
        transform: scale(1.05);
      }

      .nhie-player-drink-btn.clicked {
        background: linear-gradient(135deg, #27ae60, #2ecc71);
        border-color: #27ae60;
        cursor: default;
      }

      .nhie-player-drink-btn[disabled] {
        opacity: 0.8;
      }

      .nhie-player-drink-name {
        font-weight: 700;
        font-size: 1rem;
      }

      .nhie-player-drink-label {
        font-size: 0.75rem;
        opacity: 0.8;
      }

      /* Scoreboard */
      .nhie-scoreboard {
        width: 100%;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 15px;
        padding: 1rem;
      }

      .nhie-scoreboard h4 {
        color: #fff;
        margin: 0 0 0.5rem 0;
        font-size: 0.9rem;
        opacity: 0.7;
      }

      .nhie-players-list {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      .nhie-player-badge {
        background: rgba(255, 255, 255, 0.1);
        padding: 0.4rem 0.8rem;
        border-radius: 20px;
        font-size: 0.9rem;
        color: #fff;
        display: flex;
        align-items: center;
        gap: 0.3rem;
      }

      .nhie-player-badge.active {
        background: var(--pink, #ff6b9d);
      }

      .nhie-drink-count {
        background: rgba(0, 0, 0, 0.3);
        padding: 0.1rem 0.4rem;
        border-radius: 10px;
        font-size: 0.8rem;
      }

      /* Game Over */
      .nhie-game-over {
        text-align: center;
        padding: 2rem;
      }

      .nhie-game-over h3 {
        font-size: 2rem;
        color: #fff;
        margin-bottom: 1rem;
      }

      .nhie-final-scores {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 20px;
        padding: 1.5rem;
        margin: 1.5rem 0;
      }

      .nhie-score-row {
        display: flex;
        justify-content: space-between;
        padding: 0.8rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        color: #fff;
      }

      .nhie-score-row:last-child {
        border-bottom: none;
      }

      .nhie-score-row.winner {
        background: linear-gradient(90deg, rgba(255, 215, 0, 0.2), transparent);
        border-radius: 10px;
      }

      @media (max-width: 480px) {
        .nhie-modal {
          padding: 1.5rem;
          border-radius: 20px;
        }

        .nhie-header h2 {
          font-size: 1.5rem;
        }

        .nhie-deck-container {
          min-height: 360px;
        }

        .nhie-deck-stack {
          width: 240px;
          height: 340px;
        }
      }
    `;
  }

  /**
   * Step 1: Number of players setup (Standard Mode only)
   */
  private renderPlayerCountSetup(): void {
    // Check for Party Mode defaults
    const partyData = getPartyData();
    const defaultCount = partyData?.playerCount || 4;

    this.container.innerHTML = `
      <div class="nhie-modal-overlay">
        <div class="nhie-modal">
          <button class="nhie-close-btn" id="closeNhie">✕</button>
          
          <div class="nhie-header">
            <h2>🍻 Je n'ai jamais...</h2>
            <p>Le jeu de soirée incontournable</p>
          </div>

          <div class="nhie-setup">
            <div class="nhie-setup-section">
              <label for="playerCount">Nombre de joueurs</label>
              <input 
                type="number" 
                id="playerCount" 
                class="nhie-setup-input"
                min="2" 
                max="20" 
                value="${defaultCount}"
              />
            </div>

            <button class="nhie-btn nhie-btn-primary" id="btnNextStep">
              Suivant →
            </button>
          </div>
        </div>
      </div>
    `;

    this.attachSetupListeners();
  }

  /**
   * Step 2: Player names input
   */
  private renderPlayerNamesSetup(playerCount: number): void {
    // Check for Party Mode defaults
    const partyData = getPartyData();
    const defaultNames = partyData?.playerNames || [];

    let playerInputs = '';
    for (let i = 1; i <= playerCount; i++) {
      const defaultName = defaultNames[i - 1] || '';
      playerInputs += `
        <input 
          type="text" 
          class="nhie-player-input" 
          id="player${i}"
          placeholder="Joueur ${i}"
          value="${defaultName}"
        />
      `;
    }

    const content = this.container.querySelector('.nhie-setup');
    if (content) {
      content.innerHTML = `
        <div class="nhie-setup-section">
          <label>Pseudos des joueurs</label>
          <div class="nhie-player-inputs">
            ${playerInputs}
          </div>
        </div>

        <button class="nhie-btn nhie-btn-primary" id="btnStartGame">
          🎴 Commencer la partie
        </button>
      `;

      this.attachPlayerNamesListeners();
    }
  }

  /**
   * Initialize game with player list
   */
  private initializeGame(playerNames: string[]): void {
    const players: Player[] = playerNames.map(name => ({
      name,
      drinkCount: 0
    }));

    this.gameState = {
      players,
      currentQuestionIndex: 0,
      questions: [...NEVER_HAVE_I_EVER_QUESTIONS]
    };

    // Démarrer le tracking de la session
    statsService.startGameSession('never-have-i-ever', 'Je n\'ai jamais', playerNames.length);

    this.saveGameState();
    this.renderGameScreen();
  }

  /**
   * Main game screen
   */
  private renderGameScreen(): void {
    if (!this.gameState) return;

    const { players, currentQuestionIndex, questions } = this.gameState;

    // Check if game is over
    if (currentQuestionIndex >= questions.length) {
      this.renderGameOver();
      return;
    }

    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    // Create the card
    const cardHtml = Card.create({
      title: 'Je n\'ai jamais...',
      content: currentQuestion.text,
      subtitle: currentQuestion.emoji || '🎴',
      color: this.getCardColor(currentQuestion.category)
    });

    // Players drink buttons - each player can click to say "I did it"
    const playerButtonsHtml = players.map((p, i) => `
      <button class="nhie-player-drink-btn" data-player-index="${i}">
        <span class="nhie-player-drink-name">${p.name}</span>
        <span class="nhie-player-drink-label">Je l'ai fait ! 🍺</span>
      </button>
    `).join('');

    // Players scoreboard
    const playersHtml = players.map((p) => `
      <div class="nhie-player-badge">
        ${p.name}
        <span class="nhie-drink-count">🍺 ${p.drinkCount}</span>
      </div>
    `).join('');

    this.container.innerHTML = `
      <div class="nhie-modal-overlay">
        <div class="nhie-modal">
          <button class="nhie-close-btn" id="closeNhie">✕</button>
          
          <div class="nhie-header">
            <h2>🍻 Je n'ai jamais...</h2>
          </div>

          <div class="nhie-game">
            <div class="nhie-turn-indicator">
              Tour <strong>${currentQuestionIndex + 1}</strong>
            </div>

            <div class="nhie-deck-container">
              <div class="nhie-deck-stack">
                <div class="nhie-deck-card"><span class="nhie-deck-icon">🃏</span></div>
                <div class="nhie-deck-card"><span class="nhie-deck-icon">🃏</span></div>
                <div class="nhie-deck-card"><span class="nhie-deck-icon">🃏</span></div>
              </div>
              
              <div class="nhie-card-wrapper" id="cardWrapper">
                ${cardHtml}
              </div>
            </div>

            <div class="nhie-progress">
              <span>Carte ${currentQuestionIndex + 1}/${questions.length}</span>
              <div class="nhie-progress-bar">
                <div class="nhie-progress-fill" style="width: ${progress}%"></div>
              </div>
            </div>

            <div class="nhie-players-actions">
              <p class="nhie-instruction">Qui l'a déjà fait ? Cliquez sur votre nom !</p>
              <div class="nhie-player-buttons">
                ${playerButtonsHtml}
              </div>
            </div>

            <div class="nhie-controls">
              <button class="nhie-btn-next" id="btnNextCard">
                Carte suivante →
              </button>
            </div>

            <div class="nhie-scoreboard">
              <h4>🏆 Tableau des scores</h4>
              <div class="nhie-players-list">
                ${playersHtml}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Add card enter animation
    const cardWrapper = document.getElementById('cardWrapper');
    const card = cardWrapper?.querySelector('.playing-card');
    if (card) {
      card.classList.add('card-enter');
    }

    this.attachGameListeners();
  }

  /**
   * Game over screen
   */
  private renderGameOver(): void {
    if (!this.gameState) return;

    const { players } = this.gameState;
    
    // Sort players by drink count (most drinks = "winner")
    const sortedPlayers = [...players].sort((a, b) => b.drinkCount - a.drinkCount);

    const scoresHtml = sortedPlayers.map((p, i) => `
      <div class="nhie-score-row ${i === 0 ? 'winner' : ''}">
        <span>${i === 0 ? '👑 ' : ''}${p.name}</span>
        <span>🍺 ${p.drinkCount} verre${p.drinkCount > 1 ? 's' : ''}</span>
      </div>
    `).join('');

    this.container.innerHTML = `
      <div class="nhie-modal-overlay">
        <div class="nhie-modal">
          <button class="nhie-close-btn" id="closeNhie">✕</button>
          
          <div class="nhie-game-over">
            <h3>🎉 Partie terminée !</h3>
            <p style="color: #aaa;">Voici qui a été le plus honnête (ou le plus fêtard) !</p>
            
            <div class="nhie-final-scores">
              ${scoresHtml}
            </div>

            <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
              <button class="nhie-btn nhie-btn-primary" id="btnPlayAgain">
                🔄 Rejouer
              </button>
              ${QuitGameButton.render()}
            </div>
          </div>
        </div>
      </div>
    `;

    this.attachGameOverListeners();
    this.clearGameState();
  }

  /**
   * Attach event listeners for player count setup
   */
  private attachSetupListeners(): void {
    const closeBtn = document.getElementById('closeNhie');
    const nextBtn = document.getElementById('btnNextStep');

    closeBtn?.addEventListener('click', () => this.close());

    nextBtn?.addEventListener('click', () => {
      const input = document.getElementById('playerCount') as HTMLInputElement;
      const count = parseInt(input.value) || 4;
      
      if (count < 2 || count > 20) {
        alert('Le nombre de joueurs doit être entre 2 et 20');
        return;
      }
      
      this.renderPlayerNamesSetup(count);
    });
  }

  /**
   * Attach event listeners for player names setup
   */
  private attachPlayerNamesListeners(): void {
    const startBtn = document.getElementById('btnStartGame');

    startBtn?.addEventListener('click', () => {
      const playerNames = this.collectPlayerNames();
      
      if (playerNames.length < 2) {
        alert('Entrez au moins 2 pseudos pour commencer !');
        return;
      }
      
      this.initializeGame(playerNames);
    });
  }

  /**
   * Attach event listeners for main game screen
   */
  private attachGameListeners(): void {
    const closeBtn = document.getElementById('closeNhie');
    const nextBtn = document.getElementById('btnNextCard');
    const playerButtons = this.container.querySelectorAll('.nhie-player-drink-btn');

    closeBtn?.addEventListener('click', () => this.close());

    // Each player can click their button to add a drink
    playerButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        if (!this.gameState) return;
        
        const target = e.currentTarget as HTMLElement;
        const playerIndex = parseInt(target.dataset.playerIndex || '0');
        
        // Add drink to this player
        this.gameState.players[playerIndex].drinkCount++;
        this.saveGameState();
        
        // Visual feedback - mark button as clicked
        target.classList.add('clicked');
        target.setAttribute('disabled', 'true');
        
        // Update scoreboard only (not full re-render to keep button states)
        this.updateScoreboard();
      });
    });

    nextBtn?.addEventListener('click', () => {
      this.nextCard();
    });
  }

  /**
   * Attach event listeners for game over screen
   */
  private attachGameOverListeners(): void {
    const closeBtn = document.getElementById('closeNhie');
    const playAgainBtn = document.getElementById('btnPlayAgain');
    const closeGameBtn = document.getElementById('btnClose');

    closeBtn?.addEventListener('click', () => this.close());
    closeGameBtn?.addEventListener('click', () => this.close());

    playAgainBtn?.addEventListener('click', () => {
      // Reset and start fresh with same players
      if (this.gameState) {
        const playerNames = this.gameState.players.map(p => p.name);
        this.initializeGame(playerNames);
      }
    });
  }

  /**
   * Update scoreboard without full re-render
   */
  private updateScoreboard(): void {
    if (!this.gameState) return;
    
    const scoreboardList = this.container.querySelector('.nhie-players-list');
    if (!scoreboardList) return;
    
    const playersHtml = this.gameState.players.map((p) => `
      <div class="nhie-player-badge">
        ${p.name}
        <span class="nhie-drink-count">🍺 ${p.drinkCount}</span>
      </div>
    `).join('');
    
    scoreboardList.innerHTML = playersHtml;
  }

  /**
   * Move to next card
   */
  private nextCard(): void {
    if (!this.gameState) return;

    // Animate card exit
    const cardWrapper = document.getElementById('cardWrapper');
    const card = cardWrapper?.querySelector('.playing-card');
    if (card) {
      card.classList.remove('card-enter');
      card.classList.add('card-exit');
      
      setTimeout(() => {
        if (!this.gameState) return;
        
        // Move to next question
        this.gameState.currentQuestionIndex++;
        
        this.saveGameState();
        this.renderGameScreen();
      }, 400);
    } else {
      // No animation, just proceed
      this.gameState.currentQuestionIndex++;
      
      this.saveGameState();
      this.renderGameScreen();
    }
  }

  /**
   * Collect player names from inputs
   */
  private collectPlayerNames(): string[] {
    const names: string[] = [];
    let i = 1;
    
    while (true) {
      const input = document.getElementById(`player${i}`) as HTMLInputElement;
      if (!input) break;
      
      const name = input.value.trim() || `Joueur ${i}`;
      names.push(name);
      i++;
    }
    
    return names;
  }

  /**
   * Get card color based on question category
   */
  private getCardColor(category: 'soft' | 'medium' | 'spicy'): 'pink' | 'turquoise' | 'yellow' | 'purple' {
    switch (category) {
      case 'soft': return 'turquoise';
      case 'medium': return 'yellow';
      case 'spicy': return 'pink';
      default: return 'pink';
    }
  }

  /**
   * Save game state to localStorage
   */
  private saveGameState(): void {
    if (!this.gameState) return;
    localStorage.setItem(this.storageKey, JSON.stringify(this.gameState));
  }

  /**
   * Load game state from localStorage
   */
  private loadGameState(): GameState | null {
    try {
      const saved = localStorage.getItem(this.storageKey);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }

  /**
   * Clear saved game state
   */
  private clearGameState(): void {
    localStorage.removeItem(this.storageKey);
  }

  /**
   * Close the game
   */
  private close(): void {
    // Terminer la session si une partie est en cours
    if (this.gameState) {
      const session = statsService.endGameSession(false);
      if (session) {
        achievementsService.checkAchievements();
      }
    }
    
    this.container.innerHTML = '';
    this.container.remove();
  }
}
