import { describe, expect, it } from 'vitest';
import { POEMS, bank, blank, chars, solved } from './lines';

describe('poems', () => {
  it('keeps every answer inside its own lines, with both captions', () => {
    for (const p of POEMS) {
      expect(() => blank(p)).not.toThrow();
      expect(p.source.zh).not.toBe('');
      expect(p.source.en).not.toBe('');
      expect(p.gloss.en).not.toBe('');
    }
    expect(new Set(POEMS.map((p) => p.id)).size).toBe(POEMS.length);
  });
  it('finds where the blank starts', () => {
    expect(blank(POEMS[0])).toEqual({ line: 0, at: 6 });
    expect(blank(POEMS[1])).toEqual({ line: 4, at: 6 });
  });
  it('offers every needed character plus decoys that are not in the answer', () => {
    for (const p of POEMS) {
      const b = bank(p, 3, () => 0.5);
      expect(b.length).toBe(chars(p.answer).length + 3);
      for (const c of chars(p.answer)) expect(b).toContain(c);
      const decoys = b.filter((c) => !chars(p.answer).includes(c));
      expect(decoys.length).toBe(3);
    }
  });
  it('accepts only the exact answer', () => {
    expect(solved(POEMS[0], chars('恩爱两不疑'))).toBe(true);
    expect(solved(POEMS[0], chars('恩爱两不'))).toBe(false);
    expect(solved(POEMS[0], chars('恩爱不两疑'))).toBe(false);
  });
});
