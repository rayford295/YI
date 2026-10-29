import './moments.css';
import { t, pick, getLang } from '../../core/i18n';
import { config } from '../../core/config';
import { dayOfYmd, formatDate } from '../../core/dates';
import { sortedMemories, type Memory } from './memories';
import { attachMediaFallback } from '../birthday-map/media';
import { escapeAttr } from '../../core/html';
import { getPlayer, isCleared, levelNumber } from '../../core/quest';
import { levelCleared, toast } from '../../core/quest-ui';
import { liveKey, sessionState } from '../../core/storage';

import { shuffle } from '../../core/random';
import { mountPuzzle } from '../puzzle/puzzle';

const PUZZLE_SIZE = 5;

export interface MomentsLive { ids: string[]; ordered: boolean }
/** The days being ordered, in their current arrangement, from what the tab remembers; null means start afresh. */
export function restoreOrder(saved: unknown, list: readonly Memory[], size = PUZZLE_SIZE): { order: Memory[]; ordered: boolean } | null {
  const s = (saved ?? {}) as Partial<MomentsLive>;
  if (!Array.isArray(s.ids) || s.ids.length !== Math.min(size, list.length) || new Set(s.ids).size !== s.ids.length) return null;
  const order = s.ids.map((id) => list.find((m) => m.id === id));
  return order.every((m): m is Memory => !!m) ? { order, ordered: s.ordered === true } : null;
}

function mediaHtml(m: Memory): string {
  return m.media
    .map((md) =>
      md.type === 'video'
        ? `<video src="${md.src}" controls playsinline preload="metadata" aria-label="${escapeAttr(pick(md.alt))}"></video>`
        : `<img src="${md.src}" alt="${escapeAttr(pick(md.alt))}" loading="lazy" />`,
    )
    .join('');
}

export function renderMoments(root: HTMLElement): () => void {
  const lang = getLang();
  const list = sortedMemories();
  root.innerHTML = `
    <section class="moments">
      <header class="moments-head sign">
        <h1>${t('moments.title')}</h1>
        <p>${t('moments.subtitle')}</p>
        <p class="moments-count">${t('moments.count', { n: list.length })}</p>
      </header>
      ${isCleared('moments') ? `<p class="quest-task done">${t('quest.cleared.eyebrow', { n: levelNumber('moments') })}</p>` : `
      <section class="order card" id="order">
        <p class="quest-task">${t('quest.task.moments', { n: levelNumber('moments') })}</p>
        <ol class="order-list" id="order-list"></ol>
        <button type="button" class="btn" id="order-check">${t('quest.task.moments.check')}</button>
      </section>`}
      <div class="moments-puzzle" id="moments-puzzle" ${isCleared('moments') ? '' : 'hidden'}></div>
      <ol class="timeline">
        ${list.map((m, i) => `
        <li class="moment${i % 2 ? ' flip' : ''}" style="--i:${i}">
          <div class="moment-dot" aria-hidden="true">❤</div>
          <article class="moment-card card">
            <div class="moment-media${m.media.length > 1 ? ' multi' : ''}">${mediaHtml(m)}</div>
            <div class="moment-body">
              <p class="moment-meta">
                <span class="moment-day">${t('moments.day', { n: dayOfYmd(config.metOn, m.date) })}</span>
                ${formatDate(m.date, lang)} · ${pick(m.place.name)}
              </p>
              <h2>${pick(m.title)}</h2>
              <p>${pick(m.text)}</p>
            </div>
          </article>
        </li>`).join('')}
        <li class="moment more" style="--i:${list.length}">
          <div class="moment-dot" aria-hidden="true">✦</div>
          <p class="moment-more">${t('moments.more')}</p>
        </li>
      </ol>
      <a class="cta" href="/town">${t('quest.back.town')}</a>
    </section>`;
  attachMediaFallback(root, t('map.media.missing'));

  if (!isCleared('moments')) {
    // The days drawn and their arrangement outlive a language toggle (which re-renders the page);
    // the photo puzzle after them is quick and starts over.
    const live = sessionState<MomentsLive>(liveKey('moments', getPlayer() ?? 'jingyi'));
    const was = restoreOrder(live.get(), list);
    let order: Memory[];
    if (was) order = was.order;
    else {
      const pool = shuffle(list).slice(0, PUZZLE_SIZE);
      order = shuffle(pool);
      if (order.every((m, i) => m === [...pool].sort((a, b) => a.date.localeCompare(b.date))[i])) order = [...order.slice(1), order[0]];
    }
    let ordered = was?.ordered ?? false;
    const remember = () => live.set({ ids: order.map((m) => m.id), ordered });
    let picked = -1;
    const ol = root.querySelector<HTMLElement>('#order-list')!;
    const paint = () => {
      ol.innerHTML = order.map((m, i) => `<li><button type="button" class="order-item${i === picked ? ' picked' : ''}" data-i="${i}"${ordered ? ' disabled' : ''}><span>${i + 1}</span>${pick(m.title)}</button></li>`).join('');
    };
    const showPuzzle = (scroll: boolean) => {
      root.querySelector('#order .quest-task')!.classList.add('done');
      root.querySelector('#order .quest-task')!.textContent = t('quest.task.moments.ordered');
      root.querySelector<HTMLButtonElement>('#order-check')!.hidden = true;
      const host = root.querySelector<HTMLElement>('#moments-puzzle')!;
      host.hidden = false;
      mountPuzzle(host, false, () => levelCleared('moments'));
      if (scroll) host.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    paint();
    remember();
    if (ordered) showPuzzle(false);
    ol.addEventListener('click', (e) => {
      const b = (e.target as HTMLElement).closest<HTMLButtonElement>('.order-item');
      if (!b || ordered) return;
      const i = Number(b.dataset.i);
      if (picked < 0) picked = i;
      else { [order[picked], order[i]] = [order[i], order[picked]]; picked = -1; remember(); }
      paint();
    });
    root.querySelector('#order-check')!.addEventListener('click', () => {
      const ok = order.every((m, i) => i === 0 || order[i - 1].date <= m.date);
      if (!ok) { toast(t('quest.task.moments.wrong')); return; }
      ordered = true; remember(); paint();
      showPuzzle(true);
    });
  } else {
    mountPuzzle(root.querySelector<HTMLElement>('#moments-puzzle')!, true, () => undefined);
  }
  return () => undefined;
}
