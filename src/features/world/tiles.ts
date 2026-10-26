// The ground and the houses, painted once onto an offscreen canvas at 16 px per tile.
// Everything is fillRect and small pixel grids: no image files.
import { BUILDINGS, HEIGHT, TOWN, WIDTH, type Building } from './town';
import { paint, type Palette } from './sprites';
import { levelNumber } from '../../core/quest';

export const TILE = 16;

const C = {
  grass: '#79b457', grassDark: '#6aa24b', grassLight: '#8cc46a',
  path: '#e3cfa4', pathDark: '#cdb686', pathEdge: '#b89d6c',
  water: '#4f9ad6', waterDark: '#3f84bd', waterLight: '#8ec6ee',
  trunk: '#6b4a2e', leaf: '#3f8a3d', leafDark: '#2f6c2e', leafLight: '#5aa84f',
  wall: '#f4e9d6', wallShade: '#e2d2b8', window: '#9fd3f0', windowFrame: '#6b5540',
  stone: '#b9b4a6', stoneDark: '#8f8a7c', gold: '#e9c46a', pole: '#5a4634', navy: '#102e49',
};

const FLOWER_PALETTE: Palette = { r: '#f26b8a', y: '#f9d65c', w: '#fff6dc', g: '#3f8a3d' };
const TREE: string[] = [
  '.....LLLLL......',
  '...LLllllLLL....',
  '..LlllllllllL...',
  '.LlllllllllllL..',
  '.LllllLLllllllL.',
  'LlllllllllllllL.',
  'LllllllllllllllL',
  'LllllllllllllllL',
  '.LlllllllllllLL.',
  '.LLlllllllllLL..',
  '..LLLlllllLLL...',
  '....LLLtLLL.....',
  '......ttt.......',
  '......ttt.......',
  '.....ttttt......',
  '................',
];
const TREE_PALETTE: Palette = { L: C.leafDark, l: C.leaf, t: C.trunk };
const FOUNTAIN: string[] = [
  '................',
  '....SSSSSSSS....',
  '..SSwwwwwwwwSS..',
  '.SwwwbbbbbbwwwS.',
  '.SwbbbwwwwbbbwS.',
  '.SwbwwwSSwwwbwS.',
  '.SwbwwSSSSwwbwS.',
  '.SwbwwSSSSwwbwS.',
  '.SwbwwwSSwwwbwS.',
  '.SwbbbwwwwbbbwS.',
  '.SwwwbbbbbbwwwS.',
  '..SSwwwwwwwwSS..',
  '....SSSSSSSS....',
  '.....ssssss.....',
  '................',
  '................',
];
const FOUNTAIN_PALETTE: Palette = { S: C.stoneDark, s: C.stoneDark, w: C.stone, b: C.waterLight };

// A tiny deterministic hash so grass specks and path stones vary without a RNG.
const h = (x: number, y: number, n: number): number => ((x * 73856093) ^ (y * 19349663)) % n;

function grass(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.fillStyle = C.grass;
  ctx.fillRect(x, y, TILE, TILE);
  ctx.fillStyle = C.grassDark;
  for (let i = 0; i < 4; i++) { const k = h(x + i, y, 97); ctx.fillRect(x + (k % 14), y + ((k * 7) % 14), 2, 1); }
  ctx.fillStyle = C.grassLight;
  for (let i = 0; i < 2; i++) { const k = h(x, y + i, 89); ctx.fillRect(x + (k % 15), y + ((k * 5) % 15), 1, 1); }
}

function flowers(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  grass(ctx, x, y);
  const rows = ['................', '..r.......y.....', '.rrr..w..yyy....', '..g...g...g.....', '................', '.....r......w...', '....rrr....www..', '.....g......g...', '................', '..y......r......', '.yyy....rrr.....', '..g......g......', '................', '......w.....y...', '.....www...yyy..', '......g.....g...'];
  paint(ctx, rows, FLOWER_PALETTE, x, y);
}

function path(ctx: CanvasRenderingContext2D, x: number, y: number, tx: number, ty: number): void {
  ctx.fillStyle = C.path;
  ctx.fillRect(x, y, TILE, TILE);
  ctx.fillStyle = C.pathDark;
  for (let i = 0; i < 3; i++) { const k = h(tx * 3 + i, ty, 101); ctx.fillRect(x + (k % 13), y + ((k * 3) % 13), 3, 2); }
  // A soft edge where the path meets grass.
  const g = (dx: number, dy: number) => (TOWN[ty + dy]?.[tx + dx] ?? 'T') !== '#';
  ctx.fillStyle = C.pathEdge;
  if (g(0, -1)) ctx.fillRect(x, y, TILE, 1);
  if (g(0, 1)) ctx.fillRect(x, y + TILE - 1, TILE, 1);
  if (g(-1, 0)) ctx.fillRect(x, y, 1, TILE);
  if (g(1, 0)) ctx.fillRect(x + TILE - 1, y, 1, TILE);
}

function water(ctx: CanvasRenderingContext2D, x: number, y: number, tx: number, ty: number): void {
  ctx.fillStyle = C.water;
  ctx.fillRect(x, y, TILE, TILE);
  ctx.fillStyle = C.waterLight;
  const k = h(tx, ty, 7);
  ctx.fillRect(x + 2 + k, y + 4, 5, 1);
  ctx.fillRect(x + 8 - k, y + 11, 4, 1);
  // Grassy bank on the sides that touch land.
  const land = (dx: number, dy: number) => (TOWN[ty + dy]?.[tx + dx] ?? '~') !== '~';
  ctx.fillStyle = C.waterDark;
  if (land(0, -1)) ctx.fillRect(x, y, TILE, 2);
  if (land(-1, 0)) ctx.fillRect(x, y, 2, TILE);
  if (land(1, 0)) ctx.fillRect(x + TILE - 2, y, 2, TILE);
  if (land(0, 1)) ctx.fillRect(x, y + TILE - 2, TILE, 2);
}

function shade(hex: string, f: number): string {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v: number) => Math.max(0, Math.min(255, Math.round(v * f))).toString(16).padStart(2, '0');
  return `#${ch(n >> 16)}${ch((n >> 8) & 255)}${ch(n & 255)}`;
}

// A 3×5 pixel digit for the number sign on each roof.
const DIGITS: Record<string, string[]> = {
  '0': ['###', '#.#', '#.#', '#.#', '###'],
  '1': ['.#.', '##.', '.#.', '.#.', '###'],
  '2': ['###', '..#', '###', '#..', '###'],
  '3': ['###', '..#', '###', '..#', '###'],
  '4': ['#.#', '#.#', '###', '..#', '..#'],
  '5': ['###', '#..', '###', '..#', '###'],
  '6': ['###', '#..', '###', '#.#', '###'],
  '7': ['###', '..#', '..#', '..#', '..#'],
  '8': ['###', '#.#', '###', '#.#', '###'],
  '9': ['###', '#.#', '###', '..#', '###'],
};

/** The level number on a cream sign in the middle of the roof, so a house reads as "3" from afar. */
function numberSign(ctx: CanvasRenderingContext2D, x: number, y: number, n: number): void {
  const text = String(n), w = text.length * 4 + 3;
  ctx.fillStyle = C.navy;
  ctx.fillRect(x - 1, y - 1, w + 2, 9);
  ctx.fillStyle = C.wall;
  ctx.fillRect(x, y, w, 7);
  [...text].forEach((ch, k) => paint(ctx, DIGITS[ch] ?? DIGITS['0'], { '#': C.navy }, x + 2 + k * 4, y + 1));
}

/** A 3×3-tile house: two rows of roof, one of wall with the door in the middle. */
function house(ctx: CanvasRenderingContext2D, b: Building): void {
  const x = (b.door.x - 1) * TILE, y = (b.door.y - 2) * TILE;
  const w = TILE * 3, roofH = TILE * 2 - 4;
  // Roof: a gable with shingle lines and a lighter ridge.
  ctx.fillStyle = shade(b.roof, 0.78);
  ctx.fillRect(x - 1, y + 2, w + 2, roofH);
  ctx.fillStyle = b.roof;
  ctx.fillRect(x, y + 3, w, roofH - 3);
  ctx.fillStyle = shade(b.roof, 0.86);
  for (let r = y + 7; r < y + roofH; r += 5) ctx.fillRect(x, r, w, 1);
  ctx.fillStyle = shade(b.roof, 1.18);
  ctx.fillRect(x + 2, y + 3, w - 4, 2);
  // The level number, centred low on the roof.
  const n = levelNumber(b.level), sw = String(n).length * 4 + 3;
  numberSign(ctx, x + Math.floor((w - sw) / 2), y + roofH - 10, n);
  // Wall.
  ctx.fillStyle = C.wall;
  ctx.fillRect(x, y + roofH + 2, w, TILE + 2);
  ctx.fillStyle = C.wallShade;
  ctx.fillRect(x, y + roofH + 2, w, 1);
  ctx.fillRect(x, y + TILE * 3 - 1, w, 1);
  // Two windows, one each side of the door.
  for (const wx of [x + 3, x + w - 10]) {
    ctx.fillStyle = C.windowFrame;
    ctx.fillRect(wx, y + roofH + 5, 7, 7);
    ctx.fillStyle = C.window;
    ctx.fillRect(wx + 1, y + roofH + 6, 5, 5);
    ctx.fillStyle = C.windowFrame;
    ctx.fillRect(wx + 3, y + roofH + 6, 1, 5);
  }
  // Door (the walkable tile): a frame in the trim colour, a lighter panel, a gold knob.
  const dx = b.door.x * TILE, dy = b.door.y * TILE;
  ctx.fillStyle = b.trim;
  ctx.fillRect(dx + 3, dy + 3, 10, 13);
  ctx.fillStyle = shade(b.trim, 1.35);
  ctx.fillRect(dx + 4, dy + 4, 8, 12);
  ctx.fillStyle = C.gold;
  ctx.fillRect(dx + 10, dy + 10, 1, 1);
  // A step in front.
  ctx.fillStyle = C.stone;
  ctx.fillRect(dx + 2, dy + 15, 12, 1);
}

/** The whole town, ground and houses, as one canvas. Call once; blit every frame. */
export function renderTown(): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = WIDTH * TILE; c.height = HEIGHT * TILE;
  const ctx = c.getContext('2d')!;
  for (let ty = 0; ty < HEIGHT; ty++) for (let tx = 0; tx < WIDTH; tx++) {
    const x = tx * TILE, y = ty * TILE, t = TOWN[ty][tx];
    if (t === '#') path(ctx, x, y, tx, ty);
    else if (t === '~') water(ctx, x, y, tx, ty);
    else if (t === ',') flowers(ctx, x, y);
    else grass(ctx, x, y);
  }
  // Trees and the fountain sit on grass.
  for (let ty = 0; ty < HEIGHT; ty++) for (let tx = 0; tx < WIDTH; tx++) {
    const t = TOWN[ty][tx];
    if (t === 'T') paint(ctx, TREE, TREE_PALETTE, tx * TILE, ty * TILE);
    if (t === 'O') paint(ctx, FOUNTAIN, FOUNTAIN_PALETTE, tx * TILE, ty * TILE);
  }
  for (const b of BUILDINGS) house(ctx, b);
  return c;
}

/** A small gold flag on a roof: drawn per frame, since it depends on progress. */
export function flag(ctx: CanvasRenderingContext2D, b: Building, wave: number): void {
  const x = (b.door.x + 1) * TILE + 9, y = (b.door.y - 2) * TILE - 4;
  ctx.fillStyle = C.pole;
  ctx.fillRect(x, y, 1, 12);
  ctx.fillStyle = C.gold;
  ctx.fillRect(x + 1, y, 5 + wave, 2);
  ctx.fillRect(x + 1, y + 2, 4 + wave, 2);
  ctx.fillRect(x + 1, y + 4, 2 + wave, 1);
}
