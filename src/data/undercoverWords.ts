/**
 * Bibliothèque de mots secrets pour le jeu Undercover
 * Format: liste de mots qui peuvent être choisis aléatoirement
 */

export const UNDERCOVER_WORDS = [
  // Animaux
  "Chat", "Chien", "Lion", "Tigre", "Éléphant", "Girafe", "Dauphin", "Requin",
  "Aigle", "Serpent", "Lapin", "Renard", "Ours", "Loup", "Singe", "Kangourou",
  
  // Objets du quotidien
  "Téléphone", "Ordinateur", "Voiture", "Vélo", "Chaise", "Table", "Lit", "Canapé",
  "Lampe", "Miroir", "Livre", "Stylo", "Montre", "Lunettes", "Clés", "Portefeuille",
  
  // Nourriture
  "Pizza", "Burger", "Pâtes", "Sushi", "Chocolat", "Glace", "Gâteau", "Fromage",
  "Pain", "Croissant", "Salade", "Soupe", "Steak", "Poulet", "Poisson", "Riz",
  
  // Lieux
  "Plage", "Montagne", "Forêt", "Désert", "Ville", "Village", "Île", "Lac",
  "Rivière", "Océan", "Parc", "Musée", "Cinéma", "Restaurant", "Bar", "Hôtel",
  
  // Métiers
  "Médecin", "Professeur", "Policier", "Pompier", "Avocat", "Architecte", "Chef",
  "Artiste", "Musicien", "Acteur", "Écrivain", "Journaliste", "Pilote", "Ingénieur",
  
  // Sports
  "Football", "Basketball", "Tennis", "Natation", "Course", "Yoga", "Boxe", "Golf",
  "Ski", "Surf", "Escalade", "Danse", "Vélo", "Rugby", "Volleyball", "Baseball",
  
  // Couleurs
  "Rouge", "Bleu", "Vert", "Jaune", "Orange", "Violet", "Rose", "Noir",
  "Blanc", "Gris", "Marron", "Beige", "Turquoise", "Doré", "Argenté", "Bordeaux",
  
  // Nature
  "Arbre", "Fleur", "Nuage", "Soleil", "Lune", "Étoile", "Pluie", "Neige",
  "Vent", "Feu", "Eau", "Terre", "Pierre", "Sable", "Herbe", "Feuille",
  
  // Émotions/Concepts
  "Amour", "Joie", "Tristesse", "Colère", "Peur", "Surprise", "Fierté", "Jalousie",
  "Liberté", "Justice", "Paix", "Guerre", "Rêve", "Cauchemar", "Espoir", "Chance",
  
  // Technologies
  "Internet", "Robot", "Drone", "Satellite", "Laser", "Fusée", "Wifi", "Bluetooth",
  "Email", "Message", "Photo", "Vidéo", "Musique", "Application", "Jeu", "Site",
  
  // Vêtements
  "Pantalon", "Chemise", "Robe", "Jupe", "Manteau", "Veste", "Pull", "Tshirt",
  "Chaussures", "Bottes", "Baskets", "Sandales", "Chapeau", "Casquette", "Écharpe", "Gants",
  
  // Instruments
  "Piano", "Guitare", "Violon", "Batterie", "Trompette", "Flûte", "Saxophone", "Harpe",
  "Accordéon", "Banjo", "Ukulélé", "Basse", "Synthé", "Orgue", "Clarinette", "Tambour",
  
  // Pays/Villes
  "France", "Paris", "Londres", "Tokyo", "Berlin", "Rome", "Madrid", "Lisbonne",
  "Amsterdam", "Bruxelles", "Genève", "Zurich", "Barcelone", "Milan", "Vienne", "Prague",

  // Personnalités
  "Einstein", "Napoléon", "Shakespeare", "Mozart", "Picasso", "Curie", "Gandhi", "Mandela","Zelensky", "Poutine", "AD Laurent", "Vinicius Jr",

  // Lieux
  "Octogone", "Fontaine de Trévi", "Grande Muraille", "Machu Picchu", "Taj Mahal", "Pyramides", "Colisée", "Stonehenge"

];

/**
 * Sélectionne un mot aléatoire de la bibliothèque
 */
export function getRandomWord(): string {
  const randomIndex = Math.floor(Math.random() * UNDERCOVER_WORDS.length);
  return UNDERCOVER_WORDS[randomIndex];
}
