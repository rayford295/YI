# Changelog

Versions are tags of feeling more than of code; the site deploys on every push.

## 1.13.0 (2026-10-27)

- Rayford, the town's guide: Yifan in a suit, standing just south of the fountain. He explains
  what Yi Town is, lists the levels, tells you about the cats, mailbox and signposts, says where
  to go next with a hint for that level, and can walk you to its door. He also gives the
  first-visit welcome. All lines are written in advance, in both languages.

## 1.12.4 (2026-10-27)

- Gomoku: the ten gold stones now form a heart you can actually see (two lobes, the dip, the
  sides, the tip), drawn in order as the puzzles are solved, and the finished heart glows on
  its own for a few seconds before the "level cleared" card appears.
- Ring: Mendelssohn's Wedding March plays under the reveal (public-domain recording).

## 1.12.3 (2026-10-27)

- Renamed the repository from `YI` to `yi-town`, after the pixel town the site opens on (the
  old address redirects). The installed app is now titled "Yi Town". Test badge corrected to
  113.

## 1.12.2 (2026-10-26)

Check-up (a fresh-eyes review plus a scripted play-through of all nine levels and a sweep of
every route at 320, 390 and 1280 px in both languages):

- Fixed: the map's found hearts were shared between players in one tab, so the second player
  could find the quiz gone and the level unclearable; now per player.
- Fixed: Our Songs counted a song answered twice after Prev/Next and could clear early; it now
  tracks which songs were named.
- Fixed: Gomoku left a stray stone when two wrong taps came within half a second.
- Fixed: the jukebox kept playing under the Songs level; it now pauses when the level opens.
- Fixed: a speech result arriving after leaving level 1 could open the cleared card elsewhere.
- Fixed: the Songs players overflowed a 320 px screen; the 330 px player now scales to the card.
- Tattoo: the saved picture carries an explicit size (Safari drew it blank), a failed save says
  so, and a second finger no longer swallows the first stroke.
- One shared `shuffle`; a duplicate homophone dropped; an unused export removed.

## 1.12.1 (2026-10-26)

- Level 1: typing the line is offered alongside the microphone from the start (owner).

## 1.12.0 (2026-10-26)

- Levels 3 and 4 merged (owner): **Moments** now asks for the days in order and then the
  portrait puzzle, in one house. The freed third house is **Tattoo**: handwrite a tattoo for
  the other one on an arm or a shoulder and ink it; kept on the device, exportable as a PNG.

## 1.11.0 (2026-10-26)

- Gomoku (owner): ten positions instead of three, one stone each; every answer stays on the
  board in gold and the tenth completes a heart. Positions are generated from three patterns
  around the heart's points and checked to have exactly one winning point.

## 1.10.0 (2026-10-26)

- Level 1 gains its second half (owner): after the question, the vow. Wedding vows rewritten
  as the vow of becoming each other's boyfriend and girlfriend once more, then one line to say
  to the phone: Yifan "我爱你，陈静仪，我愿意", Jingyi "我爱你，杨一帆，我愿意". The browser's
  speech recogniser listens (Mandarin; homophones of the names count); where it cannot listen,
  or after a few misses, the line can be typed. The level clears only once the line is said.

## 1.9.0 (2026-10-26)

- Level 2 rebuilt (owner): six places, a heart in each. A street-level photo comes first; name
  the place and its heart appears on the map to pick up. Texas (his PhD), Los Angeles (his
  master's), Japan (a place she loves), Shenzhen (where she is), Hong Kong (her master's), New
  York (where we may meet). Free Commons photos with credits; the map refreshes its size when
  the card changes the layout.

## 1.8.0 (2026-10-26)

- Level 7 is now **Libra and Scorpius** (owner: the computed sky "wasn't much fun"): our two
  signs at their real star positions, side by side; tap two stars to draw each line of both
  figures, 20 in all. A note tells that Libra's brightest stars are still the Scorpion's claws.
  The astronomy library and the star catalogue are gone.

## 1.7.2 (2026-10-26)

- Our Songs: a second source, the official YouTube embed (official or auto-generated "Topic"
  uploads), covered except a hole over its play button. Jingyi gets QQ Music by default, Yifan
  YouTube, and either can switch on the page (`yi.songs.source`): QQ Music plays only from
  mainland China, YouTube only outside it.

## 1.7.1 (2026-10-26)

- Our Songs plays through the official QQ Music out-chain player (song ids in
  `src/features/songs/list.ts`) under masks that hide its title and cover; the local-file path
  remains for a song without an id. The jukebox is hidden on that page. Singers added for
  天下第一好 (李小眼) and 直到你降临 (阿肆).

## 1.7.0 (2026-10-26)

Two levels rebuilt so one person on one phone can clear them (owner, 2026-10-26):

- **Gomoku** is now three endgame positions. The player sees their own colour to move and taps
  the one stone that makes five; a wrong stone fades, the right line lights up. The third
  position has the other side one move from winning. The full two-player game, the tally and
  the saved game are gone.
- **Pictionary** is replaced by **Our Songs** (`/songs`, level id `songs`): six of our songs, a
  passage each; pick the title from four. The jukebox now plays the same six files whole and
  turns itself off when none of them is there yet. The files are the owner's to add.

## 1.6.0 (2026-10-26)

- A ninth level, **Us, in Old Verse** (`/poems`), now the eighth house: five classical lines
  about love with their second half taken out, put back character by character from a bank with
  decoys. The poems are the owner's (Su Wu, Guan Daosheng, Li Shangyin, the *Yutai xinyong*
  birds, one anonymous couplet). The ring is the ninth house: nine levels for 九九.

## 1.5.1 (2026-10-26)

Repository check-up (a fresh-eyes review plus a page sweep at 320, 390 and 1280 px):

- Fixed: a `/sync?c=…` link opened on a phone with no player picked lost its code at the picker.
- Fixed: "Start over" in the town left a second engine, its key handlers and timers running
  behind every later page; the list view stacked listeners the same way.
- Fixed: a "level cleared" card could outlive its page (browser back); it now goes with the page,
  and it takes keyboard focus when it opens.
- Fixed: the epilogue opened once the ring was merely unlocked; it now needs the ring cleared, as
  the docs and the partner say.
- Fixed: the ring reveal kept running on the body after leaving the page; the try-on countdown
  could render on a disposed renderer; a cat photo in the day pages sat above the words.
- The jukebox and the toast respect the phone's home-indicator inset; the gate's answer box gets
  focus on Safari; the sync page no longer overflows a 320 px screen.
- Service worker: direct links to `/media/…` are no longer answered with the app shell.
- Removed dead strings, CSS and exports; two stray `.blend1` files dropped from the repository;
  CI runs on pushes to `main` only; docs brought in line (tests count, portraits, both days).

## 1.5.0 (2026-10-26)

- Fixed: the ring's reveal showed the 3D card instead of the rose (the card's own entrance
  animation kept it visible above the veil).

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
