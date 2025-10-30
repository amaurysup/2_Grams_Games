import '../style.css';
import { Router } from './router';
import { Navbar } from './components/Navbar';

// Initialiser la navigation
new Navbar('navbar');

// Initialiser le routeur
new Router('app');

// Footer
const footer = document.getElementById('footer');
if (footer) {
  footer.innerHTML = `
    <footer class="footer">
      <p>&copy; 2025 2 Grams Games. Tous droits réservés.</p>
    </footer>
  `;
}

console.log('🍺 2 Grams Games - Application TypeScript chargée !');
