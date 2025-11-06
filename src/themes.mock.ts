export type GameTag = 'Nouveau' | 'Populaire' | 'Classique';

export type Game = {
  id: string;
  name: string;
  tag: GameTag;
  iconEmoji: string;
  accent: string;
};

export type Theme = {
  id: string;
  name: string;
  emoji: string;
  accent: string;
  games: Game[];
};

export const THEMES: Theme[] = [
  {
    id: 'theme-1',
    name: 'Shots & Chill',
    emoji: '🥃',
    accent: '#7C5CFF',
    games: [
      { id: 'theme1-game1', name: 'Roi des Shots', tag: 'Nouveau', iconEmoji: '👑', accent: '#7C5CFF' },
      { id: 'theme1-game2', name: 'Shot Roulette', tag: 'Populaire', iconEmoji: '🎯', accent: '#FF6B6B' },
      { id: 'theme1-game3', name: 'Devine & Trinque', tag: 'Classique', iconEmoji: '🧠', accent: '#00E0A4' },
      { id: 'theme1-game4', name: 'Shot Pong', tag: 'Populaire', iconEmoji: '🏓', accent: '#FFD166' },
      { id: 'theme1-game5', name: 'Double Flip', tag: 'Nouveau', iconEmoji: '🔁', accent: '#7C5CFF' },
      { id: 'theme1-game6', name: 'Challenge Express', tag: 'Populaire', iconEmoji: '⚡️', accent: '#FF6B6B' },
    ],
  },
  {
    id: 'theme-2',
    name: 'Dancefloor',
    emoji: '🕺',
    accent: '#00E0A4',
    games: [
      { id: 'theme2-game1', name: 'Battle Dance', tag: 'Populaire', iconEmoji: '💃', accent: '#00E0A4' },
      { id: 'theme2-game2', name: 'Freeze & Drink', tag: 'Nouveau', iconEmoji: '🧊', accent: '#FF6B6B' },
      { id: 'theme2-game3', name: 'Tempo Shots', tag: 'Classique', iconEmoji: '🎵', accent: '#7C5CFF' },
      { id: 'theme2-game4', name: 'DJ Challenge', tag: 'Populaire', iconEmoji: '🎧', accent: '#FFD166' },
      { id: 'theme2-game5', name: 'Limbo Alcoolisé', tag: 'Classique', iconEmoji: '🥨', accent: '#00E0A4' },
      { id: 'theme2-game6', name: 'Strobe Party', tag: 'Populaire', iconEmoji: '⚡️', accent: '#7C5CFF' },
      { id: 'theme2-game7', name: 'Dance Roulette', tag: 'Nouveau', iconEmoji: '🎲', accent: '#FF6B6B' },
    ],
  },
  {
    id: 'theme-3',
    name: 'Retro Arcade',
    emoji: '🕹️',
    accent: '#FF6B6B',
    games: [
      { id: 'theme3-game1', name: 'Pixel Pong', tag: 'Classique', iconEmoji: '🎮', accent: '#FFD166' },
      { id: 'theme3-game2', name: 'Game Over Shot', tag: 'Populaire', iconEmoji: '💥', accent: '#FF6B6B' },
      { id: 'theme3-game3', name: 'Arcade Stories', tag: 'Nouveau', iconEmoji: '🗯️', accent: '#7C5CFF' },
      { id: 'theme3-game4', name: 'High Score', tag: 'Populaire', iconEmoji: '🏆', accent: '#00E0A4' },
      { id: 'theme3-game5', name: 'Speed Runner', tag: 'Classique', iconEmoji: '🚀', accent: '#7C5CFF' },
      { id: 'theme3-game6', name: 'Retro Cards', tag: 'Populaire', iconEmoji: '🃏', accent: '#FFD166' },
    ],
  },
  {
    id: 'theme-4',
    name: 'Mystery Night',
    emoji: '🕵️',
    accent: '#FFD166',
    games: [
      { id: 'theme4-game1', name: 'Enigmes Express', tag: 'Nouveau', iconEmoji: '🧩', accent: '#FFD166' },
      { id: 'theme4-game2', name: 'Verdict Shot', tag: 'Classique', iconEmoji: '⚖️', accent: '#7C5CFF' },
      { id: 'theme4-game3', name: 'Secret Stories', tag: 'Populaire', iconEmoji: '🤫', accent: '#FF6B6B' },
      { id: 'theme4-game4', name: 'Mystery Bingo', tag: 'Populaire', iconEmoji: '🔍', accent: '#00E0A4' },
      { id: 'theme4-game5', name: 'Détective Express', tag: 'Classique', iconEmoji: '📝', accent: '#FF6B6B' },
      { id: 'theme4-game6', name: 'Cluedo Shots', tag: 'Populaire', iconEmoji: '🕯️', accent: '#7C5CFF' },
      { id: 'theme4-game7', name: 'Whodunit', tag: 'Nouveau', iconEmoji: '🕴️', accent: '#FFD166' },
      { id: 'theme4-game8', name: 'Code Secret', tag: 'Classique', iconEmoji: '🔐', accent: '#00E0A4' },
    ],
  },
  {
    id: 'theme-5',
    name: 'Summer Splash',
    emoji: '🌊',
    accent: '#171722',
    games: [
      { id: 'theme5-game1', name: 'Beach Pong', tag: 'Classique', iconEmoji: '🏖️', accent: '#00E0A4' },
      { id: 'theme5-game2', name: 'Tropical Shots', tag: 'Populaire', iconEmoji: '🍹', accent: '#FF6B6B' },
      { id: 'theme5-game3', name: 'Aqua Relay', tag: 'Nouveau', iconEmoji: '🏃', accent: '#7C5CFF' },
      { id: 'theme5-game4', name: 'Sunset Quiz', tag: 'Populaire', iconEmoji: '🌅', accent: '#FFD166' },
      { id: 'theme5-game5', name: 'Surf & Sip', tag: 'Populaire', iconEmoji: '🏄', accent: '#00E0A4' },
      { id: 'theme5-game6', name: 'Icebreaker', tag: 'Classique', iconEmoji: '🧊', accent: '#7C5CFF' },
      { id: 'theme5-game7', name: 'Splash Dare', tag: 'Nouveau', iconEmoji: '💦', accent: '#FF6B6B' },
      { id: 'theme5-game8', name: 'Suncream Story', tag: 'Classique', iconEmoji: '🧴', accent: '#FFD166' },
    ],
  },
];
