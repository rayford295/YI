// The ground and the houses, painted once onto an offscreen canvas at 16 px per tile.
// Everything is fillRect and small pixel grids: no image files.
import { YI_TOWN, type Building, type TownMap } from './town';
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

function path(ctx: CanvasRenderingContext2D, x: number, y: number, tx: number, ty: number, map: TownMap): void {
  ctx.fillStyle = C.path;
  ctx.fillRect(x, y, TILE, TILE);
  ctx.fillStyle = C.pathDark;
  for (let i = 0; i < 3; i++) { const k = h(tx * 3 + i, ty, 101); ctx.fillRect(x + (k % 13), y + ((k * 3) % 13), 3, 2); }
  // A soft edge where the path meets grass.
  const g = (dx: number, dy: number) => { const t = map.grid[ty + dy]?.[tx + dx] ?? 'T'; return t !== '#' && t !== '='; };
  ctx.fillStyle = C.pathEdge;
  if (g(0, -1)) ctx.fillRect(x, y, TILE, 1);
  if (g(0, 1)) ctx.fillRect(x, y + TILE - 1, TILE, 1);
  if (g(-1, 0)) ctx.fillRect(x, y, 1, TILE);
  if (g(1, 0)) ctx.fillRect(x + TILE - 1, y, 1, TILE);
}

function water(ctx: CanvasRenderingContext2D, x: number, y: number, tx: number, ty: number, map: TownMap, phase = 0): void {
  ctx.fillStyle = C.water;
  ctx.fillRect(x, y, TILE, TILE);
  // Two highlights that drift with the phase, so the pond moves when drawn frame by frame.
  ctx.fillStyle = C.waterLight;
  const k = (h(tx, ty, 7) + phase * 3) % 9;
  ctx.fillRect(x + 2 + k, y + 4 + (phase === 1 ? 1 : 0), 5, 1);
  ctx.fillRect(x + 8 - k, y + 11 - (phase === 2 ? 1 : 0), 4, 1);
  // Grassy bank on the sides that touch land.
  const land = (dx: number, dy: number) => (map.grid[ty + dy]?.[tx + dx] ?? '~') !== '~';
  ctx.fillStyle = C.waterDark;
  if (land(0, -1)) ctx.fillRect(x, y, TILE, 2);
  if (land(-1, 0)) ctx.fillRect(x, y, 2, TILE);
  if (land(1, 0)) ctx.fillRect(x + TILE - 2, y, 2, TILE);
  if (land(0, 1)) ctx.fillRect(x, y + TILE - 2, TILE, 2);
}

/** A street: asphalt with a dashed centre line along its long axis and kerbs where grass meets it. */
function road(ctx: CanvasRenderingContext2D, x: number, y: number, tx: number, ty: number, map: TownMap): void {
  ctx.fillStyle = '#6b6b70';
  ctx.fillRect(x, y, TILE, TILE);
  ctx.fillStyle = '#767679';
  for (let i = 0; i < 3; i++) { const k = h(tx * 5 + i, ty, 103); ctx.fillRect(x + (k % 13), y + ((k * 3) % 13), 2, 1); }
  const isRoad = (dx: number, dy: number) => (map.grid[ty + dy]?.[tx + dx] ?? '.') === '=';
  const horizontal = isRoad(1, 0) || isRoad(-1, 0);
  ctx.fillStyle = '#e9d56b';
  if (horizontal) ctx.fillRect(x + 2, y + 7, 6, 2); else ctx.fillRect(x + 7, y + 2, 2, 6);
  ctx.fillStyle = '#b9b4a6';
  if (horizontal && !isRoad(0, -1)) ctx.fillRect(x, y, TILE, 2);
  if (horizontal && !isRoad(0, 1)) ctx.fillRect(x, y + TILE - 2, TILE, 2);
  if (!horizontal && !isRoad(-1, 0)) ctx.fillRect(x, y, 2, TILE);
  if (!horizontal && !isRoad(1, 0)) ctx.fillRect(x + TILE - 2, y, 2, TILE);
}

/** A basketball court: orange floor, white lines on the edges, a hoop on the top row's middle tile. */
function court(ctx: CanvasRenderingContext2D, x: number, y: number, tx: number, ty: number, map: TownMap): void {
  ctx.fillStyle = '#d98b4a';
  ctx.fillRect(x, y, TILE, TILE);
  ctx.fillStyle = '#c97a3c';
  for (let i = 0; i < 2; i++) { const k = h(tx * 7 + i, ty, 97); ctx.fillRect(x + (k % 14), y + ((k * 5) % 14), 2, 1); }
  const isCourt = (dx: number, dy: number) => (map.grid[ty + dy]?.[tx + dx] ?? '.') === 'C';
  ctx.fillStyle = '#fff6dc';
  if (!isCourt(0, -1)) ctx.fillRect(x, y, TILE, 1);
  if (!isCourt(0, 1)) ctx.fillRect(x, y + TILE - 1, TILE, 1);
  if (!isCourt(-1, 0)) ctx.fillRect(x, y, 1, TILE);
  if (!isCourt(1, 0)) ctx.fillRect(x + TILE - 1, y, 1, TILE);
  // One hoop at each end: on the second tile from the court's left edge, on the top and bottom rows.
  const second = isCourt(-1, 0) && !isCourt(-2, 0) && isCourt(1, 0);
  if (second && !isCourt(0, -1)) {
    ctx.fillStyle = '#f4e9d6'; ctx.fillRect(x + 5, y + 1, 6, 3);
    ctx.fillStyle = '#e8562a'; ctx.fillRect(x + 6, y + 4, 4, 1);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(x + 6, y + 5, 1, 2); ctx.fillRect(x + 9, y + 5, 1, 2); ctx.fillRect(x + 7, y + 7, 2, 1);
  }
  if (second && !isCourt(0, 1)) {
    ctx.fillStyle = '#f4e9d6'; ctx.fillRect(x + 5, y + 12, 6, 3);
    ctx.fillStyle = '#e8562a'; ctx.fillRect(x + 6, y + 11, 4, 1);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(x + 6, y + 9, 1, 2); ctx.fillRect(x + 9, y + 9, 1, 2); ctx.fillRect(x + 7, y + 8, 2, 1);
  }
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
  const n = b.number ?? levelNumber(b.level), sw = String(n).length * 4 + 3;
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
export function renderTown(map: TownMap = YI_TOWN): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = map.width * TILE; c.height = map.height * TILE;
  const ctx = c.getContext('2d')!;
  for (let ty = 0; ty < map.height; ty++) for (let tx = 0; tx < map.width; tx++) {
    const x = tx * TILE, y = ty * TILE, t = map.grid[ty][tx];
    if (t === '#') path(ctx, x, y, tx, ty, map);
    else if (t === '=') road(ctx, x, y, tx, ty, map);
    else if (t === 'C') court(ctx, x, y, tx, ty, map);
    else if (t === '~') water(ctx, x, y, tx, ty, map);
    else if (t === ',') flowers(ctx, x, y);
    else grass(ctx, x, y);
  }
  // Trees and the fountain sit on grass.
  for (let ty = 0; ty < map.height; ty++) for (let tx = 0; tx < map.width; tx++) {
    const t = map.grid[ty][tx];
    if (t === 'T') paint(ctx, TREE, TREE_PALETTE, tx * TILE, ty * TILE);
    if (t === 'O') paint(ctx, FOUNTAIN, FOUNTAIN_PALETTE, tx * TILE, ty * TILE);
  }
  for (const b of map.buildings) house(ctx, b);
  return c;
}

/** A patch of meadow (grass with a few flowers) as a data URL, for the page behind the town. */
export function meadowUrl(tiles = 8): string {
  const c = document.createElement('canvas');
  c.width = c.height = tiles * TILE;
  const ctx = c.getContext('2d')!;
  for (let ty = 0; ty < tiles; ty++) for (let tx = 0; tx < tiles; tx++) {
    if ((tx === 2 && ty === 5) || (tx === 6 && ty === 1)) flowers(ctx, tx * TILE, ty * TILE);
    else grass(ctx, tx * TILE, ty * TILE);
  }
  return c.toDataURL();
}

export const WATER_PHASES = 3;
/** The pond alone, in one phase, on a transparent town-sized canvas; blit over the town per frame. */
export function renderWater(phase: number, map: TownMap = YI_TOWN): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = map.width * TILE; c.height = map.height * TILE;
  const ctx = c.getContext('2d')!;
  for (let ty = 0; ty < map.height; ty++) for (let tx = 0; tx < map.width; tx++) if (map.grid[ty][tx] === '~') water(ctx, tx * TILE, ty * TILE, tx, ty, map, phase);
  return c;
}

/** A glint on the fountain's water, alternating between two spots. */
export function fountainGlint(ctx: CanvasRenderingContext2D, phase: number, map: TownMap = YI_TOWN): void {
  ctx.fillStyle = '#ffffff';
  for (let ty = 0; ty < map.height; ty++) for (let tx = 0; tx < map.width; tx++) if (map.grid[ty][tx] === 'O') {
    const x = tx * TILE, y = ty * TILE;
    if (phase === 0) ctx.fillRect(x + 6, y + 5, 2, 1); else ctx.fillRect(x + 9, y + 7, 1, 2);
  }
}

/** Warm light in every house window, for dusk and night; drawn over the evening wash. */
export function litWindows(ctx: CanvasRenderingContext2D, map: TownMap = YI_TOWN): void {
  const roofH = TILE * 2 - 4;
  for (const b of map.buildings) {
    const x = (b.door.x - 1) * TILE, y = (b.door.y - 2) * TILE, w = TILE * 3;
    for (const wx of [x + 3, x + w - 10]) {
      ctx.fillStyle = '#ffd98a';
      ctx.fillRect(wx + 1, y + roofH + 6, 5, 5);
      ctx.fillStyle = C.windowFrame;
      ctx.fillRect(wx + 3, y + roofH + 6, 1, 5);
    }
  }
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
