# Quest: the site as a game of levels

Date: 2026-10-25. Status: approved in conversation (owner: "真锁吧，我们后面需要增加更多的关卡").

## Goal

Turn the site into a journey: pick a player (Yifan or Jingyi, with their cartoon avatars), then
clear levels one at a time. Each level is one of the existing pages with a small task; the last
level is the ring. Locks are real: a level that is not unlocked cannot be opened. Adding a level
later must be cheap.

## Pieces

| Piece | Where | What |
|---|---|---|
| Level registry + progress | `src/core/quest.ts` | `LEVELS` array (id, route, title/story keys); per-player progress in `localStorage` (`yi.quest.<player>`); `getPlayer`, `setPlayer`, `isUnlocked`, `isCleared`, `clear`, `next`, `reset`; `quest:change` events |
| Cleared overlay | `src/core/quest-ui.ts` | `showCleared(levelId)`: full-screen card with the player's avatar, "level N cleared", a one-line story, and a button to the next level |
| Player select | `src/features/start/` | route `/start`; two avatar cards; choosing one sets the player and goes to the journey map |
| Journey map | `src/features/journey/` | route `/` (new home); a gold meridian path with one node per level: cleared (gold, ✓), current (pulsing), locked (lock) |
| Level 1 "Met" | `src/features/home/` (route moves to `/met`) | the old home page plus a quiz card (`src/core/quiz.ts`); a correct answer clears |
| Level 2 "Map" | `src/features/birthday-map/` | three hidden hearts on the map; find all three |
| Level 3 "Moments" | `src/features/moments/` | put five shuffled memories in date order (tap two to swap) |
| Level 4 "Gomoku" | `src/features/gomoku/` | a faint heart outline (14 points, no five in a line) on the board; fill every point with a stone |
| Level 5 "Draw" | `src/features/pictionary/` | reach three correct guesses in the match |
| Level 4 "Puzzle" (added 2026-10-26) | `src/features/puzzle/` | a photo from the moments cut 3×3; tap two tiles to swap until whole |
| Level 7 "That Night's Sky" (added 2026-10-26) | `src/features/stars/` | sky over Shenzhen and College Station at 21:00 on 2026-09-20 (astronomy-engine + 130-star catalogue); tap Vega and Altair |
| Level 8 "Ring" | `src/features/ring/` | the reward: opening it clears it; the player's own ring is shown first |
| Epilogue "The Last Letter" (2026-10-26) | `src/features/letter/` | route `/letter`; not a level; opens when `clearedByAll('ring')` (both players, this device) |
| Entry gate (2026-10-26) | `src/core/gate.ts`, `src/features/gate/` | one question before anything renders; accepted answers stored as SHA-256; pass remembered in `yi.gate` |
| Celebration (2026-10-26) | `src/core/celebrate.ts` | confetti canvas + synthesised chime on the cleared card; optional voice line `public/media/voice/<id>.m4a` |
| PWA (2026-10-26) | `vite.config.ts` | manifest + Workbox service worker; shell precached, media/mediapipe/fonts/tiles cached at runtime |

## Routing rules (`src/main.ts`)

1. No player chosen: every route renders `/start`.
2. A level route that is not unlocked redirects to `/` with a short "locked" toast.
3. The top bar shows: brand, the player's avatar (click: journey map), links for unlocked levels
   only, language toggle.

## Progress model

```ts
interface Progress { cleared: string[] }          // level ids, in clear order
```

`isUnlocked(id)` is true when the level is the first one, or the previous level in `LEVELS` is
cleared. Progress is per player and per device; the two of us play on our own phones.

## Adding a level

1. Append `{ id, route, title: 'quest.level.<id>', story: 'quest.story.<id>' }` to `LEVELS`
   (anywhere in the order; numbers are derived with `levelNumber(id)`).
2. Add the i18n strings (title, story, task in zh and en); task strings use `{n}` for the number.
3. Register the lazy route in `main.ts` and call `levelCleared('<id>')` from the page when the
   task is done (it clears, celebrates once and offers the next level).

## Out of scope

Shared progress between devices (no backend), face recognition (removed earlier at the owner's
request), real-time two-player play (owner: later).
