// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest';
import { attachMediaFallback } from './media';

describe('attachMediaFallback', () => {
  it.each(['img', 'video'])('replaces a %s that fails to load with the notice', (tag) => {
    const root = document.createElement('div');
    root.innerHTML = `<div class="card-media"><${tag} src="media/missing.x"></${tag}></div>`;
    attachMediaFallback(root, 'This photo is still on its way');
    root.querySelector(tag)!.dispatchEvent(new Event('error'));
    expect(root.querySelector(tag)).toBeNull();
    const notice = root.querySelector('.media-missing')!;
    expect(notice.textContent).toBe('This photo is still on its way');
  });
});
