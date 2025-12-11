/**
 * PWA Install Button Component
 * Handles the beforeinstallprompt event and provides install UI
 */

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

class PWAInstallManager {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private installButton: HTMLElement | null = null;
  private isInstalled: boolean = false;

  constructor() {
    this.init();
  }

  private init(): void {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalled = true;
      console.log('📱 PWA: App is already installed');
      return;
    }

    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('📱 PWA: beforeinstallprompt event fired');
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      this.showInstallButton();
    });

    // Listen for successful installation
    window.addEventListener('appinstalled', () => {
      console.log('📱 PWA: App was installed');
      this.isInstalled = true;
      this.hideInstallButton();
      this.deferredPrompt = null;
    });
  }

  /**
   * Create and show the install button
   */
  private showInstallButton(): void {
    // Don't show if already exists
    if (document.getElementById('pwa-install-btn')) return;

    this.installButton = document.createElement('button');
    this.installButton.id = 'pwa-install-btn';
    this.installButton.className = 'pwa-install-btn';
    this.installButton.innerHTML = `
      <span class="pwa-install-icon">📲</span>
      <span class="pwa-install-text">Installer l'app</span>
    `;
    this.installButton.setAttribute('aria-label', 'Installer l\'application');

    this.installButton.addEventListener('click', () => this.promptInstall());

    // Add to body
    document.body.appendChild(this.installButton);

    // Animate in
    requestAnimationFrame(() => {
      this.installButton?.classList.add('pwa-install-btn--visible');
    });
  }

  /**
   * Hide the install button
   */
  private hideInstallButton(): void {
    if (this.installButton) {
      this.installButton.classList.remove('pwa-install-btn--visible');
      setTimeout(() => {
        this.installButton?.remove();
        this.installButton = null;
      }, 300);
    }
  }

  /**
   * Prompt the user to install the PWA
   */
  async promptInstall(): Promise<boolean> {
    if (!this.deferredPrompt) {
      console.log('📱 PWA: No deferred prompt available');
      return false;
    }

    // Show the install prompt
    await this.deferredPrompt.prompt();

    // Wait for the user's response
    const { outcome } = await this.deferredPrompt.userChoice;
    console.log(`📱 PWA: User ${outcome} the installation`);

    // Clear the deferred prompt
    this.deferredPrompt = null;

    if (outcome === 'accepted') {
      this.hideInstallButton();
      return true;
    }

    return false;
  }

  /**
   * Check if the app can be installed
   */
  canInstall(): boolean {
    return this.deferredPrompt !== null && !this.isInstalled;
  }

  /**
   * Check if the app is installed
   */
  isAppInstalled(): boolean {
    return this.isInstalled || window.matchMedia('(display-mode: standalone)').matches;
  }
}

// CSS styles for the install button (injected dynamically)
const injectStyles = () => {
  if (document.getElementById('pwa-install-styles')) return;

  const style = document.createElement('style');
  style.id = 'pwa-install-styles';
  style.textContent = `
    .pwa-install-btn {
      position: fixed;
      bottom: 100px;
      left: 20px;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      background: linear-gradient(135deg, var(--pink, #FF1493) 0%, #e0117f 100%);
      color: white;
      border: none;
      border-radius: 25px;
      font-size: 14px;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(255, 20, 147, 0.4);
      transform: translateY(100px);
      opacity: 0;
      transition: all 0.3s ease;
      z-index: 9999;
    }

    .pwa-install-btn--visible {
      transform: translateY(0);
      opacity: 1;
    }

    .pwa-install-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 25px rgba(255, 20, 147, 0.5);
    }

    .pwa-install-btn:active {
      transform: translateY(0);
    }

    .pwa-install-icon {
      font-size: 18px;
    }

    @media (max-width: 480px) {
      .pwa-install-btn {
        left: 50%;
        transform: translateX(-50%) translateY(100px);
        bottom: 90px;
      }

      .pwa-install-btn--visible {
        transform: translateX(-50%) translateY(0);
      }

      .pwa-install-btn:hover {
        transform: translateX(-50%) translateY(-2px);
      }
    }
  `;
  document.head.appendChild(style);
};

// Initialize styles
injectStyles();

// Export singleton instance
export const pwaInstall = new PWAInstallManager();

// Export for use in other components
export { PWAInstallManager };
