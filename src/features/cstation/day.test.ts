import { describe, expect, it } from 'vitest';
import { CS_GRID, CS_MAP, CS_SPAWN, STOPS, stopAt } from './day';
import { reachable, tileAt, walkable } from '../world/town';

describe('a day in College Station', () => {
  it('is a rectangle of known tiles', () => {
    for (const row of CS_GRID) { expect(row.length).toBe(CS_GRID[0].length); expect(row).toMatch(/^[.,#~TORWD=C]+$/); }
  });
  it('gives every stop a door tile on the grid, reachable from the spawn', () => {
    const seen = reachable(CS_SPAWN, undefined, CS_MAP);
    for (const s of STOPS) {
      expect(tileAt(s.door.x, s.door.y, CS_MAP), s.level).toBe('D');
      expect(seen.has(`${s.door.x},${s.door.y}`), `door of ${s.level}`).toBe(true);
      expect(walkable(s.door.x, s.door.y + 1, undefined, CS_MAP), `in front of ${s.level}`).toBe(true);
    }
    expect(walkable(CS_SPAWN.x, CS_SPAWN.y, undefined, CS_MAP)).toBe(true);
  });
  it('numbers the stops in the order of the day', () => {
    expect(STOPS.map((s) => s.number)).toEqual(STOPS.map((_, i) => i + 1));
  });
  it('knows where he is at every minute of the day', () => {
    for (let m = 0; m < 24 * 60; m += 7) expect(stopAt(m / 60)).toBeDefined();
    expect(stopAt(7).level).toBe('home');
    expect(stopAt(10.5).level).toBe('office');
    expect(stopAt(12.25).level).toBe('lunch');
    expect(stopAt(18).level).toBe('gym');
    expect(stopAt(22).level).toBe('home');
    expect(stopAt(-1).level).toBe('home');
  });
});
