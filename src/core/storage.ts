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
