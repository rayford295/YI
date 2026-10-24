# Moments

The record of our love moments: the single source of truth for every memory shown on the
map, and later on a timeline page.

| File | Role |
|---|---|
| `memories.ts` | `PLACES`, the `Memory` type, `memories[]`, `sortedMemories()` |
| `memories.test.ts` | validates every entry (date, coordinates, both languages, media files exist) |

Media: `public/media/moments/`.

**To add a moment:**

1. Put the photo or video in `public/media/moments/` (JPEG, at most 1600 px on the long side:
   `sips -Z 1600 -s format jpeg -s formatOptions 82 in.png --out out.jpg`).
2. Append an entry to `memories` with `id`, `date` (`YYYY-MM-DD`), `place`, bilingual
   `title` / `text`, and `media[]` with bilingual `alt`.
3. Run `npm test`.

Planned: a `#/moments` timeline page in this folder.
