import { supabase } from '../lib/supabase';
import type { Playlist, PresetPlaylist, Game } from '../types';
import { toast } from '../components/Toast';

const PLAYLISTS_STORAGE_KEY = '2gg_playlists';

// Playlists prédéfinies
export const PRESET_PLAYLISTS: PresetPlaylist[] = [
  {
    id: 'preset_chill',
    name: 'Soirée Chill',
    description: 'Des jeux tranquilles pour une soirée détendue',
    emoji: '😌',
    filter: { themes: ['chill'], party_mode: false },
  },
  {
    id: 'preset_intense',
    name: 'Apéro Intense',
    description: 'Pour ceux qui veulent monter en puissance',
    emoji: '🔥',
    filter: { themes: ['destruction', 'embrouilles'] },
  },
  {
    id: 'preset_icebreaker',
    name: 'Brise-Glace',
    description: 'Parfait pour apprendre à se connaître',
    emoji: '🧊',
    filter: { themes: ['découverte', 'chill'] },
  },
  {
    id: 'preset_party',
    name: 'Party Mode',
    description: 'Les meilleurs jeux pour enchaîner',
    emoji: '🎉',
    filter: { party_mode: true },
  },
  {
    id: 'preset_small',
    name: 'Petit Comité',
    description: 'Jeux pour 2-4 joueurs',
    emoji: '👥',
    filter: { min_players: 2, max_players: 4 },
  },
  {
    id: 'preset_large',
    name: 'Grande Tablée',
    description: 'Jeux pour 6+ joueurs',
    emoji: '👨‍👩‍👧‍👦',
    filter: { min_players: 6 },
  },
];

class PlaylistsService {
  private userId: string | null = null;
  private username: string = '';
  private userPlaylists: Playlist[] = [];
  private listeners: Array<() => void> = [];

  setUser(userId: string | null, username: string = ''): void {
    this.userId = userId;
    this.username = username;
    if (userId) {
      this.loadUserPlaylists();
    } else {
      this.userPlaylists = [];
    }
  }

  private async loadUserPlaylists(): Promise<void> {
    if (!this.userId) return;

    try {
      const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .eq('user_id', this.userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      this.userPlaylists = (data || []) as Playlist[];
      this.saveToLocal();
      this.notifyListeners();
    } catch (error) {
      console.log('Loading playlists from local storage');
      const local = localStorage.getItem(`${PLAYLISTS_STORAGE_KEY}_${this.userId}`);
      if (local) {
        this.userPlaylists = JSON.parse(local);
      }
    }
  }

  private saveToLocal(): void {
    if (!this.userId) return;
    localStorage.setItem(`${PLAYLISTS_STORAGE_KEY}_${this.userId}`, JSON.stringify(this.userPlaylists));
  }

  // Obtenir les playlists de l'utilisateur
  getUserPlaylists(): Playlist[] {
    return this.userPlaylists;
  }

  // Créer une playlist
  async createPlaylist(
    name: string,
    description: string,
    emoji: string,
    isPublic: boolean = false,
    gameIds: string[] = []
  ): Promise<{ success: boolean; playlist?: Playlist; error?: string }> {
    if (!this.userId) {
      return { success: false, error: 'Vous devez être connecté' };
    }

    if (name.length < 2) {
      return { success: false, error: 'Le nom doit faire au moins 2 caractères' };
    }

    const playlist: Omit<Playlist, 'id'> = {
      user_id: this.userId,
      name,
      description,
      emoji,
      is_public: isPublic,
      games: gameIds,
      likes_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      creator_username: this.username,
    };

    try {
      const { data, error } = await supabase
        .from('playlists')
        .insert(playlist)
        .select()
        .single();

      if (error) throw error;

      const newPlaylist = data as Playlist;
      this.userPlaylists.unshift(newPlaylist);
      this.saveToLocal();
      this.notifyListeners();

      toast.success('Playlist créée !');
      return { success: true, playlist: newPlaylist };
    } catch (error) {
      console.error('Error creating playlist:', error);
      return { success: false, error: 'Erreur lors de la création' };
    }
  }

  // Mettre à jour une playlist
  async updatePlaylist(
    playlistId: string,
    updates: Partial<Pick<Playlist, 'name' | 'description' | 'emoji' | 'is_public' | 'games'>>
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.userId) {
      return { success: false, error: 'Vous devez être connecté' };
    }

    try {
      const { error } = await supabase
        .from('playlists')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', playlistId)
        .eq('user_id', this.userId);

      if (error) throw error;

      // Mettre à jour localement
      const index = this.userPlaylists.findIndex(p => p.id === playlistId);
      if (index !== -1) {
        this.userPlaylists[index] = { ...this.userPlaylists[index], ...updates };
        this.saveToLocal();
        this.notifyListeners();
      }

      toast.success('Playlist mise à jour !');
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Erreur lors de la mise à jour' };
    }
  }

  // Supprimer une playlist
  async deletePlaylist(playlistId: string): Promise<{ success: boolean }> {
    if (!this.userId) return { success: false };

    try {
      const { error } = await supabase
        .from('playlists')
        .delete()
        .eq('id', playlistId)
        .eq('user_id', this.userId);

      if (error) throw error;

      this.userPlaylists = this.userPlaylists.filter(p => p.id !== playlistId);
      this.saveToLocal();
      this.notifyListeners();

      toast.success('Playlist supprimée');
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  }

  // Ajouter un jeu à une playlist
  async addGameToPlaylist(playlistId: string, gameId: string): Promise<{ success: boolean }> {
    const playlist = this.userPlaylists.find(p => p.id === playlistId);
    if (!playlist) return { success: false };

    if (playlist.games.includes(gameId)) {
      toast.info('Ce jeu est déjà dans la playlist');
      return { success: false };
    }

    const newGames = [...playlist.games, gameId];
    return this.updatePlaylist(playlistId, { games: newGames });
  }

  // Retirer un jeu d'une playlist
  async removeGameFromPlaylist(playlistId: string, gameId: string): Promise<{ success: boolean }> {
    const playlist = this.userPlaylists.find(p => p.id === playlistId);
    if (!playlist) return { success: false };

    const newGames = playlist.games.filter(id => id !== gameId);
    return this.updatePlaylist(playlistId, { games: newGames });
  }

  // Obtenir une playlist par ID (avec les détails des jeux)
  async getPlaylistWithGames(playlistId: string): Promise<Playlist | null> {
    try {
      const { data: playlist, error } = await supabase
        .from('playlists')
        .select('*')
        .eq('id', playlistId)
        .single();

      if (error || !playlist) return null;

      // Charger les détails des jeux
      if (playlist.games && playlist.games.length > 0) {
        const { data: games } = await supabase
          .from('jeux')
          .select('*')
          .in('id', playlist.games);

        playlist.games_details = games || [];
      }

      return playlist as Playlist;
    } catch {
      return null;
    }
  }

  // Obtenir les playlists publiques populaires
  async getPopularPlaylists(limit: number = 10): Promise<Playlist[]> {
    try {
      const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .eq('is_public', true)
        .order('likes_count', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []) as Playlist[];
    } catch {
      return [];
    }
  }

  // Rechercher des playlists publiques
  async searchPlaylists(query: string): Promise<Playlist[]> {
    if (!query || query.length < 2) return [];

    try {
      const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .eq('is_public', true)
        .ilike('name', `%${query}%`)
        .limit(20);

      if (error) throw error;
      return (data || []) as Playlist[];
    } catch {
      return [];
    }
  }

  // Liker/unliker une playlist
  async toggleLike(playlistId: string): Promise<{ success: boolean; liked: boolean }> {
    if (!this.userId) {
      toast.error('Connectez-vous pour liker');
      return { success: false, liked: false };
    }

    try {
      const { data: existing } = await supabase
        .from('playlist_likes')
        .select('*')
        .eq('playlist_id', playlistId)
        .eq('user_id', this.userId)
        .single();

      if (existing) {
        await supabase
          .from('playlist_likes')
          .delete()
          .eq('playlist_id', playlistId)
          .eq('user_id', this.userId);

        await supabase.rpc('decrement_playlist_likes', { p_id: playlistId });
        return { success: true, liked: false };
      } else {
        await supabase
          .from('playlist_likes')
          .insert({ playlist_id: playlistId, user_id: this.userId });

        await supabase.rpc('increment_playlist_likes', { p_id: playlistId });
        return { success: true, liked: true };
      }
    } catch {
      return { success: false, liked: false };
    }
  }

  // Dupliquer une playlist publique
  async duplicatePlaylist(playlistId: string): Promise<{ success: boolean; playlist?: Playlist }> {
    if (!this.userId) {
      return { success: false };
    }

    const original = await this.getPlaylistWithGames(playlistId);
    if (!original) return { success: false };

    return this.createPlaylist(
      `${original.name} (copie)`,
      original.description,
      original.emoji,
      false, // La copie est privée par défaut
      original.games
    );
  }

  // Appliquer un filtre preset pour obtenir des jeux
  async getGamesFromPreset(presetId: string, allGames: Game[]): Promise<Game[]> {
    const preset = PRESET_PLAYLISTS.find(p => p.id === presetId);
    if (!preset) return [];

    return allGames.filter(game => {
      // Filtre par thèmes
      if (preset.filter.themes && preset.filter.themes.length > 0) {
        const hasMatchingTheme = preset.filter.themes.some(theme => {
          const field = theme as keyof Game;
          return game[field] === true;
        });
        if (!hasMatchingTheme) return false;
      }

      // Filtre par party mode
      if (preset.filter.party_mode !== undefined) {
        if (game.party_mode !== preset.filter.party_mode) return false;
      }

      // Filtre par nombre de joueurs min
      if (preset.filter.min_players !== undefined) {
        const max = game.joueurs_max ?? 99;
        if (max < preset.filter.min_players) return false;
      }

      // Filtre par nombre de joueurs max
      if (preset.filter.max_players !== undefined) {
        const min = game.joueurs_min ?? 1;
        if (min > preset.filter.max_players) return false;
      }

      return true;
    });
  }

  // Générer un lien de partage
  getShareLink(playlistId: string): string {
    return `${window.location.origin}/#/playlist/${playlistId}`;
  }

  // S'abonner aux changements
  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(l => l());
  }
}

export const playlistsService = new PlaylistsService();
