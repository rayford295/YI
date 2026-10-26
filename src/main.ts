import './styles/base.css';
import { registerSW } from 'virtual:pwa-register';
import { t, getLang, setLang, onLangChange } from './core/i18n';
import { renderStart } from './features/start/start';
import { renderJourney } from './features/journey/journey';
import { renderWorld } from './features/world/world';
import { getPlayer, isUnlocked, levelByRoute, clearedByAll } from './core/quest';
import { avatarHtml, toast } from './core/quest-ui';
import { gatePassed } from './core/gate';
import { renderGate } from './features/gate/gate';
import { interceptLinks, onNavigate, resolve } from './core/router';
import { closeDoors, enteredThrough } from './core/door';
import { mountJukebox } from './features/music/jukebox';

export type Page = (root: HTMLElement) => () => void;

// Start, the town and the list view ship in the main bundle; every level loads on first visit, so the
// first paint does not carry Leaflet, three.js or MediaPipe.
const routes: Record<string, () => Promise<Page>> = {
  '/': async () => renderWorld,
  '/journey': async () => renderJourney,
  '/start': async () => renderStart,
  '/met': () => import('./features/home/home').then((m) => m.renderHome),
  '/map': () => import('./features/birthday-map/map').then((m) => m.renderMap),
  '/moments': () => import('./features/moments/moments').then((m) => m.renderMoments),
  '/puzzle': () => import('./features/puzzle/puzzle').then((m) => m.renderPuzzle),
  '/stars': () => import('./features/stars/stars').then((m) => m.renderStars),
  '/letter': () => import('./features/letter/letter').then((m) => m.renderLetter),
  '/gomoku': () => import('./features/gomoku/gomoku').then((m) => m.renderGomoku),
  '/draw': () => import('./features/pictionary/pictionary').then((m) => m.renderPictionary),
  '/ring': () => import('./features/ring/ring').then((m) => m.renderRing),
  '/sync': () => import('./features/sync/sync').then((m) => m.renderSync),
  '/cs': () => import('./features/days/render').then((m) => m.renderCS),
  '/sz': () => import('./features/days/render').then((m) => m.renderSZ),
};
const viewClass: Record<string, string> = { '/': 'world', '/journey': 'journey', '/start': 'start', '/met': 'home', '/map': 'map', '/moments': 'moments', '/puzzle': 'puzzle', '/gomoku': 'gomoku', '/draw': 'draw', '/stars': 'stars', '/ring': 'ring', '/letter': 'letter', '/sync': 'sync', '/cs': 'day', '/sz': 'day' };
const app = document.querySelector<HTMLElement>('#app')!;
let cleanup: (() => void) | undefined;
let renderSeq = 0;   // a navigation that starts while a page is still loading wins

// The address is a plain path (/sync?c=J7K); an old #/ link is read the same way and rewritten.
const asked = () => resolve(location);
const currentPath = () => (asked().path in routes ? asked().path : '/');

import { refreshMeadow, startMeadow } from './features/world/meadow';

async function render(): Promise<void> {
  startMeadow(); refreshMeadow();
  const seq = ++renderSeq;
  cleanup?.();
  cleanup = undefined;
  let path = currentPath();
  // The front door comes before everything: one question, answered once per device.
  if (!gatePassed()) {
    document.documentElement.lang = getLang() === 'zh' ? 'zh-CN' : 'en';
    app.innerHTML = `<header class="topbar"><a class="brand" href="/"><span class="brand-zh">仪见钟情</span><span class="brand-en">Yi at First Sight</span></a>
      <button class="lang-btn" id="lang-btn" type="button">${t('lang.toggle')}</button></header><main id="view" class="view view-gate"></main>`;
    app.querySelector('#lang-btn')!.addEventListener('click', () => setLang(getLang() === 'zh' ? 'en' : 'zh'));
    cleanup = renderGate(app.querySelector<HTMLElement>('#view')!, () => { void render(); });
    return;
  }
  // The journey's rules: pick a player first; a locked level sends you back to the map.
  if (!getPlayer()) path = '/start';
  else if (path === '/start') path = '/';
  else {
    const level = levelByRoute(path);
    if (level && !isUnlocked(level.id)) { path = '/'; toast(t('quest.locked')); }
    // A level opens only from its door: no top-bar link, no typed address, no 'next' button.
    else if (level && !enteredThrough(path)) { path = '/'; toast(t('quest.walk')); }
    // The epilogue is not a level: it opens once both players have reached the ring on this device.
    if (path === '/letter' && !isUnlocked('ring')) { path = '/'; toast(t('quest.locked')); }
  }
  // Settle the address: a redirect, an old #/ link or a trailing slash all become the clean path.
  if (path === '/') closeDoors();
  const want = path === '/start' ? '/start' : path === asked().path ? path + asked().search : path;
  if (want !== location.pathname + location.search || location.hash) history.replaceState(null, '', want);
  const lang = getLang();
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = `${t('site.title')} · ${lang === 'zh' ? 'Yi at First Sight' : '仪见钟情'}`;
  const link = (href: string, label: string) => {
    const active = path === href;
    return `<a href="${href}" class="${active ? 'active' : ''}">${label}</a>`;
  };
  const player = getPlayer();
  // The top bar never links to a level: every house is entered on foot. Only the town and, at the
  // end, the epilogue.
  const navLinks = player
    ? [link('/', t('nav.journey')), ...(clearedByAll('ring') ? [link('/letter', t('letter.title'))] : [])].join('')
    : '';
  app.innerHTML = `
    <header class="topbar">
      <a class="brand" href="/"><span class="brand-zh">仪见钟情</span><span class="brand-en">Yi at First Sight</span></a>
      <nav>${navLinks}</nav>
      ${player ? `<a class="topbar-avatar" href="/" aria-label="${t('nav.journey')}">${avatarHtml(player)}</a>` : ''}
      <button class="lang-btn" id="lang-btn" type="button">${t('lang.toggle')}</button>
    </header>
    <main id="view" class="view view-${viewClass[path]}"></main>
    <div class="floating-hearts" aria-hidden="true">${'<i>❤</i>'.repeat(12)}</div>`;
  app.querySelector('#lang-btn')!.addEventListener('click', () => setLang(getLang() === 'zh' ? 'en' : 'zh'));
  window.scrollTo(0, 0);
  const page = await routes[path]();
  if (seq !== renderSeq) return;
  cleanup = page(app.querySelector<HTMLElement>('#view')!);
}

// Offline shell + 'add to home screen'. Updates install quietly on the next visit.
registerSW({ immediate: true });

onLangChange(() => { void render(); });
interceptLinks();
mountJukebox();
onNavigate(() => { void render(); });
void render();
