// The town page: the new home. A canvas with the walking engine, a d-pad for phones, the talk box.
import './world.css';
import { t } from '../../core/i18n';
import { LEVELS, getPlayer, isCleared, isUnlocked, current, reset, setPlayer, onQuestChange, clearedByAll, levelIndex, type PlayerId } from '../../core/quest';
import { avatarHtml, playerName } from '../../core/quest-ui';
import { prefersReducedMotion } from '../../core/motion';
import { escapeAttr } from '../../core/html';
import { BUILDINGS, PARTNER, SPAWN, buildingAt, guardSpot, walkable, type Building, type Point } from './town';
import { WorldEngine, type Npc } from './engine';
import { JINGYI, YIFAN, buildCat, buildSheet, type Dir } from './sprites';

const posKey = (p: PlayerId) => `yi.world.${p}`;
function loadPos(p: PlayerId): Point {
  try {
    const [x, y] = (localStorage.getItem(posKey(p)) ?? '').split(',').map(Number);
    if (Number.isFinite(x) && Number.isFinite(y) && walkable(x, y)) return { x, y };
  } catch { /* storage blocked */ }
  return { ...SPAWN };
}
function savePos(p: PlayerId, q: Point): void {
  try { localStorage.setItem(posKey(p), `${q.x},${q.y}`); } catch { /* ignore */ }
}

interface Action { label: string; cls?: string; run: () => void }

export function renderWorld(root: HTMLElement): () => void {
  const p = getPlayer()!;
  const other: PlayerId = p === 'jingyi' ? 'yifan' : 'jingyi';
  const cur = current(p);
  const done = LEVELS.filter((l) => isCleared(l.id, p)).length;

  root.innerHTML = `
    <section class="world">
      <header class="world-head">
        ${avatarHtml(p, 'big')}
        <p class="eyebrow">${t('journey.eyebrow', { name: playerName(p) })}</p>
        <h1>${t('world.title')}</h1>
        <p class="world-sub">${cur ? t('journey.progress', { done, total: LEVELS.length, next: t(cur.title) }) : t('journey.complete')} · ${t('world.subtitle')}</p>
      </header>
      <div class="world-stage">
        <canvas id="world-canvas" tabindex="0" aria-label="${escapeAttr(t('world.title'))}"></canvas>
        <div class="world-dialog" id="world-dialog" hidden role="dialog" aria-live="polite">
          <p class="world-name" id="world-name"></p>
          <div class="world-panel">
            <p class="world-text" id="world-text"></p>
            <div class="world-actions" id="world-actions"></div>
          </div>
        </div>
      </div>
      <div class="world-pad">
        <div class="world-dpad" aria-label="d-pad">
          <button type="button" class="u" data-dir="up" aria-label="up">▲</button>
          <button type="button" class="l" data-dir="left" aria-label="left">◀</button>
          <span class="c" aria-hidden="true"></span>
          <button type="button" class="r" data-dir="right" aria-label="right">▶</button>
          <button type="button" class="d" data-dir="down" aria-label="down">▼</button>
        </div>
        <button type="button" class="world-a" id="world-a" aria-label="A">A</button>
      </div>
      <p class="world-hint keys">${t('world.hint.keys')}</p>
      <p class="world-hint touch">${t('world.hint.touch')}</p>
      <p class="world-foot">
        <a href="#/journey">${t('world.list')}</a>
        <span aria-hidden="true"> · </span>
        <button type="button" class="link" id="world-switch">${t('journey.switch')}</button>
        <span aria-hidden="true"> · </span>
        <button type="button" class="link" id="world-reset">${t('journey.reset')}</button>
      </p>
    </section>`;

  const canvas = root.querySelector<HTMLCanvasElement>('#world-canvas')!;
  const dialog = root.querySelector<HTMLElement>('#world-dialog')!;
  const nameEl = root.querySelector<HTMLElement>('#world-name')!;
  const textEl = root.querySelector<HTMLElement>('#world-text')!;
  const actionsEl = root.querySelector<HTMLElement>('#world-actions')!;

  // Who stands where: the partner by the fountain, a cat in front of every locked door.
  const cat = buildCat();
  const npcs: Npc[] = [
    { id: `partner:${other}`, x: PARTNER.x, y: PARTNER.y, frames: [], sheet: buildSheet(other === 'jingyi' ? JINGYI : YIFAN), dir: 'left' },
    ...BUILDINGS.filter((b) => !isUnlocked(b.level, p)).map((b) => ({ id: `guard:${b.level}`, ...guardSpot(b), frames: cat })),
  ];

  // Coming back from a level puts you in front of its door, facing it.
  let start = loadPos(p), dir: Dir = 'down';
  if (buildingAt(start.x, start.y)) { start = { x: start.x, y: start.y + 1 }; dir = 'up'; }

  let typing = 0;
  let primary: Action | undefined;
  const closeDialog = () => { dialog.hidden = true; engine.paused = false; primary = undefined; clearInterval(typing); };
  function openDialog(name: string, html: string, actions: Action[]): void {
    engine.paused = true; engine.releaseAll();
    nameEl.textContent = name;
    actionsEl.innerHTML = '';
    primary = actions[0];
    actions.forEach((a, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = `btn ${a.cls ?? (i === 0 ? 'go' : 'quiet')}`; b.textContent = a.label;
      b.addEventListener('click', () => a.run());
      actionsEl.appendChild(b);
    });
    dialog.hidden = false;
    // Typewriter text, printed at once under reduced motion.
    clearInterval(typing);
    if (prefersReducedMotion()) { textEl.innerHTML = html; return; }
    const tmp = document.createElement('span'); tmp.innerHTML = html;
    const full = tmp.textContent ?? '';
    const tag = tmp.querySelector('.tag')?.outerHTML ?? '';
    let i = 0;
    textEl.textContent = '';
    typing = window.setInterval(() => {
      i += 2;
      textEl.textContent = full.slice(0, i);
      if (i >= full.length) { clearInterval(typing); textEl.innerHTML = html; }
    }, 24);
    void tag;
  }

  const go = (hash: string) => { closeDialog(); location.hash = hash; };
  function onDoor(b: Building): void {
    savePos(p, b.door);
    const level = LEVELS[levelIndex(b.level)];
    const cleared = isCleared(b.level, p);
    openDialog(t(level.title), `${t(level.story)}${cleared ? `<span class="tag">${t('world.cleared.tag')}</span>` : ''}`, [
      { label: cleared ? t('world.again') : t('world.enter'), run: () => go(`#${level.route}`) },
      { label: t('world.later'), run: closeDialog },
    ]);
  }
  function onBump(n: Npc): void {
    if (n.id.startsWith('guard:')) {
      const id = n.id.slice(6);
      const prev = LEVELS[levelIndex(id) - 1];
      openDialog(t('world.guard.name'), t('world.guard.line', { prev: prev ? t(prev.title) : '' }), [{ label: t('world.close'), run: closeDialog }]);
      return;
    }
    const theirs = LEVELS.filter((l) => isCleared(l.id, other)).length;
    if (clearedByAll('ring')) {
      openDialog(playerName(other), t('world.partner.epilogue'), [
        { label: t('world.partner.epilogue.go'), run: () => go('#/letter') },
        { label: t('world.close'), run: closeDialog },
      ]);
    } else openDialog(playerName(other), t('world.partner.line', { done: theirs }), [{ label: t('world.close'), run: closeDialog }]);
  }

  const engine = new WorldEngine({
    canvas, sheet: buildSheet(p === 'jingyi' ? JINGYI : YIFAN), start, dir, npcs,
    walkable: (x, y) => walkable(x, y, (id) => isUnlocked(id, p)),
    cleared: (id) => isCleared(id, p),
    onDoor, onBump, onMove: (q) => savePos(p, q),
  });

  // Keyboard: arrows / WASD walk, Enter / Space / Z act, Escape closes the talk box.
  const KEYS: Record<string, Dir> = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right', W: 'up', S: 'down', A: 'left', D: 'right' };
  const onKeyDown = (e: KeyboardEvent) => {
    const tgt = e.target as HTMLElement | null;
    if (tgt && /^(INPUT|TEXTAREA|SELECT)$/.test(tgt.tagName)) return;
    if (!dialog.hidden) {
      if (e.key === 'Escape') { e.preventDefault(); closeDialog(); }
      else if ((e.key === 'Enter' || e.key === ' ' || e.key === 'z' || e.key === 'Z') && !(tgt instanceof HTMLButtonElement)) { e.preventDefault(); primary?.run(); }
      return;
    }
    const d = KEYS[e.key];
    if (d) { e.preventDefault(); if (!e.repeat) engine.press(d); return; }
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'z' || e.key === 'Z') { e.preventDefault(); engine.interact(); }
  };
  const onKeyUp = (e: KeyboardEvent) => { const d = KEYS[e.key]; if (d) engine.release(d); };
  const onBlur = () => engine.releaseAll();
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('blur', onBlur);
  canvas.addEventListener('pointerdown', () => canvas.focus({ preventScroll: true }));

  // The d-pad: hold to keep walking.
  root.querySelectorAll<HTMLButtonElement>('.world-dpad button').forEach((b) => {
    const d = b.dataset.dir as Dir;
    const down = (e: PointerEvent) => { e.preventDefault(); b.setPointerCapture(e.pointerId); b.classList.add('down'); engine.press(d); };
    const up = () => { b.classList.remove('down'); engine.release(d); };
    b.addEventListener('pointerdown', down);
    b.addEventListener('pointerup', up);
    b.addEventListener('pointercancel', up);
    b.addEventListener('lostpointercapture', up);
    b.addEventListener('contextmenu', (e) => e.preventDefault());
  });
  root.querySelector('#world-a')!.addEventListener('click', () => { if (dialog.hidden) engine.interact(); else primary?.run(); });

  root.querySelector('#world-switch')!.addEventListener('click', () => { setPlayer(null); location.hash = '#/start'; });
  root.querySelector('#world-reset')!.addEventListener('click', () => { if (window.confirm(t('journey.reset.confirm'))) { reset(p); try { localStorage.removeItem(posKey(p)); } catch { /* ignore */ } } });
  const offQuest = onQuestChange(() => { if (getPlayer()) { teardown(); renderWorld(root); } });

  const teardown = () => {
    engine.destroy();
    clearInterval(typing);
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
    window.removeEventListener('blur', onBlur);
    offQuest();
  };
  return teardown;
}
