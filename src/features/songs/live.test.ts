import { describe, expect, it } from 'vitest';
import { restoreSongs } from './songs';
import { SONGS } from './list';

const ids = SONGS.map((s) => s.id);
describe('songs: the visit, from the tab', () => {
  it('reshuffles when nothing is remembered', () => {
    const r = restoreSongs(null, SONGS, false, () => 0.5);
    expect(r.order.map((s) => s.id).sort()).toEqual([...ids].sort());
    expect(r.i).toBe(0); expect(r.answered.size).toBe(0); expect(r.heard.size).toBe(0);
  });
  it('keeps the saved order, place, answers and passages heard', () => {
    const order = [...ids].reverse();
    const r = restoreSongs({ order, i: 2, answered: [ids[0], 'nope'], heard: [ids[0], ids[1]] }, SONGS, false);
    expect(r.order.map((s) => s.id)).toEqual(order);
    expect(r.i).toBe(2);
    expect([...r.answered]).toEqual([ids[0]]);
    expect([...r.heard]).toEqual([ids[0], ids[1]]);
  });
  it('reshuffles when the saved order is not a permutation of the songs', () => {
    const r = restoreSongs({ order: [ids[0], ids[0]], i: 1 }, SONGS, false);
    expect(r.order.length).toBe(ids.length);
    expect(new Set(r.order.map((s) => s.id)).size).toBe(ids.length);
  });
  it('shows everything once the level is cleared', () => {
    const r = restoreSongs(null, SONGS, true);
    expect(r.order.map((s) => s.id)).toEqual(ids);
    expect(r.answered.size).toBe(ids.length);
  });
});
