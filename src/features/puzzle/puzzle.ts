// Level: the other one's face cut into a 3×3 grid; tap two tiles to swap until it is whole.
import './puzzle.css';
import { t, pick } from '../../core/i18n';
import { nextPortrait, portraitsFor } from './portraits';
import { shuffle } from '../../core/random';
import { getPlayer, isCleared, levelNumber } from '../../core/quest';
import { levelCleared } from '../../core/quest-ui';
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

export function renderPuzzle(root: HTMLElement): () => void {
  const me = getPlayer()!;
  const photos = portraitsFor(me);
  let photoIndex = -1;
  const done = isCleared('puzzle');
  root.innerHTML = `
    <section class="puzzle">
      <header class="puzzle-head sign">
        <h1>${t('puzzle.title')}</h1>
        <p>${t(me === 'jingyi' ? 'puzzle.subtitle.him' : 'puzzle.subtitle.her')}</p>
      </header>
      <p class="quest-task${done ? ' done' : ''}" id="pz-task">${done ? t('quest.cleared.eyebrow', { n: levelNumber('puzzle') }) : t('quest.task.puzzle', { n: levelNumber('puzzle') })}</p>
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
        style="background-image:url('${photo.src}');background-position:${(c * 100) / (N - 1)}% ${(r * 100) / (N - 1)}%"></button>`;
    }).join('');
    caption.textContent = finished ? pick(photo.alt) : '';
  };
  const start = () => {
    pickPhoto();
    order = isCleared('puzzle') ? Array.from({ length: N * N }, (_, i) => i) : scramble();
    picked = -1;
    const img = new Image();
    img.onload = () => { board.style.aspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`; paint(); };
    img.onerror = () => { board.style.aspectRatio = '1 / 1'; paint(); };
    img.src = photo.src;
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
      root.querySelector('#pz-task')!.textContent = t('quest.cleared.eyebrow', { n: levelNumber('puzzle') });
      levelCleared('puzzle');
    }
  });
  root.querySelector('#pz-shuffle')!.addEventListener('click', () => { if (!isCleared('puzzle')) start(); else { order = scramble(); picked = -1; paint(); } });
  start();
  return () => undefined;
}
