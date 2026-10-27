// Level: Libra and Scorpius, our two signs, side by side. Tap two stars to join them; draw both.
import './stars.css';
import { t, pick } from '../../core/i18n';
import { isCleared, levelNumber } from '../../core/quest';
import { levelCleared, toast } from '../../core/quest-ui';
import { escapeAttr } from '../../core/html';
import { ALL_EDGES, ALL_STARS, CONSTELLATIONS, edgeKey, isEdge, project, type Star } from './constellations';

const S = 1000;
const radius = (mag: number) => Math.max(2.4, 9 - 1.9 * mag);
const byId = new Map(ALL_STARS.map((s) => [s.id, s]));
/** Tap radius: generous, but never past halfway to the nearest other star. */
const hitRadius = (s: Star): number => {
  const p = project(s);
  const nearest = Math.min(...ALL_STARS.filter((o) => o !== s).map((o) => { const q = project(o); return Math.hypot(q.x - p.x, q.y - p.y); }));
  return Math.min(34, nearest / 2);
};

function chartSvg(drawn: Set<string>, picked: string | null, hint: boolean): string {
  const lines = ALL_EDGES.map(([a, b]) => {
    const A = project(byId.get(a)!), B = project(byId.get(b)!);
    const on = drawn.has(edgeKey(a, b));
    if (!on && !hint) return '';
    return `<line class="${on ? 'on' : 'ghost'}" x1="${A.x.toFixed(1)}" y1="${A.y.toFixed(1)}" x2="${B.x.toFixed(1)}" y2="${B.y.toFixed(1)}"/>`;
  }).join('');
  const labels = CONSTELLATIONS.map((c) => {
    const pts = c.stars.map(project);
    const x = pts.reduce((s, p) => s + p.x, 0) / pts.length, y = Math.min(...pts.map((p) => p.y)) - 46;
    const done = c.edges.every((e) => drawn.has(edgeKey(e[0], e[1])));
    return `<text class="cname${done ? ' done' : ''}" x="${x.toFixed(0)}" y="${Math.max(40, y).toFixed(0)}">${escapeAttr(pick(c.name))}</text>`;
  }).join('');
  const dots = [...ALL_STARS].sort((a, b) => b.mag - a.mag).map((s: Star) => {
    const { x, y } = project(s);
    const r = radius(s.mag);
    const joined = ALL_EDGES.some(([a, b]) => (a === s.id || b === s.id) && drawn.has(edgeKey(a, b)));
    return `<g class="sk${picked === s.id ? ' picked' : ''}${joined ? ' joined' : ''}" data-id="${escapeAttr(s.id)}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})">
      <circle class="hit" r="${hitRadius(s).toFixed(1)}"/><circle class="halo" r="${(r + 9).toFixed(1)}"/><circle class="dot" r="${r.toFixed(1)}"/>
      ${s.name && joined ? `<text y="${(r + 20).toFixed(0)}">${escapeAttr(pick(s.name))}</text>` : ''}</g>`;
  }).join('');
  return `<svg viewBox="0 0 ${S} ${S}" role="img">
    <defs><radialGradient id="skybg" cx="50%" cy="40%" r="70%"><stop offset="0" stop-color="#12325a"/><stop offset="0.7" stop-color="#0a1b33"/><stop offset="1" stop-color="#06111f"/></radialGradient></defs>
    <rect width="${S}" height="${S}" fill="url(#skybg)"/>
    <g class="lines">${lines}</g>${dots}${labels}</svg>`;
}

export function renderStars(root: HTMLElement): () => void {
  const done = isCleared('stars');
  const drawn = new Set<string>(done ? ALL_EDGES.map((e) => edgeKey(e[0], e[1])) : []);
  let picked: string | null = null;
  let hint = false;
  root.innerHTML = `
    <section class="stars">
      <header class="stars-head sign">
        <h1>${t('stars.title')}</h1>
        <p>${t('stars.subtitle')}</p>
      </header>
      <p class="quest-task${done ? ' done' : ''}" id="st-task"></p>
      <div class="stars-dome card" id="st-dome"></div>
      <p class="stars-note">${t('stars.claws')}</p>
      <p class="stars-foot">
        <button type="button" class="link" id="st-hint">${t('stars.hint')}</button>
      </p>
    </section>`;
  const dome = root.querySelector<HTMLElement>('#st-dome')!;
  const task = root.querySelector<HTMLElement>('#st-task')!;
  const paint = () => {
    dome.innerHTML = chartSvg(drawn, picked, hint);
    const cleared = isCleared('stars');
    task.classList.toggle('done', cleared);
    task.textContent = cleared ? t('quest.cleared.eyebrow', { n: levelNumber('stars') })
      : t('quest.task.stars', { n: levelNumber('stars'), done: drawn.size, total: ALL_EDGES.length });
  };
  dome.addEventListener('click', (e) => {
    const g = (e.target as Element).closest<SVGGElement>('.sk');
    if (!g || isCleared('stars')) { picked = null; paint(); return; }
    const id = g.dataset.id!;
    if (!picked || picked === id) { picked = picked === id ? null : id; paint(); return; }
    const key = edgeKey(picked, id);
    if (isEdge(picked, id) && !drawn.has(key)) {
      drawn.add(key); picked = id; paint();
      const finished = CONSTELLATIONS.find((c) => c.edges.every((x) => drawn.has(edgeKey(x[0], x[1]))) && c.edges.some((x) => edgeKey(x[0], x[1]) === key));
      if (drawn.size === ALL_EDGES.length) { picked = null; paint(); levelCleared('stars'); }
      else if (finished) toast(t('stars.done.one', { name: pick(finished.name) }));
    } else {
      picked = id; paint();
      toast(t(drawn.has(key) ? 'stars.again' : 'stars.miss'));
    }
  });
  root.querySelector<HTMLButtonElement>('#st-hint')!.addEventListener('click', (e) => {
    hint = !hint;
    (e.currentTarget as HTMLButtonElement).textContent = t(hint ? 'stars.unhint' : 'stars.hint');
    paint();
  });
  paint();
  return () => undefined;
}
