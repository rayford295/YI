# Yi at First Sight — Design Spec (v1, Birthday Release)

- **Date:** 2026-10-24
- **Note:** Folder layout was revised on 2026-10-24 to one folder per feature (`src/features/<name>/`); see README.
- **Note:** On 2026-10-24 the owner ruled that both games are single-device (hot-seat) and run locally; no Supabase, no real-time sync. Sections below that describe live play are superseded.
- **Owner:** Yifan Yang (rayford295)
- **Status:** Draft — awaiting owner review
- **Hard deadline:** 2026-10-31 (Jingyi's birthday)

## 1. Purpose

A private, bilingual (Chinese / English) website for Yifan (Texas A&M, College Station, TX)
and Jingyi Chen (Shenzhen, China) to record their relationship across a 13-hour time
difference, keep it alive day to day, and carry gifts from Yifan to Jingyi.

The first release is a **birthday gift**: a love map of the places and moments they have
shared, plus two games they already play together (Gomoku and Pictionary), playable live
between Shenzhen and Texas.

The name puns on the Chinese idiom *yi jian zhong qing* ("love at first sight"): both names
contain the syllable *Yi* (Yi-fan, Jing-yi). The Chinese title swaps in the *yi* from Jingyi's name.

### What the owner said vs. what is assumed

| Stated by owner | Assumed (owner may correct) |
|---|---|
| Fully closed source, private repo `Yi-at-First-Sight` | Viewer access is limited to the two of them via a login gate at the host |
| Chinese + English | Chinese is the default language; English via a one-tap toggle |
| Met on 09-20; Yifan's birthday 09-25; Jingyi's birthday 10-31 | The year they met is 2026 |
| Likely to meet at AAG in Feb 2027 | Countdown target is configurable; exact AAG 2027 dates verified before filling in |
| Map of places, photos, videos as a birthday blessing | She mostly opens it on a phone |
| Games: Gomoku, Pictionary, "not afraid of a rush" | Both games play **live online** (real-time) in v1 |
| Don't worry about access from China | No China-specific hosting/CDN work in v1 |

## 2. Success criteria

1. On 10-31, Jingyi opens one link on her phone, logs in, and sees a birthday greeting,
   the day counter, and the love map with the first memories (photos + captions).
2. Every user-facing string exists in both Chinese and English; the toggle switches the
   whole site without reload.
3. From Shenzhen and Texas, they can each open Gomoku and play a full game live; moves
   appear on the other side within about one second.
4. Same for Pictionary: one draws, the other sees strokes appear live and types guesses.
   (Superseded 2026-10-26: both games were two-player on one phone while the two of us are on
   two phones; Gomoku became three win-in-one endgames and Pictionary became Our Songs, a
   listen-and-pick level. See `docs/CHANGELOG.md` 1.7.0.)
5. Nobody without an invited login can see the content.
6. Adding a new memory means editing one data file and dropping media into one folder.

## 3. Scope

### In v1 (by 10-31)

- **Home:** bilingual birthday greeting, "day N since we met" counter, twin clocks
  (Shenzhen / College Station) with day/night state, countdown to the next meeting.
- **Love map:** markers for shared places; each opens a memory card (date, place,
  bilingual caption, photos, videos). An arc connects Shenzhen and College Station.
  A "play our story" mode tours the memories in date order and ends on the birthday letter.
- **Gomoku:** 15×15, live online between two players; restart; undo-by-request;
  local same-device mode as a fallback.
- **Pictionary:** drawer gets a word (bilingual word bank, can include inside
  jokes), canvas strokes stream live, guesser types guesses, round timer, score, roles swap.
- **Language toggle** and responsive layout (phone first).

### Out of v1 (later versions)

Gift system (wish list / gift unlocks), daily notes or check-ins, an upload/admin UI for
memories, more games, push notifications, China-specific hosting.

## 4. Architecture

A static single-page app plus a hosted real-time channel. No server code of our own.

```
Browser (Shenzhen)  ─┐                         ┌─ Browser (Texas)
                     ├── static site (host) ───┤
                     └── Supabase Realtime ────┘   (Broadcast + Presence; no DB tables)
```

- **Build:** Vite + TypeScript, no UI framework (small surface, fast to ship).
- **Routing:** hash routes — `#/`, `#/map`, `#/gomoku`, `#/draw`. (Superseded 2026-10-26: clean paths `/map` etc. via `404.html`, see `docs/DEPLOY.md`.)
- **Map:** Leaflet with a raster tile layer; custom heart markers; arc drawn as a
  polyline sampled along the great circle.
- **Real-time:** Supabase Realtime Broadcast for moves/strokes/guesses and Presence for
  "who is here". One channel per game per room. Supabase URL + anon key come from
  `.env` (never committed).
- **Hosting & access:** Cloudflare Pages behind Cloudflare Access (email one-time code,
  allow-list of two emails). The repo stays private.

## 5. Units

Each unit has one job and is testable on its own.

| Unit | Responsibility | Depends on |
|---|---|---|
| `i18n` | `t(key)`, current language, toggle, persistence (`localStorage`, wrapped in try/catch) | — |
| `data/memories` | Typed list of memories (date, place {zh,en,lat,lng}, title/text {zh,en}, media[]) | — |
| `data/config` | Key dates (met, birthdays, next meeting), names, room id | — |
| `pages/home` | Greeting, counter, twin clocks, countdown | `i18n`, `config` |
| `pages/map` | Leaflet map, markers, memory card, story mode | `i18n`, `memories` |
| `games/gomoku-core` | Pure board logic: place, turn, win detection, undo | — |
| `games/gomoku-ui` | Board rendering + wiring core to the channel | `gomoku-core`, `realtime` |
| `games/draw-core` | Pure round logic: word pick, guess check, scoring, role swap, timer | — |
| `games/draw-ui` | Canvas capture/replay, guess box, scoreboard | `draw-core`, `realtime` |
| `realtime` | Thin wrapper: join room, presence, `send(event, payload)`, `on(event, fn)`; a no-op local mode when not configured | Supabase JS |

## 6. Data flow and state sync

- **Gomoku:** each move is broadcast as `{seq, row, col, color}`. Both clients apply moves
  through `gomoku-core`, which rejects out-of-turn or occupied moves, so both boards agree.
  On join, a client broadcasts `sync-request`; the peer replies with the full move list.
  Undo is a request/accept pair.
- **Pictionary:** strokes are batched (about every 40 ms) as `{strokeId, points[], color,
  width}`; the receiver replays them on its canvas. Only the drawer's client holds the
  secret word until the round ends; guesses are broadcast and checked by the drawer's client,
  which broadcasts the round result. Guess matching ignores case, whitespace and full-width
  vs half-width characters.
- **Presence:** each page shows whether the other person is online.

## 7. Error handling

- Realtime not configured or unreachable: games fall back to local mode with a visible
  bilingual notice; the rest of the site is unaffected.
- Peer disconnects mid-game: state stays on both sides; on reconnect, `sync-request`
  restores it.
- Missing media file: the memory card shows the caption without breaking the map.
- Storage blocked (private mode): language defaults to Chinese each visit.

## 8. Testing

- **Unit (Vitest):** Gomoku win detection in all four directions and at edges; turn and
  occupancy rules; undo. Pictionary guess normalization and scoring. i18n: every key
  exists in both languages. Memory data: valid dates, coordinates, media paths.
- **Manual:** two browsers (one in a private window) on the same room for both games;
  phone-width layout check; language toggle on every page.

## 9. Open items (do not block the spec)

- Supabase project URL + anon key — owner creates the free project.
- Cloudflare account for Pages + Access — owner's account; the two allowed emails.
- Exact AAG 2027 dates and city — verify from the official AAG site.
- Birthday letter text and memory captions — written by Yifan in his own voice.
