// The wedding scenery at 128×80: the fountain garden at golden hour, a flower arch, a red aisle,
// white chairs with the two cats in the front row, string lights that come on as the sun sets.
import { H, W, pixelHeart, rect } from '../theatre/stage';

export interface Garden {
  dusk: number;          // 0 = golden hour, 1 = twilight (lights glow)
  pillowAt: number | null; // x of Coffee carrying the ring pillow along the aisle, or null when seated
  doves: { x: number; y: number; vx: number; vy: number }[];
}
export const newGarden = (): Garden => ({ dusk: 0, pillowAt: null, doves: [] });

const mix = (a: string, b: string, k: number): string => {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * k)).join(',')})`;
};
const FLOWERS = ['#f3c4cd', '#ffffff', '#d4506d', '#fff6dc', '#f7a8b8'];

export function gardenBack(ctx: CanvasRenderingContext2D, t: number, g: Garden, cats: HTMLCanvasElement[][]): void {
  // Sky from gold to rose, then to violet as dusk falls.
  const sky = ctx.createLinearGradient(0, 0, 0, 46);
  sky.addColorStop(0, mix('#f6a77f', '#3b2d63', g.dusk)); sky.addColorStop(0.7, mix('#fbd3a6', '#c9708a', g.dusk)); sky.addColorStop(1, mix('#fde9c8', '#f2b48f', g.dusk));
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, 46);
  // The sun going down behind the hills.
  const sunY = 33 + g.dusk * 12;
  ctx.fillStyle = 'rgba(255, 236, 170, 0.35)'; ctx.beginPath(); ctx.arc(104, sunY, 9, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff1b8'; ctx.beginPath(); ctx.arc(104, sunY, 5, 0, Math.PI * 2); ctx.fill();
  if (g.dusk > 0.4) for (const [x, y] of [[12, 6], [30, 12], [52, 4], [76, 9], [118, 5], [94, 14]]) if (Math.sin(t / 500 + x) > 0) rect(ctx, x, y, 1, 1, `rgba(255,246,220,${(g.dusk - 0.4) * 1.6})`);
  // Hills and the lawn.
  ctx.fillStyle = mix('#8fb57f', '#4f6a5a', g.dusk);
  for (let x = 0; x < W; x++) ctx.fillRect(x, 40 + Math.round(Math.sin(x / 14) * 2 + Math.sin(x / 5) * 0.6), 1, 10);
  rect(ctx, 0, 46, W, H - 46, mix('#93c77c', '#5d8a5f', g.dusk));
  for (let y = 48; y < H; y += 4) rect(ctx, 0, y, W, 2, mix('#88bc72', '#567f58', g.dusk));
  // The fountain far off on the right, for the town.
  rect(ctx, 108, 44, 14, 3, '#d9d4cc'); rect(ctx, 113, 39, 4, 5, '#d9d4cc');
  if (Math.floor(t / 300) % 2) rect(ctx, 114, 36, 2, 3, '#bfe3f5'); else rect(ctx, 113, 37, 4, 2, '#bfe3f5');

  // White chairs, two rows, the cats in the front one.
  for (const [x, y] of [[8, 52], [20, 52], [32, 52], [4, 58], [16, 58], [28, 58]]) {
    rect(ctx, x, y, 8, 1, '#ffffff'); rect(ctx, x, y + 1, 1, 6, '#f2ece2'); rect(ctx, x + 7, y + 1, 1, 6, '#f2ece2');
    rect(ctx, x, y + 4, 8, 1, '#ffffff'); rect(ctx, x + 1, y - 4, 6, 1, '#ffffff'); rect(ctx, x + 1, y - 4, 1, 4, '#f2ece2'); rect(ctx, x + 6, y - 4, 1, 4, '#f2ece2');
    rect(ctx, x + 2, y - 2, 4, 2, '#f3c4cd');
  }
  ctx.drawImage(cats[1][Math.floor(t / 650) % 2], 14, 46);
  if (g.pillowAt === null) ctx.drawImage(cats[0][Math.floor(t / 700) % 2], 26, 46);

  // The aisle: a red runner with a gold edge, rose petals along it.
  rect(ctx, 0, 64, 92, 7, '#c9354f'); rect(ctx, 0, 64, 92, 1, '#e6b85c'); rect(ctx, 0, 70, 92, 1, '#e6b85c');
  for (let x = 4; x < 90; x += 9) rect(ctx, x, 67 + (x % 2), 2, 1, '#f3c4cd');

  // The arch: two posts and a curve, all flowers.
  for (const x of [50, 78]) { rect(ctx, x - 1, 28, 3, 40, '#f6f0e4'); }
  for (let a = 0; a <= 40; a++) {
    const ang = Math.PI - (a / 40) * Math.PI, x = 64 + Math.cos(ang) * 14, y = 29 - Math.sin(ang) * 13;
    rect(ctx, Math.round(x) - 1, Math.round(y) - 1, 3, 3, '#f6f0e4');
  }
  for (let i = 0; i < 46; i++) {
    const ang = Math.PI - (i / 45) * Math.PI, x = 64 + Math.cos(ang) * 14 + ((i * 7) % 3) - 1, y = 29 - Math.sin(ang) * 13 + ((i * 5) % 3) - 1;
    rect(ctx, Math.round(x), Math.round(y), 2, 2, i % 3 === 0 ? '#6e9f5c' : FLOWERS[i % FLOWERS.length]);
  }
  for (let y = 30; y < 66; y += 3) for (const x of [48, 79]) rect(ctx, x + (y % 2), y, 2, 2, (y / 3) % 2 ? '#6e9f5c' : FLOWERS[(y / 3) % FLOWERS.length | 0]);
}

/** In front: string lights across the top (they glow at dusk), Coffee with the ring pillow, doves. */
export function gardenFront(ctx: CanvasRenderingContext2D, t: number, g: Garden, cats: HTMLCanvasElement[][]): void {
  if (g.pillowAt !== null) {
    const x = Math.round(g.pillowAt);
    ctx.drawImage(cats[0][Math.floor(t / 200) % 2], x - 6, 54);
    rect(ctx, x - 3, 52, 7, 3, '#d4304f'); rect(ctx, x - 2, 51, 5, 1, '#e0516b');
    rect(ctx, x - 1, 49, 1, 2, '#f3c94e'); rect(ctx, x + 1, 49, 1, 2, '#e6e6f0');
    if (Math.floor(t / 250) % 2) rect(ctx, x, 48, 1, 1, '#ffffff');
  }
  for (const d of g.doves) {
    const flap = Math.floor(t / 120 + d.x) % 2;
    rect(ctx, Math.round(d.x), Math.round(d.y), 3, 1, '#ffffff');
    rect(ctx, Math.round(d.x) + (flap ? 0 : 1), Math.round(d.y) - 1 - flap, 1, 1, '#ffffff');
    rect(ctx, Math.round(d.x) + 3, Math.round(d.y), 1, 1, '#f3c94e');
  }
}

/** Lights above the dark: the bulbs on the string. */
export function gardenLit(ctx: CanvasRenderingContext2D, t: number, g: Garden): void {
  for (let i = 0; i < 18; i++) {
    const x = 3 + i * 7, y = 3 + Math.round(Math.sin((i / 17) * Math.PI) * 5);
    rect(ctx, x, y - 1, 1, 1, '#5a4a3a');
    const on = 0.35 + g.dusk * 0.65 * (0.85 + Math.sin(t / 300 + i) * 0.15);
    ctx.fillStyle = `rgba(255, 220, 140, ${on})`; ctx.fillRect(x, y, 1, 2);
    if (g.dusk > 0.3) { ctx.fillStyle = `rgba(255, 220, 140, ${g.dusk * 0.18})`; ctx.fillRect(x - 1, y - 1, 3, 4); }
  }
}

/** A big heart rising between the two of them. */
export function bigHeart(ctx: CanvasRenderingContext2D, x: number, y: number, k: number): void {
  if (k <= 0) return;
  ctx.globalAlpha = Math.min(1, k * 2);
  pixelHeart(ctx, x - 3, y, '#e0516b', 2);
  ctx.globalAlpha = 1;
}
