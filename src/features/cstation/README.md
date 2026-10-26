# A Day in College Station

Route: `/cs`, reached from the signpost at the east edge of the town square or the town's
footer. A second walkable map of Yifan's day: seven stops in order (home at 2250 Dartmouth St,
the bus stop, the office, lunch, the library, the basketball court, the grocery store), each a
house with its number on the roof. Stepping onto a door opens that stop's hours and story.

The clock is College Station's. The sign says where Yifan is right now, the strip of stops lights
the current one (tap a stop to walk there), and when Jingyi visits, Yifan's sprite stands in front
of that stop and walks on when the hour changes; bumping him tells you the time there and what he
is doing.

| File | What |
|---|---|
| `day.ts` | The grid (`CS_GRID`, 32×22, with `=` road and `C` court), `STOPS` with hours, `CS_MAP`, `CS_SPAWN`, `stopAt(hour)` |
| `cstation.ts`, `cstation.css` | The page; reuses `world.css`, the engine, the shared controls |
| `day.test.ts` | Rectangle, every door reachable, numbers in day order, the schedule covers the day |

Owner edits: the hours in `STOPS`, the stories under `cs.story.*` and the stop names under
`cs.stop.*` in `src/core/i18n.ts` (both languages). Design: `docs/superpowers/specs/2026-10-26-college-station-design.md`.
