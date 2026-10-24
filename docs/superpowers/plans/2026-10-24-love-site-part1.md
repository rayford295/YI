# Love Site Part 1 (Home + Love Map + i18n) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the non-game half of v1 — a bilingual home page (birthday greeting, day counter, twin clocks, AAG countdown, birthday letter) and the love map (heart markers, Pacific arc, memory cards, story mode).

**Architecture:** Vite + TypeScript static SPA with hash routing. Pure logic (dates, great-circle arc, i18n lookup) lives in small tested modules; pages are render functions that return a cleanup callback. Content (memories, letter, key dates) lives in typed data files so adding a memory means editing one file and dropping media into `public/media/`.

**Tech Stack:** Vite, TypeScript (strict), Vitest, Leaflet 1.9 with CARTO Voyager tiles, Google Fonts (Noto Serif SC, Cormorant Garamond, Ma Shan Zheng).

**Spec:** `docs/superpowers/specs/2026-10-24-yi-at-first-sight-design.md` (sections 3–8; games and deployment are separate plans).

## Global Constraints

- Every user-facing string exists in both `zh` and `en`; Chinese is the default language.
- The language toggle re-renders the current page without a reload.
- "Day N since we met" counts in Jingyi's zone `Asia/Shanghai`; the day they met (2026-09-20) is day 1.
- Next meeting: AAG 2027, New York, 2027-02-08 00:00 America/New_York (source: MDPI AAG 2027 notice, 8–12 Feb 2027).
- Media is served from `public/media/`; data files reference it as `media/<file>` (relative, `base: './'`).
- `localStorage` access is always wrapped in try/catch.
- Repo docs and code comments in English.

## Review Focus

1. Viewer in Texas late on 10-30 local time — the counter must already show Shenzhen's 10-31 value (day 42). Pinned in Task 2.
2. The Shenzhen → College Station arc crosses the antimeridian — it must be one continuous line over the Pacific, not a line across the whole world. Pinned in Task 3.
3. Storage blocked (private mode / throwing `localStorage`) — the site must still load, in Chinese. Pinned in Task 1.
4. A memory pointing at a missing media file — data test catches it at build time; UI replaces a broken image with a bilingual notice. Pinned in Task 3 (test) and Task 5 (UI).
5. Countdown after the meeting has started — must show "together", never negative numbers. Pinned in Task 2.

---

## File Structure

```
package.json, tsconfig.json, vite.config.ts, index.html
src/main.ts            app shell, hash router, language toggle wiring
src/styles.css         all styles (tokens on :root)
src/i18n.ts            dictionary, t(), pick(), getLang/setLang/onLangChange
src/lib/dates.ts       ymdInZone, dayNumberSince, countdownTo, hoursApart, clockIn, formatDate
src/lib/arc.ts         pacificLng, greatCircle
src/data/config.ts     people, zones, key dates, next meeting
src/data/letter.ts     birthday letter (Yifan rewrites in his own voice)
src/data/memories.ts   PLACES, Memory type, memories[], sortedMemories()
src/pages/home.ts      renderHome(root) => cleanup
src/pages/map.ts       renderMap(root) => cleanup
public/media/*.jpg     photos
tests: src/**/*.test.ts (Vitest, node environment)
```

---

### Task 1: Scaffold + i18n

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `src/i18n.ts`
- Test: `src/i18n.test.ts`

**Interfaces:**
- Produces: `type Lang = 'zh' | 'en'`, `type L10n = { zh: string; en: string }`, `type Key`, `dict`, `t(key: Key, vars?: Record<string, string | number>): string`, `pick(v: L10n): string`, `getLang(): Lang`, `setLang(l: Lang): void`, `onLangChange(fn: (l: Lang) => void): void`.

- [ ] **Step 1: Scaffold**

```bash
cd ~/Documents/Yi-at-First-Sight
npm init -y >/dev/null
npm i leaflet
npm i -D vite typescript vitest @types/leaflet
```

`package.json` — set these fields (keep the installed versions):

```json
{
  "name": "yi-at-first-sight",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "test": "vitest run"
  }
}
```

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "types": ["vite/client", "node"],
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "resolveJsonModule": true
  },
  "include": ["src", "vite.config.ts"]
}
```

(`npm i -D @types/node` as well, for `fs`/`path` in tests.)

`vite.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: './',
  test: { environment: 'node' },
});
```

`index.html`:

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="robots" content="noindex, nofollow" />
    <title>仪见钟情 · Yi at First Sight</title>
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>❤</text></svg>" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Ma+Shan+Zheng&family=Noto+Serif+SC:wght@400;600;700&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 2: Write the failing test** — `src/i18n.test.ts`

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

beforeEach(() => vi.resetModules());
afterEach(() => vi.unstubAllGlobals());

describe('i18n', () => {
  it('has the same non-empty keys in zh and en', async () => {
    const { dict } = await import('./i18n');
    expect(Object.keys(dict.en).sort()).toEqual(Object.keys(dict.zh).sort());
    for (const lang of ['zh', 'en'] as const)
      for (const [k, v] of Object.entries(dict[lang])) expect(v, `${lang}.${k}`).not.toBe('');
  });

  it('defaults to Chinese when storage throws', async () => {
    vi.stubGlobal('localStorage', { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } });
    const { getLang, setLang } = await import('./i18n');
    expect(getLang()).toBe('zh');
    expect(() => setLang('en')).not.toThrow();
    expect(getLang()).toBe('en');
  });

  it('restores a saved language and notifies listeners', async () => {
    const store: Record<string, string> = { 'yi.lang': 'en' };
    vi.stubGlobal('localStorage', { getItem: (k: string) => store[k] ?? null, setItem: (k: string, v: string) => { store[k] = v; } });
    const { getLang, setLang, onLangChange, t } = await import('./i18n');
    expect(getLang()).toBe('en');
    const seen: string[] = [];
    onLangChange((l) => seen.push(l));
    setLang('zh');
    expect(seen).toEqual(['zh']);
    expect(store['yi.lang']).toBe('zh');
    expect(t('home.diff', { h: 13 })).toContain('13');
  });

  it('pick returns the current language', async () => {
    const { pick, setLang } = await import('./i18n');
    setLang('en');
    expect(pick({ zh: '你好', en: 'Hello' })).toBe('Hello');
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run src/i18n.test.ts` — Expected: FAIL (cannot find module `./i18n`).

- [ ] **Step 4: Implement** — `src/i18n.ts`

```ts
export type Lang = 'zh' | 'en';
export type L10n = { zh: string; en: string };

const zh = {
  'site.title': '仪见钟情',
  'nav.home': '首页',
  'nav.map': '爱情地图',
  'nav.games': '小游戏',
  'nav.soon': '即将上线',
  'lang.toggle': 'EN',
  'home.eyebrow': '10 月 31 日 · 静仪的生日',
  'home.greeting': '生日快乐，静仪',
  'home.subline': '这是我送你的第一个网站，也是我们故事的第一页。',
  'home.counter.prefix': '我们认识的第',
  'home.counter.suffix': '天',
  'home.clock.her': '深圳 · 静仪',
  'home.clock.him': '德州 · 一帆',
  'home.clock.day': '白天',
  'home.clock.night': '夜晚',
  'home.diff': '我们相差 {h} 小时，看的是同一个月亮',
  'home.countdown.title': '距离我们在{place}见面还有',
  'home.countdown.together': '我们终于见面啦',
  'home.countdown.days': '天',
  'home.countdown.hours': '小时',
  'home.countdown.minutes': '分钟',
  'home.letter.title': '写给你的生日信',
  'home.cta.map': '打开我们的爱情地图',
  'map.title': '我们的爱情地图',
  'map.story': '播放我们的故事',
  'map.next': '下一站',
  'map.finale': '最后一站',
  'map.close': '关闭',
  'map.meeting': '下一次见面：{place}',
  'map.media.missing': '照片还在路上',
} as const;

export type Key = keyof typeof zh;

const en: Record<Key, string> = {
  'site.title': 'Yi at First Sight',
  'nav.home': 'Home',
  'nav.map': 'Love Map',
  'nav.games': 'Games',
  'nav.soon': 'Coming soon',
  'lang.toggle': '中文',
  'home.eyebrow': 'October 31 · Jingyi’s birthday',
  'home.greeting': 'Happy Birthday, Jingyi',
  'home.subline': 'This is the first website I made for you — the first page of our story.',
  'home.counter.prefix': 'Day',
  'home.counter.suffix': 'since we met',
  'home.clock.her': 'Shenzhen · Jingyi',
  'home.clock.him': 'Texas · Yifan',
  'home.clock.day': 'Daytime',
  'home.clock.night': 'Night',
  'home.diff': '{h} hours apart, under the same moon',
  'home.countdown.title': 'Until we meet at {place}',
  'home.countdown.together': 'Together at last',
  'home.countdown.days': 'days',
  'home.countdown.hours': 'hours',
  'home.countdown.minutes': 'minutes',
  'home.letter.title': 'A birthday letter for you',
  'home.cta.map': 'Open our love map',
  'map.title': 'Our Love Map',
  'map.story': 'Play our story',
  'map.next': 'Next stop',
  'map.finale': 'Last stop',
  'map.close': 'Close',
  'map.meeting': 'Next time we meet: {place}',
  'map.media.missing': 'This photo is still on its way',
};

export const dict: Record<Lang, Record<Key, string>> = { zh, en };

const STORAGE_KEY = 'yi.lang';
const listeners: Array<(l: Lang) => void> = [];

function readSaved(): Lang {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'zh';
  } catch {
    return 'zh';
  }
}

let current: Lang = readSaved();

export function getLang(): Lang {
  return current;
}

export function setLang(l: Lang): void {
  current = l;
  try {
    localStorage.setItem(STORAGE_KEY, l);
  } catch {
    // storage blocked: keep the choice for this visit only
  }
  for (const fn of listeners) fn(l);
}

export function onLangChange(fn: (l: Lang) => void): void {
  listeners.push(fn);
}

export function t(key: Key, vars: Record<string, string | number> = {}): string {
  return dict[current][key].replace(/\{(\w+)\}/g, (m, name: string) => (name in vars ? String(vars[name]) : m));
}

export function pick(v: L10n): string {
  return v[current];
}
```

- [ ] **Step 5: Run test to verify it passes** — `npx vitest run src/i18n.test.ts` — Expected: 4 passed.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "Scaffold Vite + TS app and bilingual i18n module"
```

---

### Task 2: Dates library + config

**Files:**
- Create: `src/lib/dates.ts`, `src/data/config.ts`
- Test: `src/lib/dates.test.ts`

**Interfaces:**
- Consumes: `Lang`, `L10n` from Task 1.
- Produces:
  - `ymdInZone(date: Date, timeZone: string): string` → `'YYYY-MM-DD'`
  - `dayNumberSince(startYmd: string, now: Date, timeZone: string): number` (start day = 1)
  - `countdownTo(target: Date, now: Date): { days: number; hours: number; minutes: number; done: boolean }`
  - `zoneOffsetMinutes(timeZone: string, date: Date): number`
  - `hoursApart(zoneA: string, zoneB: string, date: Date): number`
  - `clockIn(timeZone: string, date: Date, lang: Lang): { time: string; day: string; hour: number; isDay: boolean }`
  - `formatDate(ymd: string, lang: Lang): string`
  - `config` (see code).

- [ ] **Step 1: Write the failing test** — `src/lib/dates.test.ts`

```ts
import { describe, it, expect } from 'vitest';
import { ymdInZone, dayNumberSince, countdownTo, hoursApart, clockIn, formatDate } from './dates';

const SZ = 'Asia/Shanghai';
const TX = 'America/Chicago';

describe('dayNumberSince', () => {
  it('counts the day we met as day 1', () => {
    expect(dayNumberSince('2026-09-20', new Date('2026-09-20T02:00:00Z'), SZ)).toBe(1);
  });
  it('is day 42 on her birthday', () => {
    expect(dayNumberSince('2026-09-20', new Date('2026-10-31T04:00:00Z'), SZ)).toBe(42);
  });
  it('uses Shenzhen date even when Texas is still on 10-30', () => {
    const now = new Date('2026-10-31T04:00:00Z'); // 23:00 on 10-30 in Texas
    expect(ymdInZone(now, TX)).toBe('2026-10-30');
    expect(dayNumberSince('2026-09-20', now, SZ)).toBe(42);
  });
});

describe('countdownTo', () => {
  const target = new Date('2027-02-08T05:00:00Z');
  it('splits remaining time', () => {
    expect(countdownTo(target, new Date('2027-02-07T03:58:00Z'))).toEqual({ days: 1, hours: 1, minutes: 2, done: false });
  });
  it('never goes negative after the target', () => {
    expect(countdownTo(target, new Date('2027-02-09T00:00:00Z'))).toEqual({ days: 0, hours: 0, minutes: 0, done: true });
  });
});

describe('hoursApart', () => {
  it('is 13 during US daylight time and 14 after', () => {
    expect(hoursApart(SZ, TX, new Date('2026-10-31T12:00:00Z'))).toBe(13);
    expect(hoursApart(SZ, TX, new Date('2026-12-01T12:00:00Z'))).toBe(14);
  });
});

describe('clockIn', () => {
  it('reports local hour and day/night', () => {
    const c = clockIn(SZ, new Date('2026-10-31T04:00:00Z'), 'en');
    expect(c.hour).toBe(12);
    expect(c.isDay).toBe(true);
    expect(c.time).toBe('12:00');
    expect(clockIn(TX, new Date('2026-10-31T04:00:00Z'), 'en').isDay).toBe(false);
  });
});

describe('formatDate', () => {
  it('formats in both languages without shifting the day', () => {
    expect(formatDate('2026-10-18', 'zh')).toBe('2026年10月18日');
    expect(formatDate('2026-10-18', 'en')).toBe('Oct 18, 2026');
  });
});
```

- [ ] **Step 2: Run test to verify it fails** — `npx vitest run src/lib/dates.test.ts` — Expected: FAIL (module not found).

- [ ] **Step 3: Implement** — `src/lib/dates.ts`

```ts
import type { Lang } from '../i18n';

const DAY_MS = 86_400_000;

export function ymdInZone(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}

function ymdToUtc(ymd: string): number {
  const [y, m, d] = ymd.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

export function dayNumberSince(startYmd: string, now: Date, timeZone: string): number {
  return Math.round((ymdToUtc(ymdInZone(now, timeZone)) - ymdToUtc(startYmd)) / DAY_MS) + 1;
}

export function countdownTo(target: Date, now: Date) {
  const ms = target.getTime() - now.getTime();
  if (ms <= 0) return { days: 0, hours: 0, minutes: 0, done: true };
  return {
    days: Math.floor(ms / DAY_MS),
    hours: Math.floor((ms % DAY_MS) / 3_600_000),
    minutes: Math.floor((ms % 3_600_000) / 60_000),
    done: false,
  };
}

export function zoneOffsetMinutes(timeZone: string, date: Date): number {
  const name = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'longOffset' })
    .formatToParts(date)
    .find((p) => p.type === 'timeZoneName')?.value ?? 'GMT';
  const m = /GMT([+-])(\d{2}):(\d{2})/.exec(name);
  if (!m) return 0;
  return (m[1] === '-' ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3]));
}

export function hoursApart(zoneA: string, zoneB: string, date: Date): number {
  return Math.abs(zoneOffsetMinutes(zoneA, date) - zoneOffsetMinutes(zoneB, date)) / 60;
}

export function clockIn(timeZone: string, date: Date, lang: Lang) {
  const locale = lang === 'zh' ? 'zh-CN' : 'en-US';
  const time = new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(date);
  const day = new Intl.DateTimeFormat(locale, { timeZone, month: 'short', day: 'numeric', weekday: 'short' }).format(date);
  const hour = Number(time.slice(0, 2));
  return { time, day, hour, isDay: hour >= 6 && hour < 18 };
}

export function formatDate(ymd: string, lang: Lang): string {
  const d = new Date(ymdToUtc(ymd));
  if (lang === 'zh') {
    return `${d.getUTCFullYear()}年${d.getUTCMonth() + 1}月${d.getUTCDate()}日`;
  }
  return new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' }).format(d);
}
```

`src/data/config.ts`:

```ts
import type { L10n } from '../i18n';

export interface Person { name: L10n; zone: string; birthday: string }

export const config = {
  metOn: '2026-09-20',
  her: { name: { zh: '静仪', en: 'Jingyi' }, zone: 'Asia/Shanghai', birthday: '10-31' } satisfies Person,
  him: { name: { zh: '一帆', en: 'Yifan' }, zone: 'America/Chicago', birthday: '09-25' } satisfies Person,
  nextMeeting: {
    // AAG 2027 Annual Meeting, New York, 8–12 Feb 2027
    at: '2027-02-08T00:00:00-05:00',
    place: { zh: '纽约 AAG', en: 'AAG in New York' } satisfies L10n,
    lat: 40.7128,
    lng: -74.006,
  },
};
```

- [ ] **Step 4: Run test to verify it passes** — `npx vitest run src/lib/dates.test.ts` — Expected: all passed.

- [ ] **Step 5: Commit** — `git add -A && git commit -m "Add timezone-aware dates library and key-date config"`

---

### Task 3: Memories data, photos, great-circle arc

**Files:**
- Create: `src/lib/arc.ts`, `src/data/memories.ts`, `src/data/letter.ts`, `public/media/first-flowers.jpg`, `public/media/hearts.jpg`, `public/media/zoom-proposal.jpg`
- Test: `src/lib/arc.test.ts`, `src/data/memories.test.ts`

**Interfaces:**
- Consumes: `L10n` (Task 1), `config.metOn` (Task 2).
- Produces: `type LatLng = [number, number]`, `pacificLng(lng: number): number`, `greatCircle(a: LatLng, b: LatLng, n?: number): LatLng[]`; `PLACES`, `interface Place`, `interface Media`, `interface Memory`, `memories: Memory[]`, `sortedMemories(): Memory[]`; `letter: { paragraphs: { zh: string[]; en: string[] }; signature: L10n }`.

- [ ] **Step 1: Prepare photos** (originals: the three images Yifan shared, session images 87–89)

```bash
IMG=/private/tmp/claude-501/-Users-yifn/e63332c9-a659-44b9-9ec6-67fdbb1daaf7/images
mkdir -p public/media
sips -Z 1600 -s format jpeg -s formatOptions 82 "$IMG/87.png" --out public/media/first-flowers.jpg
sips -Z 1600 -s format jpeg -s formatOptions 82 "$IMG/88.png" --out public/media/hearts.jpg
sips -Z 1600 -s format jpeg -s formatOptions 82 "$IMG/89.png" --out public/media/zoom-proposal.jpg
```

- [ ] **Step 2: Write the failing tests**

`src/lib/arc.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { greatCircle, pacificLng } from './arc';

const SZ: [number, number] = [22.5431, 114.0579];
const CS: [number, number] = [30.628, pacificLng(-96.3344)];

describe('pacificLng', () => {
  it('moves the Americas east of the date line and keeps Asia', () => {
    expect(pacificLng(-96.3344)).toBeCloseTo(263.6656);
    expect(pacificLng(114)).toBe(114);
  });
});

describe('greatCircle', () => {
  const pts = greatCircle(SZ, CS, 96);
  it('starts and ends at the endpoints', () => {
    expect(pts[0][0]).toBeCloseTo(SZ[0]);
    expect(pts[0][1]).toBeCloseTo(SZ[1]);
    expect(pts.at(-1)![0]).toBeCloseTo(CS[0]);
    expect(pts.at(-1)![1]).toBeCloseTo(CS[1]);
  });
  it('is continuous across the antimeridian', () => {
    for (let i = 1; i < pts.length; i++) expect(Math.abs(pts[i][1] - pts[i - 1][1])).toBeLessThan(10);
  });
  it('bows north over the Pacific', () => {
    expect(Math.max(...pts.map((p) => p[0]))).toBeGreaterThan(45);
  });
});
```

`src/data/memories.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { memories, sortedMemories } from './memories';
import { config } from './config';

describe('memories data', () => {
  it('has unique ids', () => {
    expect(new Set(memories.map((m) => m.id)).size).toBe(memories.length);
  });
  it.each(memories.map((m) => [m.id, m] as const))('%s is valid', (_id, m) => {
    expect(m.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(m.date >= config.metOn).toBe(true);
    expect(Math.abs(m.place.lat)).toBeLessThanOrEqual(90);
    expect(Math.abs(m.place.lng)).toBeLessThanOrEqual(180);
    for (const v of [m.title, m.text, m.place.name]) {
      expect(v.zh.trim()).not.toBe('');
      expect(v.en.trim()).not.toBe('');
    }
    for (const md of m.media) expect(existsSync(join(process.cwd(), 'public', md.src)), md.src).toBe(true);
  });
  it('sorts by date ascending without mutating the source', () => {
    const before = memories.map((m) => m.id);
    const dates = sortedMemories().map((m) => m.date);
    expect(dates).toEqual([...dates].sort());
    expect(memories.map((m) => m.id)).toEqual(before);
  });
});
```

- [ ] **Step 3: Run tests to verify they fail** — `npx vitest run src/lib/arc.test.ts src/data/memories.test.ts` — Expected: FAIL (modules missing).

- [ ] **Step 4: Implement**

`src/lib/arc.ts`:

```ts
export type LatLng = [number, number];

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

/** Shift the Americas east of the date line so the map centres on the Pacific between us. */
export function pacificLng(lng: number): number {
  return lng < -30 ? lng + 360 : lng;
}

function toVec([lat, lng]: LatLng): [number, number, number] {
  const la = rad(lat), lo = rad(lng);
  return [Math.cos(la) * Math.cos(lo), Math.cos(la) * Math.sin(lo), Math.sin(la)];
}

/** Points along the great circle from a to b, with longitudes unwrapped so the line never jumps. */
export function greatCircle(a: LatLng, b: LatLng, n = 64): LatLng[] {
  const v1 = toVec(a), v2 = toVec(b);
  const dot = Math.min(1, Math.max(-1, v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2]));
  const omega = Math.acos(dot);
  if (omega < 1e-9) return [a, b];
  const pts: LatLng[] = [];
  let prev = a[1];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const s1 = Math.sin((1 - t) * omega) / Math.sin(omega);
    const s2 = Math.sin(t * omega) / Math.sin(omega);
    const x = s1 * v1[0] + s2 * v2[0], y = s1 * v1[1] + s2 * v2[1], z = s1 * v1[2] + s2 * v2[2];
    let lng = deg(Math.atan2(y, x));
    while (lng - prev > 180) lng -= 360;
    while (lng - prev < -180) lng += 360;
    pts.push([deg(Math.atan2(z, Math.hypot(x, y))), lng]);
    prev = lng;
  }
  return pts;
}
```

`src/data/memories.ts`:

```ts
import type { L10n } from '../i18n';

export interface Place { name: L10n; lat: number; lng: number }
export interface Media { type: 'image' | 'video'; src: string; alt: L10n }
export interface Memory { id: string; date: string; place: Place; title: L10n; text: L10n; media: Media[] }

export const PLACES = {
  shenzhen: { name: { zh: '深圳', en: 'Shenzhen' }, lat: 22.5431, lng: 114.0579 },
  collegeStation: { name: { zh: '德州 College Station', en: 'College Station, Texas' }, lat: 30.628, lng: -96.3344 },
} satisfies Record<string, Place>;

// To add a memory: put the photo/video in public/media/ and append an entry here.
export const memories: Memory[] = [
  {
    id: 'first-flowers',
    date: '2026-10-01',
    place: PLACES.shenzhen,
    title: { zh: '第一次送你花', en: 'The first flowers I sent you' },
    text: {
      zh: '隔着太平洋，花替我先到了你身边。你闭着眼睛笑的样子，比那一大捧花还好看。',
      en: 'From across the Pacific, the flowers reached you before I could. Your smile with your eyes closed was lovelier than the whole bouquet.',
    },
    media: [{ type: 'image', src: 'media/first-flowers.jpg', alt: { zh: '静仪和一大捧彩色的花', en: 'Jingyi beside a big bouquet of colourful flowers' } }],
  },
  {
    id: 'hearts',
    date: '2026-10-10',
    place: PLACES.shenzhen,
    title: { zh: '我们互相比心', en: 'Hearts from both sides' },
    text: {
      zh: '你在深圳比心，我在拍立得里比心。两张照片，拼成一颗完整的心。',
      en: 'You made a heart in Shenzhen, I made one in a Polaroid. Two photos, one whole heart.',
    },
    media: [{ type: 'image', src: 'media/hearts.jpg', alt: { zh: '两张比心的照片', en: 'Two photos of us making hearts' } }],
  },
  {
    id: 'zoom-proposal',
    date: '2026-10-18',
    place: PLACES.collegeStation,
    title: { zh: 'Zoom 上一起练 proposal', en: 'Rehearsing my proposal defense on Zoom' },
    text: {
      zh: '你陪我把答辩一遍一遍讲完，听我讲灾害、遥感和我的研究。屏幕那头有你，我就不紧张了。',
      en: 'You stayed with me through every run of my defense talk — disasters, remote sensing, all of it. With you on the other side of the screen, I wasn’t nervous anymore.',
    },
    media: [{ type: 'image', src: 'media/zoom-proposal.jpg', alt: { zh: 'Zoom 通话里的我们', en: 'The two of us on a Zoom call' } }],
  },
];

export function sortedMemories(): Memory[] {
  return [...memories].sort((a, b) => a.date.localeCompare(b.date));
}
```

`src/data/letter.ts` (draft — Yifan rewrites it in his own words):

```ts
import type { L10n } from '../i18n';

export const letter: { paragraphs: { zh: string[]; en: string[] }; signature: L10n } = {
  paragraphs: {
    zh: [
      '静仪，生日快乐。',
      '我们认识才四十二天，我已经习惯了每天醒来先算一算深圳现在几点。',
      '你的早晨是我的夜晚。隔着十三个小时和一整片太平洋，我们看的还是同一个月亮。',
      '谢谢你陪我在 Zoom 上一遍一遍练答辩。下一次，我想在纽约，当面把这些话说给你听。',
    ],
    en: [
      'Happy birthday, Jingyi.',
      'We have known each other for only forty-two days, and I already wake up working out what time it is in Shenzhen.',
      'Your morning is my night. Thirteen hours and a whole Pacific apart, we still look up at the same moon.',
      'Thank you for sitting through my defense rehearsals on Zoom, again and again. Next time, in New York, I want to say all of this to you in person.',
    ],
  },
  signature: { zh: '一帆', en: 'Yifan' },
};
```

- [ ] **Step 5: Run tests to verify they pass** — `npx vitest run` — Expected: all passed.

- [ ] **Step 6: Commit** — `git add -A && git commit -m "Add first memories, photos, birthday letter draft and great-circle arc"`

---

### Task 4: App shell, router, styles, home page

**Files:**
- Create: `src/main.ts`, `src/styles.css`, `src/pages/home.ts`

**Interfaces:**
- Consumes: everything from Tasks 1–3.
- Produces: `type Page = (root: HTMLElement) => () => void`; `renderHome: Page`. The router calls the previous page's cleanup before rendering the next and re-renders on language change.

- [ ] **Step 1: Implement `src/pages/home.ts`**

```ts
import { t, pick, getLang } from '../i18n';
import { config } from '../data/config';
import { letter } from '../data/letter';
import { dayNumberSince, clockIn, hoursApart, countdownTo } from '../lib/dates';

function clockCard(id: string, label: string): string {
  return `<div class="clock card" id="clock-${id}">
    <span class="clock-icon" aria-hidden="true"></span>
    <p class="clock-label">${label}</p>
    <p class="clock-time"></p>
    <p class="clock-day"></p>
  </div>`;
}

export function renderHome(root: HTMLElement): () => void {
  const lang = getLang();
  root.innerHTML = `
    <section class="hero">
      <p class="eyebrow">${t('home.eyebrow')}</p>
      <h1 class="hero-title">${t('home.greeting')}</h1>
      <p class="hero-sub">${t('home.subline')}</p>
    </section>
    <section class="counter card">
      <span>${t('home.counter.prefix')}</span>
      <strong id="day-n"></strong>
      <span>${t('home.counter.suffix')}</span>
    </section>
    <section class="clocks">
      ${clockCard('her', t('home.clock.her'))}
      <div class="clocks-link" aria-hidden="true">❤</div>
      ${clockCard('him', t('home.clock.him'))}
    </section>
    <p class="diff" id="diff"></p>
    <section class="countdown card">
      <p class="countdown-title">${t('home.countdown.title', { place: pick(config.nextMeeting.place) })}</p>
      <div class="countdown-grid" id="countdown"></div>
    </section>
    <section class="letter card">
      <h2>${t('home.letter.title')}</h2>
      ${letter.paragraphs[lang].map((p) => `<p>${p}</p>`).join('')}
      <p class="signature">— ${pick(letter.signature)}</p>
    </section>
    <a class="cta" href="#/map">${t('home.cta.map')} →</a>`;

  const q = <T extends HTMLElement>(sel: string) => root.querySelector<T>(sel)!;

  const paintClock = (id: string, zone: string, now: Date) => {
    const c = clockIn(zone, now, getLang());
    const el = q(`#clock-${id}`);
    el.classList.toggle('is-night', !c.isDay);
    el.querySelector('.clock-icon')!.textContent = c.isDay ? '☀' : '☾';
    el.querySelector('.clock-time')!.textContent = c.time;
    el.querySelector('.clock-day')!.textContent = `${c.day} · ${t(c.isDay ? 'home.clock.day' : 'home.clock.night')}`;
  };

  const tick = () => {
    const now = new Date();
    q('#day-n').textContent = String(dayNumberSince(config.metOn, now, config.her.zone));
    paintClock('her', config.her.zone, now);
    paintClock('him', config.him.zone, now);
    q('#diff').textContent = t('home.diff', { h: hoursApart(config.her.zone, config.him.zone, now) });
    const cd = countdownTo(new Date(config.nextMeeting.at), now);
    q('#countdown').innerHTML = cd.done
      ? `<p class="together">${t('home.countdown.together')}</p>`
      : (['days', 'hours', 'minutes'] as const)
          .map((u) => `<div><strong>${cd[u]}</strong><span>${t(`home.countdown.${u}`)}</span></div>`)
          .join('');
  };

  tick();
  const timer = setInterval(tick, 1000);
  return () => clearInterval(timer);
}
```

- [ ] **Step 2: Implement `src/main.ts`**

```ts
import './styles.css';
import { t, getLang, setLang, onLangChange } from './i18n';
import { renderHome } from './pages/home';
import { renderMap } from './pages/map';

export type Page = (root: HTMLElement) => () => void;

const routes: Record<string, Page> = { '/': renderHome, '/map': renderMap };
const app = document.querySelector<HTMLElement>('#app')!;
let cleanup: (() => void) | undefined;

const currentPath = () => (location.hash.slice(1) in routes ? location.hash.slice(1) : '/');

function render(): void {
  cleanup?.();
  const path = currentPath();
  const lang = getLang();
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = `${t('site.title')} · ${lang === 'zh' ? 'Yi at First Sight' : '仪见钟情'}`;
  const link = (href: string, key: 'nav.home' | 'nav.map') =>
    `<a href="#${href}" class="${path === href ? 'active' : ''}">${t(key)}</a>`;
  app.innerHTML = `
    <header class="topbar">
      <a class="brand" href="#/"><span class="brand-zh">仪见钟情</span><span class="brand-en">Yi at First Sight</span></a>
      <nav>${link('/', 'nav.home')}${link('/map', 'nav.map')}<span class="nav-soon" title="${t('nav.soon')}">${t('nav.games')}</span></nav>
      <button class="lang-btn" id="lang-btn" type="button">${t('lang.toggle')}</button>
    </header>
    <main id="view" class="view view-${path === '/' ? 'home' : 'map'}"></main>
    <div class="floating-hearts" aria-hidden="true">${'<i>❤</i>'.repeat(12)}</div>`;
  app.querySelector('#lang-btn')!.addEventListener('click', () => setLang(getLang() === 'zh' ? 'en' : 'zh'));
  cleanup = routes[path](app.querySelector<HTMLElement>('#view')!);
}

onLangChange(render);
window.addEventListener('hashchange', render);
render();
```

(Task 5 creates `src/pages/map.ts`; until then, create it as a stub so the build passes:)

```ts
export function renderMap(root: HTMLElement): () => void {
  root.innerHTML = '';
  return () => {};
}
```

- [ ] **Step 3: Implement `src/styles.css`** — tokens on `:root`; phone-first; 16px side gutter; no horizontal scroll.

```css
:root {
  --paper: #fbf4ee;
  --paper-2: #f6e6e0;
  --card: rgba(255, 251, 248, 0.86);
  --ink: #3b2430;
  --muted: #8b6a76;
  --rose: #d4506d;
  --rose-deep: #a8324f;
  --blush: #f3c4cd;
  --gold: #c39a5c;
  --night: #2c2340;
  --line: rgba(168, 50, 79, 0.16);
  --shadow: 0 18px 40px -22px rgba(120, 30, 60, 0.45);
  --serif-zh: 'Noto Serif SC', 'Songti SC', serif;
  --serif-en: 'Cormorant Garamond', Georgia, serif;
  --hand: 'Ma Shan Zheng', 'Kaiti SC', cursive;
  --radius: 22px;
}

* { box-sizing: border-box; }
html, body { margin: 0; }
body {
  background:
    radial-gradient(1200px 600px at 10% -10%, #fde2e4 0%, transparent 60%),
    radial-gradient(900px 500px at 110% 10%, #f9e1cf 0%, transparent 55%),
    var(--paper);
  color: var(--ink);
  font-family: var(--serif-en), var(--serif-zh);
  font-size: 17px;
  line-height: 1.7;
  min-height: 100dvh;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}
html[lang='zh-CN'] body { font-family: var(--serif-zh); font-size: 16px; }
a { color: inherit; }

.topbar {
  position: sticky; top: 0; z-index: 1000;
  display: flex; align-items: center; gap: 12px;
  padding: 12px 16px;
  background: rgba(251, 244, 238, 0.82);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--line);
}
.brand { display: flex; flex-direction: column; text-decoration: none; line-height: 1.1; margin-right: auto; }
.brand-zh { font-family: var(--hand); font-size: 24px; color: var(--rose-deep); }
.brand-en { font-family: var(--serif-en); font-style: italic; font-size: 13px; color: var(--muted); }
.topbar nav { display: flex; gap: 14px; font-size: 15px; }
.topbar nav a { text-decoration: none; color: var(--muted); padding: 4px 0; border-bottom: 2px solid transparent; }
.topbar nav a.active { color: var(--rose-deep); border-color: var(--rose); }
.nav-soon { color: var(--muted); opacity: 0.45; cursor: default; }
.lang-btn {
  font: inherit; font-size: 14px; cursor: pointer;
  border: 1px solid var(--rose); color: var(--rose-deep); background: transparent;
  border-radius: 999px; padding: 4px 12px;
}
.lang-btn:hover { background: var(--rose); color: #fff; }

.view-home { max-width: 760px; margin: 0 auto; padding: 32px 16px 80px; display: grid; gap: 22px; position: relative; z-index: 1; }

.card {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 22px;
}

.hero { text-align: center; padding: 28px 0 8px; animation: rise 0.9s ease both; }
.eyebrow { margin: 0; letter-spacing: 0.18em; font-size: 13px; color: var(--gold); text-transform: uppercase; }
.hero-title { font-family: var(--hand); font-weight: 400; font-size: clamp(44px, 11vw, 76px); line-height: 1.15; margin: 10px 0; color: var(--rose-deep); }
html[lang='en'] .hero-title { font-family: var(--serif-en); font-style: italic; font-weight: 500; }
.hero-sub { margin: 0 auto; max-width: 30em; color: var(--muted); }

.counter { display: flex; align-items: baseline; justify-content: center; gap: 12px; flex-wrap: wrap; animation: rise 0.9s 0.15s ease both; }
.counter strong { font-family: var(--serif-en); font-size: 64px; line-height: 1; color: var(--rose); }

.clocks { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 10px; animation: rise 0.9s 0.3s ease both; }
.clocks-link { color: var(--rose); font-size: 22px; animation: beat 1.4s ease-in-out infinite; }
.clock { text-align: center; padding: 18px 10px; transition: background 0.6s, color 0.6s; }
.clock.is-night { background: linear-gradient(160deg, #3a2f57, var(--night)); color: #f5e9f0; border-color: transparent; }
.clock.is-night .clock-label, .clock.is-night .clock-day { color: #cdbfe0; }
.clock-icon { font-size: 22px; color: var(--gold); }
.clock-label { margin: 4px 0 0; font-size: 13px; color: var(--muted); }
.clock-time { margin: 2px 0; font-family: var(--serif-en); font-size: 40px; line-height: 1.1; font-variant-numeric: tabular-nums; }
.clock-day { margin: 0; font-size: 13px; color: var(--muted); }
.diff { text-align: center; margin: -6px 0 0; color: var(--muted); font-style: italic; }

.countdown { text-align: center; animation: rise 0.9s 0.45s ease both; }
.countdown-title { margin: 0 0 10px; color: var(--muted); }
.countdown-grid { display: flex; justify-content: center; gap: 22px; }
.countdown-grid div { display: flex; flex-direction: column; align-items: center; }
.countdown-grid strong { font-family: var(--serif-en); font-size: 44px; line-height: 1; color: var(--rose-deep); font-variant-numeric: tabular-nums; }
.countdown-grid span { font-size: 13px; color: var(--muted); }
.together { font-family: var(--hand); font-size: 32px; color: var(--rose); margin: 0; }

.letter { padding: 28px 26px; background: #fffaf3 repeating-linear-gradient(transparent 0 33px, rgba(195, 154, 92, 0.18) 33px 34px); animation: rise 0.9s 0.6s ease both; }
.letter h2 { margin: 0 0 12px; font-family: var(--hand); font-weight: 400; font-size: 28px; color: var(--rose-deep); }
html[lang='en'] .letter h2 { font-family: var(--serif-en); font-style: italic; font-weight: 600; }
.letter p { margin: 0 0 10px; line-height: 34px; }
.signature { text-align: right; font-family: var(--hand); font-size: 26px; color: var(--rose-deep); }

.cta {
  justify-self: center; text-decoration: none;
  background: var(--rose); color: #fff; padding: 12px 26px; border-radius: 999px;
  box-shadow: 0 12px 26px -12px var(--rose-deep);
  transition: transform 0.2s;
}
.cta:hover { transform: translateY(-2px); }

.floating-hearts { position: fixed; inset: 0; pointer-events: none; overflow: hidden; z-index: 0; }
.floating-hearts i { position: absolute; bottom: -40px; color: var(--blush); font-style: normal; animation: float 14s linear infinite; opacity: 0.7; }
.floating-hearts i:nth-child(1) { left: 5%; font-size: 14px; animation-delay: 0s; }
.floating-hearts i:nth-child(2) { left: 14%; font-size: 22px; animation-delay: 3s; }
.floating-hearts i:nth-child(3) { left: 23%; font-size: 12px; animation-delay: 6s; }
.floating-hearts i:nth-child(4) { left: 32%; font-size: 18px; animation-delay: 9s; }
.floating-hearts i:nth-child(5) { left: 41%; font-size: 26px; animation-delay: 1.5s; }
.floating-hearts i:nth-child(6) { left: 50%; font-size: 14px; animation-delay: 4.5s; }
.floating-hearts i:nth-child(7) { left: 59%; font-size: 20px; animation-delay: 7.5s; }
.floating-hearts i:nth-child(8) { left: 68%; font-size: 12px; animation-delay: 10.5s; }
.floating-hearts i:nth-child(9) { left: 77%; font-size: 24px; animation-delay: 2s; }
.floating-hearts i:nth-child(10) { left: 86%; font-size: 16px; animation-delay: 5s; }
.floating-hearts i:nth-child(11) { left: 93%; font-size: 20px; animation-delay: 8s; }
.floating-hearts i:nth-child(12) { left: 98%; font-size: 12px; animation-delay: 11s; }

@keyframes float { from { transform: translateY(0) rotate(0); opacity: 0; } 10% { opacity: 0.7; } to { transform: translateY(-110dvh) rotate(25deg); opacity: 0; } }
@keyframes rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
@keyframes beat { 0%, 100% { transform: scale(1); } 20% { transform: scale(1.25); } 40% { transform: scale(1); } }

@media (max-width: 520px) {
  .clocks { grid-template-columns: 1fr; }
  .clocks-link { justify-self: center; transform: rotate(90deg); }
  .topbar nav { gap: 10px; font-size: 14px; }
  .brand-zh { font-size: 21px; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
}
```

- [ ] **Step 4: Verify** — `npm run build` (Expected: no type errors; `dist/` produced). Then `npx vite preview --port 4173` and check at 390 px and 1280 px widths: greeting, counter, both clocks (one should be night), countdown, letter; toggle language → whole page switches without reload; reload keeps the language.

- [ ] **Step 5: Commit** — `git add -A && git commit -m "Add app shell, router, romantic theme and home page"`

---

### Task 5: Love map page

**Files:**
- Modify: `src/pages/map.ts` (replace stub), `src/styles.css` (append map styles)

**Interfaces:**
- Consumes: `t`, `pick`, `getLang`; `sortedMemories`, `PLACES`, `Memory`; `config.nextMeeting`; `letter`; `greatCircle`, `pacificLng`, `LatLng`; `formatDate`.
- Produces: `renderMap: Page`.

- [ ] **Step 1: Implement `src/pages/map.ts`**

```ts
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { t, pick, getLang } from '../i18n';
import { sortedMemories, PLACES, type Memory } from '../data/memories';
import { config } from '../data/config';
import { letter } from '../data/letter';
import { greatCircle, pacificLng, type LatLng } from '../lib/arc';
import { formatDate } from '../lib/dates';

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
  const map = L.map(root.querySelector<HTMLElement>('#love-map')!, { zoomControl: false, minZoom: 2, worldCopyJump: false }).setView([34, 185], 2);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 18,
  }).addTo(map);
  L.control.zoom({ position: 'bottomright' }).addTo(map);

  // The Pacific arc between us, with a heart travelling along it.
  const arc = greatCircle(at(PLACES.shenzhen.lat, PLACES.shenzhen.lng), at(PLACES.collegeStation.lat, PLACES.collegeStation.lng), 120);
  L.polyline(arc, { color: '#d4506d', weight: 2.5, dashArray: '6 9', opacity: 0.9 }).addTo(map);
  const traveler = L.marker(arc[0], { icon: heartIcon('traveler'), interactive: false, keyboard: false }).addTo(map);
  const t0 = performance.now();
  let raf = 0;
  const fly = (now: number) => {
    const f = (((now - t0) / 7000) % 1) * (arc.length - 1);
    const i = Math.floor(f), k = f - i;
    const a = arc[i], b = arc[Math.min(i + 1, arc.length - 1)];
    traveler.setLatLng([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]);
    raf = requestAnimationFrame(fly);
  };
  raf = requestAnimationFrame(fly);

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
  const nm = config.nextMeeting;
  L.marker(at(nm.lat, nm.lng), { icon: heartIcon('future') })
    .addTo(map)
    .bindTooltip(t('map.meeting', { place: pick(nm.place) }), { direction: 'top', offset: [0, -14] });

  const closeCard = () => { layer.innerHTML = ''; };

  function showCard(inner: string): HTMLElement {
    layer.innerHTML = `<div class="card-backdrop"><article class="memory-card" role="dialog" aria-modal="true">
      <button class="card-close" type="button" aria-label="${t('map.close')}">×</button>${inner}</article></div>`;
    const backdrop = layer.querySelector<HTMLElement>('.card-backdrop')!;
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) closeCard(); });
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
    const el = showCard(`
      <div class="card-media">${mediaHtml(m)}</div>
      <div class="card-body">
        <p class="card-meta">${formatDate(m.date, getLang())} · ${pick(m.place.name)}</p>
        <h3>${pick(m.title)}</h3>
        <p>${pick(m.text)}</p>
      </div>
      <div class="card-nav">${nav}</div>`);
    el.querySelectorAll('img').forEach((img) =>
      img.addEventListener('error', () => { img.outerHTML = `<p class="media-missing">${t('map.media.missing')}</p>`; }),
    );
    el.querySelector('[data-act="prev"]')?.addEventListener('click', () => openCard(list, i - 1));
    el.querySelector('[data-act="next"]')?.addEventListener('click', () => openCard(list, i + 1));
    el.querySelector('[data-act="story-next"]')?.addEventListener('click', () => onNext?.());
  }

  function showFinale(): void {
    map.flyTo([34, 185], 2, { duration: 1.6 });
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
    if (idx >= list.length) { showFinale(); return; }
    closeCard();
    const m = list[idx];
    map.flyTo(at(m.place.lat, m.place.lng), 6, { duration: 1.6 });
    clearTimeout(storyTimer);
    storyTimer = window.setTimeout(() => openCard([m], 0, () => playStory(idx + 1), idx === list.length - 1), 1700);
  }
  root.querySelector('#story-btn')!.addEventListener('click', () => playStory(0));

  const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeCard(); };
  document.addEventListener('keydown', onKey);

  return () => {
    cancelAnimationFrame(raf);
    clearTimeout(storyTimer);
    document.removeEventListener('keydown', onKey);
    map.remove();
  };
}
```

- [ ] **Step 2: Append map styles to `src/styles.css`**

```css
.view-map { position: relative; z-index: 1; }
.map-page { display: flex; flex-direction: column; height: calc(100dvh - 63px); }
.map-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 16px; }
.map-head h2 { margin: 0; font-family: var(--hand); font-weight: 400; font-size: 26px; color: var(--rose-deep); }
html[lang='en'] .map-head h2 { font-family: var(--serif-en); font-style: italic; font-weight: 600; }
.love-map { flex: 1; min-height: 320px; background: #f2e8e4; }
.btn { font: inherit; font-size: 15px; cursor: pointer; border: 0; border-radius: 999px; padding: 8px 18px; background: var(--rose); color: #fff; box-shadow: 0 10px 22px -12px var(--rose-deep); }
.btn:hover { background: var(--rose-deep); }
.btn-ghost { font: inherit; font-size: 20px; cursor: pointer; border: 1px solid var(--line); background: transparent; color: var(--rose-deep); border-radius: 999px; width: 38px; height: 38px; }
.btn-ghost:disabled { opacity: 0.3; cursor: default; }

.heart-marker { display: grid; place-items: center; }
.heart-marker span { font-size: 30px; color: var(--rose); text-shadow: 0 4px 10px rgba(168, 50, 79, 0.4); animation: beat 1.6s ease-in-out infinite; cursor: pointer; }
.heart-marker.traveler span { font-size: 18px; color: var(--rose-deep); animation: none; }
.heart-marker.future span { color: var(--gold); }

.card-backdrop { position: fixed; inset: 0; z-index: 2000; background: rgba(59, 36, 48, 0.42); display: grid; place-items: center; padding: 16px; animation: fade 0.3s ease both; }
.memory-card { position: relative; width: min(460px, 100%); max-height: calc(100dvh - 32px); overflow-y: auto; background: #fffaf6; border-radius: var(--radius); box-shadow: 0 30px 60px -20px rgba(59, 36, 48, 0.55); animation: rise 0.4s ease both; }
.card-close { position: absolute; top: 10px; right: 12px; z-index: 1; width: 34px; height: 34px; border-radius: 50%; border: 0; background: rgba(255, 255, 255, 0.85); font-size: 22px; line-height: 1; cursor: pointer; color: var(--ink); }
.card-media img, .card-media video { display: block; width: 100%; max-height: 56dvh; object-fit: cover; border-radius: var(--radius) var(--radius) 0 0; }
.card-body { padding: 18px 22px 6px; }
.card-meta { margin: 0; font-size: 13px; color: var(--gold); letter-spacing: 0.06em; }
.card-body h3 { margin: 4px 0 8px; font-size: 22px; color: var(--rose-deep); }
.card-body p { margin: 0 0 10px; }
.card-nav { display: flex; align-items: center; justify-content: center; gap: 14px; padding: 6px 22px 20px; }
.media-missing { margin: 0; padding: 40px 20px; text-align: center; color: var(--muted); background: var(--paper-2); border-radius: var(--radius) var(--radius) 0 0; }
.finale { padding-top: 30px; text-align: left; }
.finale-hearts { text-align: center; color: var(--rose); font-size: 22px; letter-spacing: 0.4em; animation: beat 1.4s ease-in-out infinite; }

@keyframes fade { from { opacity: 0; } to { opacity: 1; } }
```

- [ ] **Step 3: Verify** — `npm test && npm run build` (Expected: all tests pass, build OK). In `npx vite preview`: map opens centred on the Pacific with Shenzhen on the left and Texas on the right; dashed arc bows north with a heart moving along it; gold heart at New York shows the tooltip; Shenzhen marker opens a card with 1 / 2 navigation; "Play our story" flies through 3 memories then shows the letter; Esc and backdrop click close the card; switching language on the map re-renders it in the other language; leaving the map stops the animation (no console errors).

- [ ] **Step 4: Commit and push** — `git add -A && git commit -m "Add love map with Pacific arc, memory cards and story mode" && git push`
