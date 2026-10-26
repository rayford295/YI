# World (the town)

Route: `#/`, the home page. A top-down pixel town in the style of a handheld RPG: the player
walks a sprite of themselves between eight houses, one per level. Stepping onto an open door
opens a talk box (level title, one-line story, Go in / Not now); every roof carries a sign with
its level number (a 3×5 pixel digit); a cleared house flies a gold flag. Two real cats live in the town, drawn after their photos: **Coffee** (a seal-point Ragdoll)
sits in front of the next locked door and **Duoduo** (a bicolour Ragdoll) in front of the one
after, each with its own line naming the level to clear first; a cat with nothing left to guard
rests at its home spot (Coffee by the pond, Duoduo in the middle of the square). Where each cat
was last seen is kept per player (`yi.world.cats.<player>`), so coming back from a level you see
the cat get up and walk to its new post rather than find it already there. Bumping a cat
shows its photo (`public/media/cats/`) beside the words. The partner stands by the fountain and
reports their own progress on this device; once both players have reached the ring, the partner
points to the epilogue.

| File | What |
|---|---|
| `town.ts` | The map as a character grid (`TOWN`), `BUILDINGS` (level id, door tile, roof colour), `SPAWN`, `PARTNER`, `CAT_HOMES`, pure helpers `walkable`, `buildingAt`, `guardSpot`, `reachable` |
| `tiles.ts` | Paints the ground and the houses once onto an offscreen canvas (`renderTown`), the pond in three phases (`renderWater`), the fountain glint and the roof `flag` |
| `sprites.ts` | Pixel art in code: `JINGYI`, `YIFAN` (12×16, four facings, two walk frames), the cats `COFFEE` and `DUODUO` (two frames, a tail flick); `buildSheet` / `buildCat` pre-render them |
| `engine.ts` | `step`, `faced` and `findPath` (pure rules), `WorldEngine` (grid movement, bump-to-talk, NPC walks, the iris, camera, the rAF loop, integer pixel scale, the pond frames and the fountain glint) |
| `daylight.ts` | `phaseAt(hour)` and `tintFor(phase)`: dawn, day, dusk, night as a wash over the map plus lit windows |
| `sound.ts` | Footstep, thud, talk-box blip and door, synthesised with the Web Audio API on the first key or tap; `soundOn` / `setSoundOn` (`yi.sound`) |
| `world.ts`, `world.css` | The page: canvas, d-pad + A button (hidden on wide pointer devices), the talk box with typewriter text, HUD and footer |
| `town.test.ts`, `engine.test.ts`, `daylight.test.ts` | Map shape, one building per level, every door reachable from the spawn, cat homes on free ground, step/turn/face rules, shortest paths |

Controls: arrows or WASD walk; Enter, Space or Z go in or talk; Escape closes the talk box. A key
tap moves one tile; a held key keeps walking. Tapping a tile on the canvas walks there by the
shortest path (`WorldEngine.walkTo`); tapping a cat, the partner or a locked door walks up to it
and acts like a bump. On touch, the pad below the canvas does the same as the keys. A house's number and name
float over its roof while the player is within two tiles of its door.

Sounds: a soft footfall per step, a thud when walking into something solid, a blip when the talk
box opens, two notes when a door opens. All are synthesised; there are no audio files. **Sound: on /
off** in the footer switches them and is remembered on the device. The pond's highlights drift and
the fountain glints; under reduced motion the water stands still.

The town keeps the time of the player's own city (Shenzhen for Jingyi, College Station for Yifan,
from `config`): at dawn and dusk a warm wash, at night a navy one, and the house windows light up
after five in the afternoon. A resting cat now and then hops to a tile next to its home and comes
back.

Going into a house, the picture closes to a circle on the player (an iris, 380 ms); coming back it
opens again. Reduced motion skips both.

Where the player stood is kept in `localStorage` (`yi.world.<player>`); coming back from a level
puts them in front of that house's door, facing it. "Start over" in the footer clears it with
the progress.

Adding a level: append it to `LEVELS` (see `src/core/quest.ts`) and add a building to `BUILDINGS`
with a door tile (`D`) on the grid; the test fails until the spawn can reach that door. The old
node map is kept as the list view at `#/journey`.
