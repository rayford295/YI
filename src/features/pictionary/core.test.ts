import { describe, expect, it } from 'vitest';
import {
  ROUND_MS, normalizeGuess, isCorrect, pickWord, newMatch, startRound, guess, markCorrect, skip,
  timeLeft, tick, nextRound, type Word,
} from './core';

const moon: Word = { id: 'moon', zh: '月亮', en: 'moon', alt: ['the moon'] };
const ticket: Word = { id: 'ticket', zh: '机票', en: 'plane ticket', alt: ['ticket', '飞机票'] };

describe('guess matching', () => {
  it('ignores case, spaces, punctuation and full-width forms', () => {
    expect(normalizeGuess('  ＭＯＯＮ！ ')).toBe('moon');
    expect(normalizeGuess('Plane  Ticket.')).toBe('planeticket');
    expect(normalizeGuess('月 亮。')).toBe('月亮');
  });

  it('accepts the Chinese, English or an alternative answer', () => {
    expect(isCorrect('月亮', moon)).toBe(true);
    expect(isCorrect('Moon', moon)).toBe(true);
    expect(isCorrect('the moon', moon)).toBe(true);
    expect(isCorrect('飞机票', ticket)).toBe(true);
    expect(isCorrect('plane-ticket', ticket)).toBe(true);
  });

  it('rejects wrong and empty guesses', () => {
    expect(isCorrect('太阳', moon)).toBe(false);
    expect(isCorrect('', moon)).toBe(false);
    expect(isCorrect('   ', moon)).toBe(false);
    expect(isCorrect('moo', moon)).toBe(false);
  });
});

describe('word picking', () => {
  const bank = [moon, ticket, { id: 'rose', zh: '玫瑰', en: 'rose' }];

  it('never repeats a word until the bank is used up', () => {
    const used: string[] = [];
    for (let i = 0; i < 3; i++) used.push(pickWord(bank, used, () => 0.99).id);
    expect(new Set(used).size).toBe(3);
  });

  it('starts over once every word has been drawn', () => {
    expect(bank.map((w) => w.id)).toContain(pickWord(bank, ['moon', 'ticket', 'rose'], () => 0).id);
  });
});

describe('rounds', () => {
  const t0 = 1_000_000;

  it('a new match waits for the first drawer with nothing scored', () => {
    const m = newMatch('green');
    expect(m).toMatchObject({ phase: 'ready', drawer: 'green', score: 0, streak: 0, best: 0, round: 1 });
  });

  it('a correct typed guess ends the round and scores for both of us', () => {
    let m = startRound(newMatch('purple'), moon, t0);
    expect(m.phase).toBe('drawing');
    m = guess(m, '太阳', t0 + 1000);
    expect(m.phase).toBe('drawing');
    expect(m.misses).toEqual(['太阳']);
    m = guess(m, 'Moon!', t0 + 2000);
    expect(m).toMatchObject({ phase: 'result', outcome: 'correct', score: 1, streak: 1, best: 1 });
  });

  it('the drawer can confirm a spoken guess', () => {
    const m = markCorrect(startRound(newMatch('purple'), moon, t0), t0 + 500);
    expect(m).toMatchObject({ phase: 'result', outcome: 'correct', score: 1 });
  });

  it('time runs out after 90 seconds and breaks the streak', () => {
    let m = markCorrect(startRound(newMatch('purple'), moon, t0), t0 + 10);
    m = startRound(nextRound(m), ticket, t0 + 20_000);
    expect(timeLeft(m, t0 + 20_000 + ROUND_MS - 1)).toBe(1);
    expect(tick(m, t0 + 20_000 + ROUND_MS - 1).phase).toBe('drawing');
    m = tick(m, t0 + 20_000 + ROUND_MS);
    expect(m).toMatchObject({ phase: 'result', outcome: 'timeout', score: 1, streak: 0, best: 1 });
    expect(timeLeft(m, t0 + 999_999)).toBe(0);
  });

  it('a guess arriving after the time is up does not count', () => {
    const m = guess(startRound(newMatch('purple'), moon, t0), 'moon', t0 + ROUND_MS + 5);
    expect(m).toMatchObject({ phase: 'result', outcome: 'timeout', score: 0 });
  });

  it('skipping ends the round without a point', () => {
    const m = skip(startRound(newMatch('green'), moon, t0));
    expect(m).toMatchObject({ phase: 'result', outcome: 'skipped', score: 0, streak: 0 });
  });

  it('the next round swaps the drawer and remembers used words', () => {
    const m = nextRound(markCorrect(startRound(newMatch('purple'), moon, t0), t0 + 1));
    expect(m).toMatchObject({ phase: 'ready', drawer: 'green', round: 2, misses: [] });
    expect(m.used).toEqual(['moon']);
    expect(m.word).toBeNull();
  });

  it('ignores actions that do not fit the current phase', () => {
    const ready = newMatch('purple');
    expect(guess(ready, 'moon', t0)).toBe(ready);
    expect(markCorrect(ready, t0)).toBe(ready);
    expect(skip(ready)).toBe(ready);
    expect(nextRound(ready)).toBe(ready);
    const done = markCorrect(startRound(ready, moon, t0), t0);
    expect(startRound(done, ticket, t0)).toBe(done);
    expect(guess(done, 'moon', t0)).toBe(done);
  });
});
