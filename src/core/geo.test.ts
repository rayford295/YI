import { describe, it, expect } from 'vitest';
import { greatCircle, pacificLng, pointAlong } from './geo';

const SZ: [number, number] = [22.5431, 114.0579];
const CS: [number, number] = [30.628, pacificLng(-96.3344)];

describe('pacificLng', () => {
  it('moves the Americas east of the date line and keeps Asia', () => {
    expect(pacificLng(-96.3344)).toBeCloseTo(263.6656);
    expect(pacificLng(114)).toBe(114);
  });
});

describe('greatCircle', () => {
  const pts = greatCircle(SZ, CS, 96);
  it('starts and ends at the endpoints', () => {
    expect(pts[0][0]).toBeCloseTo(SZ[0]);
    expect(pts[0][1]).toBeCloseTo(SZ[1]);
    expect(pts.at(-1)![0]).toBeCloseTo(CS[0]);
    expect(pts.at(-1)![1]).toBeCloseTo(CS[1]);
  });
  it('is continuous across the antimeridian', () => {
    for (let i = 1; i < pts.length; i++) expect(Math.abs(pts[i][1] - pts[i - 1][1])).toBeLessThan(10);
  });
  it('bows north over the Pacific', () => {
    expect(Math.max(...pts.map((p) => p[0]))).toBeGreaterThan(45);
  });
});

describe('pointAlong', () => {
  const line: [number, number][] = [[0, 0], [0, 10], [0, 20]];
  it('interpolates by fraction of the whole line', () => {
    expect(pointAlong(line, 0.25)).toEqual([0, 5]);
    expect(pointAlong(line, 0.75)).toEqual([0, 15]);
  });
  it('wraps progress outside [0, 1) instead of reading past the ends', () => {
    expect(pointAlong(line, -0.25)).toEqual([0, 15]);
    expect(pointAlong(line, 1.25)).toEqual([0, 5]);
  });
});
