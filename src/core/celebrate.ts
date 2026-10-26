// Small ceremonies for a cleared level: confetti, a short chime (synthesised, no asset) and,
// when the owner has recorded one, a voice line at public/media/voice/<level>.m4a.
import { prefersReducedMotion } from './motion';

const COLOURS = ['#d3a557', '#f3d58a', '#fff6dc', '#d4506d', '#f3c4cd', '#dfe9f5'];

/** Burst of confetti on a canvas that covers `host`; removes itself when the pieces have fallen. */
export function confetti(host: HTMLElement, count = 140): void {
  if (prefersReducedMotion()) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'confetti';
  host.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) { canvas.remove(); return; }
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const W = host.clientWidth, H = host.clientHeight;
  canvas.width = W * dpr; canvas.height = H * dpr; ctx.scale(dpr, dpr);
  const pieces = Array.from({ length: count }, () => ({
    x: W / 2 + (Math.random() - 0.5) * W * 0.3, y: H * 0.4,
    vx: (Math.random() - 0.5) * 9, vy: -Math.random() * 11 - 4,
    w: 5 + Math.random() * 6, h: 8 + Math.random() * 8,
    rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3,
    c: COLOURS[Math.floor(Math.random() * COLOURS.length)],
  }));
  const t0 = performance.now();
  const tick = (now: number) => {
    const dt = Math.min(0.04, 1 / 60);
    ctx.clearRect(0, 0, W, H);
    let alive = 0;
    for (const p of pieces) {
      p.vy += 18 * dt; p.vx *= 0.995; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      if (p.y < H + 20) alive++;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.c;
      ctx.globalAlpha = Math.max(0, 1 - (now - t0) / 3200);
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
    }
    if (alive && now - t0 < 3400) requestAnimationFrame(tick); else canvas.remove();
  };
  requestAnimationFrame(tick);
}

/** Three rising notes, ~0.9 s. Silent when the browser refuses an AudioContext without a gesture. */
export function chime(): void {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ac = new Ctx();
    const t = ac.currentTime;
    [[523.25, 0], [659.25, 0.18], [783.99, 0.36], [1046.5, 0.54]].forEach(([f, at]) => {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0, t + at); g.gain.linearRampToValueAtTime(0.18, t + at + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + at + 0.5);
      o.connect(g).connect(ac.destination); o.start(t + at); o.stop(t + at + 0.55);
    });
    setTimeout(() => { void ac.close(); }, 1500);
  } catch { /* no audio: fine */ }
}

/** Where the voice line for a level lives; the file is optional. */
export const voiceUrl = (levelId: string): string => `${import.meta.env.BASE_URL}media/voice/${levelId}.m4a`;
