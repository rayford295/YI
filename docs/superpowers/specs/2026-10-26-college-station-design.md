# A Day in College Station: the second map

Date: 2026-10-26. Status: owner asked for it ("弄一个 College Station 的地图……她就知道我的一天");
built the same day.

## Goal

A second walkable map, in the town's style, of Yifan's ordinary day in College Station, so Jingyi
can see where he goes and, from the clock there, where he is right now. Not a level: no lock,
no clearing, nothing in the quest changes.

## Pieces

| Piece | Where | What |
|---|---|---|
| Any map | `src/features/world/town.ts` | `TownMap` (grid, buildings, size) and `makeMap`; every helper takes a map and defaults to Yi Town. `Building.number` gives a roof sign without a level. Tiles `=` (road) and `C` (court) |
| Engine | `src/features/world/engine.ts`, `tiles.ts` | `map` option; painters take a map; road and court painters (the court draws its own hoop on a top-edge tile with court on both sides) |
| Controls | `src/features/world/controls.ts` | Keyboard, tap-to-walk and the d-pad, shared by the town and this page (`bindControls`, `padHtml`) |
| The day | `src/features/days/cs.ts` (was `cstation/day.ts`) | 32×22 grid, seven stops in day order (home, bus stop, office, lunch, library, the court, grocery) each with its hours, `stopAt(hour)` |
| Page | `src/features/days/render.ts`, `days.css` (was `cstation/cstation.ts`) | Route `#/cs`: the sign with Yifan's avatar and "it is HH:MM in College Station; Yifan is at …", a strip of the seven stops (the current one lit; tap one to walk there), the map, the talk box |
| Way in | the town | A signpost at the east edge of the square (`SIGNPOST`), a footer link |

## Rules

1. Time is College Station's (`config.him.zone`) for the sign, the strip, the wash and where Yifan
   stands; re-read every 15 s.
2. When Jingyi visits, Yifan stands in front of the stop his hours put him at; when the hour
   crosses into the next window he walks there. Bumping him: "It is HH:MM here, and I am at …"
   plus that stop's story. When Yifan visits his own day there is no second Yifan.
3. Stepping onto a stop's door opens its story with its hours; nothing is entered, the door is a
   page in a diary.
4. The visitor's position is kept per player (`yi.cs.<player>`), spawn is the street crossing.
5. The stories (`cs.story.*` in `i18n.ts`) and hours (`STOPS` in `day.ts`) are the owner's to
   edit; the first draft is Claude's guess at the day and says so in the ledger.

## Testing

`day.test.ts`: rectangle of known tiles; every stop has a door tile reachable from the spawn with
free ground in front; numbers follow day order; `stopAt` covers every minute and lands on the
expected stops. The town test checks the signpost stands on free ground that nobody else uses.

## Amendment 2026-10-26: Shenzhen

The owner asked for the same for Jingyi ("也可以做jingyi的啦，她是腾讯的产品经理，白天要上班，晚上回家，家里有两只猫咪"). The page
now takes a `Day` (`src/features/days/day.ts`): `cs.ts` is Yifan's, `sz.ts` is Jingyi's (Asia/Shanghai; home,
metro, Tencent, lunch, Shenzhen Bay; Coffee and Duoduo sit by the door of home and have their own lines).
A second signpost at the west edge of the town (`SIGNPOST_WEST`) leads to `/sz`; the footer links both days.
When the person stands in front of the stop you tap, the walk ends at them. The hours are a first draft.
