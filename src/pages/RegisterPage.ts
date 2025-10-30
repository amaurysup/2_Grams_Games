import { AuthService } from '../services/AuthService';

export class RegisterPage {
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
          <h2 class="auth-title">INSCRIPTION</h2>
          <form id="registerForm" class="auth-form">
            <div class="form-group">
              <label for="username">Nom d'utilisateur</label>
              <input type="text" id="username" name="username" required>
            </div>
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" name="email" required>
            </div>
            <div class="form-group">
              <label for="password">Mot de passe</label>
              <input type="password" id="password" name="password" required>
            </div>
            <div class="form-group">
              <label for="confirmPassword">Confirmer le mot de passe</label>
              <input type="password" id="confirmPassword" name="confirmPassword" required>
            </div>
            <button type="submit" class="btn btn-primary">S'inscrire</button>
            <p class="auth-link">
              Déjà un compte ? 
              <a href="#" data-route="/login">Se connecter</a>
            </p>
          </form>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    const form = document.getElementById('registerForm') as HTMLFormElement;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      const username = formData.get('username') as string;
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;
      const confirmPassword = formData.get('confirmPassword') as string;

      if (password !== confirmPassword) {
        alert('Les mots de passe ne correspondent pas');
        return;
      }

      if (this.authService.register(email, username, password)) {
        alert('Inscription réussie ! Bienvenue sur 2 Grams Games 🎉');
        window.location.hash = '/';
      } else {
        alert('Erreur lors de l\'inscription');
      }
    });
  }
}
