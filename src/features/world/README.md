# World (the town)

Route: `#/`, the home page. A top-down pixel town in the style of a handheld RPG: the player
walks a sprite of themselves between eight houses, one per level. Stepping onto an open door
opens a talk box (level title, one-line story, Go in / Not now); a locked house has a cat sitting
in front of its door who says which level to clear first; a cleared house flies a gold flag. The
partner stands by the fountain and reports their own progress on this device; once both players
have reached the ring, the partner points to the epilogue.

| File | What |
|---|---|
| `town.ts` | The map as a character grid (`TOWN`), `BUILDINGS` (level id, door tile, roof colour), `SPAWN`, `PARTNER`, pure helpers `walkable`, `buildingAt`, `guardSpot`, `reachable` |
| `tiles.ts` | Paints the ground and the houses once onto an offscreen canvas (`renderTown`), plus the roof `flag` |
| `sprites.ts` | Pixel art in code: `JINGYI`, `YIFAN` (12×16, four facings, two walk frames), the `CAT`; `buildSheet` pre-renders a figure |
| `engine.ts` | `step` and `faced` (pure rules), `WorldEngine` (grid movement, bump-to-talk, camera, the rAF loop, integer pixel scale) |
| `world.ts`, `world.css` | The page: canvas, d-pad + A button (hidden on wide pointer devices), the talk box with typewriter text, HUD and footer |
| `town.test.ts`, `engine.test.ts` | Map shape, one building per level, every door reachable from the spawn, step/turn/face rules |

Controls: arrows or WASD walk; Enter, Space or Z go in or talk; Escape closes the talk box. On
touch, the pad below the canvas does the same. A key tap moves one tile; a held key keeps walking.

Where the player stood is kept in `localStorage` (`yi.world.<player>`); coming back from a level
puts them in front of that house's door, facing it. "Start over" in the footer clears it with
the progress.

Adding a level: append it to `LEVELS` (see `src/core/quest.ts`) and add a building to `BUILDINGS`
with a door tile (`D`) on the grid; the test fails until the spawn can reach that door. The old
node map is kept as the list view at `#/journey`.
