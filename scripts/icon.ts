// Draws public/favicon.svg (the tab icon) from the same sprite strings as the town and the README
// banner: the two of us on a strip of grass in a navy frame. Run: npm run icon. The PNG icons
// (icon-192/512, the maskable one, apple-touch-icon) are rasterised from it by scripts/icon-png.py.
import { writeFileSync } from 'node:fs';
import { JINGYI, YIFAN, type Figure, type Palette } from '../src/features/world/sprites.ts';

const S = 64, PX = 2;
const NAVY = '#0b2036', GOLD = '#d3a557';

function pixels(rows: readonly string[], palette: Palette, x0: number, y0: number): string {
  const out: string[] = [];
  rows.forEach((row, j) => {
    const cells = [...row];
    for (let i = 0; i < cells.length;) {
      const c = palette[cells[i]];
      if (!c) { i++; continue; }
      let k = i; while (k < cells.length && cells[k] === cells[i]) k++;
      out.push(`<rect x="${x0 + i * PX}" y="${y0 + j * PX}" width="${(k - i) * PX}" height="${PX}" fill="${c}"/>`);
      i = k;
    }
  });
  return out.join('');
}
const figure = (f: Figure, x: number, y: number) => pixels([...f.body.down, ...f.legs.front[0]], f.palette, x, y);

const gy = S - 12;
const grass = Array.from({ length: S / 4 }, (_, i) => `<rect x="${i * 4}" y="${gy}" width="4" height="12" fill="${i % 3 === 0 ? '#6fb256' : '#79bd5e'}"/>`).join('')
  + `<rect x="0" y="${gy - 2}" width="${S}" height="2" fill="#4e8a3f"/>`;
const stars = [[8, 8], [52, 6], [30, 12], [56, 20]].map(([x, y], i) => `<rect x="${x}" y="${y}" width="2" height="2" fill="${GOLD}" opacity="${0.5 + i * 0.12}"/>`).join('');
const base = gy - 16 * PX + 2;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}" shape-rendering="crispEdges">
  <clipPath id="f"><rect width="${S}" height="${S}" rx="12"/></clipPath>
  <rect width="${S}" height="${S}" rx="12" fill="${NAVY}"/>
  <g clip-path="url(#f)">${stars}${grass}${figure(JINGYI, 9, base)}${figure(YIFAN, 31, base)}</g>
  <rect x="1.5" y="1.5" width="${S - 3}" height="${S - 3}" rx="11" fill="none" stroke="${GOLD}" stroke-width="3"/>
</svg>
`;
writeFileSync('public/favicon.svg', svg);
console.log('wrote public/favicon.svg');
