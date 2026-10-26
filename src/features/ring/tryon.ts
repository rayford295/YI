// Try-on: webcam + MediaPipe hand landmarks place the ring on the ring finger.
// Everything runs in the browser; no frame leaves the device.
import * as THREE from 'three';
import { FilesetResolver, HandLandmarker, type NormalizedLandmark } from '@mediapipe/tasks-vision';

const MP = `${import.meta.env.BASE_URL}mediapipe`;
// Average spacing between the middle, ring and little MCP joints, used as the pixels-per-mm ruler.
const MCP_SPACING_MM = 19.5;
// MediaPipe's handedness label matched the real hand on a raw webcam frame in testing
// (2026-10-25: with `true` the stone landed on the palm side). Flip if it ever ends up there again.
const LABEL_IS_MIRRORED = false;

export interface TryOnHandles {
  video: HTMLVideoElement;
  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;
  /** Call once per animation frame; returns false while no hand is tracked. */
  update(now: number): boolean;
  /** Put the ring model in the scene (removing any previous one). */
  setModel(model: THREE.Object3D | null, outerRadius: number): void;
  /** Hide the ring without stopping tracking (used while the face gate is closed). */
  setEnabled(on: boolean): void;
  switchCamera(): Promise<void>;
  stop(): void;
}

export async function startTryOn(mount: HTMLElement, environment: THREE.Texture): Promise<TryOnHandles> {
  const video = document.createElement('video');
  video.className = 'ring-video';
  video.playsInline = true;
  video.muted = true;
  mount.prepend(video);

  let facing: 'user' | 'environment' = 'user';
  let stream: MediaStream | null = null;
  const openCamera = async () => {
    stream?.getTracks().forEach((t) => t.stop());
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false,
    });
    video.srcObject = stream;
    await video.play();
    camera.left = 0; camera.right = video.videoWidth; camera.top = 0; camera.bottom = -video.videoHeight;
    camera.updateProjectionMatrix();
  };

  const scene = new THREE.Scene();
  scene.environment = environment;
  const camera = new THREE.OrthographicCamera(0, 1, 0, -1, -5000, 5000);
  camera.position.z = 1000;
  const key = new THREE.DirectionalLight(0xffffff, 2.0);
  key.position.set(-300, 500, 800);
  const fill = new THREE.DirectionalLight(0xfff1dc, 0.8);
  fill.position.set(400, -200, 600);
  scene.add(key, fill, new THREE.AmbientLight(0xffffff, 0.35));

  // The hand: a rig that carries the ring and an invisible finger that hides the far side of the band.
  const rig = new THREE.Group();
  const finger = new THREE.Mesh(
    new THREE.CylinderGeometry(1, 1, 1, 32, 1, true),
    new THREE.MeshBasicMaterial({ colorWrite: false }),
  );
  finger.renderOrder = -1;
  finger.rotation.x = Math.PI / 2;      // cylinder axis Y -> rig Z (the band's axis)
  rig.add(finger);
  rig.visible = false;
  scene.add(rig);

  let enabled = false;
  let tracked = false;
  let model: THREE.Object3D | null = null;
  let outerR = 10;
  const setModel = (m: THREE.Object3D | null, outerRadius: number) => {
    if (model) rig.remove(model);
    model = m;
    outerR = outerRadius;
    if (m) { m.position.set(0, 0, 0); m.quaternion.identity(); m.scale.setScalar(1); rig.add(m); }
    const innerR = outerR * 0.82;
    finger.scale.set(innerR, outerR * 2.2, innerR);
  };

  const [vision] = await Promise.all([FilesetResolver.forVisionTasks(MP), openCamera()]);
  const landmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: { modelAssetPath: `${MP}/hand_landmarker.task`, delegate: 'GPU' },
    runningMode: 'VIDEO', numHands: 1, minHandDetectionConfidence: 0.6, minTrackingConfidence: 0.6,
  });

  // Smoothed pose.
  const sPos = new THREE.Vector3(), sQuat = new THREE.Quaternion();
  let sScale = 0, lastTime = -1, seen = 0;
  const toPx = (l: NormalizedLandmark) => new THREE.Vector3(l.x * video.videoWidth, -l.y * video.videoHeight, -l.z * video.videoWidth);

  const update = (now: number) => {
    if (video.readyState < 2 || video.currentTime === lastTime) return tracked;
    lastTime = video.currentTime;
    const res = landmarker.detectForVideo(video, now);
    const lm = res.landmarks[0];
    if (!lm) { if (--seen <= 0) { tracked = false; rig.visible = false; } return tracked; }
    seen = 8;
    const L = (i: number) => toPx(lm[i]);
    const wrist = L(0), idx = L(5), mid = L(9), ring0 = L(13), ring1 = L(14), pinky = L(17);
    const label = res.handedness[0]?.[0]?.categoryName ?? 'Right';
    const isRight = LABEL_IS_MIRRORED ? label === 'Left' : label === 'Right';

    const axis = ring1.clone().sub(ring0).normalize();                     // along the finger = band axis
    const palm = idx.clone().sub(wrist).cross(pinky.clone().sub(wrist)).normalize();
    const back = isRight ? palm.negate() : palm;                           // the stone sits on the back of the hand
    const up = back.sub(axis.clone().multiplyScalar(back.dot(axis))).normalize();
    const side = new THREE.Vector3().crossVectors(up, axis);
    const q = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(side, up, axis));
    const pos = ring0.clone().lerp(ring1, 0.38);
    const spacing = (mid.distanceTo(ring0) + ring0.distanceTo(pinky)) / 2;
    const scale = spacing / MCP_SPACING_MM;

    if (!tracked) { sPos.copy(pos); sQuat.copy(q); sScale = scale; tracked = true; }
    rig.visible = enabled;
    sPos.lerp(pos, 0.45);
    sQuat.slerp(q, 0.45);
    sScale += (scale - sScale) * 0.45;
    rig.position.copy(sPos);
    rig.quaternion.copy(sQuat);
    rig.scale.setScalar(sScale);
    return true;
  };

  const stop = () => {
    stream?.getTracks().forEach((t) => t.stop());
    video.remove();
    landmarker.close();
    finger.geometry.dispose();
  };

  return {
    video, scene, camera, update, setModel, stop,
    setEnabled: (on: boolean) => { enabled = on; rig.visible = on && tracked; },
    switchCamera: async () => { facing = facing === 'user' ? 'environment' : 'user'; await openCamera(); },
  };
}
