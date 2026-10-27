import type { StoreLike } from './storage';

/**
 * Moving the town from jingyifan.love to town.jingyifan.love changed its origin, and localStorage
 * does not cross origins. The hub at jingyifan.love still sees the old saves, so its link into the
 * town carries them in the fragment: `#handoff=<base64url JSON of yi.* keys>`.
 *
 * Only yi.* keys are taken. The gate answer and the one-visit door ticket never travel: a crafted
 * link must not walk a stranger past the question. A key the town already holds wins, so an old
 * save never overwrites newer progress made here.
 */
const NEVER = new Set(['yi.gate', 'yi.door']);
/** The only page allowed to hand saves over. */
export const HUB_ORIGIN = 'https://jingyifan.love';
const MAX_LEN = 512 * 1024;

/**
 * Any site can link here with a #handoff= of its choosing, and the saves it writes would outlive
 * the visit. So a handoff counts only when the visitor came from the front page (the referrer is
 * set by the browser, not the link), and only up to a size no honest save reaches.
 */
export function handoffAllowed(referrer: string, hash: string): boolean {
  if (hash.length > MAX_LEN) return false;
  try { return new URL(referrer).origin === HUB_ORIGIN; } catch { return false; }
}

export function decodeHandoff(hash: string): Record<string, string> | null {
  const m = /^#handoff=([A-Za-z0-9_-]+)$/.exec(hash);
  if (!m) return null;
  try {
    const b64 = m[1].replace(/-/g, '+').replace(/_/g, '/');
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const data: unknown = JSON.parse(new TextDecoder().decode(bytes));
    if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
    return data as Record<string, string>;
  } catch {
    return null;
  }
}

/** Writes the accepted keys into the store; returns how many were written. */
export function applyHandoff(data: Record<string, string>, store: StoreLike): number {
  let n = 0;
  for (const [k, v] of Object.entries(data)) {
    if (!k.startsWith('yi.') || NEVER.has(k) || typeof v !== 'string') continue;
    if (store.getItem(k) !== null) continue;
    store.setItem(k, v);
    n++;
  }
  return n;
}
