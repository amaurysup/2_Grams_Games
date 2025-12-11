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
