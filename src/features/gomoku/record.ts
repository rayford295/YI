// Win tally and who opens the next game, kept in localStorage across visits.
import { nextFirst, newGame, place, type Game, type Status, type Stone } from './core';

export interface GameRecord { purple: number; green: number; draws: number; nextFirst: Stone }
import type { StoreLike } from '../../core/storage';
export type { StoreLike };

const KEY = 'yi.gomoku';
// Jingyi opens the very first game.
const fresh = (): GameRecord => ({ purple: 0, green: 0, draws: 0, nextFirst: 'purple' });

const count = (v: unknown) => (Number.isInteger(v) && (v as number) >= 0 ? (v as number) : null);

export function loadRecord(store: StoreLike): GameRecord {
  try {
    const raw = JSON.parse(store.getItem(KEY) ?? 'null') as Partial<GameRecord> | null;
    if (!raw) return fresh();
    const purple = count(raw.purple), green = count(raw.green), draws = count(raw.draws);
    const first = raw.nextFirst === 'green' || raw.nextFirst === 'purple' ? raw.nextFirst : null;
    if (purple === null || green === null || draws === null || first === null) return fresh();
    return { purple, green, draws, nextFirst: first };
  } catch {
    return fresh();
  }
}

export function saveRecord(store: StoreLike, r: GameRecord): void {
  try {
    store.setItem(KEY, JSON.stringify(r));
  } catch {
    // storage blocked: the tally lasts for this visit only
  }
}

export function recordResult(r: GameRecord, opener: Stone, result: Status): GameRecord {
  if (result.kind === 'playing') return r;
  const next = { ...r, nextFirst: nextFirst(opener, result) };
  if (result.kind === 'won') next[result.by] += 1;
  else next.draws += 1;
  return next;
}

const GAME_KEY = 'yi.gomoku.game';

/** Replays the saved moves through the rules, so a corrupt save can never produce an illegal board. */
export function loadGame(store: StoreLike, fallbackFirst: Stone): Game {
  const empty = newGame(fallbackFirst);
  try {
    const raw = JSON.parse(store.getItem(GAME_KEY) ?? 'null') as { first?: unknown; moves?: unknown } | null;
    if (!raw || (raw.first !== 'purple' && raw.first !== 'green') || !Array.isArray(raw.moves)) return empty;
    let g = newGame(raw.first);
    for (const m of raw.moves) {
      if (!Array.isArray(m) || m.length !== 2) return empty;
      const next = place(g, Number(m[0]), Number(m[1]));
      if (next === g) return empty;
      g = next;
    }
    return g;
  } catch {
    return empty;
  }
}

export function saveGame(store: StoreLike, g: Game): void {
  try {
    store.setItem(GAME_KEY, JSON.stringify(g));
  } catch {
    // storage blocked: the game lasts while the page stays open
  }
}
