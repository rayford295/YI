import './gomoku.css';
import { t } from '../../core/i18n';
import { safeStorage } from '../../core/storage';
import { nameOf } from '../../core/players';
import { SIZE, newGame, place, undo, turn, boardOf, status, type Game, type Stone } from './core';
import { gameTabs } from '../games/tabs';
import { loadRecord, saveRecord, recordResult, loadGame, saveGame, type GameRecord } from './record';
import { isCleared, levelNumber } from '../../core/quest';
import { levelCleared } from '../../core/quest-ui';

// Level 4: the outline of a heart, 14 points, no five in any line.
export const HEART: [number, number][] = [
  [4, 5], [4, 6], [4, 8], [4, 9], [5, 4], [5, 7], [5, 10], [6, 4], [6, 10], [7, 5], [7, 9], [8, 6], [8, 8], [9, 7],
];

// Kept at module level so a language switch (which re-renders the page) keeps the game.
let game: Game | undefined;
let record: GameRecord | undefined;

const STARS = [[3, 3], [3, 11], [7, 7], [11, 3], [11, 11]];

function gridSvg(): string {
  const lines = Array.from({ length: SIZE }, (_, i) => {
    const p = i + 0.5;
    return `<line x1="0.5" y1="${p}" x2="${SIZE - 0.5}" y2="${p}"/><line x1="${p}" y1="0.5" x2="${p}" y2="${SIZE - 0.5}"/>`;
  }).join('');
  const stars = STARS.map(([r, c]) => `<circle cx="${c + 0.5}" cy="${r + 0.5}" r="0.12"/>`).join('');
  const heart = isCleared('gomoku') ? '' : HEART.map(([r, c]) => `<circle class="heart-pt" cx="${c + 0.5}" cy="${r + 0.5}" r="0.3"/>`).join('');
  return `<svg class="board-lines" viewBox="0 0 ${SIZE} ${SIZE}" aria-hidden="true">${lines}${stars}${heart}</svg>`;
}

export function renderGomoku(root: HTMLElement): () => void {
  const s = safeStorage();
  record ??= loadRecord(s);
  game ??= loadGame(s, record.nextFirst);

  const cells = Array.from({ length: SIZE * SIZE }, (_, i) =>
    `<button type="button" class="cell" data-r="${Math.floor(i / SIZE)}" data-c="${i % SIZE}"></button>`).join('');
  const player = (stone: Stone) => `
    <div class="player player-${stone}" id="pl-${stone}">
      <span class="stone-chip ${stone}" aria-hidden="true"></span>
      <span class="player-name">${nameOf(stone)}</span>
      <span class="player-score" id="sc-${stone}"></span>
    </div>`;

  root.innerHTML = `
    <section class="gomoku">
      ${gameTabs('#/gomoku')}
      <header class="gomoku-head sign">
        <h1>${t('gomoku.title')}</h1>
        <p>${t('gomoku.subtitle')}</p>
      </header>
      <div class="players">${player('purple')}<span class="draws" id="draws"></span>${player('green')}</div>
      <p class="quest-task${isCleared('gomoku') ? ' done' : ''}" id="g-task"></p>
      <p class="gomoku-status" id="g-status" aria-live="polite"></p>
      <div class="board-wrap">
        <div class="board" id="board">${gridSvg()}${cells}</div>
        <div class="burst" id="burst" aria-hidden="true"></div>
      </div>
      <div class="gomoku-actions">
        <button type="button" class="g-btn" id="g-undo">${t('gomoku.undo')}</button>
        <button type="button" class="g-btn primary" id="g-again">${t('gomoku.again')}</button>
      </div>
    </section>`;

  const $ = <T extends HTMLElement>(sel: string) => root.querySelector<T>(sel)!;
  const board = $('#board');
  const buttons = [...board.querySelectorAll<HTMLButtonElement>('.cell')];
  const burst = $('#burst');
  let burstTimer: number | undefined;

  function update(): void {
    const g = game!, r = record!;
    const grid = boardOf(g);
    const st = status(g);
    const won = new Set(st.kind === 'won' ? st.line.map(([a, b]) => a * SIZE + b) : []);
    const last = g.moves.at(-1);
    buttons.forEach((btn, i) => {
      const row = Math.floor(i / SIZE), col = i % SIZE;
      const stone = grid[row][col];
      btn.className = `cell${stone ? ` stone ${stone}` : ''}${won.has(i) ? ' win' : ''}${
        last && last[0] === row && last[1] === col ? ' last' : ''}`;
      const where = t('gomoku.cell', { r: row + 1, c: col + 1 });
      btn.setAttribute('aria-label', stone ? `${where} · ${nameOf(stone)}` : where);
    });
    board.dataset.turn = st.kind === 'playing' ? turn(g) : '';

    let msg: string;
    if (st.kind === 'won') msg = `${t('gomoku.won', { name: nameOf(st.by) })} ${t('gomoku.next', { name: nameOf(r.nextFirst) })}`;
    else if (st.kind === 'draw') msg = `${t('gomoku.draw')} ${t('gomoku.next', { name: nameOf(r.nextFirst) })}`;
    else if (g.moves.length === 0) msg = t('gomoku.opens', { name: nameOf(g.first) });
    else msg = t('gomoku.turn', { name: nameOf(turn(g)) });
    $('#g-status').textContent = msg;
    $('#g-status').dataset.state = st.kind;

    for (const stone of ['purple', 'green'] as const) {
      $(`#sc-${stone}`).textContent = String(r[stone]);
      $(`#pl-${stone}`).classList.toggle('active', st.kind === 'playing' && turn(g) === stone);
    }
    $('#draws').textContent = t('gomoku.draws', { n: r.draws });
    const filled = HEART.filter(([hr, hc]) => grid[hr][hc]).length;
    $('#g-task').textContent = isCleared('gomoku') ? t('quest.cleared.eyebrow', { n: levelNumber('gomoku') }) : t('quest.task.gomoku', { n: levelNumber('gomoku'), done: filled, total: HEART.length });
    if (filled === HEART.length) { $('#g-task').classList.add('done'); levelCleared('gomoku'); }
    $<HTMLButtonElement>('#g-undo').disabled = g.moves.length === 0 || st.kind !== 'playing';
  }

  function celebrate(by: Stone | null): void {
    burst.innerHTML = Array.from({ length: 18 }, (_, i) =>
      `<i style="--a:${i * 20}deg;--d:${(i % 3) * 60}ms" class="${by ?? 'draw'}">❤</i>`).join('');
    burst.classList.remove('go');
    void burst.offsetWidth; // restart the animation
    burst.classList.add('go');
    window.clearTimeout(burstTimer);
    burstTimer = window.setTimeout(() => burst.classList.remove('go'), 2400);
  }

  board.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('.cell');
    if (!btn) return;
    const next = place(game!, Number(btn.dataset.r), Number(btn.dataset.c));
    if (next === game) return;
    game = next;
    const st = status(game);
    if (st.kind !== 'playing') {
      record = recordResult(record!, game.first, st);
      saveRecord(s, record);
      celebrate(st.kind === 'won' ? st.by : null);
    }
    saveGame(s, game);
    update();
  });

  $('#g-undo').addEventListener('click', () => {
    game = undo(game!);
    saveGame(s, game);
    update();
  });

  $('#g-again').addEventListener('click', () => {
    const unfinished = status(game!).kind === 'playing' && game!.moves.length >= 4;
    if (unfinished && !window.confirm(t('gomoku.confirm'))) return;
    game = newGame(record!.nextFirst);
    saveGame(s, game);
    burst.classList.remove('go');
    update();
  });

  update();
  return () => window.clearTimeout(burstTimer);
}
