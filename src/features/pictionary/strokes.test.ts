import { describe, expect, it } from 'vitest';
import { toUnit } from './strokes';

describe('toUnit', () => {
  const rect = { left: 100, top: 50, width: 400, height: 300 };
  it('maps client pixels into 0..1 of the canvas', () => {
    expect(toUnit(300, 200, rect)).toEqual([0.5, 0.5]);
    expect(toUnit(100, 50, rect)).toEqual([0, 0]);
  });
  it('clamps points dragged outside the canvas', () => {
    expect(toUnit(0, 999, rect)).toEqual([0, 1]);
  });
  it('survives a collapsed canvas', () => {
    expect(toUnit(10, 10, { left: 0, top: 0, width: 0, height: 0 })).toEqual([0, 0]);
  });
});
