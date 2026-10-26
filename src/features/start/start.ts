// Pick a player. Shown before anything else until a player is chosen.
import './start.css';
import { t } from '../../core/i18n';
import { setPlayer, type PlayerId } from '../../core/quest';
import { avatarHtml, playerName } from '../../core/quest-ui';
import { applyMeadow } from '../world/meadow';

export function renderStart(root: HTMLElement): () => void {
  const meadow = applyMeadow();   // the picker stands on the same meadow as the town
  const card = (p: PlayerId) => `
    <button type="button" class="start-card" data-player="${p}">
      ${avatarHtml(p, 'big')}
      <strong>${playerName(p)}</strong>
      <span>${t(`start.as.${p}`)}</span>
    </button>`;
  root.innerHTML = `
    <section class="start">
      <p class="eyebrow">${t('start.eyebrow')}</p>
      <h1>${t('start.title')}</h1>
      <p class="start-sub">${t('start.subtitle')}</p>
      <div class="start-cards">${card('jingyi')}${card('yifan')}</div>
    </section>`;
  root.querySelectorAll<HTMLButtonElement>('.start-card').forEach((b) => b.addEventListener('click', () => {
    setPlayer(b.dataset.player as PlayerId);
    // When the address is already #/ (the start page is shown in its place), setting the hash
    // again changes nothing and fires no event, so ask the router to render explicitly.
    if (location.hash === '#/') window.dispatchEvent(new HashChangeEvent('hashchange'));
    else location.hash = '#/';
  }));
  return () => meadow.remove();
}
