import { describe, expect, it } from 'vitest';
import { faced, findPath, step, type Mover } from './engine';

describe('engine rules', () => {
  const open = () => true;
  const wall = (x: number) => x < 5;

  it('moves one tile and faces the way it went', () => {
    const r = step({ x: 2, y: 2, dir: 'down' }, 'right', open);
    expect(r).toEqual({ mover: { x: 3, y: 2, dir: 'right' }, moved: true });
  });

  it('only turns when the way is blocked', () => {
    const m: Mover = { x: 4, y: 2, dir: 'down' };
    const r = step(m, 'right', wall);
    expect(r.moved).toBe(false);
    expect(r.mover).toEqual({ x: 4, y: 2, dir: 'right' });
  });

  it('faces the tile in front', () => {
    expect(faced({ x: 4, y: 4, dir: 'up' })).toEqual({ x: 4, y: 3 });
    expect(faced({ x: 4, y: 4, dir: 'left' })).toEqual({ x: 3, y: 4 });
  });
});

describe('findPath', () => {
  // A 5×3 room with a wall in the middle column except the bottom row.
  const free = (x: number, y: number) => x >= 0 && x < 5 && y >= 0 && y < 3 && !(x === 2 && y < 2);
  it('finds the shortest way round an obstacle', () => {
    const path = findPath({ x: 0, y: 0 }, [{ x: 4, y: 0 }], free)!;
    expect(path.length).toBe(8);
    expect(path[path.length - 1]).toEqual({ x: 4, y: 0 });
    expect(path.some((q) => q.x === 2 && q.y === 2)).toBe(true);
  });
  it('returns nothing when the goal is walled off', () => {
    expect(findPath({ x: 0, y: 0 }, [{ x: 4, y: 0 }], (x, y) => free(x, y) && x !== 2)).toBeUndefined();
  });
  it('is empty when already standing on the goal', () => {
    expect(findPath({ x: 1, y: 1 }, [{ x: 1, y: 1 }], free)).toEqual([]);
  });
});
