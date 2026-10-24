# Home

Route: `#/`

The first page Jingyi sees: the birthday greeting, a "day N since we met" counter, twin
clocks for Shenzhen and College Station (each turns to night colours after 18:00 local
time), the hours between us, a countdown to flight CYF925, and the birthday letter.

| File | Role |
|---|---|
| `home.ts` | `renderHome(root) => cleanup`; ticks once a second |
| `home.css` | styles for this page only |

- The day counter uses Shenzhen's calendar date (`Asia/Shanghai`), with the day we met counted as day 1.
- The time difference is computed live, so it moves from 13 to 14 hours when US daylight time ends.
- Key dates live in `src/core/config.ts`; the letter text lives in `../birthday-map/letter.ts`.
