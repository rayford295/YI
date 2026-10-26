<h1 align="center">Yi at First Sight · 仪见钟情</h1>

<p align="center">
A private, bilingual (中文 / English) game for two.<br/>
You walk a small pixel version of yourself through a town. Every house is a level made from
something that happened to us. The last house holds a ring.
</p>

<p align="center">
  <img src="docs/screenshots/demo.gif" width="640" alt="Walking through Yi Town: talking to the partner by the fountain, bumping into Coffee the cat at a locked door, and opening the Pictionary house" />
</p>

Yifan and Jingyi live thirteen hours and one Pacific Ocean apart, in College Station, Texas and
Shenzhen, China. The site was built as a birthday gift for **October 31, 2026** and is meant to
keep growing. The name puns on 一见钟情 (*love at first sight*): both names carry the syllable
*Yi*, and the title borrows the 仪 from Jingyi's.

> Live at <https://rayford295.github.io/YI/>, unlisted. Personal photos and messages live here;
> please do not redistribute. Publishing is switched off while more features land ([docs/DEPLOY.md](docs/DEPLOY.md)).

## How It Plays

1. **One question** only the two of us can answer opens the door.
2. **Pick who you are.** Progress is kept per player, per device, so both of us can play on one phone.
3. **Walk the town.** Arrow keys or WASD, a tap on any tile, or the d-pad on a phone. Your partner
   waits by the fountain and tells you how far they have got.
4. **Step onto a door** and a talk box tells that level's story; go in and play it. A cleared house
   flies a gold flag.
5. **Our cats keep the locks.** Coffee sits at the next locked door and Duoduo at the one after;
   each tells you, in its own way, which level to clear first. With nothing left to guard, they go
   and sunbathe by the pond or sit in the middle of the square.
6. **The ring** is the eighth house. When both of us have reached it, the partner points to the
   last letter.

Everything runs in the browser and nothing leaves the device. The whole site exists in both
languages, and it installs as an app that works offline.

## The Levels

| # | Level | The task | Behind the door |
|---|---|---|---|
| 1 | The Day We Met | Answer one question | Day counter since we met, twin clocks, countdown to the next flight |
| 2 | Love Map | Find three hidden hearts | A Pacific-centred map of every place that matters, with our story as a tour |
| 3 | Moments | Put five memories in order | The timeline, each memory badged with its day number |
| 4 | Puzzle | Put the photo back together | A photo from our moments in nine tiles |
| 5 | Gomoku | Fill the heart outline | Two players on one device, with a saved game |
| 6 | Pictionary | Three correct guesses | Draw, guess by typing or speaking, 90-second rounds |
| 7 | That Night's Sky | Find Vega and Altair | The sky over both cities at 21:00 on 2026-09-20, computed in the browser |
| 8 | The Ring | The reward | A reveal, the pair of Meridian rings in 3D, a webcam try-on, a two-photo card |
| · | The Last Letter | The epilogue | Opens once both players have reached the ring |

## Develop

```bash
npm install
npm run dev       # http://localhost:5173
npm test          # 97 unit tests (Vitest)
npm run build     # strict type-check + production build
```

Vite, TypeScript, canvas 2D for the town (all art is drawn in code; there are no sprite files),
Leaflet, three.js, MediaPipe, astronomy-engine. Node 22. CI runs the tests and the build on
every push.

## More

- [docs/GUIDE.md](docs/GUIDE.md): repository layout, everyday edits (add a memory, a word, a level), status, key dates
- [docs/DEPLOY.md](docs/DEPLOY.md): publishing and private hosting
- Design notes: [the site](docs/superpowers/specs/2026-10-24-yi-at-first-sight-design.md), [the game of levels](docs/superpowers/specs/2026-10-25-quest-design.md), [the town](docs/superpowers/specs/2026-10-26-town-design.md)
- Each folder under `src/features/` has its own README.
