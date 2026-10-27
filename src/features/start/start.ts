// Pick a player. Shown before anything else until a player is chosen.
import './start.css';
import { go, refresh } from '../../core/router';
import { t } from '../../core/i18n';
import { setPlayer, type PlayerId } from '../../core/quest';
import { avatarHtml, playerName } from '../../core/quest-ui';

export function renderStart(root: HTMLElement): () => void {
  const card = (p: PlayerId) => `
    <button type="button" class="start-card" data-player="${p}">
      ${avatarHtml(p, 'big')}
      <strong>${playerName(p)}</strong>
      <span>${t(`start.as.${p}`)}</span>
    </button>`;
  root.innerHTML = `
    <section class="start">
      <header class="sign start-head">
        <p class="eyebrow">${t('start.eyebrow')}</p>
        <h1>${t('start.title')}</h1>
        <p class="start-sub">${t('start.subtitle')}</p>
      </header>
      <div class="start-cards">${card('jingyi')}${card('yifan')}</div>
    </section>`;
  root.querySelectorAll<HTMLButtonElement>('.start-card').forEach((b) => b.addEventListener('click', () => {
    setPlayer(b.dataset.player as PlayerId);
    // The picker stands in for whatever page was asked for (/, or a link such as /sync?c=J7A),
    // so keep that address and ask the router to render it; only /start itself goes to the town.
    if (location.pathname === '/start') go('/town'); else refresh();
  }));
  return () => undefined;
}
