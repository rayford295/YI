import { describe, expect, it } from 'vitest';
import { BUILDINGS, HEIGHT, PARTNER, SPAWN, TOWN, WIDTH, guardSpot, levelIds, reachable, tileAt, walkable } from './town';

describe('town', () => {
  it('is a rectangle of known tiles', () => {
    for (const row of TOWN) {
      expect(row.length).toBe(WIDTH);
      expect(row).toMatch(/^[.,#~TRWDO]+$/);
    }
    expect(HEIGHT).toBe(TOWN.length);
  });

  it('has exactly one building per level, each with a door tile on the grid', () => {
    const ids = levelIds();
    expect(BUILDINGS.map((b) => b.level).sort()).toEqual([...ids].sort());
    for (const b of BUILDINGS) expect(tileAt(b.door.x, b.door.y)).toBe('D');
  });

  it('lets the player walk from the spawn to every door, and the guards stand on ground', () => {
    const seen = reachable(SPAWN);
    for (const b of BUILDINGS) {
      expect(seen.has(`${b.door.x},${b.door.y}`), `door of ${b.level}`).toBe(true);
      const g = guardSpot(b);
      expect(walkable(g.x, g.y), `guard spot of ${b.level}`).toBe(true);
    }
    expect(walkable(SPAWN.x, SPAWN.y)).toBe(true);
    expect(walkable(PARTNER.x, PARTNER.y)).toBe(true);
  });

  it('keeps a locked door shut', () => {
    const b = BUILDINGS[0];
    expect(walkable(b.door.x, b.door.y, () => false)).toBe(false);
    expect(walkable(b.door.x, b.door.y, (id) => id === b.level)).toBe(true);
    expect(walkable(-1, 0)).toBe(false);
  });
});
