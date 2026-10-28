// Sounds for the cutscenes, synthesised (no files): a music box for "Happy Birthday" (the melody is
// in the public domain), church bells, an oven timer, an egg, a whisk, a match, a breath. All of it
// respects the town's sound switch.
import { soundOn } from '../world/sound';

let ac: AudioContext | undefined;
let master: GainNode | undefined;
let noise: AudioBuffer | undefined;

/** The shared context; call from a tap first so the browser lets it play. */
export function audio(): AudioContext | undefined {
  if (ac) { if (ac.state === 'suspended') void ac.resume(); return ac; }
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return undefined;
    ac = new Ctx();
    master = ac.createGain(); master.gain.value = 0.9; master.connect(ac.destination);
    noise = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return ac;
  } catch { return undefined; }
}
/** Silence everything that is still ringing (leaving the page). */
export function hush(): void {
  if (!ac || !master) return;
  const old = master;
  old.gain.setTargetAtTime(0, ac.currentTime, 0.15);
  master = ac.createGain(); master.gain.value = 0.9; master.connect(ac.destination);
  setTimeout(() => old.disconnect(), 800);
}

function out(): AudioNode | undefined { return soundOn() ? (audio(), master) : undefined; }

/** A music-box note: a sine with a bell-like octave partial and a long decay. */
function boxNote(freq: number, at: number, dur: number, gain = 0.16): void {
  const dest = out(); if (!dest || !ac) return;
  const t = ac.currentTime + at;
  for (const [mult, g] of [[1, gain], [2, gain * 0.35], [3, gain * 0.08]] as const) {
    const o = ac.createOscillator(), v = ac.createGain();
    o.type = 'sine'; o.frequency.value = freq * mult;
    v.gain.setValueAtTime(0, t); v.gain.linearRampToValueAtTime(g, t + 0.008); v.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(0.5, dur * 1.6));
    o.connect(v).connect(dest); o.start(t); o.stop(t + Math.max(0.5, dur * 1.6) + 0.05);
  }
}

function burst(at: number, dur: number, gain: number, f: number, q = 1, type: BiquadFilterType = 'bandpass'): void {
  const dest = out(); if (!dest || !ac || !noise) return;
  const t = ac.currentTime + at;
  const src = ac.createBufferSource(), flt = ac.createBiquadFilter(), v = ac.createGain();
  src.buffer = noise; flt.type = type; flt.frequency.value = f; flt.Q.value = q;
  v.gain.setValueAtTime(gain, t); v.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(flt).connect(v).connect(dest); src.start(t, Math.random() * 0.5); src.stop(t + dur + 0.02);
}

const N: Record<string, number> = { G4: 392, A4: 440, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99 };
// "Happy Birthday to You", in C: four phrases, (note, beats) in 3/4.
export const BIRTHDAY_SONG: [string, number][][] = [
  [['G4', 0.75], ['G4', 0.25], ['A4', 1], ['G4', 1], ['C5', 1], ['B4', 2]],
  [['G4', 0.75], ['G4', 0.25], ['A4', 1], ['G4', 1], ['D5', 1], ['C5', 2]],
  [['G4', 0.75], ['G4', 0.25], ['G5', 1], ['E5', 1], ['C5', 1], ['B4', 1], ['A4', 2]],
  [['F5', 0.75], ['F5', 0.25], ['E5', 1], ['C5', 1], ['D5', 1], ['C5', 3]],
];
export const BEAT = 0.52;
/** Seconds each phrase of the song lasts (for the lyrics). */
export const phraseSeconds = (i: number): number => BIRTHDAY_SONG[i].reduce((s, [, b]) => s + b, 0) * BEAT;

/** Play one phrase of the song now, with a soft fifth under the long notes. */
export function playPhrase(i: number): void {
  let at = 0;
  for (const [n, b] of BIRTHDAY_SONG[i]) {
    boxNote(N[n], at, b * BEAT);
    if (b >= 2) boxNote(N[n] / 2, at, b * BEAT, 0.07);
    at += b * BEAT;
  }
}

/** Wedding bells: a falling peal of four bells, rung `times` times. */
export function bells(times = 2): void {
  const peal = [783.99, 659.25, 587.33, 523.25];
  for (let r = 0; r < times; r++) peal.forEach((f, i) => {
    const at = r * 1.4 + i * 0.32;
    boxNote(f, at, 1.6, 0.14); boxNote(f * 2.76, at, 0.6, 0.03);
  });
}
/** The oven: ding! */
export const ding = (): void => { boxNote(1318.5, 0, 1.2, 0.2); boxNote(1318.5, 0.25, 1.2, 0.12); };
/** An egg cracking on the bowl. */
export const crack = (): void => { burst(0, 0.05, 0.5, 2400, 3); burst(0.06, 0.08, 0.25, 1500, 2); };
/** One turn of the whisk. */
export const whisk = (): void => burst(0, 0.12, 0.18, 3200 + Math.random() * 800, 4);
/** A match struck and catching. */
export const strike = (): void => { burst(0, 0.18, 0.35, 3000, 1, 'highpass'); burst(0.12, 0.4, 0.08, 600, 1, 'lowpass'); };
/** A breath: a candle going out. */
export const puff = (): void => burst(0, 0.35, 0.22, 800, 0.7, 'lowpass');
/** A party popper. */
export const pop = (): void => { burst(0, 0.08, 0.6, 1800, 1); boxNote(1046.5, 0.05, 0.4, 0.06); };
/** A firework: thump and crackle. */
export function boom(): void { burst(0, 0.5, 0.4, 160, 0.8, 'lowpass'); for (let i = 0; i < 6; i++) burst(0.25 + i * 0.07, 0.05, 0.12, 4000, 2); }
/** A sparkle (a wish, a ring). */
export const twinkle = (): void => { [1567.98, 2093, 2637].forEach((f, i) => boxNote(f, i * 0.09, 0.5, 0.05)); };
