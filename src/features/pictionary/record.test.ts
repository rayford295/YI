import { describe, expect, it } from 'vitest';
import { loadTally, saveTally } from './record';

const memory = () => {
  const data = new Map<string, string>();
  return { data, getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k, v) };
};

describe('pictionary tally', () => {
  it('starts at zero and round-trips', () => {
    const s = memory();
    expect(loadTally(s)).toEqual({ score: 0, best: 0 });
    saveTally(s, { score: 7, best: 3 });
    expect(loadTally(s)).toEqual({ score: 7, best: 3 });
  });
  it('survives blocked storage and junk', () => {
    const broken = { getItem: () => { throw new Error('x'); }, setItem: () => { throw new Error('x'); } };
    expect(loadTally(broken)).toEqual({ score: 0, best: 0 });
    expect(() => saveTally(broken, { score: 1, best: 1 })).not.toThrow();
    const s = memory();
    s.data.set('yi.pictionary', '{"score":-2,"best":"a"}');
    expect(loadTally(s)).toEqual({ score: 0, best: 0 });
  });
});
