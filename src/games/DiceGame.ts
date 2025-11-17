interface Player {
  name: string;
  totalDrinks: number;
}

interface GameState {
  gameName: string;
  diceValue: number;
  rollCount: number;
  players: Player[];
  gameStarted: boolean;
  waitingForDrinks: boolean;
}

export class DiceGame {
  private modal: HTMLElement | null = null;
  private diceValue: number = 1;
  private rollCount: number = 0;
  private players: Player[] = [];
  private gameStarted: boolean = false;
  private waitingForDrinks: boolean = false;
  private hasSavedGame: boolean = false;
  private readonly STORAGE_KEY_PREFIX = 'diceGame_';

  constructor(private gameName: string, private userId: string) {
    this.checkForSavedGame();
  }

  private getStorageKey(): string {
    return `${this.STORAGE_KEY_PREFIX}${this.userId}`;
  }

  private checkForSavedGame(): void {
    const saved = localStorage.getItem(this.getStorageKey());
    this.hasSavedGame = !!saved;
  }

  private saveGameState(): void {
    const state: GameState = {
      gameName: this.gameName,
      diceValue: this.diceValue,
      rollCount: this.rollCount,
      players: this.players,
      gameStarted: this.gameStarted,
      waitingForDrinks: this.waitingForDrinks
    };
    localStorage.setItem(this.getStorageKey(), JSON.stringify(state));
    console.log('💾 Partie sauvegardée pour l\'utilisateur:', this.userId);
  }

  private loadGameState(): void {
    const saved = localStorage.getItem(this.getStorageKey());
    if (saved) {
      try {
        const state: GameState = JSON.parse(saved);
        if (state.gameName === this.gameName) {
          this.diceValue = state.diceValue;
          this.rollCount = state.rollCount;
          this.players = state.players;
          this.gameStarted = state.gameStarted;
          this.waitingForDrinks = state.waitingForDrinks;
          console.log('📂 Partie restaurée pour l\'utilisateur:', this.userId);
        }
      } catch (e) {
        console.error('Erreur lors de la restauration:', e);
      }
    }
  }

  private clearGameState(): void {
    localStorage.removeItem(this.getStorageKey());
    console.log('🗑️ Sauvegarde supprimée pour l\'utilisateur:', this.userId);
  }

  open(): void {
    if (this.hasSavedGame && !this.gameStarted) {
      const resume = confirm(
        '🎮 Une partie en cours a été trouvée !\n\n' +
        'Voulez-vous reprendre votre partie sauvegardée ?\n\n' +
        '• Cliquez sur OK pour reprendre\n' +
        '• Cliquez sur Annuler pour commencer une nouvelle partie'
      );
      
      if (resume) {
        this.loadGameState();
      } else {
        this.clearGameState();
        this.hasSavedGame = false;
      }
    }
    
    this.createModal();
    this.attachListeners();
  }

  private createModal(): void {
    let initialContent = this.renderPlayerSetup();
    
    // Si une partie est en cours, afficher l'écran approprié
    if (this.gameStarted) {
      if (this.waitingForDrinks) {
        initialContent = this.renderDrinksInput();
      } else {
        initialContent = this.renderGameScreen();
      }
    }

    const modalHtml = `
      <div class="game-modal-overlay" id="gameModal">
        <div class="game-modal">
          <div class="game-modal-header">
            <h2>🎲 ${this.gameName}</h2>
            <button class="game-modal-close" aria-label="Fermer">×</button>
          </div>
          
          <div class="game-modal-content" id="modalContent">
            ${initialContent}
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    this.modal = document.getElementById('gameModal');
  }

  private renderPlayerSetup(): string {
    return `
      <div class="player-setup">
        <h3>Configuration de la partie</h3>
        <div class="form-group">
          <label for="playerCount">Nombre de joueurs :</label>
          <input type="number" id="playerCount" min="1" max="10" value="2" />
        </div>
        <button class="btn-next" id="btnSetPlayers">Suivant</button>
      </div>
    `;
  }

  private renderPlayerNames(playerCount: number): string {
    let inputs = '';
    for (let i = 1; i <= playerCount; i++) {
      inputs += `
        <div class="form-group">
          <label for="player${i}">Joueur ${i} :</label>
          <input type="text" id="player${i}" placeholder="Pseudo" required />
        </div>
      `;
    }
    
    return `
      <div class="player-names">
        <h3>Noms des joueurs</h3>
        ${inputs}
        <button class="btn-next" id="btnStartGame">Commencer la partie</button>
      </div>
    `;
  }

  private renderGameScreen(): string {
    const playersStats = this.players.map(p => `
      <div class="player-stat">
        <span class="player-name">${p.name}</span>
        <span class="player-drinks">🍺 ${p.totalDrinks}</span>
      </div>
    `).join('');

    return `
      <div class="dice-container">
        <div class="dice" id="dice">
          <span class="dice-value">${this.diceValue}</span>
        </div>
      </div>

      <div class="game-stats">
        <div class="stat-item">
          <span class="stat-label">Lancers :</span>
          <span class="stat-value" id="rollCount">${this.rollCount}</span>
        </div>
      </div>

      <div class="players-stats" id="playersStats">
        ${playersStats}
      </div>

      <div class="game-controls" id="gameControls">
        <button class="btn-roll-dice" id="btnRollDice">🎲 Lancer le dé</button>
        <button class="btn-reset-game" id="btnResetGame">🔄 Nouvelle partie</button>
        <button class="btn-end-game">💾 Sauvegarder et quitter</button>
      </div>
    `;
  }

  private renderDrinksInput(): string {
    const inputs = this.players.map((p, i) => `
      <div class="form-group">
        <label for="drinks${i}">${p.name} a bu :</label>
        <input type="number" id="drinks${i}" min="0" value="0" /> verre(s)
      </div>
    `).join('');

    return `
      <div class="drinks-input">
        <h3>Verres bus lors de cette étape</h3>
        ${inputs}
        <button class="btn-next" id="btnConfirmDrinks">Valider et continuer</button>
      </div>
    `;
  }

  private attachListeners(): void {
    if (!this.modal) return;

    // Bouton Fermer (X)
    const closeBtn = this.modal.querySelector('.game-modal-close');
    closeBtn?.addEventListener('click', () => this.close());

    // Fermer en cliquant sur l'overlay
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.close();
      }
    });

    // Délégation d'événements pour les boutons dynamiques
    this.modal.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      
      if (target.id === 'btnSetPlayers') {
        this.handleSetPlayers();
      } else if (target.id === 'btnStartGame') {
        this.handleStartGame();
      } else if (target.id === 'btnRollDice') {
        this.rollDice();
      } else if (target.id === 'btnConfirmDrinks') {
        this.handleConfirmDrinks();
      } else if (target.id === 'btnResetGame') {
        const confirm = window.confirm('Voulez-vous vraiment recommencer une nouvelle partie ? La progression actuelle sera perdue.');
        if (confirm) this.resetGame();
      } else if (target.classList.contains('btn-end-game')) {
        this.close();
      }
    });
  }

  private handleSetPlayers(): void {
    const input = document.getElementById('playerCount') as HTMLInputElement;
    const playerCount = parseInt(input.value);
    
    if (playerCount < 1 || playerCount > 10) {
      alert('Le nombre de joueurs doit être entre 1 et 10');
      return;
    }

    const content = document.getElementById('modalContent');
    if (content) {
      content.innerHTML = this.renderPlayerNames(playerCount);
    }
  }

  private handleStartGame(): void {
    const playerCountInput = document.getElementById('playerCount') as HTMLInputElement;
    const playerCount = playerCountInput?.value ? parseInt(playerCountInput.value) : 2;
    
    this.players = [];
    for (let i = 1; i <= playerCount; i++) {
      const input = document.getElementById(`player${i}`) as HTMLInputElement;
      const name = input?.value.trim() || `Joueur ${i}`;
      this.players.push({ name, totalDrinks: 0 });
    }

    this.gameStarted = true;
    this.saveGameState();
    
    const content = document.getElementById('modalContent');
    if (content) {
      content.innerHTML = this.renderGameScreen();
    }
  }

  private handleConfirmDrinks(): void {
    // Enregistrer les verres bus
    this.players.forEach((player, i) => {
      const input = document.getElementById(`drinks${i}`) as HTMLInputElement;
      const drinks = parseInt(input?.value || '0');
      player.totalDrinks += drinks;
    });

    this.waitingForDrinks = false;
    this.saveGameState();
    
    // Revenir à l'écran de jeu
    const content = document.getElementById('modalContent');
    if (content) {
      content.innerHTML = this.renderGameScreen();
    }
  }

  private rollDice(): void {
    if (this.waitingForDrinks) {
      alert('Veuillez d\'abord renseigner les verres bus !');
      return;
    }

    // Animation du dé
    const diceElement = document.getElementById('dice');
    if (!diceElement) return;

    // Désactiver le bouton pendant l'animation
    const rollBtn = document.getElementById('btnRollDice') as HTMLButtonElement;
    if (rollBtn) rollBtn.disabled = true;

    diceElement.classList.add('rolling');

    // Jouer le son du dé
    this.playDiceSound();

    // Générer un nombre aléatoire entre 1 et 6 (animation de 3 secondes)
    setTimeout(() => {
      this.diceValue = Math.floor(Math.random() * 6) + 1;
      this.rollCount++;

      // Mettre à jour l'affichage
      const diceValueElement = diceElement.querySelector('.dice-value');
      const rollCountElement = document.getElementById('rollCount');
      
      if (diceValueElement) diceValueElement.textContent = this.diceValue.toString();
      if (rollCountElement) rollCountElement.textContent = this.rollCount.toString();

      diceElement.classList.remove('rolling');
      if (rollBtn) rollBtn.disabled = false;

      // Après le lancer, demander les verres bus
      this.waitingForDrinks = true;
      this.saveGameState();
      
      setTimeout(() => {
        const content = document.getElementById('modalContent');
        if (content) {
          content.innerHTML = this.renderDrinksInput();
        }
      }, 500);
    }, 3000);
  }

  private playDiceSound(): void {
    // Créer un son synthétique de dé qui roule
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Simuler le bruit de dé avec plusieurs sons courts
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 100 + Math.random() * 200;
        oscillator.type = 'square';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
      }, i * 300);
    }
  }

  private close(): void {
    if (this.gameStarted) {
      const confirm = window.confirm(
        'Voulez-vous vraiment quitter ?\n\n' +
        '• Votre partie sera automatiquement sauvegardée\n' +
        '• Vous pourrez la reprendre en revenant sur cette page'
      );
      
      if (!confirm) return;
    }

    if (this.modal) {
      this.modal.remove();
      this.modal = null;
    }
  }

  public resetGame(): void {
    this.clearGameState();
    this.diceValue = 1;
    this.rollCount = 0;
    this.players = [];
    this.gameStarted = false;
    this.waitingForDrinks = false;
    this.close();
  }
}
