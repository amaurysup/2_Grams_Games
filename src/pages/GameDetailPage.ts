import { GamesService } from '../services/GamesService';

export class GameDetailPage {
  private container: HTMLElement;
  private gamesService: GamesService;
  private gameId: number;

  constructor(containerId: string, gameId: number) {
    const element = document.getElementById(containerId);
    if (!element) throw new Error(`Element with id ${containerId} not found`);
    
    this.container = element;
    this.gamesService = new GamesService();
    this.gameId = gameId;
    this.render();
  }

  private render(): void {
    const game = this.gamesService.getGameById(this.gameId);

    if (!game) {
      this.container.innerHTML = `
        <div class="error-container">
          <h2>Jeu introuvable</h2>
          <a href="#" data-route="/" class="btn btn-primary">Retour à l'accueil</a>
        </div>
      `;
      return;
    }

    this.container.innerHTML = `
      <div class="game-detail ${game.color}">
        <div class="game-detail-header">
          <div class="game-detail-icon">${game.icon}</div>
          <h1 class="game-detail-title">${game.title}</h1>
          <p class="game-detail-description">${game.description}</p>
        </div>
        
        <div class="game-detail-info">
          <div class="info-card">
            <strong>👥 Joueurs:</strong> ${game.players}
          </div>
          <div class="info-card">
            <strong>⏱️ Durée:</strong> ${game.duration}
          </div>
        </div>

        <div class="game-detail-rules">
          <h2>📋 RÈGLES DU JEU</h2>
          <ol class="rules-list">
            ${game.rules.map((rule: string) => `<li>${rule}</li>`).join('')}
          </ol>
        </div>

        <div class="game-detail-footer">
          <a href="#" data-route="/" class="btn btn-secondary">← Retour aux jeux</a>
          <button class="btn btn-primary">⭐ Ajouter aux favoris</button>
        </div>
      </div>
    `;
  }
}
