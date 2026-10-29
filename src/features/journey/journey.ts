// The journey list: one node per level along a gold meridian. The fallback view of the town (/journey).
import './journey.css';
import { t } from '../../core/i18n';
import { LEVELS, getPlayer, isCleared, isUnlocked, current, reset, setPlayer, onQuestChange, clearedByAll } from '../../core/quest';
import { avatarHtml, playerName } from '../../core/quest-ui';
import { escapeAttr } from '../../core/html';
import { go as navigate } from '../../core/router';

export function renderJourney(root: HTMLElement): () => void {
  mountJourney(root);
  return onQuestChange(() => { if (getPlayer()) mountJourney(root); });
}

function mountJourney(root: HTMLElement): void {
  const p = getPlayer()!;
  const cur = current(p);
  const done = LEVELS.filter((l) => isCleared(l.id, p)).length;

  // Node positions along a gentle S curve, from bottom-left to top-right.
  const W = 600, H = 120 + LEVELS.length * 92;
  const pos = LEVELS.map((_, i) => {
    const k = i / Math.max(LEVELS.length - 1, 1);
    const x = 120 + (W - 240) * (0.5 + 0.5 * Math.sin((k * Math.PI * 2) - Math.PI / 2 + 0.3)) ;
    const y = H - 70 - k * (H - 140);
    return { x, y };
  });
  const path = pos.map((q, i) => (i === 0 ? `M ${q.x} ${q.y}` : `C ${pos[i - 1].x} ${pos[i - 1].y - 50}, ${q.x} ${q.y + 50}, ${q.x} ${q.y}`)).join(' ');
  const litUntil = Math.max(0, LEVELS.findIndex((l) => !isCleared(l.id, p)));
  const litPath = pos.slice(0, litUntil + 1).map((q, i) => (i === 0 ? `M ${q.x} ${q.y}` : `C ${pos[i - 1].x} ${pos[i - 1].y - 50}, ${q.x} ${q.y + 50}, ${q.x} ${q.y}`)).join(' ');

  const nodes = LEVELS.map((l, i) => {
    const cleared = isCleared(l.id, p), open = isUnlocked(l.id, p);
    const state = cleared ? 'cleared' : open ? 'current' : 'locked';
    const { x, y } = pos[i];
    const glyph = cleared ? '✓' : open ? String(i + 1) : '🔒';
    const label = escapeAttr(t(l.title));
    const inner = `<circle r="26"/><text class="glyph" dy="0.35em">${glyph}</text><text class="label" y="48">${label}</text>`;
    // A list to read, not a shortcut: every level is entered through its door in the town.
    return `<g class="node ${state}" role="listitem" transform="translate(${x} ${y})" aria-label="${label}">${inner}</g>`;
  }).join('');

  root.innerHTML = `
    <section class="journey">
      <header class="journey-head sign">
        ${avatarHtml(p, 'big')}
        <p class="eyebrow">${t('journey.eyebrow', { name: playerName(p) })}</p>
        <h1>${t('journey.title')}</h1>
        <p class="journey-sub">${cur ? t('journey.progress', { done, total: LEVELS.length, next: t(cur.title) }) : t('journey.complete')}</p>
      </header>
      <div class="journey-map card">
        <svg viewBox="0 0 ${W} ${H}" role="list" aria-label="${escapeAttr(t('journey.title'))}">
          <path class="meridian" d="${path}"/>
          <path class="meridian lit" d="${litPath}"/>
          ${nodes}
        </svg>
      </div>
      ${isCleared('ring', p) ? `<a class="cta journey-epilogue${clearedByAll('ring') ? '' : ' sealed'}" href="/letter">${t('journey.epilogue')}</a>` : ''}
      <p class="journey-foot">
        <a href="/town">${t('world.town')}</a>
        <span aria-hidden="true"> · </span>
        <button type="button" class="link" id="journey-switch">${t('journey.switch')}</button>
        <span aria-hidden="true"> · </span>
        <button type="button" class="link" id="journey-reset">${t('journey.reset')}</button>
      </p>
    </section>`;

  root.querySelector('#journey-switch')!.addEventListener('click', () => { setPlayer(null); navigate('/start'); });
  root.querySelector('#journey-reset')!.addEventListener('click', () => { if (window.confirm(t('journey.reset.confirm'))) reset(p); });
}
