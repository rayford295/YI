import { describe, expect, it } from 'vitest';
import { applyHandoff, decodeHandoff } from './handoff';

const encode = (o: object) =>
  '#handoff=' + btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(o))))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const store = (init: Record<string, string> = {}) => {
  const m = new Map(Object.entries(init));
  return { m, getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => { m.set(k, v); } };
};

describe('handoff', () => {
  it('round-trips unicode values', () => {
    expect(decodeHandoff(encode({ 'yi.lang': '中文' }))).toEqual({ 'yi.lang': '中文' });
  });
  it('ignores other fragments and garbage', () => {
    expect(decodeHandoff('#/cs')).toBeNull();
    expect(decodeHandoff('#handoff=!!')).toBeNull();
    expect(decodeHandoff(encode([1, 2]))).toBeNull();
  });
  it('takes yi.* keys only, never the gate or the door, and keeps what the town has', () => {
    const s = store({ 'yi.player': 'yifan' });
    const n = applyHandoff({ 'yi.player': 'jingyi', 'yi.quest.jingyi': 'x', 'yi.gate': '1', 'yi.door': '/ring', other: 'y' }, s);
    expect(n).toBe(1);
    expect(Object.fromEntries(s.m)).toEqual({ 'yi.player': 'yifan', 'yi.quest.jingyi': 'x' });
  });
});
