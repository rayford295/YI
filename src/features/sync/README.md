# Sync (carry progress across)

Route: `/sync`. There is no server, so progress lives on each phone. This page shows this
device's **progress code** for the current player and takes the other player's code.

A code is `src/core/sync.ts`'s `encodeProgress`: one letter for the player (J or Y), the cleared
levels as a bitmask in base 36, one check character; `J7K` is Jingyi with the first three levels.
`decodeProgress` rejects a wrong check character or a stranger. A link (`/sync?c=J7K`) imports the
code when opened, after the gate and the player picker if needed. `importProgress` merges as a
union through `mergeProgress` in `quest.ts`, so a code never removes progress.

Buttons: copy link, copy code, and share (where the Web Share API exists). The town's footer links
here, and the partner by the fountain offers **Bring their progress**. Once both players have
reached the ring on a phone, that phone opens the letter.

| File | What |
|---|---|
| `sync.ts`, `sync.css` | The page |
| `../../core/sync.ts`, `sync.test.ts` | Codes: encode, decode, read from a link, merge |
