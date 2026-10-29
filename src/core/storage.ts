/** The storage interface games and progress need; localStorage satisfies it. */
export type StoreLike = Pick<Storage, 'getItem' | 'setItem'>;

const memory = new Map<string, string>();
const inMemory: StoreLike = { getItem: (k) => memory.get(k) ?? null, setItem: (k, v) => { memory.set(k, v); } };

/** localStorage when the browser allows it, otherwise a store that lasts for this visit. */
export function safeStorage(): StoreLike {
  try {
    return window.localStorage;
  } catch {
    return inMemory;
  }
}

// Transient level progress (the puzzle you are on, the stars joined so far) lives for the tab in
// sessionStorage, so a language toggle (which re-renders the whole page) or a reload inside a
// level does not send you back to its start. Cleared progress is never kept here: once a level is
// cleared its key goes, and `reset` drops every key of that player.
export type SessionLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem' | 'key' | 'length'>;

export function memorySession(): SessionLike {
  const m = new Map<string, string>();
  return {
    getItem: (k) => m.get(k) ?? null,
    setItem: (k, v) => { m.set(k, v); },
    removeItem: (k) => { m.delete(k); },
    key: (i) => [...m.keys()][i] ?? null,
    get length() { return m.size; },
  };
}
let session: SessionLike | null = null;
/** sessionStorage when the browser allows it, otherwise a store that lasts for this page. */
export function safeSession(): SessionLike {
  if (session) return session;
  try {
    if (typeof sessionStorage !== 'undefined' && sessionStorage) { sessionStorage.getItem('yi.probe'); return (session = sessionStorage); }
  } catch { /* blocked (private mode, sandboxed frame) */ }
  return (session = memorySession());
}
/** For tests: swap the session store. */
export const useSession = (s: SessionLike | null): void => { session = s; };

export const LIVE_PREFIX = 'yi.live.';
export const liveKey = (level: string, player: string): string => `${LIVE_PREFIX}${level}.${player}`;

export interface SessionState<T> { get(): T | null; set(v: T): void; clear(): void }
/** A JSON value under `key` in session storage; `get` is null when nothing (or junk) is there. */
export function sessionState<T>(key: string): SessionState<T> {
  return {
    get: () => { try { const raw = safeSession().getItem(key); return raw ? (JSON.parse(raw) as T) : null; } catch { return null; } },
    set: (v) => { try { safeSession().setItem(key, JSON.stringify(v)); } catch { /* full or blocked: progress lasts for this render */ } },
    clear: () => { try { safeSession().removeItem(key); } catch { /* ignore */ } },
  };
}
/** Drop every live key of one level (`level` given) or of every level (`level` = '*') for a player. */
export function clearLive(level: string, player: string): void {
  try {
    const s = safeSession();
    const gone: string[] = [];
    for (let i = 0; i < s.length; i++) {
      const k = s.key(i);
      if (k && k.startsWith(LIVE_PREFIX) && k.endsWith(`.${player}`) && (level === '*' || k === liveKey(level, player))) gone.push(k);
    }
    gone.forEach((k) => s.removeItem(k));   // collected first: removing while walking skips keys
  } catch { /* ignore */ }
}
