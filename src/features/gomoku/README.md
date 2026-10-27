# Gomoku (level)

Ten endgame positions, a nod to our first game on a Zoom whiteboard (purple for Jingyi, green
for Yifan). Each is "win in one": the player sees their own colour to move and taps the stone
that makes five. A wrong stone fades out; the right one lights the line, then turns gold and
stays while the next position is laid around it. The ten gold stones are the ten points of a
heart; the tenth completes it, bursts hearts and clears the level (`levelCleared('gomoku')`).
Route: `/gomoku`, entered through its house.

| File | Job |
|---|---|
| `core.ts` | Pure rules: `boardWith`, `winningLine` (five or more through a cell), `winningCells` |
| `puzzles.ts` | `HEART` (ten points, in order) and `PUZZLES`, built from three patterns (a four shut at one end, a four with a hole, three-and-one) in varied directions with decoys, never on another heart point |
| `gomoku.ts` / `gomoku.css` | The page: SVG grid behind a 15×15 grid of buttons, stones, gold keepsakes, win glow, heart burst |
| `core.test.ts` | Lines in all four directions, six in a row, edges; one puzzle per heart point; exactly one winning point each; no stone on another heart point |

To change the heart, edit `HEART`; the builder finds a position for each point or the test fails.
