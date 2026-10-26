// The front door: one question only the two of us can answer. The accepted answers are stored as
// SHA-256 hashes, so the bundle does not spell them out; a pass is remembered on the device.
// Owner: to change the question, edit the strings gate.question / gate.placeholder in i18n.ts and
// regenerate ANSWERS with `npm run gate -- "answer one" "answer two"`.
import { sha256Hex } from './sha256';
import { safeStorage } from './storage';

const KEY = 'yi.gate';
const store = safeStorage();

/** Digits only: "9.20", "0920", "9 月 20 日" and "20260920" all reduce to something listed below. */
export const normalise = (s: string): string => s.replace(/\D+/g, '');

// sha256 of: 920, 0920, 20260920, 260920
export const ANSWERS: readonly string[] = [
  '728bf33aab1d32d4dca8fcc6a020d8baeb6b9910104541aa68c2d408154734fc',
  '893e31ea586330e0d42f7700adce917622c9ae11d089d721e9729829a547ce2d',
  '48c2aea4aa532ace53a7d3cce44c843cccf31ff29f3d952a51634b551f3b293e',
  '30c95397b2349ac10d32203afb0abc79e95a8e20781236ff7902cb7a287676e2',
];

export async function hash(text: string): Promise<string> {
  const subtle = globalThis.crypto?.subtle;
  if (subtle) {
    try {
      const buf = await subtle.digest('SHA-256', new TextEncoder().encode(text));
      return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
    } catch { /* fall through */ }
  }
  return sha256Hex(text);
}

export const gatePassed = (): boolean => store.getItem(KEY) === '1';

/** True (and remembered) when `answer` is one of ours. */
export async function tryGate(answer: string, answers: readonly string[] = ANSWERS): Promise<boolean> {
  const n = normalise(answer);
  if (!n) return false;
  const h = await hash(n);
  if (!answers.includes(h)) return false;
  store.setItem(KEY, '1');
  return true;
}
