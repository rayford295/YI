// A small jukebox pinned to the corner of every page: our six songs, played through the official
// YouTube player (the IFrame API, loaded the first time someone turns the music on). The player
// itself is shown as a small card above the pill while it plays: YouTube asks that its player be
// visible, and the cover art is a nice touch anyway. Off until someone turns it on (browsers block
// sound before a gesture); then remembered on the device (`yi.music`, `yi.music.track`) and
// resumed on the next visit after the first tap or key. Where YouTube does not load (mainland
// China) the pill quietly gives up after a while.
import './jukebox.css';
import { t } from '../../core/i18n';
import { TRACKS, nextIndex } from './tracks';

const ON_KEY = 'yi.music', AT_KEY = 'yi.music.track';
const read = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const write = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* ignore */ } };

// The parts of the IFrame API the jukebox uses.
interface YTPlayer { playVideo(): void; pauseVideo(): void; loadVideoById(id: string): void; setVolume(v: number): void; destroy(): void; getPlayerState?(): number }
interface YTNamespace { Player: new (el: HTMLElement, opts: Record<string, unknown>) => YTPlayer; PlayerState: { ENDED: number; PLAYING: number; PAUSED: number } }
declare global { interface Window { YT?: YTNamespace; onYouTubeIframeAPIReady?: () => void } }

let apiPromise: Promise<YTNamespace> | null = null;
function loadApi(): Promise<YTNamespace> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  apiPromise ??= new Promise<YTNamespace>((resolve, reject) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { prev?.(); resolve(window.YT!); };
    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api'; s.async = true;
    s.onerror = () => reject(new Error('youtube unreachable'));
    document.head.appendChild(s);
    setTimeout(() => reject(new Error('youtube timeout')), 12_000);
  });
  return apiPromise;
}

let pauseNow: (() => void) | null = null;
/** Pause the jukebox and remember it as off (a page that plays its own music calls this). */
export function pauseJukebox(): void { pauseNow?.(); }

export function mountJukebox(): void {
  if (!TRACKS.length || document.querySelector('#jukebox')) return;
  let at = Math.min(Number(read(AT_KEY) ?? 0) || 0, TRACKS.length - 1);
  let on = read(ON_KEY) === 'on';
  let player: YTPlayer | null = null;
  let playing = false, busy = false;

  const el = document.createElement('div');
  el.id = 'jukebox'; el.className = 'jukebox';
  el.innerHTML = `<div class="jb-card" id="jb-card" hidden><div class="jb-frame" id="jb-frame"></div></div>
    <div class="jb-pill">
      <button type="button" class="jb-toggle" id="jb-toggle" aria-pressed="false">♪</button>
      <button type="button" class="jb-title" id="jb-title" title="${t('music.next')}"></button>
    </div>`;
  document.body.appendChild(el);
  const card = el.querySelector<HTMLElement>('#jb-card')!;
  const frame = el.querySelector<HTMLElement>('#jb-frame')!;
  const toggle = el.querySelector<HTMLButtonElement>('#jb-toggle')!;
  const title = el.querySelector<HTMLButtonElement>('#jb-title')!;

  const show = () => {
    const tr = TRACKS[at];
    title.textContent = tr.artist ? `${tr.title} · ${tr.artist}` : tr.title;
    toggle.setAttribute('aria-pressed', String(on));
    toggle.setAttribute('aria-label', on ? t('music.off') : t('music.on'));
    el.classList.toggle('playing', on && playing);
    card.hidden = !on;
  };
  const skip = () => { at = nextIndex(at, TRACKS.length); write(AT_KEY, String(at)); if (player) player.loadVideoById(TRACKS[at].yt); show(); };
  const giveUp = () => { on = false; playing = false; write(ON_KEY, 'off'); el.hidden = true; };

  const play = async () => {
    if (busy) return;
    if (player) { player.playVideo(); return; }
    busy = true; el.classList.add('loading');
    try {
      const YT = await loadApi();
      if (!on) return;   // switched off while the script loaded
      const host = document.createElement('div');
      frame.appendChild(host);
      player = new YT.Player(host, {
        host: 'https://www.youtube-nocookie.com',
        width: 200, height: 112, videoId: TRACKS[at].yt,
        playerVars: { autoplay: 1, playsinline: 1, rel: 0, iv_load_policy: 3, controls: 0, modestbranding: 1 },
        events: {
          onReady: () => { player?.setVolume(45); player?.playVideo(); },
          onStateChange: (e: { data: number }) => {
            if (e.data === YT.PlayerState.ENDED) skip();
            playing = e.data === YT.PlayerState.PLAYING; show();
          },
          onError: () => skip(),   // a video that will not play here: the next one
        },
      });
    } catch { giveUp(); }
    finally { busy = false; el.classList.remove('loading'); show(); }
  };
  const pause = () => { player?.pauseVideo(); playing = false; show(); };

  pauseNow = () => { if (!on) return; on = false; write(ON_KEY, 'off'); pause(); };
  toggle.addEventListener('click', () => { on = !on; write(ON_KEY, on ? 'on' : 'off'); if (on) void play(); else pause(); show(); });
  title.addEventListener('click', () => { skip(); if (on) void play(); });
  // Remembered "on": start at the first gesture anywhere, which is what the browser needs.
  if (on) {
    const first = () => { void play(); window.removeEventListener('pointerdown', first); window.removeEventListener('keydown', first); };
    window.addEventListener('pointerdown', first); window.addEventListener('keydown', first);
  }
  show();
}
