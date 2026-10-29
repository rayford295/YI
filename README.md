<p align="center">
  <img src="docs/banner.svg" width="100%" alt="Yi at First Sight · 仪见钟情: Coffee, Jingyi, Yifan and Duoduo as pixel sprites on a strip of grass under a navy sky" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/for-two%20players-d3a557?style=flat-square&labelColor=0b2036" alt="for two players" />
  <img src="https://img.shields.io/badge/levels-9%20%2B%20an%20epilogue-d3a557?style=flat-square&labelColor=0b2036" alt="9 levels and an epilogue" />
  <img src="https://img.shields.io/badge/tests-118%20passing-d3a557?style=flat-square&labelColor=0b2036" alt="118 tests passing" />
  <img src="https://img.shields.io/badge/TypeScript-strict-d3a557?style=flat-square&labelColor=0b2036" alt="TypeScript strict" />
  <img src="https://img.shields.io/badge/backend-none-d3a557?style=flat-square&labelColor=0b2036" alt="no backend" />
  <img src="https://img.shields.io/badge/art-drawn%20in%20code-d3a557?style=flat-square&labelColor=0b2036" alt="all art drawn in code" />
</p>

<p align="center">
  <b>A private, bilingual game for two.</b><br/>
  Walk a small pixel version of yourself through a town.<br/>
  Every house is a level made from something that happened to us.<br/>
  The last house holds a ring.
</p>

<p align="center">
  <img src="docs/screenshots/demo.gif" width="640" alt="Walking through Yi Town: talking to the partner by the fountain, bumping into Coffee the cat at a locked door, and opening the sixth house" />
</p>

<p align="center">
  <sub>Yifan and Jingyi live thirteen hours and one Pacific Ocean apart, in College Station, Texas and Shenzhen, China.<br/>
  Built as a birthday gift for October 31, 2026, and meant to keep growing. The name puns on 一见钟情, <i>love at first sight</i>: both names carry the syllable <i>Yi</i>, and the title borrows the 仪 from Jingyi's.</sub>
</p>

<br/>

## ▶ How It Plays

```
  ┌──────────────────────────────────────────────────────────────┐
  │  ONE QUESTION  →  DASHBOARD  →  WHO ARE YOU?  →  THE TOWN     │
  └──────────────────────────────────────────────────────────────┘
```

- **One question** only the two of us can answer opens the door. The answer is stored as a hash.
- **The dashboard** at `jingyifan.love/` lists everything we build under the domain, one card per
  product (`src/features/dashboard/products.ts`). Yi Town is the first, at `/town`; every later
  product lives in this repository too.
- **Pick who you are.** Progress is kept per player, per device, so both of us can play on one phone.
- **Walk the town** with the arrow keys or WASD, a tap on any tile, or the d-pad on a phone. Your
  partner waits by the fountain and tells you how far they have got. The sky follows the clock
  in your own city, so one of us walks it by day and the other by lamplight.
- **Ask Rayford.** The guide, Yifan in a suit, stands just south of the fountain. He explains what
  Yi Town is, lists the levels, says where to go next with a hint, and can walk you to that door.
- **Step onto a door** and a talk box tells that level's story. Go in and play it. A cleared house
  flies a gold flag.
- **Our cats keep the locks.** Coffee sits at the next locked door and Duoduo at the one after, and
  each tells you, in its own way, which level to clear first. When a door opens they get up and
  walk to the next one, and with nothing left to guard they go and sunbathe by the pond or sit in
  the middle of the square.
- **Two signposts** lead out of the square: east to a day of Yifan's in College Station, west to a
  day of Jingyi's in Shenzhen. Each is a map of that person's stops with their hours, and their
  sprite stands wherever the clock in that city puts them. A red mailbox by the fountain holds
  the voice notes the other one left; a jukebox in the corner plays our songs.
- **The ring** is the ninth house, nine for 九九, a love that lasts. When both of us have reached it, the partner points to the
  last letter. Progress lives on each phone, so a short code (or a link) carries it across.

The whole site stands on the town's meadow, and every heading is a sign in the same cream and navy.
Everything runs in the browser and nothing leaves the device. The whole site exists in both
languages, and it installs as an app that works offline.

## ⌂ The Houses

Each roof in the town has its own colour and carries its number. Walk into the door to play the level.

| Roof | # | Level | The task | Behind the door |
|:---:|:---:|---|---|---|
| 🎂 | · | Birthday Prologue | Whisk the batter, place ten strawberries, make a wish, blow the candles out (by breath into the mic, or a held button) | Plays once per player before the town opens; 一帆 bakes against the Shenzhen-midnight clock |
| 🟥 | 1 | The Day We Met | Answer one question, then say the vow line out loud | Day counter, twin clocks, countdown; the vow of being each other's again, heard by the browser |
| 🟦 | 2 | Love Map | Name six street views; each right answer puts a heart on the map to pick up | Texas, Los Angeles, Japan, Shenzhen, Hong Kong, New York, and why each is ours |
| 🟧 | 3 | Tattoo | Handwrite a tattoo for the other one, on an arm or a shoulder, and ink it | Kept on the device; save it as a picture to send |
| 🟩 | 4 | Moments | Put five memories in order, then put the other one's photo back together | The timeline, each memory badged with its day number; the portrait puzzle |
| 🟫 | 5 | Gomoku | Ten endgames, one stone each; the stones you place stay and the tenth completes a heart | Your own colour to move, after our first game on a Zoom whiteboard |
| 🟪 | 6 | Our Songs | Hear a passage, pick the title from four | Six of our songs; the same files feed the jukebox |
| ⬛ | 7 | Libra and Scorpius | Join the stars of both our signs | Real star positions; Libra's brightest stars are still the Scorpion's claws |
| 🟥 | 8 | Us, in Old Verse | Put the missing characters of five love poems back | Su Wu, Guan Daosheng, Li Shangyin, the paired birds of the *Yutai xinyong*, one anonymous couplet |
| 🟨 | 9 | The Ring | The reward | What is inside is not written down here |
| ✉️ | · | The Last Letter | The epilogue | Opens once both players have reached the ring |
| 💒 | · | The Wedding | Say “I do” (aloud or by button), put the rings on, kiss the bride | After the letter: Rayford officiates, the cats are guests, a certificate to save; afterwards the town dresses them as bride and groom |

Rayford never mentions the ring or the wedding before they happen; `src/features/guide/secret.test.ts` enforces it.

## ⌨ Develop

```bash
npm install
npm run dev       # http://localhost:5173
npm test          # 118 unit tests (Vitest)
npm run build     # strict type-check + production build
npm run banner    # redraw docs/banner.svg from the sprite data
npm run icon      # redraw favicon.svg and the PNG icons from the sprites
```

Vite · TypeScript · canvas 2D for the town (every tile and sprite is a string in `sprites.ts`
and `tiles.ts`; there are no image files for the game) · Leaflet · three.js · MediaPipe ·
Node 22. CI runs the tests and the build on every push.

## ⚑ More

- [docs/CHANGELOG.md](docs/CHANGELOG.md): what changed, by version
- [docs/GUIDE.md](docs/GUIDE.md): repository layout, everyday edits (add a memory, a word, a level), status, key dates, screenshots of every level
- [docs/DEPLOY.md](docs/DEPLOY.md): publishing and private hosting
- Design notes: [the site](docs/superpowers/specs/2026-10-24-yi-at-first-sight-design.md) · [the game of levels](docs/superpowers/specs/2026-10-25-quest-design.md) · [the town](docs/superpowers/specs/2026-10-26-town-design.md)
- Each folder under `src/features/` has its own README.

<p align="center">
  <sub>Live at <a href="https://jingyifan.love/">jingyifan.love</a>, unlisted. Personal photos and messages live here; please do not redistribute.</sub>
</p>

<p align="center">
  <sub>🐾 <b>Coffee</b>: ...Meow. This door is locked. Clear the one before it first.</sub>
</p>
