// Epilogue: the last letter. It opens only when both players have cleared the ring on this device.
import './letter.css';
import { t, pick, getLang } from '../../core/i18n';
import { config } from '../../core/config';
import { hoursApart } from '../../core/dates';
import { letter, letterParagraphs } from '../birthday-map/letter';
import { PLAYERS, clearedByAll, isCleared } from '../../core/quest';
import { avatarHtml, playerName } from '../../core/quest-ui';

export function renderLetter(root: HTMLElement): () => void {
  const open = clearedByAll('ring');
  const here = PLAYERS.filter((p) => isCleared('ring', p));
  root.innerHTML = `
    <section class="letter-page">
      <header class="letter-head sign">
        <p class="eyebrow">${t('letter.eyebrow')}</p>
        <h1>${t('letter.title')}</h1>
        <div class="letter-seals">${PLAYERS.map((p) => `<span class="seal${isCleared('ring', p) ? ' lit' : ''}">${avatarHtml(p)}</span>`).join('')}</div>
      </header>
      ${open ? `
      <article class="letter card">
        ${letterParagraphs(getLang(), hoursApart(config.her.zone, config.him.zone, new Date())).map((p) => `<p>${p}</p>`).join('')}
        <p class="signature">— ${pick(letter.signature)}</p>
      </article>` : `
      <p class="letter-locked card">${here.length === 1 ? t('letter.locked.one', { name: playerName(here[0]) }) : t('letter.locked')}</p>`}
      <a class="cta" href="/town">${t('letter.back')}</a>
    </section>`;
  return () => undefined;
}
