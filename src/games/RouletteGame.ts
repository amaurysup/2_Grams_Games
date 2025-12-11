/**
 * Jeu de la Roulette - Casino Edition
 * Roulette réaliste avec système de paris et statistiques
 */

import { getPartyData } from '../pages/PartyModePage';

interface PlayerStats {
  name: string;
  gorgees: number;
  culSecs: number;
  wins: number;
  losses: number;
  luckScore: number; // Score de chance pondéré
}

interface Bet {
  type: 'rouge-noir' | 'chiffre-exact' | 'douzaine' | 'vert' | 'sixaine';
  value: string | number;
  player: string;
}

interface GameState {
  players: PlayerStats[];
  currentPlayerIndex: number;
  currentBets: Bet[];
  history: number[];
  bettingPhase: boolean; // true = paris en cours, false = roulette tourne
}

export class RouletteGame {
  private container: HTMLElement;
  private gameState: GameState | null = null;
  private storageKey: string = '';
  private isSpinning: boolean = false;
  
  // Mapping couleurs de la roulette (standard européenne)
  private readonly RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

  constructor(container: HTMLElement) {
    this.container = container;
  }

  /**
   * Démarre le jeu
   */
  public start(userId: string): void {
    this.storageKey = `rouletteGame_${userId}`;
    
    const savedState = this.loadGameState();
    
    if (savedState) {
      this.gameState = savedState;
      this.renderBettingScreen();
    } else {
      this.renderPlayerSetup();
    }
  }

  /**
   * Écran de configuration des joueurs
   */
  private renderPlayerSetup(): void {
    // Vérifier si on vient du Party Mode
    const partyData = getPartyData();
    const defaultCount = partyData?.playerCount || 3;
    const defaultNames = partyData?.playerNames || [];
    
    // Générer les inputs pré-remplis
    const playerInputsHTML = Array.from({ length: defaultCount }, (_, i) => `
      <input type="text" class="player-name-input" placeholder="Joueur ${i + 1}" data-player="${i + 1}" value="${defaultNames[i] || ''}" />
    `).join('');

    this.container.innerHTML = `
      <div class="roulette-modal-overlay">
        <div class="roulette-modal">
          <div class="roulette-header">
            <h2>🎰 ROULETTE CASINO 🎰</h2>
            <p>Testez votre chance et faites boire vos adversaires !</p>
          </div>

          <div class="roulette-setup">
            <div class="setup-section">
              <label for="player-count">Nombre de joueurs (2-8)</label>
              <input 
                type="number" 
                id="player-count" 
                min="2" 
                max="8" 
                value="${defaultCount}"
                class="setup-input"
              />
            </div>

            <div class="setup-section">
              <label>Prénoms des joueurs</label>
              <div id="player-names-container">
                ${playerInputsHTML}
              </div>
            </div>

            <button id="start-game-btn" class="btn-primary">
              🎲 Commencer la partie
            </button>
          </div>

          <button id="close-roulette-btn" class="btn-close">✕</button>
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
    const closeBtn = document.getElementById('close-roulette-btn');

    playerCountInput?.addEventListener('input', () => {
      const count = parseInt(playerCountInput.value) || 3;
      this.updatePlayerNameInputs(count);
    });

    startGameBtn?.addEventListener('click', () => {
      const playerNames = this.collectPlayerNames();
      if (playerNames.length >= 2) {
        this.initializeGame(playerNames);
      } else {
        alert('Entrez au moins 2 prénoms pour commencer !');
      }
    });

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
  private initializeGame(playerNames: string[]): void {
    this.gameState = {
      players: playerNames.map(name => ({
        name,
        gorgees: 0,
        culSecs: 0,
        wins: 0,
        losses: 0,
        luckScore: 0
      })),
      currentPlayerIndex: 0,
      currentBets: [],
      history: [],
      bettingPhase: true
    };

    this.saveGameState();
    this.renderBettingScreen();
  }

  /**
   * Écran de paris
   */
  private renderBettingScreen(): void {
    if (!this.gameState) return;

    const currentPlayer = this.gameState.players[this.gameState.currentPlayerIndex];
    const allBetsPlaced = this.gameState.currentBets.length === this.gameState.players.length;

    // Liste des paris déjà placés
    const betsListHTML = this.gameState.currentBets.map(bet => {
      return `
        <div class="placed-bet">
          <span class="bet-player">${bet.player}:</span>
          <span class="bet-info">${this.formatBetValue(bet)}</span>
        </div>
      `;
    }).join('');

    const progressInfo = `
      <div class="betting-progress">
        <p>Paris placés: <strong>${this.gameState.currentBets.length}/${this.gameState.players.length}</strong></p>
        ${betsListHTML ? `<div class="bets-list">${betsListHTML}</div>` : ''}
      </div>
    `;

    this.container.innerHTML = `
      <div class="roulette-modal-overlay">
        <div class="roulette-modal roulette-game-modal">
          <div class="roulette-header">
            <h2>🎰 ROULETTE CASINO 🎰</h2>
            <div class="current-player">
              ${allBetsPlaced ? 
                '<strong>Tous les paris sont placés !</strong>' : 
                `C'est au tour de <strong>${currentPlayer.name}</strong> !`
              }
            </div>
            ${progressInfo}
          </div>

          <div class="betting-screen">
            ${!allBetsPlaced ? '<h3>Choisissez votre pari :</h3>' : ''}
            
            ${!allBetsPlaced ? `
            <div class="bet-options">
              <div class="bet-option" data-bet-type="rouge-noir">
                <h4>🔴⚫ Rouge / Noir</h4>
                <p class="bet-odds">Prob: 48.6% | Gain/Perte: 2 gorgées</p>
                <div class="bet-choices">
                  <button class="bet-btn" data-value="rouge">Rouge</button>
                  <button class="bet-btn" data-value="noir">Noir</button>
                  <button class="bet-btn" data-value="pair">Pair</button>
                  <button class="bet-btn" data-value="impair">Impair</button>
                </div>
              </div>

              <div class="bet-option" data-bet-type="douzaine">
                <h4>📊 Douzaine</h4>
                <p class="bet-odds">Prob: 32.4% | Gain/Perte: 4 gorgées</p>
                <div class="bet-choices">
                  <button class="bet-btn" data-value="1-12">1-12</button>
                  <button class="bet-btn" data-value="13-24">13-24</button>
                  <button class="bet-btn" data-value="25-36">25-36</button>
                </div>
              </div>

              <div class="bet-option" data-bet-type="sixaine">
                <h4>🎯 Sixaine</h4>
                <p class="bet-odds">Prob: 16.2% | Gain/Perte: 6 gorgées</p>
                <div class="bet-choices">
                  <button class="bet-btn" data-value="1-6">1-6</button>
                  <button class="bet-btn" data-value="7-12">7-12</button>
                  <button class="bet-btn" data-value="13-18">13-18</button>
                  <button class="bet-btn" data-value="19-24">19-24</button>
                  <button class="bet-btn" data-value="25-30">25-30</button>
                  <button class="bet-btn" data-value="31-36">31-36</button>
                </div>
              </div>

              <div class="bet-option" data-bet-type="chiffre-exact">
                <h4>💎 Chiffre Exact</h4>
                <p class="bet-odds">Prob: 2.7% | Gain/Perte: CUL SEC</p>
                <input type="number" id="exact-number" min="1" max="36" placeholder="Entrez 1-36" class="number-input" />
                <button class="bet-btn" id="bet-exact">Valider</button>
              </div>

              <div class="bet-option" data-bet-type="vert">
                <h4>💚 ZÉRO / Vert</h4>
                <p class="bet-odds">Prob: 2.7% | Gain: CUL SEC + Truth/Dare | Perte: CUL SEC + subir Truth/Dare</p>
                <button class="bet-btn bet-special" data-value="0">Miser sur le 0</button>
              </div>
            </div>
            ` : `
            <div class="ready-to-spin">
              <h3>🎲 Tous les paris sont placés !</h3>
              <button id="spin-roulette-btn" class="btn-spin">FAIRE TOURNER LA ROULETTE !</button>
            </div>
            `}

            <div class="game-footer">
              <button id="show-stats-btn" class="btn-secondary">📊 Voir les stats</button>
              <button id="quit-game-btn" class="btn-danger">🚪 Quitter</button>
            </div>
          </div>

          <button id="close-roulette-btn" class="btn-close">✕</button>
        </div>
      </div>
    `;

    this.attachBettingListeners();
  }

  /**
   * Attache les listeners pour l'écran de paris
   */
  private attachBettingListeners(): void {
    const betButtons = document.querySelectorAll('.bet-btn');
    const showStatsBtn = document.getElementById('show-stats-btn');
    const quitGameBtn = document.getElementById('quit-game-btn');
    const closeBtn = document.getElementById('close-roulette-btn');
    const spinRouletteBtn = document.getElementById('spin-roulette-btn');

    betButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const value = target.dataset.value;
        const betType = target.closest('.bet-option')?.getAttribute('data-bet-type');

        if (betType === 'chiffre-exact' && target.id === 'bet-exact') {
          const input = document.getElementById('exact-number') as HTMLInputElement;
          const number = parseInt(input.value);
          if (number >= 1 && number <= 36) {
            this.placeBet('chiffre-exact', number);
          } else {
            alert('Entrez un nombre entre 1 et 36 !');
          }
        } else if (value && betType) {
          this.placeBet(betType as any, value);
        }
      });
    });

    spinRouletteBtn?.addEventListener('click', () => {
      this.renderRouletteSpinScreen();
    });

    showStatsBtn?.addEventListener('click', () => {
      this.renderStatsScreen();
    });

    quitGameBtn?.addEventListener('click', () => {
      if (confirm('Voulez-vous vraiment quitter la partie ?')) {
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
   * Place un pari pour le joueur actuel
   */
  private placeBet(type: string, value: string | number): void {
    if (!this.gameState || this.isSpinning) return;

    const currentPlayer = this.gameState.players[this.gameState.currentPlayerIndex];
    
    // Ajouter le pari à la liste
    this.gameState.currentBets.push({
      type: type as any,
      value,
      player: currentPlayer.name
    });

    // Passer au joueur suivant
    this.gameState.currentPlayerIndex = (this.gameState.currentPlayerIndex + 1) % this.gameState.players.length;

    this.saveGameState();
    
    // Re-render pour afficher le prochain joueur ou lancer la roulette
    this.renderBettingScreen();
  }

  /**
   * Écran de rotation de la roulette
   */
  private renderRouletteSpinScreen(): void {
    if (!this.gameState) return;

    // Liste de tous les paris
    const allBetsHTML = this.gameState.currentBets.map(bet => {
      return `
        <div class="spin-bet-item">
          <strong>${bet.player}:</strong> ${this.formatBetValue(bet)}
        </div>
      `;
    }).join('');

    this.container.innerHTML = `
      <div class="roulette-modal-overlay">
        <div class="roulette-modal roulette-spin-modal">
          <div class="roulette-header">
            <h2>🎰 ROULETTE CASINO 🎰</h2>
            <div class="all-bets-display">
              <h3>📋 Paris de ce tour :</h3>
              <div class="all-bets-list">
                ${allBetsHTML}
              </div>
            </div>
          </div>

          <div class="roulette-container">
            <div class="roulette-wheel" id="roulette-wheel">
              ${this.generateRouletteWheel()}
            </div>
            <div class="roulette-ball" id="roulette-ball"></div>
            <div class="roulette-pointer">▼</div>
          </div>

          <div class="result-display" id="result-display" style="display: none;">
            <h3 id="result-number"></h3>
            <p id="result-text"></p>
          </div>

          <button id="spin-btn" class="btn-primary btn-spin">
            🎲 FAIRE TOURNER !
          </button>
        </div>
      </div>
    `;

    this.attachSpinListeners();
  }

  /**
   * Génère la roue de la roulette HTML avec numéros visibles
   */
  private generateRouletteWheel(): string {
    // Ordre standard de la roulette européenne
    const numbers = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
    
    const segmentAngle = 360 / 37;
    const radius = 200;
    const centerX = 200;
    const centerY = 200;
    
    const segments = numbers.map((num, index) => {
      const startAngle = segmentAngle * index - 90; // -90 pour commencer en haut
      const endAngle = startAngle + segmentAngle;
      
      // Convertir degrés en radians
      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;
      
      // Points du segment
      const x1 = centerX + radius * Math.cos(startRad);
      const y1 = centerY + radius * Math.sin(startRad);
      const x2 = centerX + radius * Math.cos(endRad);
      const y2 = centerY + radius * Math.sin(endRad);
      
      // Position du texte
      const textAngle = startAngle + segmentAngle / 2;
      const textRad = (textAngle * Math.PI) / 180;
      const textX = centerX + (radius * 0.75) * Math.cos(textRad);
      const textY = centerY + (radius * 0.75) * Math.sin(textRad);
      
      const color = num === 0 ? '#2ecc71' : (this.RED_NUMBERS.includes(num) ? '#dc143c' : '#1a1a1a');
      
      return `
        <path d="M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z" 
              fill="${color}" 
              stroke="#ffffff" 
              stroke-width="1"/>
        <text x="${textX}" y="${textY}" 
              fill="white" 
              font-size="14" 
              font-weight="700" 
              text-anchor="middle" 
              dominant-baseline="middle">${num}</text>
      `;
    }).join('');

    return `
      <svg width="400" height="400" viewBox="0 0 400 400" class="wheel-svg">
        ${segments}
        <circle cx="200" cy="200" r="50" fill="#d4af37" stroke="#ffd700" stroke-width="3"/>
        <text x="200" y="210" font-size="40" text-anchor="middle" fill="#1a1a1a">🎰</text>
      </svg>
    `;
  }

  /**
   * Attache les listeners pour la rotation
   */
  private attachSpinListeners(): void {
    const spinBtn = document.getElementById('spin-btn');

    spinBtn?.addEventListener('click', () => {
      this.spinRoulette();
    });
  }

  /**
   * Fait tourner la roulette (animation de la bille uniquement)
   */
  private async spinRoulette(): Promise<void> {
    if (this.isSpinning || !this.gameState) return;

    this.isSpinning = true;
    const spinBtn = document.getElementById('spin-btn');
    if (spinBtn) spinBtn.style.display = 'none';

    // Générer le résultat
    const result = Math.floor(Math.random() * 37); // 0-36
    const color = result === 0 ? 'vert' : (this.RED_NUMBERS.includes(result) ? 'rouge' : 'noir');

    const ball = document.getElementById('roulette-ball');

    if (ball) {
      // Calculer l'angle final basé sur le résultat
      const numbers = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
      const resultIndex = numbers.indexOf(result);
      const segmentAngle = 360 / 37;
      
      // Angle du centre du segment gagnant (aligné avec SVG qui commence à -90°)
      const finalAngle = (resultIndex * segmentAngle) + (segmentAngle / 2) - 90;
      
      // La bille fait plusieurs tours + angle final
      const totalRotation = 360 * 8 + finalAngle;

      // Animation de la bille qui tourne autour de la roulette
      ball.style.transition = 'transform 5s cubic-bezier(0.17, 0.67, 0.12, 0.99)';
      ball.style.transform = `rotate(${totalRotation}deg) translateX(180px) rotate(-${totalRotation}deg)`;

      // Attendre la fin de l'animation
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    // Afficher le résultat
    this.displayResult(result, color);
  }

  /**
   * Affiche le résultat et applique les conséquences pour TOUS les joueurs
   */
  private displayResult(number: number, color: string): void {
    if (!this.gameState) return;

    // Mettre à jour l'historique
    this.gameState.history.push(number);

    // Traiter chaque pari
    const resultsHTML: string[] = [];
    
    this.gameState.currentBets.forEach(bet => {
      const player = this.gameState!.players.find(p => p.name === bet.player);
      if (!player) return;

      const isWin = this.checkWin(bet, number, color);

      // Calculer les gorgées
      let gorgees = 0;
      let culSec = false;

      if (bet.type === 'rouge-noir') {
        gorgees = 2;
      } else if (bet.type === 'douzaine') {
        gorgees = 4;
      } else if (bet.type === 'sixaine') {
        gorgees = 6;
      } else if (bet.type === 'chiffre-exact') {
        culSec = true;
      } else if (bet.type === 'vert') {
        culSec = true;
      }

      if (isWin) {
        player.wins++;
        const probability = this.getBetProbability(bet.type);
        player.luckScore += Math.round((1 / probability) * 10);

        if (bet.type === 'vert') {
          resultsHTML.push(`<strong>🎉 ${player.name}</strong> GAGNE ! Distribue CUL SEC + pose Truth/Dare !`);
        } else if (culSec) {
          resultsHTML.push(`<strong>🎉 ${player.name}</strong> GAGNE ! Distribue un CUL SEC !`);
        } else {
          resultsHTML.push(`<strong>🎉 ${player.name}</strong> GAGNE ! Distribue ${gorgees} gorgées !`);
        }
      } else {
        player.losses++;
        if (culSec) {
          player.culSecs++;
        } else {
          player.gorgees += gorgees;
        }

        if (bet.type === 'vert') {
          resultsHTML.push(`<strong>😭 ${player.name}</strong> PERD ! Boit CUL SEC + subit Truth/Dare !`);
        } else if (culSec) {
          resultsHTML.push(`<strong>😭 ${player.name}</strong> PERD ! Boit un CUL SEC !`);
        } else {
          resultsHTML.push(`<strong>😭 ${player.name}</strong> PERD ! Boit ${gorgees} gorgées !`);
        }
      }
    });

    // Afficher tous les résultats
    const resultDisplay = document.getElementById('result-display');
    const resultNumber = document.getElementById('result-number');
    const resultText = document.getElementById('result-text');

    if (resultDisplay && resultNumber && resultText) {
      const colorEmoji = color === 'rouge' ? '🔴' : (color === 'noir' ? '⚫' : '💚');
      resultNumber.textContent = `${colorEmoji} ${number} ${colorEmoji}`;
      resultNumber.style.color = color === 'rouge' ? '#e74c3c' : (color === 'noir' ? '#2c3e50' : '#27ae60');

      resultText.innerHTML = `
        <div class="all-results">
          ${resultsHTML.map(r => `<p class="result-line">${r}</p>`).join('')}
        </div>
      `;

      resultDisplay.style.display = 'block';
      
      // Ajouter le bouton "Pari suivant"
      const nextRoundBtn = document.createElement('button');
      nextRoundBtn.id = 'next-round-btn';
      nextRoundBtn.className = 'btn-next-round';
      nextRoundBtn.textContent = '🎲 PARI SUIVANT';
      nextRoundBtn.onclick = () => this.startNewRound();
      resultDisplay.appendChild(nextRoundBtn);
    }

    this.saveGameState();
  }

  /**
   * Vérifie si le pari est gagnant
   */
  private checkWin(bet: Bet, number: number, color: string): boolean {
    switch (bet.type) {
      case 'rouge-noir':
        if (bet.value === 'rouge') return color === 'rouge';
        if (bet.value === 'noir') return color === 'noir';
        if (bet.value === 'pair') return number !== 0 && number % 2 === 0;
        if (bet.value === 'impair') return number !== 0 && number % 2 === 1;
        return false;

      case 'douzaine':
        if (bet.value === '1-12') return number >= 1 && number <= 12;
        if (bet.value === '13-24') return number >= 13 && number <= 24;
        if (bet.value === '25-36') return number >= 25 && number <= 36;
        return false;

      case 'sixaine':
        const [min, max] = (bet.value as string).split('-').map(Number);
        return number >= min && number <= max;

      case 'chiffre-exact':
        return number === bet.value;

      case 'vert':
        return number === 0;

      default:
        return false;
    }
  }

  /**
   * Retourne la probabilité d'un type de pari
   */
  private getBetProbability(betType: string): number {
    switch (betType) {
      case 'rouge-noir': return 18/37;
      case 'douzaine': return 12/37;
      case 'sixaine': return 6/37;
      case 'chiffre-exact': return 1/37;
      case 'vert': return 1/37;
      default: return 0;
    }
  }

  /**
   * Démarre une nouvelle manche (tous les joueurs parient à nouveau)
   */
  private startNewRound(): void {
    if (!this.gameState) return;

    this.gameState.currentPlayerIndex = 0;
    this.gameState.currentBets = [];
    this.isSpinning = false;
    this.gameState.bettingPhase = true;

    this.saveGameState();
    this.renderBettingScreen();
  }

  /**
   * Affiche les statistiques
   */
  private renderStatsScreen(): void {
    if (!this.gameState) return;

    const sortedByLuck = [...this.gameState.players].sort((a, b) => b.luckScore - a.luckScore);

    const statsHTML = this.gameState.players.map(player => {
      const totalBets = player.wins + player.losses;
      const winRate = totalBets > 0 ? ((player.wins / totalBets) * 100).toFixed(1) : '0.0';

      return `
        <div class="player-stats">
          <h3>${player.name}</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-label">🍺 Gorgées:</span>
              <span class="stat-value">${player.gorgees}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">💀 Cul secs:</span>
              <span class="stat-value">${player.culSecs}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">✅ Victoires:</span>
              <span class="stat-value">${player.wins}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">❌ Défaites:</span>
              <span class="stat-value">${player.losses}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">📊 Win Rate:</span>
              <span class="stat-value">${winRate}%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">🍀 Luck Score:</span>
              <span class="stat-value">${player.luckScore}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    this.container.innerHTML = `
      <div class="roulette-modal-overlay">
        <div class="roulette-modal roulette-stats-modal">
          <div class="roulette-header">
            <h2>📊 STATISTIQUES DU JEU</h2>
            <p>🍀 Joueur le plus chanceux: <strong>${sortedByLuck[0]?.name}</strong> (${sortedByLuck[0]?.luckScore} pts)</p>
          </div>

          <div class="stats-container">
            ${statsHTML}
          </div>

          <div class="stats-history">
            <h3>📜 Historique (${this.gameState.history.length} tours)</h3>
            <div class="history-numbers">
              ${this.gameState.history.slice(-10).reverse().map(num => {
                const color = num === 0 ? 'green' : (this.RED_NUMBERS.includes(num) ? 'red' : 'black');
                return `<span class="history-number ${color}">${num}</span>`;
              }).join('')}
            </div>
          </div>

          <button id="back-to-game-btn" class="btn-primary">🎲 Retour au jeu</button>
        </div>
      </div>
    `;

    const backBtn = document.getElementById('back-to-game-btn');
    backBtn?.addEventListener('click', () => {
      this.renderBettingScreen();
    });
  }

  /**
   * Formate la valeur du pari pour l'affichage
   */
  private formatBetValue(bet: Bet): string {
    switch (bet.type) {
      case 'rouge-noir':
        if (bet.value === 'rouge') return '🔴 Rouge';
        if (bet.value === 'noir') return '⚫ Noir';
        if (bet.value === 'pair') return 'Pair';
        if (bet.value === 'impair') return 'Impair';
        return String(bet.value);
      case 'douzaine':
        return `Douzaine ${bet.value}`;
      case 'sixaine':
        return `Sixaine ${bet.value}`;
      case 'chiffre-exact':
        return `Numéro ${bet.value}`;
      case 'vert':
        return '💚 ZÉRO';
      default:
        return String(bet.value);
    }
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
