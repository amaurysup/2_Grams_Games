export class LandingPage {
  private container: HTMLElement;

  constructor(containerId: string) {
    console.log('🎯 LandingPage - Constructor appelé');
    const element = document.getElementById(containerId);
    if (!element) throw new Error(`Element with id ${containerId} not found`);
    
    this.container = element;
    this.render();
    console.log('✅ LandingPage - Render terminé');
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="landing-page">
        <section class="landing-hero-full">
          <div class="landing-hero-full__content">
            <div class="landing-hero-full__logo">
              <img src="/icons/icon-192x192.png" alt="2 Grams Games" class="landing-logo-img" />
            </div>
            
            <h1 class="landing-hero-full__title">
              2 GRAMS GAMES
            </h1>
            
            <p class="landing-hero-full__pitch">
              T'as déjà passé 20 minutes à chercher un jeu d'alcool sur Google ?<br>
              Nous aussi. C'est pour ça qu'on a tout mis au même endroit.
            </p>

            <div class="landing-hero-full__features">
              <span class="landing-feature-badge">✨ Des centaines de jeux</span>
              <span class="landing-feature-badge">🎯 Organisés par thèmes</span>
              <span class="landing-feature-badge">📱 Direct sur ton phone</span>
            </div>

            <a href="#" data-route="/games" class="landing-hero-full__cta">
              Trouve ton jeu 🚀
            </a>

            <div class="landing-hero-full__warning">
              ⚠️ L'abus d'alcool est dangereux pour la santé
            </div>
          </div>
        </section>
      </div>
    `;
  }
}
