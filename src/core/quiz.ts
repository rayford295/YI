// Level 1 questions. Each has one right answer; the options are shown shuffled.
// Owner: add questions only the two of you can answer. Keep `answer` as the index into `options`.
import type { L10n } from './i18n';

export interface Question { q: L10n; options: L10n[]; answer: number }

export const QUESTIONS: Question[] = [
  {
    q: { zh: '我们认识的那一天是？', en: 'The day we met was…' },
    options: [
      { zh: '2026 年 9 月 20 日', en: '20 September 2026' },
      { zh: '2026 年 9 月 25 日', en: '25 September 2026' },
      { zh: '2026 年 10 月 10 日', en: '10 October 2026' },
      { zh: '2026 年 8 月 31 日', en: '31 August 2026' },
    ],
    answer: 0,
  },
  {
    q: { zh: '我在第一次视频里画的那张机票，航班号是？', en: 'The flight number on the ticket I drew on our first video call?' },
    options: [
      { zh: 'CYF925', en: 'CYF925' },
      { zh: 'CA981', en: 'CA981' },
      { zh: 'JY1031', en: 'JY1031' },
      { zh: 'YF2027', en: 'YF2027' },
    ],
    answer: 0,
  },
];
