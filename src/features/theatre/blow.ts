// Blowing out the candles with your breath: the microphone's loudness, smoothed. A breath on a
// phone mic is a loud, noisy rush, so plain RMS over a threshold is enough. Nothing is recorded or
// sent; the stream is stopped as soon as the candles are out.
import { audio } from './music';

export interface Breath { level(): number; stop(): void }

/** Ask for the mic; resolves with a live loudness reader (0..1), or rejects when there is none. */
export async function listenForBreath(): Promise<Breath> {
  if (!navigator.mediaDevices?.getUserMedia) throw new Error('unsupported');
  const ac = audio();
  if (!ac) throw new Error('no-audio');
  const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
  const src = ac.createMediaStreamSource(stream);
  const an = ac.createAnalyser();
  an.fftSize = 1024;
  src.connect(an);
  const buf = new Float32Array(an.fftSize);
  let smooth = 0;
  return {
    level() {
      an.getFloatTimeDomainData(buf);
      let sum = 0;
      for (const v of buf) sum += v * v;
      const rms = Math.sqrt(sum / buf.length);
      smooth = smooth * 0.6 + Math.min(1, rms * 5) * 0.4;
      return smooth;
    },
    stop() { src.disconnect(); stream.getTracks().forEach((t) => t.stop()); },
  };
}

/** Above this the candles bend; held for a moment, they go out. */
export const BLOW = 0.32;
