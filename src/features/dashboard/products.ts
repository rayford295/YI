// Everything we build under jingyifan.love, newest last. The dashboard shows one card per entry;
// adding a product means a folder in src/features/, its routes in main.ts, and a line here.
import type { Key } from '../../core/i18n';
import { LEVELS, getPlayer, getProgress } from '../../core/quest';
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
    // Levels cleared by whoever plays on this device, e.g. "静仪 4/9". The other one's count is not
    // shown: how far Yifan has got would give away that there is an end worth reaching.
    status: () => {
      const p = getPlayer();
      if (!p) return null;
      const n = getProgress(p).cleared.length;
      return n ? `${playerName(p)} ${n}/${LEVELS.length}` : null;
    },
  },
];
