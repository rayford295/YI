# Gomoku

Gomoku on one device, a nod to our first game, played on a Zoom whiteboard
(purple for Jingyi, green for Yifan). Route: `#/gomoku` (the "Games" link in the top bar).

## Rules

- 15×15 board, freestyle: five **or more** in a row wins; a full board is a draw.
- Jingyi (purple) opens the very first game. After that the loser opens the next game;
  after a draw the opener swaps.
- Undo takes back the last move, as often as you like, until the game ends.
- The win tally, the next opener and the game in progress are kept in `localStorage`,
  so a refresh or a language switch never loses a game.

## Files

| File | Job |
|---|---|
| `core.ts` | Pure rules. The move list is the whole state; board, turn and result are derived. |
| `record.ts` | Win tally, next opener, saving and restoring the game (saves are replayed through the rules). |
| `gomoku.ts` / `gomoku.css` | The page: SVG grid lines behind a 15×15 grid of buttons, stones, win glow, heart burst. |
| `*.test.ts` | Rules in all four directions, edges, freestyle, draw, undo, opener, storage failure. |

To change who opens first, edit `fresh()` in `record.ts` or `nextFirst()` in `core.ts`.
