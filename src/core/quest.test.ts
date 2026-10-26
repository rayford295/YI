import { beforeEach, describe, expect, it } from 'vitest';
import { LEVELS, clear, current, getPlayer, getProgress, isCleared, isUnlocked, next, reset, setPlayer, useStore } from './quest';

const mem = () => {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => { m.set(k, v); }, removeItem: (k: string) => { m.delete(k); } };
};

describe('quest progress', () => {
  beforeEach(() => { useStore(mem()); });

  it('starts with no player and nothing unlocked', () => {
    expect(getPlayer()).toBeNull();
    expect(isUnlocked('met')).toBe(false);
    expect(current()).toBeNull();
  });

  it('unlocks only the first level for a new player', () => {
    setPlayer('jingyi');
    expect(isUnlocked('met')).toBe(true);
    expect(isUnlocked('map')).toBe(false);
    expect(current()?.id).toBe('met');
  });

  it('clears in order and unlocks the next level', () => {
    setPlayer('jingyi');
    expect(clear('map')).toBe(false);          // locked: cannot be cleared out of order
    expect(clear('met')).toBe(true);
    expect(clear('met')).toBe(false);          // only celebrates once
    expect(isUnlocked('map')).toBe(true);
    expect(current()?.id).toBe('map');
    expect(next('met')?.id).toBe('map');
    expect(next(LEVELS.at(-1)!.id)).toBeNull();
  });

  it('keeps progress per player', () => {
    setPlayer('jingyi');
    clear('met');
    setPlayer('yifan');
    expect(isCleared('met')).toBe(false);
    expect(getProgress('jingyi').cleared).toEqual(['met']);
  });

  it('reset wipes one player only', () => {
    setPlayer('jingyi'); clear('met');
    setPlayer('yifan'); clear('met');
    reset('yifan');
    expect(getProgress('yifan').cleared).toEqual([]);
    expect(getProgress('jingyi').cleared).toEqual(['met']);
  });

  it('survives corrupt storage', () => {
    const s = mem();
    useStore(s);
    setPlayer('jingyi');
    s.setItem('yi.quest.jingyi', '{not json');
    expect(getProgress().cleared).toEqual([]);
    expect(isUnlocked('met')).toBe(true);
  });
});
