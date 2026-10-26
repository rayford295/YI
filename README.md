# Yi at First Sight · 仪见钟情

A private, bilingual (中文 / English) website for Yifan and Jingyi, a long-distance couple
between **Shenzhen, China** and **College Station, Texas**: thirteen hours and one Pacific
Ocean apart. Built as a birthday gift for **October 31, 2026**, and meant to grow with us.

The name puns on the Chinese idiom for "love at first sight" (一见钟情, *yi jian zhong qing*).
Both names contain the syllable *Yi*: Yi-fan and Jing-yi; the title swaps in the 仪 from Jingyi's name.

> Live at <https://rayford295.github.io/YI/> (not indexed by search engines). Personal photos and messages live here; do not redistribute.
> We plan to publish it once more features are in (see [docs/DEPLOY.md](docs/DEPLOY.md)).

<p align="center">
  <img src="docs/screenshots/home.png" width="49%" alt="Home: greeting, day counter, twin clocks" />
  <img src="docs/screenshots/map.png" width="49%" alt="Love map centred on the Pacific" />
  <img src="docs/screenshots/moments.png" width="49%" alt="Moments timeline" />
  <img src="docs/screenshots/gomoku.png" width="49%" alt="Gomoku" />
</p>

## Pages

Before anything else the site asks one question only the two of us can answer (`src/core/gate.ts`);
the answer is remembered on the device. Then:

| Route | Page | What it does |
|---|---|---|
| `#/start` | **Start** | Pick a player, Jingyi or Yifan; progress is per player, per device |
| `#/` | **Journey** | The level map: a gold meridian with one node per level; a locked level cannot be opened until the one before it is cleared |
| `#/met` | **The Day We Met** (level 1: answer one question from `src/core/quiz.ts`) | Birthday greeting, "day N since we met" (Shenzhen calendar), twin clocks that turn to night colours after 18:00, live hour difference, countdown to flight CYF925 |
| `#/map` | **Love Map** (level 2: find the three hidden hearts) | Pacific-centred map; one heart per place opens its memory cards; rose arc between our two cities with a heart flying along it; gold CYF925 route to New York; **Play our story** tours every memory |
| `#/moments` | **Moments** (level 3: put five memories in order) | Timeline of every memory, each badged with its day number since we met |
| `#/puzzle` | **Puzzle** (level 4: put the photo back together) | A random photo from our moments cut into nine tiles; tap two to swap |
| `#/gomoku` | **Gomoku** (level 5: fill the heart outline on the board) | Two players on one device, purple for Jingyi and green for Yifan; win tally, undo, saved game |
| `#/draw` | **Pictionary** (level 6: three correct guesses) | Draw on a canvas, hold to peek at the word, typed or spoken guesses, 90-second rounds, a shared "in sync" score |
| `#/stars` | **That Night's Sky** (level 7: find Vega and Altair) | The sky over Shenzhen and over College Station at 21:00 on 2026-09-20, computed in the browser with astronomy-engine from a 130-star catalogue; Moon, planets, optional constellation lines |
| `#/ring` | **The Ring** (level 8, the reward) | On first arrival a reveal plays: black, a rose drawing itself in and taking colour, then the real ring surfacing out of the dark (skippable; "watch again" at the foot of the page). Interactive 3D view of the pair of Meridian rings designed in `ring/` (hers with the stone, his a wide band), each engraved with the other’s name; **Try it on** puts the ring on your finger through the webcam (MediaPipe hand tracking, on-device), with a shutter for a captioned photo, and **Together, apart** joins one photo from each of us into a single card |
| `#/letter` | **The Last Letter** (epilogue) | Opens only when both players have cleared the ring on this device |

Clearing a level shows a card with confetti and a short chime; if a voice line exists at
`public/media/voice/<level>.m4a`, a **Listen** button plays it. The site installs as an app
(web manifest + service worker): the shell works offline, photos and models are cached once seen.

Every string exists in both languages. The toggle in the top bar switches the whole site
without a reload and remembers the choice. The games run entirely in the browser: no
backend, no accounts, nothing leaves the device.

## Status

- [x] Home, Love Map, Moments, Gomoku, Pictionary (v1, 2026-10-24)
- [x] Game of levels with real locks (2026-10-25); Puzzle, That Night's Sky, epilogue letter, entry gate, PWA (2026-10-26)
- [x] 89 unit tests; the build type-checks with `strict` TypeScript
- [x] Checked in a real browser at desktop, 390 px and 320 px widths
- [ ] Yifan rewrites the last letter in his own words (`src/features/birthday-map/letter.ts`)
- [ ] Record voice lines for the cleared cards (`public/media/voice/README.md`)
- [ ] Add inside-joke words to Pictionary (`src/features/pictionary/words.ts`)
- [x] Publishing rehearsed on GitHub Pages (2026-10-24), then taken offline again until more features land
- [ ] Later: gifts, daily notes, more games, an admin page for adding memories

## Repository Layout

```
YI/
├── index.html                  # page shell, fonts
├── public/media/<feature>/     # photos and videos, one folder per feature
├── src/
│   ├── main.ts                 # app shell, gate, hash router, lazy routes, language toggle
│   ├── styles/base.css         # design tokens, top bar, cards, animations
│   ├── core/                   # shared by every feature
│   │   ├── i18n.ts             #   zh/en dictionary, t(), pick(), language state
│   │   ├── dates.ts            #   time-zone aware day counter, clocks, countdown
│   │   ├── geo.ts              #   great-circle arcs across the date line
│   │   ├── html.ts             #   attribute escaping
│   │   ├── quest.ts            #   level registry, per-player progress, locks
│   │   ├── quest-ui.ts         #   avatars, cleared card, toast
│   │   ├── celebrate.ts        #   confetti, chime, voice-line URL
│   │   ├── gate.ts             #   entry question (SHA-256 of accepted answers)
│   │   └── config.ts           #   names, time zones, key dates, next meeting
│   └── features/               # one folder per feature: code, styles, data, tests, README
│       ├── gate/ start/ journey/
│       ├── home/ birthday-map/ moments/ puzzle/
│       ├── gomoku/ pictionary/ games/
│       ├── stars/              #   catalog.ts (stars), sky.ts (projection), stars.ts (page)
│       ├── ring/               #   3D viewer, webcam try-on, photo card
│       └── letter/             #   the epilogue
├── docs/
│   ├── DEPLOY.md               # how to publish (GitHub Pages) or host privately (Cloudflare)
│   ├── screenshots/
│   └── superpowers/            # design spec and implementation plans
└── .github/workflows/ci.yml    # tests + build on every push
```

Each feature folder has its own README explaining its files and rules.

## Everyday Edits

**Add a memory.** Drop the photo into `public/media/moments/` (JPEG, at most 1600 px on the
long side) and append an entry to `src/features/moments/memories.ts`. It appears on the map
and the timeline. The tests fail if the file is missing or either language is empty.

**Edit the letter.** Change the paragraphs in `src/features/birthday-map/letter.ts`, keeping
Chinese and English in step. `{h}` is replaced with the live hour difference.

**Add Pictionary words.** Append to `src/features/pictionary/words.ts`; `alt` lists other
answers that also count. A test fails if two words share an answer.

**Change a key date.** Everything is in `src/core/config.ts`.

**Change the entry question.** Edit `gate.question` and `gate.placeholder` in
`src/core/i18n.ts`, then run `npm run gate -- "answer" "another spelling"` and paste the hashes
into `ANSWERS` in `src/core/gate.ts`. Answers are compared digits-only.

**Add a level.** Append it to `LEVELS` in `src/core/quest.ts`, add its title/story/task strings,
register the route in `src/main.ts` and call `levelCleared('<id>')` when the task is done. Level
numbers are derived from the registry, so inserting a level renumbers the rest automatically.

**Add a feature.** Create `src/features/<name>/` with a README, a page module
(`renderX(root) => cleanup`), CSS and tests; put media in `public/media/<name>/`; register
the route in `src/main.ts` and the strings (both languages) in `src/core/i18n.ts`.

## Develop

```bash
npm install
npm run dev       # http://localhost:5173
npm test          # unit tests (Vitest)
npm run build     # type-check + production build into dist/
npm run preview   # serve dist/ locally
```

Stack: Vite, TypeScript (strict), Vitest, Leaflet with OpenStreetMap tiles, three.js, MediaPipe
Tasks Vision, astronomy-engine, vite-plugin-pwa. Node 22.
Every push runs the tests and the build.

## Key Dates

| Date | Moment |
|---|---|
| 2026-09-20 | We met (day 1) |
| 2026-09-25 | Yifan's birthday |
| 2026-10-31 | Jingyi's birthday, first release |
| 2027-02-05 | Flight CYF925, Shenzhen → New York (the ticket Yifan drew on our first Zoom) |
| 2027-02-08 to 02-12 | AAG Annual Meeting, New York |

## Docs

- Hosting: [`docs/DEPLOY.md`](docs/DEPLOY.md)
- Design spec: [`docs/superpowers/specs/2026-10-24-yi-at-first-sight-design.md`](docs/superpowers/specs/2026-10-24-yi-at-first-sight-design.md)
- Quest (levels) spec: [`docs/superpowers/specs/2026-10-25-quest-design.md`](docs/superpowers/specs/2026-10-25-quest-design.md)
- Plan, part 1 (home + map): [`docs/superpowers/plans/2026-10-24-love-site-part1.md`](docs/superpowers/plans/2026-10-24-love-site-part1.md)
