// Dev-only: #/enroll. Drop photos of each person, download faces.json, save it next to ring.ts.
// Only the 128-number descriptors leave this page; the photos stay in the browser.
import { describe, match, type Person } from './face';

const PEOPLE: { id: Person; label: string }[] = [
  { id: 'yifan', label: 'Yifan (一帆)' },
  { id: 'jingyi', label: 'Jingyi (静仪)' },
];

export function renderEnroll(root: HTMLElement): () => void {
  const store: Record<Person, number[][]> = { yifan: [], jingyi: [] };
  root.innerHTML = `
    <section class="ring enroll" style="max-width:720px">
      <header class="ring-head"><h1>Enrol faces</h1>
        <p class="ring-sub">Dev tool. Add 3 to 8 clear photos per person (different angles, lighting, with and without glasses).
        Then download <code>faces.json</code> and save it as <code>src/features/ring/faces.json</code>. Photos are not uploaded or stored.</p></header>
      ${PEOPLE.map((p) => `
        <div class="card" style="padding:16px;display:grid;gap:10px">
          <strong>${p.label}</strong>
          <input type="file" accept="image/*" multiple data-person="${p.id}">
          <div class="enroll-log" data-log="${p.id}" style="font-size:14px;color:var(--muted)"></div>
        </div>`).join('')}
      <div class="card" style="padding:16px;display:grid;gap:10px">
        <strong>Check a photo</strong>
        <input type="file" accept="image/*" id="enroll-check">
        <div id="enroll-check-log" style="font-size:14px;color:var(--muted)"></div>
      </div>
      <button type="button" id="enroll-download" class="btn" disabled>Download faces.json</button>
    </section>`;

  const loadImage = (file: File) => new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(img.src); resolve(img); };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
  const download = root.querySelector<HTMLButtonElement>('#enroll-download')!;

  root.querySelectorAll<HTMLInputElement>('input[data-person]').forEach((input) => input.addEventListener('change', async () => {
    const person = input.dataset.person as Person;
    const log = root.querySelector<HTMLElement>(`[data-log="${person}"]`)!;
    for (const file of Array.from(input.files ?? [])) {
      log.textContent = `Reading ${file.name}…`;
      const d = await describe(await loadImage(file));
      if (d) store[person].push(d);
      log.insertAdjacentHTML('beforeend', `<div>${file.name}: ${d ? 'ok' : 'no face found'}</div>`);
    }
    log.insertAdjacentHTML('beforeend', `<div><b>${store[person].length} descriptor(s) for ${person}</b></div>`);
    download.disabled = !(store.yifan.length && store.jingyi.length);
    input.value = '';
  }));

  root.querySelector<HTMLInputElement>('#enroll-check')!.addEventListener('change', async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    const out = root.querySelector<HTMLElement>('#enroll-check-log')!;
    if (!file) return;
    const d = await describe(await loadImage(file));
    if (!d) { out.textContent = 'no face found'; return; }
    let best: { person: Person | null; distance: number } = { person: null, distance: Infinity };
    for (const person of Object.keys(store) as Person[]) for (const ref of store[person]) {
      const dist = Math.hypot(...d.map((v, i) => v - ref[i]));
      if (dist < best.distance) best = { person, distance: dist };
    }
    const m = match(d);
    out.textContent = `against this session: ${best.person ?? 'nobody'} (distance ${best.distance.toFixed(3)}); against saved faces.json: ${m.person ?? 'nobody'} (${m.distance.toFixed(3)})`;
  });

  download.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(store)], { type: 'application/json' });
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'faces.json' });
    a.click();
    URL.revokeObjectURL(a.href);
  });
  return () => {};
}
