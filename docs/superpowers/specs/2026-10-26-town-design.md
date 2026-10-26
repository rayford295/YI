# Town: the journey as a walkable pixel world

Date: 2026-10-26. Status: approved in conversation (owner: "A，请自动持续推进和执行").

## Goal

Replace the static journey map (a gold line with eight circles) with a small top-down pixel town
in the style of a handheld RPG. The player walks a sprite of themselves through the town; each
level is a building. Walking into a door opens a dialogue box and then the level. Nothing about
the levels, the progress model or the locks changes; only the way a level is entered.

## Not in scope

A second player walking at the same time (networking is deferred by the owner), a long road from
Shenzhen to College Station (option B, maybe later), any game-engine dependency.

## Pieces

| Piece | Where | What |
|---|---|---|
| Town data | `src/features/world/town.ts` | The map as a string grid (one char per tile), the eight buildings (level id, door tile, name key), the partner's spot, the spawn tile; pure helpers `walkable`, `buildingAt`, `parseTown` |
| Tiles | `src/features/world/tiles.ts` | Draws every 16×16 tile kind onto one offscreen atlas at load (grass, path, water, tree, flower, fence, roof, wall, door, sign). No image files, no licence to carry |
| Sprites | `src/features/world/sprites.ts` | 16×20 pixel sprites for Yifan and Jingyi (drawn after their avatars: his dark messy hair and red-gold gown collar; her brown bun with the white flower and white top), four directions, two walk frames; the partner stands as an NPC |
| Engine | `src/features/world/engine.ts` | Grid movement one tile per step with eased interpolation, four-direction facing, collision from the town grid, a camera that follows and clamps, a `requestAnimationFrame` loop, keyboard + d-pad input, bump-to-interact |
| Page | `src/features/world/world.ts`, `.css` | Route `/` (the new home). Canvas with `image-rendering: pixelated`, the on-screen d-pad and A button (touch), the dialogue box (name plate + typewriter text + Enter/Close), a small HUD with progress and a link to the list view |
| List view | `src/features/journey/` | Kept as route `/journey`: the old map, for reduced motion and as a fallback |

## Rules

1. The player spawns at the town square the first time; after that, where they last stood on this
   device (`yi.world.<player>`, tile coordinates), so returning from a level puts them at its door.
2. A building's door is walkable when the level is unlocked. Stepping on it opens the dialogue:
   name plate = the level title, text = the level story, buttons = Enter / Not now. Enter
   navigates to the level route. Enter key, Space and the A button confirm.
3. The two real cats guard: Coffee sits on the tile in front of the next locked door, Duoduo in
   front of the one after (further locked doors are simply shut). Walking into a cat opens its
   own line naming the previous level, with the cat's photo. A cat with nothing to guard rests
   at its home spot (`CAT_HOMES`) and has an idle line. (Amended 2026-10-26: was one generic cat
   per locked door.)
4. A cleared building flies a small gold flag on its roof.
5. The partner stands by the fountain. Bumping into them shows one line and their progress on
   this device. When both have reached the ring, the line points to the epilogue.
6. Reduced motion: the typewriter prints at once; walking still animates (it is the game).
7. Tap a tile on the canvas to walk there (shortest path over free tiles); tapping something you
   cannot stand on walks to the nearest free tile beside it, turns to face it and acts as a bump
   would. A house's name floats over its roof while the player is within two tiles of its door.
8. Keyboard: arrows/WASD move, Enter/Space/Z interact, Escape closes the dialogue. The canvas
   takes focus on click so page scrolling is not hijacked before the player chooses to play.

## Testing

`town.test.ts`: the grid parses to the declared size; every level in `LEVELS` has exactly one
building; every door is reachable from the spawn by walking (BFS over `walkable`), so no level can
be made unreachable by an edit to the map; guards stand on walkable tiles. `engine.test.ts`: a
step moves one tile, a blocked step only turns the player, and the interact target is the faced
tile.

## Adding a level

Append the level to `LEVELS` as before, then add a building to `BUILDINGS` in `town.ts` with a door
tile on the grid. The test fails until the door is reachable.
