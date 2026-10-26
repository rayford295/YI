// Progress travels between our two phones as a short code, since there is no server: a letter for
// the player, the cleared levels as a bitmask in base 36, and one check character. "J7K" means
// Jingyi has cleared the first three levels. A code can also ride in a link (#/sync?c=J7K), which
// imports it when opened. Merging is a union, so a code never takes progress away.
import { LEVELS, PLAYERS, getProgress, levelIndex, mergeProgress, type PlayerId } from './quest';

const LETTER: Record<PlayerId, string> = { jingyi: 'J', yifan: 'Y' };
const DIGITS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const check = (body: string): string => DIGITS[[...body].reduce((a, ch, i) => a + ch.charCodeAt(0) * (i + 3), 0) % 36];

export interface Carried { player: PlayerId; cleared: string[] }

export function encodeProgress(p: PlayerId, cleared: string[] = getProgress(p).cleared): string {
  const mask = cleared.reduce((m, id) => (levelIndex(id) >= 0 ? m | (1 << levelIndex(id)) : m), 0);
  const body = `${LETTER[p]}${mask.toString(36).toUpperCase()}`;
  return body + check(body);
}

/** The code's player and levels, or null for anything that is not one of ours. */
export function decodeProgress(raw: string): Carried | null {
  const code = raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (code.length < 3) return null;
  const body = code.slice(0, -1);
  if (check(body) !== code.slice(-1)) return null;
  const player = PLAYERS.find((p) => LETTER[p] === body[0]);
  const mask = parseInt(body.slice(1), 36);
  if (!player || Number.isNaN(mask) || mask < 0 || mask >= 1 << LEVELS.length) return null;
  return { player, cleared: LEVELS.filter((_, i) => mask & (1 << i)).map((l) => l.id) };
}

/** Pull a code out of a link or a pasted blob; the code itself passes through unchanged. */
export function codeFrom(text: string): string {
  const m = /[?&]c=([A-Za-z0-9]+)/.exec(text);
  return (m ? m[1] : text).trim();
}

export const syncLink = (code: string): string => `${location.origin}${location.pathname}#/sync?c=${code}`;

/** Merge a code into this device. Returns what was carried, or null when the code is not ours. */
export function importProgress(raw: string): Carried | null {
  const carried = decodeProgress(codeFrom(raw));
  if (carried) mergeProgress(carried.player, carried.cleared);
  return carried;
}
