// Shared bits of the journey UI: avatars, the "level cleared" card, the "locked" toast.
import './quest-ui.css';
import { t, pick } from './i18n';
import { config } from './config';
import { LEVELS, levelIndex, next, getPlayer, clear, type PlayerId } from './quest';
import { confetti, chime, voiceUrl } from './celebrate';

export const avatarUrl = (p: PlayerId): string => `${import.meta.env.BASE_URL}media/avatars/${p}.png`;
export const playerName = (p: PlayerId): string => pick(p === 'jingyi' ? config.her.name : config.him.name);

/** An avatar image with a lettered fallback while the PNG is missing. */
export function avatarHtml(p: PlayerId, cls = ''): string {
  const initial = p === 'jingyi' ? '仪' : '帆';
  return `<span class="avatar ${cls}" data-player="${p}"><img src="${avatarUrl(p)}" alt="" onerror="this.remove()"><i>${initial}</i></span>`;
}

/**
 * Clear a level and, the first time, show the celebration card with a way to the next level.
 * Safe to call repeatedly: later calls do nothing.
 */
export function levelCleared(id: string): void {
  if (!clear(id)) return;
  const p = getPlayer()!;
  const n = levelIndex(id) + 1;
  const after = next(id);
  const level = LEVELS[levelIndex(id)];
  const el = document.createElement('div');
  el.className = 'level-cleared';
  el.innerHTML = `
    <div class="cleared-card" role="dialog" aria-modal="true">
      ${avatarHtml(p, 'big')}
      <p class="cleared-eyebrow">${t('quest.cleared.eyebrow', { n })}</p>
      <h2>${t(level.title)}</h2>
      <p class="cleared-story">${t(level.story)}</p>
      ${after
        ? `<a class="btn cleared-next" href="/town">${t('quest.cleared.next', { title: t(after.title) })} →</a>`
        : `<a class="btn cleared-next" href="/town">${t('quest.cleared.done')}</a>`}
      <button type="button" class="cleared-voice" hidden>▶ ${t('quest.celebrate.listen')}</button>
      <button type="button" class="cleared-stay">${t('quest.cleared.stay')}</button>
    </div>`;
  el.querySelector('.cleared-stay')!.addEventListener('click', () => el.remove());
  el.querySelector('.cleared-next')!.addEventListener('click', () => el.remove());
  // A recorded line for this level, if the owner has dropped one in public/media/voice/.
  const voice = el.querySelector<HTMLButtonElement>('.cleared-voice')!;
  const audio = new Audio(voiceUrl(id));
  audio.preload = 'metadata';
  audio.addEventListener('canplay', () => { voice.hidden = false; }, { once: true });
  voice.addEventListener('click', () => { audio.currentTime = 0; void audio.play(); });
  document.body.appendChild(el);
  el.querySelector<HTMLElement>('.cleared-next')!.focus();
  requestAnimationFrame(() => el.classList.add('in'));
  confetti(el);
  chime();
}

let toastTimer = 0;
export function toast(msg: string): void {
  let el = document.querySelector<HTMLElement>('.quest-toast');
  if (!el) { el = document.createElement('div'); el.className = 'quest-toast'; document.body.appendChild(el); }
  el.textContent = msg;
  el.classList.add('in');
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => el!.classList.remove('in'), 2600);
}
