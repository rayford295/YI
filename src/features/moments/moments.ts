import './moments.css';
import { t, pick, getLang } from '../../core/i18n';
import { config } from '../../core/config';
import { dayOfYmd, formatDate } from '../../core/dates';
import { sortedMemories, type Memory } from './memories';
import { attachMediaFallback } from '../birthday-map/media';
import { escapeAttr } from '../../core/html';

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
      <header class="moments-head">
        <h1>${t('moments.title')}</h1>
        <p>${t('moments.subtitle')}</p>
        <p class="moments-count">${t('moments.count', { n: list.length })}</p>
      </header>
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
      <a class="cta" href="#/map">${t('moments.map')} →</a>
    </section>`;
  attachMediaFallback(root, t('map.media.missing'));
  return () => undefined;
}
