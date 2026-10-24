import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './map.css';
import { t, pick, getLang } from '../../core/i18n';
import { sortedMemories, PLACES, type Memory } from '../moments/memories';
import { config } from '../../core/config';
import { letter } from './letter';
import { greatCircle, pacificLng, pointAlong, type LatLng } from '../../core/geo';
import { formatDate } from '../../core/dates';
import { attachMediaFallback } from './media';

const at = (lat: number, lng: number): LatLng => [lat, pacificLng(lng)];

const heartIcon = (cls = '') =>
  L.divIcon({ className: `heart-marker ${cls}`, html: '<span>❤</span>', iconSize: [36, 36], iconAnchor: [18, 18] });

function mediaHtml(m: Memory): string {
  return m.media
    .map((md) =>
      md.type === 'video'
        ? `<video src="${md.src}" controls playsinline preload="metadata" aria-label="${pick(md.alt)}"></video>`
        : `<img src="${md.src}" alt="${pick(md.alt)}" loading="lazy" />`,
    )
    .join('');
}

export function renderMap(root: HTMLElement): () => void {
  root.innerHTML = `
    <section class="map-page">
      <div class="map-head">
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
  L.control.zoom({ position: 'bottomright' }).addTo(map);

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

  const t0 = performance.now();
  let raf = 0;
  const fly = (now: number) => {
    traveler.setLatLng(pointAlong(arc, (now - t0) / 7000));
    raf = requestAnimationFrame(fly);

  };
  raf = requestAnimationFrame(fly);

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
    L.marker(at(p.lat, p.lng), { icon: heartIcon(), title: pick(p.name) })
      .addTo(map)
      .on('click', () => openCard(list, 0));
  }
  L.marker(at(nm.lat, nm.lng), { icon: heartIcon('future') })
    .addTo(map)
    .bindTooltip(t('map.meeting', { place: pick(nm.place) }), { direction: 'top', offset: [0, -14] });

  const closeCard = () => {
    layer.innerHTML = '';
  };

  function showCard(inner: string): HTMLElement {
    layer.innerHTML = `<div class="card-backdrop"><article class="memory-card" role="dialog" aria-modal="true">
      <button class="card-close" type="button" aria-label="${t('map.close')}">×</button>${inner}</article></div>`;
    const backdrop = layer.querySelector<HTMLElement>('.card-backdrop')!;
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeCard();
    });
    layer.querySelector('.card-close')!.addEventListener('click', closeCard);
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
    map.flyToBounds(overview, { duration: 1.6 });
    showCard(`
      <div class="card-body finale">
        <p class="finale-hearts" aria-hidden="true">❤ ❤ ❤</p>
        <h3>${t('home.letter.title')}</h3>
        ${letter.paragraphs[getLang()].map((p) => `<p>${p}</p>`).join('')}
        <p class="signature">— ${pick(letter.signature)}</p>
      </div>`);
  }

  let storyTimer = 0;
  function playStory(idx: number): void {
    const list = sortedMemories();
    if (idx >= list.length) {
      showFinale();
      return;
    }
    closeCard();
    const m = list[idx];
    map.flyTo(at(m.place.lat, m.place.lng), 6, { duration: 1.6 });
    clearTimeout(storyTimer);
    storyTimer = window.setTimeout(() => openCard([m], 0, () => playStory(idx + 1), idx === list.length - 1), 1700);
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
