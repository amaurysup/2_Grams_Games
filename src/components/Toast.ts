/**
 * Toast notification component for user feedback
 */

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
}

class ToastManager {
  private container: HTMLElement | null = null;

  private ensureContainer(): HTMLElement {
    if (this.container && document.body.contains(this.container)) {
      return this.container;
    }

    // Remove any existing container
    const existing = document.getElementById('toast-container');
    if (existing) existing.remove();

    this.container = document.createElement('div');
    this.container.id = 'toast-container';
    this.container.className = 'toast-container';
    document.body.appendChild(this.container);
    
    return this.container;
  }

  show(options: ToastOptions): void {
    const { message, type = 'info', duration = 4000 } = options;
    const container = this.ensureContainer();

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    
    const icon = this.getIcon(type);
    
    toast.innerHTML = `
      <span class="toast__icon">${icon}</span>
      <span class="toast__message">${this.escapeHtml(message)}</span>
      <button class="toast__close" aria-label="Fermer">×</button>
    `;

    // Add close button handler
    const closeBtn = toast.querySelector('.toast__close');
    closeBtn?.addEventListener('click', () => this.dismiss(toast));

    container.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('toast--visible');
    });

    // Auto dismiss
    if (duration > 0) {
      setTimeout(() => this.dismiss(toast), duration);
    }
  }

  private dismiss(toast: HTMLElement): void {
    toast.classList.remove('toast--visible');
    toast.classList.add('toast--hiding');
    
    setTimeout(() => {
      toast.remove();
    }, 300);
  }

  private getIcon(type: ToastType): string {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': 
      default: return 'ℹ️';
    }
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Convenience methods
  success(message: string, duration?: number): void {
    this.show({ message, type: 'success', duration });
  }

  error(message: string, duration?: number): void {
    this.show({ message, type: 'error', duration });
  }

  warning(message: string, duration?: number): void {
    this.show({ message, type: 'warning', duration });
  }

  info(message: string, duration?: number): void {
    this.show({ message, type: 'info', duration });
  }
}

// Singleton instance
export const toast = new ToastManager();
