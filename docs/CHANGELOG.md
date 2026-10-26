# Changelog

Versions are tags of feeling more than of code; the site deploys on every push.

## 1.5.0 (2026-10-26)

- Both days corrected by the owner: Yifan drives (Southside gym, Dr. Zou's office, golf, the Rec
  gym, the pool, grocery); Jingyi drives her Tesla, and the Shenzhen Bay stop carries the
  "buy it and I'll marry you" line.

- A jukebox in the corner of every page for Chinese songs (`public/media/music/`, listed in
  `tracks.ts`; hidden until there is one), remembered per device.
- A red mailbox by the fountain: the other one's voice notes (`public/media/voice/notes/`,
  listed in `notes.ts`), newest first, with play buttons.

## 1.4.0 (2026-10-26)

- A day of Jingyi's (`/sz`): Shenzhen on its own clock, Tencent's tower, the metro, lunch,
  Shenzhen Bay, and Coffee and Duoduo waiting by the door of home. A second signpost at the
  west edge of the town leads there. The day page now draws any `Day` (`src/features/days/`).
- Tapping a stop where the person is standing walks you up to them instead of failing.

## 1.3.1 (2026-10-26)

- The tab and home-screen icon is now the two of us in pixels, drawn from the sprites
  (`npm run icon`), instead of the ring.

- The puzzle is always a face: Jingyi pieces Yifan together (5 photos), Yifan pieces Jingyi
  (7 photos); `public/media/portraits/`, more welcome.

## 1.3.0 (2026-10-26)

- Every level is entered on foot: the cleared card now says "step out and walk to the next
  house", the top bar and the list view no longer link to levels, the game tabs are gone, and a
  level address reached any other way goes back to the town (`src/core/door.ts`).

## 1.2.1 (2026-10-26)

- Clean addresses: `jingyifan.love/cs` instead of `jingyifan.love/#/cs`. A `404.html` copy of
  the app shell lets GitHub Pages open any path; links sent with `#/` still work.

## 1.2.0 (2026-10-26)

- A Day in College Station (`#/cs`): a second map of Yifan's day, seven stops with hours and
  stories, a strip that lights the current stop, and Yifan's sprite standing wherever the clock
  there puts him. The engine now takes any map; road and basketball-court tiles; controls shared.
- A signpost in the town square leads there.

## 1.1.0 (2026-10-26)

- Progress codes (`#/sync`): carry progress between our two phones as a short code or link, so
  the partner by the fountain knows how far you got and the letter can open for both.
- The whole site stands on the town's meadow with the time-of-day wash; every heading is a sign.
- Live at <https://jingyifan.love/> from a private repository.

## 1.0.0 (2026-10-26)

- Yi Town: the home is a walkable pixel town with eight houses, Coffee and Duoduo, flags,
  name plates, roof numbers, sounds, a living pond, day and night, an iris into each house.
- Eight levels and the epilogue, the gate, the PWA, the README with a gameplay GIF.

## 0.1.0 (2026-10-24)

- First complete site: home, love map, moments, gomoku, pictionary.
