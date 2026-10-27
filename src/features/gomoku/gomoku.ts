// Level: three endgame positions from the board we played on. One stone wins each; find it.
import './gomoku.css';
import { t } from '../../core/i18n';
import { nameOf } from '../../core/players';
import { getPlayer, isCleared, levelNumber } from '../../core/quest';
import { levelCleared, toast } from '../../core/quest-ui';
import { SIZE, boardWith, other, winningLine, type Board, type Cell, type Stone } from './core';
import { PUZZLES } from './puzzles';

const STARS = [[3, 3], [3, 11], [7, 7], [11, 3], [11, 11]];

function gridSvg(): string {
  const lines = Array.from({ length: SIZE }, (_, i) => {
    const p = i + 0.5;
    return `<line x1="0.5" y1="${p}" x2="${SIZE - 0.5}" y2="${p}"/><line x1="${p}" y1="0.5" x2="${p}" y2="${SIZE - 0.5}"/>`;
  }).join('');
  const stars = STARS.map(([r, c]) => `<circle cx="${c + 0.5}" cy="${r + 0.5}" r="0.12"/>`).join('');
  return `<svg class="board-lines" viewBox="0 0 ${SIZE} ${SIZE}" aria-hidden="true">${lines}${stars}</svg>`;
}

export function renderGomoku(root: HTMLElement): () => void {
  const me: Stone = getPlayer() === 'yifan' ? 'green' : 'purple';
  const done = isCleared('gomoku');
  let i = done ? PUZZLES.length - 1 : 0;
  let board: Board = emptyFor(i);
  let win: Cell[] = [];          // the line lit after a right answer
  let solved = done;
  let timer = 0, burstTimer = 0;

  function emptyFor(k: number): Board {
    const p = PUZZLES[k];
    return boardWith({ [me]: p.mover, [other(me)]: p.other });
  }

  const cells = Array.from({ length: SIZE * SIZE }, (_, k) =>
    `<button type="button" class="cell" data-r="${Math.floor(k / SIZE)}" data-c="${k % SIZE}"></button>`).join('');
  root.innerHTML = `
    <section class="gomoku">
      <header class="gomoku-head sign">
        <h1>${t('gomoku.title')}</h1>
        <p>${t('gomoku.subtitle')}</p>
      </header>
      <p class="quest-task${done ? ' done' : ''}" id="g-task"></p>
      <p class="gomoku-status" id="g-status" aria-live="polite"></p>
      <div class="board-wrap">
        <div class="board" id="board" data-turn="${me}">${gridSvg()}${cells}</div>
        <div class="burst" id="burst" aria-hidden="true"></div>
      </div>
      <div class="gomoku-actions" id="g-actions"></div>
    </section>`;
  const $ = <T extends HTMLElement>(sel: string) => root.querySelector<T>(sel)!;
  const boardEl = $('#board');
  const buttons = [...boardEl.querySelectorAll<HTMLButtonElement>('.cell')];
  const burst = $('#burst');

  const update = () => {
    const p = PUZZLES[i];
    const lit = new Set(win.map(([a, b]) => a * SIZE + b));
    buttons.forEach((btn, k) => {
      const r = Math.floor(k / SIZE), c = k % SIZE;
      const stone = board[r][c];
      const last = solved && r === p.answer[0] && c === p.answer[1];
      btn.className = `cell${stone ? ` stone ${stone}` : ''}${lit.has(k) ? ' win' : ''}${last ? ' last' : ''}`;
      const where = t('gomoku.cell', { r: r + 1, c: c + 1 });
      btn.setAttribute('aria-label', stone ? `${where} · ${nameOf(stone)}` : where);
    });
    boardEl.dataset.turn = solved ? '' : me;
    const cleared = isCleared('gomoku');
    $('#g-task').classList.toggle('done', cleared);
    $('#g-task').textContent = cleared ? t('quest.cleared.eyebrow', { n: levelNumber('gomoku') })
      : t('quest.task.gomoku', { n: levelNumber('gomoku'), done: i, total: PUZZLES.length });
    $('#g-status').textContent = solved ? t('gomoku.solved', { i: i + 1 }) : t('gomoku.puzzle', { i: i + 1, n: PUZZLES.length, name: nameOf(me) });
    $('#g-status').dataset.state = solved ? 'won' : 'playing';
    $('#g-actions').innerHTML = `${i > 0 ? `<button type="button" class="g-btn" id="g-prev">${t('gomoku.prev')}</button>` : ''}
      ${solved && i + 1 < PUZZLES.length ? `<button type="button" class="g-btn primary" id="g-next">${t('gomoku.next')}</button>` : ''}`;
  };
  const show = (k: number, asSolved: boolean) => {
    i = k; solved = asSolved; board = emptyFor(k); win = [];
    if (asSolved) { const [r, c] = PUZZLES[k].answer; win = winningLine(board, me, r, c) ?? []; board[r][c] = me; }
    update();
  };
  const celebrate = () => {
    burst.innerHTML = Array.from({ length: 18 }, (_, k) => `<i style="--a:${k * 20}deg;--d:${(k % 3) * 60}ms" class="${me}">❤</i>`).join('');
    burst.classList.remove('go'); void burst.offsetWidth; burst.classList.add('go');
    clearTimeout(burstTimer); burstTimer = window.setTimeout(() => burst.classList.remove('go'), 2400);
  };

  boardEl.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('.cell');
    if (!btn || solved) return;
    const r = Number(btn.dataset.r), c = Number(btn.dataset.c);
    if (board[r][c]) return;
    const line = winningLine(board, me, r, c);
    if (line) {
      board[r][c] = me; win = line; solved = true; update(); celebrate();
      if (i + 1 === PUZZLES.length) levelCleared('gomoku'); else toast(t('gomoku.right'));
    } else {
      board[r][c] = me; update();
      btn.classList.add('wrong');
      toast(t('gomoku.wrong'));
      clearTimeout(timer);
      timer = window.setTimeout(() => { board[r][c] = null; update(); }, 500);
    }
  });
  root.addEventListener('click', (e) => {
    const el = e.target as HTMLElement;
    if (el.closest('#g-next')) show(i + 1, isCleared('gomoku'));
    else if (el.closest('#g-prev')) show(i - 1, true);
  });

  show(i, done);
  return () => { clearTimeout(timer); clearTimeout(burstTimer); };
}
