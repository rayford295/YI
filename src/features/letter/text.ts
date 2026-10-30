// The epilogue's letter: read after both of us have reached the end of the town. It is not a
// finished letter on purpose: the town ends here, the story does not. `{d}` becomes the day count
// since we met, `{h}` the hours apart right now. (The birthday letter is birthday-map/letter.ts.)
import type { L10n } from '../../core/i18n';

export const epilogue: { paragraphs: { zh: string[]; en: string[] }; signature: L10n } = {
  paragraphs: {
    zh: [
      '静仪，',
      '你走到这里了。九栋房子，从我们认识的那天到喷泉边那枚戒指，你一栋一栋走过来，我在另一个时区看着你的进度条一格一格亮起来。',
      '今天是我们认识的第 {d} 天，中间隔着 {h} 个小时。小镇到这里就建完了，可这封信我不打算写完。',
      '后面的章节不在这座小镇里：在深圳机场的出口，在我们一起选的下一座城市，在每一个我亲手做蛋糕的生日里。那些关卡，我们一起走，一起写。',
      '故事未完，待续。',
    ],
    en: [
      'Jingyi,',
      'You made it here. Nine houses, from the day we met to the ring by the fountain, one at a time, while from another time zone I watched your progress light up house by house.',
      'Today is day {d} since we met, with {h} hours between us. The town is finished here, but I am not going to finish this letter.',
      'The next chapters are not in this town: they are at the arrivals gate in Shenzhen, in the next city we choose together, in every birthday where I bake the cake. Those levels we walk, and write, together.',
      'To be continued.',
    ],
  },
  signature: { zh: '一帆', en: 'Yifan' },
};

/** The paragraphs for `lang`, with `{d}` (days since we met) and `{h}` (hours apart) filled in. */
export function epilogueParagraphs(lang: 'zh' | 'en', days: number, hours: number): string[] {
  return epilogue.paragraphs[lang].map((p) => p.replace('{d}', String(days)).replace('{h}', String(hours)));
}
