export class LandingPage {
  private container: HTMLElement;

  constructor(containerId: string) {
    const element = document.getElementById(containerId);
    if (!element) throw new Error(`Element with id ${containerId} not found`);
    
    this.container = element;
    this.render();
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="landing-page">
        <section class="landing-hero">
          <div class="landing-hero__content">
            <h1 class="landing-hero__title">
              🍺 2 GRAMS GAMES
            </h1>
            <p class="landing-hero__tagline">
              La référence ultime pour tes soirées entre amis
            </p>
            
            <div class="landing-value-props">
              <div class="value-prop">
                <div class="value-prop__icon">🎮</div>
                <h3 class="value-prop__title">Des centaines de jeux</h3>
                <p class="value-prop__description">
                  Beer Pong, Kings Cup, et bien plus encore. 
                  Tous les classiques et les dernières tendances.
                </p>
              </div>
              
              <div class="value-prop">
                <div class="value-prop__icon">🎨</div>
                <h3 class="value-prop__title">Organisé par thèmes</h3>
                <p class="value-prop__description">
                  Trouve rapidement le jeu parfait selon l'ambiance : 
                  soirées calmes, défis extrêmes, ou jeux de cartes.
                </p>
              </div>
              
              <div class="value-prop">
                <div class="value-prop__icon">📱</div>
                <h3 class="value-prop__title">Toujours accessible</h3>
                <p class="value-prop__description">
                  Accès immédiat depuis ton téléphone. 
                  Pas besoin d'application, tout est sur le web.
                </p>
              </div>
            </div>

            <div class="landing-cta">
              <a href="#" data-route="/games" class="landing-cta__button">
                🎉 Découvrir les jeux
              </a>
              <p class="landing-cta__subtitle">
                Gratuit • Pas d'inscription requise
              </p>
            </div>
          </div>
        </section>

        <section class="landing-features">
          <div class="landing-features__content">
            <h2 class="landing-features__title">Pourquoi 2 Grams Games ?</h2>
            
            <div class="feature-grid">
              <div class="feature-card">
                <div class="feature-card__number">01</div>
                <h3 class="feature-card__title">Règles claires</h3>
                <p class="feature-card__description">
                  Chaque jeu expliqué étape par étape. 
                  Fini les débats interminables sur les règles !
                </p>
              </div>

              <div class="feature-card">
                <div class="feature-card__number">02</div>
                <h3 class="feature-card__title">Mise à jour régulière</h3>
                <p class="feature-card__description">
                  Nouveaux jeux ajoutés chaque semaine. 
                  Ne tombe plus jamais à court d'idées.
                </p>
              </div>

              <div class="feature-card">
                <div class="feature-card__number">03</div>
                <h3 class="feature-card__title">Pour tous les goûts</h3>
                <p class="feature-card__description">
                  Des jeux calmes aux défis fous. 
                  Il y en a pour tous les niveaux et toutes les ambiances.
                </p>
              </div>

              <div class="feature-card">
                <div class="feature-card__number">04</div>
                <h3 class="feature-card__title">Communauté active</h3>
                <p class="feature-card__description">
                  Partage tes variantes et découvre celles des autres. 
                  Rejoins une communauté de fêtards créatifs.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section class="landing-final-cta">
          <div class="landing-final-cta__content">
            <h2 class="landing-final-cta__title">
              Prêt à enflammer ta prochaine soirée ?
            </h2>
            <a href="#" data-route="/games" class="landing-cta__button landing-cta__button--large">
              🚀 C'est parti !
            </a>
          </div>
        </section>

        <footer class="landing-footer">
          <div class="landing-footer__content">
            <p class="landing-footer__warning">
              ⚠️ L'abus d'alcool est dangereux pour la santé. À consommer avec modération.
            </p>
            <p class="landing-footer__copyright">
              © 2025 2 Grams Games. Tous droits réservés.
            </p>
          </div>
        </footer>
      </div>
    `;
  }
}
