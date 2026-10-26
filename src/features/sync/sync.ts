// Carry progress between our two phones: show this device's code and link, take the other's.
import './sync.css';
import { t } from '../../core/i18n';
import { LEVELS, PLAYERS, getPlayer, getProgress, type PlayerId } from '../../core/quest';
import { playerName } from '../../core/quest-ui';
import { encodeProgress, importProgress, syncLink } from '../../core/sync';
import { escapeAttr } from '../../core/html';

export function renderSync(root: HTMLElement): () => void {
  const me = getPlayer()!;
  const other: PlayerId = me === 'jingyi' ? 'yifan' : 'jingyi';
  const done = (p: PlayerId) => getProgress(p).cleared.length;
  const code = encodeProgress(me);
  const fromLink = /[?&]c=([A-Za-z0-9]+)/.exec(location.search)?.[1] ?? '';

  root.innerHTML = `
    <section class="sync">
      <header class="sync-head sign">
        <p class="eyebrow">${t('sync.eyebrow')}</p>
        <h1>${t('sync.title')}</h1>
        <p>${t('sync.subtitle')}</p>
      </header>
      <section class="card sync-card">
        <h2>${t('sync.mine', { name: playerName(me) })}</h2>
        <p>${t('sync.mine.hint', { done: done(me), total: LEVELS.length })}</p>
        <div class="sync-code" id="sync-code">${code}</div>
        <div class="sync-row">
          <button type="button" class="cta" id="sync-copy-link">${t('sync.copy.link')}</button>
          <button type="button" class="cta quiet" id="sync-copy-code">${t('sync.copy.code')}</button>
          <button type="button" class="cta quiet" id="sync-share" hidden>${t('sync.share')}</button>
        </div>
        <p class="sync-result" id="sync-copied"></p>
      </section>
      <section class="card sync-card">
        <h2>${t('sync.theirs', { name: playerName(other) })}</h2>
        <p>${t('sync.theirs.hint', { name: playerName(other), done: done(other), total: LEVELS.length })}</p>
        <form class="sync-input" id="sync-form">
          <input id="sync-in" inputmode="text" autocapitalize="characters" autocomplete="off" spellcheck="false" placeholder="${escapeAttr(t('sync.placeholder'))}" value="${escapeAttr(fromLink)}" aria-label="${escapeAttr(t('sync.theirs', { name: playerName(other) }))}" />
          <button type="submit" class="cta">${t('sync.merge')}</button>
        </form>
        <p class="sync-result" id="sync-result"></p>
      </section>
      <p class="sync-foot"><a href="/">${t('sync.back')}</a></p>
    </section>`;

  const copied = root.querySelector<HTMLElement>('#sync-copied')!;
  const result = root.querySelector<HTMLElement>('#sync-result')!;
  const input = root.querySelector<HTMLInputElement>('#sync-in')!;
  const say = (el: HTMLElement, text: string, bad = false) => { el.textContent = text; el.classList.toggle('bad', bad); };
  const copy = async (text: string) => {
    try { await navigator.clipboard.writeText(text); say(copied, t('sync.copied')); }
    catch { say(copied, text); }
  };
  root.querySelector('#sync-copy-link')!.addEventListener('click', () => { void copy(syncLink(code)); });
  root.querySelector('#sync-copy-code')!.addEventListener('click', () => { void copy(code); });
  const share = root.querySelector<HTMLButtonElement>('#sync-share')!;
  if (typeof navigator.share === 'function') {
    share.hidden = false;
    share.addEventListener('click', () => { void navigator.share({ title: t('site.title'), text: t('sync.share.text', { name: playerName(me), done: done(me) }), url: syncLink(code) }).catch(() => undefined); });
  }
  const merge = () => {
    const carried = importProgress(input.value);
    if (!carried) { say(result, t('sync.bad'), true); return; }
    if (!PLAYERS.includes(carried.player)) { say(result, t('sync.bad'), true); return; }
    say(result, t('sync.merged', { name: playerName(carried.player), done: done(carried.player), total: LEVELS.length }));
    input.value = '';
    history.replaceState(null, '', '/sync');
  };
  root.querySelector('#sync-form')!.addEventListener('submit', (e) => { e.preventDefault(); merge(); });
  if (fromLink) merge();
  return () => undefined;
}
