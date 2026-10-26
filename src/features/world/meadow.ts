// The whole site stands on the town's meadow: grass tiled from the same pixels as the game, with
// the evening wash the town uses, following the clock in the player's own city (the device's clock
// before a player is picked). Started once from main.ts; nothing removes it.
import { meadowUrl } from './tiles';
import { phaseAt, tintFor } from './daylight';
import { clockIn } from '../../core/dates';
import { config } from '../../core/config';
import { getPlayer } from '../../core/quest';
import { getLang } from '../../core/i18n';

let started = false;

function wash(): void {
  const p = getPlayer();
  const zone = p === 'jingyi' ? config.her.zone : p === 'yifan' ? config.him.zone : Intl.DateTimeFormat().resolvedOptions().timeZone;
  const t = tintFor(phaseAt(clockIn(zone, new Date(), getLang()).hour));
  document.body.style.setProperty('--world-wash', t ? `${t.color}${Math.round(t.alpha * 255).toString(16).padStart(2, '0')}` : 'transparent');
}

/** Put the meadow under the site and keep its wash current; safe to call more than once. */
export function startMeadow(): void {
  if (started) return;
  started = true;
  const body = document.body;
  body.classList.add('world-sky');
  body.style.setProperty('--meadow', `url(${meadowUrl()})`);
  wash();
  window.setInterval(wash, 60_000);
}
/** The wash for whoever is playing now (called when the player changes). */
export const refreshMeadow = wash;
