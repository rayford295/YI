import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './map.css';
import { t, pick, getLang } from '../../core/i18n';
import { sortedMemories, PLACES, type Memory } from '../moments/memories';
import { config } from '../../core/config';
import { letter, letterParagraphs } from './letter';
import { greatCircle, pacificLng, pointAlong, type LatLng } from '../../core/geo';
import { formatDate, hoursApart } from '../../core/dates';
import { escapeAttr } from '../../core/html';
import { prefersReducedMotion } from '../../core/motion';
import { attachMediaFallback } from './media';
import { getPlayer, isCleared, levelNumber } from '../../core/quest';
import { levelCleared, toast } from '../../core/quest-ui';
import { HEART_PLACES, choices, type Place } from './places';
import { shuffle } from '../../core/random';

// Level 2: a heart in each of six places. A street-level photo comes first; name the place and
// its heart appears on the map to pick up. Found state lasts for the visit; once the level is
// cleared every heart shows with its reason.
const foundBy = new Map<string, Set<string>>();   // per player, for the visit

const at = (lat: number, lng: number): LatLng => [lat, pacificLng(lng)];

const heartIcon = (cls = '') =>
  L.divIcon({ className: `heart-marker ${cls}`, html: '<span>❤</span>', iconSize: [36, 36], iconAnchor: [18, 18] });

function mediaHtml(m: Memory): string {
  return m.media
    .map((md) =>
      md.type === 'video'
        ? `<video src="${md.src}" controls playsinline preload="metadata" aria-label="${escapeAttr(pick(md.alt))}"></video>`
        : `<img src="${md.src}" alt="${escapeAttr(pick(md.alt))}" loading="lazy" />`,
    )
    .join('');
}

export function renderMap(root: HTMLElement): () => void {
  root.innerHTML = `
    <section class="map-page">
      <p class="quest-task${isCleared('map') ? ' done' : ''}" id="map-task"></p>
      <div class="map-quiz card" id="map-quiz" hidden></div>
      <div class="map-head sign">
        <h2>${t('map.title')}</h2>
        <button class="btn" id="story-btn" type="button">${t('map.story')} ▶</button>
      </div>
      <div id="love-map" class="love-map"></div>
      <div id="card-layer"></div>
    </section>`;

  const layer = root.querySelector<HTMLElement>('#card-layer')!;
  const map = L.map(root.querySelector<HTMLElement>('#love-map')!, { zoomControl: false, minZoom: 1, zoomSnap: 0.25, worldCopyJump: false }).setView([36, 185], 2);
  // OpenStreetMap tiles need no API key; .love-map tints them to the site palette.
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(map);
  L.control.zoom({ position: 'bottomright', zoomInTitle: t('map.zoom.in'), zoomOutTitle: t('map.zoom.out') }).addTo(map);

  const sz = at(PLACES.shenzhen.lat, PLACES.shenzhen.lng);
  const nm = config.nextMeeting;

  // The Pacific arc between us, with a heart travelling along it.
  const arc = greatCircle(sz, at(PLACES.collegeStation.lat, PLACES.collegeStation.lng), 120);
  L.polyline(arc, { color: '#d4506d', weight: 2.5, dashArray: '6 9', opacity: 0.9 }).addTo(map);
  const traveler = L.marker(arc[0], { icon: heartIcon('traveler'), interactive: false, keyboard: false }).addTo(map);

  // Flight CYF925 from the ticket drawn on our first Zoom: Shenzhen → New York.
  L.polyline(greatCircle(sz, at(nm.lat, nm.lng), 120), { color: '#c39a5c', weight: 2, dashArray: '2 7', opacity: 0.95 })
    .addTo(map)
    .bindTooltip(t('map.flight', { flight: nm.flight, date: formatDate(nm.date, getLang()) }), { sticky: true });

  const still = prefersReducedMotion();
  const t0 = performance.now();
  let raf = 0;
  const fly = (now: number) => {
    traveler.setLatLng(pointAlong(arc, (now - t0) / 7000));
    raf = requestAnimationFrame(fly);
  };
  if (still) traveler.setLatLng(pointAlong(arc, 0.5));
  else raf = requestAnimationFrame(fly);

  // Frame both of our cities, New York and the arc between them.
  const overview = L.latLngBounds([...arc, at(nm.lat, nm.lng)]).pad(0.15);
  map.fitBounds(overview);

  // One marker per place; a place can hold several memories.
  const byPlace = new Map<string, Memory[]>();
  for (const m of sortedMemories()) {
    const key = `${m.place.lat},${m.place.lng}`;
    byPlace.set(key, [...(byPlace.get(key) ?? []), m]);
  }
  for (const list of byPlace.values()) {
    const p = list[0].place;
    L.marker(at(p.lat, p.lng), { icon: heartIcon(), title: pick(p.name), alt: pick(p.name) })
      .addTo(map)
      .on('click', () => openCard(list, 0));
  }
  L.marker(at(nm.lat, nm.lng), { icon: heartIcon('future') })
    .addTo(map)
    .bindTooltip(t('map.meeting', { place: pick(nm.place) }), { direction: 'top', offset: [0, -14] });

  // The six hearts: one per place, hidden until its street view is named.
  const me = getPlayer() ?? 'jingyi';
  const found = foundBy.get(me) ?? new Set<string>();
  foundBy.set(me, found);
  if (isCleared('map')) for (const p of HEART_PLACES) found.add(p.id);
  const task = root.querySelector<HTMLElement>('#map-task')!;
  const quiz = root.querySelector<HTMLElement>('#map-quiz')!;
  const queue: Place[] = shuffle(HEART_PLACES.filter((p) => !found.has(p.id)));
  let revealed: Place | null = null;          // named right; its heart waits on the map
  let options: Place[] = [];
  let optionsFor = '';                        // which place `options` were drawn for
  const wrong = new Set<string>();
  const hearts = new Map<string, L.Marker>();
  const paintTask = () => {
    task.textContent = isCleared('map') ? t('quest.cleared.eyebrow', { n: levelNumber('map') })
      : `${t('quest.task.map', { n: levelNumber('map'), total: HEART_PLACES.length })} · ${t('quest.task.map.found', { found: found.size, total: HEART_PLACES.length })}`;
    task.classList.toggle('done', isCleared('map'));
  };
  const placeHeart = (p: Place, state: 'waiting' | 'found') => {
    hearts.get(p.id)?.remove();
    const mk = L.marker(at(p.lat, p.lng), { icon: heartIcon(`hidden ${state}`), keyboard: true, title: pick(p.name), alt: pick(p.name), zIndexOffset: state === 'waiting' ? 1000 : 500 }).addTo(map);
    mk.bindTooltip(`<b>${escapeAttr(pick(p.name))}</b><br>${escapeAttr(pick(p.why))}`, { direction: 'top', offset: [0, -16] });
    if (state === 'waiting') mk.on('click', () => {
      found.add(p.id); revealed = null;
      if (queue[0]?.id === p.id) queue.shift();
      placeHeart(p, 'found');
      hearts.get(p.id)!.openTooltip();
      paintTask();
      if (found.size === HEART_PLACES.length) { levelCleared('map'); paintTask(); }
      paintQuiz();
    });
    hearts.set(p.id, mk);
  };
  const paintQuiz = () => {
    const p = queue[0];
    quiz.hidden = !p;
    requestAnimationFrame(() => { if (map.getContainer().isConnected) map.invalidateSize(); });   // the card above changes the map's height
    if (!p) return;
    if (optionsFor !== p.id) { options = choices(p); optionsFor = p.id; wrong.clear(); }
    quiz.innerHTML = `
      <p class="mq-count">${t('map.quiz.count', { i: found.size + 1, n: HEART_PLACES.length })}</p>
      <div class="mq-photo"><img src="${import.meta.env.BASE_URL}${p.photo.src}" alt="" decoding="async"></div>
      ${revealed
        ? `<p class="mq-right">${t('map.quiz.right', { place: pick(p.name) })}</p>`
        : `<p class="mq-ask">${t('map.quiz.ask')}</p>
           <div class="mq-options">${options.map((o) => `<button type="button" class="mq-option${wrong.has(o.id) ? ' out' : ''}" data-id="${o.id}" ${wrong.has(o.id) ? 'disabled' : ''}>${escapeAttr(pick(o.name))}</button>`).join('')}</div>`}
      <p class="mq-credit">${t('map.quiz.photo')} <a href="${p.photo.page}" target="_blank" rel="noopener">${escapeAttr(p.photo.author)}</a> · <a href="${p.photo.licenceUrl}" target="_blank" rel="noopener">${p.photo.licence}</a></p>`;
  };
  quiz.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('.mq-option');
    if (!b || revealed) return;
    const p = queue[0];
    if (b.dataset.id === p.id) {
      revealed = p;
      hearts.forEach((m) => m.closeTooltip());   // a found heart's label must not cover the new one
      placeHeart(p, 'waiting');
      map.flyTo(at(p.lat, p.lng), 5, { duration: 1.4, animate: !still });
      map.getContainer().scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: 'center' });
      paintQuiz();
      toast(t('map.quiz.go'));
    } else { wrong.add(b.dataset.id!); toast(t('map.quiz.wrong')); paintQuiz(); }
  });
  for (const p of HEART_PLACES) if (found.has(p.id)) placeHeart(p, 'found');
  paintTask();
  paintQuiz();

  let storyTimer = 0;
  let lastFocus: HTMLElement | null = null;
  const closeCard = () => {
    clearTimeout(storyTimer); // closing a card mid-story stops the tour
    if (!layer.innerHTML) return;
    layer.innerHTML = '';
    lastFocus?.focus({ preventScroll: true });
    lastFocus = null;
  };

  function showCard(inner: string): HTMLElement {
    layer.innerHTML = `<div class="card-backdrop"><article class="memory-card" role="dialog" aria-modal="true">
      <button class="card-close" type="button" aria-label="${t('map.close')}">×</button>${inner}</article></div>`;
    const backdrop = layer.querySelector<HTMLElement>('.card-backdrop')!;
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeCard();
    });
    layer.querySelector('.card-close')!.addEventListener('click', closeCard);
    lastFocus ??= document.activeElement instanceof HTMLElement ? document.activeElement : null;
    layer.querySelector<HTMLElement>('.card-close')!.focus({ preventScroll: true });
    return backdrop;
  }

  function openCard(list: Memory[], i: number, onNext?: () => void, isLast = false): void {
    const m = list[i];
    const nav = onNext
      ? `<button class="btn" data-act="story-next" type="button">${t(isLast ? 'map.finale' : 'map.next')} →</button>`
      : list.length > 1
        ? `<button class="btn-ghost" data-act="prev" type="button" ${i === 0 ? 'disabled' : ''}>‹</button>
           <span>${i + 1} / ${list.length}</span>
           <button class="btn-ghost" data-act="next" type="button" ${i === list.length - 1 ? 'disabled' : ''}>›</button>`
        : '';
    const dots = m.media.length > 1 ? `<p class="media-dots" aria-hidden="true">${'•'.repeat(m.media.length)}</p>` : '';
    const el = showCard(`
      <div class="card-media">${mediaHtml(m)}</div>${dots}
      <div class="card-body">
        <p class="card-meta">${formatDate(m.date, getLang())} · ${pick(m.place.name)}</p>
        <h3>${pick(m.title)}</h3>
        <p>${pick(m.text)}</p>
      </div>
      <div class="card-nav">${nav}</div>`);
    attachMediaFallback(el, t('map.media.missing'));
    el.querySelector('[data-act="prev"]')?.addEventListener('click', () => openCard(list, i - 1));
    el.querySelector('[data-act="next"]')?.addEventListener('click', () => openCard(list, i + 1));
    el.querySelector('[data-act="story-next"]')?.addEventListener('click', () => onNext?.());
  }

  function showFinale(): void {
    map.flyToBounds(overview, { duration: 1.6, animate: !still });
    showCard(`
      <div class="card-body finale">
        <p class="finale-hearts" aria-hidden="true">❤ ❤ ❤</p>
        <h3>${t('home.letter.title')}</h3>
        ${letterParagraphs(getLang(), hoursApart(config.her.zone, config.him.zone, new Date())).map((p) => `<p>${p}</p>`).join('')}
        <p class="signature">— ${pick(letter.signature)}</p>
      </div>`);
  }

  function playStory(idx: number): void {
    const list = sortedMemories();
    if (idx >= list.length) {
      showFinale();
      return;
    }
    closeCard();
    const m = list[idx];
    map.flyTo(at(m.place.lat, m.place.lng), 6, { duration: 1.6, animate: !still });
    const open = () => openCard([m], 0, () => playStory(idx + 1), idx === list.length - 1);
    storyTimer = window.setTimeout(open, still ? 300 : 1700);
  }
  root.querySelector('#story-btn')!.addEventListener('click', () => playStory(0));

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') closeCard();
  };
  document.addEventListener('keydown', onKey);

  return () => {
    cancelAnimationFrame(raf);
    clearTimeout(storyTimer);
    document.removeEventListener('keydown', onKey);
    map.remove();
  };
}
