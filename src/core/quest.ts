// The journey: who is playing, which levels exist, which are cleared.
// Progress is per player and per device (localStorage); there is no server.
import type { Key } from './i18n';
import { clearLive } from './storage';

export type PlayerId = 'yifan' | 'jingyi';
export interface Level { id: string; route: string; title: Key; story: Key }

// Order matters: a level unlocks when the one before it is cleared. To add a level, append here,
// add its strings to i18n, register its route in main.ts and call clear(id) when its task is done.
export const LEVELS: Level[] = [
  { id: 'met', route: '/met', title: 'quest.level.met', story: 'quest.story.met' },
  { id: 'map', route: '/map', title: 'quest.level.map', story: 'quest.story.map' },
  { id: 'tattoo', route: '/tattoo', title: 'quest.level.tattoo', story: 'quest.story.tattoo' },
  { id: 'moments', route: '/moments', title: 'quest.level.moments', story: 'quest.story.moments' },
  { id: 'gomoku', route: '/gomoku', title: 'quest.level.gomoku', story: 'quest.story.gomoku' },
  { id: 'songs', route: '/songs', title: 'quest.level.songs', story: 'quest.story.songs' },
  { id: 'stars', route: '/stars', title: 'quest.level.stars', story: 'quest.story.stars' },
  { id: 'poems', route: '/poems', title: 'quest.level.poems', story: 'quest.story.poems' },
  { id: 'ring', route: '/ring', title: 'quest.level.ring', story: 'quest.story.ring' },
];

export interface Progress { cleared: string[] }
export interface StoreLike { getItem(k: string): string | null; setItem(k: string, v: string): void; removeItem(k: string): void }

const PLAYER_KEY = 'yi.player';
const progressKey = (p: PlayerId) => `yi.quest.${p}`;

const memory = new Map<string, string>();
const fallback: StoreLike = {
  getItem: (k) => memory.get(k) ?? null,
  setItem: (k, v) => { memory.set(k, v); },
  removeItem: (k) => { memory.delete(k); },
};
let store: StoreLike = fallback;
try { store = window.localStorage; } catch { /* storage blocked: progress lasts for this visit */ }

/** For tests: swap the backing store. */
export const useStore = (s: StoreLike): void => { store = s; };

const listeners = new Set<() => void>();
export const onQuestChange = (fn: () => void): (() => void) => { listeners.add(fn); return () => listeners.delete(fn); };
const emit = () => listeners.forEach((fn) => fn());

export function getPlayer(): PlayerId | null {
  const v = store.getItem(PLAYER_KEY);
  return v === 'yifan' || v === 'jingyi' ? v : null;
}
export function setPlayer(p: PlayerId | null): void {
  if (p) store.setItem(PLAYER_KEY, p); else store.removeItem(PLAYER_KEY);
  emit();
}

export function getProgress(p: PlayerId | null = getPlayer()): Progress {
  if (!p) return { cleared: [] };
  try {
    const raw = store.getItem(progressKey(p));
    const parsed = raw ? (JSON.parse(raw) as Partial<Progress>) : {};
    return { cleared: Array.isArray(parsed.cleared) ? parsed.cleared.filter((x): x is string => typeof x === 'string') : [] };
  } catch { return { cleared: [] }; }
}
const save = (p: PlayerId, pr: Progress) => store.setItem(progressKey(p), JSON.stringify(pr));

export const levelIndex = (id: string): number => LEVELS.findIndex((l) => l.id === id);
/** 1-based level number for "Level N" strings; derived, so inserting a level renumbers everything. */
export const levelNumber = (id: string): number => levelIndex(id) + 1;
export const PLAYERS: PlayerId[] = ['jingyi', 'yifan'];
/** True when every player has cleared `id` on this device (the epilogue opens for both at once). */
export const clearedByAll = (id: string): boolean => PLAYERS.every((p) => isCleared(id, p));
export const levelByRoute = (route: string): Level | undefined => LEVELS.find((l) => l.route === route);

export function isCleared(id: string, p: PlayerId | null = getPlayer()): boolean {
  return getProgress(p).cleared.includes(id);
}
export function isUnlocked(id: string, p: PlayerId | null = getPlayer()): boolean {
  const i = levelIndex(id);
  if (i < 0 || !p) return false;
  return i === 0 || isCleared(LEVELS[i - 1].id, p);
}
/** The first level that is not cleared yet (the one to play next), or null when all are done. */
export function current(p: PlayerId | null = getPlayer()): Level | null {
  if (!p) return null;
  return LEVELS.find((l) => !isCleared(l.id, p)) ?? null;
}
export function next(id: string): Level | null {
  const i = levelIndex(id);
  return i >= 0 && i + 1 < LEVELS.length ? LEVELS[i + 1] : null;
}

/** Mark a level cleared. Returns true the first time (so callers can celebrate once). */
export function clear(id: string, p: PlayerId | null = getPlayer()): boolean {
  if (!p || levelIndex(id) < 0 || !isUnlocked(id, p) || isCleared(id, p)) return false;
  const pr = getProgress(p);
  save(p, { cleared: [...pr.cleared, id] });
  clearLive(id, p);   // a cleared level's half-way state is no longer wanted
  emit();
  return true;
}
/** Add levels cleared elsewhere (a code from the other phone); never removes anything. */
export function mergeProgress(p: PlayerId, cleared: string[]): void {
  const have = new Set(getProgress(p).cleared);
  for (const id of cleared) if (levelIndex(id) >= 0) { have.add(id); clearLive(id, p); }
  save(p, { cleared: LEVELS.filter((l) => have.has(l.id)).map((l) => l.id) });
  emit();
}
export function reset(p: PlayerId | null = getPlayer()): void {
  if (p) { store.removeItem(progressKey(p)); clearLive('*', p); }
  emit();
}
