// The meadow behind the pages that belong to the town (the town itself and the player picker):
// grass tiled from the same pixels as the game, with the evening wash the town uses. Level pages
// keep the paper look, as if you had stepped indoors.
import { meadowUrl } from './tiles';
import type { Tint } from './daylight';

let url: string | undefined;

/** Put the meadow on the page; returns the undo. `wash` repaints it for a new time of day. */
export function applyMeadow(): { wash(t: Tint | undefined): void; remove(): void } {
  const body = document.body;
  url ??= `url(${meadowUrl()})`;
  body.classList.add('world-sky');
  body.style.setProperty('--meadow', url);
  return {
    wash(t) {
      body.style.setProperty('--world-wash', t ? `${t.color}${Math.round(t.alpha * 255).toString(16).padStart(2, '0')}` : 'transparent');
    },
    remove() {
      body.classList.remove('world-sky');
      body.style.removeProperty('--meadow'); body.style.removeProperty('--world-wash');
    },
  };
}
