# Days (College Station and Shenzhen)

Routes: `/cs`, a day of Yifan's in College Station, and `/sz`, a day of Jingyi's in Shenzhen.
Each is reached from a signpost in the town (east for College Station, west for Shenzhen) or the
town's footer. One page (`render.ts`, `renderDay(day)`) draws both from a `Day` (`day.ts`): a
grid, the stops in the order of the day with their hours, a spawn tile, and for Shenzhen the two
cats sitting by the door of home.

The clock is the city's. The sign says where the person is right now, the strip of stops lights
the current one (tap a stop to walk there; if the person stands in front of that door the walk
ends at them and their line), and when the other player visits, the person's sprite stands in
front of that stop and walks on when the hour changes. Bumping them tells you the time there and
what they are doing; bumping a cat shows its photo and a line.

| File | What |
|---|---|
| `day.ts` | `Day`, `Stop` (a building with `hours`), `stopAt(day, hour)` |
| `cs.ts` | Yifan: `CS_GRID` (32×22, `=` road, `C` court), seven stops: home at 2250 Dartmouth St, the Southside gym, Dr. Zou's office, the golf course, the Rec gym (with the court), the pool, grocery; he drives |
| `sz.ts` | Jingyi: `SZ_GRID` (Tencent's wide tower, lunch, Shenzhen Bay up top; home, the metro and the bay's water below), five stops (home, her Tesla, Tencent, lunch, Shenzhen Bay), Coffee and Duoduo by the door |
| `render.ts`, `days.css` | The page; reuses `world.css`, the engine, the shared controls |
| `days.test.ts` | For both days: rectangle, every door reachable from the spawn, cats on free ground, numbers in day order, the schedule covers the day |

Owner edits: the hours in `cs.ts` / `sz.ts`, the stories under `cs.story.*` / `sz.story.*`, the
stop names under `cs.stop.*` / `sz.stop.*`, the cats' lines under `sz.cat.*`, all in
`src/core/i18n.ts` (both languages). Both schedules are first drafts. Design:
`docs/superpowers/specs/2026-10-26-college-station-design.md` (amended for Shenzhen).
