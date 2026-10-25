# The Ring

Route: `#/ring` (unlisted: not in the top bar, only reachable by link)

An interactive 3D view of the pair of Meridian rings designed in `ring/meridian.py`. **Hers / His**
switches the model; drag to turn it, scroll to zoom, and press **Look inside** to fly the camera
to the hidden sapphire and the engraving (the other's name and `2026·09·20` on one side,
`40.64°N 73.78°W` on the other).

| File | Role |
|---|---|
| `ring.ts` | `renderRing(root) => cleanup`; three.js scene, GLB loader for either ring, orbit controls, two saved camera views scaled to the model |
| `ring.css` | styles for this page only (navy stage, gold buttons) |

- The models are `public/media/ring/meridian_hers.glb` and `meridian_his.glb`, regenerated with
  `Blender -b -P ring/meridian.py -- --ring both --export`. Blender's Z-up becomes glTF Y-up, so in the
  browser the stone points at +Y and the band's axis is Z.
- Reflections come from three.js's `RoomEnvironment`; there is no HDRI file to load.
- Auto-rotation stops on the first drag and is off under `prefers-reduced-motion`.
- To put the page in the navigation, add `nav.ring` to `i18n.ts` and a `link('/ring', …)` in `main.ts`.
