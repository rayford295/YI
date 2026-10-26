import { beforeEach, describe, expect, it } from 'vitest';
import { closeDoors, enteredThrough, openDoor } from './door';

const mem = new Map<string, string>();
beforeEach(() => {
  mem.clear();
  (globalThis as { sessionStorage?: unknown }).sessionStorage = {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => { mem.set(k, v); },
    removeItem: (k: string) => { mem.delete(k); },
  };
});

describe('doors', () => {
  it('lets a level in only through the door the town opened', () => {
    expect(enteredThrough('/map')).toBe(false);
    openDoor('/map');
    expect(enteredThrough('/map')).toBe(true);
    expect(enteredThrough('/moments')).toBe(false);
  });
  it('shuts every door once the town is back', () => {
    openDoor('/map');
    closeDoors();
    expect(enteredThrough('/map')).toBe(false);
  });
  it('survives without storage', () => {
    delete (globalThis as { sessionStorage?: unknown }).sessionStorage;
    expect(() => openDoor('/map')).not.toThrow();
    expect(enteredThrough('/map')).toBe(false);
  });
});
