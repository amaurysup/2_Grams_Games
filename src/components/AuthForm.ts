import { authContext } from '../context/AuthContext';

export class AuthForm {
  private container: HTMLElement;
  private mode: 'login' | 'signup';

  constructor(container: HTMLElement, initialMode: 'login' | 'signup' = 'login') {
    this.container = container;
    this.mode = initialMode;
    this.render();
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="auth-form-container">
        <div class="auth-tabs">
          <button class="auth-tab ${this.mode === 'login' ? 'active' : ''}" data-mode="login">
            Connexion
          </button>
          <button class="auth-tab ${this.mode === 'signup' ? 'active' : ''}" data-mode="signup">
            Inscription
          </button>
        </div>

        <form class="auth-form" id="authForm">
          ${this.mode === 'signup' ? `
            <div class="form-group">
              <label for="username">Nom d'utilisateur</label>
              <input type="text" id="username" name="username" required minlength="3">
              <span class="error-message" id="usernameError"></span>
            </div>
          ` : ''}

          <div class="form-group">
            <label for="email">${this.mode === 'login' ? 'Email ou nom d\'utilisateur' : 'Email'}</label>
            <input type="${this.mode === 'login' ? 'text' : 'email'}" id="email" name="email" required>
            <span class="error-message" id="emailError"></span>
          </div>

          <div class="form-group">
            <label for="password">Mot de passe</label>
            <input type="password" id="password" name="password" required minlength="6">
            <span class="error-message" id="passwordError"></span>
          </div>

          ${this.mode === 'signup' ? `
            <div class="form-group">
              <label for="confirmPassword">Confirmer le mot de passe</label>
              <input type="password" id="confirmPassword" name="confirmPassword" required>
              <span class="error-message" id="confirmPasswordError"></span>
            </div>
          ` : ''}

          <div class="form-error" id="formError"></div>
          <div class="form-success" id="formSuccess"></div>

          <button type="submit" class="btn btn-primary btn-full" id="submitBtn">
            ${this.mode === 'login' ? 'Se connecter' : 'S\'inscrire'}
          </button>
        </form>
      </div>
    `;

    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    // Gestion des onglets
    const tabs = this.container.querySelectorAll('.auth-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const newMode = (e.target as HTMLElement).dataset.mode as 'login' | 'signup';
        if (newMode !== this.mode) {
          this.mode = newMode;
          this.render();
        }
      });
    });

    // Gestion du formulaire
    const form = this.container.querySelector('#authForm') as HTMLFormElement;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleSubmit(form);
    });
  }

  private async handleSubmit(form: HTMLFormElement): Promise<void> {
    // Reset des messages d'erreur
    this.clearErrors();

    const formData = new FormData(form);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const username = formData.get('username') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    // Validation
    if (!this.validateForm(email, password, username, confirmPassword)) {
      return;
    }

    // Désactiver le bouton pendant la soumission
    const submitBtn = form.querySelector('#submitBtn') as HTMLButtonElement;
    submitBtn.disabled = true;
    submitBtn.textContent = this.mode === 'login' ? 'Connexion...' : 'Inscription...';

    try {
      let result;
      
      if (this.mode === 'signup') {
        result = await authContext.signUp(email, password, username);
        
        if (result.success) {
          this.showSuccess('Inscription réussie ! Vérifiez votre email pour confirmer votre compte.');
          setTimeout(() => {
            window.location.hash = '/';
          }, 2000);
        } else {
          this.showError(result.error || 'Erreur lors de l\'inscription');
        }
      } else {
        result = await authContext.signIn(email, password);
        
        if (result.success) {
          this.showSuccess('Connexion réussie !');
          setTimeout(() => {
            window.location.hash = '/';
          }, 1000);
        } else {
          this.showError(result.error || 'Email ou mot de passe incorrect');
        }
      }
    } catch (error) {
      this.showError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = this.mode === 'login' ? 'Se connecter' : 'S\'inscrire';
    }
  }

  private validateForm(email: string, password: string, username: string, confirmPassword: string): boolean {
    let isValid = true;

    // Validation email/identifier
    if (this.mode === 'login') {
      // For login, just check it's not empty
      if (!email || email.trim().length < 3) {
        this.setFieldError('emailError', 'Entrez votre email ou nom d\'utilisateur');
        isValid = false;
      }
    } else {
      // For signup, validate email format
      if (!email || !email.includes('@')) {
        this.setFieldError('emailError', 'Email invalide');
        isValid = false;
      }
    }

    // Validation password
    if (!password || password.length < 6) {
      this.setFieldError('passwordError', 'Le mot de passe doit contenir au moins 6 caractères');
      isValid = false;
    }

    if (this.mode === 'signup') {
      // Validation username
      if (!username || username.length < 3) {
        this.setFieldError('usernameError', 'Le nom d\'utilisateur doit contenir au moins 3 caractères');
        isValid = false;
      }

      // Validation confirm password
      if (password !== confirmPassword) {
        this.setFieldError('confirmPasswordError', 'Les mots de passe ne correspondent pas');
        isValid = false;
      }
    }

    return isValid;
  }

  private setFieldError(fieldId: string, message: string): void {
    const errorElement = this.container.querySelector(`#${fieldId}`);
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.classList.add('visible');
    }
  }

  private showError(message: string): void {
    const errorElement = this.container.querySelector('#formError');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.classList.add('visible');
    }
  }

  private showSuccess(message: string): void {
    const successElement = this.container.querySelector('#formSuccess');
    if (successElement) {
      successElement.textContent = message;
      successElement.classList.add('visible');
    }
  }

  private clearErrors(): void {
    const errors = this.container.querySelectorAll('.error-message, .form-error, .form-success');
    errors.forEach(error => {
      error.textContent = '';
      error.classList.remove('visible');
    });
  }
}
