import { describe, expect, it } from 'vitest';
import { WORDS } from './words';
import { normalizeGuess } from './core';

describe('word bank', () => {
  it('has unique ids and both languages filled in', () => {
    expect(new Set(WORDS.map((w) => w.id)).size).toBe(WORDS.length);
    for (const w of WORDS) {
      expect(w.zh.trim(), w.id).not.toBe('');
      expect(w.en.trim(), w.id).not.toBe('');
    }
  });

  it('no answer belongs to two different words', () => {
    const owner = new Map<string, string>();
    for (const w of WORDS)
      for (const a of [w.zh, w.en, ...(w.alt ?? [])]) {
        const key = normalizeGuess(a);
        expect(key, `${a} in ${w.id}`).not.toBe('');
        if (owner.has(key)) expect(owner.get(key), `"${a}" is shared`).toBe(w.id);
        owner.set(key, w.id);
      }
  });
});
