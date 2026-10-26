// Draws docs/banner.svg for the README from the same sprite strings the town uses, so the banner
// is never out of step with the game. Run: npm run banner (Node 22 strips the types itself).
import { writeFileSync } from 'node:fs';
import { COFFEE, DUODUO, JINGYI, YIFAN, type Figure, type Palette } from '../src/features/world/sprites.ts';

const W = 1200, H = 320, PX = 8;
const NAVY = '#0b2036', GOLD = '#d3a557', CREAM = '#f1e4c8';

/** Pixel rows → SVG rects, merging runs of the same colour on a row to keep the file small. */
function pixels(rows: readonly string[], palette: Palette, x0: number, y0: number, flip = false): string {
  const out: string[] = [];
  rows.forEach((row, j) => {
    const cells = flip ? [...row].reverse() : [...row];
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
const figure = (f: Figure, x: number, y: number, side = false, flip = false) =>
  pixels(side ? [...f.body.side, ...f.legs.side[0]] : [...f.body.down, ...f.legs.front[0]], f.palette, x, y, flip);

// Ground: a band of grass with a path through the middle, drawn tile by tile like the town.
const ground: string[] = [];
const gy = H - 56;
for (let x = 0; x < W; x += 16) {
  ground.push(`<rect x="${x}" y="${gy}" width="16" height="56" fill="${(x / 16) % 3 === 0 ? '#6fb256' : '#79bd5e'}"/>`);
  if ((x / 16) % 4 === 1) ground.push(`<rect x="${x + 4}" y="${gy + 20 + ((x / 16) % 5) * 6}" width="4" height="2" fill="#9ad67c"/>`);
}
ground.push(`<rect x="0" y="${gy - 4}" width="${W}" height="4" fill="#4e8a3f"/>`);

// The cast, on the ground: Duoduo, Jingyi, Yifan, Coffee.
const base = gy - 16 * PX + 8;
const cast = [
  figure(JINGYI, 150, base),
  figure(YIFAN, 270, base),
  pixels(COFFEE.frames[0], COFFEE.palette, 40, base),
  pixels(DUODUO.frames[0], DUODUO.palette, 380, base),
];

// A few gold stars in the sky.
const stars = [[560, 60], [700, 110], [860, 40], [1040, 90], [1130, 150], [640, 170], [980, 190]]
  .map(([x, y], i) => `<rect x="${x}" y="${y}" width="${i % 3 === 0 ? 4 : 3}" height="${i % 3 === 0 ? 4 : 3}" fill="${GOLD}" opacity="${0.5 + (i % 4) * 0.12}"/>`);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" shape-rendering="crispEdges">
  <rect width="${W}" height="${H}" rx="24" fill="${NAVY}"/>
  <clipPath id="frame"><rect width="${W}" height="${H}" rx="24"/></clipPath>
  <g clip-path="url(#frame)">
    ${stars.join('')}
    ${ground.join('')}
    ${cast.join('')}
  </g>
  <rect x="3" y="3" width="${W - 6}" height="${H - 6}" rx="22" fill="none" stroke="${GOLD}" stroke-width="4"/>
  <g font-family="'Songti SC','Noto Serif CJK SC','Source Han Serif SC','PingFang SC',serif">
    <text x="560" y="128" font-size="84" fill="${CREAM}" letter-spacing="10">仪见钟情</text>
  </g>
  <g font-family="ui-monospace,Menlo,Consolas,'Courier New',monospace" fill="${GOLD}">
    <text x="564" y="172" font-size="22" letter-spacing="8">YI AT FIRST SIGHT</text>
    <text x="564" y="212" font-size="16" letter-spacing="4" fill="${CREAM}" opacity="0.85">A GAME OF LEVELS FOR TWO · 中文 / EN</text>
  </g>
  <g transform="translate(564 236)">
    <rect width="96" height="26" rx="6" fill="${GOLD}"/>
    <text x="48" y="18" text-anchor="middle" font-family="ui-monospace,Menlo,monospace" font-size="13" font-weight="700" fill="${NAVY}">PRESS A</text>
  </g>
</svg>
`;
writeFileSync('docs/banner.svg', svg);
console.log('wrote docs/banner.svg', svg.length, 'bytes');
