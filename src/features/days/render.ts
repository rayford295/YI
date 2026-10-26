// A day in someone's city: walk their day, stop by stop, and find where they are right now.
// One page for both days (College Station for Yifan, Shenzhen for Jingyi); the data is a `Day`.
import '../world/world.css';
import './days.css';
import { t, getLang, type Key } from '../../core/i18n';
import { getPlayer, type PlayerId } from '../../core/quest';
import { avatarHtml, playerName } from '../../core/quest-ui';
import { prefersReducedMotion } from '../../core/motion';
import { clockIn } from '../../core/dates';
import { escapeAttr } from '../../core/html';
import { stopAt, type Day, type Stop } from './day';
import { walkable, guardSpot, type Point } from '../world/town';
import { WorldEngine, type Npc } from '../world/engine';
import { bindControls, padHtml } from '../world/controls';
import { JINGYI, YIFAN, buildCat, buildSheet, type CatId, type Dir } from '../world/sprites';
import { CS } from './cs';
import { SZ } from './sz';

const catPhoto = (id: CatId): string => `${import.meta.env.BASE_URL}media/cats/${id}.jpg`;
import { WATER_PHASES, renderWater } from '../world/tiles';
import { phaseAt, tintFor } from '../world/daylight';
import { bumpSound, doorSound, stepSound, talkSound } from '../world/sound';

const posKey = (day: Day, p: PlayerId) => `yi.day.${day.id}.${p}`;
const pad2 = (n: number) => String(n).padStart(2, '0');
const hhmm = (h: number) => `${pad2(Math.floor(h))}:${pad2(Math.round((h % 1) * 60))}`;
const windows = (s: Stop) => s.hours.map(([a, b]) => `${hhmm(a)}–${hhmm(b === 24 ? 0 : b)}`).join(' · ');

interface Action { label: string; run: () => void }

export const renderCS = (root: HTMLElement): (() => void) => renderDay(CS, root);
export const renderSZ = (root: HTMLElement): (() => void) => renderDay(SZ, root);

export function renderDay(day: Day, root: HTMLElement): () => void {
  const p = getPlayer()!;
  const { id, person, zone: ZONE, stops: STOPS, map: MAP } = day;
  const them = person === 'yifan' ? YIFAN : JINGYI;
  const key = (k: string) => `${id}.${k}` as Key;
  const now = () => { const c = clockIn(ZONE, new Date(), getLang()); return { hour: c.hour + Number(c.time.slice(3)) / 60, time: c.time }; };
  const here = () => stopAt(day, now().hour);
  const title = (s: Stop) => t(key(`stop.${s.level}`));

  let start: Point = { ...day.spawn }, dir: Dir = 'down';
  try {
    const [x, y] = (localStorage.getItem(posKey(day, p)) ?? '').split(',').map(Number);
    if (Number.isFinite(x) && Number.isFinite(y) && walkable(x, y, undefined, MAP)) start = { x, y };
  } catch { /* storage blocked */ }

  root.innerHTML = `
    <section class="world day">
      <header class="world-head sign">
        ${avatarHtml(person, 'big')}
        <p class="eyebrow">${t(key('eyebrow'))}</p>
        <h1>${t(key('title'))}</h1>
        <p class="world-sub">${t(key('subtitle'))}</p>
        <p class="day-now" id="day-now"></p>
      </header>
      <ul class="day-strip" id="day-strip">${STOPS.map((s) => `<li data-stop="${s.level}" title="${escapeAttr(windows(s))}"><i>${s.number}</i>${title(s)}</li>`).join('')}</ul>
      <div class="world-stage">
        <canvas id="world-canvas" tabindex="0" aria-label="${escapeAttr(t(key('title')))}"></canvas>
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
      <p class="world-foot"><a href="/">${t('world.back.town')}</a></p>
    </section>`;

  const canvas = root.querySelector<HTMLCanvasElement>('#world-canvas')!;
  const dialog = root.querySelector<HTMLElement>('#world-dialog')!;
  const nameEl = root.querySelector<HTMLElement>('#world-name')!;
  const textEl = root.querySelector<HTMLElement>('#world-text')!;
  const actionsEl = root.querySelector<HTMLElement>('#world-actions')!;
  const nowEl = root.querySelector<HTMLElement>('#day-now')!;
  const dayEl = root.querySelector<HTMLElement>('#day-strip')!;

  let typing = 0;
  let primary: Action | undefined;
  const closeDialog = () => { dialog.hidden = true; engine.paused = false; primary = undefined; clearInterval(typing); };
  const faceEl = root.querySelector<HTMLImageElement>('#world-face')!;
  function openDialog(name: string, text: string, actions: Action[], photo?: string): void {
    engine.paused = true; engine.releaseAll();
    nameEl.textContent = name;
    faceEl.hidden = !photo; if (photo) faceEl.src = photo;
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

  // The person stands in front of wherever their day has them right now (for their visitor only);
  // the cats, where they live, for everyone.
  const themNpc: Npc | undefined = p !== person ? { id: 'them', ...guardSpot(here()), frames: [], sheet: buildSheet(them), dir: 'down' } : undefined;
  const npcs: Npc[] = [...(themNpc ? [themNpc] : []), ...(day.cats ?? []).map((c) => ({ id: `cat:${c.id}`, x: c.at.x, y: c.at.y, frames: buildCat(c.id) }))];

  const onDoor = (b: { level: string }) => {
    const s = STOPS.find((x) => x.level === b.level)!;
    doorSound();
    openDialog(`${s.number} · ${title(s)}`, `${windows(s)}\n${t(key(`story.${s.level}`))}`, [{ label: t('world.close'), run: closeDialog }]);
  };
  const onBump = (n: Npc) => {
    const close = [{ label: t('world.close'), run: closeDialog }];
    if (n.id.startsWith('cat:')) { const cat = n.id.slice(4) as CatId; openDialog(t(`world.cat.${cat}` as Key), t(key(`cat.${cat}`)), close, catPhoto(cat)); return; }
    const s = here();
    openDialog(playerName(person), t(key('me'), { time: now().time, place: title(s) }) + ' ' + t(key(`story.${s.level}`)), close);
  };

  let tintAt = 0, tint: ReturnType<typeof tintFor>;
  const engine = new WorldEngine({
    canvas, map: MAP, sheet: buildSheet(p === 'jingyi' ? JINGYI : YIFAN), start, dir, npcs,
    walkable: (x, y) => walkable(x, y, undefined, MAP),
    cleared: () => false,
    onDoor, onBump,
    onMove: (q) => { try { localStorage.setItem(posKey(day, p), `${q.x},${q.y}`); } catch { /* ignore */ } },
    onStep: stepSound, onBlocked: bumpSound,
    water: prefersReducedMotion() ? undefined : Array.from({ length: WATER_PHASES }, (_, i) => renderWater(i, MAP)),
    tint: () => { const n = Date.now(); if (n - tintAt > 60_000) { tintAt = n; tint = tintFor(phaseAt(clockIn(ZONE, new Date(n), getLang()).hour)); } return tint; },
    label: (b) => { const s = STOPS.find((x) => x.level === b.level)!; return `${s.number} · ${title(s)}`; },
  });
  const unbind = bindControls({ engine, canvas, root, dialog, primary: () => primary?.run(), close: closeDialog });

  // The strip and the "now" line follow the clock in their city; they walk to the next stop.
  let shown: string | undefined;
  const tick = () => {
    const { time } = now(); const s = here();
    nowEl.textContent = t(key('now'), { time, place: title(s) });
    dayEl.querySelectorAll('li').forEach((li) => li.classList.toggle('now', li.dataset.stop === s.level));
    if (themNpc && shown !== s.level) { if (shown) engine.walkNpc('them', guardSpot(s)); shown = s.level; }
  };
  tick();
  const clock = window.setInterval(tick, 15_000);
  dayEl.addEventListener('click', (e) => {
    const li = (e.target as HTMLElement).closest<HTMLElement>('li'); if (!li || !dialog.hidden) return;
    const s = STOPS.find((x) => x.level === li.dataset.stop); if (!s) return;
    // When they stand in front of that door, the walk ends at them (and their line), not the door.
    const spot = guardSpot(s);
    engine.walkTo(themNpc && themNpc.x === spot.x && themNpc.y === spot.y ? spot : s.door);
  });

  return () => { clearInterval(clock); clearInterval(typing); unbind(); engine.destroy(); };
}
