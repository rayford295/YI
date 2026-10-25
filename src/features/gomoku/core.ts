// Pure Gomoku rules. The move list is the whole state; board, turn and result are derived.
// Rules: 15×15, freestyle (five or more in a row wins), purple = Jingyi, green = Yifan.

export type Stone = 'purple' | 'green';
export type Cell = [row: number, col: number];
export interface Game { readonly first: Stone; readonly moves: readonly Cell[] }
export type Status =
  | { kind: 'playing' }
  | { kind: 'won'; by: Stone; line: Cell[] }
  | { kind: 'draw' };

export const SIZE = 15;
const DIRECTIONS: Cell[] = [[0, 1], [1, 0], [1, 1], [1, -1]];

export const other = (s: Stone): Stone => (s === 'purple' ? 'green' : 'purple');

export function newGame(first: Stone): Game {
  return { first, moves: [] };
}

const stoneOf = (g: Game, index: number): Stone => (index % 2 === 0 ? g.first : other(g.first));

export function turn(g: Game): Stone {
  return stoneOf(g, g.moves.length);
}

export function boardOf(g: Game): (Stone | null)[][] {
  const board: (Stone | null)[][] = Array.from({ length: SIZE }, () => Array<Stone | null>(SIZE).fill(null));
  g.moves.forEach(([r, c], i) => (board[r][c] = stoneOf(g, i)));
  return board;
}

const inside = (r: number, c: number) =>
  Number.isInteger(r) && Number.isInteger(c) && r >= 0 && r < SIZE && c >= 0 && c < SIZE;

export function status(g: Game): Status {
  const n = g.moves.length;
  if (n === 0) return { kind: 'playing' };
  // Only the last move can have completed a line.
  const board = boardOf(g);
  const [r0, c0] = g.moves[n - 1];
  const by = stoneOf(g, n - 1);
  for (const [dr, dc] of DIRECTIONS) {
    const line: Cell[] = [[r0, c0]];
    for (const sign of [1, -1]) {
      let r = r0 + dr * sign, c = c0 + dc * sign;
      while (inside(r, c) && board[r][c] === by) {
        line.push([r, c]);
        r += dr * sign;
        c += dc * sign;
      }
    }
    if (line.length >= 5) return { kind: 'won', by, line: line.sort((a, b) => a[0] - b[0] || a[1] - b[1]) };
  }
  return n === SIZE * SIZE ? { kind: 'draw' } : { kind: 'playing' };
}

/** Returns the same object when the move is not allowed, so callers can compare by identity. */
export function place(g: Game, r: number, c: number): Game {
  if (!inside(r, c) || status(g).kind !== 'playing') return g;
  if (g.moves.some(([mr, mc]) => mr === r && mc === c)) return g;
  return { first: g.first, moves: [...g.moves, [r, c]] };
}

export function undo(g: Game): Game {
  return g.moves.length === 0 ? g : { first: g.first, moves: g.moves.slice(0, -1) };
}

/** The loser opens the next game; after a draw the opener swaps. */
export function nextFirst(prevFirst: Stone, result: Status): Stone {
  if (result.kind === 'won') return other(result.by);
  return other(prevFirst);
}
