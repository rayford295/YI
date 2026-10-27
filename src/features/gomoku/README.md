# Gomoku (level)

Three endgame positions, a nod to our first game on a Zoom whiteboard (purple for Jingyi, green
for Yifan). Each is "win in one": the player sees their own colour to move and taps the stone
that makes five. A wrong stone fades out; the right one lights the line and bursts hearts. The
third solved position clears the level (`levelCleared('gomoku')`). The third position also has
the other side one move from winning, so it has to be now. Route: `/gomoku`, entered through
its house.

| File | Job |
|---|---|
| `core.ts` | Pure rules: `boardWith`, `winningLine` (five or more through a cell), `winningCells` |
| `puzzles.ts` | `PUZZLES`: the mover's stones, the other side's, the one answer. The mover takes the player's colour |
| `gomoku.ts` / `gomoku.css` | The page: SVG grid behind a 15×15 grid of buttons, stones, win glow, heart burst, Prev / Next |
| `core.test.ts` | Lines in all four directions, six in a row, edges; every puzzle has exactly one winning point |

Replacing a position with a real one from our game: list the stones in `puzzles.ts`; the test
fails if the mover has no winning point or more than one.
