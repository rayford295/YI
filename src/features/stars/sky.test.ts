import { describe, expect, it } from 'vitest';
import { computeSky, project } from './sky';

describe('sky', () => {
  it('puts the zenith at the centre and the horizon on the rim', () => {
    expect(project(90, 0)).toEqual({ x: -0, y: -0 });
    const n = project(0, 0); expect(n.y).toBeCloseTo(-1); expect(n.x).toBeCloseTo(0);
    const e = project(0, 90); expect(e.x).toBeCloseTo(-1);  // east on the left when looking up
  });
  it('has Vega high and Altair up over Shenzhen at 21:00 on the night we met', () => {
    const sky = computeSky(new Date('2026-09-20T21:00:00+08:00'), 22.5431, 114.0579);
    const vega = sky.points.find((p) => p.id === 'Vega')!;
    const altair = sky.points.find((p) => p.id === 'Altair')!;
    expect(vega.alt).toBeGreaterThan(60);
    expect(altair.alt).toBeGreaterThan(45);
    expect(sky.points.some((p) => p.id === 'Saturn')).toBe(true);
  });
  it('shows both stars over College Station the same evening', () => {
    const sky = computeSky(new Date('2026-09-20T21:00:00-05:00'), 30.628, -96.3344);
    expect(sky.points.find((p) => p.id === 'Vega')!.alt).toBeGreaterThan(50);
    expect(sky.points.find((p) => p.id === 'Altair')!.alt).toBeGreaterThan(40);
  });
});
