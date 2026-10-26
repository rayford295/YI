// A day in College Station: Yifan's stops in the order of his day, where each stands on the grid,
// and when he is there. The owner edits the stops and hours here and the stories in i18n.ts
// (cs.story.*).
import { makeMap } from '../world/town';
import type { Day, Stop } from './day';

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

const STOPS: Stop[] = [
  { level: 'home',    number: 1, door: { x: 4,  y: 18 }, roof: '#c74b5f', trim: '#7a2a3a', hours: [[0, 8.5], [21, 24]] },
  { level: 'bus',     number: 2, door: { x: 12, y: 18 }, roof: '#8d6a4b', trim: '#4e3621', hours: [[8.5, 9]] },
  { level: 'office',  number: 3, door: { x: 4,  y: 4 },  roof: '#7a1f2b', trim: '#4a0f18', hours: [[9, 12], [13, 15]] },
  { level: 'lunch',   number: 4, door: { x: 12, y: 4 },  roof: '#d8973c', trim: '#8a5a1a', hours: [[12, 13]] },
  { level: 'library', number: 5, door: { x: 22, y: 4 },  roof: '#3f7fb3', trim: '#244d70', hours: [[15, 17.5]] },
  { level: 'gym',     number: 6, door: { x: 14, y: 10 }, roof: '#5f9e5a', trim: '#2f5e2d', hours: [[17.5, 19.5]] },
  { level: 'grocery', number: 7, door: { x: 27, y: 18 }, roof: '#b8322f', trim: '#6e1c1a', hours: [[19.5, 21]] },
];

export const CS: Day = {
  id: 'cs', person: 'yifan', zone: 'America/Chicago', grid: CS_GRID, stops: STOPS,
  map: makeMap(CS_GRID, STOPS), spawn: { x: 23, y: 13 },
};
