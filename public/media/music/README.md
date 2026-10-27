# Music

The six songs of the **Our Songs** level and the jukebox, one file each, named by the ids in
`src/features/songs/list.ts`:

| File | Song |
|---|---|
| `only-you.mp3` | 只对你有感觉 |
| `drop-tower.mp3` | 跳楼机 |
| `last-page.mp3` | 最后一页 |
| `best-in-the-world.mp3` | 天下第一好 |
| `until-you-came.mp3` | 直到你降临 |
| `more-and-more.mp3` | 越来越爱 |

MP3 (or M4A, then change `songSrc`), 128–192 kbps is plenty; they are fetched on demand, never
precached. The level plays `start`…`start + length` seconds of each; adjust those in `list.ts` to
the passage you want her to hear.

The repository is private but the site is public at its address, so only put here what you are
comfortable sharing from your own account.
