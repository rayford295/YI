// Our shared "in sync" score and best streak, kept across visits.
export interface Tally { score: number; best: number }
type StoreLike = Pick<Storage, 'getItem' | 'setItem'>;

const KEY = 'yi.pictionary';
const count = (v: unknown) => (Number.isInteger(v) && (v as number) >= 0 ? (v as number) : null);

export function loadTally(store: StoreLike): Tally {
  try {
    const raw = JSON.parse(store.getItem(KEY) ?? 'null') as Partial<Tally> | null;
    const score = count(raw?.score), best = count(raw?.best);
    return score === null || best === null ? { score: 0, best: 0 } : { score, best };
  } catch {
    return { score: 0, best: 0 };
  }
}

export function saveTally(store: StoreLike, t: Tally): void {
  try {
    store.setItem(KEY, JSON.stringify({ score: t.score, best: t.best }));
  } catch {
    // storage blocked: the score lasts for this visit only
  }
}
