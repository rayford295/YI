import { describe, expect, it } from 'vitest';
import { ALL_EDGES, ALL_STARS, CONSTELLATIONS, edgeKey, isEdge, project } from './constellations';

describe('constellations', () => {
  it('has distinct star ids and every edge joins two listed stars of the same figure', () => {
    expect(new Set(ALL_STARS.map((s) => s.id)).size).toBe(ALL_STARS.length);
    for (const c of CONSTELLATIONS) {
      const ids = new Set(c.stars.map((s) => s.id));
      for (const [a, b] of c.edges) { expect(ids.has(a), a).toBe(true); expect(ids.has(b), b).toBe(true); expect(a).not.toBe(b); }
    }
    expect(new Set(ALL_EDGES.map((e) => edgeKey(e[0], e[1]))).size).toBe(ALL_EDGES.length);
  });
  it('draws each figure in one piece', () => {
    for (const c of CONSTELLATIONS) {
      const seen = new Set([c.stars[0].id]);
      let grew = true;
      while (grew) { grew = false; for (const [a, b] of c.edges) { if (seen.has(a) !== seen.has(b)) { seen.add(a); seen.add(b); grew = true; } } }
      expect(seen.size, c.id).toBe(c.stars.length);
    }
  });
  it('answers an edge in either order and nothing else', () => {
    expect(isEdge('lib-a', 'lib-b')).toBe(true);
    expect(isEdge('lib-b', 'lib-a')).toBe(true);
    expect(isEdge('lib-a', 'sco-a')).toBe(false);
  });
  it('keeps every star inside the chart, Antares south-east of the claws', () => {
    for (const s of ALL_STARS) { const p = project(s); expect(p.x).toBeGreaterThan(20); expect(p.x).toBeLessThan(980); expect(p.y).toBeGreaterThan(20); expect(p.y).toBeLessThan(980); }
    const claw = project(ALL_STARS.find((s) => s.id === 'lib-a')!), heart = project(ALL_STARS.find((s) => s.id === 'sco-a')!);
    expect(heart.x).toBeLessThan(claw.x);
    expect(heart.y).toBeGreaterThan(claw.y);
  });
});
