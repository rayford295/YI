import { describe, expect, it } from 'vitest';
import { HEART_PLACES, choices } from './places';

describe('heart places', () => {
  it('lists six places with distinct ids and names, each photo under media/places with a credit', () => {
    expect(HEART_PLACES.length).toBe(6);
    expect(new Set(HEART_PLACES.map((p) => p.id)).size).toBe(6);
    expect(new Set(HEART_PLACES.map((p) => p.name.zh)).size).toBe(6);
    for (const p of HEART_PLACES) {
      expect(p.photo.src).toBe(`media/places/${p.id}.jpg`);
      expect(p.photo.author).not.toBe('');
      expect(p.photo.licence).toMatch(/^CC BY/);
      expect(Math.abs(p.lat)).toBeLessThan(90);
      expect(p.why.en).not.toBe('');
    }
  });
  it('offers four distinct names including the right one', () => {
    for (const p of HEART_PLACES) {
      const c = choices(p, HEART_PLACES, 4, () => 0.4);
      expect(c.length).toBe(4);
      expect(c).toContain(p);
      expect(new Set(c.map((x) => x.id)).size).toBe(4);
    }
  });
});
