/**
 * Composant bouton "Quitter la partie" réutilisable pour tous les jeux
 */

export class QuitGameButton {
  /**
   * Génère le HTML du bouton "Quitter"
   */
  static render(): string {
    return `
      <button class="btn-quit-game" id="btn-quit-game">
        <span class="btn-quit-icon">🚪</span>
        <span class="btn-quit-text">Quitter la partie</span>
      </button>
    `;
  }

  /**
   * Attache les événements au bouton avec une callback personnalisée
   * @param onQuit - Fonction à appeler quand on clique sur Quitter
   */
  static attach(onQuit: () => void): void {
    const btn = document.getElementById('btn-quit-game');
    if (btn) {
      btn.addEventListener('click', onQuit);
    }
  }

  /**
   * Retourne les styles CSS pour le bouton
   */
  static getStyles(): string {
    return `
      .btn-quit-game {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.8rem 1.5rem;
        background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
        color: white;
        border: none;
        border-radius: 12px;
        font-size: 1rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .btn-quit-game:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(231, 76, 60, 0.4);
        background: linear-gradient(135deg, #c0392b 0%, #a93226 100%);
      }

      .btn-quit-game:active {
        transform: translateY(0);
      }

      .btn-quit-icon {
        font-size: 1.2rem;
        animation: swing 2s ease-in-out infinite;
      }

      @keyframes swing {
        0%, 100% { transform: rotate(0deg); }
        25% { transform: rotate(-10deg); }
        75% { transform: rotate(10deg); }
      }

      .btn-quit-game:hover .btn-quit-icon {
        animation: none;
        transform: scale(1.1);
      }
    `;
  }
}
