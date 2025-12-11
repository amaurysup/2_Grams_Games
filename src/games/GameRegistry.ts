/**
 * Game Registry - Maps game types to their dynamic imports
 * This replaces the spaghetti if/else logic in GameDetailPage
 */

export type GameType = 'transport' | 'undercover' | 'piccola' | 'roulette' | 'never_ever';

export interface GameLoaderConfig {
  keywords: string[];  // Keywords to match in game name
  loader: () => Promise<{ default?: any; [key: string]: any }>;
  setup: (module: any, gameName: string, userId: string) => void;
}

/**
 * Registry of all interactive games with their loaders and setup functions
 */
export const GAME_REGISTRY: Record<GameType, GameLoaderConfig> = {
  transport: {
    keywords: ['transport', 'jeu des transports'],
    loader: () => import('./DiceGame'),
    setup: (module, gameName, userId) => {
      const game = new module.DiceGame(gameName, userId);
      game.open();
    }
  },
  
  undercover: {
    keywords: ['undercover'],
    loader: () => import('./UndercoverGame'),
    setup: (module, gameName, userId) => {
      const game = new module.UndercoverGame(gameName, userId);
      game.open();
    }
  },
  
  piccola: {
    keywords: ['piccola'],
    loader: () => import('./PiccolaGame'),
    setup: (module, _gameName, userId) => {
      // Remove existing container if present
      const existing = document.getElementById('piccola-game-container');
      if (existing) existing.remove();
      
      const modalContainer = document.createElement('div');
      modalContainer.id = 'piccola-game-container';
      document.body.appendChild(modalContainer);
      
      const game = new module.PiccolaGame(modalContainer);
      game.start(userId);
    }
  },
  
  roulette: {
    keywords: ['roulette'],
    loader: () => import('./RouletteGame'),
    setup: (module, _gameName, userId) => {
      // Remove existing container if present
      const existing = document.getElementById('roulette-game-container');
      if (existing) existing.remove();
      
      const modalContainer = document.createElement('div');
      modalContainer.id = 'roulette-game-container';
      document.body.appendChild(modalContainer);
      
      const game = new module.RouletteGame(modalContainer);
      game.start(userId);
    }
  },
  
  never_ever: {
    keywords: ['jamais', 'never have i ever', 'je n\'ai jamais', 'never_ever'],
    loader: () => import('./NeverHaveIEverGame'),
    setup: (module, _gameName, userId) => {
      // Remove existing container if present
      const existing = document.getElementById('never-have-i-ever-container');
      if (existing) existing.remove();
      
      const modalContainer = document.createElement('div');
      modalContainer.id = 'never-have-i-ever-container';
      document.body.appendChild(modalContainer);
      
      const game = new module.NeverHaveIEverGame(modalContainer);
      game.start(userId);
    }
  }
};

/**
 * Find the game type from game name by matching keywords
 */
export function findGameType(gameName: string): GameType | null {
  const normalizedName = gameName.toLowerCase().trim();
  
  for (const [type, config] of Object.entries(GAME_REGISTRY)) {
    for (const keyword of config.keywords) {
      if (normalizedName.includes(keyword) || normalizedName === keyword) {
        return type as GameType;
      }
    }
  }
  
  return null;
}

/**
 * Load and launch a game by its type
 */
export async function launchGame(
  gameType: GameType,
  gameName: string,
  userId: string
): Promise<boolean> {
  const config = GAME_REGISTRY[gameType];
  
  if (!config) {
    console.error(`❌ No loader found for game type: ${gameType}`);
    return false;
  }
  
  try {
    console.log(`🎮 Loading game: ${gameType}`);
    const module = await config.loader();
    config.setup(module, gameName, userId);
    console.log(`✅ Game ${gameType} launched successfully`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to load game ${gameType}:`, error);
    return false;
  }
}

/**
 * Check if a game name matches any registered game
 */
export function isGameRegistered(gameName: string): boolean {
  return findGameType(gameName) !== null;
}

/**
 * Get all registered game types
 */
export function getRegisteredGameTypes(): GameType[] {
  return Object.keys(GAME_REGISTRY) as GameType[];
}
