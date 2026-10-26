# Puzzle (level)

A random photo from `src/features/moments/memories.ts` cut into a 3×3 grid of CSS
background tiles; tap two tiles to swap them. `scramble()` guarantees the start is not already
solved; `solved()` decides when to call `levelCleared('puzzle')`. "Another photo" reshuffles.
Only photos (not videos) are used, and the board takes the photo's aspect ratio once it loads.
