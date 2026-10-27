import { describe, expect, it } from 'vitest';
import { LINE, VOW, normalise, saidTheLine } from './vow';

describe('the vow', () => {
  it('has both vows and the line to say for both players', () => {
    for (const p of ['yifan', 'jingyi'] as const) { expect(VOW[p].zh).toContain('再一次'); expect(VOW[p].en).toContain('once more'); expect(LINE[p]).toContain('我愿意'); }
    expect(LINE.yifan).toContain('陈静仪');
    expect(LINE.jingyi).toContain('杨一帆');
  });
  it('ignores punctuation and spaces', () => {
    expect(normalise('我爱你，陈静仪。 我愿意！')).toBe('我爱你陈静仪我愿意');
  });
  it('accepts the line as said, with the name heard as a homophone', () => {
    expect(saidTheLine('我爱你，陈静仪，我愿意', 'yifan')).toBe(true);
    expect(saidTheLine('我爱你陈静怡我愿意', 'yifan')).toBe(true);
    expect(saidTheLine('我爱你 杨一凡 我愿意', 'jingyi')).toBe(true);
  });
  it('refuses the wrong name, a missing part, or the other one’s line', () => {
    expect(saidTheLine('我爱你，杨一帆，我愿意', 'yifan')).toBe(false);
    expect(saidTheLine('我爱你，陈静仪', 'yifan')).toBe(false);
    expect(saidTheLine('陈静仪我愿意', 'yifan')).toBe(false);
    expect(saidTheLine('我爱你，陈静仪，我愿意', 'jingyi')).toBe(false);
  });
});
