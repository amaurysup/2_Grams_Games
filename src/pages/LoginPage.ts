import { AuthForm } from '../components/AuthForm';

export class LoginPage {
  private container: HTMLElement;

  constructor(containerId: string) {
    const element = document.getElementById(containerId);
    if (!element) throw new Error(`Element with id ${containerId} not found`);
    
    this.container = element;
    this.render();
  }

  private render(): void {
    // Vérifier s'il y a un message d'erreur d'authentification
    const authError = sessionStorage.getItem('authError');
    let errorMessage = '';
    if (authError) {
      errorMessage = `<div class="auth-error-banner">${authError}</div>`;
      sessionStorage.removeItem('authError'); // Nettoyer après affichage
    }

    this.container.innerHTML = `
      <div class="auth-container">
        <div class="auth-card">
          <h2 class="auth-title">BIENVENUE !</h2>
          ${errorMessage}
          <div id="authFormContainer"></div>
        </div>
      </div>
    `;

    // Initialiser le AuthForm avec mode login
    const authFormContainer = document.getElementById('authFormContainer');
    if (authFormContainer) {
      new AuthForm(authFormContainer, 'login');
    }
  }
}
