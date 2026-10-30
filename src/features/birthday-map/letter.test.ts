import { describe, it, expect } from 'vitest';
import { readdirSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { letter, letterParagraphs } from './letter';

/** Exact-case existence check: macOS disks ignore case, web hosts do not. */
function existsExact(path: string): boolean {
  try {
    return readdirSync(dirname(path)).includes(basename(path));
  } catch {
    return false;
  }
}

describe('the birthday letter', () => {
  it('ships the handwritten card the finale shows', () => {
    expect(existsExact(join(process.cwd(), 'public', 'media/letter/birthday-card.jpg'))).toBe(true);
  });
  it('is the written letter, not the draft: no unfilled placeholders, same shape in both languages', () => {
    for (const lang of ['zh', 'en'] as const) {
      const ps = letterParagraphs(lang, 12, 40);
      expect(ps).toHaveLength(letter.paragraphs[lang].length);
      expect(ps.join('')).not.toMatch(/\{[dh]\}/);
    }
    expect(letter.paragraphs.zh.length).toBe(letter.paragraphs.en.length);
    expect(letter.signature.zh).toContain('2026');
  });
});
