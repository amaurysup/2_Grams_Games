import type { Game } from '../types';

export class GameCard {
  private game: Game;

  constructor(game: Game) {
    this.game = game;
  }

  render(): string {
    return `
      <div class="game-card ${this.game.color}">
        <div class="game-icon">${this.game.icon}</div>
        <h3 class="game-title">${this.game.title}</h3>
        <p class="game-description">${this.game.description}</p>
        <button class="btn-card" data-game-id="${this.game.id}">Voir les règles</button>
      </div>
    `;
  }

  static renderGrid(games: Game[]): string {
    return `
      <div class="games-grid">
        ${games.map(game => new GameCard(game).render()).join('')}
      </div>
    `;
  }
}
