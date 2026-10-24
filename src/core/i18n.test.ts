import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

beforeEach(() => vi.resetModules());
afterEach(() => vi.unstubAllGlobals());

describe('i18n', () => {
  it('has the same non-empty keys in zh and en', async () => {
    const { dict } = await import('./i18n');
    expect(Object.keys(dict.en).sort()).toEqual(Object.keys(dict.zh).sort());
    for (const lang of ['zh', 'en'] as const)
      for (const [k, v] of Object.entries(dict[lang])) expect(v, `${lang}.${k}`).not.toBe('');
  });

  it('defaults to Chinese when storage throws', async () => {
    vi.stubGlobal('localStorage', { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } });
    const { getLang, setLang } = await import('./i18n');
    expect(getLang()).toBe('zh');
    expect(() => setLang('en')).not.toThrow();
    expect(getLang()).toBe('en');
  });

  it('restores a saved language and notifies listeners', async () => {
    const store: Record<string, string> = { 'yi.lang': 'en' };
    vi.stubGlobal('localStorage', { getItem: (k: string) => store[k] ?? null, setItem: (k: string, v: string) => { store[k] = v; } });
    const { getLang, setLang, onLangChange, t } = await import('./i18n');
    expect(getLang()).toBe('en');
    const seen: string[] = [];
    onLangChange((l) => seen.push(l));
    setLang('zh');
    expect(seen).toEqual(['zh']);
    expect(store['yi.lang']).toBe('zh');
    expect(t('home.diff', { h: 13 })).toContain('13');
  });

  it('pick returns the current language', async () => {
    const { pick, setLang } = await import('./i18n');
    setLang('en');
    expect(pick({ zh: '你好', en: 'Hello' })).toBe('Hello');
  });
});
