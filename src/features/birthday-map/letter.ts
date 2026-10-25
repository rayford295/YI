import type { L10n } from '../../core/i18n';

// Draft — Yifan rewrites this in his own words. `{h}` becomes the live hour difference.
export const letter: { paragraphs: { zh: string[]; en: string[] }; signature: L10n } = {
  paragraphs: {
    zh: [
      '静仪，生日快乐。',
      '我们认识才四十二天，我已经习惯了每天醒来先算一算深圳现在几点。',
      '你的早晨是我的夜晚。隔着 {h} 个小时和一整片太平洋，我们看的还是同一个月亮。',
      '谢谢你陪我在 Zoom 上一遍一遍练答辩。还记得我画给你的那张机票吗？CYF925，2027 年 2 月 5 日，深圳飞纽约。那一天，我在出口等你。',
    ],
    en: [
      'Happy birthday, Jingyi.',
      'We have known each other for only forty-two days, and I already wake up working out what time it is in Shenzhen.',
      'Your morning is my night. {h} hours and a whole Pacific apart, we still look up at the same moon.',
      'Thank you for sitting through my defense rehearsals on Zoom, again and again. Remember the ticket I drew you? CYF925, February 5, 2027, Shenzhen to New York. That day, I’ll be waiting for you at arrivals.',
    ],
  },
  signature: { zh: '一帆', en: 'Yifan' },
};

/** The letter's paragraphs for `lang`, with `{h}` filled in. */
export function letterParagraphs(lang: 'zh' | 'en', hours: number): string[] {
  return letter.paragraphs[lang].map((p) => p.replace('{h}', String(hours)));
}
