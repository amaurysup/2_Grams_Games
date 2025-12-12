/**
 * "Je n'ai jamais" (Never Have I Ever) Questions
 * A collection of fun and spicy questions for party games
 */

export interface NeverHaveIEverQuestion {
  id: number;
  text: string;
  category: 'soft' | 'medium' | 'spicy';
  emoji?: string;
}

/**
 * Default questions for the game
 * Mix of soft, medium, and spicy categories
 */
export const NEVER_HAVE_I_EVER_QUESTIONS: NeverHaveIEverQuestion[] = [
  // Soft questions
  {
    id: 1,
    text: "...été en retard en AI in prod",
    category: 'medium',
    emoji: '💋'
  },
  {
    id: 2,
    text: "...lancé un nain sur ma meuf",
    category: 'soft',
    emoji: '🤥'
  },
  {
    id: 3,
    text: "...préféré le pesto vert au pesto rosso (terrorisme)",
    category: 'soft',
    emoji: '📱'
  },
  {
    id: 4,
    text: "...été absent en AI in prod",
    category: 'soft',
    emoji: '😱'
  },
  {
    id: 5,
    text: "...fait croire que j'étais malade pour éviter quelque chose",
    category: 'soft',
    emoji: '🤒'
  },
  {
    id: 6,
    text: "...stalké mon ex sur les réseaux sociaux",
    category: 'medium',
    emoji: '🔍'
  },
  {
    id: 7,
    text: "...fait un road trip improvisé",
    category: 'soft',
    emoji: '🚗'
  },
  {
    id: 8,
    text: "...dormi jusqu'à 15h ou plus",
    category: 'soft',
    emoji: '😴'
  },
  {
    id: 9,
    text: "...pleuré devant un film",
    category: 'soft',
    emoji: '😢'
  },
  {
    id: 10,
    text: "...dit 'je t'aime' sans le penser",
    category: 'medium',
    emoji: '💔'
  },
  // Medium questions
  {
    id: 11,
    text: "...eu un crush sur un(e) ami(e) de mes parents",
    category: 'medium',
    emoji: '👀'
  },
  {
    id: 12,
    text: "...été éjecté(e) d'un bar ou d'une boîte",
    category: 'medium',
    emoji: '🚪'
  },
  {
    id: 13,
    text: "...menti sur mon CV",
    category: 'medium',
    emoji: '📄'
  },
  {
    id: 14,
    text: "...fait quelque chose d'illégal",
    category: 'spicy',
    emoji: '🚨'
  },
  {
    id: 15,
    text: "...regretté un tatouage",
    category: 'medium',
    emoji: '🎨'
  },
  {
    id: 16,
    text: "...passé une nuit blanche complète",
    category: 'soft',
    emoji: '🌙'
  },
  {
    id: 17,
    text: "...fait du skinny dipping (baignade nu)",
    category: 'spicy',
    emoji: '🏊'
  },
  {
    id: 18,
    text: "...eu un rendez-vous Tinder catastrophique",
    category: 'medium',
    emoji: '📲'
  },
  {
    id: 19,
    text: "...mangé un repas entier directement de la casserole",
    category: 'soft',
    emoji: '🍳'
  },
  {
    id: 20,
    text: "...envoyé un nude",
    category: 'spicy',
    emoji: '🔥'
  },
  // Spicy questions
  {
    id: 21,
    text: "...eu un coup d'un soir",
    category: 'spicy',
    emoji: '🌶️'
  },
  {
    id: 22,
    text: "...volé quelque chose dans un magasin",
    category: 'medium',
    emoji: '🛒'
  },
  {
    id: 23,
    text: "...été amoureux(se) de deux personnes en même temps",
    category: 'medium',
    emoji: '❤️‍🔥'
  },
  {
    id: 24,
    text: "...fait semblant d'avoir un orgasme",
    category: 'spicy',
    emoji: '🎭'
  },
  {
    id: 25,
    text: "...embrassé quelqu'un du même sexe",
    category: 'medium',
    emoji: '🏳️‍🌈'
  },
  {
    id: 26,
    text: "...participé à un jeu à boire jusqu'à en être malade",
    category: 'medium',
    emoji: '🍺'
  },
  {
    id: 27,
    text: "...fait un karaoké en public",
    category: 'soft',
    emoji: '🎤'
  },
  {
    id: 28,
    text: "...eu un crush sur un prof",
    category: 'medium',
    emoji: '📚'
  },
  {
    id: 29,
    text: "...fait quelque chose que j'ai juré de ne jamais refaire",
    category: 'medium',
    emoji: '🤞'
  },
  {
    id: 30,
    text: "...fait croire que je parlais une langue que je ne parlais pas",
    category: 'soft',
    emoji: '🌍'
  },
  // Nouvelles questions - Soft
  {
    id: 31,
    text: "...mangé un truc tombé par terre",
    category: 'soft',
    emoji: '🍕'
  },
  {
    id: 32,
    text: "...fait semblant de travailler alors que je glandais",
    category: 'soft',
    emoji: '💻'
  },
  {
    id: 33,
    text: "...oublié le prénom de quelqu'un que je venais de rencontrer",
    category: 'soft',
    emoji: '🤔'
  },
  {
    id: 34,
    text: "...ri à un moment totalement inapproprié",
    category: 'soft',
    emoji: '😂'
  },
  {
    id: 35,
    text: "...fait genre d'avoir vu un film/série pour suivre la conversation",
    category: 'soft',
    emoji: '🎬'
  },
  {
    id: 36,
    text: "...stalké quelqu'un sur LinkedIn",
    category: 'soft',
    emoji: '👔'
  },
  {
    id: 37,
    text: "...pris une douche de plus de 30 minutes",
    category: 'soft',
    emoji: '🚿'
  },
  {
    id: 38,
    text: "...refait le monde à 3h du mat",
    category: 'soft',
    emoji: '🌃'
  },
  // Nouvelles questions - Medium
  {
    id: 39,
    text: "...menti sur mon âge pour entrer quelque part",
    category: 'medium',
    emoji: '🪪'
  },
  {
    id: 40,
    text: "...ghosté quelqu'un",
    category: 'medium',
    emoji: '👻'
  },
  {
    id: 41,
    text: "...fait un achat que je regrette à mort",
    category: 'medium',
    emoji: '💸'
  },
  {
    id: 42,
    text: "...dragué le/la meilleur(e) ami(e) de mon ex",
    category: 'medium',
    emoji: '😈'
  },
  {
    id: 43,
    text: "...dit du mal de quelqu'un présent dans cette pièce",
    category: 'medium',
    emoji: '🗣️'
  },
  {
    id: 44,
    text: "...inventé une excuse bidon pour annuler un plan",
    category: 'medium',
    emoji: '🤥'
  },
  {
    id: 45,
    text: "...fait quelque chose juste pour rendre quelqu'un jaloux",
    category: 'medium',
    emoji: '💚'
  },
  {
    id: 46,
    text: "...eu un blackout complet en soirée",
    category: 'medium',
    emoji: '🍾'
  },
  {
    id: 47,
    text: "...regretté un message envoyé à mon ex",
    category: 'medium',
    emoji: '📱'
  },
  {
    id: 48,
    text: "...fait un truc gênant en étant bourré(e)",
    category: 'medium',
    emoji: '🥴'
  },
  {
    id: 49,
    text: "...menti à mes parents sur où j'étais",
    category: 'medium',
    emoji: '🏠'
  },
  {
    id: 50,
    text: "...eu un date qui a duré moins de 30 minutes",
    category: 'medium',
    emoji: '⏱️'
  },
  // Nouvelles questions - Spicy
  {
    id: 51,
    text: "...fait des trucs dans un lieu public",
    category: 'spicy',
    emoji: '🔥'
  },
  {
    id: 52,
    text: "...eu un plan à trois",
    category: 'spicy',
    emoji: '🌶️'
  },
  {
    id: 53,
    text: "...menti à mon/ma partenaire",
    category: 'spicy',
    emoji: '💔'
  },
  {
    id: 54,
    text: "...été attiré(e) par quelqu'un dans cette pièce",
    category: 'spicy',
    emoji: '👀'
  },
  {
    id: 55,
    text: "...trompé quelqu'un",
    category: 'spicy',
    emoji: '💋'
  },
  {
    id: 56,
    text: "...fait quelque chose avec un(e) collègue",
    category: 'spicy',
    emoji: '🏢'
  },
  {
    id: 57,
    text: "...eu un crush sur quelqu'un en couple",
    category: 'medium',
    emoji: '❤️‍🔥'
  },
  {
    id: 58,
    text: "...fini dans le lit de quelqu'un sans savoir comment",
    category: 'spicy',
    emoji: '🛏️'
  },
  {
    id: 59,
    text: "...fait quelque chose d'interdit dans une voiture",
    category: 'spicy',
    emoji: '🚗'
  },
  {
    id: 60,
    text: "...embrassé quelqu'un le premier soir",
    category: 'medium',
    emoji: '💏'
  }
];

/**
 * Get a shuffled copy of the questions
 */
export function getShuffledQuestions(): NeverHaveIEverQuestion[] {
  const questions = [...NEVER_HAVE_I_EVER_QUESTIONS];
  
  // Fisher-Yates shuffle
  for (let i = questions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [questions[i], questions[j]] = [questions[j], questions[i]];
  }
  
  return questions;
}

/**
 * Get questions by category
 */
export function getQuestionsByCategory(category: 'soft' | 'medium' | 'spicy'): NeverHaveIEverQuestion[] {
  return NEVER_HAVE_I_EVER_QUESTIONS.filter(q => q.category === category);
}

/**
 * Get a random subset of questions
 */
export function getRandomQuestions(count: number): NeverHaveIEverQuestion[] {
  const shuffled = getShuffledQuestions();
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
