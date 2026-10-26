// A day in Shenzhen: Jingyi's stops. Product manager at Tencent by day, home to Coffee and Duoduo
// at night. The owner (or Jingyi) edits the hours here and the stories in i18n.ts (sz.story.*).
import { makeMap } from '../world/town';
import type { Day, Stop } from './day';

// 32×22. Tencent's tower is the wide roof top left; lunch and the evening spot along the same
// path; a street across the middle; home and the metro station below, with the bay (Shenzhen Bay)
// in the bottom right corner.
export const SZ_GRID = [
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  'T..............................T',
  'T..RRRRR.......RRR......RRR....T',
  'T..RRRRR.......RRR......RRR....T',
  'T..WWDWW.......WDW......WDW..T.T',
  'T....#..........#........#.....T',
  'T....######################....T',
  'T.........#...............#..,.T',
  'T...T.....#...T...........#....T',
  'T.........#...............#....T',
  'T.........#.......T.......#....T',
  'T..,......#...............#..T.T',
  'T.........#...............#....T',
  'T.........#...............#....T',
  'T==============================T',
  'T.........#..........#.........T',
  'T..RRR....#...RRR....#.........T',
  'T..RRR....#...RRR....#..~~~~~~~T',
  'T..WDW....#...WDW....#.~~~~~~~~T',
  'T...#.....#....#.....#~~~~~~~~~T',
  'T...#######....######~~~~~~~~~~T',
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
] as const;

const STOPS: Stop[] = [
  { level: 'home',   number: 1, door: { x: 4,  y: 18 }, roof: '#d4506d', trim: '#7a2a3a', hours: [[0, 8.5], [20, 24]] },
  { level: 'metro',  number: 2, door: { x: 15, y: 18 }, roof: '#3f7fb3', trim: '#244d70', hours: [[8.5, 9.5]] },
  { level: 'office', number: 3, door: { x: 5,  y: 4 },  roof: '#2f6fd6', trim: '#1a3f80', hours: [[9.5, 12], [13.5, 19]] },
  { level: 'lunch',  number: 4, door: { x: 16, y: 4 },  roof: '#d8973c', trim: '#8a5a1a', hours: [[12, 13.5]] },
  { level: 'bay',    number: 5, door: { x: 25, y: 4 },  roof: '#5f9e5a', trim: '#2f5e2d', hours: [[19, 20]] },
];

export const SZ: Day = {
  id: 'sz', person: 'jingyi', zone: 'Asia/Shanghai', grid: SZ_GRID, stops: STOPS,
  map: makeMap(SZ_GRID, STOPS), spawn: { x: 16, y: 14 },
  cats: [{ id: 'coffee', at: { x: 3, y: 19 } }, { id: 'duoduo', at: { x: 5, y: 19 } }],
};
