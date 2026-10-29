import { beforeEach, describe, expect, it } from 'vitest';
import { clearLive, liveKey, memorySession, sessionState, useSession } from './storage';

describe('live level state', () => {
  beforeEach(() => { useSession(memorySession()); });

  it('keeps a JSON value under its key and is null when nothing is there', () => {
    const s = sessionState<{ i: number }>(liveKey('gomoku', 'jingyi'));
    expect(s.get()).toBeNull();
    s.set({ i: 3 });
    expect(s.get()).toEqual({ i: 3 });
    s.clear();
    expect(s.get()).toBeNull();
  });

  it('treats junk as nothing', () => {
    const store = memorySession();
    useSession(store);
    store.setItem(liveKey('stars', 'yifan'), '{not json');
    expect(sessionState(liveKey('stars', 'yifan')).get()).toBeNull();
  });

  it('clears one level or every level of one player, never the other player', () => {
    const store = memorySession();
    useSession(store);
    for (const p of ['jingyi', 'yifan']) for (const l of ['gomoku', 'stars']) sessionState(liveKey(l, p)).set(1);
    store.setItem('yi.door', '/gomoku');
    clearLive('gomoku', 'jingyi');
    expect(sessionState(liveKey('gomoku', 'jingyi')).get()).toBeNull();
    expect(sessionState(liveKey('stars', 'jingyi')).get()).toBe(1);
    clearLive('*', 'jingyi');
    expect(sessionState(liveKey('stars', 'jingyi')).get()).toBeNull();
    expect(sessionState(liveKey('gomoku', 'yifan')).get()).toBe(1);
    expect(sessionState(liveKey('stars', 'yifan')).get()).toBe(1);
    expect(store.getItem('yi.door')).toBe('/gomoku');
  });

  it('falls back to memory when sessionStorage is missing', () => {
    useSession(null);   // node has no sessionStorage: the probe must not throw
    const s = sessionState<number>(liveKey('poems', 'jingyi'));
    s.set(2);
    expect(s.get()).toBe(2);
  });
});
