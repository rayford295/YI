import { describe, expect, it } from 'vitest';
import { escapeAttr } from './html';

describe('escapeAttr', () => {
  it('neutralises quotes and angle brackets so captions cannot break out of an attribute', () => {
    expect(escapeAttr(`Jingyi's "ticket" <3 & more`)).toBe('Jingyi&#39;s &#34;ticket&#34; &#60;3 &#38; more');
  });
  it('leaves ordinary text and Chinese untouched', () => {
    expect(escapeAttr('第一次送你花 · CYF925')).toBe('第一次送你花 · CYF925');
  });
});
