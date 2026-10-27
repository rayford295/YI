// Level 2: six places with a heart hidden in each. A street-level photo of the place is shown
// first; name it right and its heart appears on the map to be picked up. The photos are free
// (Creative Commons, Wikimedia Commons) with their authors credited; swap in your own any time.
import type { L10n } from '../../core/i18n';
import { shuffle } from '../../core/random';

export interface Place {
  id: string;
  name: L10n;
  /** Why this place is ours. */
  why: L10n;
  lat: number;
  lng: number;
  photo: { src: string; author: string; licence: string; licenceUrl: string; page: string };
}

const P = (id: string, author: string, licence: string, licenceUrl: string, page: string) =>
  ({ src: `media/places/${id}.jpg`, author, licence, licenceUrl, page });

export const HEART_PLACES: Place[] = [
  { id: 'texas', name: { zh: '德州 College Station', en: 'College Station, Texas' }, why: { zh: '一帆读博士的地方', en: 'Where Yifan does his PhD' },
    lat: 30.6187, lng: -96.3365, photo: P('texas', 'Srujan1001', 'CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0', 'https://commons.wikimedia.org/wiki/File:TAMU_Academic_Building.jpg') },
  { id: 'la', name: { zh: '洛杉矶', en: 'Los Angeles' }, why: { zh: '一帆读硕士的地方', en: 'Where Yifan did his master’s' },
    lat: 34.1016, lng: -118.3406, photo: P('la', 'Dietmar Rabich', 'CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0', 'https://commons.wikimedia.org/wiki/File:Los_Angeles_(California,_USA),_Hollywood_Boulevard_--_2012_--_5100.jpg') },
  { id: 'japan', name: { zh: '日本', en: 'Japan' }, why: { zh: '静仪喜欢的地方', en: 'A place Jingyi loves' },
    lat: 34.9671, lng: 135.7727, photo: P('japan', 'Maarten Heerlien', 'CC BY 2.0', 'https://creativecommons.org/licenses/by/2.0', 'https://commons.wikimedia.org/wiki/File:Torii_path_through_the_woods_at_Fushimi_Inari-taisha_(48885853297).jpg') },
  { id: 'shenzhen', name: { zh: '深圳', en: 'Shenzhen' }, why: { zh: '静仪所在的地方', en: 'Where Jingyi is' },
    lat: 22.5160, lng: 113.9450, photo: P('shenzhen', 'Windmemories', 'CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0', 'https://commons.wikimedia.org/wiki/File:20201112_The_skyline_at_Shenzhen_Bay.jpg') },
  { id: 'hongkong', name: { zh: '香港', en: 'Hong Kong' }, why: { zh: '静仪读硕士的地方', en: 'Where Jingyi did her master’s' },
    lat: 22.2855, lng: 114.1577, photo: P('hongkong', 'LAUD Freiman Aldopoilslmy', 'CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0', 'https://commons.wikimedia.org/wiki/File:202105_Hong_Kong_Tramways_148_at_Des_Voeux_Road_Central,_Sheung_Wan.jpg') },
  { id: 'newyork', name: { zh: '纽约', en: 'New York' }, why: { zh: '可能会见面的地方', en: 'Where we may meet' },
    lat: 40.7580, lng: -73.9855, photo: P('newyork', 'Terabass', 'CC BY-SA 3.0', 'https://creativecommons.org/licenses/by-sa/3.0', 'https://commons.wikimedia.org/wiki/File:New_york_times_square-terabass.jpg') },
];


/** Four names to choose from: the right one and three others, shuffled. */
export function choices(p: Place, all: readonly Place[] = HEART_PLACES, n = 4, rnd: () => number = Math.random): Place[] {
  return shuffle([p, ...shuffle(all.filter((x) => x.id !== p.id), rnd).slice(0, n - 1)], rnd);
}
