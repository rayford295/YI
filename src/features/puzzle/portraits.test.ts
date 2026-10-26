import { describe, expect, it } from 'vitest';
import { PORTRAITS, nextPortrait, portraitsFor } from './portraits';

describe('portraits', () => {
  it('gives each player the other one\'s face', () => {
    expect(portraitsFor('jingyi')).toBe(PORTRAITS.yifan);
    expect(portraitsFor('yifan')).toBe(PORTRAITS.jingyi);
    expect(PORTRAITS.yifan.length).toBeGreaterThan(0);
    expect(PORTRAITS.jingyi.length).toBeGreaterThan(0);
  });
  it('keeps every photo under its player\'s folder with both captions', () => {
    for (const [who, list] of Object.entries(PORTRAITS)) for (const p of list) {
      expect(p.src.startsWith(`media/portraits/${who}/`)).toBe(true);
      expect(p.alt.zh).not.toBe('');
      expect(p.alt.en).not.toBe('');
    }
  });
  it('never repeats the photo just shown when there is another', () => {
    const list = PORTRAITS.jingyi;
    for (let i = 0; i < 20; i++) expect(nextPortrait(list, list[0], () => i / 20)).not.toBe(list[0]);
    expect(nextPortrait([list[0]], list[0])).toBe(list[0]);
  });
});
