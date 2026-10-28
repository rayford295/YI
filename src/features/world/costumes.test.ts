import { describe, expect, it } from 'vitest';
import { JINGYI, JINGYI_BRIDE, JINGYI_CROWN, RAYFORD, YIFAN, YIFAN_CHEF, YIFAN_GROOM, type Figure } from './sprites';

const figures: Record<string, Figure> = { JINGYI, YIFAN, RAYFORD, YIFAN_CHEF, JINGYI_CROWN, JINGYI_BRIDE, YIFAN_GROOM };

describe('costumes', () => {
  for (const [name, f] of Object.entries(figures)) {
    it(`${name}: 12 rows of 12 per facing, 4-row legs, every pixel in the palette`, () => {
      for (const rows of [f.body.down, f.body.up, f.body.side]) {
        expect(rows).toHaveLength(12);
        for (const r of rows) expect(r).toHaveLength(12);
      }
      for (const frame of [...f.legs.front, ...f.legs.side]) {
        expect(frame).toHaveLength(4);
        for (const r of frame) expect(r).toHaveLength(12);
      }
      const used = new Set([f.body.down, f.body.up, f.body.side, ...f.legs.front, ...f.legs.side].flat().join(''));
      for (const ch of used) if (ch !== '.') expect(f.palette, `${name} '${ch}'`).toHaveProperty(ch);
    });
  }
});
