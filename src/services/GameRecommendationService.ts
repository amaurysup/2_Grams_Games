import { Game } from '../types';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface GameRecommendation {
  game: Game;
  score: number;
  reason: string;
}

export class GameRecommendationService {
  private games: Game[];
  private conversationHistory: Message[] = [];

  constructor(games: Game[]) {
    this.games = games;
    this.initializeConversation();
  }

  private initializeConversation() {
    this.conversationHistory = [{
      role: 'system',
      content: 'Tu es un assistant expert en jeux d\'alcool. Tu connais tous les jeux disponibles et tu aides les joueurs à trouver le jeu parfait en fonction de leurs préférences.',
      timestamp: new Date()
    }];
  }

  /**
   * Analyse le message de l'utilisateur et recommande des jeux
   */
  async getRecommendations(userMessage: string): Promise<{
    response: string;
    recommendations: GameRecommendation[];
  }> {
    // Ajouter le message de l'utilisateur à l'historique
    this.conversationHistory.push({
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    });

    // Extraire les critères du message
    const criteria = this.extractCriteria(userMessage);
    
    // Chercher les jeux correspondants
    const recommendations = this.findMatchingGames(criteria, userMessage);

    // Générer une réponse naturelle
    const response = this.generateResponse(criteria, recommendations);

    // Ajouter la réponse à l'historique
    this.conversationHistory.push({
      role: 'assistant',
      content: response,
      timestamp: new Date()
    });

    return { response, recommendations };
  }

  /**
   * Extrait les critères du message utilisateur (nombre de joueurs, ambiance, etc.)
   */
  private extractCriteria(message: string): {
    playerCount?: number;
    themes: string[];
    keywords: string[];
    energy: 'chill' | 'intense' | 'mixed' | null;
  } {
    const lowerMessage = message.toLowerCase();
    const criteria: any = {
      themes: [],
      keywords: [],
      energy: null
    };

    // Détection du nombre de joueurs
    const playerMatch = lowerMessage.match(/(\d+)\s*(?:joueurs?|personnes?|participants?)/);
    if (playerMatch) {
      criteria.playerCount = parseInt(playerMatch[1]);
    }

    // Détection des thèmes
    if (lowerMessage.includes('découvrir') || lowerMessage.includes('découverte') || lowerMessage.includes('apprendre')) {
      criteria.themes.push('découverte');
    }
    if (lowerMessage.includes('réfléchir') || lowerMessage.includes('réflexion') || lowerMessage.includes('stratégie')) {
      criteria.themes.push('réflexion');
    }
    if (lowerMessage.includes('chaos') || lowerMessage.includes('destruction') || lowerMessage.includes('fou')) {
      criteria.themes.push('destruction');
    }
    if (lowerMessage.includes('embrouille') || lowerMessage.includes('drama') || lowerMessage.includes('tension')) {
      criteria.themes.push('embrouilles');
    }
    if (lowerMessage.includes('explorer') || lowerMessage.includes('exploration') || lowerMessage.includes('aventure')) {
      criteria.themes.push('exploration');
    }
    if (lowerMessage.includes('interactif') || lowerMessage.includes('action') || lowerMessage.includes('physique')) {
      criteria.themes.push('interactif');
    }

    // Détection de l'énergie
    if (lowerMessage.includes('calme') || lowerMessage.includes('tranquille') || lowerMessage.includes('chill') || lowerMessage.includes('relax')) {
      criteria.energy = 'chill';
      criteria.themes.push('chill');
    } else if (lowerMessage.includes('intense') || lowerMessage.includes('énergique') || lowerMessage.includes('dynamique') || lowerMessage.includes('fou')) {
      criteria.energy = 'intense';
    }

    // Extraction de mots-clés généraux
    const commonWords = ['le', 'la', 'les', 'un', 'une', 'des', 'je', 'tu', 'nous', 'vous', 'ils', 'pour', 'avec', 'dans', 'sur', 'à', 'de', 'du', 'et', 'ou', 'mais', 'donc', 'or', 'ni', 'car', 'qui', 'que', 'quoi', 'dont', 'où', 'veux', 'veut', 'voudrais', 'cherche', 'aimerais', 'jeu', 'joueur', 'joueurs', 'personne', 'personnes'];
    const words = lowerMessage.split(/\s+/).filter(w => w.length > 3 && !commonWords.includes(w));
    criteria.keywords = words;

    return criteria;
  }

  /**
   * Trouve les jeux correspondant aux critères
   */
  private findMatchingGames(criteria: any, originalMessage: string): GameRecommendation[] {
    const scored = this.games.map(game => {
      let score = 0;
      const reasons: string[] = [];

      // Filtrage strict par nombre de joueurs
      if (criteria.playerCount) {
        const playerCount = criteria.playerCount;
        const minPlayers = game.joueurs_min || 0;
        const maxPlayers = game.joueurs_max; // null = pas de limite
        
        // Vérifier si le jeu est compatible avec le nombre de joueurs
        const isCompatible = playerCount >= minPlayers && (maxPlayers === null || maxPlayers === undefined || playerCount <= maxPlayers);
        
        if (!isCompatible) {
          // Retourner score 0 si incompatible
          return { game, score: 0, reason: 'Nombre de joueurs incompatible' };
        } else {
          score += 40; // Bonus important si compatible
          reasons.push(`Compatible ${playerCount} joueur${playerCount > 1 ? 's' : ''}`);
        }
      }

      // Score basé sur les thèmes
      if (criteria.themes.length > 0) {
        let themeMatches = 0;
        criteria.themes.forEach((theme: string) => {
          if (game[theme as keyof Game] === true) {
            themeMatches++;
            reasons.push(`Thème ${theme}`);
          }
        });
        score += themeMatches * 30;
      }

      // Score basé sur l'énergie
      if (criteria.energy === 'chill' && game.chill) {
        score += 25;
        reasons.push('Ambiance chill');
      } else if (criteria.energy === 'intense' && (game.destruction || game.interactif)) {
        score += 25;
        reasons.push('Jeu intense');
      }

      // Score basé sur les mots-clés dans la description
      const descLower = game.description.toLowerCase();
      const nameLower = game.name.toLowerCase();
      criteria.keywords.forEach((keyword: string) => {
        if (descLower.includes(keyword) || nameLower.includes(keyword)) {
          score += 15;
        }
      });

      // Bonus si le message mentionne directement le nom du jeu
      if (originalMessage.toLowerCase().includes(nameLower)) {
        score += 50;
      }

      // Si aucun critère spécifique, donner un score de base
      if (criteria.themes.length === 0 && criteria.keywords.length === 0 && !criteria.energy) {
        score = 10; // Score minimal pour montrer tous les jeux
        reasons.push('Jeu disponible');
      }

      return {
        game,
        score,
        reason: reasons.join(', ') || 'Jeu correspondant'
      };
    });

    // Trier par score et retourner les 3 meilleurs (ou tous si < 3)
    return scored
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }

  /**
   * Génère une réponse naturelle basée sur les recommandations
   */
  private generateResponse(criteria: any, recommendations: GameRecommendation[]): string {
    if (recommendations.length === 0) {
      if (criteria.playerCount) {
        return `Désolé, je n'ai pas trouvé de jeu pour ${criteria.playerCount} joueur${criteria.playerCount > 1 ? 's' : ''} avec ces critères... 😕 Essaye avec d'autres critères ou un nombre de joueurs différent !`;
      }
      return "Hmm, je n'ai pas trouvé de jeu qui correspond exactement à ça... 🤔 Essaye de me dire ce que tu recherches : une ambiance calme ? intense ? un jeu de découverte ? Ou dis-moi juste combien vous êtes !";
    }

    const greetings = [
      "Super ! Voici ce que je te recommande 🎲",
      "J'ai trouvé des pépites pour toi ! 🎯",
      "Check ça, tu vas adorer ! 🔥",
      "Parfait, j'ai exactement ce qu'il te faut ! ✨",
      "Excellent choix ! Voici mes suggestions 🎉"
    ];

    const greeting = greetings[Math.floor(Math.random() * greetings.length)];

    let response = greeting + "\n\n";

    if (recommendations.length === 1) {
      response += `Le jeu parfait pour toi : **${recommendations[0].game.name}** !`;
    } else if (recommendations.length === 2) {
      response += `J'hésite entre deux bangers : **${recommendations[0].game.name}** et **${recommendations[1].game.name}** !`;
    } else {
      response += `Voici mon top 3 pour toi :`;
    }

    return response;
  }

  /**
   * Obtient l'historique de conversation
   */
  getHistory(): Message[] {
    return this.conversationHistory;
  }

  /**
   * Réinitialise la conversation
   */
  reset() {
    this.initializeConversation();
  }
}
