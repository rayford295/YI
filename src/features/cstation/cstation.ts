// A day in College Station: walk Yifan's day, stop by stop, and find where he is right now.
import '../world/world.css';
import './cstation.css';
import { t, getLang, type Key } from '../../core/i18n';
import { getPlayer, type PlayerId } from '../../core/quest';
import { avatarHtml, playerName } from '../../core/quest-ui';
import { prefersReducedMotion } from '../../core/motion';
import { clockIn } from '../../core/dates';
import { config } from '../../core/config';
import { escapeAttr } from '../../core/html';
import { CS_MAP, CS_SPAWN, STOPS, stopAt, type Stop } from './day';
import { walkable, guardSpot, type Point } from '../world/town';
import { WorldEngine, type Npc } from '../world/engine';
import { bindControls, padHtml } from '../world/controls';
import { JINGYI, YIFAN, buildSheet, type Dir } from '../world/sprites';
import { WATER_PHASES, renderWater } from '../world/tiles';
import { phaseAt, tintFor } from '../world/daylight';
import { bumpSound, doorSound, stepSound, talkSound } from '../world/sound';

const posKey = (p: PlayerId) => `yi.cs.${p}`;
const ZONE = config.him.zone;
const pad2 = (n: number) => String(n).padStart(2, '0');
const hhmm = (h: number) => `${pad2(Math.floor(h))}:${pad2(Math.round((h % 1) * 60))}`;
const windows = (s: Stop) => s.hours.map(([a, b]) => `${hhmm(a)}–${hhmm(b === 24 ? 0 : b)}`).join(' · ');

interface Action { label: string; run: () => void }

export function renderCStation(root: HTMLElement): () => void {
  const p = getPlayer()!;
  const now = () => { const c = clockIn(ZONE, new Date(), getLang()); return { hour: c.hour + Number(c.time.slice(3)) / 60, time: c.time }; };
  const here = () => stopAt(now().hour);
  const title = (s: Stop) => t(`cs.stop.${s.level}` as Key);

  let start: Point = { ...CS_SPAWN }, dir: Dir = 'down';
  try {
    const [x, y] = (localStorage.getItem(posKey(p)) ?? '').split(',').map(Number);
    if (Number.isFinite(x) && Number.isFinite(y) && walkable(x, y, undefined, CS_MAP)) start = { x, y };
  } catch { /* storage blocked */ }

  root.innerHTML = `
    <section class="world cs">
      <header class="world-head sign">
        ${avatarHtml('yifan', 'big')}
        <p class="eyebrow">${t('cs.eyebrow')}</p>
        <h1>${t('cs.title')}</h1>
        <p class="world-sub">${t('cs.subtitle')}</p>
        <p class="cs-now" id="cs-now"></p>
      </header>
      <ul class="cs-day" id="cs-day">${STOPS.map((s) => `<li data-stop="${s.level}" title="${escapeAttr(windows(s))}"><i>${s.number}</i>${title(s)}</li>`).join('')}</ul>
      <div class="world-stage">
        <canvas id="world-canvas" tabindex="0" aria-label="${escapeAttr(t('cs.title'))}"></canvas>
        <div class="world-dialog" id="world-dialog" hidden role="dialog" aria-live="polite">
          <p class="world-name" id="world-name"></p>
          <div class="world-panel" id="world-panel">
            <img class="world-face" id="world-face" alt="" hidden />
            <p class="world-text" id="world-text"></p>
            <div class="world-actions" id="world-actions"></div>
          </div>
        </div>
      </div>
      ${padHtml()}
      <p class="world-hint keys">${t('world.hint.keys')}</p>
      <p class="world-hint touch">${t('world.hint.touch')}</p>
      <p class="world-foot"><a href="/">${t('cs.back')}</a></p>
    </section>`;

  const canvas = root.querySelector<HTMLCanvasElement>('#world-canvas')!;
  const dialog = root.querySelector<HTMLElement>('#world-dialog')!;
  const nameEl = root.querySelector<HTMLElement>('#world-name')!;
  const textEl = root.querySelector<HTMLElement>('#world-text')!;
  const actionsEl = root.querySelector<HTMLElement>('#world-actions')!;
  const nowEl = root.querySelector<HTMLElement>('#cs-now')!;
  const dayEl = root.querySelector<HTMLElement>('#cs-day')!;

  let typing = 0;
  let primary: Action | undefined;
  const closeDialog = () => { dialog.hidden = true; engine.paused = false; primary = undefined; clearInterval(typing); };
  function openDialog(name: string, text: string, actions: Action[]): void {
    engine.paused = true; engine.releaseAll();
    nameEl.textContent = name;
    actionsEl.innerHTML = '';
    primary = actions[0];
    actions.forEach((a, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = `btn ${i === 0 ? 'go' : 'quiet'}`; b.textContent = a.label;
      b.addEventListener('click', () => a.run());
      actionsEl.appendChild(b);
    });
    dialog.hidden = false;
    talkSound();
    clearInterval(typing);
    if (prefersReducedMotion()) { textEl.textContent = text; return; }
    let i = 0; textEl.textContent = '';
    typing = window.setInterval(() => { i += 2; textEl.textContent = text.slice(0, i); if (i >= text.length) clearInterval(typing); }, 24);
  }

  // Yifan himself stands in front of wherever his day has him right now (for his visitor only).
  const yifanNpc: Npc | undefined = p === 'jingyi' ? { id: 'yifan', ...guardSpot(here()), frames: [], sheet: buildSheet(YIFAN), dir: 'down' } : undefined;
  const npcs: Npc[] = yifanNpc ? [yifanNpc] : [];

  const onDoor = (b: { level: string }) => {
    const s = STOPS.find((x) => x.level === b.level)!;
    doorSound();
    openDialog(`${s.number} · ${title(s)}`, `${windows(s)}\n${t(`cs.story.${s.level}` as Key)}`, [{ label: t('world.close'), run: closeDialog }]);
  };
  const onBump = () => {
    const s = here();
    openDialog(playerName('yifan'), t('cs.me', { time: now().time, place: title(s) }) + ' ' + t(`cs.story.${s.level}` as Key), [{ label: t('world.close'), run: closeDialog }]);
  };

  let tintAt = 0, tint: ReturnType<typeof tintFor>;
  const engine = new WorldEngine({
    canvas, map: CS_MAP, sheet: buildSheet(p === 'jingyi' ? JINGYI : YIFAN), start, dir, npcs,
    walkable: (x, y) => walkable(x, y, undefined, CS_MAP),
    cleared: () => false,
    onDoor, onBump,
    onMove: (q) => { try { localStorage.setItem(posKey(p), `${q.x},${q.y}`); } catch { /* ignore */ } },
    onStep: stepSound, onBlocked: bumpSound,
    water: prefersReducedMotion() ? undefined : Array.from({ length: WATER_PHASES }, (_, i) => renderWater(i, CS_MAP)),
    tint: () => { const n = Date.now(); if (n - tintAt > 60_000) { tintAt = n; tint = tintFor(phaseAt(clockIn(ZONE, new Date(n), getLang()).hour)); } return tint; },
    label: (b) => { const s = STOPS.find((x) => x.level === b.level)!; return `${s.number} · ${title(s)}`; },
  });
  const unbind = bindControls({ engine, canvas, root, dialog, primary: () => primary?.run(), close: closeDialog });

  // The strip and the "now" line follow the clock in College Station; Yifan walks to his next stop.
  let shown: string | undefined;
  const tick = () => {
    const { time } = now(); const s = here();
    nowEl.textContent = t('cs.now', { time, place: title(s) });
    dayEl.querySelectorAll('li').forEach((li) => li.classList.toggle('now', li.dataset.stop === s.level));
    if (yifanNpc && shown !== s.level) { if (shown) engine.walkNpc('yifan', guardSpot(s)); shown = s.level; }
  };
  tick();
  const clock = window.setInterval(tick, 15_000);
  dayEl.addEventListener('click', (e) => {
    const li = (e.target as HTMLElement).closest<HTMLElement>('li'); if (!li || !dialog.hidden) return;
    const s = STOPS.find((x) => x.level === li.dataset.stop); if (s) engine.walkTo(s.door);
  });

  return () => { clearInterval(clock); clearInterval(typing); unbind(); engine.destroy(); };
}
