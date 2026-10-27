# Songs (level)

Our six songs, played by the official QQ Music out-chain player (`qq` ids in `list.ts`), under two
opaque masks: the cover area passes taps to the player's button and shows our disc; the part
with the title and cover art is covered. A song without a `qq` id falls back to a local file
(`public/media/music/<id>.mp3`, a passage from `start` for `length` seconds). Pick the title from four.
A wrong title is crossed out and the song can be played again; the right one shows title and
singer and the next song. Six right clears the level (`levelCleared('songs')`). The songs come
in a different order each visit; once cleared they can be browsed with Prev / Next.

The audio files are the owner's to add at `public/media/music/<id>.mp3` (see that folder's
README). Without a file the disc says the song
is not here yet; the titles can still be chosen. The jukebox (`src/features/music/`) plays the
same files whole.

| File | What |
|---|---|
| `list.ts` | `SONGS` (id, title, artist, the passage), `songSrc`, `choices` (four titles), `shuffle` |
| `songs.ts`, `songs.css` | The page: a spinning disc, the four titles, the reveal |
| `list.test.ts` | Six distinct songs; four distinct choices including the right one; shuffle keeps every element |
