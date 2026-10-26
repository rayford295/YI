// A day in College Station: the second map. Yifan's stops in the order of his day, where each
// stands on the grid, and when he is there, so the map can show where he is right now.
// Pure data; the owner edits the stops and hours here and the stories in i18n.ts (cs.story.*).
import { makeMap, type Building, type Point, type TownMap } from '../world/town';

// 32×22. Legend as in the town, plus = road and C basketball court. Campus is the top half: the
// office, lunch and the library along one path; the gym with its court; a street across the middle
// with home, the bus stop and the grocery store along the bottom.
export const CS_GRID = [
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  'T...,..........................T',
  'T..RRR.....RRR.......RRR.......T',
  'T..RRR.....RRR.......RRR.......T',
  'T..WDW.....WDW.......WDW..T....T',
  'T...#.......#.........#........T',
  'T...####################.......T',
  'T......#...............#.,.....T',
  'T......#.....RRR.......#.......T',
  'T..T...#.....RRR...CCCC#.......T',
  'T......#.....WDW...CCCC#.......T',
  'T......#......#....CCCC#...T...T',
  'T......########........#.......T',
  'T......#...............#.......T',
  'T======================#=======T',
  'T......#...............#.......T',
  'T..RRR.#...RRR.........#..RRR..T',
  'T..RRR.#...RRR.........#..RRR..T',
  'T..WDW.#...WDW.........#..WDW..T',
  'T...#..#....#..........#...#...T',
  'T...############.......#####...T',
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
] as const;

export type StopId = 'home' | 'bus' | 'office' | 'lunch' | 'library' | 'gym' | 'grocery';

export interface Stop extends Building {
  level: StopId;
  /** Hours of the day (local, 0–24) when Yifan is here; several windows allowed. */
  hours: [number, number][];
}

// In the order of the day; the sign number follows that order.
export const STOPS: Stop[] = [
  { level: 'home',    number: 1, door: { x: 4,  y: 18 }, roof: '#c74b5f', trim: '#7a2a3a', hours: [[0, 8.5], [21, 24]] },
  { level: 'bus',     number: 2, door: { x: 12, y: 18 }, roof: '#8d6a4b', trim: '#4e3621', hours: [[8.5, 9]] },
  { level: 'office',  number: 3, door: { x: 4,  y: 4 },  roof: '#7a1f2b', trim: '#4a0f18', hours: [[9, 12], [13, 15]] },
  { level: 'lunch',   number: 4, door: { x: 12, y: 4 },  roof: '#d8973c', trim: '#8a5a1a', hours: [[12, 13]] },
  { level: 'library', number: 5, door: { x: 22, y: 4 },  roof: '#3f7fb3', trim: '#244d70', hours: [[15, 17.5]] },
  { level: 'gym',     number: 6, door: { x: 14, y: 10 }, roof: '#5f9e5a', trim: '#2f5e2d', hours: [[17.5, 19.5]] },
  { level: 'grocery', number: 7, door: { x: 27, y: 18 }, roof: '#b8322f', trim: '#6e1c1a', hours: [[19.5, 21]] },
];

export const CS_MAP: TownMap = makeMap(CS_GRID, STOPS);
/** Where a visitor appears: on the path at the street crossing. */
export const CS_SPAWN: Point = { x: 23, y: 13 };

/** The stop Yifan is at for a time of day given as a decimal hour (14.5 = 14:30). */
export function stopAt(hour: number): Stop {
  const h = ((hour % 24) + 24) % 24;
  return STOPS.find((s) => s.hours.some(([a, b]) => h >= a && h < b)) ?? STOPS[0];
}
