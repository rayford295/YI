import { describe, expect, it } from 'vitest';
import { inkLength, inked, loadTattoo, saveTattoo, type Tattoo } from './store';

const mem = () => { const m = new Map<string, string>(); return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => { m.set(k, v); } }; };

describe('tattoo store', () => {
  it('round-trips a tattoo per player', () => {
    const s = mem();
    const t: Tattoo = { spot: 'arm', strokes: [{ color: '#000', size: 0.01, erase: false, points: [[0, 0], [1, 1]] }], inkedAt: '2026-10-26' };
    saveTattoo('yifan', t, s);
    expect(loadTattoo('yifan', s)).toEqual(t);
    expect(loadTattoo('jingyi', s)).toBeNull();
  });
  it('rejects junk', () => {
    const s = mem(); s.setItem('yi.tattoo.yifan', '{"spot":"leg"}');
    expect(loadTattoo('yifan', s)).toBeNull();
    s.setItem('yi.tattoo.yifan', 'not json');
    expect(loadTattoo('yifan', s)).toBeNull();
  });
  it('measures ink, ignoring erasing, and asks for about a canvas width of it', () => {
    const line = (n: number) => ({ color: '#000', size: 0.01, erase: false, points: Array.from({ length: n + 1 }, (_, i) => [i / n, 0] as [number, number]) });
    expect(inkLength([line(10)])).toBeCloseTo(1);
    expect(inkLength([{ ...line(10), erase: true }])).toBe(0);
    expect(inked([line(4)])).toBe(true);
    expect(inked([{ ...line(4), points: line(4).points.slice(0, 3) }])).toBe(false);
  });
});
