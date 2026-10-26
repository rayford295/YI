import { describe, expect, it } from 'vitest';
import { scramble, solved } from './puzzle';

describe('puzzle', () => {
  it('never starts solved, even when the shuffle returns identity', () => {
    const identity = <T>(a: readonly T[]) => [...a];
    expect(solved(scramble(9, identity))).toBe(false);
    expect([...scramble(9, identity)].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  });
  it('recognises the solved order', () => {
    expect(solved([0, 1, 2, 3])).toBe(true);
    expect(solved([1, 0, 2, 3])).toBe(false);
  });
});
