// Level: five lines about love with their second half missing. Tap the characters back in order.
import './poems.css';
import { t, pick } from '../../core/i18n';
import { getPlayer, isCleared, levelNumber } from '../../core/quest';
import { liveKey, sessionState } from '../../core/storage';
import { levelCleared, toast } from '../../core/quest-ui';
import { escapeAttr } from '../../core/html';
import { POEMS, bank, blank, chars, solved, type Poem } from './lines';

const esc = (s: string) => escapeAttr(s);

export interface PoemsLive { i: number; solved: number[] }
/** Which poem is open and which are solved, from what the tab remembers (junk falls back to the start). */
export function restorePoems(saved: unknown, total: number, done: boolean): PoemsLive {
  if (done) return { i: total - 1, solved: Array.from({ length: total }, (_, k) => k) };
  const s = (saved ?? {}) as Partial<PoemsLive>;
  const ok = (k: unknown): k is number => typeof k === 'number' && Number.isInteger(k) && k >= 0 && k < total;
  const solved = Array.isArray(s.solved) ? s.solved.filter(ok) : [];
  return { i: ok(s.i) ? s.i : 0, solved };
}

export function renderPoems(root: HTMLElement): () => void {
  const done = isCleared('poems');
  const live = sessionState<PoemsLive>(liveKey('poems', getPlayer() ?? 'jingyi'));   // a language toggle re-renders the page
  const was = restorePoems(live.get(), POEMS.length, done);
  let i = was.i;                            // which poem is on the page
  let filled: string[] = [];                // characters placed so far (from the bank, by index)
  let used: number[] = [];                  // bank indices already placed, parallel to `filled`
  let tiles: string[] = [];
  let open = done;                          // the current poem is solved and shown in full
  const solvedIds = new Set<number>(was.solved);   // lines solved this visit
  const remember = () => live.set({ i, solved: [...solvedIds] });
  let timer = 0;

  root.innerHTML = `
    <section class="poems">
      <header class="poems-head sign">
        <h1>${t('poems.title')}</h1>
        <p>${t('poems.subtitle')}</p>
      </header>
      <p class="quest-task${done ? ' done' : ''}" id="po-task"></p>
      <div class="poems-card card" id="po-card"></div>
      <p class="poems-foot">
        <button type="button" class="link" id="po-hint">${t('poems.hint')}</button>
      </p>
    </section>`;
  const card = root.querySelector<HTMLElement>('#po-card')!;
  const task = root.querySelector<HTMLElement>('#po-task')!;
  const hint = root.querySelector<HTMLButtonElement>('#po-hint')!;

  const start = (p: Poem) => { tiles = bank(p); filled = []; used = []; open = isCleared('poems') || solvedIds.has(POEMS.indexOf(p)); };

  const paint = () => {
    const p = POEMS[i];
    const b = blank(p);
    const need = chars(p.answer);
    const lines = p.lines.map((line, li) => {
      if (li !== b.line) return `<p class="po-line">${esc(line)}</p>`;
      const cs = chars(line);
      const before = cs.slice(0, b.at).join(''), after = cs.slice(b.at + need.length).join('');
      const boxes = need.map((c, k) => open
        ? `<span class="po-box set">${esc(c)}</span>`
        : `<button type="button" class="po-box${filled[k] ? ' set' : ''}${k === filled.length ? ' next' : ''}" data-k="${k}" aria-label="${t('poems.box', { n: k + 1 })}">${esc(filled[k] ?? '')}</button>`).join('');
      // Punctuation right after the blanks stays glued to them instead of dropping to its own line.
      const glue = /^[，。、；：！？]/.exec(after)?.[0] ?? '';
      return `<p class="po-line po-blank">${esc(before)}<span class="po-glue"><span class="po-boxes">${boxes}</span>${esc(glue)}</span>${esc(after.slice(glue.length))}</p>`;
    }).join('');
    const bankHtml = open ? '' : `<div class="po-bank" role="group" aria-label="${t('poems.bank')}">${tiles.map((c, k) =>
      `<button type="button" class="po-tile" data-k="${k}" ${used.includes(k) ? 'disabled' : ''}>${esc(c)}</button>`).join('')}</div>`;
    const reveal = open ? `<div class="po-reveal">
        <p class="po-source">${esc(pick(p.source))}</p>
        <p class="po-gloss">${esc(pick(p.gloss))}</p>
        ${i + 1 < POEMS.length ? `<button type="button" class="cta" id="po-next">${t('poems.next')}</button>` : ''}
        ${i > 0 ? `<button type="button" class="link" id="po-prev">${t('poems.prev')}</button>` : ''}
      </div>` : '';
    card.classList.toggle('long', p.lines.length > 2);
    card.innerHTML = `<p class="po-count">${t('poems.count', { i: i + 1, n: POEMS.length })}</p>${lines}${bankHtml}${reveal}`;
    const cleared = isCleared('poems');
    task.classList.toggle('done', cleared);
    task.textContent = cleared ? t('quest.cleared.eyebrow', { n: levelNumber('poems') }) : t('quest.task.poems', { n: levelNumber('poems') });
    hint.hidden = open;
  };

  const check = () => {
    const p = POEMS[i];
    if (filled.length < chars(p.answer).length) return;
    if (solved(p, filled)) {
      open = true; solvedIds.add(i); remember();
      paint();
      if (i === POEMS.length - 1) levelCleared('poems'); else toast(t('poems.right'));
    } else {
      card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
      toast(t('poems.wrong'));
      timer = window.setTimeout(() => { filled = []; used = []; paint(); }, 650);
    }
  };

  card.addEventListener('click', (e) => {
    const el = e.target as HTMLElement;
    const tile = el.closest<HTMLButtonElement>('.po-tile');
    if (tile && !tile.disabled && !open) {
      const k = Number(tile.dataset.k);
      filled.push(tiles[k]); used.push(k);
      paint(); check();
      return;
    }
    const box = el.closest<HTMLButtonElement>('.po-box');
    if (box && !open) {
      const k = Number(box.dataset.k);
      if (k < filled.length) { filled.splice(k); used.splice(k); paint(); }   // take this and later ones back
      return;
    }
    if (el.closest('#po-next')) { i++; start(POEMS[i]); remember(); paint(); }
    else if (el.closest('#po-prev')) { i--; open = true; remember(); paint(); }
  });
  hint.addEventListener('click', () => {
    const p = POEMS[i];
    const need = chars(p.answer);
    const k = filled.length;
    if (open || k >= need.length) return;
    const idx = tiles.findIndex((c, j) => c === need[k] && !used.includes(j));
    if (idx < 0) return;
    filled.push(tiles[idx]); used.push(idx);
    paint(); check();
  });

  start(POEMS[i]);
  if (done) open = true;
  paint();
  return () => clearTimeout(timer);
}
