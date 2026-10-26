# Pictionary

Draw-and-guess on one device, after our first round of Pictionary on Zoom (Oct 23).
Route: `/draw`, its own house in the town.

## How a round goes

1. The overlay says who draws and asks the guesser to look away; Jingyi draws first.
2. **Start** begins a 90-second round with a random word from the bank (no repeats until
   the bank runs out). The word shows only while the drawer **holds "Peek"**.
3. The guesser types guesses (case, spaces, punctuation and full-width forms are ignored;
   the Chinese, the English or any alternative answer counts), or the drawer taps
   **Guessed it (out loud)** for a spoken guess, e.g. over Zoom. **Skip** gives up the word.
4. A right guess adds one to our shared **in-sync** score; the streak and best streak are
   kept too. Roles swap every round. Score and best survive a refresh; a language switch
   keeps the round and the drawing.

## Files

| File | Job |
|---|---|
| `core.ts` | Pure rules: guess matching, word picking, round state machine (time is passed in). |
| `words.ts` | The bilingual word bank. **Add our own inside jokes here.** |
| `strokes.ts` | Strokes in unit coordinates (0..1) and painting them, so drawings survive resizes. |
| `record.ts` | Shared score and best streak in `localStorage`. |
| `pictionary.ts` / `.css` | The page: tools, canvas, timer bar, peek, guess box, overlays. |
| `*.test.ts` | Matching, picking, timing, phases, word-bank collisions, storage failure. |

The word-bank test fails if two words share an answer, so a guess can never match the
wrong word.
