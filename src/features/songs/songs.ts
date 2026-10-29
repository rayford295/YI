// Level: our songs. A passage plays; pick its title from four. Six right clears the level.
// The four titles unlock only after the passage has been heard, and a wrong pick reshuffles
// them, so tapping through the options never gets you there without listening.
import './songs.css';
import { t, pick } from '../../core/i18n';
import { getPlayer, isCleared, levelNumber } from '../../core/quest';
import { levelCleared, toast } from '../../core/quest-ui';
import { escapeAttr } from '../../core/html';
import { SONGS, choices, defaultSource, qqPlayer, songSrc, ytPlayer, type Song, type Source } from './list';
import { shuffle } from '../../core/random';
import { pauseJukebox } from '../music/jukebox';
import { liveKey, sessionState } from '../../core/storage';

const SOURCE_KEY = 'yi.songs.source';
const readSource = (): Source | null => { try { const v = localStorage.getItem(SOURCE_KEY); return v === 'qq' || v === 'yt' ? v : null; } catch { return null; } };
const writeSource = (v: Source) => { try { localStorage.setItem(SOURCE_KEY, v); } catch { /* ignore */ } };
/** An embedded (QQ / YouTube) player gives no play event, so its passage counts as heard after this long on screen. */
const EMBED_HEARD_MS = 8000;

export interface SongsLive { order: string[]; i: number; answered: string[]; heard: string[] }
/** The visit's order, place, right answers and passages heard, from what the tab remembers. */
export function restoreSongs(saved: unknown, all: readonly Song[], done: boolean, rnd: () => number = Math.random): { order: Song[]; i: number; answered: Set<string>; heard: Set<string> } {
  const ids = all.map((s) => s.id);
  if (done) return { order: [...all], i: 0, answered: new Set(ids), heard: new Set(ids) };
  const s = (saved ?? {}) as Partial<SongsLive>;
  const known = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && ids.includes(x)) : []);
  const savedOrder = known(s.order);
  const samePermutation = savedOrder.length === ids.length && new Set(savedOrder).size === ids.length;
  const order = samePermutation ? savedOrder.map((id) => all.find((x) => x.id === id)!) : shuffle(all, rnd);
  const i = typeof s.i === 'number' && Number.isInteger(s.i) && s.i >= 0 && s.i < order.length ? s.i : 0;
  return { order, i, answered: new Set(known(s.answered)), heard: new Set(known(s.heard)) };
}

export function renderSongs(root: HTMLElement): () => void {
  const done = isCleared('songs');
  const live = sessionState<SongsLive>(liveKey('songs', getPlayer() ?? 'jingyi'));   // a language toggle re-renders the page
  const was = restoreSongs(live.get(), SONGS, done);
  const order = was.order;
  let i = was.i;
  const answeredIds = was.answered;   // songs named right
  const heard = was.heard;            // songs whose passage has played (or been on screen) at least once
  const remember = () => { if (!isCleared('songs')) live.set({ order: order.map((s) => s.id), i, answered: [...answeredIds], heard: [...heard] }); };
  let options: Song[] = [];
  let answered = done;               // the current song's title is shown
  const audio = new Audio();
  audio.preload = 'none';
  let stopAt = 0, missing = false;
  let embedTimer = 0, embedFor = '';   // the song whose embed is being timed
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
  audio.addEventListener('play', () => { heard.add(song().id); remember(); paint(); });
  audio.addEventListener('pause', () => paint());

  /** The players are 330 px wide; on a narrower card, scale the whole frame (masks included) down. */
  const fit = () => {
    const embed = card.querySelector<HTMLElement>('.so-embed'), frame = card.querySelector<HTMLElement>('.so-frame');
    if (!embed || !frame) return;
    const base = embed.classList.contains('so-yt') ? 186 : 86;
    const k = Math.min(1, embed.clientWidth / 330);
    frame.style.transform = `scale(${k})`;
    embed.style.height = `${Math.round(base * k)}px`;
  };
  const paint = () => {
    const s = song();
    const playing = !audio.paused && !audio.ended;
    const embedded = (source === 'qq' && !!s.qq) || (source === 'yt' && !!s.yt);
    if (embedded && !answered && !heard.has(s.id) && embedFor !== s.id) {   // playback inside the iframe cannot be seen: time it on screen instead
      clearTimeout(embedTimer); embedFor = s.id;
      embedTimer = window.setTimeout(() => { heard.add(s.id); remember(); paint(); }, EMBED_HEARD_MS);
    }
    const canPick = heard.has(s.id) || (!embedded && missing);   // no file to hear: go with your gut
    card.innerHTML = `
      <p class="so-count">${t('songs.count', { i: i + 1, n: order.length })}</p>
      ${source === 'qq' && s.qq
        ? `<div class="so-embed so-qq" aria-label="${t('songs.play')}"><div class="so-frame">
            <iframe src="${qqPlayer(s.qq)}" title="${t('songs.play')}" allow="autoplay" loading="lazy"></iframe>
            <span class="so-mask so-mask-btn" aria-hidden="true"><span class="so-disc small"><i></i></span></span>
            <span class="so-mask so-mask-rest" aria-hidden="true">${t('songs.embed.qq')}</span>
          </div></div>
          <p class="so-hint">${t('songs.tap.embed')} · <button type="button" class="link" id="so-source">${t('songs.source.yt')}</button></p>`
        : source === 'yt' && s.yt
        ? `<div class="so-embed so-yt" aria-label="${t('songs.play')}"><div class="so-frame">
            <iframe src="${ytPlayer(s.yt)}" title="${t('songs.play')}" allow="autoplay; encrypted-media" loading="lazy"></iframe>
            <span class="so-mask so-yt-top" aria-hidden="true">${t('songs.embed.yt')}</span>
            <span class="so-mask so-yt-left" aria-hidden="true"></span>
            <span class="so-mask so-yt-right" aria-hidden="true"></span>
            <span class="so-mask so-yt-bottom" aria-hidden="true"></span>
            <span class="so-mask so-yt-hole" aria-hidden="true"><span class="so-disc small"><i></i></span></span>
          </div></div>
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
        : `${canPick ? '' : `<p class="so-hint so-lock">${t('songs.listen.first')}</p>`}
          <div class="so-options" role="group" aria-label="${t('songs.which')}">${options.map((o) =>
            `<button type="button" class="so-option${canPick ? '' : ' wait'}" data-id="${o.id}" ${canPick ? '' : 'disabled'}>${escapeAttr(o.title)}</button>`).join('')}</div>`}`;
    fit();
    const cleared = isCleared('songs');
    task.classList.toggle('done', cleared);
    task.textContent = cleared ? t('quest.cleared.eyebrow', { n: levelNumber('songs') })
      : t('quest.task.songs', { n: levelNumber('songs'), done: answeredIds.size, total: order.length });
  };
  const start = (k: number, asAnswered: boolean) => {
    i = k; answered = asAnswered; options = choices(song()); if (!song().qq && !song().yt) load(song()); else audio.pause(); remember(); paint();
  };

  card.addEventListener('click', (e) => {
    const el = e.target as HTMLElement;
    if (el.closest('#so-play')) { if (!audio.paused) audio.pause(); else play(); return; }
    if (el.closest('#so-source')) { source = source === 'qq' ? 'yt' : 'qq'; writeSource(source); paint(); return; }
    const opt = el.closest<HTMLButtonElement>('.so-option');
    if (opt && !answered && !opt.disabled) {
      if (opt.dataset.id === song().id) {
        answered = true; answeredIds.add(song().id); remember(); paint();
        if (answeredIds.size === order.length) levelCleared('songs'); else toast(t('songs.right'));
      } else {
        toast(t('songs.wrong'));
        options = choices(song()); paint();   // dealt again: the wrong one may come back, so guessing has nothing to go on
      }
      return;
    }
    if (el.closest('#so-next')) start(i + 1, answeredIds.has(order[i + 1].id));
    else if (el.closest('#so-prev')) start(i - 1, answeredIds.has(order[i - 1].id));
  });

  document.body.classList.add('songs-quiz');   // the jukebox would show a title; hide it here
  pauseJukebox();                               // and it must not play under the quiz
  start(i, done || answeredIds.has(song().id));
  window.addEventListener('resize', fit);
  return () => { clearTimeout(embedTimer); audio.pause(); audio.removeAttribute('src'); document.body.classList.remove('songs-quiz'); window.removeEventListener('resize', fit); };
}
