// Level: our songs. A passage plays; pick its title from four. Six right clears the level.
import './songs.css';
import { t, pick } from '../../core/i18n';
import { getPlayer, isCleared, levelNumber } from '../../core/quest';
import { levelCleared, toast } from '../../core/quest-ui';
import { escapeAttr } from '../../core/html';
import { SONGS, choices, defaultSource, qqPlayer, shuffle, songSrc, ytPlayer, type Song, type Source } from './list';

const SOURCE_KEY = 'yi.songs.source';
const readSource = (): Source | null => { try { const v = localStorage.getItem(SOURCE_KEY); return v === 'qq' || v === 'yt' ? v : null; } catch { return null; } };
const writeSource = (v: Source) => { try { localStorage.setItem(SOURCE_KEY, v); } catch { /* ignore */ } };

export function renderSongs(root: HTMLElement): () => void {
  const done = isCleared('songs');
  const order = done ? [...SONGS] : shuffle(SONGS);
  let i = 0;
  let got = 0;                       // right answers so far
  let options: Song[] = [];
  let answered = done;               // the current song's title is shown
  const wrong = new Set<string>();   // options already tried on this song
  const audio = new Audio();
  audio.preload = 'none';
  let stopAt = 0, missing = false;
  let source: Source = readSource() ?? defaultSource(getPlayer());

  root.innerHTML = `
    <section class="songs">
      <header class="songs-head sign">
        <h1>${t('songs.title')}</h1>
        <p>${t('songs.subtitle')}</p>
      </header>
      <p class="quest-task${done ? ' done' : ''}" id="so-task"></p>
      <div class="songs-card card" id="so-card"></div>
    </section>`;
  const card = root.querySelector<HTMLElement>('#so-card')!;
  const task = root.querySelector<HTMLElement>('#so-task')!;

  const song = () => order[i];
  const load = (s: Song) => {
    audio.pause();
    audio.src = `${import.meta.env.BASE_URL}${songSrc(s)}`;
    missing = false;
  };
  const play = () => {
    const s = song();
    if (!audio.src) load(s);
    audio.currentTime = s.start; stopAt = s.start + s.length;
    audio.play().catch(() => { missing = true; paint(); });
  };
  audio.addEventListener('timeupdate', () => { if (stopAt && audio.currentTime >= stopAt) audio.pause(); });
  audio.addEventListener('error', () => { missing = true; paint(); });
  audio.addEventListener('play', () => paint());
  audio.addEventListener('pause', () => paint());

  const paint = () => {
    const s = song();
    const playing = !audio.paused && !audio.ended;
    card.innerHTML = `
      <p class="so-count">${t('songs.count', { i: i + 1, n: order.length })}</p>
      ${source === 'qq' && s.qq
        ? `<div class="so-embed so-qq" aria-label="${t('songs.play')}">
            <iframe src="${qqPlayer(s.qq)}" title="${t('songs.play')}" allow="autoplay" loading="lazy"></iframe>
            <span class="so-mask so-mask-btn" aria-hidden="true"><span class="so-disc small"><i></i></span></span>
            <span class="so-mask so-mask-rest" aria-hidden="true">${t('songs.embed.qq')}</span>
          </div>
          <p class="so-hint">${t('songs.tap.embed')} · <button type="button" class="link" id="so-source">${t('songs.source.yt')}</button></p>`
        : source === 'yt' && s.yt
        ? `<div class="so-embed so-yt" aria-label="${t('songs.play')}">
            <iframe src="${ytPlayer(s.yt)}" title="${t('songs.play')}" allow="autoplay; encrypted-media" loading="lazy"></iframe>
            <span class="so-mask so-yt-top" aria-hidden="true">${t('songs.embed.yt')}</span>
            <span class="so-mask so-yt-left" aria-hidden="true"></span>
            <span class="so-mask so-yt-right" aria-hidden="true"></span>
            <span class="so-mask so-yt-bottom" aria-hidden="true"></span>
            <span class="so-mask so-yt-hole" aria-hidden="true"><span class="so-disc small"><i></i></span></span>
          </div>
          <p class="so-hint">${t('songs.tap.embed')} · <button type="button" class="link" id="so-source">${t('songs.source.qq')}</button></p>`
        : `<button type="button" class="so-play${playing ? ' on' : ''}" id="so-play" aria-label="${playing ? t('songs.pause') : t('songs.play')}">
            <span class="so-disc"><i></i></span>
          </button>
          <p class="so-hint">${missing ? t('songs.missing') : playing ? t('songs.listening') : t('songs.tap')}</p>`}
      ${answered
        ? `<div class="so-reveal">
            <p class="so-title">${escapeAttr(s.title)}</p>
            ${s.artist ? `<p class="so-artist">${escapeAttr(s.artist)}</p>` : ''}
            ${s.note ? `<p class="so-note">${escapeAttr(pick(s.note))}</p>` : ''}
            ${i + 1 < order.length ? `<button type="button" class="cta" id="so-next">${t('songs.next')}</button>` : ''}
            ${i > 0 ? `<button type="button" class="link" id="so-prev">${t('songs.prev')}</button>` : ''}
          </div>`
        : `<div class="so-options" role="group" aria-label="${t('songs.which')}">${options.map((o) =>
            `<button type="button" class="so-option${wrong.has(o.id) ? ' out' : ''}" data-id="${o.id}" ${wrong.has(o.id) ? 'disabled' : ''}>${escapeAttr(o.title)}</button>`).join('')}</div>`}`;
    const cleared = isCleared('songs');
    task.classList.toggle('done', cleared);
    task.textContent = cleared ? t('quest.cleared.eyebrow', { n: levelNumber('songs') })
      : t('quest.task.songs', { n: levelNumber('songs'), done: got, total: order.length });
  };
  const start = (k: number, asAnswered: boolean) => {
    i = k; answered = asAnswered; wrong.clear(); options = choices(song()); if (!song().qq && !song().yt) load(song()); else audio.pause(); paint();
  };

  card.addEventListener('click', (e) => {
    const el = e.target as HTMLElement;
    if (el.closest('#so-play')) { if (!audio.paused) audio.pause(); else play(); return; }
    if (el.closest('#so-source')) { source = source === 'qq' ? 'yt' : 'qq'; writeSource(source); paint(); return; }
    const opt = el.closest<HTMLButtonElement>('.so-option');
    if (opt && !answered) {
      if (opt.dataset.id === song().id) {
        answered = true; got++; paint();
        if (got === order.length) levelCleared('songs'); else toast(t('songs.right'));
      } else {
        wrong.add(opt.dataset.id!); toast(t('songs.wrong')); paint();
      }
      return;
    }
    if (el.closest('#so-next')) start(i + 1, isCleared('songs'));
    else if (el.closest('#so-prev')) start(i - 1, true);
  });

  document.body.classList.add('songs-quiz');   // the jukebox would show a title; hide it here
  start(0, done);
  return () => { audio.pause(); audio.removeAttribute('src'); document.body.classList.remove('songs-quiz'); };
}
