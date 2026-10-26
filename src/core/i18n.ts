export type Lang = 'zh' | 'en';
export type L10n = { zh: string; en: string };

const zh = {
  'site.title': '仪见钟情',
  'nav.home': '首页',
  'nav.map': '爱情地图',
  'nav.moments': '时刻',
  'nav.games': '小游戏',
  'nav.soon': '即将上线',
  'ring.eyebrow': '一个还没说出口的问题',
  'ring.title': '子午线',
  'ring.subtitle': '一对戒指，同一条金色经线。她的那枚：主石外一圈光环，碎钻顺着经线爬上肩部，四爪指向东南西北。戒圈内侧各藏一颗蓝宝石：左边是对方的名字和生日，右边是我们认识的日子和相见的坐标。',
  'ring.hint': '拖动旋转 · 滚轮缩放',
  'ring.hers': '她的',
  'ring.his': '他的',
  'ring.fact.names': '她的刻着 Dr. Yifan Yang, 25th Sept.，他的刻着 Jingyi, 31st Oct.',
  'ring.loading': '正在打磨……',
  'ring.view.outside': '看正面',
  'ring.view.inside': '看内侧',
  'ring.fact.met': '2026 · 09 · 20 认识',
  'ring.fact.coords': '40.64°N 73.78°W 相见',
  'ring.fact.compass': '四爪罗盘，十八颗光环碎钻',
  'ring.fact.sapphire': '底部一颗只有你看得见的蓝宝石',
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
  'map.zoom.in': '放大',
  'map.zoom.out': '缩小',
  'moments.title': '我们的时刻',
  'moments.subtitle': '从 9 月 20 日认识那天算起，每一个值得记住的日子。',
  'moments.day': '第 {n} 天',
  'moments.count': '已经记下 {n} 个时刻',
  'moments.more': '以后还会有很多很多。',
  'moments.map': '去地图上看',
  'gomoku.title': '五子棋',
  'gomoku.subtitle': '我们的第一盘棋是在 Zoom 白板上下的：紫色是静仪，绿色是一帆。',
  'gomoku.turn': '轮到{name}落子',
  'gomoku.opens': '这一局{name}先手',
  'gomoku.won': '{name}赢啦！',
  'gomoku.draw': '棋盘下满啦，平局',
  'gomoku.next': '下一局{name}先手',
  'gomoku.undo': '悔棋',
  'gomoku.again': '再来一局',
  'gomoku.confirm': '这一局还没下完，确定重新开始吗？',
  'gomoku.draws': '平局 {n}',
  'gomoku.cell': '第 {r} 行，第 {c} 列',
  'gomoku.purple': '紫棋',
  'gomoku.green': '绿棋',
  'pictionary.title': '你画我猜',
  'pictionary.subtitle': '我们第一次玩你画我猜，是在 10 月 23 日的 Zoom 上。每猜对一题，默契值就加一。',
  'pictionary.score': '默契值',
  'pictionary.streak': '连对 {n}',
  'pictionary.best': '最佳 {n}',
  'pictionary.roles': '第 {n} 轮 · {drawer}画，{guesser}猜',
  'pictionary.ready.title': '第 {n} 轮：{drawer}来画',
  'pictionary.ready.hint': '{guesser}先别看屏幕哦。开始以后，按住“看题”才会显示题目。',
  'pictionary.start': '开始，90 秒',
  'pictionary.peek': '按住看题',
  'pictionary.word': '题目：{word}',
  'pictionary.guess.placeholder': '猜猜画的是什么…',
  'pictionary.guess.submit': '猜',
  'pictionary.spoken': '猜对啦（口头）',
  'pictionary.skip': '跳过',
  'pictionary.misses': '不是：',
  'pictionary.correct': '猜对啦！',
  'pictionary.timeout': '时间到',
  'pictionary.skipped': '这一题跳过啦',
  'pictionary.answer': '答案是 {zh} · {en}',
  'pictionary.next': '下一轮：{drawer}来画',
  'pictionary.tool.eraser': '橡皮',
  'pictionary.tool.undo': '撤销一笔',
  'pictionary.tool.clear': '清空',
  'pictionary.tool.size': '粗细',
  'pictionary.tool.color': '颜色',
  'pictionary.seconds': '{n} 秒',
} as const;

export type Key = keyof typeof zh;

const en: Record<Key, string> = {
  'site.title': 'Yi at First Sight',
  'nav.home': 'Home',
  'nav.map': 'Love Map',
  'nav.moments': 'Moments',
  'nav.games': 'Games',
  'nav.soon': 'Coming soon',
  'ring.eyebrow': 'A question not yet asked',
  'ring.title': 'Meridian',
  'ring.subtitle': 'A pair of rings sharing one gold meridian. Hers: a halo around the centre stone, small diamonds climbing the meridian to the shoulders, four prongs pointing N, E, S and W. Inside each band hides a sapphire: on its left, the other’s name and birthday; on its right, the day we met and where we meet.',
  'ring.hint': 'Drag to turn · scroll to zoom',
  'ring.hers': 'Hers',
  'ring.his': 'His',
  'ring.fact.names': 'Hers reads “Dr. Yifan Yang, 25th Sept.”, his “Jingyi, 31st Oct.”',
  'ring.loading': 'Polishing…',
  'ring.view.outside': 'Front',
  'ring.view.inside': 'Look inside',
  'ring.fact.met': '2026 · 09 · 20, the day we met',
  'ring.fact.coords': '40.64°N 73.78°W, where we meet',
  'ring.fact.compass': 'Compass prongs, a halo of eighteen',
  'ring.fact.sapphire': 'A sapphire underneath only you can see',
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
  'map.zoom.in': 'Zoom in',
  'map.zoom.out': 'Zoom out',
  'moments.title': 'Our Moments',
  'moments.subtitle': 'Every day worth remembering, counted from September 20, the day we met.',
  'moments.day': 'Day {n}',
  'moments.count': '{n} moments and counting',
  'moments.more': 'Many, many more to come.',
  'moments.map': 'See them on the map',
  'gomoku.title': 'Gomoku',
  'gomoku.subtitle': 'Our first game was on a Zoom whiteboard: purple for Jingyi, green for Yifan.',
  'gomoku.turn': '{name}’s move',
  'gomoku.opens': '{name} opens this game',
  'gomoku.won': '{name} wins!',
  'gomoku.draw': 'The board is full: a draw',
  'gomoku.next': '{name} opens the next game',
  'gomoku.undo': 'Undo',
  'gomoku.again': 'New game',
  'gomoku.confirm': 'This game isn’t finished. Start a new one?',
  'gomoku.draws': 'Draws {n}',
  'gomoku.cell': 'Row {r}, column {c}',
  'gomoku.purple': 'purple',
  'gomoku.green': 'green',
  'pictionary.title': 'Pictionary',
  'pictionary.subtitle': 'We first played on Zoom on October 23. Every right guess adds one to our in-sync score.',
  'pictionary.score': 'In sync',
  'pictionary.streak': 'Streak {n}',
  'pictionary.best': 'Best {n}',
  'pictionary.roles': 'Round {n} · {drawer} draws, {guesser} guesses',
  'pictionary.ready.title': 'Round {n}: {drawer} draws',
  'pictionary.ready.hint': '{guesser}, look away for a moment. Once it starts, hold “Peek” to see the word.',
  'pictionary.start': 'Start · 90 seconds',
  'pictionary.peek': 'Hold to peek',
  'pictionary.word': 'Word: {word}',
  'pictionary.guess.placeholder': 'What is it…',
  'pictionary.guess.submit': 'Guess',
  'pictionary.spoken': 'Guessed it (out loud)',
  'pictionary.skip': 'Skip',
  'pictionary.misses': 'Not:',
  'pictionary.correct': 'Got it!',
  'pictionary.timeout': 'Time’s up',
  'pictionary.skipped': 'Skipped this one',
  'pictionary.answer': 'The answer: {en} · {zh}',
  'pictionary.next': 'Next round: {drawer} draws',
  'pictionary.tool.eraser': 'Eraser',
  'pictionary.tool.undo': 'Undo stroke',
  'pictionary.tool.clear': 'Clear',
  'pictionary.tool.size': 'Size',
  'pictionary.tool.color': 'Colour',
  'pictionary.seconds': '{n}s',
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
