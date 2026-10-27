// Libra (Yifan, 25 September) and Scorpius (Jingyi, 31 October), neighbours in the sky: the two
// brightest stars of Libra are still named the Scorpion's claws (Zubenelgenubi, the southern claw;
// Zubeneschamali, the northern). J2000 positions (RA in hours, Dec in degrees) and magnitudes.
import type { L10n } from '../../core/i18n';

export interface Star { id: string; ra: number; dec: number; mag: number; name?: L10n }
export type Edge = [string, string];
export interface Constellation { id: 'libra' | 'scorpius'; name: L10n; stars: Star[]; edges: Edge[] }

export const CONSTELLATIONS: Constellation[] = [
  {
    id: 'libra',
    name: { zh: '天秤座', en: 'Libra' },
    stars: [
      { id: 'lib-a', ra: 14.848, dec: -16.04, mag: 2.75, name: { zh: '氐宿一 · 南螯', en: 'Zubenelgenubi, the southern claw' } },
      { id: 'lib-b', ra: 15.283, dec: -9.38, mag: 2.61, name: { zh: '氐宿四 · 北螯', en: 'Zubeneschamali, the northern claw' } },
      { id: 'lib-g', ra: 15.592, dec: -14.79, mag: 3.91 },
      { id: 'lib-s', ra: 15.068, dec: -25.28, mag: 3.29 },
      { id: 'lib-u', ra: 15.617, dec: -28.14, mag: 3.58 },
      { id: 'lib-t', ra: 15.645, dec: -29.78, mag: 3.66 },
    ],
    edges: [['lib-a', 'lib-b'], ['lib-b', 'lib-g'], ['lib-g', 'lib-a'], ['lib-a', 'lib-s'], ['lib-s', 'lib-u'], ['lib-u', 'lib-t']],
  },
  {
    id: 'scorpius',
    name: { zh: '天蝎座', en: 'Scorpius' },
    stars: [
      { id: 'sco-b', ra: 16.090, dec: -19.80, mag: 2.62 },
      { id: 'sco-d', ra: 16.005, dec: -22.62, mag: 2.29 },
      { id: 'sco-p', ra: 15.982, dec: -26.11, mag: 2.89 },
      { id: 'sco-r', ra: 15.948, dec: -29.21, mag: 3.87 },
      { id: 'sco-s', ra: 16.353, dec: -25.59, mag: 2.90 },
      { id: 'sco-a', ra: 16.490, dec: -26.43, mag: 1.06, name: { zh: '心宿二', en: 'Antares, the heart' } },
      { id: 'sco-t', ra: 16.598, dec: -28.22, mag: 2.82 },
      { id: 'sco-e', ra: 16.837, dec: -34.29, mag: 2.29 },
      { id: 'sco-m', ra: 16.865, dec: -38.05, mag: 3.00 },
      { id: 'sco-z', ra: 16.910, dec: -42.36, mag: 3.62 },
      { id: 'sco-h', ra: 17.203, dec: -43.24, mag: 3.33 },
      { id: 'sco-th', ra: 17.622, dec: -43.00, mag: 1.86 },
      { id: 'sco-i', ra: 17.793, dec: -40.13, mag: 3.03 },
      { id: 'sco-k', ra: 17.708, dec: -39.03, mag: 2.39 },
      { id: 'sco-l', ra: 17.560, dec: -37.10, mag: 1.62, name: { zh: '尾宿八 · 蝎尾的刺', en: 'Shaula, the sting' } },
    ],
    edges: [['sco-b', 'sco-d'], ['sco-d', 'sco-p'], ['sco-p', 'sco-r'], ['sco-d', 'sco-s'], ['sco-s', 'sco-a'], ['sco-a', 'sco-t'], ['sco-t', 'sco-e'],
      ['sco-e', 'sco-m'], ['sco-m', 'sco-z'], ['sco-z', 'sco-h'], ['sco-h', 'sco-th'], ['sco-th', 'sco-i'], ['sco-i', 'sco-k'], ['sco-k', 'sco-l']],
  },
];

export const ALL_STARS: Star[] = CONSTELLATIONS.flatMap((c) => c.stars);
export const ALL_EDGES: Edge[] = CONSTELLATIONS.flatMap((c) => c.edges);
export const edgeKey = (a: string, b: string): string => (a < b ? `${a}|${b}` : `${b}|${a}`);
export const isEdge = (a: string, b: string): boolean => ALL_EDGES.some((e) => edgeKey(e[0], e[1]) === edgeKey(a, b));

/** Chart coordinates in a 1000×1000 box: a flat sky, east on the left as when looking up (RA grows leftwards). */
export function project(s: Star): { x: number; y: number } {
  const RA0 = 14.6, RA1 = 18.0, DEC0 = -6, DEC1 = -46, COS = Math.cos((-27 * Math.PI) / 180);
  const w = (RA1 - RA0) * 15 * COS, h = DEC0 - DEC1;
  const k = 920 / Math.max(w, h);
  const x = 500 + ((RA0 + RA1) / 2 - s.ra) * 15 * COS * k;
  const y = 500 + ((DEC0 + DEC1) / 2 - s.dec) * k;
  return { x, y };
}
