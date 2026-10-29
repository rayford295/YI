import { describe, expect, it } from 'vitest';
import { TRACKS, nextIndex } from './tracks';

describe('jukebox', () => {
  it('lists every song that has a YouTube id, with a title', () => {
    expect(TRACKS.length).toBeGreaterThan(0);
    for (const tr of TRACKS) { expect(tr.yt).toMatch(/^[\w-]{11}$/); expect(tr.title).not.toBe(''); }
  });
  it('wraps around the playlist', () => {
    expect(nextIndex(0, 3)).toBe(1); expect(nextIndex(2, 3)).toBe(0); expect(nextIndex(0, 1)).toBe(0); expect(nextIndex(5, 0)).toBe(0);
  });
});
