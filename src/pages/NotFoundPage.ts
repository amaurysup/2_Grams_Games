export class NotFoundPage {
  private container: HTMLElement;

  constructor(containerId: string) {
    const element = document.getElementById(containerId);
    if (!element) throw new Error(`Element with id ${containerId} not found`);
    
    this.container = element;
    this.render();
  }

  private render(): void {
    this.container.innerHTML = `
      <section class="page not-found">
        <div class="not-found-content">
          <div class="not-found-emoji">🍻</div>
          <h1>404 — Page introuvable</h1>
          <p>Cette page n'existe pas... T'as peut-être trop bu ? 😅</p>
          <a data-route href="#/" class="btn btn-primary">Retour à l'accueil</a>
        </div>
      </section>
    `;
  }
}
