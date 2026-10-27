# Poems (level)

Five classical lines about love, each with its second half taken out. The missing characters
sit in a bank below, shuffled with three decoys; tap them back in order. A full wrong line shakes
and empties; a right one opens the source and a plain rendering, and the next poem. The fifth
solved line clears the level (`levelCleared('poems')`). "Show one character" places the next
right one. Once cleared, the page shows all five in full with Prev / Next.

| File | What |
|---|---|
| `lines.ts` | `POEMS` (lines, answer, source, gloss), `blank` (where the answer sits), `bank` (answer + decoys, shuffled), `solved` |
| `poems.ts`, `poems.css` | The page |
| `lines.test.ts` | Every answer sits in its lines; the bank holds every needed character plus exactly the decoys; only the exact answer solves |

The poems were chosen by the owner: Su Wu's farewell to his wife, Guan Daosheng's clay song,
Li Shangyin's untitled couplet, the paired birds from the *Yutai xinyong* (attributed to Ruan
Ji), and one couplet whose source could not be traced (kept as anonymous). Adding one: append to
`POEMS`; the answer must appear verbatim in one of its lines.
