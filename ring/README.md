# Meridian — the ring

A parametric engagement-ring design built entirely in Blender from one Python
script, so every dimension can change later without redrawing anything.

## The idea

- **One round stone, four prongs** set at north, east, south and west, like a
  compass rose.
- **A meridian groove** runs around the outside of the band and passes under
  the stone, like a line of longitude on a globe.
- **Two metals**: platinum body (the cool blue of the homepage), yellow-gold
  prongs, seat and sapphire bezel (the gold accent).
- **A hidden sapphire** sits inside the bottom of the band, visible only when
  the ring is taken off. It doubles as the separator in the engraving.
- **Inner engraving**: `2026 · 09 · 20` (the day we met) on one side of the
  sapphire, `40.64°N 73.78°W` (JFK, where we meet in person) on the other.

## Files

| Path | What |
|------|------|
| `meridian.py` | The whole model, materials, lights, cameras, render settings. Parameters are in the `P` dict at the top. |
| `meridian.blend` | Saved scene, regenerated on every run; open it in Blender to orbit around the ring. |
| `renders/` | `hero`, `top`, `profile`, `inside` and `detail` views. |

## Run

```bash
/Applications/Blender.app/Contents/MacOS/Blender -b -P ring/meridian.py -- --render          # all views
/Applications/Blender.app/Contents/MacOS/Blender -b -P ring/meridian.py -- --render hero    # one view
/Applications/Blender.app/Contents/MacOS/Blender ring/meridian.blend                        # open in the UI
```

Units are millimetres. `inner_diameter` is a placeholder (US size 6, 16.5 mm)
until we know the real size. Engraving text, stone diameter, band thickness and
prong size are all single numbers in `P`.

## Still to decide

- Real ring size.
- Final engraving text and font.
- Stone: diamond vs moissanite vs lab-grown, and carat.
- Whether the meridian groove stays a plain groove or gets a gold inlay.
