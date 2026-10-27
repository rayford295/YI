# Home

Route: `/met` (level 1 of the journey; the old home page)

The first page Jingyi sees: the birthday greeting, a "day N since we met" counter, twin
clocks for Shenzhen and College Station (each turns to night colours after 18:00 local
time), the hours between us and a countdown to flight CYF925. (The letter lives on the map's finale
card and at `/letter`.)

| File | Role |
|---|---|
| `home.ts` | `renderHome(root) => cleanup`; ticks once a second; the question, then the vow |
| `vow.ts` | `VOW` (both vows, zh + en), `LINE` (what to say), `saidTheLine` (needs 我爱你, the other one's name or a homophone, 我愿意) |
| `speech.ts` | `canListen`, `listen`: the browser's speech recogniser, Mandarin, five alternatives |
| `home.css` | styles for this page only |

- The day counter uses Shenzhen's calendar date (`Asia/Shanghai`), with the day we met counted as day 1.
- The time difference is computed live, so it moves from 13 to 14 hours when US daylight time ends.
- Key dates live in `src/core/config.ts`; the letter text lives in `../birthday-map/letter.ts` (`{h}` in the letter becomes the live hour difference).
- Once the countdown reaches zero the heading is hidden and "Together at last" shows instead.
