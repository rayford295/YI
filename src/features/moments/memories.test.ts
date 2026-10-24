import { describe, it, expect } from 'vitest';
import { readdirSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { memories, sortedMemories } from './memories';
import { config } from '../../core/config';

/** Exact-case existence check: macOS disks ignore case, web hosts do not. */
function existsExact(path: string): boolean {
  try {
    return readdirSync(dirname(path)).includes(basename(path));
  } catch {
    return false;
  }
}
const publicPath = (src: string) => join(process.cwd(), 'public', src);

describe('existsExact', () => {
  it('rejects a path whose letter case differs from the file on disk', () => {
    expect(existsExact(publicPath('media/moments/hearts.jpg'))).toBe(true);
    expect(existsExact(publicPath('media/moments/Hearts.jpg'))).toBe(false);
  });
});

describe('memories data', () => {
  it('has unique ids', () => {
    expect(new Set(memories.map((m) => m.id)).size).toBe(memories.length);
  });
  it.each(memories.map((m) => [m.id, m] as const))('%s is valid', (_id, m) => {
    expect(m.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(m.date >= config.metOn).toBe(true);
    expect(Math.abs(m.place.lat)).toBeLessThanOrEqual(90);
    expect(Math.abs(m.place.lng)).toBeLessThanOrEqual(180);
    for (const v of [m.title, m.text, m.place.name]) {
      expect(v.zh.trim()).not.toBe('');
      expect(v.en.trim()).not.toBe('');
    }
    for (const md of m.media) expect(existsExact(publicPath(md.src)), md.src).toBe(true);
  });
  it('sorts by date ascending without mutating the source', () => {
    const before = memories.map((m) => m.id);
    const dates = sortedMemories().map((m) => m.date);
    expect(dates).toEqual([...dates].sort());
    expect(memories.map((m) => m.id)).toEqual(before);
  });
});
