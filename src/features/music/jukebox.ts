// A small jukebox pinned to the corner of every page: Chinese songs from public/media/music/.
// Off until someone turns it on (browsers block sound before a gesture anyway); then remembered on
// the device (`yi.music`, `yi.music.track`) and resumed on the next visit after the first tap or key.
import './jukebox.css';
import { t } from '../../core/i18n';
import { TRACKS, nextIndex } from './tracks';

const ON_KEY = 'yi.music', AT_KEY = 'yi.music.track';
const read = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const write = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* ignore */ } };

export function mountJukebox(): void {
  if (!TRACKS.length || document.querySelector('#jukebox')) return;
  const audio = new Audio();
  audio.preload = 'none'; audio.volume = 0.45;
  let at = Math.min(Number(read(AT_KEY) ?? 0) || 0, TRACKS.length - 1);
  let on = read(ON_KEY) === 'on';

  const el = document.createElement('div');
  el.id = 'jukebox'; el.className = 'jukebox';
  el.innerHTML = `<button type="button" class="jb-toggle" id="jb-toggle" aria-pressed="false">♪</button>
    <button type="button" class="jb-title" id="jb-title" title="${t('music.next')}"></button>`;
  document.body.appendChild(el);
  const toggle = el.querySelector<HTMLButtonElement>('#jb-toggle')!;
  const title = el.querySelector<HTMLButtonElement>('#jb-title')!;

  const show = () => {
    const tr = TRACKS[at];
    title.textContent = tr.artist ? `${tr.title} · ${tr.artist}` : tr.title;
    toggle.setAttribute('aria-pressed', String(on));
    toggle.setAttribute('aria-label', on ? t('music.off') : t('music.on'));
    el.classList.toggle('playing', on && !audio.paused);
  };
  const load = () => { audio.src = `${import.meta.env.BASE_URL}${TRACKS[at].src}`; write(AT_KEY, String(at)); };
  const play = () => { if (!audio.src) load(); audio.play().then(show, show); };
  const skip = () => { at = nextIndex(at, TRACKS.length); load(); if (on) play(); show(); };

  audio.addEventListener('ended', skip);
  const bad = new Set<number>();
  audio.addEventListener('error', () => {
    bad.add(at);
    if (bad.size >= TRACKS.length) { on = false; write(ON_KEY, 'off'); show(); return; }
    skip();
  });
  audio.addEventListener('play', show); audio.addEventListener('pause', show);
  toggle.addEventListener('click', () => { on = !on; write(ON_KEY, on ? 'on' : 'off'); if (on) play(); else audio.pause(); show(); });
  title.addEventListener('click', skip);
  // Remembered "on": start at the first gesture anywhere, which is what the browser needs.
  if (on) {
    const first = () => { play(); window.removeEventListener('pointerdown', first); window.removeEventListener('keydown', first); };
    window.addEventListener('pointerdown', first); window.addEventListener('keydown', first);
  }
  show();
}
