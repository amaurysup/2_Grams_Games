// ==========================================
// CORE TYPES (existing)
// ==========================================

export interface Game {
  id: string;
  name: string;
  description: string;
  rules: string;
  created_at: string;
  découverte: boolean;
  réflexion: boolean;
  destruction: boolean;
  embrouilles: boolean;
  chill: boolean;
  interactif: boolean;
  exploration: boolean;
  image?: string;
  joueurs_min?: number;
  joueurs_max?: number | null;
  party_mode?: boolean;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  emoji: string;
  created_at: string;
  games?: Game[];
}

export interface User {
  id: string;
  email: string;
  username: string;
  isPremium: boolean;
  avatar_url?: string;
  bio?: string;
  created_at?: string;
  theme_preference?: ThemePreference;
  total_xp?: number;
  level?: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}

export type AuthContextType = {
  authState: AuthState;
  signUp: (email: string, password: string, username: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

// ==========================================
// THEME PREFERENCES (Feature #12)
// ==========================================

export type ThemePreference = 'dark' | 'light' | 'neon' | 'sunset' | 'ocean' | 'system';

export interface ThemeColors {
  id: ThemePreference;
  name: string;
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  accent: string;
}

// ==========================================
// STATISTICS (Feature #15)
// ==========================================

export interface UserStats {
  user_id: string;
  total_games_played: number;
  total_time_played: number; // in seconds
  favorite_theme: string | null;
  games_played_by_theme: Record<string, number>;
  games_played_by_game: Record<string, number>;
  weekly_activity: number[]; // 7 days, index 0 = Monday
  monthly_activity: number[]; // 30 days
  longest_streak: number;
  current_streak: number;
  last_played_at: string | null;
}

export interface GameSession {
  id: string;
  user_id: string;
  game_id: string;
  game_name: string;
  started_at: string;
  ended_at: string | null;
  duration: number; // in seconds
  players_count: number;
  completed: boolean;
}

// ==========================================
// ACHIEVEMENTS (Feature #16)
// ==========================================

export type AchievementCategory = 'games' | 'social' | 'time' | 'streak' | 'special';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  requirement: number;
  xp_reward: number;
  is_secret: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface UserAchievement {
  achievement_id: string;
  user_id: string;
  unlocked_at: string;
  progress: number;
}

// ==========================================
// DAILY/WEEKLY CHALLENGES (Feature #17)
// ==========================================

export type ChallengeType = 'daily' | 'weekly';
export type ChallengeAction = 'play_games' | 'play_theme' | 'play_duration' | 'play_unique' | 'invite_friend';

export interface Challenge {
  id: string;
  type: ChallengeType;
  title: string;
  description: string;
  action: ChallengeAction;
  target: number;
  target_theme?: string;
  xp_reward: number;
  icon: string;
  expires_at: string;
}

export interface UserChallenge {
  challenge_id: string;
  user_id: string;
  progress: number;
  completed: boolean;
  completed_at: string | null;
}

// ==========================================
// COMMENTS & REVIEWS (Feature #8)
// ==========================================

export interface GameReview {
  id: string;
  game_id: string;
  user_id: string;
  username: string;
  avatar_url?: string;
  rating: number; // 1-5
  comment: string;
  likes_count: number;
  created_at: string;
  updated_at: string;
  user_liked?: boolean;
}

export interface ReviewLike {
  review_id: string;
  user_id: string;
  created_at: string;
}

// ==========================================
// LEADERBOARDS (Feature #7)
// ==========================================

export type LeaderboardType = 'weekly' | 'monthly' | 'all_time';
export type LeaderboardCategory = 'games_played' | 'time_played' | 'achievements' | 'xp';

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  avatar_url?: string;
  value: number;
  level?: number;
}

// ==========================================
// FRIENDS SYSTEM (Feature #6)
// ==========================================

export type FriendshipStatus = 'pending' | 'accepted' | 'blocked';

// Profile from the profiles table (synced with auth.users)
export interface Profile {
  id: string;
  username: string;
  email?: string;
  avatar_url?: string;
  xp?: number;
  level?: number;
  updated_at?: string;
}

export interface Friendship {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: FriendshipStatus;
  created_at: string;
  updated_at?: string;
  // Joined data
  requester?: Profile;
  receiver?: Profile;
}

export interface FriendProfile {
  user_id: string;
  username: string;
  avatar_url?: string;
  level: number;
  status: 'online' | 'offline' | 'in_game';
  last_seen?: string;
  current_game?: string;
}

// ==========================================
// USER PROFILES (Feature #5)
// ==========================================

export interface PublicProfile {
  user_id: string;
  username: string;
  avatar_url?: string;
  bio?: string;
  level: number;
  total_xp: number;
  achievements_count: number;
  games_played: number;
  favorite_games: string[];
  badges: Badge[];
  created_at: string;
  is_friend?: boolean;
  friendship_status?: FriendshipStatus;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// ==========================================
// PLAYLISTS (Feature #1)
// ==========================================

export interface Playlist {
  id: string;
  user_id: string;
  name: string;
  description: string;
  emoji: string;
  is_public: boolean;
  games: string[]; // game IDs
  games_details?: Game[];
  likes_count: number;
  created_at: string;
  updated_at: string;
  creator_username?: string;
  creator_avatar?: string;
}

export interface PlaylistLike {
  playlist_id: string;
  user_id: string;
  created_at: string;
}

// ==========================================
// PRESET PLAYLISTS
// ==========================================

export interface PresetPlaylist {
  id: string;
  name: string;
  description: string;
  emoji: string;
  filter: {
    themes?: string[];
    min_players?: number;
    max_players?: number;
    party_mode?: boolean;
  };
}
