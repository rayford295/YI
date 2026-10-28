// The birthday scenery, painted in code at 128×80: 小日's kitchen (wide shot) and the cake up close.
import { H, W, pixelHeart, rect } from '../theatre/stage';

export const CANDLES = 9;   // nine candles: nine levels, and 九 sounds like 久, "for a long time"

export interface Kitchen {
  night: boolean;          // the window after midnight
  ovenGlow: number;        // 0..1
  ovenCake: number;        // 0..1, the cake rising behind the oven glass
  bowl: boolean;           // the mixing bowl on the table
  whisk: number;           // a phase that moves while whisking
  batter: number;          // 0..1, how full the bowl is
  tableCake: boolean;      // the finished cake on the table
  flames: boolean[];       // which candles burn
  bend: number;            // flames leaning in a breath, 0..1
  door: number;            // 0..1, the light from the door on the right
}
export const newKitchen = (): Kitchen => ({ night: false, ovenGlow: 0, ovenCake: 0, bowl: false, whisk: 0, batter: 0, tableCake: false, flames: Array(CANDLES).fill(false), bend: 0, door: 0 });

const BUNTING = ['#d4506d', '#f3c94e', '#7fb2d9', '#f3c4cd', '#9bd18b'];
const CANDLE_COLOURS = ['#f3c4cd', '#7fb2d9', '#f3c94e', '#9bd18b', '#e0b0ff'];

/** The back of the kitchen: wall, window, bunting, the two clocks, counter and oven. */
export function kitchenBack(ctx: CanvasRenderingContext2D, t: number, k: Kitchen): void {
  rect(ctx, 0, 0, W, 58, '#f7e4d4');
  for (let x = 3; x < W; x += 8) rect(ctx, x, 0, 1, 56, '#f1d6c3');
  rect(ctx, 0, 56, W, 2, '#d9b896');
  for (let y = 58; y < H; y += 6) for (let x = 0; x < W; x += 6) rect(ctx, x, y, 6, 6, ((x + y) / 6) % 2 ? '#e8c8a6' : '#dcb791');

  // Window: morning in College Station, or the stars after midnight.
  rect(ctx, 5, 7, 32, 24, '#8a5a32');
  const sky = ctx.createLinearGradient(0, 9, 0, 29);
  if (k.night) { sky.addColorStop(0, '#120f2e'); sky.addColorStop(1, '#2c2350'); } else { sky.addColorStop(0, '#8fcaf0'); sky.addColorStop(1, '#dff3ff'); }
  ctx.fillStyle = sky; ctx.fillRect(7, 9, 28, 20);
  if (k.night) {
    for (const [x, y] of [[10, 12], [17, 18], [25, 11], [31, 20], [13, 24], [29, 15]]) if (Math.sin(t / 400 + x) > -0.3) rect(ctx, x, y, 1, 1, '#fff6dc');
    rect(ctx, 26, 13, 3, 3, '#fff6dc'); rect(ctx, 27, 13, 2, 2, '#2c2350');
  } else {
    const cx = 8 + ((t / 260) % 34);
    rect(ctx, cx, 13, 6, 2, '#ffffff'); rect(ctx, cx + 1, 12, 3, 1, '#ffffff');
    rect(ctx, 28, 11, 3, 3, '#ffe27a');
  }
  rect(ctx, 20, 9, 1, 20, '#8a5a32'); rect(ctx, 7, 18, 28, 1, '#8a5a32');
  rect(ctx, 3, 5, 4, 28, '#f3a6b8'); rect(ctx, 35, 5, 4, 28, '#f3a6b8');
  rect(ctx, 3, 5, 36, 2, '#c95a78');

  // Bunting across the wall.
  for (let i = 0; i < 12; i++) {
    const x = 42 + i * 7, sag = Math.round(Math.sin((i / 11) * Math.PI) * 3);
    ctx.fillStyle = BUNTING[i % BUNTING.length];
    for (let r = 0; r < 3; r++) ctx.fillRect(x + r, 4 + sag + r, 5 - r * 2, 1);
  }
  rect(ctx, 42, 3, 84, 1, '#b08a5a');

  // Two clocks: College Station and Shenzhen (the digits are HTML over these panels).
  for (const x of [46, 72]) { rect(ctx, x - 1, 11, 24, 13, '#5a4a3a'); rect(ctx, x, 12, 22, 11, '#1d1b26'); }

  // Counter under the window: flour, eggs, strawberries.
  rect(ctx, 0, 36, 44, 3, '#c49a6c'); rect(ctx, 0, 39, 44, 17, '#efdcc4');
  for (const x of [2, 16, 30]) { rect(ctx, x, 41, 12, 13, '#e6cfb2'); rect(ctx, x + 10, 47, 1, 2, '#8a5a32'); }
  rect(ctx, 5, 27, 8, 9, '#f4efe4'); rect(ctx, 6, 30, 6, 3, '#7fb2d9');
  rect(ctx, 17, 33, 11, 3, '#c9a77a'); for (let i = 0; i < 4; i++) rect(ctx, 18 + Math.round(i * 2.6), 32, 2, 2, '#fffaf0');
  rect(ctx, 31, 33, 9, 3, '#ffffff'); for (const [x, y] of [[32, 31], [34, 32], [36, 31], [38, 32], [35, 30]]) rect(ctx, x, y, 2, 2, '#d4304f');

  // Oven, with a glowing window while it bakes.
  rect(ctx, 98, 26, 26, 30, '#d9d4cc'); rect(ctx, 98, 26, 26, 5, '#bdb6ab');
  for (const x of [102, 108, 114]) rect(ctx, x, 27, 3, 3, '#6f675d');
  rect(ctx, 119, 27, 3, 3, k.ovenGlow > 0 ? '#ff7a3c' : '#6f675d');
  rect(ctx, 101, 33, 20, 1, '#8f877b');
  const g = k.ovenGlow;
  rect(ctx, 102, 36, 18, 14, g > 0 ? `rgb(${42 + 213 * g}, ${32 + 122 * g}, ${32 + 28 * g})` : '#2a2020');
  if (k.ovenCake > 0) {
    rect(ctx, 104, 47, 14, 2, '#5a5550');
    const h = Math.round(1 + 6 * k.ovenCake);
    rect(ctx, 105, 47 - h, 12, h, '#e8b765'); rect(ctx, 106, 46 - h, 10, 1, '#d79f4c');
  }
  rect(ctx, 98, 54, 26, 2, '#a8a196');

  // The door on the right lets light in when it opens.
  if (k.door > 0) {
    const grad = ctx.createLinearGradient(W, 0, W - 26, 0);
    grad.addColorStop(0, `rgba(255, 236, 190, ${0.85 * k.door})`); grad.addColorStop(1, 'rgba(255, 236, 190, 0)');
    ctx.fillStyle = grad; ctx.fillRect(W - 26, 0, 26, H);
  }
}

/** The table in front: a pink cloth, and whatever stands on it. */
export function kitchenFront(ctx: CanvasRenderingContext2D, t: number, k: Kitchen): void {
  rect(ctx, 38, 58, 52, 3, '#fbe3ea');
  rect(ctx, 38, 61, 52, 9, '#f6cfda');
  for (let x = 40; x < 90; x += 4) { rect(ctx, x, 64, 1, 1, '#ffffff'); rect(ctx, x + 2, 67, 1, 1, '#ffffff'); }
  for (let x = 38; x < 90; x += 3) rect(ctx, x, 70, 2, 1, '#f3b3c3');
  rect(ctx, 42, 71, 2, 6, '#8a5a32'); rect(ctx, 84, 71, 2, 6, '#8a5a32');
  if (k.bowl) {
    rect(ctx, 57, 53, 14, 1, '#5d93bd');
    rect(ctx, 57, 54, 14, 3, '#7fb2d9'); rect(ctx, 58, 57, 12, 1, '#7fb2d9'); rect(ctx, 60, 58, 8, 1, '#5d93bd');
    if (k.batter > 0) rect(ctx, 58, 53, 12, 1, '#f6dc9c');
    if (k.whisk) {
      const x = 64 + Math.round(Math.sin(k.whisk) * 3);
      rect(ctx, x, 46, 1, 7, '#b7b2aa'); rect(ctx, x - 1, 51, 3, 2, '#d8d4cc');
    }
  }
  if (k.tableCake) smallCake(ctx, t, k);
}

function smallCake(ctx: CanvasRenderingContext2D, t: number, k: Kitchen): void {
  rect(ctx, 52, 57, 24, 1, '#ffffff'); rect(ctx, 54, 58, 20, 1, '#e8e2da');
  rect(ctx, 55, 50, 18, 7, '#f6dcae'); rect(ctx, 55, 53, 18, 1, '#fffaf2'); rect(ctx, 55, 54, 18, 1, '#e0516b');
  rect(ctx, 54, 48, 20, 2, '#fffaf2');
  for (const x of [56, 60, 65, 70]) rect(ctx, x, 50, 1, 1 + (x % 3), '#f7c6d0');
  for (const x of [57, 63, 69]) rect(ctx, x, 47, 2, 1, '#d4304f');
  for (let i = 0; i < CANDLES; i++) {
    const x = 55 + i * 2;
    rect(ctx, x, 44, 1, 4, CANDLE_COLOURS[i % CANDLE_COLOURS.length]);
    if (k.flames[i]) flame(ctx, t, x, 43, i, k.bend, 1);
  }
}

/** One flame: a yellow core over orange, flickering and leaning away from a breath. */
export function flame(ctx: CanvasRenderingContext2D, t: number, x: number, y: number, i: number, bend: number, size: 1 | 2): void {
  const lean = Math.round(bend * 2 * size), flick = Math.sin(t / 70 + i * 1.7) > 0.4 ? 1 : 0;
  if (size === 1) {
    rect(ctx, x + lean, y - flick, 1, 1 + flick, '#ffd36a');
    rect(ctx, x + lean, y - 1 - flick, 1, 1, '#fff6c2');
    return;
  }
  rect(ctx, x + lean, y - 3 - flick, 2, 1, '#ff9a3c');
  rect(ctx, x + lean, y - 2 - flick, 2, 2 + flick, '#ffd36a');
  rect(ctx, x + lean, y - 4 - flick, 1, 1, '#fff6c2');
}

// ---------------- the cake up close ----------------

export interface CakeUp {
  piped: number;          // 0..1, the cream dollops along the top, left to right
  berries: number;        // 0..10 strawberries placed
  plaque: boolean;        // the white chocolate plaque (its words are HTML)
  candles: number;        // candles standing (0..CANDLES)
  flames: boolean[];
  bend: number;
}
export const newCakeUp = (): CakeUp => ({ piped: 0, berries: 0, plaque: false, candles: 0, flames: Array(CANDLES).fill(false), bend: 0 });

// Ten strawberries in a heart on the front of the cake, like the ten gold stones on the Gomoku
// board. Placed in drawing order: down the left side to the tip, then up the right.
export const BERRIES: [number, number][] = [[0, -4], [-4, -7], [-7, -4], [-6, 0], [-3, 3], [0, 6], [3, 3], [6, 0], [7, -4], [4, -7]];
const HEART_AT = { x: 64, y: 47 };
export const candleX = (i: number): number => 35 + Math.round(i * (58 / (CANDLES - 1)));

export function cakeBack(ctx: CanvasRenderingContext2D, t: number, c: CakeUp): void {
  const wall = ctx.createLinearGradient(0, 0, 0, 60);
  wall.addColorStop(0, '#f6e2d4'); wall.addColorStop(1, '#efd2c0');
  ctx.fillStyle = wall; ctx.fillRect(0, 0, W, 60);
  for (let x = 6; x < W; x += 10) rect(ctx, x, 0, 1, 60, '#ecd0bd');
  rect(ctx, 0, 60, W, 20, '#f6cfda');
  for (let x = 2; x < W; x += 5) { rect(ctx, x, 66, 1, 1, '#ffffff'); rect(ctx, x + 2, 72, 1, 1, '#ffffff'); }
  // Plate.
  rect(ctx, 20, 62, 88, 3, '#fbf8f3'); rect(ctx, 24, 65, 80, 2, '#e6e0d8');
  // Sponge, cream and jam.
  rect(ctx, 30, 37, 68, 25, '#f6dcae');
  rect(ctx, 30, 48, 68, 2, '#fffaf2'); rect(ctx, 30, 50, 68, 1, '#e0516b');
  for (let x = 30; x < 98; x += 2) rect(ctx, x, 61, 1, 1, '#e9c48f');
  // Frosting on top, dripping down the front.
  rect(ctx, 29, 31, 70, 6, '#fffaf2'); rect(ctx, 30, 30, 68, 1, '#fffaf2');
  for (const [x, h] of [[32, 3], [37, 5], [43, 2], [50, 4], [58, 3], [66, 5], [73, 2], [80, 4], [88, 3], [94, 5]]) rect(ctx, x, 37, 2, h, '#f7c6d0');
  // Cream dollops piped along the top edge.
  const n = Math.floor(c.piped * 12);
  for (let i = 0; i < n; i++) { const x = 31 + Math.round(i * 5.8); rect(ctx, x, 28, 4, 2, '#ffffff'); rect(ctx, x + 1, 27, 2, 1, '#ffffff'); }
  // White chocolate plaque on two sticks (its words are HTML on top).
  if (c.plaque) {
    rect(ctx, 50, 18, 1, 12, '#c9a77a'); rect(ctx, 77, 18, 1, 12, '#c9a77a');
    rect(ctx, 41, 8, 46, 12, '#d9b38c'); rect(ctx, 42, 9, 44, 10, '#fff4e0');
  }
  // Candles.
  for (let i = 0; i < c.candles; i++) {
    const x = candleX(i);
    rect(ctx, x, 21, 2, 9, CANDLE_COLOURS[i % CANDLE_COLOURS.length]);
    for (let y = 22; y < 30; y += 3) rect(ctx, x, y, 2, 1, '#ffffff');
    rect(ctx, x, 20, 1, 1, '#3b2430');
  }
  // Strawberries.
  for (let i = 0; i < c.berries; i++) berry(ctx, HEART_AT.x + BERRIES[i][0] - 1, HEART_AT.y + BERRIES[i][1] - 1);
}
/** The flames, drawn above the dark. */
export function cakeLit(ctx: CanvasRenderingContext2D, t: number, c: CakeUp): void {
  for (let i = 0; i < c.candles; i++) if (c.flames[i]) flame(ctx, t, candleX(i), 19, i, c.bend, 2);
}
function berry(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  rect(ctx, x, y, 3, 2, '#d4304f'); rect(ctx, x + 1, y + 2, 1, 1, '#d4304f');
  rect(ctx, x, y - 1, 3, 1, '#5f8f4e'); rect(ctx, x + 1, y, 1, 1, '#f08a9c');
}

/** A heart floating between two people. */
export const heartAbove = (ctx: CanvasRenderingContext2D, x: number, y: number): void => pixelHeart(ctx, x - 3, y, '#e0516b', 2);
