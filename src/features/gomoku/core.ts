// Pure Gomoku rules for the endgame puzzles: 15×15, freestyle (five or more in a row wins),
// purple = Jingyi, green = Yifan. A board is a grid of stones; nothing here keeps a game.

export type Stone = 'purple' | 'green';
export type Cell = [row: number, col: number];
export type Board = (Stone | null)[][];

export const SIZE = 15;
const DIRECTIONS: Cell[] = [[0, 1], [1, 0], [1, 1], [1, -1]];

export const other = (s: Stone): Stone => (s === 'purple' ? 'green' : 'purple');

export const inside = (r: number, c: number): boolean =>
  Number.isInteger(r) && Number.isInteger(c) && r >= 0 && r < SIZE && c >= 0 && c < SIZE;

export const emptyBoard = (): Board => Array.from({ length: SIZE }, () => Array<Stone | null>(SIZE).fill(null));

/** A board with the given stones on it. Throws on a cell used twice or off the grid. */
export function boardWith(stones: Partial<Record<Stone, readonly Cell[]>>): Board {
  const board = emptyBoard();
  for (const s of ['purple', 'green'] as const) for (const [r, c] of stones[s] ?? []) {
    if (!inside(r, c)) throw new Error(`off the board: ${r},${c}`);
    if (board[r][c]) throw new Error(`two stones at ${r},${c}`);
    board[r][c] = s;
  }
  return board;
}

/** The line of five or more that `stone` would complete by playing at (r, c), or null. */
export function winningLine(board: Board, stone: Stone, r0: number, c0: number): Cell[] | null {
  if (!inside(r0, c0) || board[r0][c0]) return null;
  for (const [dr, dc] of DIRECTIONS) {
    const line: Cell[] = [[r0, c0]];
    for (const sign of [1, -1]) {
      let r = r0 + dr * sign, c = c0 + dc * sign;
      while (inside(r, c) && board[r][c] === stone) { line.push([r, c]); r += dr * sign; c += dc * sign; }
    }
    if (line.length >= 5) return line.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  }
  return null;
}

/** Every empty cell where `stone` wins at once. */
export function winningCells(board: Board, stone: Stone): Cell[] {
  const out: Cell[] = [];
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (winningLine(board, stone, r, c)) out.push([r, c]);
  return out;
}
