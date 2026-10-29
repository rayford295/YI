// Level: ten endgame positions, one stone each. Every answer stays on the board in gold; the
// tenth completes a heart.
import './gomoku.css';
import { t } from '../../core/i18n';
import { nameOf } from '../../core/players';
import { clear, getPlayer, isCleared, levelNumber } from '../../core/quest';
import { levelCleared, toast } from '../../core/quest-ui';
import { SIZE, boardWith, other, winningLine, type Board, type Cell, type Stone } from './core';
import { HEART, PUZZLES } from './puzzles';

/** How long the completed heart is shown before the "level cleared" card. */
const HEART_HOLD_MS = 3200;

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
  let i = done ? PUZZLES.length : 0;     // puzzles solved so far; PUZZLES[i] is the one on the board
  let board: Board = boardFor(i);
  let win: Cell[] = [];                  // the line lit after a right answer
  let timer = 0, burstTimer = 0, wrongTimer = 0, clearTimer = 0;
  let wrongAt: Cell | null = null;     // a stone shown for a moment after a wrong tap
  const revertWrong = () => { clearTimeout(wrongTimer); if (wrongAt) { board[wrongAt[0]][wrongAt[1]] = null; wrongAt = null; } };

  function boardFor(k: number): Board {
    const p = PUZZLES[k];
    return p ? boardWith({ [me]: p.mover, [other(me)]: p.other }) : boardWith({});
  }
  const goldKey = (r: number, c: number) => `${r},${c}`;
  const gold = () => new Set(HEART.slice(0, i).map(([r, c]) => goldKey(r, c)));

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
    </section>`;
  const $ = <T extends HTMLElement>(sel: string) => root.querySelector<T>(sel)!;
  const boardEl = $('#board');
  const buttons = [...boardEl.querySelectorAll<HTMLButtonElement>('.cell')];
  const burst = $('#burst');

  const update = () => {
    const g = gold();
    const lit = new Set(win.map(([a, b]) => a * SIZE + b));
    const finished = i >= PUZZLES.length;
    buttons.forEach((btn, k) => {
      const r = Math.floor(k / SIZE), c = k % SIZE;
      const stone = board[r][c];
      const isGold = g.has(goldKey(r, c));
      btn.className = `cell${isGold ? ' stone gold' : stone ? ` stone ${stone}` : ''}${lit.has(k) ? ' win' : ''}${finished && isGold ? ' heart' : ''}`;
      const where = t('gomoku.cell', { r: r + 1, c: c + 1 });
      btn.setAttribute('aria-label', isGold ? `${where} · ♥` : stone ? `${where} · ${nameOf(stone)}` : where);
    });
    boardEl.dataset.turn = finished || win.length ? '' : me;
    const cleared = isCleared('gomoku');
    $('#g-task').classList.toggle('done', cleared);
    $('#g-task').textContent = cleared ? t('quest.cleared.eyebrow', { n: levelNumber('gomoku') })
      : t('quest.task.gomoku', { n: levelNumber('gomoku'), done: i, total: PUZZLES.length });
    $('#g-status').textContent = finished ? t('gomoku.heart')
      : win.length ? t('gomoku.solved', { i: i }) : t('gomoku.puzzle', { i: i + 1, n: PUZZLES.length, name: nameOf(me) });
    $('#g-status').dataset.state = finished ? 'won' : 'playing';
  };
  const celebrate = () => {
    burst.innerHTML = Array.from({ length: 18 }, (_, k) => `<i style="--a:${k * 20}deg;--d:${(k % 3) * 60}ms" class="${me}">❤</i>`).join('');
    burst.classList.remove('go'); void burst.offsetWidth; burst.classList.add('go');
    clearTimeout(burstTimer); burstTimer = window.setTimeout(() => burst.classList.remove('go'), 2400);
  };

  boardEl.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('.cell');
    if (!btn || win.length || i >= PUZZLES.length) return;
    const r = Number(btn.dataset.r), c = Number(btn.dataset.c);
    revertWrong();
    if (board[r][c] || gold().has(goldKey(r, c))) { update(); return; }
    const line = winningLine(board, me, r, c);
    if (line) {
      board[r][c] = me; win = line; update();
      toast(t('gomoku.right'));
      clearTimeout(timer);
      timer = window.setTimeout(() => {           // the stone turns gold and the next position is laid
        i++; win = []; board = boardFor(i); update();
        if (i === PUZZLES.length) {           // let the finished heart glow on its own before the card covers it
          celebrate();
          clearTimer = window.setTimeout(() => { clearTimer = 0; levelCleared('gomoku'); }, HEART_HOLD_MS);
        }
      }, 900);
    } else {
      board[r][c] = me; wrongAt = [r, c]; update();
      btn.classList.add('wrong');
      toast(t('gomoku.wrong'));
      wrongTimer = window.setTimeout(() => { revertWrong(); update(); }, 500);
    }
  });

  update();
  return () => {
    clearTimeout(timer); clearTimeout(burstTimer); clearTimeout(wrongTimer);
    if (clearTimer || (timer && i + 1 === PUZZLES.length && win.length)) { clearTimeout(clearTimer); clear('gomoku'); }   // left before the card: still counts
  };
}
