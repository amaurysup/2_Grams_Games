/**
 * Bibliothèque de cartes pour le jeu Piccola
 * Version HARDCORE - Jeu de soirée intense 🔥
 */

export interface PiccolaCard {
  id: number;
  type: 'distribution' | 'question' | 'action' | 'vote' | 'dare' | 'misc';
  text: string;
}

export const PICCOLA_CARDS: PiccolaCard[] = [
  // ========== CARTES DE DISTRIBUTION (Gorgées) ==========
  {
    id: 1,
    type: 'distribution',
    text: '{player1}, distribue 3 gorgées à qui tu veux'
  },
  {
    id: 2,
    type: 'distribution',
    text: 'Tout le monde boit 2 gorgées !'
  },
  {
    id: 3,
    type: 'distribution',
    text: '{player1}, choisis quelqu\'un qui boit 5 gorgées'
  },
  {
    id: 4,
    type: 'distribution',
    text: 'Les célibataires boivent 3 gorgées'
  },
  {
    id: 5,
    type: 'distribution',
    text: 'Les mecs boivent 4 gorgées'
  },
  {
    id: 6,
    type: 'distribution',
    text: 'Les filles boivent 4 gorgées'
  },
  {
    id: 7,
    type: 'distribution',
    text: '{player1} et {player2}, buvez chacun 3 gorgées en vous regardant dans les yeux'
  },
  {
    id: 8,
    type: 'distribution',
    text: 'Le plus jeune distribue 5 gorgées'
  },
  {
    id: 9,
    type: 'distribution',
    text: 'Le plus vieux boit 5 gorgées'
  },
  {
    id: 10,
    type: 'distribution',
    text: '{player1}, tu es le maître du jeu : distribue 5 gorgées comme tu veux pendant ce tour'
  },
  {
    id: 11,
    type: 'distribution',
    text: 'Ceux qui ont déjà vomi en soirée boivent 5 gorgées'
  },
  {
    id: 12,
    type: 'distribution',
    text: '{player1}, fais boire autant de gorgées que tu veux à une personne'
  },
  {
    id: 13,
    type: 'distribution',
    text: 'Dernier arrivé à la soirée boit 5 gorgées'
  },
  {
    id: 14,
    type: 'distribution',
    text: 'Tout le monde cul sec ! Allez, on est pas là pour rigoler'
  },
  {
    id: 15,
    type: 'distribution',
    text: '{player1}, tu choisis 2 personnes qui boivent chacune 4 gorgées'
  },

  // ========== CARTES QUESTIONS HARDCORE ==========
  {
    id: 16,
    type: 'question',
    text: '{player1}, cite la dernière personne avec qui tu as couché. Sinon bois 5 gorgées'
  },
  {
    id: 17,
    type: 'question',
    text: '{player1}, quel est ton body count ? Si tu refuses de répondre, bois 5 gorgées'
  },
  {
    id: 18,
    type: 'question',
    text: '{player1}, avec qui dans cette pièce tu coucherais si tu devais ? Désigne la personne ou bois 5 gorgées'
  },
  {
    id: 19,
    type: 'question',
    text: '{player1}, raconte ton pire plan cul raté. Si tu refuses, bois 5 gorgées'
  },
  {
    id: 20,
    type: 'question',
    text: '{player1}, avoue ton plus gros secret que personne ne connaît ici. Sinon tout le monde te fait boire 3 gorgées'
  },
  {
    id: 21,
    type: 'question',
    text: '{player1}, tu as déjà trompé quelqu\'un ? Réponds honnêtement ou bois 5 gorgées'
  },
  {
    id: 22,
    type: 'question',
    text: '{player1}, raconte la chose la plus illégalé que tu aies faite. Refuse = 5 gorgées'
  },
  {
    id: 23,
    type: 'question',
    text: '{player1}, donnee 2 qualités et 2 défauts de {player2}. Si tu refuses, bois 5 gorgées'
  },
  {
    id: 24,
    type: 'question',
    text: '{player1}, montre le dernier message hot que tu as envoyé. Sinon bois 5 gorgées'
  },
  {
    id: 25,
    type: 'question',
    text: '{player1}, tu as déjà fantasmé sur quelqu\'un ici ? Avoue ou bois 5 gorgées'
  },
  {
    id: 26,
    type: 'question',
    text: '{player1}, raconte ton truc le plus bizarre au lit. Refuse = 5 gorgées'
  },
  {
    id: 27,
    type: 'question',
    text: '{player1}, cite la dernière personne que tu as embrassé(e). Sinon 5 gorgées'
  },
  {
    id: 28,
    type: 'question',
    text: '{player1}, tu préfères {player2} ou {player3} ? Choisis ou bois 5 gorgées'
  },
  {
    id: 29,
    type: 'question',
    text: '{player1}, balance un ragot sur quelqu\'un ici. Si tu refuses, bois 5 gorgées'
  },
  {
    id: 30,
    type: 'question',
    text: '{player1}, tu as déjà fait un plan à 3 ? Réponds ou bois 5 gorgées'
  },

  // ========== CARTES ACTIONS HARDCORE ==========
  {
    id: 31,
    type: 'action',
    text: '{player1}, embrasse {player2} sur la bouche pendant 5 secondes ou buvez 5 gorgées chacun'
  },
  {
    id: 32,
    type: 'action',
    text: '{player1}, fais un lap dance de 15 secondes à {player2}. Refuse = 5 gorgées'
  },
  {
    id: 33,
    type: 'action',
    text: '{player1}, enlève un vêtement ou bois 5 gorgées'
  },
  {
    id: 34,
    type: 'action',
    text: '{player1}, lèche l\'oreille de {player2}. Si tu refuses, bois 5 gorgées'
  },
  {
    id: 35,
    type: 'action',
    text: '{player1}, mets-toi en sous-vêtements jusqu\'à la fin de la partie ou bois 5 gorgées'
  },
  {
    id: 36,
    type: 'action',
    text: '{player1}, fais 20 pompes. Chaque pompe ratée = 1 gorgée'
  },
  {
    id: 37,
    type: 'action',
    text: '{player1}, bois une gorgée en faisant le poirier. Si tu tombes, recommence'
  },
  {
    id: 38,
    type: 'action',
    text: '{player1}, appelle ton ex et dis lui que tu penses encore à lui/elle. Refuse = un CUL SEC'
  },
  {
    id: 39,
    type: 'action',
    text: '{player1}, fais un body shot sur {player2}. Refuse = 5 gorgées chacun'
  },
  {
    id: 40,
    type: 'action',
    text: '{player1}, mets ton doigt dans la bouche de {player2}. Refuse = 5 gorgées'
  },
  {
    id: 41,
    type: 'action',
    text: '{player1}, masse les épaules de {player2} pendant 1 minute. Refuse = 5 gorgées'
  },
  {
    id: 42,
    type: 'action',
    text: '{player1}, danse de manière sexy pendant 30 secondes. Si tu refuses, bois 5 gorgées'
  },
  {
    id: 43,
    type: 'action',
    text: '{player1}, fais un bisou sur le cou de {player2}. Refuse = 5 gorgées'
  },
  {
    id: 44,
    type: 'action',
    text: '{player1}, poste une story Instagram bizarre. Si tu refuses, bois 5 gorgées'
  },
  {
    id: 45,
    type: 'action',
    text: '{player1}, fais ton meilleur orgasme fake. Si tu refuses, bois 5 gorgées'
  },
  {
    id: 46,
    type: 'action',
    text: '{player1}, suce le doigt de {player2}. Refuse = 5 gorgées'
  },
  {
    id: 47,
    type: 'action',
    text: '{player1}, assieds-toi sur les genoux de {player2} pendant 2 tours. Refuse = 5 gorgées'
  },
  {
    id: 48,
    type: 'action',
    text: '{player1}, envoie un message hot à ton crush. Montre-le ou bois 5 gorgées'
  },
  {
    id: 49,
    type: 'action',
    text: '{player1}, fais un suçon à {player2}. Refuse = un CUL SEC chacun'
  },
  {
    id: 50,
    type: 'action',
    text: '{player1}, crie "JE SUIS CHAUD(E) CE SOIR" par la fenêtre. Refuse = 5 gorgées'
  },

  // ========== CARTES VOTE ==========
  {
    id: 51,
    type: 'vote',
    text: 'Qui a le plus de chance de finir seul(e) ? La personne désignée boit 5 gorgées'
  },
  {
    id: 52,
    type: 'vote',
    text: 'Qui serait le/la meilleur(e) au lit ? La personne désignée distribue 5 gorgées'
  },
  {
    id: 53,
    type: 'vote',
    text: 'Qui a le plus gros body count ? La personne boit 5 gorgées'
  },
  {
    id: 54,
    type: 'vote',
    text: 'Qui est le/la plus hypocrite ? La personne boit 5 gorgées'
  },
  {
    id: 55,
    type: 'vote',
    text: 'Qui va vomir en premier ce soir ? La personne boit 5 gorgées'
  },
  {
    id: 56,
    type: 'vote',
    text: 'Qui serait capable de tromper son/sa partenaire ? Boit 5 gorgées'
  },
  {
    id: 57,
    type: 'vote',
    text: 'Qui a le physique le plus sexy ? Distribue 5 gorgées'
  },
  {
    id: 58,
    type: 'vote',
    text: 'Qui est le/la plus salace ? Boit 5 gorgées'
  },
  {
    id: 59,
    type: 'vote',
    text: 'Qui a déjà couché avec le plus de monde ici ? Boit 5 gorgées'
  },
  {
    id: 60,
    type: 'vote',
    text: 'Qui va finir bourré en premier ? La personne boit 5 gorgées'
  },
  {
    id: 61,
    type: 'vote',
    text: 'Qui a la plus grosse... personnalité ? Distribue 4 gorgées'
  },
  {
    id: 62,
    type: 'vote',
    text: 'Qui est le/la plus cringe ? Boit 5 gorgées'
  },
  {
    id: 63,
    type: 'vote',
    text: 'Qui va finir en couple ce soir ? Les 2 personnes boivent 5 gorgées chacune'
  },
  {
    id: 64,
    type: 'vote',
    text: 'Qui cache le plus de secrets hot ? Boit 5 gorgées'
  },
  {
    id: 65,
    type: 'vote',
    text: 'Qui est le/la plus relou quand il/elle est bourré(e) ? Boit 5 gorgées'
  },

  // ========== CARTES DÉFIS (DARE) ==========
  {
    id: 66,
    type: 'dare',
    text: '{player1}, bois cul sec ou enlève 2 vêtements'
  },
  {
    id: 67,
    type: 'dare',
    text: '{player1}, action vérité extrême avec {player2} : tu choisis question hot ou action hot'
  },
  {
    id: 68,
    type: 'dare',
    text: '{player1}, bois 5 gorgées d\'affilée MAINTENANT'
  },
  {
    id: 69,
    type: 'dare',
    text: '{player1}, tu es en couple avec {player2} pour les 5 prochains tours. Vous buvez ensemble à chaque fois'
  },
  {
    id: 70,
    type: 'dare',
    text: '{player1}, embrasse la personne à ta gauche ou bois 5 gorgées'
  },
  {
    id: 71,
    type: 'dare',
    text: '{player1}, tu dois dire "Je t\'aime" à {player2} de manière convaincante. Rate = 5 gorgées'
  },
  {
    id: 72,
    type: 'dare',
    text: '{player1}, fais un strip-tease sur une chanson entière ou bois un CUL SEC'
  },
  {
    id: 73,
    type: 'dare',
    text: '{player1}, prends 3 shots d\'affilée ou retire tous tes vêtements du haut'
  },
  {
    id: 74,
    type: 'dare',
    text: '{player1}, tu as 30 secondes pour embrasser 3 personnes différentes. Échec = 5 gorgées'
  },
  {
    id: 75,
    type: 'dare',
    text: '{player1}, waterfall : tout le monde boit jusqu\'à ce que tu arrêtes'
  },
  {
    id: 76,
    type: 'dare',
    text: '{player1}, échange de vêtements avec {player2}. Refus = 5 gorgées chacun'
  },
  {
    id: 77,
    type: 'dare',
    text: '{player1}, fais ce que {player2} te demande (dans la limite du raisonnable). Refuse = un CUL SEC'
  },
  {
    id: 78,
    type: 'dare',
    text: '{player1}, tu es le/la roi(ne) : choisis 2 personnes qui s\'embrassent. Refus = 5 gorgées chacun'
  },
  {
    id: 79,
    type: 'dare',
    text: '{player1}, bois dans le verre de chaque personne présente'
  },
  {
    id: 80,
    type: 'dare',
    text: '{player1}, tu ne peux plus parler jusqu\'à ton prochain tour. Si tu parles = 5 gorgées à chaque fois'
  },

  // ========== CARTES RÈGLES SPÉCIALES ==========
  {
    id: 81,
    type: 'misc',
    text: 'NOUVELLE RÈGLE : Tout le monde doit boire avec la main gauche. Qui se trompe boit 3 gorgées'
  },
  {
    id: 82,
    type: 'misc',
    text: 'NOUVELLE RÈGLE : Interdit de dire "oui" ou "non". Qui se trompe boit 4 gorgées'
  },
  {
    id: 83,
    type: 'misc',
    text: 'NOUVELLE RÈGLE : Tout le monde doit vouvoyer {player1}. Qui se trompe boit 3 gorgées'
  },
  {
    id: 84,
    type: 'misc',
    text: 'BATAILLE DE CUL SEC : {player1} VS {player2}. Le plus lent boit 5 gorgées en plus'
  },
  {
    id: 85,
    type: 'misc',
    text: 'TOUR DE FOLIE : Tout le monde boit 5 gorgées MAINTENANT'
  },
  {
    id: 86,
    type: 'misc',
    text: 'NOUVELLE RÈGLE : Plus le droit de dire de gros mots. Qui se trompe boit 5 gorgées'
  },
  {
    id: 87,
    type: 'misc',
    text: 'MINI-JEU : Premier à envoyer "Je suis bourré(e)" dans le groupe WhatsApp. Le dernier boit 5 gorgées'
  },
  {
    id: 88,
    type: 'misc',
    text: '{player1} devient le roi/la reine : il/elle peut faire boire qui il/elle veut pendant 3 tours'
  },
  {
    id: 89,
    type: 'misc',
    text: 'CHAOS TOTAL : Tout le monde échange son verre avec la personne à sa droite'
  },
  {
    id: 90,
    type: 'misc',
    text: 'NOUVELLE RÈGLE : Quand quelqu\'un boit, tout le monde tape sur la table. Le dernier boit 5 gorgées'
  },
  {
    id: 91,
    type: 'misc',
    text: 'DEATH CARD : {player1} finit son verre d\'un coup !'
  },
  {
    id: 92,
    type: 'misc',
    text: 'ROULETTE RUSSE : {player1}, {player2} et {player3} boivent. Celui qui grimace le plus boit 5 gorgées en plus'
  },
  {
    id: 93,
    type: 'misc',
    text: 'DOUBLE PEINE : Les 2 dernières personnes à avoir bu boivent encore 5 gorgées'
  },
  {
    id: 94,
    type: 'misc',
    text: 'CHANCE : Personne ne boit ce tour-ci. Profitez-en !'
  },
  {
    id: 95,
    type: 'misc',
    text: 'MALCHANCE : Tout le monde sauf {player1} boit 4 gorgées'
  },
  {
    id: 96,
    type: 'misc',
    text: 'IMMUNITÉ : {player1} ne boit pas pendant les 3 prochains tours'
  },
  {
    id: 97,
    type: 'misc',
    text: 'VENGEANCE : {player1}, fais boire la personne qui t\'a fait boire en dernier. Double les gorgées !'
  },
  {
    id: 98,
    type: 'misc',
    text: 'KARAOKÉ IVRE : Chantez tous ensemble une chanson paillarde en buvant. Qui arrête boit 5 gorgées'
  },
  {
    id: 99,
    type: 'misc',
    text: 'ULTIMATE CHALLENGE : {player1}, fais ton meilleur sex tape face. Le groupe vote. Si <50% approuvent = 5 gorgées'
  },
  {
    id: 100,
    type: 'misc',
    text: 'GAME OVER : Tout le monde finit son verre. On remplit et on recommence !'
  },

  // ========== CARTES MULTI-JOUEURS (Pour groupes de 6-10) ==========
  {
    id: 101,
    type: 'distribution',
    text: '{player1}, {player2}, {player3} et {player4} : chacun boit 3 gorgées'
  },
  {
    id: 102,
    type: 'vote',
    text: 'Battle royale : {player1} VS {player2} VS {player3} VS {player4}. Le groupe vote pour le/la plus sexy. Les perdants boivent 5 gorgées'
  },
  {
    id: 103,
    type: 'action',
    text: '{player1}, {player2} et {player3} : faites un trio câlin pendant 10 secondes. Refus = 5 gorgées chacun'
  },
  {
    id: 104,
    type: 'dare',
    text: 'PYRAMIDE : {player1}, {player2}, {player3}, {player4} et {player5} buvez en cascade. Chacun boit 1 gorgée de plus que le précédent'
  },
  {
    id: 105,
    type: 'misc',
    text: 'ÉQUIPES : {player1} et {player2} VS {player3} et {player4}. Pierre-feuille-ciseaux. L\'équipe perdante boit 5 gorgées chacun'
  },
  {
    id: 106,
    type: 'action',
    text: '{player1}, choisis 3 personnes qui doivent faire un bisou en triangle. Refus = 5 gorgées chacun'
  },
  {
    id: 107,
    type: 'distribution',
    text: 'RONDE : {player1} commence, puis {player2}, puis {player3}... Chacun boit à son tour jusqu\'à ce que tout le monde ait bu'
  },
  {
    id: 108,
    type: 'dare',
    text: '{player1}, {player2}, {player3} et {player4} : dansez ensemble en cercle pendant 30 secondes. Refus = 5 gorgées chacun'
  },
  {
    id: 109,
    type: 'question',
    text: '{player1}, classe par ordre de préférence : {player2}, {player3}, {player4} et {player5}. Refuse = 5 gorgées'
  },
  {
    id: 110,
    type: 'misc',
    text: 'CHAOS : {player1}, {player2}, {player3}, {player4} et {player5} échangez vos places. Dernier debout distribue 5 gorgées'
  }
];

/**
 * Fonction helper pour remplacer les placeholders par les vrais prénoms
 * Supporte de 1 à 10 joueurs dynamiquement
 */
export function substitutePlayerNames(text: string, playerNames: string[]): string {
  let result = text;
  
  // Remplacer les placeholders numérotés par les noms réels
  playerNames.forEach((name, index) => {
    const placeholder = `{player${index + 1}}`;
    result = result.replace(new RegExp(placeholder, 'g'), name);
  });
  
  // Si des placeholders restent (ex: {player4} mais seulement 3 joueurs)
  // On les remplace par des joueurs aléatoires de la liste
  const remainingPlaceholders = result.match(/\{player\d+\}/g);
  if (remainingPlaceholders) {
    remainingPlaceholders.forEach(placeholder => {
      const randomPlayer = playerNames[Math.floor(Math.random() * playerNames.length)];
      result = result.replace(placeholder, randomPlayer);
    });
  }
  
  return result;
}

/**
 * Fonction pour obtenir une carte avec des joueurs aléatoires assignés
 * Utile pour les cartes qui nécessitent plusieurs joueurs
 */
export function getCardWithRandomPlayers(card: PiccolaCard, playerNames: string[]): PiccolaCard {
  // Compter combien de placeholders différents dans la carte
  const placeholders = card.text.match(/\{player\d+\}/g);
  const uniquePlaceholders = placeholders ? [...new Set(placeholders)] : [];
  
  // Si pas de placeholders, retourner la carte telle quelle
  if (uniquePlaceholders.length === 0) {
    return card;
  }
  
  // Sélectionner des joueurs aléatoires sans répétition pour cette carte
  const shuffledPlayers = [...playerNames].sort(() => Math.random() - 0.5);
  const selectedPlayers = shuffledPlayers.slice(0, Math.min(uniquePlaceholders.length, playerNames.length));
  
  // Remplacer les placeholders par les joueurs sélectionnés
  let substitutedText = card.text;
  uniquePlaceholders.forEach((placeholder, index) => {
    const playerIndex = index < selectedPlayers.length ? index : Math.floor(Math.random() * selectedPlayers.length);
    substitutedText = substitutedText.replace(
      new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
      selectedPlayers[playerIndex]
    );
  });
  
  return {
    ...card,
    text: substitutedText
  };
}

/**
 * Fonction pour mélanger les cartes (shuffle Fisher-Yates)
 * Mélange les 110 cartes au début de la partie
 */
export function shuffleCards(cards: PiccolaCard[]): PiccolaCard[] {
  const shuffled = [...cards];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Fonction pour obtenir un deck mélangé complet
 * Utilise toutes les 110 cartes dans un ordre aléatoire
 */
export function getShuffledDeck(): PiccolaCard[] {
  return shuffleCards(PICCOLA_CARDS);
}
