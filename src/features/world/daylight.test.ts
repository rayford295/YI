import { describe, expect, it } from 'vitest';
import { phaseAt, tintFor } from './daylight';

describe('daylight', () => {
  it('splits the day into dawn, day, dusk and night', () => {
    expect(phaseAt(6)).toBe('dawn');
    expect(phaseAt(12)).toBe('day');
    expect(phaseAt(18)).toBe('dusk');
    expect(phaseAt(23)).toBe('night');
    expect(phaseAt(3)).toBe('night');
  });
  it('paints nothing by day and lights the windows otherwise', () => {
    expect(tintFor('day')).toBeUndefined();
    for (const p of ['dawn', 'dusk', 'night'] as const) {
      const t = tintFor(p)!;
      expect(t.lights).toBe(true);
      expect(t.alpha).toBeGreaterThan(0); expect(t.alpha).toBeLessThan(0.6);
    }
  });
});
