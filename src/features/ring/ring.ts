// The ring, in 3D. Loads the GLB exported from ring/meridian.py and lets you turn it.
import './ring.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { t } from '../../core/i18n';
import { reducedMotion } from '../../core/html';
import { startTryOn, type TryOnHandles } from './tryon';

const MODELS = { hers: 'meridian_hers.glb', his: 'meridian_his.glb' } as const;
type Which = keyof typeof MODELS;
const modelUrl = (w: Which) => `${import.meta.env.BASE_URL}media/ring/${MODELS[w]}`;
// Camera poses in model units (mm), tuned for her ring (outer radius 9.95) and scaled to the
// loaded model's size. Blender's Z-up becomes glTF Y-up: the stone is at +Y, the band's axis is Z.
const BASE_R = 9.95;
const VIEWS = {
  outside: { pos: new THREE.Vector3(26, 20, 40), target: new THREE.Vector3(0, 2, 0) },
  inside: { pos: new THREE.Vector3(-4, 4, 26), target: new THREE.Vector3(0, -7.5, 0) },
} as const;
type View = keyof typeof VIEWS;

export function renderRing(root: HTMLElement): () => void {
  root.innerHTML = `
    <section class="ring">
      <header class="ring-head">
        <p class="eyebrow">${t('ring.eyebrow')}</p>
        <h1>${t('ring.title')}</h1>
        <p class="ring-sub">${t('ring.subtitle')}</p>
      </header>
      <div class="ring-stage card" id="ring-stage">
        <canvas id="ring-canvas" aria-label="${t('ring.title')}"></canvas>
        <div class="ring-which" role="group">
          <button type="button" class="active" data-which="hers">${t('ring.hers')}</button>
          <button type="button" data-which="his">${t('ring.his')}</button>
        </div>
        <div class="ring-tryon-bar">
          <button type="button" id="ring-tryon">${t('ring.tryon')}</button>
          <button type="button" id="ring-flip" hidden>${t('ring.tryon.flip')}</button>
        </div>
        <p class="ring-status" id="ring-status" hidden></p>
        <p class="ring-loading" id="ring-loading">${t('ring.loading')}</p>
        <div class="ring-views" role="group">
          <button type="button" class="active" data-view="outside">${t('ring.view.outside')}</button>
          <button type="button" data-view="inside">${t('ring.view.inside')}</button>
        </div>
        <p class="ring-hint">${t('ring.hint')}</p>
      </div>
      <ul class="ring-facts">
        <li>${t('ring.fact.compass')}</li>
        <li>${t('ring.fact.names')}</li>
        <li>${t('ring.fact.met')}</li>
        <li>${t('ring.fact.coords')}</li>
        <li>${t('ring.fact.sapphire')}</li>
      </ul>
    </section>`;

  const stage = root.querySelector<HTMLElement>('#ring-stage')!;
  const canvas = root.querySelector<HTMLCanvasElement>('#ring-canvas')!;
  const loading = root.querySelector<HTMLElement>('#ring-loading')!;
  const status = root.querySelector<HTMLElement>('#ring-status')!;
  const hint = root.querySelector<HTMLElement>('.ring-hint')!;
  const tryBtn = root.querySelector<HTMLButtonElement>('#ring-tryon')!;
  const flipBtn = root.querySelector<HTMLButtonElement>('#ring-flip')!;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(32, 1, 0.5, 500);
  camera.position.copy(VIEWS.outside.pos);

  const controls = new OrbitControls(camera, canvas);
  controls.target.copy(VIEWS.outside.target);
  controls.enableDamping = true;
  controls.minDistance = 14;
  controls.maxDistance = 90;
  controls.enablePan = false;
  controls.autoRotate = !reducedMotion();
  controls.autoRotateSpeed = 1.2;

  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(30, 50, 40);
  const rim = new THREE.DirectionalLight(0xfff1dc, 1.2);
  rim.position.set(-40, 20, -30);
  scene.add(key, rim, new THREE.AmbientLight(0xffffff, 0.25));

  let disposed = false;
  let current: THREE.Group | null = null;
  let scale = 1;                    // model outer radius / BASE_R
  let view: View = 'outside';
  let tryon: TryOnHandles | null = null;
  let tryBusy = false;
  const loader = new GLTFLoader();
  const pose = (v: View) => ({ pos: VIEWS[v].pos.clone().multiplyScalar(scale), target: VIEWS[v].target.clone().multiplyScalar(scale) });

  const load = (which: Which) => {
    loading.style.display = '';
    loader.load(modelUrl(which), (gltf) => {
      if (disposed) return;
      if (current) scene.remove(current);
      gltf.scene.traverse((o) => {
        const m = (o as THREE.Mesh).material as THREE.MeshPhysicalMaterial | undefined;
        if (m?.transmission) { m.thickness = 2.5; m.envMapIntensity = 1.6; }
      });
      const box = new THREE.Box3().setFromObject(gltf.scene);
      scale = (box.max.x - box.min.x) / 2 / BASE_R;
      current = gltf.scene;
      if (tryon) tryon.setModel(current, scale * BASE_R);
      else { scene.add(current); flyTo(view); }
      loading.style.display = 'none';
    }, undefined, () => { loading.textContent = '…'; });
  };

  const fit = () => {
    const w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(fit);
  ro.observe(stage);
  fit();

  // Smoothly fly the camera between the saved views.
  let flight: { from: THREE.Vector3; to: THREE.Vector3; tFrom: THREE.Vector3; tTo: THREE.Vector3; start: number } | null = null;
  const flyTo = (v: View) => {
    const p = pose(v);
    flight = { from: camera.position.clone(), to: p.pos, tFrom: controls.target.clone(), tTo: p.target, start: performance.now() };
  };
  const setActive = (group: string, btn: Element) =>
    root.querySelectorAll(`${group} button`).forEach((x) => x.classList.toggle('active', x === btn));
  root.querySelectorAll<HTMLButtonElement>('.ring-views button').forEach((b) => b.addEventListener('click', () => {
    view = b.dataset.view as View;
    setActive('.ring-views', b);
    flyTo(view);
    controls.autoRotate = false;
  }));
  root.querySelectorAll<HTMLButtonElement>('.ring-which button').forEach((b) => b.addEventListener('click', () => {
    setActive('.ring-which', b);
    load(b.dataset.which as Which);
  }));
  canvas.addEventListener('pointerdown', () => { controls.autoRotate = false; });
  load('hers');

  // Try-on: swap the orbit scene for the webcam scene and back.
  const say = (msg: string) => { status.textContent = msg; status.hidden = !msg; };
  const stopTryOn = () => {
    if (!tryon) return;
    tryon.setModel(null, 0);
    tryon.stop();
    tryon = null;
    stage.classList.remove('tryon', 'mirror');
    flipBtn.hidden = true;
    tryBtn.textContent = t('ring.tryon');
    hint.textContent = t('ring.hint');
    say('');
    if (current) { scene.add(current); current.position.set(0, 0, 0); current.quaternion.identity(); current.scale.setScalar(1); }
    fit();
    flyTo(view);
  };
  const beginTryOn = async () => {
    if (tryBusy) return;
    tryBusy = true;
    say(t('ring.tryon.starting'));
    try {
      const h = await startTryOn(stage, scene.environment as THREE.Texture);
      if (disposed) { h.stop(); return; }
      tryon = h;
      stage.classList.add('tryon', 'mirror');
      flipBtn.hidden = false;
      tryBtn.textContent = t('ring.tryon.exit');
      hint.textContent = t('ring.tryon.privacy');
      if (current) { scene.remove(current); h.setModel(current, scale * BASE_R); }
      say(t('ring.tryon.hint'));
    } catch (e) {
      console.warn('try-on failed', e);
      say(t('ring.tryon.denied'));
      setTimeout(() => { if (!tryon) say(''); }, 4000);
    } finally { tryBusy = false; }
  };
  tryBtn.addEventListener('click', () => (tryon ? stopTryOn() : beginTryOn()));
  flipBtn.addEventListener('click', async () => {
    if (!tryon) return;
    await tryon.switchCamera();
    stage.classList.toggle('mirror');
  });

  let raf = 0;
  const ease = (x: number) => 1 - Math.pow(1 - x, 3);
  const tick = (now: number) => {
    if (flight) {
      const k = ease(Math.min(1, (now - flight.start) / 900));
      camera.position.lerpVectors(flight.from, flight.to, k);
      controls.target.lerpVectors(flight.tFrom, flight.tTo, k);
      if (k === 1) flight = null;
    }
    if (tryon) {
      const v = tryon.video;
      if (v.videoWidth && (canvas.width !== v.videoWidth || canvas.height !== v.videoHeight)) renderer.setSize(v.videoWidth, v.videoHeight, false);
      const seen = tryon.update(now);
      say(seen ? '' : t('ring.tryon.hint'));
      renderer.render(tryon.scene, tryon.camera);
    } else {
      controls.update();
      renderer.render(scene, camera);
    }
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  return () => {
    disposed = true;
    cancelAnimationFrame(raf);
    tryon?.stop();
    ro.disconnect();
    controls.dispose();
    pmrem.dispose();
    renderer.dispose();
  };
}
