import { describe, expect, it } from 'vitest';
import { loadRecord, saveRecord, recordResult, type StoreLike } from './record';

const memory = (): StoreLike & { data: Map<string, string> } => {
  const data = new Map<string, string>();
  return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v) };
};

describe('gomoku record', () => {
  it('starts at 0 : 0 with Jingyi (purple) opening', () => {
    expect(loadRecord(memory())).toEqual({ purple: 0, green: 0, draws: 0, nextFirst: 'purple' });
  });

  it('round-trips through storage', () => {
    const s = memory();
    saveRecord(s, { purple: 2, green: 1, draws: 0, nextFirst: 'green' });
    expect(loadRecord(s)).toEqual({ purple: 2, green: 1, draws: 0, nextFirst: 'green' });
  });

  it('falls back to a fresh record when storage throws or holds junk', () => {
    const broken: StoreLike = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } };
    expect(loadRecord(broken).nextFirst).toBe('purple');
    expect(() => saveRecord(broken, loadRecord(broken))).not.toThrow();
    const junk = memory();
    junk.data.set('yi.gomoku', '{"purple":"lots"}');
    expect(loadRecord(junk)).toEqual({ purple: 0, green: 0, draws: 0, nextFirst: 'purple' });
  });

  it('a win scores the winner and hands the opening move to the loser', () => {
    const r = recordResult({ purple: 0, green: 0, draws: 0, nextFirst: 'purple' }, 'purple', { kind: 'won', by: 'purple', line: [] });
    expect(r).toEqual({ purple: 1, green: 0, draws: 0, nextFirst: 'green' });
  });

  it('a draw counts and swaps the opener', () => {
    const r = recordResult({ purple: 1, green: 1, draws: 0, nextFirst: 'green' }, 'green', { kind: 'draw' });
    expect(r).toEqual({ purple: 1, green: 1, draws: 1, nextFirst: 'purple' });
  });
});

describe('gomoku game in progress', () => {
  it('round-trips the current game and rejects corrupt saves', async () => {
    const { loadGame, saveGame } = await import('./record');
    const { newGame, place } = await import('./core');
    const s = memory();
    expect(loadGame(s, 'green')).toEqual({ first: 'green', moves: [] });
    const g = place(place(newGame('purple'), 7, 7), 7, 8);
    saveGame(s, g);
    expect(loadGame(s, 'green')).toEqual(g);
    s.data.set('yi.gomoku.game', '{"first":"purple","moves":[[7,7],[7,7]]}');
    expect(loadGame(s, 'green')).toEqual({ first: 'green', moves: [] });
    s.data.set('yi.gomoku.game', '{"first":"purple","moves":[[99,0]]}');
    expect(loadGame(s, 'green').moves).toHaveLength(0);
  });
});
