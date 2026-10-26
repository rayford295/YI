// Small sounds for the town, synthesised on the spot (no audio files): a footstep, a thud against
// something solid, the talk box opening, a door. One AudioContext is made on the first sound, which
// always follows a key or a tap, so browsers allow it. A switch in the footer turns it all off.
import { safeStorage } from '../../core/storage';

const KEY = 'yi.sound';
const store = safeStorage();
export const soundOn = (): boolean => store.getItem(KEY) !== '0';
export const setSoundOn = (on: boolean): void => { store.setItem(KEY, on ? '1' : '0'); };

let ac: AudioContext | undefined;
let noise: AudioBuffer | undefined;
function context(): AudioContext | undefined {
  if (ac) { if (ac.state === 'suspended') void ac.resume(); return ac; }
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return undefined;
    ac = new Ctx();
    noise = ac.createBuffer(1, ac.sampleRate / 10, ac.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return ac;
  } catch { return undefined; }
}

function tone(freq: number, to: number, at: number, dur: number, gain: number, type: OscillatorType = 'sine'): void {
  const a = context(); if (!a) return;
  const t = a.currentTime + at;
  const o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t); o.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination); o.start(t); o.stop(t + dur + 0.02);
}

let foot = 0;
/** A soft footfall: a puff of filtered noise, alternating slightly between feet. */
export function stepSound(): void {
  if (!soundOn()) return;
  const a = context(); if (!a || !noise) return;
  const src = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
  src.buffer = noise;
  f.type = 'bandpass'; f.frequency.value = foot++ % 2 ? 900 : 700; f.Q.value = 1.2;
  const t = a.currentTime;
  g.gain.setValueAtTime(0.09, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
  src.connect(f).connect(g).connect(a.destination); src.start(t); src.stop(t + 0.08);
}
/** Walking into a wall, a tree or the water. */
export function bumpSound(): void { if (soundOn()) tone(110, 60, 0, 0.12, 0.12, 'triangle'); }
/** The talk box opening: one short blip. */
export function talkSound(): void { if (soundOn()) tone(880, 880, 0, 0.07, 0.07, 'square'); }
/** A door opening: two notes up. */
export function doorSound(): void { if (soundOn()) { tone(392, 392, 0, 0.1, 0.1, 'triangle'); tone(587, 587, 0.1, 0.16, 0.1, 'triangle'); } }
