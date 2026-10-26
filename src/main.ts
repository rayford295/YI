import './styles/base.css';
import { t, getLang, setLang, onLangChange } from './core/i18n';
import { renderHome } from './features/home/home';
import { renderMap } from './features/birthday-map/map';
import { renderGomoku } from './features/gomoku/gomoku';
import { renderPictionary } from './features/pictionary/pictionary';
import { renderMoments } from './features/moments/moments';
import { renderRing } from './features/ring/ring';
import { renderStart } from './features/start/start';
import { renderJourney } from './features/journey/journey';
import { LEVELS, getPlayer, isUnlocked, levelByRoute } from './core/quest';
import { avatarHtml, toast } from './core/quest-ui';

export type Page = (root: HTMLElement) => () => void;

const routes: Record<string, Page> = { '/': renderJourney, '/start': renderStart, '/met': renderHome, '/map': renderMap, '/moments': renderMoments, '/gomoku': renderGomoku, '/draw': renderPictionary, '/ring': renderRing };
const viewClass: Record<string, string> = { '/': 'journey', '/start': 'start', '/met': 'home', '/map': 'map', '/moments': 'moments', '/gomoku': 'gomoku', '/draw': 'draw', '/ring': 'ring' };
const GAMES = ['/gomoku', '/draw'];
const app = document.querySelector<HTMLElement>('#app')!;
let cleanup: (() => void) | undefined;

const currentPath = () => (location.hash.slice(1) in routes ? location.hash.slice(1) : '/');

function render(): void {
  cleanup?.();
  let path = currentPath();
  // The journey's rules: pick a player first; a locked level sends you back to the map.
  if (!getPlayer()) path = '/start';
  else if (path === '/start') path = '/';
  else {
    const level = levelByRoute(path);
    if (level && !isUnlocked(level.id)) { path = '/'; toast(t('quest.locked')); }
  }
  if (`#${path}` !== location.hash && path !== '/start') history.replaceState(null, '', `#${path}`);
  const lang = getLang();
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = `${t('site.title')} · ${lang === 'zh' ? 'Yi at First Sight' : '仪见钟情'}`;
  const link = (href: string, label: string) => {
    const active = path === href || (href === '/gomoku' && GAMES.includes(path));
    return `<a href="#${href}" class="${active ? 'active' : ''}">${label}</a>`;
  };
  const player = getPlayer();
  // Only unlocked levels appear in the top bar; games share one entry.
  const navLinks = player
    ? [link('/', t('nav.journey')), ...LEVELS.filter((l) => l.route !== '/draw' && isUnlocked(l.id, player)).map((l) => link(l.route, t(l.title)))].join('')
    : '';
  app.innerHTML = `
    <header class="topbar">
      <a class="brand" href="#/"><span class="brand-zh">仪见钟情</span><span class="brand-en">Yi at First Sight</span></a>
      <nav>${navLinks}</nav>
      ${player ? `<a class="topbar-avatar" href="#/" aria-label="${t('nav.journey')}">${avatarHtml(player)}</a>` : ''}
      <button class="lang-btn" id="lang-btn" type="button">${t('lang.toggle')}</button>
    </header>
    <main id="view" class="view view-${viewClass[path]}"></main>
    <div class="floating-hearts" aria-hidden="true">${'<i>❤</i>'.repeat(12)}</div>`;
  app.querySelector('#lang-btn')!.addEventListener('click', () => setLang(getLang() === 'zh' ? 'en' : 'zh'));
  window.scrollTo(0, 0);
  cleanup = routes[path](app.querySelector<HTMLElement>('#view')!);
}

onLangChange(render);
window.addEventListener('hashchange', render);
render();
