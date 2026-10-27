# Tattoo (level)

A tattoo for the other one, written by hand. Pick a spot (an arm seen from the side, or a
shoulder: simple inline SVG skins), write or draw with a finger on the canvas over it, undo or
clear, then **Ink it**: the ink settles into the skin and the level clears
(`levelCleared('tattoo')`). It needs about a canvas-width of line in total (`inked`), so a dot
is not a tattoo. The tattoo is kept per player on the device (`yi.tattoo.<player>`: spot and
strokes in unit coordinates) and shown again on return, with **Tattoo again** to redo it.
**Save a picture** renders skin and ink to a 1200×600 PNG to send to the other one.

| File | What |
|---|---|
| `strokes.ts` | Strokes in unit coordinates and `paint` (shared with nothing else now; came from the old Pictionary) |
| `store.ts` | `loadTattoo` / `saveTattoo`, `inkLength`, `inked` |
| `tattoo.ts`, `tattoo.css` | The page: skins, canvas, tools, the settle animation, the PNG export |
| `store.test.ts`, `strokes.test.ts` | Round trip and junk rejection; ink measured without erasing; unit coordinates clamp |
