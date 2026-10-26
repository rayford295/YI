import { describe, expect, it } from 'vitest';
import { CS } from './cs';
import { SZ } from './sz';
import { stopAt } from './day';
import { reachable, tileAt, walkable } from '../world/town';

describe.each([CS, SZ])('a day ($id)', (day) => {
  it('is a rectangle of known tiles', () => {
    for (const row of day.grid) { expect(row.length).toBe(day.grid[0].length); expect(row).toMatch(/^[.,#~TORWD=C]+$/); }
  });
  it('gives every stop a door tile on the grid, reachable from the spawn', () => {
    const seen = reachable(day.spawn, undefined, day.map);
    for (const s of day.stops) {
      expect(tileAt(s.door.x, s.door.y, day.map), s.level).toBe('D');
      expect(seen.has(`${s.door.x},${s.door.y}`), `door of ${s.level}`).toBe(true);
      expect(walkable(s.door.x, s.door.y + 1, undefined, day.map), `in front of ${s.level}`).toBe(true);
    }
    expect(walkable(day.spawn.x, day.spawn.y, undefined, day.map)).toBe(true);
    for (const c of day.cats ?? []) expect(walkable(c.at.x, c.at.y, undefined, day.map), `cat ${c.id}`).toBe(true);
  });
  it('numbers the stops in the order of the day', () => {
    expect(day.stops.map((s) => s.number)).toEqual(day.stops.map((_, i) => i + 1));
  });
  it('knows where they are at every minute of the day', () => {
    for (let m = 0; m < 24 * 60; m += 7) expect(stopAt(day, m / 60)).toBeDefined();
    expect(stopAt(day, 7).level).toBe('home');
    expect(stopAt(day, 10.5).level).toBe('office');
    expect(stopAt(day, 12.25).level).toBe('lunch');
    expect(stopAt(day, 22).level).toBe('home');
    expect(stopAt(day, -1).level).toBe('home');
  });
});

it('keeps Yifan at the court at six and Jingyi by the bay after work', () => {
  expect(stopAt(CS, 18).level).toBe('gym');
  expect(stopAt(SZ, 19.5).level).toBe('bay');
  expect(SZ.cats?.map((c) => c.id)).toEqual(['coffee', 'duoduo']);
});
