// Pure Pictionary rules for one shared device. Time is passed in, so every rule is testable.
// We play as a team: each correct guess adds one to our shared score ("in sync" points).

export type Player = 'purple' | 'green'; // purple = Jingyi, green = Yifan, as in Gomoku
export interface Word { id: string; zh: string; en: string; alt?: string[] }
export type Outcome = 'correct' | 'timeout' | 'skipped';
export interface Match {
  phase: 'ready' | 'drawing' | 'result';
  round: number;
  drawer: Player;
  word: Word | null;
  startedAt: number;
  outcome: Outcome | null;
  misses: string[];
  used: string[];
  score: number;
  streak: number;
  best: number;
}

export const ROUND_MS = 90_000;

export const otherPlayer = (p: Player): Player => (p === 'purple' ? 'green' : 'purple');

/** Full-width → half-width, lower case, no spaces, punctuation or symbols. */
export function normalizeGuess(s: string): string {
  return s.normalize('NFKC').toLowerCase().replace(/[\s\p{P}\p{S}]/gu, '');
}

export function isCorrect(text: string, w: Word): boolean {
  const g = normalizeGuess(text);
  return g !== '' && [w.zh, w.en, ...(w.alt ?? [])].some((a) => normalizeGuess(a) === g);
}

/** A random word not drawn yet in this match; starts over once the bank is used up. */
export function pickWord(bank: readonly Word[], used: readonly string[], rand: () => number = Math.random): Word {
  const fresh = bank.filter((w) => !used.includes(w.id));
  const pool = fresh.length ? fresh : bank;
  return pool[Math.min(pool.length - 1, Math.floor(rand() * pool.length))];
}

export function newMatch(firstDrawer: Player, carry: Pick<Match, 'score' | 'best'> = { score: 0, best: 0 }): Match {
  return {
    phase: 'ready', round: 1, drawer: firstDrawer, word: null, startedAt: 0, outcome: null,
    misses: [], used: [], score: carry.score, streak: 0, best: carry.best,
  };
}

export function startRound(m: Match, word: Word, now: number): Match {
  if (m.phase !== 'ready') return m;
  const used = m.used.includes(word.id) ? m.used : [...m.used, word.id];
  return { ...m, phase: 'drawing', word, startedAt: now, outcome: null, misses: [], used };
}

export function timeLeft(m: Match, now: number): number {
  if (m.phase !== 'drawing') return 0;
  return Math.max(0, m.startedAt + ROUND_MS - now);
}

const finish = (m: Match, outcome: Outcome): Match => {
  const streak = outcome === 'correct' ? m.streak + 1 : 0;
  return {
    ...m, phase: 'result', outcome, streak,
    score: m.score + (outcome === 'correct' ? 1 : 0),
    best: Math.max(m.best, streak),
  };
};

/** Ends the round when the clock has run out. */
export function tick(m: Match, now: number): Match {
  return m.phase === 'drawing' && timeLeft(m, now) === 0 ? finish(m, 'timeout') : m;
}

export function guess(m: Match, text: string, now: number): Match {
  const live = tick(m, now);
  if (live.phase !== 'drawing' || !live.word) return live;
  if (isCorrect(text, live.word)) return finish(live, 'correct');
  const miss = text.trim();
  return miss ? { ...live, misses: [...live.misses, miss] } : live;
}

/** The drawer confirms a guess said out loud (on Zoom, or across the sofa). */
export function markCorrect(m: Match, now: number): Match {
  const live = tick(m, now);
  return live.phase === 'drawing' ? finish(live, 'correct') : live;
}

export function skip(m: Match): Match {
  return m.phase === 'drawing' ? finish(m, 'skipped') : m;
}

export function nextRound(m: Match): Match {
  if (m.phase !== 'result') return m;
  return { ...m, phase: 'ready', round: m.round + 1, drawer: otherPlayer(m.drawer), word: null, outcome: null, misses: [] };
}
