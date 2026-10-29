// A tiny pixel theatre for the two cutscenes (the birthday prologue and the wedding). A 128×80
// canvas scaled up crisp, actors made from the town's sprite sheets, particles, a darkness layer
// with candle-like glows, and an HTML caption box underneath for words and buttons. A scene is an
// async script: `await stage.walk(...)`, `await stage.say(...)`, `await stage.ask(...)`. Leaving the
// page aborts the script; every wait resolves at once and the script stops at its next await.
import { buildSheet, type Dir, type Figure, type SpriteSheet } from '../world/sprites';
import { prefersReducedMotion } from '../../core/motion';
import { talkSound } from '../world/sound';

export const W = 128, H = 80;

export interface Actor {
  sheet: SpriteSheet; x: number; y: number; dir: Dir;
  walking: boolean; visible: boolean;
  /** Pixels lifted off the ground (a hop). */
  lift: number;
  /** Something carried above the head or in front: drawn after the actor. */
  carry?: (ctx: CanvasRenderingContext2D, x: number, y: number) => void;
}

export interface Particle {
  x: number; y: number; vx: number; vy: number; g: number;
  life: number; max: number; color: string; size: number;
  kind: 'dot' | 'heart' | 'petal' | 'smoke' | 'spark';
}

export interface Glow { x: number; y: number; r: number; flicker?: boolean; color?: string }

export class Aborted extends Error { constructor() { super('aborted'); } }

export class Stage {
  readonly canvas: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;
  readonly actors: Actor[] = [];
  readonly particles: Particle[] = [];
  readonly glows: Glow[] = [];
  /** 0 = full light, 1 = black. Glows cut holes in the dark. */
  dark = 0;
  /** Drawn first and last every frame; scenes swap these as they change rooms. */
  back: (ctx: CanvasRenderingContext2D, t: number) => void = () => undefined;
  front: (ctx: CanvasRenderingContext2D, t: number) => void = () => undefined;
  /** Drawn above the darkness (lit things: candle flames, fireworks). */
  lit: (ctx: CanvasRenderingContext2D, t: number) => void = () => undefined;
  shake = 0;
  readonly signal: AbortSignal;
  private readonly ctl = new AbortController();
  private readonly shade: HTMLCanvasElement;
  private raf = 0;
  private last = performance.now();
  private readonly caption: HTMLElement;
  private readonly nameEl: HTMLElement;
  private readonly textEl: HTMLElement;
  private readonly actionsEl: HTMLElement;
  readonly overlay: HTMLElement;
  readonly calm = prefersReducedMotion();

  constructor(host: HTMLElement) {
    this.signal = this.ctl.signal;
    host.innerHTML = `
      <div class="th-frame">
        <canvas class="th-canvas" width="${W}" height="${H}"></canvas>
        <div class="th-overlay"></div>
      </div>
      <div class="th-caption" hidden>
        <p class="th-name"></p>
        <p class="th-text" aria-live="polite"></p>
        <div class="th-actions"></div>
      </div>`;
    this.canvas = host.querySelector('canvas')!;
    this.ctx = this.canvas.getContext('2d')!;
    this.ctx.imageSmoothingEnabled = false;
    this.overlay = host.querySelector('.th-overlay')!;
    this.caption = host.querySelector('.th-caption')!;
    this.nameEl = host.querySelector('.th-name')!;
    this.textEl = host.querySelector('.th-text')!;
    this.actionsEl = host.querySelector('.th-actions')!;
    this.shade = document.createElement('canvas');
    this.shade.width = W; this.shade.height = H;
    const loop = (now: number) => { this.frame(now); this.raf = requestAnimationFrame(loop); };
    this.raf = requestAnimationFrame(loop);
  }

  destroy(): void { this.ctl.abort(); cancelAnimationFrame(this.raf); clearInterval(this.typing); }

  /** Run an animation nobody waits for; leaving the page is not an error. */
  fire(p: Promise<unknown>): void { void p.catch((e: unknown) => { if (!(e instanceof Aborted)) throw e; }); }

  // ---------- actors ----------
  actor(f: Figure, x: number, y: number, dir: Dir = 'down', visible = true): Actor {
    const a: Actor = { sheet: buildSheet(f), x, y, dir, walking: false, visible, lift: 0 };
    this.actors.push(a);
    return a;
  }
  /** Change an actor's clothes in place (the crown, the gown). */
  dress(a: Actor, f: Figure): void { a.sheet = buildSheet(f); }

  /** Walk in a straight line at `speed` px/s; faces the way it goes. */
  walk(a: Actor, x: number, y = a.y, speed = 22): Promise<void> {
    const dx = x - a.x, dy = y - a.y, dist = Math.hypot(dx, dy);
    if (!dist) return Promise.resolve();
    a.dir = Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
    a.walking = true;
    const x0 = a.x, y0 = a.y, ms = (dist / speed) * 1000;
    return this.tween(ms, (k) => { a.x = x0 + dx * k; a.y = y0 + dy * k; }).finally(() => { a.walking = false; });
  }
  /** A little hop (joy, surprise). */
  hop(a: Actor, h = 3, ms = 320): Promise<void> {
    return this.tween(ms, (k) => { a.lift = Math.sin(k * Math.PI) * h; }).finally(() => { a.lift = 0; });
  }

  // ---------- time ----------
  wait(ms: number): Promise<void> {
    return new Promise((res, rej) => {
      if (this.signal.aborted) { rej(new Aborted()); return; }
      const onAbort = () => { clearTimeout(id); rej(new Aborted()); };
      const id = setTimeout(() => { this.signal.removeEventListener('abort', onAbort); res(); }, ms);
      this.signal.addEventListener('abort', onAbort, { once: true });
    });
  }
  /** Run `fn(k)` with k from 0 to 1 (eased) over `ms`. */
  tween(ms: number, fn: (k: number) => void, ease = (k: number) => k): Promise<void> {
    return new Promise((res, rej) => {
      if (this.signal.aborted) { rej(new Aborted()); return; }
      const t0 = performance.now();
      const step = (now: number) => {
        if (this.signal.aborted) { rej(new Aborted()); return; }
        const k = Math.min(1, (now - t0) / ms);
        fn(ease(k));
        if (k < 1) requestAnimationFrame(step); else res();
      };
      requestAnimationFrame(step);
    });
  }
  fade(to: number, ms = 800): Promise<void> {
    const from = this.dark;
    return this.tween(ms, (k) => { this.dark = from + (to - from) * k; });
  }

  // ---------- words ----------
  private typing = 0;
  private fullHtml = '';
  /** True while the typewriter is still printing. */
  get typingNow(): boolean { return this.typing !== 0; }
  /** Print the rest of the current line at once. */
  finishTyping(): void { if (!this.typing) return; clearInterval(this.typing); this.typing = 0; this.textEl.innerHTML = this.fullHtml; }
  private show(name: string, html: string): void {
    this.caption.hidden = false;
    this.nameEl.textContent = name;
    this.nameEl.hidden = !name;
    clearInterval(this.typing); this.typing = 0; this.fullHtml = html;
    if (this.calm) { this.textEl.innerHTML = html; return; }
    const tmp = document.createElement('span'); tmp.innerHTML = html;
    const full = tmp.textContent ?? '';
    let i = 0;
    this.textEl.textContent = '';
    this.typing = window.setInterval(() => {
      i += 2;
      this.textEl.textContent = full.slice(0, i);
      if (i >= full.length) this.finishTyping();
    }, 24);
  }
  hideCaption(): void { this.caption.hidden = true; clearInterval(this.typing); this.typing = 0; }

  /** Show a line and wait for the reader (a "next" button, a tap on the picture, Enter or Space). */
  say(name: string, html: string, next = '▸'): Promise<void> {
    return this.ask(name, html, [{ label: next, value: 1 }]).then(() => undefined);
  }
  /** Show a line with buttons; resolves with the chosen value. */
  ask<T>(name: string, html: string, choices: { label: string; value: T; cls?: string }[]): Promise<T> {
    this.show(name, html);
    if (html) talkSound();   // the title screen comes before any tap: no sound yet
    this.actionsEl.innerHTML = '';
    return new Promise<T>((res, rej) => {
      // While the line is still printing, the first tap just finishes it.
      const done = (v: T) => { if (this.typingNow) { this.finishTyping(); return; } off(); res(v); };
      const buttons = choices.map((c, i) => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = `btn ${c.cls ?? (i === 0 ? 'go' : 'quiet')}`; b.textContent = c.label;
        if (c.label === '▸') b.setAttribute('aria-label', 'next');
        b.addEventListener('click', () => done(c.value));
        this.actionsEl.appendChild(b);
        return b;
      });
      // One choice: a tap anywhere on the picture or a key also moves on.
      const single = choices.length === 1;
      const onKey = (e: KeyboardEvent) => { if (single && !e.repeat && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); done(choices[0].value); } };
      const onTap = () => { if (single) done(choices[0].value); };
      const onAbort = () => { off(); rej(new Aborted()); };
      const off = () => {
        window.removeEventListener('keydown', onKey); this.canvas.removeEventListener('click', onTap);
        this.signal.removeEventListener('abort', onAbort); buttons.forEach((b) => b.remove());
      };
      window.addEventListener('keydown', onKey); this.canvas.addEventListener('click', onTap);
      this.signal.addEventListener('abort', onAbort, { once: true });
      if (this.signal.aborted) onAbort();
      buttons[0]?.focus({ preventScroll: true });
    });
  }
  /** Words with no button; the script moves on by itself. */
  narrate(name: string, html: string, keepControls = false): void { this.show(name, html); if (!keepControls) this.actionsEl.innerHTML = ''; }
  /** Put custom controls under the words (a hold button, a mic button); returns the container. */
  controls(html: string): HTMLElement { this.actionsEl.innerHTML = html; return this.actionsEl; }

  // ---------- particles ----------
  emit(p: Partial<Particle> & { x: number; y: number }): void {
    if (this.calm && this.particles.length > 30) return;
    this.particles.push({ vx: 0, vy: 0, g: 0, life: 0, max: 1500, color: '#fff', size: 1, kind: 'dot', ...p });
  }
  burst(x: number, y: number, colors: string[], n = 26, speed = 38, kind: Particle['kind'] = 'spark'): void {
    for (let i = 0; i < (this.calm ? Math.min(n, 8) : n); i++) {
      const a = (i / n) * Math.PI * 2 + Math.random() * 0.2, v = speed * (0.6 + Math.random() * 0.5);
      this.emit({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 24, max: 1100 + Math.random() * 600, color: colors[i % colors.length], kind });
    }
  }

  // ---------- drawing ----------
  private frame(now: number): void {
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, W, H);
    ctx.save();
    if (this.shake > 0 && !this.calm) { ctx.translate(Math.round((Math.random() - 0.5) * this.shake), 0); this.shake = Math.max(0, this.shake - dt * 8); }
    this.back(ctx, now);
    // Actors back to front by their feet.
    for (const a of [...this.actors].sort((p, q) => p.y - q.y)) {
      if (!a.visible) continue;
      const frames = a.sheet[a.dir];
      const f = a.walking ? frames[Math.floor(now / 160) % frames.length] : frames[0];
      const x = Math.round(a.x - 6), y = Math.round(a.y - 16 - a.lift);
      ctx.drawImage(f, x, y);
      a.carry?.(ctx, x, y);
    }
    this.front(ctx, now);
    this.drawParticles(ctx, dt, false);
    if (this.dark > 0.001) this.drawDark(ctx, now);
    this.lit(ctx, now);
    this.drawParticles(ctx, dt, true);
    ctx.restore();
  }

  private drawDark(ctx: CanvasRenderingContext2D, now: number): void {
    const s = this.shade.getContext('2d')!;
    s.globalCompositeOperation = 'source-over';
    s.clearRect(0, 0, W, H);
    s.fillStyle = `rgba(8, 6, 20, ${this.dark})`;
    s.fillRect(0, 0, W, H);
    s.globalCompositeOperation = 'destination-out';
    for (const g of this.glows) {
      const r = g.r * (g.flicker && !this.calm ? 0.92 + Math.sin(now / 90 + g.x) * 0.05 + Math.random() * 0.05 : 1);
      const grad = s.createRadialGradient(g.x, g.y, 0, g.x, g.y, r);
      grad.addColorStop(0, 'rgba(0,0,0,1)'); grad.addColorStop(0.55, 'rgba(0,0,0,0.6)'); grad.addColorStop(1, 'rgba(0,0,0,0)');
      s.fillStyle = grad; s.beginPath(); s.arc(g.x, g.y, r, 0, Math.PI * 2); s.fill();
    }
    ctx.drawImage(this.shade, 0, 0);
    // A warm wash where the candles are.
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (const g of this.glows) {
      const grad = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, g.r * 0.8);
      grad.addColorStop(0, g.color ?? 'rgba(255, 170, 70, 0.22)'); grad.addColorStop(1, 'rgba(255, 170, 70, 0)');
      ctx.fillStyle = grad; ctx.fillRect(g.x - g.r, g.y - g.r, g.r * 2, g.r * 2);
    }
    ctx.restore();
  }

  private drawParticles(ctx: CanvasRenderingContext2D, dt: number, litPass: boolean): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      const glows = p.kind === 'spark';
      if (glows !== litPass) continue;
      p.life += dt * 1000; p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.kind === 'petal') p.vx += Math.sin(p.life / 300 + p.size) * 0.4;
      if (p.life > p.max || p.y > H + 4) { this.particles.splice(i, 1); continue; }
      const alpha = Math.max(0, 1 - p.life / p.max);
      ctx.globalAlpha = p.kind === 'smoke' ? alpha * 0.5 : Math.min(1, alpha * 1.6);
      ctx.fillStyle = p.color;
      const x = Math.round(p.x), y = Math.round(p.y);
      if (p.kind === 'heart') pixelHeart(ctx, x, y, p.color, p.size);
      else if (p.kind === 'petal') { ctx.fillRect(x, y, 2, 1); ctx.fillRect(x + 1, y + 1, 1, 1); }
      else if (p.kind === 'smoke') ctx.fillRect(x, y, 1 + Math.floor(p.life / 500), 1);
      else ctx.fillRect(x, y, p.size, p.size);
    }
    ctx.globalAlpha = 1;
  }
}

/** A pixel heart: size 1 is 5×4, size 2 is 7×6. (x, y) is its top-left. */
export function pixelHeart(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, size = 1): void {
  const rows = size >= 2
    ? ['.xx.xx.', 'xxxxxxx', 'xxxxxxx', '.xxxxx.', '..xxx..', '...x...']
    : ['.x.x.', 'xxxxx', '.xxx.', '..x..'];
  ctx.fillStyle = color;
  rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) if (r[i] === 'x') ctx.fillRect(x + i, y + j, 1, 1); });
}

/** Fill a rect in stage pixels. */
export function rect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string): void {
  ctx.fillStyle = color; ctx.fillRect(x, y, w, h);
}

/** Put a piece of HTML over the picture at stage coordinates (so text stays sharp). */
export function place(el: HTMLElement, x: number, y: number, w?: number): void {
  el.style.left = `${(x / W) * 100}%`; el.style.top = `${(y / H) * 100}%`;
  if (w !== undefined) el.style.width = `${(w / W) * 100}%`;
}
