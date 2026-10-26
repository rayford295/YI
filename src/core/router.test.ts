import { describe, expect, it } from 'vitest';
import { normalise, resolve } from './router';

describe('router', () => {
  it('reads the route from the path and keeps the query', () => {
    expect(resolve({ pathname: '/cs', search: '', hash: '' })).toEqual({ path: '/cs', search: '' });
    expect(resolve({ pathname: '/sync', search: '?c=J7A', hash: '' })).toEqual({ path: '/sync', search: '?c=J7A' });
    expect(resolve({ pathname: '/', search: '', hash: '' })).toEqual({ path: '/', search: '' });
  });
  it('still honours links sent before the hash went away', () => {
    expect(resolve({ pathname: '/', search: '', hash: '#/sync?c=J7A' })).toEqual({ path: '/sync', search: '?c=J7A' });
    expect(resolve({ pathname: '/', search: '', hash: '#/cs' })).toEqual({ path: '/cs', search: '' });
    expect(resolve({ pathname: '/', search: '', hash: '#/' })).toEqual({ path: '/', search: '' });
  });
  it('normalises slashes', () => {
    expect(normalise('/cs/')).toBe('/cs');
    expect(normalise('//cs//')).toBe('/cs');
    expect(normalise('')).toBe('/');
    expect(normalise('/')).toBe('/');
  });
});
