import { describe, expect, it } from 'vitest';
import { SONGS, choices, songSrc } from './list';
import { shuffle } from '../../core/random';

describe('songs', () => {
  it('lists six songs with distinct ids and titles under media/music', () => {
    expect(SONGS.length).toBe(6);
    expect(new Set(SONGS.map((s) => s.id)).size).toBe(6);
    expect(new Set(SONGS.map((s) => s.title)).size).toBe(6);
    for (const s of SONGS) { expect(songSrc(s)).toBe(`media/music/${s.id}.mp3`); expect(s.length).toBeGreaterThan(0); }
  });
  it('offers four titles including the right one, no repeats', () => {
    for (const s of SONGS) {
      const c = choices(s, SONGS, 4, () => 0.3);
      expect(c.length).toBe(4);
      expect(c).toContain(s);
      expect(new Set(c.map((x) => x.id)).size).toBe(4);
    }
  });
  it('shuffles a copy, keeping every element', () => {
    const xs = [1, 2, 3, 4, 5];
    const out = shuffle(xs, () => 0.5);
    expect(out).not.toBe(xs);
    expect([...out].sort()).toEqual(xs);
  });
});
