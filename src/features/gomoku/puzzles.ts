// Ten "win in one" positions. Each answer is one point of a heart; the answers stay on the board
// in gold as they are found, and the tenth completes the heart. The positions are built from
// three patterns (a four shut at one end, a four with a hole, three-and-one) laid in varied
// directions around each heart point, with a few decoy stones, and checked by the test to have
// exactly one winning point. `mover` is whoever is playing; `other` the partner's colour.
import { SIZE, boardWith, inside, winningCells, type Cell } from './core';

export interface Puzzle { id: string; mover: Cell[]; other: Cell[]; answer: Cell }

/**
 * The heart, ten points, found in this order: from the dip between the lobes round the left side
 * to the tip and back up the right, so the outline draws itself as the puzzles are solved.
 *
 *     . X . X .      row 4
 *     X . X . X      row 5
 *     X . . . X      row 6
 *     . X . X .      row 7
 *     . . X . .      row 8
 */
export const HEART: Cell[] = [[5, 7], [4, 6], [5, 5], [6, 5], [7, 6], [8, 7], [7, 8], [6, 9], [5, 9], [4, 8]];

const DIRS: Cell[] = [[0, 1], [1, 0], [1, 1], [1, -1], [0, -1], [-1, 0], [-1, -1], [-1, 1]];
const inHeart = (r: number, c: number) => HEART.some(([hr, hc]) => hr === r && hc === c);
const add = (a: Cell, d: Cell, k: number): Cell => [a[0] + d[0] * k, a[1] + d[1] * k];

/** The three patterns: offsets (in multiples of the direction) of the mover's stones and the other side's blocks. */
const PATTERNS: { mover: number[]; other: number[] }[] = [
  { mover: [1, 2, 3, 4], other: [5] },            // a four, shut at the far end: only the near end wins
  { mover: [-2, -1, 1, 2], other: [-3, 3] },      // a hole in the middle, both ends shut
  { mover: [1, 2, 3, -1], other: [4, -2] },       // three and one, both ends shut
];
/** Decoy stones around the answer (row, col offsets), both colours, skipped where they would collide. */
const DECOYS: { mover: Cell[]; other: Cell[] } = {
  mover: [[2, -3], [-3, 2], [3, 3]],
  other: [[-2, -2], [2, 2], [-3, -1], [1, 3], [3, -2]],
};

function build(answer: Cell, i: number): Puzzle | null {
  for (let t = 0; t < DIRS.length * PATTERNS.length; t++) {
    const d = DIRS[(i + t) % DIRS.length];
    const pat = PATTERNS[(i + Math.floor(t / DIRS.length)) % PATTERNS.length];
    const mover = pat.mover.map((k) => add(answer, d, k));
    const other = pat.other.map((k) => add(answer, d, k));
    const cells = [...mover, ...other];
    if (!cells.every(([r, c]) => inside(r, c) && !inHeart(r, c))) continue;
    const taken = new Set(cells.map(([r, c]) => `${r},${c}`));
    const place = (offs: Cell[], into: Cell[]) => {
      for (const [dr, dc] of offs) {
        const r = answer[0] + dr, c = answer[1] + dc;
        if (!inside(r, c) || inHeart(r, c) || taken.has(`${r},${c}`)) continue;
        taken.add(`${r},${c}`); into.push([r, c]);
      }
    };
    place(DECOYS.mover, mover); place(DECOYS.other, other);
    const wins = winningCells(boardWith({ purple: mover, green: other }), 'purple');
    if (wins.length === 1 && wins[0][0] === answer[0] && wins[0][1] === answer[1]) return { id: `heart-${i + 1}`, mover, other, answer };
  }
  return null;
}

export const PUZZLES: Puzzle[] = HEART.map((a, i) => build(a, i)).filter((p): p is Puzzle => p !== null);

export const BOARD = SIZE;
