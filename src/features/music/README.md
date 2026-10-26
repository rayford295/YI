# Music (the jukebox)

A small player pinned to the bottom-right corner of every page (`mountJukebox()` from
`main.ts`): the gold ♪ starts and pauses, the title skips to the next song. Off until someone
turns it on, then remembered on the device (`yi.music`, `yi.music.track`) and resumed on the next
visit after the first tap or key, which is when a browser allows sound. The playlist is
`tracks.ts`; the files live in `public/media/music/` (see its README about what to put there).
With an empty playlist nothing is shown.
