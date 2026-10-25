import './styles/base.css';
import { t, getLang, setLang, onLangChange } from './core/i18n';
import { renderHome } from './features/home/home';
import { renderMap } from './features/birthday-map/map';
import { renderGomoku } from './features/gomoku/gomoku';
import { renderPictionary } from './features/pictionary/pictionary';

export type Page = (root: HTMLElement) => () => void;

const routes: Record<string, Page> = { '/': renderHome, '/map': renderMap, '/gomoku': renderGomoku, '/draw': renderPictionary };
const viewClass: Record<string, string> = { '/': 'home', '/map': 'map', '/gomoku': 'gomoku', '/draw': 'draw' };
const GAMES = ['/gomoku', '/draw'];
const app = document.querySelector<HTMLElement>('#app')!;
let cleanup: (() => void) | undefined;

const currentPath = () => (location.hash.slice(1) in routes ? location.hash.slice(1) : '/');

function render(): void {
  cleanup?.();
  const path = currentPath();
  const lang = getLang();
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = `${t('site.title')} · ${lang === 'zh' ? 'Yi at First Sight' : '仪见钟情'}`;
  const link = (href: string, key: 'nav.home' | 'nav.map' | 'nav.games') => {
    const active = path === href || (href === '/gomoku' && GAMES.includes(path));
    return `<a href="#${href}" class="${active ? 'active' : ''}">${t(key)}</a>`;
  };
  app.innerHTML = `
    <header class="topbar">
      <a class="brand" href="#/"><span class="brand-zh">仪见钟情</span><span class="brand-en">Yi at First Sight</span></a>
      <nav>${link('/', 'nav.home')}${link('/map', 'nav.map')}${link('/gomoku', 'nav.games')}</nav>
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
