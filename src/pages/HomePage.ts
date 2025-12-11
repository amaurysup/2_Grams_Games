import { supabase } from '../lib/supabase';
import type { Theme, Game } from '../types';
import { GameChatbot } from '../components/GameChatbot';
import { buildThemesFromGames } from '../themes/themeDefinitions';

export class HomePage {
  private container: HTMLElement;
  private state: {
    loading: boolean;
    error: boolean;
    themes: Theme[];
    allGames: Game[];
  };
  private focusedThemeId: string | null;
  private chatbot: GameChatbot | null;

  constructor(containerId: string) {
    const element = document.getElementById(containerId);
    if (!element) throw new Error(`Element with id ${containerId} not found`);
    
    this.container = element;
    this.state = {
      loading: true,
      error: false,
      themes: [],
      allGames: [],
    };
    this.focusedThemeId = null;
    this.chatbot = null;
    void this.init();
  }

  private async init(): Promise<void> {
    this.render();
    await this.loadThemes();
  }

  private async loadThemes(): Promise<void> {
    try {
      console.log('🔄 Chargement des jeux depuis Supabase...');

      // Récupérer tous les jeux
      const { data: games, error: gamesError } = await supabase
        .from('jeux')
        .select('*');
      
      if (gamesError) {
        console.error('❌ Erreur lors de la récupération des jeux:', gamesError);
        throw gamesError;
      }

      const allGamesFromDB: Game[] = games || [];
      console.log('✅ Tous les jeux récupérés:', allGamesFromDB.length);
      console.log('📝 Détail des jeux:', allGamesFromDB);

      // Créer des thèmes à partir des définitions centralisées
      this.state.themes = buildThemesFromGames(allGamesFromDB);
      this.focusedThemeId = this.state.themes[0]?.id ?? null;
      this.state.error = false;
      this.state.allGames = allGamesFromDB;

      console.log('✅ Thèmes avec jeux:', this.state.themes);
      
      // Initialiser le chatbot avec tous les jeux
      this.initChatbot();
    } catch (error) {
      console.error('❌ Erreur lors du chargement des thèmes', error);
      this.state.error = true;
      this.state.themes = [];
    } finally {
      this.state.loading = false;
      this.render();
    }
  }

  private initChatbot(): void {
    if (this.state.allGames.length === 0) return;
    
    this.chatbot = new GameChatbot(this.state.allGames, (gameId) => {
      window.location.hash = `/game/${gameId}`;
    });
    
    // Ajouter le chatbot au DOM
    document.body.appendChild(this.chatbot.render());
    
    // Ajouter le bouton flottant
    this.addChatbotButton();
    
    // Ajouter le bouton mode Tinder
    this.addTinderButton();
  }

  private addChatbotButton(): void {
    // Vérifier si le bouton existe déjà
    if (document.getElementById('chatbot-fab')) return;
    
    const fab = document.createElement('button');
    fab.id = 'chatbot-fab';
    fab.className = 'chatbot-fab';
    fab.setAttribute('aria-label', 'Ouvrir l\'assistant de jeux');
    fab.innerHTML = `
      <span class="fab-icon">🤖</span>
      <span class="fab-pulse"></span>
    `;
    
    fab.addEventListener('click', () => {
      this.chatbot?.toggle();
    });
    
    document.body.appendChild(fab);
  }

  private addTinderButton(): void {
    // Vérifier si le bouton existe déjà
    if (document.getElementById('tinder-fab')) return;
    
    const fab = document.createElement('button');
    fab.id = 'tinder-fab';
    fab.className = 'tinder-fab';
    fab.setAttribute('aria-label', 'Mode Tinder - Trouver un jeu');
    fab.innerHTML = `
      <span class="fab-icon">🔥</span>
      <span class="fab-label">Tinder</span>
    `;
    
    fab.addEventListener('click', () => {
      window.location.hash = '/tinder';
    });
    
    document.body.appendChild(fab);
  }

  private render(): void {
    this.container.innerHTML = this.buildTemplate();
    this.attachGlobalListeners();
    this.attachGameCardListeners();
    this.restoreFocus();
  }

  private buildTemplate(): string {
    const { loading, error, themes } = this.state;

    const header = `
      <header class="themes-header" data-testid="themes-header">
        <div class="themes-header__content">
          <h1 id="themes-header-title" class="themes-header__title" tabindex="-1">Découvre les thèmes</h1>
          <p class="themes-header__subtitle">Fais ton choix, scroll à droite 👇</p>
        </div>
      </header>
    `;

    if (loading) {
      return `
        <div class="home-page">
          <section class="themes-screen" data-testid="themes-screen">
            ${header}
            <div class="themes-skeleton" role="status" aria-live="polite">
              ${this.renderSkeleton()}
            </div>
          </section>
        </div>
      `;
    }

    if (error) {
      return `
        <div class="home-page">
          <section class="themes-screen" data-testid="themes-screen">
            ${header}
            <div class="themes-error" role="alert">
              <div class="themes-error__emoji">😵</div>
            <h2 class="themes-error__title">Une petite soif d'internet ?</h2>
            <p class="themes-error__subtitle">Le chargement a échoué. Vérifie ta connexion puis réessaie.</p>
            <button class="themes-error__button" data-testid="themes-retry">Réessayer</button>
          </div>
        </section>
      `;
    }

    if (themes.length === 0) {
      return `
        <div class="home-page">
          <section class="themes-screen" data-testid="themes-screen">
            ${header}
            <div class="themes-empty" role="status">
              <div class="themes-empty__emoji">🕹️</div>
              <h2 class="themes-empty__title">Rien à afficher</h2>
              <p class="themes-empty__subtitle">Reviens plus tard pour découvrir de nouveaux thèmes.</p>
            </div>
          </section>
        </div>
      `;
    }

    const themesSections = themes.map((theme) => this.renderTheme(theme)).join('');

    return `
      <div class="home-page">
        <section class="themes-screen" data-testid="themes-screen">
          ${header}
          <div class="themes-list" data-testid="themes-list">
            ${themesSections}
          </div>
        </section>
      </div>
    `;
  }

  private renderSkeleton(): string {
    const sections = Array.from({ length: 3 }).map((_, sectionIndex) => {
      const cards = Array.from({ length: 4 })
        .map(
          (_card, cardIndex) => `
            <div class="themes-skeleton__card" data-testid="themes-skeleton-card-${sectionIndex}-${cardIndex}">
              <div class="themes-skeleton__badge"></div>
              <div class="themes-skeleton__emoji"></div>
              <div class="themes-skeleton__line themes-skeleton__line--title"></div>
              <div class="themes-skeleton__line"></div>
            </div>
          `
        )
        .join('');

      return `
        <div class="themes-skeleton__section" data-testid="themes-skeleton-section-${sectionIndex}">
          <div class="themes-skeleton__title"></div>
          <div class="themes-skeleton__carousel">
            ${cards}
          </div>
        </div>
      `;
    });

    return sections.join('');
  }

  private renderTheme(theme: Theme): string {
    const games = (theme.games || []).map((game) => this.renderGameCard(theme, game)).join('');
    const colors = ['#FF1493', '#FFD700', '#00CED1', '#7C5CFF', '#FF6B6B'];
    const badgeColor = colors[Math.floor(Math.random() * colors.length)];
    const gamesCount = theme.games?.length || 0;

    return `
      <section class="theme-block" data-theme-id="${theme.id}" aria-labelledby="theme-title-${theme.id}" data-testid="theme-block-${theme.id}">
        <div class="theme-block__header">
          <span class="theme-block__accent" style="background:${badgeColor};"></span>
          <h2 id="theme-title-${theme.id}" class="theme-block__title" tabindex="-1">${theme.emoji} ${theme.name}</h2>
          <p class="theme-block__meta" aria-hidden="true">${gamesCount} jeu${gamesCount > 1 ? 'x' : ''}</p>
        </div>
        <div class="theme-carousel" role="list" data-testid="theme-carousel-${theme.id}" aria-label="${theme.name}, ${gamesCount} jeux">
          ${games}
        </div>
      </section>
    `;
  }

  private renderGameCard(theme: Theme, game: Game): string {
    const chevron = '›';
    const ariaLabel = `${game.name}. Appuie pour voir les règles.`;
    const imageUrl = (game as any).image || '';

    return `
      <article
        class="theme-game-card"
        role="button"
        tabindex="0"
        data-theme-id="${theme.id}"
        data-game-id="${game.id}"
        data-testid="theme-game-card-${game.id}"
        aria-label="${ariaLabel}"
      >
        ${imageUrl ? `<img src="${imageUrl}" alt="${game.name}" class="theme-game-card__image" />` : ''}
        <h3 class="theme-game-card__title">${game.name}</h3>
        <div class="theme-game-card__cta">
          <span class="theme-game-card__cta-text">Jouer</span>
          <span class="theme-game-card__cta-chevron" aria-hidden="true">${chevron}</span>
        </div>
      </article>
    `;
  }

  private attachGlobalListeners(): void {
    const retryButton = this.container.querySelector<HTMLButtonElement>('[data-testid="themes-retry"]');
    if (retryButton) {
      retryButton.addEventListener('click', () => {
        this.state.loading = true;
        this.state.error = false;
        this.render();
        void this.loadThemes();
      });
    }
  }

  private attachGameCardListeners(): void {
    const cards = Array.from(this.container.querySelectorAll<HTMLElement>('.theme-game-card'));
    cards.forEach((card) => {
      const themeId = card.dataset.themeId;
      const gameId = card.dataset.gameId;
      if (!themeId || !gameId) {
        return;
      }

      const handleActivation = () => {
        this.focusedThemeId = themeId;
        window.location.hash = `/game/${gameId}`;
      };

      card.addEventListener('click', handleActivation);
      card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleActivation();
        }
      });
    });
  }

  private restoreFocus(): void {
    if (this.state.loading) {
      return;
    }

    const headerTitle = this.container.querySelector<HTMLElement>('#themes-header-title');

    if (!this.state.error && this.state.themes.length > 0 && headerTitle) {
      setTimeout(() => {
        headerTitle.focus();
      }, 120);
    }

    if (this.focusedThemeId) {
      const themeHeader = this.container.querySelector<HTMLElement>(`#theme-title-${this.focusedThemeId}`);
      if (themeHeader) {
        setTimeout(() => {
          themeHeader.focus();
        }, 160);
      }
    }
  }
}
