import { describe, expect, it } from 'vitest';
import { BUILDINGS, CAT_HOMES, HEIGHT, MAILBOX, PARTNER, RAYFORD_SPOT, SIGNPOST, SIGNPOST_WEST, SPAWN, TOWN, WIDTH, guardSpot, levelIds, reachable, tileAt, walkable } from './town';

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
    const taken = new Set([SPAWN, PARTNER, SIGNPOST, SIGNPOST_WEST, MAILBOX, RAYFORD_SPOT].map((q) => `${q.x},${q.y}`));
    expect(walkable(SIGNPOST.x, SIGNPOST.y)).toBe(true);
    expect(walkable(SIGNPOST_WEST.x, SIGNPOST_WEST.y)).toBe(true);
    expect(walkable(MAILBOX.x, MAILBOX.y)).toBe(true);
    for (const home of Object.values(CAT_HOMES)) {
      expect(walkable(home.x, home.y)).toBe(true);
      expect(taken.has(`${home.x},${home.y}`)).toBe(false);
      taken.add(`${home.x},${home.y}`);
    }
  });

  it('puts Rayford on free ground without cutting any door off from the spawn', () => {
    expect(walkable(RAYFORD_SPOT.x, RAYFORD_SPOT.y)).toBe(true);
    const others = [SPAWN, PARTNER, SIGNPOST, SIGNPOST_WEST, MAILBOX, ...Object.values(CAT_HOMES)];
    expect(others.some((q) => q.x === RAYFORD_SPOT.x && q.y === RAYFORD_SPOT.y)).toBe(false);
    // Flood fill with Rayford's tile solid: every door must still be reachable.
    const solid = `${RAYFORD_SPOT.x},${RAYFORD_SPOT.y}`;
    const seen = new Set([`${SPAWN.x},${SPAWN.y}`]); const queue = [SPAWN];
    while (queue.length) {
      const q = queue.shift()!;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const n = { x: q.x + dx, y: q.y + dy }, k = `${n.x},${n.y}`;
        if (k !== solid && !seen.has(k) && walkable(n.x, n.y)) { seen.add(k); queue.push(n); }
      }
    }
    for (const b of BUILDINGS) expect(seen.has(`${b.door.x},${b.door.y}`), b.level).toBe(true);
  });

  it('keeps a locked door shut', () => {
    const b = BUILDINGS[0];
    expect(walkable(b.door.x, b.door.y, () => false)).toBe(false);
    expect(walkable(b.door.x, b.door.y, (id) => id === b.level)).toBe(true);
    expect(walkable(-1, 0)).toBe(false);
  });
});
