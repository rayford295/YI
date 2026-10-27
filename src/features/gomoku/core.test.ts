import { describe, expect, it } from 'vitest';
import { boardWith, winningCells, winningLine, SIZE } from './core';
import { HEART, PUZZLES } from './puzzles';

describe('gomoku rules', () => {
  it('finds a five in every direction and counts six as a win', () => {
    expect(winningLine(boardWith({ purple: [[7, 3], [7, 4], [7, 5], [7, 6]] }), 'purple', 7, 7)?.length).toBe(5);
    expect(winningLine(boardWith({ purple: [[3, 7], [4, 7], [5, 7], [6, 7]] }), 'purple', 7, 7)?.length).toBe(5);
    expect(winningLine(boardWith({ green: [[3, 3], [4, 4], [6, 6], [7, 7]] }), 'green', 5, 5)?.length).toBe(5);
    expect(winningLine(boardWith({ green: [[3, 11], [4, 10], [5, 9], [6, 8], [8, 6]] }), 'green', 7, 7)?.length).toBe(6);
  });
  it('needs five of the same colour on an empty cell inside the board', () => {
    const b = boardWith({ purple: [[7, 3], [7, 4], [7, 5]], green: [[7, 6]] });
    expect(winningLine(b, 'purple', 7, 7)).toBeNull();
    expect(winningLine(b, 'purple', 7, 6)).toBeNull();
    expect(winningLine(b, 'purple', SIZE, 0)).toBeNull();
  });
  it('rejects a cell used twice', () => {
    expect(() => boardWith({ purple: [[1, 1]], green: [[1, 1]] })).toThrow();
  });
});

describe('the heart of puzzles', () => {
  it('builds one puzzle per heart point, in order', () => {
    expect(PUZZLES.length).toBe(HEART.length);
    PUZZLES.forEach((p, i) => expect(p.answer).toEqual(HEART[i]));
  });
  it('each has exactly one winning point for the mover, the heart point', () => {
    for (const p of PUZZLES) expect(winningCells(boardWith({ purple: p.mover, green: p.other }), 'purple'), p.id).toEqual([p.answer]);
  });
  it('never puts a stone on another heart point, so the gold stones collected so far never collide', () => {
    for (const p of PUZZLES) for (const [r, c] of [...p.mover, ...p.other]) expect(HEART.some(([hr, hc]) => hr === r && hc === c), `${p.id} ${r},${c}`).toBe(false);
  });
});
