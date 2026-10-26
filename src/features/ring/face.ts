// Who is in front of the camera? face-api (TensorFlow.js) runs on-device and compares the
// 128-number face descriptor against the two enrolled people in faces.json.
// Enrol with the dev-only #/enroll page; photos never leave the machine or enter the repo.
import * as faceapi from '@vladmandic/face-api';
import enrolled from './faces.json';

export type Person = 'yifan' | 'jingyi';
export type FaceResult = { face: false } | { face: true; person: Person | null; distance: number };

const BASE = `${import.meta.env.BASE_URL}face`;
// Euclidean distance between descriptors; same person is usually < 0.45, strangers > 0.6.
const MATCH_DISTANCE = 0.5;
const PEOPLE = enrolled as Record<Person, number[][]>;

// Pick a TensorFlow backend explicitly: WebGL where available, CPU otherwise (slower but works).
const pickBackend = async () => {
  // The bundled typings narrow `tf` to tensor helpers; the runtime object has the full API.
  const tf = faceapi.tf as unknown as { setBackend(name: string): Promise<boolean>; ready(): Promise<void> };
  for (const name of ['webgl', 'cpu']) {
    try { if (await tf.setBackend(name)) { await tf.ready(); return; } } catch { /* try the next one */ }
  }
};

let loading: Promise<void> | null = null;
export const loadFaceModels = (): Promise<void> =>
  (loading ??= pickBackend().then(() => Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(BASE),
    faceapi.nets.faceLandmark68TinyNet.loadFromUri(BASE),
    faceapi.nets.faceRecognitionNet.loadFromUri(BASE),
  ])).then(() => undefined));

export const hasEnrolled = (): boolean => Object.values(PEOPLE).some((list) => list.length > 0);

const detector = () => new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 });

/** Descriptor of the single largest face in an image, for enrolment. */
export async function describe(img: HTMLImageElement | HTMLCanvasElement): Promise<number[] | null> {
  await loadFaceModels();
  const det = await faceapi.detectSingleFace(img, detector()).withFaceLandmarks(true).withFaceDescriptor();
  return det ? Array.from(det.descriptor) : null;
}

export function match(descriptor: Float32Array | number[]): { person: Person | null; distance: number } {
  let best: { person: Person | null; distance: number } = { person: null, distance: Infinity };
  for (const person of Object.keys(PEOPLE) as Person[]) {
    for (const ref of PEOPLE[person]) {
      const d = faceapi.euclideanDistance(Array.from(descriptor), ref);
      if (d < best.distance) best = { person, distance: d };
    }
  }
  return best.distance <= MATCH_DISTANCE ? best : { person: null, distance: best.distance };
}

export async function identify(video: HTMLVideoElement): Promise<FaceResult> {
  await loadFaceModels();
  const det = await faceapi.detectSingleFace(video, detector()).withFaceLandmarks(true).withFaceDescriptor();
  if (!det) return { face: false };
  return { face: true, ...match(det.descriptor) };
}

export const ringFor = (p: Person): 'hers' | 'his' => (p === 'jingyi' ? 'hers' : 'his');
