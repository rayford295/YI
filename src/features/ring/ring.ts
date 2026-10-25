// The ring, in 3D. Loads the GLB exported from ring/meridian.py and lets you turn it.
import './ring.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { t } from '../../core/i18n';
import { reducedMotion } from '../../core/html';

const MODEL = `${import.meta.env.BASE_URL}media/ring/meridian.glb`;
// Camera poses in model units (mm). Blender's Z-up becomes glTF Y-up, so the stone is at +Y
// and the band's axis is Z.
const VIEWS = {
  outside: { pos: new THREE.Vector3(26, 20, 40), target: new THREE.Vector3(0, 2, 0) },
  inside: { pos: new THREE.Vector3(-4, 4, 26), target: new THREE.Vector3(0, -7.5, 0) },
} as const;

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
        <p class="ring-loading" id="ring-loading">${t('ring.loading')}</p>
        <div class="ring-views" role="group">
          <button type="button" class="active" data-view="outside">${t('ring.view.outside')}</button>
          <button type="button" data-view="inside">${t('ring.view.inside')}</button>
        </div>
        <p class="ring-hint">${t('ring.hint')}</p>
      </div>
      <ul class="ring-facts">
        <li>${t('ring.fact.compass')}</li>
        <li>${t('ring.fact.met')}</li>
        <li>${t('ring.fact.coords')}</li>
        <li>${t('ring.fact.sapphire')}</li>
      </ul>
    </section>`;

  const stage = root.querySelector<HTMLElement>('#ring-stage')!;
  const canvas = root.querySelector<HTMLCanvasElement>('#ring-canvas')!;
  const loading = root.querySelector<HTMLElement>('#ring-loading')!;

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
  new GLTFLoader().load(MODEL, (gltf) => {
    if (disposed) return;
    gltf.scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      const m = mesh.material as THREE.MeshPhysicalMaterial | undefined;
      if (m?.transmission) { m.thickness = 2.5; m.envMapIntensity = 1.6; }
    });
    scene.add(gltf.scene);
    loading.remove();
  }, undefined, () => { loading.textContent = '…'; });

  const fit = () => {
    const w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(fit);
  ro.observe(stage);
  fit();

  // Smoothly fly the camera between the two saved views.
  let flight: { from: THREE.Vector3; to: THREE.Vector3; tFrom: THREE.Vector3; tTo: THREE.Vector3; start: number } | null = null;
  root.querySelectorAll<HTMLButtonElement>('.ring-views button').forEach((b) => b.addEventListener('click', () => {
    const v = VIEWS[b.dataset.view as keyof typeof VIEWS];
    root.querySelectorAll('.ring-views button').forEach((x) => x.classList.toggle('active', x === b));
    flight = { from: camera.position.clone(), to: v.pos.clone(), tFrom: controls.target.clone(), tTo: v.target.clone(), start: performance.now() };
    controls.autoRotate = false;
  }));
  canvas.addEventListener('pointerdown', () => { controls.autoRotate = false; });

  let raf = 0;
  const ease = (x: number) => 1 - Math.pow(1 - x, 3);
  const tick = (now: number) => {
    if (flight) {
      const k = ease(Math.min(1, (now - flight.start) / 900));
      camera.position.lerpVectors(flight.from, flight.to, k);
      controls.target.lerpVectors(flight.tFrom, flight.tTo, k);
      if (k === 1) flight = null;
    }
    controls.update();
    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  return () => {
    disposed = true;
    cancelAnimationFrame(raf);
    ro.disconnect();
    controls.dispose();
    pmrem.dispose();
    renderer.dispose();
  };
}
