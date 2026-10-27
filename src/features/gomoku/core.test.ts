import { describe, expect, it } from 'vitest';
import { boardWith, winningCells, winningLine, SIZE } from './core';
import { PUZZLES } from './puzzles';

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

describe('puzzles', () => {
  it('each has exactly one winning point for the mover', () => {
    for (const p of PUZZLES) expect(winningCells(boardWith({ purple: p.mover, green: p.other }), 'purple'), p.id).toEqual([p.answer]);
  });
  it('the third is urgent: the other side wins next move unless the mover wins now', () => {
    expect(winningCells(boardWith({ purple: PUZZLES[2].mover, green: PUZZLES[2].other }), 'green').length).toBeGreaterThan(0);
  });
  it('is a position the mover could really be in (equal stones, or one fewer)', () => {
    for (const p of PUZZLES) expect(p.other.length - p.mover.length, p.id).toBeGreaterThanOrEqual(0);
  });
});
