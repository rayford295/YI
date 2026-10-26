// The ways to drive a walking map, shared by every page that has one: keyboard (arrows / WASD,
// Enter / Space / Z, Escape), a tap on the canvas (walk there), and the on-screen d-pad + A.
import type { WorldEngine } from './engine';
import type { Dir } from './sprites';

export interface ControlOptions {
  engine: WorldEngine;
  canvas: HTMLCanvasElement;
  root: HTMLElement;          // holds the .world-dpad buttons and #world-a
  dialog: HTMLElement;        // the talk box; while it is open keys confirm or close instead of walking
  primary(): void;            // the talk box's first action
  close(): void;              // Escape
}

const KEYS: Record<string, Dir> = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right', W: 'up', S: 'down', A: 'left', D: 'right' };

/** Wire everything up; returns the undo. */
export function bindControls({ engine, canvas, root, dialog, primary, close }: ControlOptions): () => void {
  const onKeyDown = (e: KeyboardEvent) => {
    const tgt = e.target as HTMLElement | null;
    if (tgt && /^(INPUT|TEXTAREA|SELECT)$/.test(tgt.tagName)) return;
    if (!dialog.hidden) {
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if ((e.key === 'Enter' || e.key === ' ' || e.key === 'z' || e.key === 'Z') && !(tgt instanceof HTMLButtonElement)) { e.preventDefault(); primary(); }
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
  root.querySelector('#world-a')?.addEventListener('click', () => { if (dialog.hidden) engine.interact(); else primary(); });

  return () => {
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
    window.removeEventListener('blur', onBlur);
  };
}

/** The d-pad and A button markup every map page shares. */
export const padHtml = (): string => `
      <div class="world-pad">
        <div class="world-dpad" aria-label="d-pad">
          <button type="button" class="u" data-dir="up" aria-label="up">▲</button>
          <button type="button" class="l" data-dir="left" aria-label="left">◀</button>
          <span class="c" aria-hidden="true"></span>
          <button type="button" class="r" data-dir="right" aria-label="right">▶</button>
          <button type="button" class="d" data-dir="down" aria-label="down">▼</button>
        </div>
        <button type="button" class="world-a" id="world-a" aria-label="A">A</button>
      </div>`;
