// Level: a tattoo for the other one, handwritten with a finger on an arm or a shoulder. The ink
// is kept on this device per player; "Ink it" settles it into the skin and clears the level.
import './tattoo.css';
import { t, pick } from '../../core/i18n';
import { config } from '../../core/config';
import { getPlayer, isCleared, levelNumber, type PlayerId } from '../../core/quest';
import { levelCleared, toast } from '../../core/quest-ui';
import { paint, toUnit, type Stroke } from './strokes';
import { inked, loadTattoo, saveTattoo, type Spot } from './store';

const INK = '#22303c';
const SIZE = 0.012;

/** A simple skin: an arm seen from the side, or a shoulder, as inline SVG under the canvas. */
function skinSvg(spot: Spot, sized = false): string {
  const size = sized ? ' width="600" height="300" xmlns="http://www.w3.org/2000/svg"' : '';
  const skin = '<linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6d7b8"/><stop offset="1" stop-color="#e2b592"/></linearGradient>';
  if (spot === 'arm') return `<svg${size} viewBox="0 0 600 300" aria-hidden="true"><defs>${skin}</defs>
    <path d="M30,150 C30,105 80,84 140,86 L470,94 C545,96 572,122 572,150 C572,178 545,204 470,206 L140,214 C80,216 30,195 30,150 Z" fill="url(#sk)"/>
    <path d="M30,150 C30,195 80,216 140,214 L470,206 C545,204 572,178 572,150" fill="none" stroke="#c9906c" stroke-opacity="0.35" stroke-width="6"/>
    <path d="M24,120 C8,130 8,172 24,182" fill="none" stroke="#c9906c" stroke-opacity="0.5" stroke-width="4"/></svg>`;
  return `<svg${size} viewBox="0 0 600 300" aria-hidden="true"><defs>${skin}</defs>
    <path d="M40,300 C60,190 150,110 300,104 C450,98 540,170 572,300 Z" fill="url(#sk)"/>
    <path d="M300,104 C330,70 330,30 300,0 L240,0 C250,40 250,80 230,112" fill="#f0cfae"/>
    <path d="M120,300 C150,230 180,190 240,160" fill="none" stroke="#102e49" stroke-width="18" stroke-linecap="round" opacity="0.85"/></svg>`;
}

export function renderTattoo(root: HTMLElement): () => void {
  const me: PlayerId = getPlayer() ?? 'jingyi';
  const them: PlayerId = me === 'jingyi' ? 'yifan' : 'jingyi';
  const theirName = pick(them === 'jingyi' ? config.her.name : config.him.name);
  const saved = loadTattoo(me);
  let spot: Spot = saved?.spot ?? 'arm';
  let strokes: Stroke[] = saved?.strokes ?? [];
  let done = isCleared('tattoo') && !!saved;
  let drawing: Stroke | null = null;

  root.innerHTML = `
    <section class="tattoo">
      <header class="tattoo-head sign">
        <h1>${t('tattoo.title')}</h1>
        <p>${t('tattoo.subtitle', { name: theirName })}</p>
      </header>
      <p class="quest-task${isCleared('tattoo') ? ' done' : ''}" id="tt-task"></p>
      <div class="tattoo-spot" role="group" aria-label="${t('tattoo.spot')}">
        <button type="button" data-spot="arm">${t('tattoo.arm')}</button>
        <button type="button" data-spot="shoulder">${t('tattoo.shoulder')}</button>
      </div>
      <div class="tattoo-skin card" id="tt-skin">
        <div class="tattoo-svg" id="tt-svg"></div>
        <canvas id="tt-canvas" aria-label="${t('tattoo.canvas')}"></canvas>
      </div>
      <div class="tattoo-tools" id="tt-tools">
        <button type="button" class="link" id="tt-undo">${t('tattoo.undo')}</button>
        <button type="button" class="link" id="tt-clear">${t('tattoo.clear')}</button>
        <button type="button" class="cta" id="tt-ink">${t('tattoo.ink')}</button>
      </div>
      <p class="tattoo-note" id="tt-note"></p>
      <p class="tattoo-foot"><button type="button" class="link" id="tt-save">${t('tattoo.save')}</button></p>
    </section>`;
  const $ = <T extends HTMLElement>(sel: string) => root.querySelector<T>(sel)!;
  const skin = $('#tt-skin');
  const canvas = $<HTMLCanvasElement>('#tt-canvas');
  const ctx = canvas.getContext('2d')!;

  const resize = () => {
    const r = skin.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    redraw();
  };
  const redraw = () => {
    const r = skin.getBoundingClientRect();
    ctx.save();
    ctx.globalAlpha = done ? 0.92 : 1;
    ctx.filter = done ? 'blur(0.4px)' : 'none';
    paint(ctx, drawing ? [...strokes, drawing] : strokes, r.width, r.height);
    ctx.restore();
  };
  const paintChrome = () => {
    $('#tt-svg').innerHTML = skinSvg(spot);
    root.querySelectorAll<HTMLButtonElement>('.tattoo-spot button').forEach((b) => b.classList.toggle('active', b.dataset.spot === spot));
    skin.classList.toggle('inked', done);
    $('#tt-tools').hidden = done;
    $('#tt-task').classList.toggle('done', isCleared('tattoo'));
    $('#tt-task').textContent = isCleared('tattoo') ? t('quest.cleared.eyebrow', { n: levelNumber('tattoo') }) : t('quest.task.tattoo', { n: levelNumber('tattoo'), name: theirName });
    $('#tt-note').innerHTML = done
      ? `${t('tattoo.done', { name: theirName })} <button type="button" class="link" id="tt-again">${t('tattoo.again')}</button>`
      : t('tattoo.hint');
    redraw();
  };

  // Drawing with a finger, a pen or a mouse.
  const at = (e: PointerEvent) => toUnit(e.clientX, e.clientY, skin.getBoundingClientRect());
  canvas.addEventListener('pointerdown', (e) => {
    if (done || !e.isPrimary) return;
    canvas.setPointerCapture(e.pointerId);
    drawing = { color: INK, size: SIZE, erase: false, points: [at(e)] };
    redraw();
  });
  canvas.addEventListener('pointermove', (e) => { if (!drawing || !e.isPrimary) return; drawing.points.push(at(e)); redraw(); });
  const up = () => { if (!drawing) return; strokes.push(drawing); drawing = null; redraw(); };
  canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);

  root.querySelector('.tattoo-spot')!.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('button');
    if (!b || done) return;
    spot = b.dataset.spot as Spot; paintChrome();
  });
  $('#tt-undo').addEventListener('click', () => { strokes.pop(); redraw(); });
  $('#tt-clear').addEventListener('click', () => { strokes = []; redraw(); });
  $('#tt-ink').addEventListener('click', () => {
    if (!inked(strokes)) { toast(t('tattoo.more')); return; }
    done = true;
    saveTattoo(me, { spot, strokes, inkedAt: new Date().toISOString().slice(0, 10) });
    paintChrome();
    skin.classList.remove('settle'); void skin.offsetWidth; skin.classList.add('settle');
    levelCleared('tattoo');
  });
  root.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('#tt-again')) { done = false; paintChrome(); }
  });
  // Save a picture: the skin and the ink together, to send to the other one.
  $('#tt-save').addEventListener('click', () => {
    const out = document.createElement('canvas');
    const W = 1200, H = 600;
    out.width = W; out.height = H;
    const o = out.getContext('2d')!;
    const img = new Image();
    img.onload = () => {
      o.fillStyle = '#f6ecd9'; o.fillRect(0, 0, W, H);
      o.drawImage(img, 0, 0, W, H);
      paint(o, strokes, W, H);
      o.fillStyle = INK; o.font = '28px serif'; o.textAlign = 'right';
      o.fillText(`${t('tattoo.for', { name: theirName })}`, W - 24, H - 24);
      const a = document.createElement('a');
      a.download = `tattoo-for-${them}.png`; a.href = out.toDataURL('image/png'); a.click();
    };
    img.onerror = () => { toast(t('tattoo.save.failed')); };
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(skinSvg(spot, true))}`;
  });

  paintChrome();
  resize();
  window.addEventListener('resize', resize);
  return () => window.removeEventListener('resize', resize);
}

