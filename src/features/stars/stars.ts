// Level: the sky over each of us on the night we met. Find Vega (织女) and Altair (牛郎).
import './stars.css';
import { t, pick, getLang } from '../../core/i18n';
import { config } from '../../core/config';
import { isCleared, levelNumber } from '../../core/quest';
import { levelCleared, toast } from '../../core/quest-ui';
import { escapeAttr } from '../../core/html';
import { computeSky, type Sky, type SkyPoint } from './sky';
import { STARS, LINES } from './catalog';

const MET_EVENING = `${config.metOn}T21:00:00`;
const PLACES = [
  { id: 'shenzhen', name: { zh: '深圳', en: 'Shenzhen' }, lat: 22.5431, lng: 114.0579, offset: '+08:00', zone: config.her.zone },
  { id: 'cstat', name: { zh: 'College Station', en: 'College Station' }, lat: 30.628, lng: -96.3344, offset: '-05:00', zone: config.him.zone },
] as const;
const TARGETS = ['Vega', 'Altair'] as const;
const LABELS: Record<string, string> = { Vega: 'stars.vega', Altair: 'stars.altair', Deneb: 'stars.deneb', Moon: 'stars.moon' };

const S = 1000, C = S / 2, RAD = 470;
const px = (p: { x: number; y: number }) => ({ x: C + p.x * RAD, y: C + p.y * RAD });
const radius = (mag: number) => Math.max(1.2, 7 - 1.6 * mag);

function skySvg(sky: Sky, found: Set<string>, hint: boolean): string {
  const byId = new Map(sky.points.map((p) => [p.id, p]));
  const lines = hint ? LINES.map(([a, b]) => {
    const pa = byId.get(a), pb = byId.get(b);
    if (!pa || !pb) return '';
    const A = px(pa), B = px(pb);
    return `<line x1="${A.x.toFixed(1)}" y1="${A.y.toFixed(1)}" x2="${B.x.toFixed(1)}" y2="${B.y.toFixed(1)}"/>`;
  }).join('') : '';
  // Faint first, bright last, so a bright star's hit area is never covered by a faint neighbour.
  const dots = [...sky.points].sort((a, b) => b.mag - a.mag).map((p: SkyPoint) => {
    const { x, y } = px(p);
    const target = (TARGETS as readonly string[]).includes(p.id);
    const cls = `${p.kind}${target ? ' target' : ''}${found.has(p.id) ? ' found' : ''}`;
    const r = p.kind === 'moon' ? 14 : p.kind === 'planet' ? Math.max(3, radius(p.mag)) : radius(p.mag);
    const label = found.has(p.id) || p.kind !== 'star' || (hint && p.id === 'Deneb') ? LABELS[p.id] ? t(LABELS[p.id] as never) : p.id : '';
    return `<g class="sk ${cls}" data-id="${escapeAttr(p.id)}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})">
      <circle class="hit" r="${p.kind === 'star' && p.mag > 2.5 ? 10 : 22}"/><circle class="dot" r="${r.toFixed(1)}"/>
      ${label ? `<text y="${(r + 16).toFixed(0)}">${escapeAttr(label)}</text>` : ''}</g>`;
  }).join('');
  const dirs = [['N', 0], ['E', 90], ['S', 180], ['W', 270]] as const;
  const compass = dirs.map(([d, az]) => {
    const a = (az * Math.PI) / 180, r = RAD + 18;
    return `<text class="dir" x="${(C - r * Math.sin(a)).toFixed(1)}" y="${(C - r * Math.cos(a) + 5).toFixed(1)}">${d}</text>`;
  }).join('');
  return `<svg viewBox="0 0 ${S} ${S}" role="img">
    <defs><radialGradient id="skybg" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#0f2a47"/><stop offset="0.8" stop-color="#0a1b33"/><stop offset="1" stop-color="#06111f"/></radialGradient>
    <clipPath id="disc"><circle cx="${C}" cy="${C}" r="${RAD}"/></clipPath></defs>
    <circle class="horizon" cx="${C}" cy="${C}" r="${RAD}" fill="url(#skybg)"/>
    <g clip-path="url(#disc)"><g class="lines">${lines}</g>${dots}</g>
    <circle class="rim" cx="${C}" cy="${C}" r="${RAD}"/>${compass}</svg>`;
}

export function renderStars(root: HTMLElement): () => void {
  const done = isCleared('stars');
  const found = new Set<string>(done ? TARGETS : []);
  let hint = false;
  let place = 0;
  const skies = PLACES.map((p) => computeSky(new Date(`${MET_EVENING}${p.offset}`), p.lat, p.lng));
  root.innerHTML = `
    <section class="stars">
      <header class="stars-head sign">
        <h1>${t('stars.title')}</h1>
        <p>${t('stars.subtitle')}</p>
      </header>
      <p class="quest-task${done ? ' done' : ''}" id="st-task"></p>
      <div class="stars-which" role="group">
        ${PLACES.map((p, i) => `<button type="button" class="${i === 0 ? 'active' : ''}" data-i="${i}">${pick(p.name)}</button>`).join('')}
      </div>
      <div class="stars-dome card" id="st-dome"></div>
      <p class="stars-at" id="st-at"></p>
      <p class="stars-foot">
        <button type="button" class="link" id="st-hint">${t('quest.task.stars.hint')}</button>
        <span class="stars-hint-text" id="st-hint-text" hidden>${t('stars.hint.text')}</span>
      </p>
    </section>`;
  const dome = root.querySelector<HTMLElement>('#st-dome')!;
  const task = root.querySelector<HTMLElement>('#st-task')!;
  const at = root.querySelector<HTMLElement>('#st-at')!;
  const paint = () => {
    dome.innerHTML = skySvg(skies[place], found, hint);
    const p = PLACES[place];
    const when = new Date(`${MET_EVENING}${p.offset}`).toLocaleString(getLang() === 'zh' ? 'zh-CN' : 'en-GB', { timeZone: p.zone, dateStyle: 'long', timeStyle: 'short' });
    at.textContent = t('stars.at', { place: pick(p.name), when });
    const cleared = isCleared('stars');
    task.classList.toggle('done', cleared);
    task.textContent = cleared ? t('quest.cleared.eyebrow', { n: levelNumber('stars') })
      : `${t('quest.task.stars', { n: levelNumber('stars') })}${found.size ? ` · ${[...found].map((id) => t(LABELS[id] as never)).join(' · ')}` : ''}`;
  };
  dome.addEventListener('click', (e) => {
    const g = (e.target as Element).closest<SVGGElement>('.sk');
    if (!g || isCleared('stars')) return;
    const id = g.dataset.id!;
    if ((TARGETS as readonly string[]).includes(id)) {
      if (!found.has(id)) { found.add(id); toast(t('quest.task.stars.found', { name: t(LABELS[id] as never) })); }
      paint();
      if (found.size === TARGETS.length) levelCleared('stars');
    } else { toast(t('quest.task.stars.miss')); }
  });
  root.querySelectorAll<HTMLButtonElement>('.stars-which button').forEach((b) => b.addEventListener('click', () => {
    place = Number(b.dataset.i);
    root.querySelectorAll('.stars-which button').forEach((x) => x.classList.toggle('active', x === b));
    paint();
  }));
  root.querySelector<HTMLButtonElement>('#st-hint')!.addEventListener('click', (e) => {
    hint = !hint;
    (e.currentTarget as HTMLButtonElement).textContent = t(hint ? 'quest.task.stars.unhint' : 'quest.task.stars.hint');
    root.querySelector<HTMLElement>('#st-hint-text')!.hidden = !hint;
    paint();
  });
  paint();
  return () => undefined;
}

export const STAR_COUNT = STARS.length;
