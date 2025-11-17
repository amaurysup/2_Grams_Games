# 2 Grams Games - AI Agent Instructions

## Architecture Overview

**Tech Stack**: TypeScript SPA with Vite, Supabase (auth + database), vanilla DOM manipulation
- **No framework**: Direct DOM manipulation with TypeScript classes, no React/Vue/Angular
- **Hash-based routing**: `src/router.ts` handles `#/`, `#/games`, `#/game/:id`, etc.
- **Page pattern**: Each page is a class (e.g., `HomePage`, `GameDetailPage`) with `render()` methods that build HTML strings

## Database Structure (Supabase)

**Single table design**: `jeux` table with boolean theme flags instead of relations
- Fields: `id`, `name`, `description`, `rules`, `image`, `interactif`, `created_at`
- Theme booleans: `chill`, `découverte`, `réflexion`, `destruction`, `embrouilles`, `exploration`
- **Virtual themes**: `HomePage.ts` creates theme objects from booleans, no `themes` table exists
- Authentication: Supabase email/password, check with `supabase.auth.getUser()`

## Interactive Games System

**Two game types implemented**:
1. **DiceGame** (`src/games/DiceGame.ts`): Multi-step workflow (setup → names → game → drinks input), localStorage persistence by userId
2. **UndercoverGame** (`src/games/UndercoverGame.ts`): Spy game with card reveal system, word library in `src/data/undercoverWords.ts`

**Integration**: `GameDetailPage.ts` checks `game.name` exact match ("Jeu des transports", "Undercover") to load games dynamically
- Must verify auth before allowing interactive play: redirects to `/login` if not authenticated
- Games save state to localStorage with key format: `${gameName}_${userId}`

## Critical Patterns

**String-based HTML rendering**: All pages build HTML via template literals, then `container.innerHTML = template`
```typescript
this.container.innerHTML = `<div class="page">${content}</div>`;
```

**Event listener attachment**: Always attach listeners AFTER setting innerHTML in separate method
```typescript
render() {
  this.container.innerHTML = this.buildTemplate();
  this.attachEventListeners(); // Do this AFTER innerHTML
}
```

**TypeScript strict mode**: Project uses `"strict": true` with `noUnusedLocals` and `noUnusedParameters`
- Prefix unused params with underscore: `_criteria` instead of deleting
- All methods must be used or removed to pass build

## AI Chatbot System

**GameRecommendationService** (`src/services/GameRecommendationService.ts`): Local semantic search, no external API
- Analyzes user input for player count, themes, keywords in descriptions
- Scoring algorithm: theme match (30pts), energy match (25pts), keyword match (15pts)
- Returns top 3 recommendations with reason strings

**GameChatbot** (`src/components/GameChatbot.ts`): Modal UI with message history
- Integrated in `HomePage.ts` with floating action button (FAB)
- Click game card in chat to navigate to `#/game/${gameId}`

## Development Workflow

**Commands**:
- `npm run dev` - Vite dev server on port 3000
- `npm run build` - TypeScript compile + Vite build (used by Vercel)
- Build fails on TypeScript errors (unused variables, type mismatches)

**Environment**: `.env` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (see `.env.example`)

## Styling Conventions

**Global CSS**: `style.css` with CSS variables (`--pink`, `--yellow`, `--turquoise`, `--dark`)
- Poppins font from Google Fonts
- Animations: Use `@keyframes` for dice rolls, card reveals, pulses
- Modal pattern: `.game-modal` with `max-height: 90vh` and `overflow-y: auto` for scrolling

## Game-Specific Notes

**Undercover game logic**:
- Player count: 4-10 (not 3)
- Spy ratio: 1/3 of players (minimum 1), Fisher-Yates shuffle for role assignment
- **Critical UX**: "Révéler" button prevents players from seeing each other's cards
- Stats display removed intentionally - players must not know spy count

**DiceGame logic**:
- 3-second dice animation with sound (Web Audio API, 8 oscillator beeps)
- Player count bug fix: Dynamically count `#player1`, `#player2`, etc. inputs instead of reading playerCount field

## Common Pitfalls

- **Game name matching**: Must be EXACT string match in database (case-sensitive)
- **DOM element typing**: Use `as HTMLElement` when accessing `.style` or dataset properties
- **Modal scrolling**: Always set `max-height` and `overflow-y: auto` on modals with dynamic content
- **localStorage keys**: Always include userId to scope data per user

## TODO Notes from Developer

- Improve chatbot by adding structured fields (nb_joueurs_min/max, intensité, durée) to database
- Currently only descriptions used for recommendations - low coherence with current data structure
