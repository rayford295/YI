import { describe, expect, it } from 'vitest';
import { faced, step, type Mover } from './engine';

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
