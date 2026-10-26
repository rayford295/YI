// Path routing without a server. The site is static: GitHub Pages serves 404.html (a copy of
// index.html, made at build time) for any path it has no file for, so /cs loads the app and the
// app reads location.pathname. Links are plain <a href="/cs">; a click on one is turned into a
// pushState here, and the router re-renders on 'yi:navigate' and on popstate (back / forward).

export interface Resolved { path: string; search: string }

/** The route a location means. Old links (#/sync?c=J7K) still work: a hash that carries a route wins. */
export function resolve(loc: { pathname: string; search: string; hash: string }): Resolved {
  if (loc.hash.startsWith('#/')) {
    const [p, q] = loc.hash.slice(1).split('?');
    return { path: normalise(p), search: q ? `?${q}` : '' };
  }
  return { path: normalise(loc.pathname), search: loc.search };
}

/** '/cs/' and '//cs' are '/cs'; anything empty is the home page. */
export function normalise(pathname: string): string {
  const p = pathname.replace(/\/{2,}/g, '/').replace(/\/+$/, '');
  return p === '' ? '/' : p;
}

const NAVIGATE = 'yi:navigate';

export function go(path: string): void {
  if (path !== location.pathname + location.search) history.pushState(null, '', path);
  window.dispatchEvent(new Event(NAVIGATE));
}

/** Render the current address again (after a player is picked, for instance). */
export const refresh = (): void => { window.dispatchEvent(new Event(NAVIGATE)); };

export function onNavigate(fn: () => void): void {
  window.addEventListener(NAVIGATE, fn);
  window.addEventListener('popstate', fn);
}

/** Same-origin links with a root-relative href navigate in place; everything else is left to the browser. */
export function interceptLinks(): void {
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as Element | null)?.closest?.('a[href]');
    if (!(a instanceof HTMLAnchorElement) || a.target || a.hasAttribute('download')) return;
    const href = a.getAttribute('href') ?? '';
    if (!href.startsWith('/') || href.startsWith('//')) return;
    e.preventDefault();
    go(href);
  });
}
