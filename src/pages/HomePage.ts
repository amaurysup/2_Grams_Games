import { supabase } from '../lib/supabase';
import type { Theme, Game } from '../types';
import { GameChatbot } from '../components/GameChatbot';
import { buildThemesFromGames, THEME_DEFINITIONS } from '../themes/themeDefinitions';

export class HomePage {
  private container: HTMLElement;
  private gamesListContainer: HTMLElement | null = null;
  private state: {
    loading: boolean;
    error: boolean;
    themes: Theme[];
    allGames: Game[];
    searchQuery: string;
    activeFilters: Set<string>;
    structureRendered: boolean;
  };
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
      searchQuery: '',
      activeFilters: new Set<string>(),
      structureRendered: false,
    };
    this.chatbot = null;
    void this.init();
  }

  private async init(): Promise<void> {
    this.renderStructure();
    await this.loadThemes();
  }

  private async loadThemes(): Promise<void> {
    try {
      console.log('🔄 Chargement des jeux depuis Supabase...');

      const { data: games, error: gamesError } = await supabase
        .from('jeux')
        .select('*');
      
      if (gamesError) {
        console.error('❌ Erreur lors de la récupération des jeux:', gamesError);
        throw gamesError;
      }

      const allGamesFromDB: Game[] = games || [];
      console.log('✅ Tous les jeux récupérés:', allGamesFromDB.length);

      this.state.themes = buildThemesFromGames(allGamesFromDB);
      this.state.error = false;
      this.state.allGames = allGamesFromDB;

      console.log('✅ Thèmes avec jeux:', this.state.themes);
      
      this.initChatbot();
    } catch (error) {
      console.error('❌ Erreur lors du chargement des thèmes', error);
      this.state.error = true;
      this.state.themes = [];
    } finally {
      this.state.loading = false;
      this.renderGamesList();
    }
  }

  /**
   * Filter games based on search query and active theme filters
   */
  private getFilteredGames(): Game[] {
    let games = [...this.state.allGames];
    
    if (this.state.searchQuery.trim()) {
      const query = this.state.searchQuery.toLowerCase().trim();
      games = games.filter(game => 
        game.name.toLowerCase().includes(query) ||
        game.description.toLowerCase().includes(query)
      );
    }
    
    if (this.state.activeFilters.size > 0) {
      games = games.filter(game => {
        for (const filterId of this.state.activeFilters) {
          const themeDef = THEME_DEFINITIONS.find(t => t.id === filterId);
          if (themeDef && game[themeDef.dbField] === true) {
            return true;
          }
        }
        return false;
      });
    }
    
    return games;
  }

  /**
   * Build themes from filtered games
   */
  private getFilteredThemes(): Theme[] {
    const filteredGames = this.getFilteredGames();
    return buildThemesFromGames(filteredGames);
  }

  /**
   * Handle search input change - only updates games list, not the whole page
   */
  private handleSearchChange(query: string): void {
    this.state.searchQuery = query;
    this.updateClearButtonVisibility();
    this.renderGamesList();
  }

  /**
   * Toggle a theme filter
   */
  private toggleFilter(themeId: string): void {
    if (this.state.activeFilters.has(themeId)) {
      this.state.activeFilters.delete(themeId);
    } else {
      this.state.activeFilters.add(themeId);
    }
    this.updateFilterChipsState();
    this.updateClearButtonVisibility();
    this.renderGamesList();
  }

  /**
   * Clear all filters and search
   */
  private clearFilters(): void {
    this.state.searchQuery = '';
    this.state.activeFilters.clear();
    
    // Update the search input value
    const searchInput = this.container.querySelector<HTMLInputElement>('#game-search');
    if (searchInput) {
      searchInput.value = '';
    }
    
    this.updateFilterChipsState();
    this.updateClearButtonVisibility();
    this.renderGamesList();
  }

  /**
   * Update the visual state of filter chips without re-rendering
   */
  private updateFilterChipsState(): void {
    const chips = this.container.querySelectorAll<HTMLButtonElement>('.filter-chip');
    chips.forEach(chip => {
      const filterId = chip.dataset.filterId;
      if (filterId) {
        const isActive = this.state.activeFilters.has(filterId);
        chip.classList.toggle('filter-chip--active', isActive);
        chip.setAttribute('aria-pressed', String(isActive));
      }
    });
  }

  /**
   * Update the visibility of the clear button
   */
  private updateClearButtonVisibility(): void {
    const clearBtn = this.container.querySelector<HTMLButtonElement>('#clear-filters');
    const hasFilters = this.state.searchQuery || this.state.activeFilters.size > 0;
    
    if (clearBtn) {
      clearBtn.style.display = hasFilters ? 'flex' : 'none';
    }
  }

  private initChatbot(): void {
    if (this.state.allGames.length === 0) return;
    
    this.chatbot = new GameChatbot(this.state.allGames, (gameId) => {
      window.location.hash = `/game/${gameId}`;
    });
    
    document.body.appendChild(this.chatbot.render());
    this.addChatbotButton();
  }

  private addChatbotButton(): void {
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

  /**
   * Render the page structure ONCE (header, search, filters, games container)
   * This prevents the search input from losing focus on re-render
   */
  private renderStructure(): void {
    if (this.state.structureRendered) return;
    
    this.container.innerHTML = `
      <div class="home-page">
        <section class="themes-screen" data-testid="themes-screen">
          <header class="themes-header" data-testid="themes-header">
            <p class="themes-header__subtitle">Fais ton choix, scroll à droite 👇</p>
            <div class="search-filter-container">
              <div class="search-bar">
                <span class="search-icon">🔍</span>
                <input 
                  type="text" 
                  id="game-search" 
                  class="search-input" 
                  placeholder="Rechercher un jeu..."
                  value=""
                  autocomplete="off"
                />
                <button class="search-clear" id="clear-filters" aria-label="Effacer les filtres" style="display: none;">✕</button>
              </div>
              <div class="filter-chips">
                ${THEME_DEFINITIONS.map(theme => `
                  <button 
                    class="filter-chip"
                    data-filter-id="${theme.id}"
                    aria-pressed="false"
                  >
                    ${theme.emoji} ${theme.label}
                  </button>
                `).join('')}
              </div>
            </div>
          </header>
          <div id="games-list-container" class="themes-list" data-testid="themes-list">
            <!-- Games will be rendered here -->
          </div>
        </section>
      </div>
    `;
    
    this.gamesListContainer = this.container.querySelector('#games-list-container');
    this.state.structureRendered = true;
    this.attachStaticListeners();
    
    // Show loading state initially
    this.renderGamesList();
  }

  /**
   * Attach listeners that don't need to be re-attached (search, filters)
   */
  private attachStaticListeners(): void {
    // Search input - immediate update for responsive feel
    const searchInput = this.container.querySelector<HTMLInputElement>('#game-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.handleSearchChange((e.target as HTMLInputElement).value);
      });
    }

    // Clear filters button
    const clearBtn = this.container.querySelector<HTMLButtonElement>('#clear-filters');
    clearBtn?.addEventListener('click', () => this.clearFilters());

    // Filter chips
    const filterChips = this.container.querySelectorAll<HTMLButtonElement>('.filter-chip');
    filterChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const filterId = chip.dataset.filterId;
        if (filterId) {
          this.toggleFilter(filterId);
        }
      });
    });
  }

  /**
   * Render ONLY the games list (called on search/filter changes)
   * This preserves the header and search input in the DOM
   */
  private renderGamesList(): void {
    if (!this.gamesListContainer) return;

    const { loading, error } = this.state;

    if (loading) {
      this.gamesListContainer.innerHTML = `
        <div class="themes-skeleton" role="status" aria-live="polite">
          ${this.renderSkeleton()}
        </div>
      `;
      return;
    }

    if (error) {
      this.gamesListContainer.innerHTML = `
        <div class="themes-error" role="alert">
          <div class="themes-error__emoji">😵</div>
          <h2 class="themes-error__title">Une petite soif d'internet ?</h2>
          <p class="themes-error__subtitle">Le chargement a échoué. Vérifie ta connexion puis réessaie.</p>
          <button class="themes-error__button" data-testid="themes-retry">Réessayer</button>
        </div>
      `;
      this.attachRetryListener();
      return;
    }

    const filteredThemes = this.getFilteredThemes();
    const hasFilters = this.state.searchQuery || this.state.activeFilters.size > 0;

    // No games found after filtering
    if (filteredThemes.length === 0 && hasFilters) {
      this.gamesListContainer.innerHTML = `
        <div class="themes-empty themes-empty--filtered" role="status">
          <div class="themes-empty__emoji">🔍</div>
          <h2 class="themes-empty__title">Aucun jeu trouvé</h2>
          <p class="themes-empty__subtitle">Essaie avec d'autres filtres ou une autre recherche.</p>
          <button class="btn btn-secondary" id="clear-all-filters">Effacer les filtres</button>
        </div>
      `;
      this.attachClearAllListener();
      return;
    }

    // No games at all (empty database)
    if (this.state.allGames.length === 0) {
      this.gamesListContainer.innerHTML = `
        <div class="themes-empty" role="status">
          <div class="themes-empty__emoji">🕹️</div>
          <h2 class="themes-empty__title">Rien à afficher</h2>
          <p class="themes-empty__subtitle">Reviens plus tard pour découvrir de nouveaux thèmes.</p>
        </div>
      `;
      return;
    }

    // Render themes and games
    const themesSections = filteredThemes.map((theme) => this.renderTheme(theme)).join('');
    this.gamesListContainer.innerHTML = themesSections;
    this.attachGameCardListeners();
  }

  private attachRetryListener(): void {
    const retryButton = this.gamesListContainer?.querySelector<HTMLButtonElement>('[data-testid="themes-retry"]');
    if (retryButton) {
      retryButton.addEventListener('click', () => {
        this.state.loading = true;
        this.state.error = false;
        this.renderGamesList();
        void this.loadThemes();
      });
    }
  }

  private attachClearAllListener(): void {
    const clearAllBtn = this.gamesListContainer?.querySelector<HTMLButtonElement>('#clear-all-filters');
    clearAllBtn?.addEventListener('click', () => this.clearFilters());
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
    const colorIndex = theme.id.charCodeAt(0) % colors.length;
    const badgeColor = colors[colorIndex];
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
        ${imageUrl ? `<img src="${imageUrl}" alt="${game.name}" class="theme-game-card__image" onerror="this.style.display='none'" />` : ''}
        <h3 class="theme-game-card__title">${game.name}</h3>
        <div class="theme-game-card__cta">
          <span class="theme-game-card__cta-text">Jouer</span>
          <span class="theme-game-card__cta-chevron" aria-hidden="true">${chevron}</span>
        </div>
      </article>
    `;
  }

  private attachGameCardListeners(): void {
    const cards = Array.from(this.gamesListContainer?.querySelectorAll<HTMLElement>('.theme-game-card') || []);
    cards.forEach((card) => {
      const gameId = card.dataset.gameId;
      if (!gameId) return;

      const handleActivation = () => {
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
}
