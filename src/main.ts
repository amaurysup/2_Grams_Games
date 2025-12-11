import '../style.css';
import { Router } from './router';
import { Navbar } from './components/Navbar';
import { pwaInstall } from './components/PWAInstallButton';

// Initialiser la navigation
new Navbar('navbar');

// Initialiser le routeur
new Router('app');

// Initialiser le gestionnaire PWA
console.log('📱 PWA Install available:', pwaInstall.canInstall());

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
