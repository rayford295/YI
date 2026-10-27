// Level 1, second half: the vow. Wedding vows turned into the vow of becoming each other's
// boyfriend and girlfriend again, and one line to say out loud: "I love you, <name>, I do."
import type { L10n } from '../../core/i18n';
import type { PlayerId } from '../../core/quest';

/** The whole vow, read before speaking. */
export const VOW: Record<PlayerId, L10n> = {
  yifan: {
    zh: '我，杨一帆，愿意再一次成为陈静仪的男朋友。无论顺境或逆境，忙碌或清闲，隔着太平洋或在同一座城，我都会爱她、尊重她、听她说话、陪她走下去，从今天起，一直到永远。',
    en: 'I, Yifan Yang, take Jingyi Chen to be my girlfriend once more. In good times and in bad, busy or idle, with a Pacific between us or in one city, I will love her, respect her, listen to her and walk on with her, from this day, for always.',
  },
  jingyi: {
    zh: '我，陈静仪，愿意再一次成为杨一帆的女朋友。无论顺境或逆境，忙碌或清闲，隔着太平洋或在同一座城，我都会爱他、尊重他、听他说话、陪他走下去，从今天起，一直到永远。',
    en: 'I, Jingyi Chen, take Yifan Yang to be my boyfriend once more. In good times and in bad, busy or idle, with a Pacific between us or in one city, I will love him, respect him, listen to him and walk on with him, from this day, for always.',
  },
};

/** The line to say out loud: the other one's full name inside it. */
export const LINE: Record<PlayerId, string> = {
  yifan: '我爱你，陈静仪，我愿意',
  jingyi: '我爱你，杨一帆，我愿意',
};

/** Ways a recogniser tends to hear each name (homophones); any counts. */
const NAMES: Record<PlayerId, string[]> = {
  yifan: ['陈静仪', '陈静怡', '陈静宜', '陈婧仪', '陈靖仪', '陈静一', '陈静仪', '静仪', '静怡', '静宜'],
  jingyi: ['杨一帆', '杨一凡', '杨亦帆', '杨艺凡', '杨依帆', '杨奕帆', '一帆', '一凡'],
};

/** Keep only CJK characters and Latin letters, so punctuation, spaces and tone marks never matter. */
export const normalise = (s: string): string => s.replace(/[^\p{Script=Han}A-Za-z]/gu, '').toLowerCase();

/** True when what was heard carries "我爱你", the other one's name and "我愿意". */
export function saidTheLine(heard: string, player: PlayerId): boolean {
  const h = normalise(heard);
  return h.includes('我爱你') && h.includes('我愿意') && NAMES[player].some((n) => h.includes(n));
}
