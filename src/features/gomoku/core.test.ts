import { describe, expect, it } from 'vitest';
import { SIZE, newGame, place, undo, turn, boardOf, status, nextFirst, type Game } from './core';

const play = (g: Game, ...cells: Array<[number, number]>) => cells.reduce((acc, [r, c]) => place(acc, r, c), g);

describe('gomoku core', () => {
  it('starts empty on a 15x15 board with the chosen first player', () => {
    const g = newGame('purple');
    expect(SIZE).toBe(15);
    expect(turn(g)).toBe('purple');
    expect(boardOf(g).flat().every((s) => s === null)).toBe(true);
    expect(status(g)).toEqual({ kind: 'playing' });
  });

  it('alternates turns and records stones', () => {
    const g = play(newGame('green'), [7, 7], [7, 8]);
    expect(boardOf(g)[7][7]).toBe('green');
    expect(boardOf(g)[7][8]).toBe('purple');
    expect(turn(g)).toBe('green');
  });

  it('ignores occupied cells and cells off the board', () => {
    const g = play(newGame('purple'), [7, 7]);
    expect(place(g, 7, 7)).toBe(g);
    expect(place(g, -1, 0)).toBe(g);
    expect(place(g, 0, SIZE)).toBe(g);
    expect(place(g, 1.5, 2)).toBe(g);
  });

  it.each([
    ['horizontal', [0, 1]],
    ['vertical', [1, 0]],
    ['diagonal', [1, 1]],
    ['anti-diagonal', [1, -1]],
  ] as const)('detects five in a row: %s', (_name, [dr, dc]) => {
    let g = newGame('purple');
    for (let i = 0; i < 5; i++) {
      g = place(g, 5 + dr * i, 7 + dc * i); // purple
      if (i < 4) g = place(g, 0, i); // green, out of the way on row 0
    }
    const s = status(g);
    expect(s.kind).toBe('won');
    if (s.kind === 'won') {
      expect(s.by).toBe('purple');
      expect(s.line).toHaveLength(5);
    }
  });

  it('wins along the board edge and counts the last stone placed in the middle', () => {
    // green fills column 14 at rows 0,1,3,4 then closes the gap at row 2
    const g = play(newGame('green'), [0, 14], [9, 0], [1, 14], [9, 1], [3, 14], [9, 2], [4, 14], [9, 3], [2, 14]);
    const s = status(g);
    expect(s).toMatchObject({ kind: 'won', by: 'green' });
  });

  it('accepts more than five (freestyle)', () => {
    const g = play(newGame('purple'),
      [3, 0], [10, 0], [3, 1], [10, 1], [3, 2], [10, 2], [3, 4], [10, 4], [3, 5], [11, 9], [3, 3]);
    const s = status(g);
    expect(s.kind).toBe('won');
    if (s.kind === 'won') expect(s.line).toHaveLength(6);
  });

  it('does not count four, or five broken by the other colour', () => {
    const g = play(newGame('purple'), [0, 0], [0, 2], [0, 1], [5, 5], [0, 3], [5, 6], [0, 4], [5, 7], [0, 5]);
    expect(status(g)).toEqual({ kind: 'playing' });
  });

  it('refuses moves after the game is won', () => {
    const won = play(newGame('purple'), [0, 0], [1, 0], [0, 1], [1, 1], [0, 2], [1, 2], [0, 3], [1, 3], [0, 4]);
    expect(status(won).kind).toBe('won');
    expect(place(won, 8, 8)).toBe(won);
  });

  it('undo removes the last move and gives the turn back', () => {
    const g = play(newGame('purple'), [7, 7], [7, 8]);
    const u = undo(g);
    expect(boardOf(u)[7][8]).toBeNull();
    expect(turn(u)).toBe('green');
    expect(undo(newGame('green')).moves).toHaveLength(0);
  });

  it('undo after a win resumes play', () => {
    const won = play(newGame('purple'), [0, 0], [1, 0], [0, 1], [1, 1], [0, 2], [1, 2], [0, 3], [1, 3], [0, 4]);
    expect(status(undo(won))).toEqual({ kind: 'playing' });
  });

  it('a full board with no five is a draw', () => {
    // (floor(c/2) + r) % 2 has no five in any direction; it splits 225 cells 113 / 112.
    const purples: Array<[number, number]> = [];
    const greens: Array<[number, number]> = [];
    for (let r = 0; r < SIZE; r++)
      for (let c = 0; c < SIZE; c++) ((Math.floor(c / 2) + r) % 2 === 0 ? purples : greens).push([r, c]);
    let g = newGame('purple');
    for (let i = 0; i < purples.length; i++) {
      g = place(g, purples[i][0], purples[i][1]);
      if (i < greens.length) g = place(g, greens[i][0], greens[i][1]);
    }
    expect(g.moves).toHaveLength(SIZE * SIZE);
    expect(status(g)).toEqual({ kind: 'draw' });
  });

  it('the loser opens the next game; a draw swaps the opener', () => {
    expect(nextFirst('purple', { kind: 'won', by: 'purple', line: [] })).toBe('green');
    expect(nextFirst('purple', { kind: 'won', by: 'green', line: [] })).toBe('purple');
    expect(nextFirst('green', { kind: 'draw' })).toBe('purple');
  });
});
