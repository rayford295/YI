import type { L10n } from './i18n';

export interface Person { name: L10n; zone: string; birthday: string }

export const config = {
  metOn: '2026-09-20',
  her: { name: { zh: '静仪', en: 'Jingyi' }, zone: 'Asia/Shanghai', birthday: '10-31' } satisfies Person,
  him: { name: { zh: '一帆', en: 'Yifan' }, zone: 'America/Chicago', birthday: '09-25' } satisfies Person,
  nextMeeting: {
    // The ticket Yifan drew on our first Zoom: CYF925, SZX → JFK, departing 2027-02-05.
    // We meet in New York around the AAG 2027 Annual Meeting (8–12 Feb 2027).
    flight: 'CYF925',
    at: '2027-02-05T00:00:00+08:00',
    date: '2027-02-05',
    place: { zh: '纽约', en: 'New York' } satisfies L10n,
    lat: 40.6413,
    lng: -73.7781,
  },
};
