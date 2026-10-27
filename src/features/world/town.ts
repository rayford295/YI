// The town: a character grid (one char per 16×16 tile), the nine buildings and who stands where.
// Pure data and helpers; nothing here touches the DOM, so the map can be tested.
import { LEVELS } from '../../core/quest';

export type Tile = '.' | ',' | '#' | '~' | 'T' | 'R' | 'W' | 'D' | 'O' | '=' | 'C';

// Legend: . grass  , flowers  # path  ~ water  T tree  O fountain  = road  C basketball court
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
  'T...#.RRR.RRR..RRR.#RRRT',
  'T...#.RRR.RRR..RRR.#RRRT',
  'T...#.WDW.WDW..WDW.#WDWT',
  'T...#..#...#....#..#.#.T',
  'T...################...T',
  'T,.T...,..T...,..T..,..T',
  'TTTTTTTTTTTTTTTTTTTTTTTT',
] as const;

export interface Point { x: number; y: number }

export interface Building {
  level: string;          // LEVELS id in the town; any id on another map
  door: Point;            // the walkable door tile (bottom centre of the façade)
  roof: string;           // roof colour, so the eight houses read differently at a glance
  trim: string;           // wall accent (window frames, door)
  number?: number;        // the sign on the roof; the town derives it from LEVELS when absent
}

/** A walkable map: the grid, its buildings and its size. Yi Town is one; College Station another. */
export interface TownMap { grid: readonly string[]; buildings: Building[]; width: number; height: number }
export const makeMap = (grid: readonly string[], buildings: Building[]): TownMap => ({ grid, buildings, width: grid[0].length, height: grid.length });

// One building per level. The door is the entrance; the guard stands on the tile below it.
export const BUILDINGS: Building[] = [
  { level: 'met',     door: { x: 4,  y: 3 },  roof: '#c74b5f', trim: '#7a2a3a' },
  { level: 'map',     door: { x: 11, y: 3 },  roof: '#3f7fb3', trim: '#244d70' },
  { level: 'tattoo',  door: { x: 18, y: 3 },  roof: '#d8973c', trim: '#8a5a1a' },
  { level: 'moments', door: { x: 2,  y: 8 },  roof: '#5f9e5a', trim: '#2f5e2d' },
  { level: 'gomoku',  door: { x: 21, y: 8 },  roof: '#8d6a4b', trim: '#4e3621' },
  { level: 'songs',   door: { x: 7,  y: 15 }, roof: '#8c62b8', trim: '#4f3570' },
  { level: 'stars',   door: { x: 11, y: 15 }, roof: '#2d3f6e', trim: '#171f3a' },
  { level: 'poems',   door: { x: 21, y: 15 }, roof: '#b0413e', trim: '#5e1f1d' },
  { level: 'ring',    door: { x: 16, y: 15 }, roof: '#e9c46a', trim: '#9a7a2a' },
];

/** Where a new player appears: the square below the fountain. */
export const SPAWN: Point = { x: 11, y: 10 };
/** Where the other player waits, by the fountain. */
export const PARTNER: Point = { x: 12, y: 9 };
/** The signpost to College Station, at the east edge of the square. */
/** The mailbox by the fountain, where the voice notes wait. */
export const MAILBOX: Point = { x: 8, y: 9 };
export const SIGNPOST: Point = { x: 22, y: 9 };
/** The signpost at the west edge: the road to Shenzhen. */
export const SIGNPOST_WEST: Point = { x: 1, y: 9 };
/** Where a cat rests when it has no door to guard: Coffee by the pond, Duoduo in the middle of the square. */
export const CAT_HOMES: Record<'coffee' | 'duoduo', Point> = { coffee: { x: 13, y: 6 }, duoduo: { x: 10, y: 10 } };

export const WIDTH = TOWN[0].length;
export const HEIGHT = TOWN.length;
export const YI_TOWN: TownMap = makeMap(TOWN, BUILDINGS);

export const tileAt = (x: number, y: number, map: TownMap = YI_TOWN): Tile =>
  x < 0 || y < 0 || x >= map.width || y >= map.height ? 'T' : (map.grid[y][x] as Tile);

export const buildingAt = (x: number, y: number, map: TownMap = YI_TOWN): Building | undefined =>
  map.buildings.find((b) => b.door.x === x && b.door.y === y);
/** The tile in front of a door, where the guard of a locked building stands. */
export const guardSpot = (b: Building): Point => ({ x: b.door.x, y: b.door.y + 1 });

/** Ground that can be walked on: grass, flowers, path, road, a court, and a door when its building is open. */
export function walkable(x: number, y: number, doorOpen: (level: string) => boolean = () => true, map: TownMap = YI_TOWN): boolean {
  const t = tileAt(x, y, map);
  if (t === '.' || t === ',' || t === '#' || t === '=' || t === 'C') return true;
  if (t === 'D') { const b = buildingAt(x, y, map); return !!b && doorOpen(b.level); }
  return false;
}

/** Tiles reachable on foot from `from` (4-neighbour flood fill over `walkable`). */
export function reachable(from: Point, doorOpen?: (level: string) => boolean, map: TownMap = YI_TOWN): Set<string> {
  const seen = new Set<string>([`${from.x},${from.y}`]);
  const queue: Point[] = [from];
  while (queue.length) {
    const p = queue.shift()!;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
      const n = { x: p.x + dx, y: p.y + dy };
      const k = `${n.x},${n.y}`;
      if (!seen.has(k) && walkable(n.x, n.y, doorOpen, map)) { seen.add(k); queue.push(n); }
    }
  }
  return seen;
}

/** Every level has a building; useful for the test and for the HUD. */
export const levelIds = (): string[] => LEVELS.map((l) => l.id);
