# Guide (Rayford)

Rayford is the town's guide: Yifan in a suit (Rayford is Yifan's English name). He stands on the
grass just south of the fountain (`RAYFORD_SPOT` in `world/town.ts`) and also gives the first-visit
welcome. Bump into him (or face him and press A) to open his menu:

| Question | Answer |
|---|---|
| Where do I go next? | The first level this player has not cleared, with a one-line hint, and **Take me there**, which closes the box and walks the player to that door (the door's own dialog then opens). After the ring: wait for the other player, then go read the letter. |
| What is this place? | What the project is: Yifan's birthday gift to Jingyi, the "yi" pun, nine houses from 2026-09-20 to the ring, progress per device. |
| What are the levels? | All levels in order, the cleared ones ticked. |
| What else is in town? | The cats, the partner, the mailbox, the two signposts, progress sync. |
| Who are you? | Rayford himself. |

Every line is written in advance (no language model, no server, nothing leaves the device).

| File | What |
|---|---|
| `rayford.ts` | `rayfordSays(topic, state)`: pure; returns the text and the choices (`to` another topic, `walkTo` a door, or `close`). The town page turns choices into talk-box buttons. |
| `rayford.test.ts` | Every topic answers, every level has a hint, "next" walks to the right door, the ending waits for the other player. |

Text lives in `src/core/i18n.ts` under `guide.*` (zh and en). His sprite is `RAYFORD` in
`world/sprites.ts` (Yifan's head, navy jacket, white shirt, red tie); the talk-box portrait comes
from `portraitUrl(RAYFORD)`.

To change what he says, edit the `guide.*` strings. To add a question: add a `Topic`, a case in
`rayfordSays`, a button in the `hello` menu, and its strings in both languages.
