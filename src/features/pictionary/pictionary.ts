import './pictionary.css';
import { t } from '../../core/i18n';
import { safeStorage } from '../../core/storage';
import { nameOf } from '../../core/players';
import { escapeAttr as escape } from '../../core/html';
import { gameTabs } from '../games/tabs';
import {
  newMatch, startRound, guess, markCorrect, skip, tick, timeLeft, nextRound, pickWord, otherPlayer,
  ROUND_MS, type Match, type Player,
} from './core';
import { WORDS } from './words';
import { paint, toUnit, type Stroke } from './strokes';
import { loadTally, saveTally } from './record';
import { isCleared } from '../../core/quest';
import { levelCleared } from '../../core/quest-ui';

const DRAW_GOAL = 3;

// Module level, so a language switch (which re-renders the page) keeps the round and the drawing.
let match: Match | undefined;
let strokes: Stroke[] = [];
let tool = { color: '#3b2430', size: 0.012, erase: false };

const COLORS = ['#3b2430', '#d4506d', '#8a56d1', '#3f9a62', '#c39a5c', '#4a8fd1'];
const SIZES = [0.006, 0.012, 0.024];


export function renderPictionary(root: HTMLElement): () => void {
  const s = safeStorage();
  match ??= newMatch('purple', loadTally(s)); // Jingyi draws first

  root.innerHTML = `
    <section class="draw">
      ${gameTabs('#/draw')}
      <header class="draw-head">
        <h1>${t('pictionary.title')}</h1>
        <p>${t('pictionary.subtitle')}</p>
      </header>
      <p class="quest-task${isCleared('draw') ? ' done' : ''}" id="pc-task"></p>
      <div class="draw-score">
        <span class="sync"><b id="pc-score"></b> ${t('pictionary.score')}</span>
        <span id="pc-streak"></span><span id="pc-best"></span>
      </div>
      <p class="draw-roles" id="pc-roles"></p>
      <div class="draw-tools" id="pc-tools">
        <div class="swatches" role="group" aria-label="${t('pictionary.tool.color')}">
          ${COLORS.map((c) => `<button type="button" class="swatch" data-color="${c}" style="--c:${c}" aria-label="${c}"></button>`).join('')}
        </div>
        <div class="sizes" role="group" aria-label="${t('pictionary.tool.size')}">
          ${SIZES.map((z, i) => `<button type="button" class="size" data-size="${z}" aria-label="${t('pictionary.tool.size')} ${i + 1}"><i style="--z:${4 + i * 5}px"></i></button>`).join('')}
        </div>
        <button type="button" class="tool" id="pc-eraser">${t('pictionary.tool.eraser')}</button>
        <button type="button" class="tool" id="pc-undo">${t('pictionary.tool.undo')}</button>
        <button type="button" class="tool" id="pc-clear">${t('pictionary.tool.clear')}</button>
      </div>
      <div class="canvas-wrap">
        <canvas id="pc-canvas"></canvas>
        <div class="timer" id="pc-timer" aria-hidden="true"><i></i></div>
        <span class="secret" id="pc-secret" aria-live="polite"></span>
        <div class="draw-overlay" id="pc-overlay"></div>
      </div>
      <div class="draw-play" id="pc-play">
        <div class="play-row">
          <span class="seconds" id="pc-seconds" aria-live="off"></span>
          <button type="button" class="d-btn peek" id="pc-peek">${t('pictionary.peek')}</button>
        </div>
        <form class="guess-form" id="pc-form" autocomplete="off">
          <input id="pc-guess" type="text" enterkeyhint="send" placeholder="${t('pictionary.guess.placeholder')}" />
          <button type="submit" class="d-btn primary">${t('pictionary.guess.submit')}</button>
        </form>
        <p class="misses" id="pc-misses"></p>
        <div class="play-row">
          <button type="button" class="d-btn" id="pc-spoken">${t('pictionary.spoken')}</button>
          <button type="button" class="d-btn ghost" id="pc-skip">${t('pictionary.skip')}</button>
        </div>
      </div>
    </section>`;

  const $ = <T extends HTMLElement = HTMLElement>(sel: string) => root.querySelector<T>(sel)!;
  const canvas = $<HTMLCanvasElement>('#pc-canvas');
  const ctx = canvas.getContext('2d');
  const overlay = $('#pc-overlay');
  const secret = $('#pc-secret');
  const input = $<HTMLInputElement>('#pc-guess');
  let lastPhase = '';
  let lastScore = -1;

  // ---- canvas ----
  function redraw(): void {
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    paint(ctx, strokes, w, h);
  }
  const resizer = new ResizeObserver(redraw);
  resizer.observe(canvas);

  let drawing: Stroke | null = null;
  const pointAt = (e: PointerEvent) => toUnit(e.clientX, e.clientY, canvas.getBoundingClientRect());
  canvas.addEventListener('pointerdown', (e) => {
    if (match!.phase !== 'drawing') return;
    e.preventDefault();
    canvas.setPointerCapture(e.pointerId);
    drawing = { ...tool, points: [pointAt(e)] };
    strokes.push(drawing);
    redraw();
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drawing) return;
    const events = typeof e.getCoalescedEvents === 'function' ? e.getCoalescedEvents() : [e];
    for (const ev of events.length ? events : [e]) drawing.points.push(pointAt(ev));
    redraw();
  });
  const endStroke = () => (drawing = null);
  canvas.addEventListener('pointerup', endStroke);
  canvas.addEventListener('pointercancel', endStroke);

  // ---- tools ----
  function updateTools(): void {
    root.querySelectorAll<HTMLElement>('.swatch').forEach((b) =>
      b.classList.toggle('active', !tool.erase && b.dataset.color === tool.color));
    root.querySelectorAll<HTMLElement>('.size').forEach((b) => b.classList.toggle('active', Number(b.dataset.size) === tool.size));
    $('#pc-eraser').classList.toggle('active', tool.erase);
    $<HTMLButtonElement>('#pc-undo').disabled = strokes.length === 0;
    $<HTMLButtonElement>('#pc-clear').disabled = strokes.length === 0;
  }
  $('#pc-tools').addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('button');
    if (!b) return;
    if (b.dataset.color) tool = { ...tool, color: b.dataset.color, erase: false };
    else if (b.dataset.size) tool = { ...tool, size: Number(b.dataset.size) };
    else if (b.id === 'pc-eraser') tool = { ...tool, erase: !tool.erase };
    else if (b.id === 'pc-undo') strokes.pop();
    else if (b.id === 'pc-clear') strokes = [];
    redraw();
    updateTools();
  });
  // Tool buttons also react to pointer-up on the canvas (stroke count changes).
  canvas.addEventListener('pointerup', updateTools);

  // ---- peek: the word shows only while the button is held ----
  const showWord = (on: boolean) => {
    const w = match!.word;
    secret.textContent = on && w && match!.phase === 'drawing' ? t('pictionary.word', { word: `${w.zh} · ${w.en}` }) : '';
    secret.classList.toggle('on', Boolean(secret.textContent));
  };
  const peek = $('#pc-peek');
  peek.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    peek.setPointerCapture(e.pointerId); // keep the press even if the layout shifts under the finger
    showWord(true);
  });
  for (const ev of ['pointerup', 'pointerleave', 'pointercancel', 'blur'] as const) peek.addEventListener(ev, () => showWord(false));
  peek.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); showWord(true); } });
  peek.addEventListener('keyup', () => showWord(false));
  peek.addEventListener('contextmenu', (e) => e.preventDefault());

  // ---- round flow ----
  function apply(next: Match): void {
    match = next;
    if (match.score !== lastScore) saveTally(s, match);
    update();
  }

  function overlayHtml(m: Match): string {
    const guesser = otherPlayer(m.drawer);
    if (m.phase === 'ready')
      return `<div class="ov-card">
        <h2>${t('pictionary.ready.title', { n: m.round, drawer: nameOf(m.drawer) })}</h2>
        <p>${t('pictionary.ready.hint', { guesser: nameOf(guesser) })}</p>
        <button type="button" class="d-btn primary" id="pc-start">${t('pictionary.start')}</button>
      </div>`;
    if (m.phase === 'result' && m.word) {
      const head = m.outcome === 'correct' ? t('pictionary.correct') : m.outcome === 'timeout' ? t('pictionary.timeout') : t('pictionary.skipped');
      return `<div class="ov-card ${m.outcome}">
        ${m.outcome === 'correct' ? '<div class="ov-hearts" aria-hidden="true">❤ ❤ ❤</div>' : ''}
        <h2>${head}</h2>
        <p>${t('pictionary.answer', { zh: escape(m.word.zh), en: escape(m.word.en) })}</p>
        <button type="button" class="d-btn primary" id="pc-next">${t('pictionary.next', { drawer: nameOf(guesser) })}</button>
      </div>`;
    }
    return '';
  }

  function update(): void {
    const m = match!;
    $('#pc-score').textContent = String(m.score);
    $('#pc-task').textContent = isCleared('draw') ? t('quest.cleared.eyebrow', { n: 5 }) : t('quest.task.draw', { done: Math.min(m.score, DRAW_GOAL), total: DRAW_GOAL });
    if (m.score >= DRAW_GOAL) { $('#pc-task').classList.add('done'); levelCleared('draw'); }
    $('#pc-streak').textContent = t('pictionary.streak', { n: m.streak });
    $('#pc-best').textContent = t('pictionary.best', { n: m.best });
    $('#pc-roles').textContent = t('pictionary.roles', { n: m.round, drawer: nameOf(m.drawer), guesser: nameOf(otherPlayer(m.drawer)) });
    root.querySelector('.draw')!.setAttribute('data-phase', m.phase);
    root.querySelector('.draw')!.setAttribute('data-drawer', m.drawer);

    if (m.phase !== lastPhase || m.score !== lastScore) {
      overlay.innerHTML = overlayHtml(m);
      overlay.hidden = m.phase === 'drawing';
      root.querySelector<HTMLElement>('#pc-start, #pc-next')?.focus({ preventScroll: true });
      if (m.phase === 'drawing') input.value = '';
      showWord(false);
    }
    lastPhase = m.phase;
    lastScore = m.score;

    $('#pc-misses').innerHTML = m.misses.length
      ? `${t('pictionary.misses')} ${m.misses.map((x) => `<span>${escape(x)}</span>`).join('')}` : '';
    updateClock();
    updateTools();
  }

  function updateClock(): void {
    const m = match!;
    const left = m.phase === 'drawing' ? timeLeft(m, Date.now()) : m.phase === 'ready' ? ROUND_MS : 0;
    $('#pc-seconds').textContent = t('pictionary.seconds', { n: Math.ceil(left / 1000) });
    const bar = $('#pc-timer');
    bar.style.setProperty('--left', String(left / ROUND_MS));
    bar.classList.toggle('low', m.phase === 'drawing' && left <= 10_000);
  }

  overlay.addEventListener('click', (e) => {
    const id = (e.target as HTMLElement).closest('button')?.id;
    if (id === 'pc-start') {
      strokes = [];
      redraw();
      apply(startRound(match!, pickWord(WORDS, match!.used), Date.now()));
    } else if (id === 'pc-next') {
      apply(nextRound(match!));
    }
  });

  $('#pc-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const before = match!;
    apply(guess(before, input.value, Date.now()));
    if (match!.phase === 'drawing' && match!.misses.length > before.misses.length) {
      input.value = '';
      input.classList.remove('shake');
      void input.offsetWidth;
      input.classList.add('shake');
    }
  });
  $('#pc-spoken').addEventListener('click', () => apply(markCorrect(match!, Date.now())));
  $('#pc-skip').addEventListener('click', () => apply(skip(match!)));

  const timer = window.setInterval(() => {
    const next = tick(match!, Date.now());
    if (next !== match) apply(next);
    else updateClock();
  }, 250);

  update();
  redraw();
  return () => {
    window.clearInterval(timer);
    resizer.disconnect();
  };
}
