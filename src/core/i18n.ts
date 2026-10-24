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
  'home.countdown.title': '距离你登上 {flight} 飞来{place}还有',
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
  'map.flight': '航班 {flight} · 深圳 → 纽约 · {date}',
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
  'home.countdown.title': 'Until you board {flight} to {place}',
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
  'map.flight': 'Flight {flight} · Shenzhen → New York · {date}',
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
