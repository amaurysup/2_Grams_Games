import type { Game } from '../types';

export const games: Game[] = [
  {
    id: 1,
    title: 'Beer Pong',
    description: 'Le classique indémodable des soirées étudiantes',
    icon: '🍻',
    color: 'pink',
    players: '2-4 joueurs par équipe',
    duration: '15-30 minutes',
    rules: [
      'Placez 10 gobelets en triangle à chaque extrémité d\'une table',
      'Remplissez chaque gobelet avec de la bière',
      'Les équipes lancent à tour de rôle des balles de ping-pong',
      'Si la balle atterrit dans un gobelet, l\'équipe adverse doit le boire',
      'La première équipe à éliminer tous les gobelets adverses gagne'
    ]
  },
  {
    id: 2,
    title: 'Kings Cup',
    description: 'Chaque carte a sa règle, attention aux rois !',
    icon: '🎲',
    color: 'yellow',
    players: '3-8 joueurs',
    duration: '30-45 minutes',
    rules: [
      'As : Tout le monde boit',
      '2 : Tu choisis quelqu\'un qui boit',
      '3 : Tu bois',
      '4 : Les filles boivent',
      '5 : Tape dans tes mains',
      '6 : Les garçons boivent',
      '7 : Lève les bras, le dernier boit',
      '8 : Ton voisin de droite boit',
      '9 : Ton voisin de gauche boit',
      '10 : Catégorie (le premier qui sèche boit)',
      'Valet : Invente une règle',
      'Dame : Questions (pose des questions, le premier qui répond boit)',
      'Roi : Verse dans le verre central, celui qui tire le 4e roi boit tout'
    ]
  },
  {
    id: 3,
    title: 'Never Have I Ever',
    description: 'Découvrez les secrets de vos amis',
    icon: '🃏',
    color: 'turquoise',
    players: '3-10 joueurs',
    duration: '20-40 minutes',
    rules: [
      'Chaque joueur lève 5 doigts',
      'À tour de rôle, dites "Je n\'ai jamais..." suivi d\'une action',
      'Ceux qui ont fait cette action baissent un doigt et boivent',
      'Le premier à baisser tous ses doigts a perdu',
      'Soyez créatifs mais respectueux !'
    ]
  },
  {
    id: 4,
    title: 'Fléchettes',
    description: 'Visez juste ou buvez !',
    icon: '🎯',
    color: 'pink',
    players: '2-6 joueurs',
    duration: '15-30 minutes',
    rules: [
      'Chaque joueur lance 3 fléchettes',
      'Attribuez des actions aux différentes zones de la cible',
      'Exemple : centre = distribuer 5 gorgées, extérieur = boire 2 gorgées',
      'Raté complet = boire 3 gorgées',
      'Le joueur avec le meilleur score distribue des gorgées'
    ]
  },
  {
    id: 5,
    title: 'Flip Cup',
    description: 'Course de vitesse en équipe',
    icon: '🍺',
    color: 'yellow',
    players: '6-12 joueurs (équipes paires)',
    duration: '10-20 minutes',
    rules: [
      'Formez deux équipes de taille égale',
      'Chaque joueur a un gobelet rempli de bière',
      'Au signal, le premier joueur boit son verre',
      'Une fois fini, il pose le verre au bord de la table et le fait basculer avec un doigt',
      'Quand le verre atterrit à l\'envers, le joueur suivant peut commencer',
      'La première équipe à finir gagne'
    ]
  },
  {
    id: 6,
    title: 'Chanson à Boire',
    description: 'Chantez faux et trinquez !',
    icon: '🎵',
    color: 'turquoise',
    players: '3-10 joueurs',
    duration: '20-30 minutes',
    rules: [
      'Choisissez un thème musical (années 80, Disney, etc.)',
      'À tour de rôle, chantez une chanson correspondant au thème',
      'Les autres joueurs devinent la chanson',
      'Si personne ne trouve en 30 secondes, le chanteur boit',
      'Si quelqu\'un trouve, le chanteur distribue 2 gorgées',
      'Impossible de chanter la même chanson deux fois'
    ]
  }
];

export class GamesService {
  getAllGames(): Game[] {
    return games;
  }

  getGameById(id: number): Game | undefined {
    return games.find(game => game.id === id);
  }

  searchGames(query: string): Game[] {
    const lowercaseQuery = query.toLowerCase();
    return games.filter(game => 
      game.title.toLowerCase().includes(lowercaseQuery) ||
      game.description.toLowerCase().includes(lowercaseQuery)
    );
  }
}
