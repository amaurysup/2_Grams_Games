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
      
      // Chercher le jeu dans toutes les tables
      const tables = ['beer_pong', 'chiffres_romains', 'je_nai_jamais', 'jeu_roi'];
      let game: Game | null = null;

      for (const table of tables) {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .eq('id', this.gameId)
          .single();

        if (!error && data) {
          game = data;
          break;
        }
      }

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
    this.container.innerHTML = `
      <div class="game-detail">
        <div class="game-detail-header">
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
