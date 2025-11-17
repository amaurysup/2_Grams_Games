import { Game } from '../types';
import { GameRecommendationService, GameRecommendation } from '../services/GameRecommendationService';

export class GameChatbot {
  private container: HTMLElement;
  private recommendationService: GameRecommendationService;
  private onGameClick?: (gameId: string) => void;

  constructor(games: Game[], onGameClick?: (gameId: string) => void) {
    this.container = document.createElement('div');
    this.recommendationService = new GameRecommendationService(games);
    this.onGameClick = onGameClick;
  }

  render(): HTMLElement {
    this.container.className = 'chatbot-container';
    this.container.innerHTML = `
      <div class="chatbot-header">
        <div class="chatbot-header-content">
          <span class="chatbot-icon">🤖</span>
          <div class="chatbot-header-text">
            <h3>Assistant 2 Grams</h3>
            <p class="chatbot-status">En ligne</p>
          </div>
        </div>
        <button class="chatbot-close" aria-label="Fermer le chatbot">✕</button>
      </div>
      
      <div class="chatbot-messages" id="chatbot-messages">
        <div class="message assistant-message">
          <div class="message-avatar">🤖</div>
          <div class="message-content">
            <p>Salut ! 👋 Je suis là pour t'aider à trouver le jeu parfait !</p>
            <p>Tu peux me dire :</p>
            <ul>
              <li>🎯 Combien de joueurs vous êtes</li>
              <li>😌 L'ambiance que tu veux (chill, intense, fou...)</li>
              <li>🎲 Le type de jeu (découverte, réflexion, chaos...)</li>
            </ul>
            <p><strong>Alors, qu'est-ce qui te ferait plaisir ?</strong></p>
          </div>
        </div>
      </div>

      <div class="chatbot-suggestions" id="chatbot-suggestions">
        <button class="suggestion-chip" data-suggestion="Je veux un jeu chill pour 4 joueurs">
          😌 Jeu chill à 4
        </button>
        <button class="suggestion-chip" data-suggestion="Un truc intense et délirant">
          🔥 Intense et fou
        </button>
        <button class="suggestion-chip" data-suggestion="Un jeu de découverte">
          🎯 Découverte
        </button>
        <button class="suggestion-chip" data-suggestion="Quelque chose avec de la stratégie">
          🧠 Stratégie
        </button>
      </div>

      <div class="chatbot-input-container">
        <input 
          type="text" 
          class="chatbot-input" 
          id="chatbot-input"
          placeholder="Dis-moi ce que tu cherches..."
          autocomplete="off"
        />
        <button class="chatbot-send" id="chatbot-send" aria-label="Envoyer le message">
          <span class="send-icon">➤</span>
        </button>
      </div>
    `;

    this.attachEventListeners();
    return this.container;
  }

  private attachEventListeners() {
    // Bouton fermer
    const closeBtn = this.container.querySelector('.chatbot-close');
    closeBtn?.addEventListener('click', () => {
      this.container.classList.remove('chatbot-visible');
    });

    // Bouton envoyer
    const sendBtn = this.container.querySelector('#chatbot-send');
    const input = this.container.querySelector('#chatbot-input') as HTMLInputElement;
    
    sendBtn?.addEventListener('click', () => this.handleSendMessage());
    input?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.handleSendMessage();
      }
    });

    // Suggestions rapides
    const suggestions = this.container.querySelectorAll('.suggestion-chip');
    suggestions.forEach(chip => {
      chip.addEventListener('click', (e) => {
        const suggestion = (e.target as HTMLElement).dataset.suggestion;
        if (suggestion) {
          input.value = suggestion;
          this.handleSendMessage();
        }
      });
    });
  }

  private async handleSendMessage() {
    const input = this.container.querySelector('#chatbot-input') as HTMLInputElement;
    const message = input.value.trim();

    if (!message) return;

    // Afficher le message de l'utilisateur
    this.addUserMessage(message);
    input.value = '';

    // Masquer les suggestions après le premier message
    const suggestionsContainer = this.container.querySelector('#chatbot-suggestions') as HTMLElement;
    if (suggestionsContainer) {
      suggestionsContainer.style.display = 'none';
    }

    // Afficher un indicateur de chargement
    this.addTypingIndicator();

    // Obtenir les recommandations
    try {
      const { response, recommendations } = await this.recommendationService.getRecommendations(message);
      
      // Retirer l'indicateur de chargement
      this.removeTypingIndicator();

      // Afficher la réponse
      this.addAssistantMessage(response, recommendations);
    } catch (error) {
      this.removeTypingIndicator();
      this.addAssistantMessage("Oups, j'ai eu un petit bug 😅 Réessaye !");
    }
  }

  private addUserMessage(text: string) {
    const messagesContainer = this.container.querySelector('#chatbot-messages');
    const messageEl = document.createElement('div');
    messageEl.className = 'message user-message';
    messageEl.innerHTML = `
      <div class="message-content">
        <p>${this.escapeHtml(text)}</p>
      </div>
      <div class="message-avatar">👤</div>
    `;
    messagesContainer?.appendChild(messageEl);
    this.scrollToBottom();
  }

  private addAssistantMessage(text: string, recommendations?: GameRecommendation[]) {
    const messagesContainer = this.container.querySelector('#chatbot-messages');
    const messageEl = document.createElement('div');
    messageEl.className = 'message assistant-message';
    
    // Convertir le markdown simple (gras)
    const formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    let html = `
      <div class="message-avatar">🤖</div>
      <div class="message-content">
        <p>${formattedText}</p>
    `;

    // Ajouter les cartes de recommandation
    if (recommendations && recommendations.length > 0) {
      html += '<div class="recommendations-grid">';
      recommendations.forEach(rec => {
        const themes = this.getGameThemes(rec.game);
        html += `
          <div class="recommendation-card" data-game-id="${rec.game.id}">
            ${rec.game.image ? `
              <div class="recommendation-image" style="background-image: url('${rec.game.image}')"></div>
            ` : `
              <div class="recommendation-image recommendation-no-image">🎲</div>
            `}
            <div class="recommendation-content">
              <h4>${this.escapeHtml(rec.game.name)}</h4>
              <p class="recommendation-desc">${this.truncate(rec.game.description, 100)}</p>
              <div class="recommendation-themes">
                ${themes.map(t => `<span class="theme-badge">${t}</span>`).join('')}
              </div>
              <button class="btn-view-game">Voir le jeu →</button>
            </div>
          </div>
        `;
      });
      html += '</div>';
    }

    html += '</div>';
    messageEl.innerHTML = html;

    // Attacher les événements sur les cartes
    if (recommendations && recommendations.length > 0) {
      messageEl.querySelectorAll('.recommendation-card').forEach(card => {
        card.addEventListener('click', () => {
          const gameId = (card as HTMLElement).dataset.gameId;
          if (gameId && this.onGameClick) {
            this.onGameClick(gameId);
            this.close();
          }
        });
      });
    }

    messagesContainer?.appendChild(messageEl);
    this.scrollToBottom();
  }

  private addTypingIndicator() {
    const messagesContainer = this.container.querySelector('#chatbot-messages');
    const indicator = document.createElement('div');
    indicator.className = 'message assistant-message typing-indicator';
    indicator.id = 'typing-indicator';
    indicator.innerHTML = `
      <div class="message-avatar">🤖</div>
      <div class="message-content">
        <div class="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `;
    messagesContainer?.appendChild(indicator);
    this.scrollToBottom();
  }

  private removeTypingIndicator() {
    const indicator = this.container.querySelector('#typing-indicator');
    indicator?.remove();
  }

  private scrollToBottom() {
    const messagesContainer = this.container.querySelector('#chatbot-messages');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  private getGameThemes(game: Game): string[] {
    const themes: string[] = [];
    if (game.chill) themes.push('😌 Chill');
    if (game.découverte) themes.push('🎯 Découverte');
    if (game.réflexion) themes.push('🧠 Réflexion');
    if (game.destruction) themes.push('💥 Chaos');
    if (game.embrouilles) themes.push('😈 Embrouilles');
    if (game.interactif) themes.push('🎮 Interactif');
    if (game.exploration) themes.push('🗺️ Exploration');
    return themes;
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private truncate(text: string, length: number): string {
    if (text.length <= length) return this.escapeHtml(text);
    return this.escapeHtml(text.substring(0, length)) + '...';
  }

  open() {
    this.container.classList.add('chatbot-visible');
    const input = this.container.querySelector('#chatbot-input') as HTMLInputElement;
    setTimeout(() => input?.focus(), 300);
  }

  close() {
    this.container.classList.remove('chatbot-visible');
  }

  toggle() {
    if (this.container.classList.contains('chatbot-visible')) {
      this.close();
    } else {
      this.open();
    }
  }

  reset() {
    this.recommendationService.reset();
    const messagesContainer = this.container.querySelector('#chatbot-messages');
    if (messagesContainer) {
      messagesContainer.innerHTML = `
        <div class="message assistant-message">
          <div class="message-avatar">🤖</div>
          <div class="message-content">
            <p>Salut ! 👋 Je suis là pour t'aider à trouver le jeu parfait !</p>
            <p>Tu peux me dire :</p>
            <ul>
              <li>🎯 Combien de joueurs vous êtes</li>
              <li>😌 L'ambiance que tu veux (chill, intense, fou...)</li>
              <li>🎲 Le type de jeu (découverte, réflexion, chaos...)</li>
            </ul>
            <p><strong>Alors, qu'est-ce qui te ferait plaisir ?</strong></p>
          </div>
        </div>
      `;
    }
    const suggestionsContainer = this.container.querySelector('#chatbot-suggestions');
    if (suggestionsContainer) {
      (suggestionsContainer as HTMLElement).style.display = 'flex';
    }
  }
}
