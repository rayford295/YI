# Meridian — a pair of rings

Two parametric rings built in Blender from one Python script, so every dimension can change
later without redrawing anything.

## The idea

Both rings share one signature: a **yellow-gold meridian** inlaid around the outside of a
platinum band, like a line of longitude on a globe; a **hidden sapphire** inside the bottom of
the band, visible only when the ring is taken off; and an **engraving** on either side of that
sapphire: the other person's name and the day we met on the left, the coordinates where we
meet on the right.

| | Hers | His |
|---|---|---|
| Band | slim round, polished platinum | wide flat comfort-fit, brushed platinum |
| Stone | round brilliant on four gold prongs set N / E / S / W like a compass | none |
| Engraving | `一帆 · 2026·09·20` ✦ `40.64°N 73.78°W` | `静仪 · 2026·09·20` ✦ `40.64°N 73.78°W` |
| Size placeholder | US 6 (16.5 mm) | US 10 (19.8 mm) |

## Files

| Path | What |
|------|------|
| `meridian.py` | Both models, materials, lights, cameras, render and GLB export. Per-ring parameters are in the `RINGS` dict at the top. |
| `meridian_hers.blend`, `meridian_his.blend` | Saved scenes, regenerated on every run; open in Blender to orbit around. |
| `renders/` | `hers_*` and `his_*`: hero, top, profile, inside, detail. |
| `../public/media/ring/*.glb` | Web copies used by the `#/ring` page. |

## Run

```bash
B=/Applications/Blender.app/Contents/MacOS/Blender
$B -b -P ring/meridian.py -- --ring both --render --export    # everything
$B -b -P ring/meridian.py -- --ring hers --render hero        # one view of one ring
$B ring/meridian_hers.blend                                   # open in the UI
```

Units are millimetres. The engraving uses Songti from macOS so the Chinese names render;
on another machine edit `FONTS`.

## Still to decide

- Real ring sizes.
- Final engraving text and font.
- Her stone: diamond vs moissanite vs lab-grown, and carat.
- Whether his band gets a second, thinner meridian or stays with one.
