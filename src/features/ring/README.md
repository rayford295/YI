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

## Who may wear which ring

Try-on is gated by face recognition, also on-device: face-api (TensorFlow.js, models in
`public/face/`, about 6 MB) turns the face in the webcam frame into a 128-number descriptor and
compares it with the enrolled descriptors in `faces.json`. Jingyi unlocks hers, Yifan unlocks his,
anyone else sees the rings stay off. The check repeats about once a second, so both the face and
the hand must stay in the frame.

Enrolment happens on the dev server only: `npm run dev`, open `#/enroll`, add 3 to 8 clear photos
per person, download `faces.json` and save it as `src/features/ring/faces.json`. That file is
git-ignored: descriptors are biometric data, so they never enter the repository. For the hosted
build, paste the file's contents into the repository secret `FACES_JSON`; CI writes it in place
before `npm run build` (`faces.example.json` is the empty fallback, used when the secret is unset).

Be clear about what that protects: the match runs in the browser, so whatever is in `faces.json`
at build time ships inside the published JavaScript bundle. Keeping it out of git keeps it out of
the repository's history and forks, not out of the live site. Anyone who can open the site can
fetch the two descriptors (they cannot rebuild a face from them, but they could recognise the two
of you in other photos). That is acceptable while the site is private or behind Cloudflare Access;
for a fully public site, leave the secret unset (the gate then stays closed) or move the match
behind a server. The "Check a photo" box on that page
reports the match distance (same person below 0.5, strangers above 0.6).

Cartoon avatars at `public/media/avatars/jingyi.png` and `yifan.png` appear on the Hers / His
buttons and in the greeting; the buttons simply drop the picture if the files are missing.
