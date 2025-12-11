import { supabase } from '../lib/supabase';
import type { Game } from '../types';
import { findGameType, launchGame } from '../games/GameRegistry';
import { toast } from '../components/Toast';

type Phase = 'setup' | 'playing';

// Clé pour stocker les données de party en sessionStorage
const PARTY_DATA_KEY = 'party_mode_data';

export interface PartyData {
  playerCount: number;
  playerNames: string[];
}

export function getPartyData(): PartyData | null {
  try {
    const data = sessionStorage.getItem(PARTY_DATA_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function setPartyData(data: PartyData): void {
  sessionStorage.setItem(PARTY_DATA_KEY, JSON.stringify(data));
}

export function clearPartyData(): void {
  sessionStorage.removeItem(PARTY_DATA_KEY);
}

export class PartyModePage {
  private container: HTMLElement;
  private phase: Phase = 'setup';
  private playerCount: number = 4;
  private playerNames: string[] = [];
  private allPartyGames: Game[] = [];
  private filteredGames: Game[] = [];
  private currentGameIndex: number = 0;

  constructor(containerId: string) {
    const element = document.getElementById(containerId);
    if (!element) throw new Error(`Element with id ${containerId} not found`);
    
    this.container = element;
    this.initPlayerNames();
    void this.init();
  }

  private initPlayerNames(): void {
    // Initialiser les noms par défaut
    this.playerNames = Array.from({ length: this.playerCount }, (_, i) => `Joueur ${i + 1}`);
  }

  private async init(): Promise<void> {
    await this.loadPartyGames();
    this.render();
  }

  private async loadPartyGames(): Promise<void> {
    try {
      const { data: games, error } = await supabase
        .from('jeux')
        .select('*')
        .eq('party_mode', true);
      
      if (error) throw error;
      this.allPartyGames = games || [];
    } catch (error) {
      console.error('Erreur chargement jeux party mode:', error);
      this.allPartyGames = [];
    }
  }

  private filterGamesByPlayerCount(): void {
    this.filteredGames = this.allPartyGames.filter(game => {
      const min = game.joueurs_min ?? 1;
      const max = game.joueurs_max ?? 99;
      return this.playerCount >= min && this.playerCount <= max;
    });
    
    // Mélanger les jeux filtrés
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
    if (this.phase === 'setup') {
      this.renderSetupPhase();
    } else {
      this.renderPlayingPhase();
    }
  }

  private renderSetupPhase(): void {
    // Générer les inputs pour les pseudos
    const playerInputs = Array.from({ length: this.playerCount }, (_, i) => `
      <input 
        type="text" 
        class="player-name-input" 
        id="player-name-${i}" 
        placeholder="Joueur ${i + 1}" 
        value="${this.playerNames[i] || ''}"
        maxlength="20"
      />
    `).join('');

    // Compter les jeux disponibles pour ce nombre de joueurs
    const availableGamesCount = this.allPartyGames.filter(game => {
      const min = game.joueurs_min ?? 1;
      const max = game.joueurs_max ?? 99;
      return this.playerCount >= min && this.playerCount <= max;
    }).length;

    this.container.innerHTML = `
      <div class="party-page">
        <div class="party-header">
          <a href="#/games" class="back-btn">← Retour</a>
          <h1>🎉 Party Mode</h1>
        </div>
        
        <div class="party-setup">
          <div class="party-setup-icon">🥳</div>
          <h2>Prêts à faire la fête ?</h2>
          
          <div class="player-count-section">
            <label>Combien êtes-vous ?</label>
            <div class="player-count-selector">
              <button class="count-btn" id="decrease-btn">−</button>
              <div class="player-count-display">
                <span id="player-count">${this.playerCount}</span>
                <span class="player-label">joueurs</span>
              </div>
              <button class="count-btn" id="increase-btn">+</button>
            </div>
            <p class="available-games-hint" id="games-hint">
              ${availableGamesCount > 0 
                ? `🎮 ${availableGamesCount} jeux disponibles pour ${this.playerCount} joueurs` 
                : `⚠️ Aucun jeu disponible pour ${this.playerCount} joueurs`}
            </p>
          </div>

          <div class="player-names-section">
            <label>Entrez vos pseudos</label>
            <div class="player-names-grid" id="player-names-grid">
              ${playerInputs}
            </div>
          </div>
          
          <button class="btn-start-party" id="start-btn" ${availableGamesCount === 0 ? 'disabled' : ''}>
            🚀 C'EST PARTI !
          </button>
        </div>
      </div>
    `;

    this.attachSetupListeners();
  }

  private updatePlayerInputs(): void {
    const grid = document.getElementById('player-names-grid');
    const hint = document.getElementById('games-hint');
    const startBtn = document.getElementById('start-btn') as HTMLButtonElement;
    
    if (!grid) return;

    // Sauvegarder les noms actuels
    const currentInputs = grid.querySelectorAll('.player-name-input') as NodeListOf<HTMLInputElement>;
    currentInputs.forEach((input, i) => {
      this.playerNames[i] = input.value || `Joueur ${i + 1}`;
    });

    // Ajuster le tableau des noms
    if (this.playerCount > this.playerNames.length) {
      for (let i = this.playerNames.length; i < this.playerCount; i++) {
        this.playerNames.push(`Joueur ${i + 1}`);
      }
    } else {
      this.playerNames = this.playerNames.slice(0, this.playerCount);
    }

    // Régénérer les inputs
    grid.innerHTML = Array.from({ length: this.playerCount }, (_, i) => `
      <input 
        type="text" 
        class="player-name-input" 
        id="player-name-${i}" 
        placeholder="Joueur ${i + 1}" 
        value="${this.playerNames[i] || ''}"
        maxlength="20"
      />
    `).join('');

    // Mettre à jour le compteur de jeux disponibles
    const availableGamesCount = this.allPartyGames.filter(game => {
      const min = game.joueurs_min ?? 1;
      const max = game.joueurs_max ?? 99;
      return this.playerCount >= min && this.playerCount <= max;
    }).length;

    if (hint) {
      hint.innerHTML = availableGamesCount > 0 
        ? `🎮 ${availableGamesCount} jeux disponibles pour ${this.playerCount} joueurs` 
        : `⚠️ Aucun jeu disponible pour ${this.playerCount} joueurs`;
    }

    if (startBtn) {
      startBtn.disabled = availableGamesCount === 0;
    }
  }

  private attachSetupListeners(): void {
    const decreaseBtn = document.getElementById('decrease-btn');
    const increaseBtn = document.getElementById('increase-btn');
    const startBtn = document.getElementById('start-btn');
    const countDisplay = document.getElementById('player-count');

    decreaseBtn?.addEventListener('click', () => {
      if (this.playerCount > 2) {
        this.playerCount--;
        if (countDisplay) countDisplay.textContent = String(this.playerCount);
        this.updatePlayerInputs();
      }
    });

    increaseBtn?.addEventListener('click', () => {
      if (this.playerCount < 20) {
        this.playerCount++;
        if (countDisplay) countDisplay.textContent = String(this.playerCount);
        this.updatePlayerInputs();
      }
    });

    startBtn?.addEventListener('click', () => {
      // Récupérer tous les noms saisis
      const inputs = document.querySelectorAll('.player-name-input') as NodeListOf<HTMLInputElement>;
      this.playerNames = Array.from(inputs).map((input, i) => 
        input.value.trim() || `Joueur ${i + 1}`
      );

      // Sauvegarder les données de party pour les jeux
      setPartyData({
        playerCount: this.playerCount,
        playerNames: this.playerNames
      });

      // Filtrer et mélanger les jeux
      this.filterGamesByPlayerCount();

      if (this.filteredGames.length > 0) {
        this.phase = 'playing';
        this.render();
      } else {
        toast.warning('Aucun jeu disponible pour ce nombre de joueurs !');
      }
    });
  }

  private renderPlayingPhase(): void {
    const currentGame = this.filteredGames[this.currentGameIndex];

    if (!currentGame) {
      this.renderPartyEnd();
      return;
    }

    const progress = ((this.currentGameIndex + 1) / this.filteredGames.length) * 100;
    const isInteractive = currentGame.interactif;

    this.container.innerHTML = `
      <div class="party-page">
        <div class="party-header">
          <a href="#/games" class="back-btn">← Quitter</a>
          <h1>🎉 Party Mode</h1>
          <div class="game-counter">${this.currentGameIndex + 1}/${this.filteredGames.length}</div>
        </div>

        <div class="party-progress">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progress}%"></div>
          </div>
        </div>

        <div class="party-game-card">
          <div class="game-card-image" style="background-image: url('${currentGame.image || '/placeholder-game.jpg'}')">
            <div class="game-card-overlay"></div>
            <div class="game-number">Jeu #${this.currentGameIndex + 1}</div>
            ${isInteractive ? '<div class="interactive-badge">🎮 Interactif</div>' : ''}
          </div>
          
          <div class="game-card-body">
            <h2 class="game-card-title">${currentGame.name}</h2>
            <p class="game-card-description">${currentGame.description}</p>
            
            <div class="game-rules-section">
              <h3>📜 Règles</h3>
              <div class="game-rules-content">
                ${this.formatRules(currentGame.rules)}
              </div>
            </div>

            <div class="game-info-badges">
              <span class="info-badge">👥 ${this.formatPlayerCount(currentGame)}</span>
              ${this.getGameTags(currentGame)}
            </div>
          </div>
        </div>

        <div class="party-actions">
          ${isInteractive ? `
            <button class="btn-play-interactive" id="btn-play">
              🎮 Jouer maintenant
            </button>
          ` : ''}
          <button class="btn-next-game ${isInteractive ? 'btn-secondary' : ''}" id="btn-next">
            ${this.isLastGame() ? '🏆 Terminer la Party' : '➡️ Jeu Suivant'}
          </button>
        </div>
      </div>
    `;

    this.attachPlayingListeners(currentGame);
  }

  private formatRules(rules: string): string {
    if (!rules) return '<p>Pas de règles spécifiques.</p>';
    return rules.split('\n').filter(p => p.trim()).map(p => `<p>${p}</p>`).join('');
  }

  private getGameTags(game: Game): string {
    const tags: string[] = [];
    if (game.chill) tags.push('😌 Chill');
    if (game.destruction) tags.push('💥 Destruction');
    if (game.découverte) tags.push('🔍 Découverte');
    if (game.embrouilles) tags.push('🤯 Embrouilles');
    if (game.réflexion) tags.push('🧠 Réflexion');
    if (game.exploration) tags.push('🗺️ Exploration');
    
    return tags.map(tag => `<span class="info-badge tag-badge">${tag}</span>`).join('');
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

  private isLastGame(): boolean {
    return this.currentGameIndex >= this.filteredGames.length - 1;
  }

  private attachPlayingListeners(currentGame: Game): void {
    const btnNext = document.getElementById('btn-next');
    const btnPlay = document.getElementById('btn-play');

    btnNext?.addEventListener('click', () => {
      if (this.isLastGame()) {
        this.renderPartyEnd();
      } else {
        this.currentGameIndex++;
        this.render();
      }
    });

    // Bouton Jouer pour les jeux interactifs
    if (btnPlay && currentGame.interactif) {
      btnPlay.addEventListener('click', async () => {
        console.log('🎮 Lancement du jeu interactif depuis Party Mode:', currentGame.name);
        
        // Vérifier l'authentification
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          toast.warning('Vous devez être connecté pour jouer en mode interactif !');
          setTimeout(() => {
            window.location.hash = '/login';
          }, 1500);
          return;
        }
        
        // Trouver le type de jeu dans le registre
        const gameType = findGameType(currentGame.name);
        
        if (gameType) {
          // Les données de party sont déjà sauvegardées dans sessionStorage
          // Les jeux peuvent les récupérer avec getPartyData()
          const success = await launchGame(gameType, currentGame.name, user.id);
          if (!success) {
            toast.error('Erreur lors du chargement du jeu. Réessaie !');
          }
        } else {
          toast.info(`Le jeu "${currentGame.name}" sera bientôt disponible en mode interactif ! 🎉`);
        }
      });
    }
  }

  private renderPartyEnd(): void {
    this.container.innerHTML = `
      <div class="party-page">
        <div class="party-header">
          <a href="#/games" class="back-btn">← Retour</a>
          <h1>🎉 Party Mode</h1>
        </div>

        <div class="party-end">
          <div class="party-end-confetti">🎊</div>
          <h2>FÉLICITATIONS !</h2>
          <p class="party-end-subtitle">Vous avez terminé tous les jeux de la Party !</p>
          
          <div class="party-stats">
            <div class="stat-item">
              <span class="stat-number">${this.filteredGames.length}</span>
              <span class="stat-label">jeux joués</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">${this.playerCount}</span>
              <span class="stat-label">joueurs</span>
            </div>
          </div>

          <div class="party-players-recap">
            <h3>🏆 L'équipe</h3>
            <div class="players-list">
              ${this.playerNames.map(name => `<span class="player-chip">${name}</span>`).join('')}
            </div>
          </div>

          <div class="party-end-actions">
            <button class="btn-restart-party" id="btn-restart">
              🔄 Recommencer
            </button>
            <a href="#/games" class="btn-back-home">
              🏠 Retour aux jeux
            </a>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-restart')?.addEventListener('click', () => {
      this.shuffleArray(this.filteredGames);
      this.currentGameIndex = 0;
      this.phase = 'setup';
      this.render();
    });
  }
}
