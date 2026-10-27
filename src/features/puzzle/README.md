# Puzzle (part of the Moments level)

The other one's face, cut into a 3×3 grid of CSS background tiles; tap two tiles to swap them.
Jingyi always gets a photo of Yifan, Yifan a photo of Jingyi (`portraits.ts`, `portraitsFor`).
"Another photo" draws a different one from the set (`nextPortrait`). `scramble()` guarantees the
start is not already solved; `solved()` decides when `mountPuzzle`'s `onSolved` fires; the Moments level clears itself then. The board
takes the photo's aspect ratio once it loads; the files are pre-cropped to between 4:5 and 1:1
so the nine tiles stay roughly square.

Adding a portrait: drop a JPEG (long edge about 1200 px) into `public/media/portraits/<player>/`
and append a line with both captions to `PORTRAITS` in `portraits.ts`. The test checks every
entry sits under its player's folder and carries both captions.
