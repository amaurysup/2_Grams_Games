/**
 * Card Component - Renders a playing card-style visual element
 * Used for card-based games like "Je n'ai jamais" (Never Have I Ever)
 */

export interface CardOptions {
  title?: string;
  content: string;
  subtitle?: string;
  color?: 'pink' | 'turquoise' | 'yellow' | 'purple';
  icon?: string;
}

export class Card {
  private options: CardOptions;

  constructor(options: CardOptions) {
    this.options = {
      color: 'pink',
      icon: '🃏',
      ...options
    };
  }

  /**
   * Renders the card HTML
   */
  public render(): string {
    const { title, content, subtitle, color, icon } = this.options;

    return `
      <div class="playing-card playing-card--${color}">
        <div class="playing-card__corner playing-card__corner--top">
          <span class="playing-card__icon">${icon}</span>
        </div>
        
        <div class="playing-card__body">
          ${title ? `<div class="playing-card__title">${title}</div>` : ''}
          <div class="playing-card__content">${content}</div>
          ${subtitle ? `<div class="playing-card__subtitle">${subtitle}</div>` : ''}
        </div>
        
        <div class="playing-card__corner playing-card__corner--bottom">
          <span class="playing-card__icon">${icon}</span>
        </div>
      </div>
    `;
  }

  /**
   * Updates the card content
   */
  public setContent(content: string): void {
    this.options.content = content;
  }

  /**
   * Updates the card subtitle
   */
  public setSubtitle(subtitle: string): void {
    this.options.subtitle = subtitle;
  }

  /**
   * Static method to create a card and render it directly
   */
  public static create(options: CardOptions): string {
    const card = new Card(options);
    return card.render();
  }

  /**
   * Static method to get CSS styles for the card component
   * This should be injected into the page if not already in style.css
   */
  public static getStyles(): string {
    return `
      .playing-card {
        position: relative;
        width: 280px;
        height: 400px;
        background: white;
        border-radius: 20px;
        box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 1.5rem;
        margin: 0 auto;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        overflow: hidden;
      }

      .playing-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
      }

      .playing-card--pink {
        background: linear-gradient(145deg, #fff 0%, #fff5f7 100%);
        border: 4px solid var(--pink, #ff6b9d);
      }

      .playing-card--turquoise {
        background: linear-gradient(145deg, #fff 0%, #f0fffe 100%);
        border: 4px solid var(--turquoise, #4ecdc4);
      }

      .playing-card--yellow {
        background: linear-gradient(145deg, #fff 0%, #fffbf0 100%);
        border: 4px solid var(--yellow, #ffe66d);
      }

      .playing-card--purple {
        background: linear-gradient(145deg, #fff 0%, #f8f5ff 100%);
        border: 4px solid #9b59b6;
      }

      .playing-card__corner {
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .playing-card__corner--top {
        top: 15px;
        left: 15px;
      }

      .playing-card__corner--bottom {
        bottom: 15px;
        right: 15px;
        transform: rotate(180deg);
      }

      .playing-card__icon {
        font-size: 2rem;
      }

      .playing-card__body {
        text-align: center;
        padding: 1rem;
        max-width: 100%;
      }

      .playing-card__title {
        font-size: 1.2rem;
        font-weight: 700;
        color: #666;
        margin-bottom: 1rem;
        text-transform: uppercase;
        letter-spacing: 2px;
      }

      .playing-card__content {
        font-size: 1.4rem;
        font-weight: 600;
        color: var(--dark, #2d3436);
        line-height: 1.5;
        word-wrap: break-word;
      }

      .playing-card__subtitle {
        margin-top: 1.5rem;
        font-size: 1rem;
        color: #888;
        font-style: italic;
      }

      /* Card animations */
      .playing-card.card-enter {
        animation: cardSwipeIn 0.5s ease forwards;
      }

      .playing-card.card-exit {
        animation: cardSwipeOut 0.4s ease forwards;
      }

      @keyframes cardSwipeIn {
        from {
          opacity: 0;
          transform: translateX(100px) rotate(10deg) scale(0.8);
        }
        to {
          opacity: 1;
          transform: translateX(0) rotate(0) scale(1);
        }
      }

      @keyframes cardSwipeOut {
        from {
          opacity: 1;
          transform: translateX(0) rotate(0) scale(1);
        }
        to {
          opacity: 0;
          transform: translateX(-100px) rotate(-10deg) scale(0.8);
        }
      }

      /* Responsive */
      @media (max-width: 480px) {
        .playing-card {
          width: 240px;
          height: 340px;
          padding: 1rem;
        }

        .playing-card__content {
          font-size: 1.2rem;
        }

        .playing-card__icon {
          font-size: 1.5rem;
        }
      }
    `;
  }
}
