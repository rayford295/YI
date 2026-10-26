// The switcher shown at the top of every game page.
import './tabs.css';
import { t } from '../../core/i18n';

const GAMES = [
  { href: '/gomoku', key: 'gomoku.title' },
  { href: '/draw', key: 'pictionary.title' },
] as const;

export function gameTabs(current: '/gomoku' | '/draw'): string {
  return `<nav class="game-tabs">${GAMES.map((g) =>
    `<a href="${g.href}"${g.href === current ? ' class="active" aria-current="page"' : ''}>${t(g.key)}</a>`).join('')}</nav>`;
}
