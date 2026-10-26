// The town: a character grid (one char per 16×16 tile), the eight buildings and who stands where.
// Pure data and helpers; nothing here touches the DOM, so the map can be tested.
import { LEVELS } from '../../core/quest';

export type Tile = '.' | ',' | '#' | '~' | 'T' | 'R' | 'W' | 'D' | 'O';

// Legend: . grass  , flowers  # path  ~ water  T tree  O fountain
//         R roof   W wall     D door  (R/W/D are drawn from BUILDINGS, the chars only block walking)
export const TOWN = [
  'TTTTTTTTTTTTTTTTTTTTTTTT',
  'T..RRR....RRR....RRR...T',
  'T..RRR....RRR....RRR...T',
  'T..WDW....WDW....WDW...T',
  'T,..#......#......#...,T',
  'T...################...T',
  'T...#.........~~~..#...T',
  'TRRR#........~~~~..#RRRT',
  'TWDW#....#####.....#WDWT',
  'T.###....##O##.....###.T',
  'T...#....#####.....#...T',
  'T...#.T....#....T..#...T',
  'T...################...T',
  'T...#.RRR.RRR..RRR.#...T',
  'T...#.RRR.RRR..RRR.#...T',
  'T...#.WDW.WDW..WDW.#...T',
  'T...#..#...#....#..#...T',
  'T...################...T',
  'T,.T...,..T...,..T..,..T',
  'TTTTTTTTTTTTTTTTTTTTTTTT',
] as const;

export interface Point { x: number; y: number }

export interface Building {
  level: string;          // LEVELS id
  door: Point;            // the walkable door tile (bottom centre of the façade)
  roof: string;           // roof colour, so the eight houses read differently at a glance
  trim: string;           // wall accent (window frames, door)
}

// One building per level. The door is the entrance; the guard stands on the tile below it.
export const BUILDINGS: Building[] = [
  { level: 'met',     door: { x: 4,  y: 3 },  roof: '#c74b5f', trim: '#7a2a3a' },
  { level: 'map',     door: { x: 11, y: 3 },  roof: '#3f7fb3', trim: '#244d70' },
  { level: 'moments', door: { x: 18, y: 3 },  roof: '#d8973c', trim: '#8a5a1a' },
  { level: 'puzzle',  door: { x: 2,  y: 8 },  roof: '#5f9e5a', trim: '#2f5e2d' },
  { level: 'gomoku',  door: { x: 21, y: 8 },  roof: '#8d6a4b', trim: '#4e3621' },
  { level: 'draw',    door: { x: 7,  y: 15 }, roof: '#8c62b8', trim: '#4f3570' },
  { level: 'stars',   door: { x: 11, y: 15 }, roof: '#2d3f6e', trim: '#171f3a' },
  { level: 'ring',    door: { x: 16, y: 15 }, roof: '#e9c46a', trim: '#9a7a2a' },
];

/** Where a new player appears: the square below the fountain. */
export const SPAWN: Point = { x: 11, y: 10 };
/** Where the other player waits, by the fountain. */
export const PARTNER: Point = { x: 12, y: 9 };
/** Where a cat rests when it has no door to guard: Coffee by the pond, Duoduo in the middle of the square. */
export const CAT_HOMES: Record<'coffee' | 'duoduo', Point> = { coffee: { x: 13, y: 6 }, duoduo: { x: 10, y: 10 } };

export const WIDTH = TOWN[0].length;
export const HEIGHT = TOWN.length;

export const tileAt = (x: number, y: number): Tile =>
  x < 0 || y < 0 || x >= WIDTH || y >= HEIGHT ? 'T' : (TOWN[y][x] as Tile);

export const buildingAt = (x: number, y: number): Building | undefined =>
  BUILDINGS.find((b) => b.door.x === x && b.door.y === y);
export const buildingFor = (level: string): Building | undefined => BUILDINGS.find((b) => b.level === level);
/** The tile in front of a door, where the guard of a locked building stands. */
export const guardSpot = (b: Building): Point => ({ x: b.door.x, y: b.door.y + 1 });

/** Ground that can be walked on: grass, flowers, path, and a door when its building is open. */
export function walkable(x: number, y: number, doorOpen: (level: string) => boolean = () => true): boolean {
  const t = tileAt(x, y);
  if (t === '.' || t === ',' || t === '#') return true;
  if (t === 'D') { const b = buildingAt(x, y); return !!b && doorOpen(b.level); }
  return false;
}

/** Tiles reachable on foot from `from` (4-neighbour flood fill over `walkable`). */
export function reachable(from: Point, doorOpen?: (level: string) => boolean): Set<string> {
  const seen = new Set<string>([`${from.x},${from.y}`]);
  const queue: Point[] = [from];
  while (queue.length) {
    const p = queue.shift()!;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
      const n = { x: p.x + dx, y: p.y + dy };
      const k = `${n.x},${n.y}`;
      if (!seen.has(k) && walkable(n.x, n.y, doorOpen)) { seen.add(k); queue.push(n); }
    }
  }
  return seen;
}

/** Every level has a building; useful for the test and for the HUD. */
export const levelIds = (): string[] => LEVELS.map((l) => l.id);
