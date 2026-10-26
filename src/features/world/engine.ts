// The walking engine: grid steps, facing, bumping, a camera that follows, one rAF loop.
// The rules (`step`, `faced`) are pure so they can be tested; the class wires them to a canvas.
import { HEIGHT, WIDTH, BUILDINGS, buildingAt, type Building, type Point } from './town';
import { TILE, flag, fountainGlint, renderTown } from './tiles';
import { SPRITE_H, SPRITE_W, type Dir, type SpriteSheet } from './sprites';

export interface Mover { x: number; y: number; dir: Dir }
export const DELTA: Record<Dir, Point> = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };

/** The tile a mover is looking at. */
export const faced = (m: Mover): Point => ({ x: m.x + DELTA[m.dir].x, y: m.y + DELTA[m.dir].y });

/**
 * Try to walk one tile. Always turns to face `dir`; moves only when the target is free.
 * Returns the new mover and whether it moved.
 */
export function step(m: Mover, dir: Dir, free: (x: number, y: number) => boolean): { mover: Mover; moved: boolean } {
  const t = { x: m.x + DELTA[dir].x, y: m.y + DELTA[dir].y };
  if (!free(t.x, t.y)) return { mover: { ...m, dir }, moved: false };
  return { mover: { x: t.x, y: t.y, dir }, moved: true };
}

export interface Npc { id: string; x: number; y: number; frames: HTMLCanvasElement[]; dir?: Dir; sheet?: SpriteSheet }

export interface EngineOptions {
  canvas: HTMLCanvasElement;
  sheet: SpriteSheet;
  start: Point;
  dir?: Dir;
  walkable(x: number, y: number): boolean;      // ground rule (doors included)
  cleared(level: string): boolean;              // flags on roofs
  npcs: Npc[];
  onDoor(b: Building): void;                    // the player stepped onto an open door
  onBump(npc: Npc): void;                       // walked into, or talked to, an NPC
  onMove?(p: Point): void;
  onStep?(): void;                              // a step begins (footsteps)
  onBlocked?(): void;                           // walked into something solid, at most every 350 ms
  label?(b: Building): string;                 // house name shown when the player is near its door
  water?: HTMLCanvasElement[];                  // pond frames cycled over the town; omit for a still pond
}

const STEP_MS = 190;
const easeOut = (t: number) => 1 - (1 - t) * (1 - t);

export class WorldEngine {
  private ctx: CanvasRenderingContext2D;
  private town = renderTown();
  private mover: Mover;
  private from: Point;
  private t = 1;                       // progress of the current step, 1 = standing
  private held: Dir[] = [];
  private raf = 0;
  private last = 0;
  private scale = 3;
  private frameClock = 0;
  private bumpAt = 0;
  private blockedAt = 0;
  private resize: ResizeObserver | undefined;
  private queue: Dir[] = [];            // steps still to take after a tap on the map
  private goal: Point | undefined;      // the tapped tile, to face and act on when the walk ends
  private cam = { x: 0, y: 0 };
  paused = false;

  constructor(private o: EngineOptions) {
    this.ctx = o.canvas.getContext('2d')!;
    this.mover = { x: o.start.x, y: o.start.y, dir: o.dir ?? 'down' };
    this.from = { ...o.start };
    this.fit();
    if (typeof ResizeObserver !== 'undefined') {
      this.resize = new ResizeObserver(() => this.fit());
      this.resize.observe(o.canvas);
    }
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.loop);
  }

  get position(): Point { return { x: this.mover.x, y: this.mover.y }; }
  get dir(): Dir { return this.mover.dir; }

  /** Hold or release a direction (keyboard or d-pad). The latest held direction wins. */
  press(d: Dir): void {
    this.queue = []; this.goal = undefined;
    this.held = [d, ...this.held.filter((x) => x !== d)];
    // A tap shorter than a frame still counts as one step.
    if (!this.paused && this.t >= 1) this.tryStep(performance.now());
  }
  release(d: Dir): void { this.held = this.held.filter((x) => x !== d); }
  releaseAll(): void { this.held = []; }

  /** The A button: talk to the NPC in front, or go through the door you stand on / face. */
  interact(): void {
    if (this.paused || this.t < 1) return;
    const here = buildingAt(this.mover.x, this.mover.y);
    if (here) { this.o.onDoor(here); return; }
    const f = faced(this.mover);
    const npc = this.npcAt(f.x, f.y);
    if (npc) { this.o.onBump(npc); return; }
    const b = buildingAt(f.x, f.y);
    if (b && this.o.walkable(f.x, f.y)) this.o.onDoor(b);
  }

  /** A tap on the canvas, in CSS pixels relative to it: walk there, or up to whatever stands there. */
  tapAt(cssX: number, cssY: number): void {
    if (this.paused) return;
    const s = TILE * this.scale;
    this.walkTo({ x: Math.floor((cssX + this.cam.x) / s), y: Math.floor((cssY + this.cam.y) / s) });
  }

  /**
   * Plan the shortest walk to `target` (breadth-first over free tiles). A target you cannot stand on
   * (an NPC, a locked door, water) becomes a walk to the nearest free tile next to it, then a turn
   * towards it and the same action a bump would cause.
   */
  walkTo(target: Point): void {
    this.held = [];
    const start = this.position;
    const standable = this.free(target.x, target.y);
    const goals = standable
      ? [target]
      : (Object.values(DELTA) as Point[]).map((d) => ({ x: target.x + d.x, y: target.y + d.y })).filter((q) => this.free(q.x, q.y));
    const key = (q: Point) => `${q.x},${q.y}`;
    const goalKeys = new Set(goals.map(key));
    const prev = new Map<string, { from: string; dir: Dir }>();
    const seen = new Set([key(start)]);
    const queue: Point[] = [start];
    let found: Point | undefined;
    while (queue.length && !found) {
      const q = queue.shift()!;
      if (goalKeys.has(key(q))) { found = q; break; }
      for (const dir of ['up', 'down', 'left', 'right'] as Dir[]) {
        const n = { x: q.x + DELTA[dir].x, y: q.y + DELTA[dir].y };
        if (seen.has(key(n)) || !this.free(n.x, n.y)) continue;
        seen.add(key(n)); prev.set(key(n), { from: key(q), dir }); queue.push(n);
      }
    }
    if (!found) return;
    const dirs: Dir[] = [];
    for (let k = key(found); k !== key(start);) { const p = prev.get(k)!; dirs.unshift(p.dir); k = p.from; }
    this.queue = dirs;
    this.goal = standable ? undefined : target;
    if (this.t >= 1) this.tryStep(performance.now());
  }

  destroy(): void {
    cancelAnimationFrame(this.raf);
    this.resize?.disconnect();
  }

  private npcAt(x: number, y: number): Npc | undefined { return this.o.npcs.find((n) => n.x === x && n.y === y); }
  private free = (x: number, y: number): boolean => this.o.walkable(x, y) && !this.npcAt(x, y);

  private fit(): void {
    const c = this.o.canvas;
    const cssW = c.clientWidth || 640;
    const cssH = c.clientHeight || Math.round(cssW * 0.68);
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    // Integer scale so pixels stay crisp: about 11 tiles across on a phone, 15+ on a laptop.
    this.scale = Math.max(2, Math.floor(cssW / (TILE * 14)));
    c.width = Math.round(cssW * dpr);
    c.height = Math.round(cssH * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  private tryStep(now: number): void {
    const d = this.held[0] ?? this.queue.shift();
    if (!d) {
      if (this.goal) { this.faceAndAct(this.goal, now); this.goal = undefined; }
      return;
    }
    const r = step(this.mover, d, this.free);
    this.mover = r.mover;
    if (r.moved) {
      this.from = { x: this.mover.x - DELTA[d].x, y: this.mover.y - DELTA[d].y };
      this.t = 0;
      this.o.onStep?.();
    } else {
      const f = faced(this.mover);
      const npc = this.npcAt(f.x, f.y);
      if (npc) { if (now - this.bumpAt > 700) { this.bumpAt = now; this.o.onBump(npc); } }
      else if (now - this.blockedAt > 350) { this.blockedAt = now; this.o.onBlocked?.(); }
    }
  }

  private faceAndAct(target: Point, now: number): void {
    const dx = target.x - this.mover.x, dy = target.y - this.mover.y;
    if (Math.abs(dx) + Math.abs(dy) !== 1) return;
    this.mover = { ...this.mover, dir: dx === 1 ? 'right' : dx === -1 ? 'left' : dy === 1 ? 'down' : 'up' };
    const npc = this.npcAt(target.x, target.y);
    if (npc) { this.bumpAt = now; this.o.onBump(npc); return; }
    const b = buildingAt(target.x, target.y);
    if (b && !this.o.walkable(target.x, target.y)) { const g = this.o.npcs.find((n) => n.id === `guard:${b.level}`); if (g) this.o.onBump(g); }
  }

  private loop = (now: number): void => {
    this.raf = requestAnimationFrame(this.loop);
    // rAF timestamps can precede performance.now() taken in the constructor: never run time backwards.
    const dt = Math.max(0, Math.min(now - this.last, 50));
    this.last = now;
    this.frameClock += dt;
    if (!this.paused) {
      if (this.t < 1) {
        this.t = Math.min(1, this.t + dt / STEP_MS);
        if (this.t === 1) {
          this.o.onMove?.(this.position);
          const b = buildingAt(this.mover.x, this.mover.y);
          if (b) { this.releaseAll(); this.o.onDoor(b); }
          else this.tryStep(now);
        }
      } else this.tryStep(now);
    }
    this.draw();
  };

  private draw(): void {
    const { ctx, scale } = this;
    const c = this.o.canvas;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const viewW = c.width / dpr, viewH = c.height / dpr;
    const k = easeOut(this.t);
    const px = (this.from.x + (this.mover.x - this.from.x) * k) * TILE;
    const py = (this.from.y + (this.mover.y - this.from.y) * k) * TILE;
    // Camera: centre on the player, clamp to the map, snap to device pixels.
    const mapW = WIDTH * TILE * scale, mapH = HEIGHT * TILE * scale;
    let camX = px * scale + TILE * scale / 2 - viewW / 2;
    let camY = py * scale + TILE * scale / 2 - viewH / 2;
    camX = Math.max(0, Math.min(mapW - viewW, camX));
    camY = Math.max(0, Math.min(mapH - viewH, camY));
    if (mapW < viewW) camX = (mapW - viewW) / 2;
    if (mapH < viewH) camY = (mapH - viewH) / 2;
    camX = Math.round(camX * dpr) / dpr; camY = Math.round(camY * dpr) / dpr;
    this.cam = { x: camX, y: camY };

    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#0b2036';
    ctx.fillRect(0, 0, viewW, viewH);
    ctx.save();
    ctx.translate(-camX, -camY);
    ctx.scale(scale, scale);
    ctx.drawImage(this.town, 0, 0);
    const wave = Math.floor(this.frameClock / 400) % 2;
    if (this.o.water?.length) {
      ctx.drawImage(this.o.water[Math.floor(this.frameClock / 450) % this.o.water.length], 0, 0);
      fountainGlint(ctx, Math.floor(this.frameClock / 500) % 2);
    }
    for (const b of BUILDINGS) if (this.o.cleared(b.level)) flag(ctx, b, wave);

    // Entities, painted back to front so a sprite lower on the map overlaps one above it.
    const walkFrame = this.t < 1 ? Math.floor(this.frameClock / 120) % 2 : 0;
    const bob = this.t < 1 && walkFrame ? -1 : 0;
    const ents: { y: number; draw: () => void }[] = this.o.npcs.map((n) => ({
      y: n.y,
      draw: () => {
        const img = n.sheet ? n.sheet[n.dir ?? 'down'][0] : n.frames[Math.floor(this.frameClock / 600) % n.frames.length];
        ctx.drawImage(img, n.x * TILE + (TILE - SPRITE_W) / 2, n.y * TILE - (SPRITE_H - TILE) + 1);
      },
    }));
    ents.push({
      y: py / TILE,
      draw: () => {
        const img = this.o.sheet[this.mover.dir][walkFrame];
        ctx.drawImage(img, Math.round(px + (TILE - SPRITE_W) / 2), Math.round(py - (SPRITE_H - TILE) + 1 + bob));
      },
    });
    ents.sort((a, b) => a.y - b.y).forEach((e) => e.draw());
    ctx.restore();

    // The name of a house whose door is within two tiles, as a plate over its roof (screen space).
    if (this.o.label) for (const b of BUILDINGS) {
      if (Math.abs(b.door.x - this.mover.x) + Math.abs(b.door.y - this.mover.y) > 2) continue;
      const text = this.o.label(b);
      const x = (b.door.x + 0.5) * TILE * scale - camX, y = (b.door.y - 2) * TILE * scale - camY - 8;
      ctx.font = '600 12px system-ui, sans-serif';
      const w = ctx.measureText(text).width + 16;
      ctx.fillStyle = 'rgba(11, 32, 54, 0.92)';
      ctx.beginPath(); ctx.roundRect(x - w / 2, y - 20, w, 20, 6); ctx.fill();
      ctx.fillStyle = '#d3a557';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(text, x, y - 10);
    }
  }
}
