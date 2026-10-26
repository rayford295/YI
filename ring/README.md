# Meridian — a pair of rings

Two parametric rings built in Blender from one Python script, so every dimension can change
later without redrawing anything.

## The idea

Both rings share one signature: a **yellow-gold meridian** inlaid around the outside of a
platinum band, like a line of longitude on a globe; a **hidden sapphire** inside the bottom of
the band, visible only when the ring is taken off; and an **engraving** on either side of that
sapphire: the other person's name and birthday on the left, the day we met and the
coordinates where we meet on the right.

| | Hers (v2, current) | Hers v1 (kept) | His |
|---|---|---|---|
| Band | 5.0 × 2.6 mm flat comfort-fit, brushed platinum (same language as his; thicker so the pavilion stays inside the metal) | slim round 1.8 mm, polished platinum | 5.2 × 1.9 mm flat comfort-fit, brushed platinum |
| Stone | 4.2 mm round brilliant sunk into the band (crown just proud of the surface) in a polished-gold seat with a gold rim; two 1.5 mm flush-set stones on each side along the meridian | 7 mm round brilliant on four compass prongs, halo of 18 small brilliants, five graduated stones on each shoulder | none |
| Engraving | `Dr. Yifan Yang, 25th Sept.` ✦ `2026·09·20 · 40.64°N 73.78°W` | same | `Jingyi Chen, 31st Oct.` ✦ `2026·09·20 · 40.64°N 73.78°W` |
| Size placeholder | US 6 (16.5 mm) | US 6 | US 10 (19.8 mm) |

The site's ring page shows the current pair and a "design history" with both versions of hers.

## Files

| Path | What |
|------|------|
| `meridian.py` | Both models, materials, lights, cameras, render and GLB export. Per-ring parameters are in the `RINGS` dict at the top. |
| `meridian_hers.blend`, `meridian_hers_v1.blend`, `meridian_his.blend` | Saved scenes, regenerated on every run; open in Blender to orbit around. |
| `renders/` | `hers_*`, `hers_v1_*` and `his_*`: hero, top, profile, inside, detail. |
| `../public/media/ring/*.glb` | Web copies used by the `#/ring` page. After every `--export`, run `npm run ring:pack` (meshopt compression, about 8× smaller; the page loads them with three.js's MeshoptDecoder). |
| `../public/media/ring/renders/*.jpg` | 700 px thumbnails of the hero renders for the design-history cards; `npm run ring:thumbs` makes them. |

## Run

```bash
B=/Applications/Blender.app/Contents/MacOS/Blender
$B -b -P ring/meridian.py -- --ring both --render --export    # everything (hers, hers_v1, his)
$B -b -P ring/meridian.py -- --ring hers --render hero        # one view of one ring
$B ring/meridian_hers.blend                                   # open in the UI
```

Gotchas learned the hard way: a revolved cutter must wind the same way as `brilliant()`'s profile
or the EXACT boolean unions instead of subtracting; cutters are applied in order (`apply=True`)
rather than stacked; stones only read as diamonds when something bright and structured is in the
scene to refract, hence the camera-invisible emissive strips.

Units are millimetres. The engraving uses Didot from macOS (Baskerville, then Songti, as fallbacks);
on another machine edit `FONTS`.

## Still to decide

- Real ring sizes.
- Final engraving text and font.
- Her stone: diamond vs moissanite vs lab-grown, and carat.
- Whether his band gets a second, thinner meridian or stays with one.
