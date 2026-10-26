import { beforeEach, describe, expect, it } from 'vitest';
import { LEVELS, getProgress, mergeProgress, useStore } from './quest';
import { decodeProgress, encodeProgress, codeFrom, importProgress } from './sync';

const mem = () => { const m = new Map<string, string>(); return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => { m.set(k, v); }, removeItem: (k: string) => { m.delete(k); } }; };

describe('progress codes', () => {
  beforeEach(() => useStore(mem()));
  it('round-trips a player and their cleared levels', () => {
    const cleared = LEVELS.slice(0, 3).map((l) => l.id);
    const code = encodeProgress('jingyi', cleared);
    expect(code).toMatch(/^J[0-9A-Z]+$/);
    expect(decodeProgress(code)).toEqual({ player: 'jingyi', cleared });
    expect(decodeProgress(encodeProgress('yifan', []))).toEqual({ player: 'yifan', cleared: [] });
  });
  it('rejects a wrong check character, a stranger and garbage', () => {
    const code = encodeProgress('yifan', LEVELS.map((l) => l.id));
    const wrong = code.slice(0, -1) + (code.endsWith('A') ? 'B' : 'A');
    expect(decodeProgress(wrong)).toBeNull();
    expect(decodeProgress('X1Z')).toBeNull();
    expect(decodeProgress('')).toBeNull();
  });
  it('reads a code out of a link, with any case and spacing', () => {
    const code = encodeProgress('jingyi', [LEVELS[0].id]);
    expect(codeFrom(`https://jingyifan.love/#/sync?c=${code}`)).toBe(code);
    expect(decodeProgress(` ${code.toLowerCase()} `)?.player).toBe('jingyi');
  });
  it('merges as a union and never removes progress', () => {
    mergeProgress('yifan', [LEVELS[0].id, LEVELS[1].id]);
    importProgress(encodeProgress('yifan', [LEVELS[0].id]));
    expect(getProgress('yifan').cleared).toEqual([LEVELS[0].id, LEVELS[1].id]);
    importProgress(encodeProgress('yifan', LEVELS.slice(0, 4).map((l) => l.id)));
    expect(getProgress('yifan').cleared.length).toBe(4);
    expect(importProgress('nonsense')).toBeNull();
  });
});
