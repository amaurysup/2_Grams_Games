import { GamesService } from '../services/GamesService';
import { GameCard } from '../components/GameCard';

export class HomePage {
  private container: HTMLElement;
  private gamesService: GamesService;

  constructor(containerId: string) {
    const element = document.getElementById(containerId);
    if (!element) throw new Error(`Element with id ${containerId} not found`);
    
    this.container = element;
    this.gamesService = new GamesService();
    this.render();
  }

  private render(): void {
    const games = this.gamesService.getAllGames();

    this.container.innerHTML = `
      <header class="hero">
        <div class="hero-content">
          <h2 class="hero-title">🍺 BIENVENUE SUR 2 GRAMS GAMES</h2>
          <p class="hero-subtitle">La plus grande collection de jeux d'alcool pour des soirées inoubliables !</p>
          <div class="hero-buttons">
            <a href="#" data-route="/signup" class="btn btn-primary">🎉 Commencer maintenant</a>
            <a href="#jeux" class="btn btn-secondary">Découvrir les jeux</a>
          </div>
        </div>
      </header>

      <section id="jeux" class="games-section">
        <h2 class="section-title">NOS JEUX POPULAIRES</h2>
        ${GameCard.renderGrid(games)}
      </section>

      <section id="apropos" class="about-section">
        <div class="about-content">
          <h2 class="section-title">À PROPOS</h2>
          <p>2 Grams Games est votre référence ultime pour tous les jeux d'alcool. Que vous organisiez une soirée entre amis ou cherchiez de nouvelles idées pour animer vos fêtes, nous avons ce qu'il vous faut !</p>
          <p class="warning">⚠️ À consommer avec modération. L'abus d'alcool est dangereux pour la santé.</p>
        </div>
      </section>
    `;

    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    const gameButtons = this.container.querySelectorAll('.btn-card');
    gameButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const gameId = (e.target as HTMLElement).dataset.gameId;
        if (gameId) {
          window.location.hash = `/game/${gameId}`;
        }
      });
    });
  }
}
