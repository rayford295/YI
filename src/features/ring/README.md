# The Ring

Route: `#/ring` (top-bar entry: 戒指 / The Ring)

An interactive 3D view of the pair of Meridian rings designed in `ring/meridian.py`. **Hers / His**
switches the model; drag to turn it, scroll to zoom, and press **Look inside** to fly the camera
to the hidden sapphire and the engraving (the other's name and birthday on one side, `2026·09·20` and
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

## Try it on

**Try it on** opens the webcam and puts the current ring on your ring finger. Hand tracking is
MediaPipe's Hand Landmarker running in the browser (WebAssembly from `public/mediapipe/`, model
`hand_landmarker.task`, about 21 MB in all, loaded on first use). Landmarks 13 and 14 (ring-finger
MCP and PIP) give the finger's position and direction; the spacing between the middle, ring and
little MCP joints is the pixels-per-millimetre ruler; the palm normal plus MediaPipe's handedness
puts the stone on the back of the hand. An invisible cylinder along the finger writes depth only,
so the far side of the band is hidden behind the finger. No frame leaves the device.

`tryon.ts` owns the camera, the landmarker and the hand rig; `ring.ts` swaps the orbit scene for
the try-on scene and back. **Switch camera** toggles front and rear cameras on phones (the front
camera is mirrored, the rear is not). If the stone ever sits on the palm side, flip
`LABEL_IS_MIRRORED` in `tryon.ts`.

## Photos

**Take a photo** (visible while trying on) counts down 3-2-1, freezes the webcam frame with the
ring layer on top, adds a small caption (title, the day we met, the coordinates) and offers the
PNG to save. **Together, apart** below the stage takes two such photos, one from each of us, and
draws them side by side on one 1800 × 1200 card joined by a single gold meridian with the hidden
sapphire where it meets the caption band; names sit under their own halves. All drawing happens on
a canvas in the browser (`photo.ts`); nothing is uploaded.

## Avatars

Cartoon avatars at `public/media/avatars/jingyi.png` and `yifan.png` appear on the Hers / His
buttons; the buttons simply drop the picture if the files are missing.
