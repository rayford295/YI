import { describe, expect, it } from 'vitest';
import { sha256Hex } from './sha256';
import { normalise, tryGate, hash, ANSWERS } from './gate';
import { dict } from './i18n';

describe('gate', () => {
  it('sha256 matches the reference vectors', () => {
    expect(sha256Hex('')).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    expect(sha256Hex('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
    expect(sha256Hex('920')).toBe(ANSWERS[0]);
  });
  it('normalises to digits', () => {
    expect(normalise('9 月 20 日')).toBe('920');
    expect(normalise('2026-09-20')).toBe('20260920');
    expect(normalise('九月二十')).toBe('');
  });
  it('the placeholder does not give the answer away', async () => {
    for (const lang of ['zh', 'en'] as const) expect(await tryGate(normalise(dict[lang]['gate.placeholder']))).toBe(false);
  });
  it('accepts the day we met in any spelling and rejects the rest', async () => {
    expect(await hash('920')).toBe(ANSWERS[0]);
    for (const a of ['0920', '9.20', '2026.09.20', '26-09-20', '9 月 20 日']) expect(await tryGate(a)).toBe(true);
    for (const a of ['0925', '1031', '', 'love']) expect(await tryGate(a)).toBe(false);
  });
});
