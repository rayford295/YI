// The epilogue's letter: read after both of us have reached the end of the town. A DRAFT in
// Yifan's voice for him to rewrite; `{d}` becomes the day count since we met, `{h}` the hours
// apart right now. (The birthday letter on the Love Map is a different one: birthday-map/letter.ts.)
import type { L10n } from '../../core/i18n';

export const epilogue: { paragraphs: { zh: string[]; en: string[] }; signature: L10n } = {
  paragraphs: {
    zh: [
      '静仪，',
      '你走到这里了。九栋房子，从我们认识的那天，到喷泉边那枚戒指，你一栋一栋走过来，我在另一个时区看着你的进度条一格一格亮起来。',
      '今天是我们认识的第 {d} 天。中间隔着 {h} 个小时，但这座小镇里没有时差：你的清晨和我的深夜，在同一张地图上。',
      '小镇是做给你的，可它也是我的一个承诺：以后的每一个生日，蛋糕我亲手做；以后的每一关，我们一起走；以后的时差，我负责把它变成零。',
      '2027 年 2 月 5 日，CYF925，深圳飞纽约。到出口的时候别着急找我，我一定已经在那里了。',
    ],
    en: [
      'Jingyi,',
      'You made it here. Nine houses, from the day we met to the ring by the fountain, one at a time, while from another time zone I watched your progress light up house by house.',
      'Today is day {d} since we met. There are {h} hours between us, but this town has no time difference: your morning and my late night are on the same map.',
      'The town was made for you, and it is also a promise: every birthday from now on, I bake the cake; every level from now on, we walk together; and the time difference I will turn into zero.',
      '5 February 2027, CYF925, Shenzhen to New York. Don’t look for me at arrivals; I will already be there.',
    ],
  },
  signature: { zh: '一帆', en: 'Yifan' },
};

/** The paragraphs for `lang`, with `{d}` (days since we met) and `{h}` (hours apart) filled in. */
export function epilogueParagraphs(lang: 'zh' | 'en', days: number, hours: number): string[] {
  return epilogue.paragraphs[lang].map((p) => p.replace('{d}', String(days)).replace('{h}', String(hours)));
}
