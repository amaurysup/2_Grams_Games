import { supabase } from '../lib/supabase';
import type { Game } from '../types';

export class GameDetailPage {
  private container: HTMLElement;
  private gameId: string;

  constructor(containerId: string, gameId: string) {
    const element = document.getElementById(containerId);
    if (!element) throw new Error(`Element with id ${containerId} not found`);
    
    this.container = element;
    this.gameId = gameId;
    void this.init();
  }

  private async init(): Promise<void> {
    this.renderLoading();
    await this.loadAndRender();
  }

  private renderLoading(): void {
    this.container.innerHTML = `
      <div class="game-detail-loading">
        <div class="spinner">🎮</div>
        <p>Chargement du jeu...</p>
      </div>
    `;
  }

  private async loadAndRender(): Promise<void> {
    try {
      console.log('🔄 Chargement du jeu:', this.gameId);
      
      // Récupérer le jeu depuis la table 'jeux'
      const { data, error } = await supabase
        .from('jeux')
        .select('*')
        .eq('id', this.gameId)
        .single();

      const game: Game | null = (!error && data) ? data : null;

      if (!game) {
        this.renderError();
        return;
      }

      console.log('✅ Jeu trouvé:', game);
      this.render(game);
    } catch (error) {
      console.error('❌ Erreur:', error);
      this.renderError();
    }
  }

  private render(game: Game): void {
    const playButton = game.interactif 
      ? `<button class="btn-play-game" data-game-id="${game.id}" data-game-name="${game.name}">🎮 Jouer maintenant</button>`
      : '';

    this.container.innerHTML = `
      <div class="game-detail">
        <div class="game-detail-header">
          ${playButton}
          <h1 class="game-detail-title">🎮 ${game.name}</h1>
        </div>

        <div class="game-detail-rules">
          <h2>📋 Règles du jeu</h2>
          <div class="rules-content">
            ${game.rules || '<p>Aucune règle pour le moment.</p>'}
          </div>
        </div>

        <div class="game-detail-footer">
          <a href="#/games" class="btn btn-secondary">← Retour aux jeux</a>
        </div>
      </div>
    `;

    // Attacher l'événement au bouton Jouer si interactif
    if (game.interactif) {
      const playBtn = this.container.querySelector('.btn-play-game');
      if (playBtn) {
        playBtn.addEventListener('click', async () => {
          console.log('🎮 Lancement du jeu interactif:', game.name);
          
          // Vérifier l'authentification
          const { data: { user } } = await supabase.auth.getUser();
          
          if (!user) {
            const goToLogin = confirm(
              'Vous devez être connecté pour jouer en mode interactif !\n\n' +
              'Cliquez sur OK pour aller à la page de connexion.'
            );
            if (goToLogin) {
              window.location.hash = '/login';
            }
            return;
          }
          
          // Charger dynamiquement le jeu correspondant
          const gameName = game.name.toLowerCase().trim();
          
          if (gameName === 'jeu des transports' || gameName.includes('transport')) {
            const { DiceGame } = await import('../games/DiceGame');
            const diceGame = new DiceGame(game.name, user.id);
            diceGame.open();
          } else if (gameName === 'undercover' || gameName.includes('undercover')) {
            const { UndercoverGame } = await import('../games/UndercoverGame');
            const undercoverGame = new UndercoverGame(game.name, user.id);
            undercoverGame.open();
          } else if (gameName === 'piccola' || gameName.includes('piccola')) {
            const { PiccolaGame } = await import('../games/PiccolaGame');
            const modalContainer = document.createElement('div');
            modalContainer.id = 'piccola-game-container';
            document.body.appendChild(modalContainer);
            const piccolaGame = new PiccolaGame(modalContainer);
            piccolaGame.start(user.id);
          } else if (gameName === 'roulette' || gameName.includes('roulette')) {
            const { RouletteGame } = await import('../games/RouletteGame');
            const modalContainer = document.createElement('div');
            modalContainer.id = 'roulette-game-container';
            document.body.appendChild(modalContainer);
            const rouletteGame = new RouletteGame(modalContainer);
            rouletteGame.start(user.id);
          } else {
            alert(`Le jeu "${game.name}" va bientôt être disponible en mode interactif ! 🎉`);
          }
        });
      }
    }
  }

  private renderError(): void {
    this.container.innerHTML = `
      <div class="error-container">
        <h2>😵 Jeu introuvable</h2>
        <p>Ce jeu n'existe pas ou a été supprimé.</p>
        <a href="#/games" class="btn btn-primary">Retour aux jeux</a>
      </div>
    `;
  }
}
