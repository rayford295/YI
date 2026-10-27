// Everything we build under jingyifan.love, newest last. The dashboard shows one card per entry;
// adding a product means a folder in src/features/, its routes in main.ts, and a line here.
import type { Key } from '../../core/i18n';
import { LEVELS, PLAYERS, getProgress } from '../../core/quest';
import { playerName } from '../../core/quest-ui';

export type Product = {
  id: string;
  /** Where the card leads. */
  route: string;
  title: Key;
  blurb: Key;
  /** Picture under public/, or none for a plain card. */
  image?: string;
  /** A short line of live state for the card, if the product has any. */
  status?: () => string | null;
};

export const PRODUCTS: Product[] = [
  {
    id: 'town',
    route: '/town',
    title: 'dash.town.title',
    blurb: 'dash.town.blurb',
    image: 'media/dashboard/town.png',
    // Levels cleared by each player on this device, e.g. "静仪 4/9 · 一帆 9/9".
    status: () => {
      const total = LEVELS.length;
      const parts = PLAYERS.map((p) => ({ p, n: getProgress(p).cleared.length })).filter((x) => x.n > 0);
      return parts.length ? parts.map((x) => `${playerName(x.p)} ${x.n}/${total}`).join(' · ') : null;
    },
  },
];
