# Yi at First Sight

**English** | [中文](README.zh-CN.md)

A private, bilingual (Chinese / English) website for Yifan and Jingyi, a long-distance
couple between **Shenzhen, China** and **College Station, Texas**: thirteen hours and one
Pacific Ocean apart.

The name puns on the Chinese idiom for "love at first sight" (*yi jian zhong qing*). Both
of their names contain the syllable *Yi*: Yi-fan and Jing-yi.

> Private repository. Personal photos and messages live here; do not redistribute.

## What it does

| Feature | Status | Folder |
|---|---|---|
| Home: birthday greeting, "day N since we met", twin clocks, countdown to flight CYF925, birthday letter | ✅ v1 | [`src/features/home/`](src/features/home/) |
| Birthday map: heart markers, Pacific arc, CYF925 route to New York, memory cards, "play our story" | ✅ v1 | [`src/features/birthday-map/`](src/features/birthday-map/) |
| Moments: the timeline of our love moments (data + photos) | ✅ v1 (data) | [`src/features/moments/`](src/features/moments/) |
| Gomoku: two players on one device | 🚧 planned | [`src/features/gomoku/`](src/features/gomoku/) |
| Pictionary: draw and guess on one device | 🚧 planned | [`src/features/pictionary/`](src/features/pictionary/) |
| Gifts, daily notes, more games | 💭 later | — |

Every user-facing string exists in both languages. The language toggle in the top bar
switches the whole site without a reload and remembers the choice.

## Repository layout

```
Yi-at-First-Sight/
├── index.html                 # page shell, fonts
├── public/media/<feature>/    # photos and videos, one folder per feature
├── src/
│   ├── main.ts                # app shell, hash router (#/ and #/map), language toggle
│   ├── styles/base.css        # shared design tokens, top bar, cards, animations
│   ├── core/                  # code shared by every feature
│   │   ├── i18n.ts            #   zh/en dictionary, t(), pick(), language state
│   │   ├── dates.ts           #   time-zone aware day counter, clocks, countdown
│   │   ├── geo.ts             #   great-circle arcs across the date line
│   │   └── config.ts          #   names, time zones, key dates, next meeting
│   └── features/              # one folder per feature: code, styles, data, README
│       ├── home/
│       ├── birthday-map/
│       ├── moments/
│       ├── gomoku/
│       └── pictionary/
└── docs/superpowers/          # design spec and implementation plans
```

**Adding a feature:** create `src/features/<name>/` with its own `README.md`, page module
(`renderX(root) => cleanup`), CSS and tests; put its media in `public/media/<name>/`; add
its route in `src/main.ts` and its strings (both languages) in `src/core/i18n.ts`.

**Adding a memory:** drop the photo into `public/media/moments/` and append an entry to
`src/features/moments/memories.ts`. The test suite fails if a media file is missing or
either language is empty.

## Develop

```bash
npm install
npm run dev       # local dev server
npm test          # unit tests (Vitest)
npm run build     # type-check + production build into dist/
npm run preview   # serve dist/ locally
```

Stack: Vite, TypeScript (strict), Vitest, Leaflet with OpenStreetMap tiles. No backend: the
whole site, games included, runs locally in the browser.

## Key dates

| Date | Moment |
|---|---|
| 2026-09-20 | We met (day 1) |
| 2026-09-25 | Yifan's birthday |
| 2026-10-31 | Jingyi's birthday, first release |
| 2027-02-05 | Flight CYF925, Shenzhen → New York (the ticket Yifan drew on our first Zoom) |
| 2027-02-08 to 02-12 | AAG Annual Meeting, New York |

## Docs

- Design spec: [`docs/superpowers/specs/2026-10-24-yi-at-first-sight-design.md`](docs/superpowers/specs/2026-10-24-yi-at-first-sight-design.md)
- Plan, part 1 (home + map): [`docs/superpowers/plans/2026-10-24-love-site-part1.md`](docs/superpowers/plans/2026-10-24-love-site-part1.md)
