// The town page: the new home. A canvas with the walking engine, a d-pad for phones, the talk box.
import './world.css';
import { t, type Key } from '../../core/i18n';
import { LEVELS, getPlayer, isCleared, isUnlocked, current, reset, setPlayer, onQuestChange, clearedByAll, levelIndex, levelNumber, type PlayerId } from '../../core/quest';
import { avatarHtml, playerName } from '../../core/quest-ui';
import { prefersReducedMotion } from '../../core/motion';
import { escapeAttr } from '../../core/html';
import { BUILDINGS, CAT_HOMES, PARTNER, SPAWN, buildingAt, guardSpot, walkable, type Building, type Point } from './town';
import { WorldEngine, type Npc } from './engine';
import { JINGYI, YIFAN, buildCat, buildSheet, type CatId, type Dir } from './sprites';
import { WATER_PHASES, renderWater } from './tiles';
import { phaseAt, tintFor } from './daylight';
import { clockIn } from '../../core/dates';
import { config } from '../../core/config';
import { getLang } from '../../core/i18n';
import { bumpSound, doorSound, setSoundOn, soundOn, stepSound, talkSound } from './sound';

const catPhoto = (id: CatId): string => `${import.meta.env.BASE_URL}media/cats/${id}.jpg`;
// Where each cat was last seen on this device, so a cat whose post has changed walks there.
const catsKey = (p: PlayerId) => `yi.world.cats.${p}`;
function loadCats(p: PlayerId): Partial<Record<CatId, Point>> {
  try {
    const raw = JSON.parse(localStorage.getItem(catsKey(p)) ?? '{}') as Record<string, unknown>;
    const out: Partial<Record<CatId, Point>> = {};
    for (const id of ['coffee', 'duoduo'] as const) {
      const v = raw[id];
      if (typeof v === 'string') { const [x, y] = v.split(',').map(Number); if (Number.isFinite(x) && Number.isFinite(y) && walkable(x, y)) out[id] = { x, y }; }
    }
    return out;
  } catch { return {}; }
}
function saveCats(p: PlayerId, posts: Record<CatId, Point>): void {
  try { localStorage.setItem(catsKey(p), JSON.stringify({ coffee: `${posts.coffee.x},${posts.coffee.y}`, duoduo: `${posts.duoduo.x},${posts.duoduo.y}` })); } catch { /* ignore */ }
}

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
          <div class="world-panel" id="world-panel">
            <img class="world-face" id="world-face" alt="" hidden />
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
        <span aria-hidden="true"> · </span>
        <button type="button" class="link" id="world-sound" aria-pressed="${soundOn()}">${t(soundOn() ? 'world.sound.on' : 'world.sound.off')}</button>
      </p>
    </section>`;

  const canvas = root.querySelector<HTMLCanvasElement>('#world-canvas')!;
  const dialog = root.querySelector<HTMLElement>('#world-dialog')!;
  const nameEl = root.querySelector<HTMLElement>('#world-name')!;
  const textEl = root.querySelector<HTMLElement>('#world-text')!;
  const actionsEl = root.querySelector<HTMLElement>('#world-actions')!;
  const panel = root.querySelector<HTMLElement>('#world-panel')!;
  const face = root.querySelector<HTMLImageElement>('#world-face')!;

  // Who stands where: the partner by the fountain; Coffee in front of the next locked door and
  // Duoduo in front of the one after. A cat with nothing left to guard rests at its home spot.
  const locked = [...BUILDINGS].sort((a, b) => levelIndex(a.level) - levelIndex(b.level)).filter((b) => !isUnlocked(b.level, p));
  const catOf = new Map<string, CatId>();
  const posts = { coffee: CAT_HOMES.coffee, duoduo: CAT_HOMES.duoduo };
  const lastSeen = loadCats(p);
  const walks: { id: string; to: Point }[] = [];
  const cats: Npc[] = (['coffee', 'duoduo'] as const).map((id, i) => {
    const b = locked[i];
    const post = b ? guardSpot(b) : CAT_HOMES[id];
    posts[id] = post;
    const npc: Npc = { id: b ? `guard:${b.level}` : `cat:${id}`, ...post, frames: buildCat(id) };
    // A cat seen somewhere else last time starts there and walks to its post.
    const was = lastSeen[id];
    if (was && (was.x !== post.x || was.y !== post.y)) { npc.x = was.x; npc.y = was.y; walks.push({ id: npc.id, to: post }); }
    catOf.set(npc.id, id);
    return npc;
  });
  // Remember where the cats actually are (mid-walk included) whenever this page goes away, so a
  // re-render, a level or a closed tab never makes a cat jump.
  const catSpot = (id: CatId): Point => { const n = cats.find((c) => catOf.get(c.id) === id)!; return { x: n.x, y: n.y }; };
  const saveCatSpots = () => saveCats(p, { coffee: catSpot('coffee'), duoduo: catSpot('duoduo') });
  if (!walks.length) saveCatSpots();
  window.addEventListener('pagehide', saveCatSpots);
  const npcs: Npc[] = [
    { id: `partner:${other}`, x: PARTNER.x, y: PARTNER.y, frames: [], sheet: buildSheet(other === 'jingyi' ? JINGYI : YIFAN), dir: 'left' },
    ...cats,
  ];

  // Coming back from a level puts you in front of its door, facing it.
  let start = loadPos(p), dir: Dir = 'down';
  const returning = !!buildingAt(start.x, start.y);
  if (returning) { start = { x: start.x, y: start.y + 1 }; dir = 'up'; }

  let typing = 0;
  let primary: Action | undefined;
  const closeDialog = () => { dialog.hidden = true; engine.paused = false; primary = undefined; clearInterval(typing); };
  function openDialog(name: string, html: string, actions: Action[], photo?: string): void {
    engine.paused = true; engine.releaseAll();
    nameEl.textContent = name;
    // A real photo beside the words when a cat talks.
    face.hidden = !photo; panel.classList.toggle('has-face', !!photo);
    if (photo) face.src = photo;
    actionsEl.innerHTML = '';
    primary = actions[0];
    actions.forEach((a, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = `btn ${a.cls ?? (i === 0 ? 'go' : 'quiet')}`; b.textContent = a.label;
      b.addEventListener('click', () => a.run());
      actionsEl.appendChild(b);
    });
    dialog.hidden = false;
    talkSound();
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

  // Going in: the iris closes on the player, then the level opens.
  let leaving = false;
  const go = (hash: string) => {
    if (leaving) return;
    leaving = true; doorSound(); closeDialog();
    const after = () => { location.hash = hash; };
    if (prefersReducedMotion()) after(); else void engine.iris('close', 380).then(after);
  };
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
    const cat = catOf.get(n.id);
    if (cat) {
      const close = [{ label: t('world.close'), run: closeDialog }];
      if (n.id.startsWith('guard:')) {
        const prev = LEVELS[levelIndex(n.id.slice(6)) - 1];
        openDialog(t(`world.cat.${cat}` as Key), t(`world.cat.${cat}.guard` as Key, { prev: prev ? t(prev.title) : '' }), close, catPhoto(cat));
      } else openDialog(t(`world.cat.${cat}` as Key), t(`world.cat.${cat}.rest` as Key), close, catPhoto(cat));
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

  const zone = p === 'jingyi' ? config.her.zone : config.him.zone;
  let tintAt = 0, tint: ReturnType<typeof tintFor>;
  const engine = new WorldEngine({
    canvas, sheet: buildSheet(p === 'jingyi' ? JINGYI : YIFAN), start, dir, npcs,
    walkable: (x, y) => walkable(x, y, (id) => isUnlocked(id, p)),
    cleared: (id) => isCleared(id, p),
    onDoor, onBump, onMove: (q) => savePos(p, q),
    onStep: stepSound, onBlocked: bumpSound,
    water: prefersReducedMotion() ? undefined : Array.from({ length: WATER_PHASES }, (_, i) => renderWater(i)),
    tint: () => {
      // The sky over the player's own city, re-read once a minute.
      const now = Date.now();
      if (now - tintAt > 60_000) { tintAt = now; tint = tintFor(phaseAt(clockIn(zone, new Date(now), getLang()).hour)); }
      return tint;
    },
    label: (b) => `${levelNumber(b.level)} · ${t(LEVELS[levelIndex(b.level)].title)}`,
  });

  // Coming back from a level the iris opens; cats whose posts changed get up and walk.
  if (returning && !prefersReducedMotion()) void engine.iris('open', 480);
  // The first time on this device: one welcome line with the controls, never shown again.
  const INTRO_KEY = 'yi.world.intro';
  let introSeen = false;
  try { introSeen = localStorage.getItem(INTRO_KEY) === '1'; } catch { introSeen = true; }
  if (!introSeen && !returning) {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    window.setTimeout(() => {
      if (!dialog.hidden) return;
      openDialog(t('world.intro.name'), t(fine ? 'world.intro.keys' : 'world.intro.touch'), [{ label: t('world.intro.go'), run: () => { closeDialog(); try { localStorage.setItem(INTRO_KEY, '1'); } catch { /* ignore */ } } }]);
    }, 600);
  }
  window.setTimeout(() => { for (const w of walks) engine.walkNpc(w.id, w.to); }, returning ? 500 : 200);

  // A resting cat now and then wanders one tile from its home and comes back.
  const timers = new Set<number>();
  const fidget = window.setInterval(() => {
    if (!dialog.hidden) return;
    for (const n of cats) {
      const id = catOf.get(n.id)!;
      if (!n.id.startsWith('cat:') || Math.random() < 0.6) continue;
      const home = CAT_HOMES[id];
      if (n.x !== home.x || n.y !== home.y) continue;
      const me = engine.position;
      const spots = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => ({ x: home.x + dx, y: home.y + dy }))
        .filter((q) => walkable(q.x, q.y) && !(q.x === me.x && q.y === me.y) && !npcs.some((m) => m.x === q.x && m.y === q.y));
      const to = spots[Math.floor(Math.random() * spots.length)];
      if (!to) continue;
      engine.walkNpc(n.id, to, 320);
      const back = window.setTimeout(() => { timers.delete(back); engine.walkNpc(n.id, home, 320); }, 2600 + Math.random() * 2000);
      timers.add(back);
    }
  }, 6000);

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
  // Tap (not drag) on the map to walk there.
  let tap: { x: number; y: number } | undefined;
  canvas.addEventListener('pointerdown', (e) => { canvas.focus({ preventScroll: true }); tap = { x: e.clientX, y: e.clientY }; });
  canvas.addEventListener('pointerup', (e) => {
    if (!tap || Math.hypot(e.clientX - tap.x, e.clientY - tap.y) > 10) { tap = undefined; return; }
    tap = undefined;
    if (!dialog.hidden) return;
    const r = canvas.getBoundingClientRect();
    engine.tapAt(e.clientX - r.left, e.clientY - r.top);
  });

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

  const soundBtn = root.querySelector<HTMLButtonElement>('#world-sound')!;
  soundBtn.addEventListener('click', () => {
    const on = !soundOn(); setSoundOn(on);
    soundBtn.textContent = t(on ? 'world.sound.on' : 'world.sound.off'); soundBtn.setAttribute('aria-pressed', String(on));
    if (on) talkSound();
  });
  root.querySelector('#world-switch')!.addEventListener('click', () => { setPlayer(null); location.hash = '#/start'; });
  root.querySelector('#world-reset')!.addEventListener('click', () => { if (window.confirm(t('journey.reset.confirm'))) { reset(p); try { localStorage.removeItem(posKey(p)); } catch { /* ignore */ } } });
  const offQuest = onQuestChange(() => { if (getPlayer()) { teardown(); renderWorld(root); } });

  const teardown = () => {
    clearInterval(fidget); timers.forEach((id) => clearTimeout(id));
    saveCatSpots();
    window.removeEventListener('pagehide', saveCatSpots);
    engine.destroy();
    clearInterval(typing);
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
    window.removeEventListener('blur', onBlur);
    offQuest();
  };
  return teardown;
}
