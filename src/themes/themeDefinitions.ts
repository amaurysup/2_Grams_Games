import { Game, Theme } from "../types";

export interface ThemeDefinition {
  id: string;              // unique key, ex: "chill"
  label: string;           // displayed name, ex: "Chill"
  emoji: string;           // ex: "😌"
  dbField: keyof Game;     // boolean field in the DB (existing)
}

export const THEME_DEFINITIONS: ThemeDefinition[] = [
  { id: "chill",        label: "Chill",        emoji: "😌", dbField: "chill" },
  { id: "decouverte",   label: "Découverte",   emoji: "✨", dbField: "découverte" },
  { id: "reflexion",    label: "Réflexion",    emoji: "🧠", dbField: "réflexion" },
  { id: "destruction",  label: "Destruction",  emoji: "💥", dbField: "destruction" },
  { id: "embrouilles",  label: "Embrouilles",  emoji: "⚡", dbField: "embrouilles" },
  { id: "exploration",  label: "Exploration",  emoji: "🧭", dbField: "exploration" }
];

export function buildThemesFromGames(allGames: Game[]): Theme[] {
  return THEME_DEFINITIONS
    .map(def => ({
      id: def.id,
      name: `${def.emoji} ${def.label}`,
      emoji: def.emoji,
      description: '',
      created_at: new Date().toISOString(),
      games: allGames.filter(g => g[def.dbField] === true)
    }))
    .filter(theme => theme.games.length > 0);
}
