// The other one's face cut into a 3×3 grid; tap two tiles to swap until it is whole. Mounted by
// the Moments level after the days are in order.
import './puzzle.css';
import { t, pick } from '../../core/i18n';
import { nextPortrait, portraitsFor } from './portraits';
import { shuffle } from '../../core/random';
import { getPlayer, type PlayerId } from '../../core/quest';
import { escapeAttr } from '../../core/html';

const N = 3;

/** A permutation of 0..N²-1 that is not already solved. */
export function scramble(n = N * N, rnd = shuffle): number[] {
  const ids = Array.from({ length: n }, (_, i) => i);
  let order = rnd(ids);
  if (order.every((v, i) => v === i)) order = [...order.slice(1), order[0]];
  return order;
}
export const solved = (order: number[]): boolean => order.every((v, i) => v === i);

/** Mount the puzzle in `root`; `done` shows it solved; `onSolved` fires once when it is put together. */
export function mountPuzzle(root: HTMLElement, done: boolean, onSolved: () => void): () => void {
  const me: PlayerId = getPlayer() ?? 'jingyi';
  const photos = portraitsFor(me);
  let photoIndex = -1;
  let solvedOnce = done;
  root.innerHTML = `
    <section class="puzzle">
      <h2 class="puzzle-title">${t('puzzle.title')}</h2>
      <p class="puzzle-sub">${t(me === 'jingyi' ? 'puzzle.subtitle.him' : 'puzzle.subtitle.her')}</p>
      <p class="quest-task${done ? ' done' : ''}" id="pz-task">${done ? t('quest.task.puzzle.done') : t('quest.task.puzzle')}</p>
      <div class="puzzle-board card" id="pz-board" role="group"></div>
      <p class="puzzle-caption" id="pz-caption"></p>
      <p class="puzzle-foot"><button type="button" class="link" id="pz-shuffle">${t('quest.task.puzzle.shuffle')}</button></p>
    </section>`;
  const board = root.querySelector<HTMLElement>('#pz-board')!;
  const caption = root.querySelector<HTMLElement>('#pz-caption')!;
  let order: number[] = [];
  let picked = -1;
  let photo = photos[0];
  const pickPhoto = () => { photo = nextPortrait(photos, photos[photoIndex]); photoIndex = photos.indexOf(photo); };

  const paint = () => {
    const finished = solved(order);
    board.classList.toggle('solved', finished);
    board.innerHTML = order.map((v, i) => {
      const r = Math.floor(v / N), c = v % N;
      return `<button type="button" class="pz-tile${i === picked ? ' picked' : ''}" data-i="${i}" aria-label="${escapeAttr(String(v + 1))}"
        style="background-image:url('${import.meta.env.BASE_URL}${photo.src}');background-position:${(c * 100) / (N - 1)}% ${(r * 100) / (N - 1)}%"></button>`;
    }).join('');
    caption.textContent = finished ? pick(photo.alt) : '';
  };
  const start = () => {
    pickPhoto();
    order = solvedOnce ? Array.from({ length: N * N }, (_, i) => i) : scramble();
    picked = -1;
    const img = new Image();
    img.onload = () => { board.style.aspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`; paint(); };
    img.onerror = () => { board.style.aspectRatio = '1 / 1'; paint(); };
    img.src = `${import.meta.env.BASE_URL}${photo.src}`;
    paint();
  };
  board.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('.pz-tile');
    if (!b || solved(order)) return;
    const i = Number(b.dataset.i);
    if (picked < 0) picked = i;
    else if (picked === i) picked = -1;
    else { [order[picked], order[i]] = [order[i], order[picked]]; picked = -1; }
    paint();
    if (solved(order)) {
      root.querySelector('#pz-task')!.classList.add('done');
      root.querySelector('#pz-task')!.textContent = t('quest.task.puzzle.done');
      if (!solvedOnce) { solvedOnce = true; onSolved(); }
    }
  });
  root.querySelector('#pz-shuffle')!.addEventListener('click', () => { if (!solvedOnce) start(); else { order = scramble(); picked = -1; paint(); } });
  start();
  return () => undefined;
}
