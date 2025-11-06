import { supabase } from '../lib/supabase';
import type { Theme, Game } from '../types';

export class HomePage {
  private container: HTMLElement;
  private state: {
    loading: boolean;
    error: boolean;
    themes: Theme[];
  };
  private focusedThemeId: string | null;

  constructor(containerId: string) {
    const element = document.getElementById(containerId);
    if (!element) throw new Error(`Element with id ${containerId} not found`);
    
    this.container = element;
    this.state = {
      loading: true,
      error: false,
      themes: [],
    };
    this.focusedThemeId = null;
    void this.init();
  }

  private async init(): Promise<void> {
    this.render();
    await this.loadThemes();
  }

  private async loadThemes(): Promise<void> {
    try {
      console.log('🔄 Chargement des thèmes depuis Supabase...');
      
      // Récupérer tous les thèmes
      const { data: themes, error: themesError } = await supabase
        .from('themes')
        .select('*')
        .order('created_at', { ascending: true });

      if (themesError) throw themesError;
      if (!themes) throw new Error('Aucun thème trouvé');

      console.log('✅ Thèmes récupérés:', themes);

      // Pour chaque thème, récupérer ses jeux depuis toutes les tables
      const themesWithGames: Theme[] = await Promise.all(
        themes.map(async (theme) => {
          const allGames: Game[] = [];

          // Récupérer les jeux de chaque table
          const tables = ['beer_pong', 'chiffres_romains', 'je_nai_jamais', 'jeu_roi'];
          
          for (const table of tables) {
            const { data: games, error } = await supabase
              .from(table)
              .select('*')
              .eq('theme_id', theme.id);
            
            if (!error && games) {
              allGames.push(...games);
            }
          }

          console.log(`✅ Jeux pour ${theme.name}:`, allGames.length);

          return {
            ...theme,
            games: allGames
          };
        })
      );

      // Filtrer les thèmes qui ont au moins 1 jeu
      this.state.themes = themesWithGames.filter(t => (t.games?.length ?? 0) > 0);
      this.focusedThemeId = this.state.themes[0]?.id ?? null;
      this.state.error = false;

      console.log('✅ Thèmes avec jeux:', this.state.themes);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des thèmes', error);
      this.state.error = true;
      this.state.themes = [];
    } finally {
      this.state.loading = false;
      this.render();
    }
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
        <section class="themes-screen" data-testid="themes-screen">
          ${header}
          <div class="themes-skeleton" role="status" aria-live="polite">
            ${this.renderSkeleton()}
          </div>
        </section>
      `;
    }

    if (error) {
      return `
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
        <section class="themes-screen" data-testid="themes-screen">
          ${header}
          <div class="themes-empty" role="status">
            <div class="themes-empty__emoji">🕹️</div>
            <h2 class="themes-empty__title">Rien à afficher</h2>
            <p class="themes-empty__subtitle">Reviens plus tard pour découvrir de nouveaux thèmes.</p>
          </div>
        </section>
      `;
    }

    const themesSections = themes.map((theme) => this.renderTheme(theme)).join('');

    return `
      <section class="themes-screen" data-testid="themes-screen">
        ${header}
        <div class="themes-list" data-testid="themes-list">
          ${themesSections}
        </div>
      </section>
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
