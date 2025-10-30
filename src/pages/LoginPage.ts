import { AuthService } from '../services/AuthService';

export class LoginPage {
  private container: HTMLElement;
  private authService: AuthService;

  constructor(containerId: string, authService: AuthService) {
    const element = document.getElementById(containerId);
    if (!element) throw new Error(`Element with id ${containerId} not found`);
    
    this.container = element;
    this.authService = authService;
    this.render();
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="auth-container">
        <div class="auth-card">
          <h2 class="auth-title">CONNEXION</h2>
          <form id="loginForm" class="auth-form">
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" name="email" required>
            </div>
            <div class="form-group">
              <label for="password">Mot de passe</label>
              <input type="password" id="password" name="password" required>
            </div>
            <button type="submit" class="btn btn-primary">Se connecter</button>
            <p class="auth-link">
              Pas encore de compte ? 
              <a href="#" data-route="/register">S'inscrire</a>
            </p>
          </form>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    const form = document.getElementById('loginForm') as HTMLFormElement;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;

      if (this.authService.login(email, password)) {
        alert('Connexion réussie !');
        window.location.hash = '/';
      } else {
        alert('Email ou mot de passe incorrect');
      }
    });
  }
}
