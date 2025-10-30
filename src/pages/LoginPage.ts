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
    this.container.innerHTML = `
      <div class="auth-container">
        <div class="auth-card">
          <h2 class="auth-title">BIENVENUE !</h2>
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
