// Level: five classical lines about love, each with its second half to be put back character by
// character. The owner chose the poems (2026-10-26); the blanks are the halves he quoted first.
import type { L10n } from '../../core/i18n';

export interface Poem {
  id: string;
  /** The whole text, line by line, as shown; `answer` must appear in one line. */
  lines: string[];
  /** The characters the player has to put back, in order. */
  answer: string;
  source: L10n;
  /** A plain English rendering of the blanked line, shown once it is solved. */
  gloss: L10n;
}

export const POEMS: Poem[] = [
  {
    id: 'hair',
    lines: ['结发为夫妻，恩爱两不疑。'],
    answer: '恩爱两不疑',
    source: { zh: '汉 · 苏武《留别妻》', en: 'Su Wu, “Parting from My Wife” (Han)' },
    gloss: { zh: '绑了头发就是夫妻，恩爱之间没有一点猜疑。', en: 'Our hair bound together, husband and wife: love with no room for doubt.' },
  },
  {
    id: 'clay',
    lines: ['你侬我侬，忒煞情多，情多处，热似火。', '把一块泥，捏一个你，塑一个我。', '将咱两个，一齐打破，用水调和。', '再捏一个你，再塑一个我。', '我泥中有你，你泥中有我。', '与你生同一个衾，死同一个椁。'],
    answer: '你泥中有我',
    source: { zh: '元 · 管道升《我侬词》', en: 'Guan Daosheng, “You and I” (Yuan)' },
    gloss: { zh: '打碎重捏之后，我的泥里有你，你的泥里有我。', en: 'Broken and kneaded again: in my clay there is you, in your clay there is me.' },
  },
  {
    id: 'phoenix',
    lines: ['身无彩凤双飞翼，心有灵犀一点通。'],
    answer: '心有灵犀一点通',
    source: { zh: '唐 · 李商隐《无题》', en: 'Li Shangyin, “Untitled” (Tang)' },
    gloss: { zh: '没有彩凤的翅膀可以双飞，心却像灵犀一样一点就通。', en: 'No phoenix wings to fly side by side, yet our hearts touch at a single point.' },
  },
  {
    id: 'birds',
    lines: ['愿为双飞鸟，比翼共翱翔。'],
    answer: '比翼共翱翔',
    source: { zh: '魏 · 阮籍《咏怀》（《玉台新咏》录）', en: 'Ruan Ji, “Songs of My Heart” (Wei; in New Songs from the Jade Terrace)' },
    gloss: { zh: '愿做一对飞鸟，翅膀挨着翅膀一起飞。', en: 'Let us be two birds flying as one, wing to wing across the sky.' },
  },
  {
    id: 'quilt',
    lines: ['比翼双飞宿上林，流苏掩映合欢衾。'],
    answer: '流苏掩映合欢衾',
    source: { zh: '佚名', en: 'Anonymous' },
    gloss: { zh: '双飞的鸟儿栖在上林，流苏帐子半掩着合欢被。', en: 'Wing to wing we roost in the imperial grove; tasselled curtains half hide the shared quilt.' },
  },
];

/** Characters mixed into the bank so the answer is not simply every tile in order. */
const DECOYS = '月花风云梦水山海星雪春秋灯影书';

/** Split a string into user-visible characters (no surrogate halves). */
export const chars = (s: string): string[] => Array.from(s);

/** Index of the line that holds the answer, and where the answer starts in it. */
export function blank(p: Poem): { line: number; at: number } {
  for (let i = 0; i < p.lines.length; i++) {
    const at = p.lines[i].indexOf(p.answer);
    if (at >= 0) return { line: i, at: chars(p.lines[i].slice(0, at)).length };
  }
  throw new Error(`answer of ${p.id} is not in its lines`);
}

/** The tiles to choose from: the answer's characters plus `extra` decoys, shuffled with `rnd`. */
export function bank(p: Poem, extra = 3, rnd: () => number = Math.random): string[] {
  const need = chars(p.answer);
  const pool = chars(DECOYS).filter((c) => !need.includes(c));
  const picked: string[] = [];
  while (picked.length < extra && pool.length) picked.push(pool.splice(Math.floor(rnd() * pool.length), 1)[0]);
  const all = [...need, ...picked];
  for (let i = all.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [all[i], all[j]] = [all[j], all[i]]; }
  return all;
}

export const solved = (p: Poem, filled: string[]): boolean => filled.join('') === p.answer;
