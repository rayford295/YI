// A tattoo is a spot (arm or shoulder) and the strokes drawn on it, kept per player on the device.
import type { PlayerId } from '../../core/quest';
import type { Stroke } from './strokes';

export type Spot = 'arm' | 'shoulder';
export interface Tattoo { spot: Spot; strokes: Stroke[]; inkedAt: string }

const key = (p: PlayerId) => `yi.tattoo.${p}`;

export function loadTattoo(p: PlayerId, store: Pick<Storage, 'getItem'> | null = safe()): Tattoo | null {
  try {
    const raw = store?.getItem(key(p));
    if (!raw) return null;
    const t = JSON.parse(raw) as Partial<Tattoo>;
    if ((t.spot !== 'arm' && t.spot !== 'shoulder') || !Array.isArray(t.strokes)) return null;
    return { spot: t.spot, strokes: t.strokes, inkedAt: typeof t.inkedAt === 'string' ? t.inkedAt : '' };
  } catch { return null; }
}
export function saveTattoo(p: PlayerId, t: Tattoo, store: Pick<Storage, 'setItem'> | null = safe()): void {
  try { store?.setItem(key(p), JSON.stringify(t)); } catch { /* storage full or blocked: the drawing lasts for the visit */ }
}
function safe(): Storage | null { try { return localStorage; } catch { return null; } }

/** Ink laid down, as a fraction of the canvas width: the sum of every stroke's length. */
export function inkLength(strokes: readonly Stroke[]): number {
  let total = 0;
  for (const s of strokes) {
    if (s.erase) continue;
    for (let i = 1; i < s.points.length; i++) total += Math.hypot(s.points[i][0] - s.points[i - 1][0], s.points[i][1] - s.points[i - 1][1]);
  }
  return total;
}
/** Enough to count as writing something: about one canvas-width of line in total. */
export const ENOUGH = 1.0;
export const inked = (strokes: readonly Stroke[]): boolean => inkLength(strokes) >= ENOUGH;
