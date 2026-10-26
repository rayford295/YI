import { describe, expect, it } from 'vitest';
import { BUILDINGS, CAT_HOMES, HEIGHT, PARTNER, SIGNPOST, SPAWN, TOWN, WIDTH, guardSpot, levelIds, reachable, tileAt, walkable } from './town';

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

  it('gives each cat a resting spot on the ground that is nobody else\'s', () => {
    const taken = new Set([SPAWN, PARTNER, SIGNPOST].map((q) => `${q.x},${q.y}`));
    expect(walkable(SIGNPOST.x, SIGNPOST.y)).toBe(true);
    for (const home of Object.values(CAT_HOMES)) {
      expect(walkable(home.x, home.y)).toBe(true);
      expect(taken.has(`${home.x},${home.y}`)).toBe(false);
      taken.add(`${home.x},${home.y}`);
    }
  });

  it('keeps a locked door shut', () => {
    const b = BUILDINGS[0];
    expect(walkable(b.door.x, b.door.y, () => false)).toBe(false);
    expect(walkable(b.door.x, b.door.y, (id) => id === b.level)).toBe(true);
    expect(walkable(-1, 0)).toBe(false);
  });
});
