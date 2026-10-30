import type { L10n } from '../../core/i18n';

// The birthday letter, as Yifan wrote it by hand on the card dated 10.31.2026
// (`public/media/letter/birthday-card.jpg`). The Chinese is the letter itself, transcribed
// line for line; the English is a rendering for Jingyi's friends who read the site in English.
// `{d}` and `{h}` stay supported by letterParagraphs() but this letter does not use them.
export const letter: { paragraphs: { zh: string[]; en: string[] }; signature: L10n } = {
  paragraphs: {
    zh: [
      '亲爱的陈静仪老婆：',
      '首先祝你生日快乐。认识你已经是够惊喜，能够陪你共度未来的时光，乃三生有幸。',
      '你说，我从来没有告诉你，你到底是什么角色。我想说，你是我的宝贝，是我爱的人，是我的女朋友，是我未来的老婆。似乎风象的人总是很有魅力，但也难以捉摸。这样性格的我，是有足够的勇气也爱你，但也让你吃尽了我的坏。因此，我想我们是彼此人生的巧克力。《阿甘正传》的台词，生活就像一盒巧克力，你永远不知道下一颗是什么味道。我们的爱情也是！只是，我只知道我要选择陈静仪这块未知的巧克力！你是我的选择。',
      '我爱你，陈静仪！',
      '人一生中最重要的就是两天，一天是生日这天，另一天则是知道自己为什么而生的一天。因此，感谢你生日这一天，让我知道了最重要的两天。未来有你，我无怨无悔。',
    ],
    en: [
      'Dear Jingyi, my wife-to-be,',
      'First of all, happy birthday. Meeting you was already surprise enough; getting to spend the years ahead with you is the luck of three lifetimes.',
      'You said I never told you what you are to me. So: you are my treasure, the one I love, my girlfriend, my future wife. Air signs, they say, are charming and hard to read. Someone like me has had the courage to love you, and has also made you put up with the worst of me. That is why I think we are each other’s chocolate. As Forrest Gump says, life is like a box of chocolates: you never know what the next one will taste like. So is our love! The only thing I know is that I choose Jingyi, this unknown chocolate. You are my choice.',
      'I love you, Jingyi!',
      'The two most important days in a life are the day you are born and the day you find out why. Thank you for your birthday, which taught me both. With you in the future, I have no regrets.',
    ],
  },
  signature: { zh: '杨一帆 · 10.31.2026', en: 'Yifan Yang · Oct 31, 2026' },
};

/** The letter's paragraphs for `lang`, with `{h}` and `{d}` filled in. */
export function letterParagraphs(lang: 'zh' | 'en', hours: number, days: number): string[] {
  return letter.paragraphs[lang].map((p) => p.replace('{h}', String(hours)).replace('{d}', String(days)));
}
