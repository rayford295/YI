import { describe, expect, it } from 'vitest';
import { restoreDrawn } from './stars';
import { ALL_EDGES, edgeKey } from './constellations';

describe('stars: lines drawn so far, from the tab', () => {
  const k = edgeKey(ALL_EDGES[0][0], ALL_EDGES[0][1]);
  it('keeps only edges that are ours', () => { expect([...restoreDrawn([k, 'x|y', 7], false)]).toEqual([k]); });
  it('is empty when nothing is remembered and full when the level is cleared', () => {
    expect(restoreDrawn(undefined, false).size).toBe(0);
    expect(restoreDrawn(null, true).size).toBe(ALL_EDGES.length);
  });
});
