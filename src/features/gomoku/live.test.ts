import { describe, expect, it } from 'vitest';
import { restoreSolved } from './gomoku';
import { PUZZLES } from './puzzles';

describe('gomoku: puzzles solved so far, from the tab', () => {
  const n = PUZZLES.length;
  it('starts at the first puzzle when nothing is remembered', () => { expect(restoreSolved(null, n, false)).toBe(0); });
  it('picks up where it left off', () => { expect(restoreSolved(4, n, false)).toBe(4); });
  it('never lands past the last puzzle unless the level is cleared', () => {
    expect(restoreSolved(n, n, false)).toBe(n - 1);
    expect(restoreSolved(99, n, false)).toBe(n - 1);
    expect(restoreSolved(0, n, true)).toBe(n);
  });
  it('ignores junk', () => { expect(restoreSolved('3', n, false)).toBe(0); expect(restoreSolved(-2, n, false)).toBe(0); expect(restoreSolved(1.5, n, false)).toBe(0); });
});
