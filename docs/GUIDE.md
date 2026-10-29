# Guide: Layout, Everyday Edits, Status

The README is the short tour. This file holds the working detail: where things live, how to make
the usual edits, what is done and what is still owed.

## Repository Layout

```
yi-town/
├── index.html                  # page shell, fonts
├── public/media/<feature>/     # photos, videos, models, avatars; one folder per feature
├── src/
│   ├── main.ts                 # app shell, gate, path router (core/router.ts), lazy routes, language toggle
│   ├── styles/base.css         # design tokens, top bar, cards, animations
│   ├── core/                   # shared by every feature
│   │   ├── i18n.ts             #   zh/en dictionary, t(), pick(), language state
│   │   ├── quest.ts            #   level registry, per-player progress, locks
│   │   ├── sync.ts             #   progress codes (encode, decode, merge)
│   │   ├── quest-ui.ts         #   avatars, cleared card, toast
│   │   ├── gate.ts             #   entry question (SHA-256 of accepted answers)
│   │   ├── celebrate.ts        #   confetti, chime, voice-line URL
│   │   ├── dates.ts geo.ts     #   time-zone aware day counter and clocks; great-circle arcs
│   │   └── config.ts           #   names, time zones, key dates, next meeting
│   └── features/               # one folder per feature: code, styles, data, tests, README
│       ├── gate/ start/ sync/  #   the front door, the player picker, progress codes
│       ├── world/              #   the town: town.ts (maps), tiles.ts, sprites.ts, engine.ts, controls.ts, world.ts
│       ├── music/              #   the jukebox (tracks.ts is the playlist)
│       ├── voice/              #   the mailbox of voice notes (notes.ts is the list)
│       ├── days/               #   a day in College Station (cs.ts) and in Shenzhen (sz.ts); render.ts draws both
│       ├── journey/            #   the list view
│       ├── home/ birthday-map/ tattoo/ moments/ (+ puzzle/ mounted inside it) gomoku/ songs/
│       ├── stars/              #   constellations.ts (Libra + Scorpius stars and lines), stars.ts (page)
│       ├── guide/              #   Rayford's lines (rayford.ts), with the secrecy test (secret.test.ts)
│       ├── dashboard/          #   the front page at /: products.ts lists what is on it
│       ├── theatre/            #   the pixel cutscene engine: stage.ts, music.ts (synth), blow.ts (breath by mic)
│       ├── birthday/           #   the prologue: Yifan bakes the cake (kitchen.ts paints it; CANDLES = 9)
│       ├── wedding/            #   the finale after the letter: garden.ts paints it; the certificate PNG
│       ├── poems/              #   lines.ts (five poems, bank/blank/solved), poems.ts (page)
│       ├── ring/               #   3D viewer, webcam try-on, photo card
│       └── letter/             #   the epilogue
├── ring/                       # the ring's Blender script and renders
├── paper/                      # the paper (LaTeX + PDF) and the Chinese report, sharing figures/
├── docs/
│   ├── DEPLOY.md               # how to publish (GitHub Pages) or host privately (Cloudflare)
│   ├── screenshots/
│   └── superpowers/            # design specs and implementation plans
└── .github/workflows/ci.yml    # tests + build on every push
```

Each feature folder has its own README explaining its files and rules.
## Everyday Edits

**Redraw the icons.** `npm run icon` redraws `public/favicon.svg` and the PNG icons from the
sprites (`scripts/icon.ts`, `scripts/icon-png.py`), like `npm run banner` does for the README.

**Add a memory.** Drop the photo into `public/media/moments/` (JPEG, at most 1600 px on the
long side) and append an entry to `src/features/moments/memories.ts`. It appears on the map,
the timeline (the puzzle uses `src/features/puzzle/portraits.ts` instead). The tests fail if the file is missing or either language is empty.

**Edit the letter.** Change the paragraphs in `src/features/birthday-map/letter.ts`, keeping
Chinese and English in step. `{h}` is replaced with the live hour difference.

**Add the song files.** Put each song at `public/media/music/<id>.mp3`, with the ids from
`src/features/songs/list.ts` (`start` and `length` pick the passage the level plays). The jukebox
plays them whole through the YouTube player (no files are hosted). A Gomoku position is a list of stones in `src/features/gomoku/puzzles.ts`;
the test fails unless the mover has exactly one winning point.

**Change a key date.** Everything is in `src/core/config.ts`.

**Redraw the README banner.** `npm run banner` regenerates `docs/banner.svg` from the sprite strings in
`src/features/world/sprites.ts`, so a new outfit or a new cat shows up there too.

**Change the entry question.** Edit `gate.question` and `gate.placeholder` in
`src/core/i18n.ts`, then run `npm run gate -- "answer" "another spelling"` and paste the hashes
into `ANSWERS` in `src/core/gate.ts`. Answers are compared digits-only.

**Add a level.** Append it to `LEVELS` in `src/core/quest.ts`, add its title/story/task strings,
register the route in `src/main.ts`, call `levelCleared('<id>')` when the task is done, and give
it a house in `BUILDINGS` (`src/features/world/town.ts`) with a door tile on the grid. Level
numbers are derived from the registry; a test fails until the new door is reachable.

**Add a feature.** Create `src/features/<name>/` with a README, a page module
(`renderX(root) => cleanup`), CSS and tests; put media in `public/media/<name>/`; register
the route in `src/main.ts` and the strings (both languages) in `src/core/i18n.ts`.

**Add a product to the dashboard.** The site root `/` is the dashboard
(`src/features/dashboard/`); Yi Town is one product on it, at `/town`. A new product is a
feature as above plus one entry in `PRODUCTS` (`src/features/dashboard/products.ts`): route,
title and blurb keys, an optional picture under `public/`, and an optional `status()` line.
Routes other than `/` ask for a player first; add an exception in `render()` in `src/main.ts`
if a product should not.
## Status

- [x] Home, Love Map, Moments, Gomoku, Pictionary (v1, 2026-10-24)
- [x] Game of levels with real locks, Puzzle, That Night's Sky, the ring, the epilogue letter, the entry gate, PWA (2026-10-25 and 10-26)
- [x] The town as the home page, with tap-to-walk and house name plates (2026-10-26)
- [x] Jukebox in the corner of every page and a mailbox of voice notes in the town (v1.5.0, 2026-10-26)
- [x] A day of Jingyi's in Shenzhen (`/sz`): her Tesla, Tencent, the bay, the cats at the door; west signpost (v1.4.0, 2026-10-26)
- [x] Puzzle uses portraits of the other one (`src/features/puzzle/portraits.ts`, v1.3.1, 2026-10-26)
- [x] Levels open only through their doors; no shortcuts from the top bar, list or cleared card (v1.3.0, 2026-10-26)
- [x] 153 unit tests; the build type-checks with `strict` TypeScript; CI runs both on every push
- [x] Checked in a real browser at desktop, 390 px and 320 px widths
- [x] Coffee and Duoduo, the two cats, as pixel sprites with their own lines and photos (2026-10-26)
- [x] A Day in College Station (`/cs`): second map with seven stops, Yifan standing where the clock puts him; engine takes any map (v1.2.0, 2026-10-26)
- [x] Progress codes: `/sync` carries progress between phones as a code or link (v1.1.0, 2026-10-26)
- [x] The whole site stands on the town's pixel meadow with the time-of-day wash; headings on signs, panels in cream and navy (2026-10-26)
- [x] Town: a one-time welcome line with the controls; phone checklist in DEPLOY.md (2026-10-26)
- [x] Town: day and night follow the player's own city, with lit windows; resting cats fidget (2026-10-26)
- [x] Town: cats walk to their new posts when a door opens; iris transition in and out of houses (2026-10-26)
- [x] Town: footsteps, thud, talk-box and door sounds (synthesised, with a switch), drifting pond and fountain glint (2026-10-26)
- [x] Domain chosen: jingyifan.love (2026-10-26); live at https://jingyifan.love/ with HTTPS since 2026-10-26 (deploy on every push while `PUBLISH` is true)
- [x] Rayford the guide; the dashboard at `/` with the town at `/town` (v1.13–1.14, 2026-10-27)
- [x] Birthday prologue (`/birthday`) and the wedding (`/wedding`) as pixel cutscenes; the ring is a secret until it is reached (`secret.test.ts`); a hole in time by house 9 leads to the wedding (v1.15–1.16, 2026-10-28)
- [x] Whole-site review pass: gate placeholder, ISO 7064 check character for codes, non-blocking fonts, phone layouts, cutscene edge cases (v1.16.0, 2026-10-28)
- [x] The ring level is cleared by the try-on photo; jukebox on YouTube; in-level progress survives a language toggle or reload; quizzes re-deal on a wrong pick; first voice note in the mailbox (v1.17.0, 2026-10-28)

### Where we stopped (2026-10-28) and what is next

Owner's own work (text in his words; both languages in each file):
- [ ] The epilogue letter: `src/features/letter/text.ts` is a draft written for him; `{d}` days and `{h}` hours fill in live.
- [ ] The birthday letter on the Love Map: `src/features/birthday-map/letter.ts` (same draft status).
- [ ] Yifan checks the hours and stories of his day (`src/features/days/cs.ts`, `cs.story.*` in `i18n.ts`); Jingyi's day is a guess (`src/features/days/sz.ts`, `sz.story.*`).
- [ ] More voice notes: drop `<date>-<sender>.m4a` into `public/media/voice/notes/` and run `npm run notes`, or record on the Mac with `python3 scripts/record-note.py yifan`. Optional per-level lines for the cleared cards: `public/media/voice/README.md`.
- [ ] Test on real phones what headless browsers cannot: the try-on camera and photo (clears level 9), blowing the candles out into the mic, saying "I do", the wedding certificate's share sheet, YouTube in the jukebox.

Ideas not started:
- [ ] Later: a long road from Shenzhen to College Station as a second map, gifts, daily notes, two players online at once
## Key Dates

| Date | Moment |
|---|---|
| 2026-09-20 | We met (day 1) |
| 2026-09-25 | Yifan's birthday |
| 2026-10-31 | Jingyi's birthday, first release |
| 2027-02-05 | Flight CYF925, Shenzhen → New York (the ticket Yifan drew on our first Zoom) |
| 2027-02-08 to 02-12 | AAG Annual Meeting, New York |

## The Levels in Pictures

<p align="center">
  <img src="screenshots/met.png" width="32%" alt="Level 1: The Day We Met" />
  <img src="screenshots/map.png" width="32%" alt="Level 2: Love Map" />
  <img src="screenshots/tattoo.png" width="32%" alt="Level 3: Tattoo" />
  <img src="screenshots/moments.png" width="32%" alt="Level 4: Moments" />
  <img src="screenshots/gomoku.png" width="32%" alt="Level 5: Gomoku" />
  <img src="screenshots/songs.png" width="32%" alt="Level 6: Our Songs" />
  <img src="screenshots/stars.png" width="32%" alt="Level 7: Libra and Scorpius" />
  <img src="screenshots/poems.png" width="32%" alt="Level 8: Us, in Old Verse" />
  <img src="screenshots/town.png" width="32%" alt="Yi Town" />
  <img src="screenshots/town-phone.png" width="32%" alt="The town on a phone" />
</p>
