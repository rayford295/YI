// The puzzle is always a face: Jingyi pieces Yifan back together, Yifan pieces Jingyi (owner,
// 2026-10-26: "拼图那一关，必须是人像"). Photos live in public/media/portraits/<player>/; to add
// one, drop the file there and append a line below.
import type { PlayerId } from '../../core/quest';

export interface Portrait { src: string; alt: { zh: string; en: string } }

export const PORTRAITS: Record<PlayerId, Portrait[]> = {
  yifan: [
    { src: 'media/portraits/yifan/01.jpg', alt: { zh: '小时候在喷泉前比耶', en: 'Little Yifan by a fountain, flashing a V' } },
    { src: 'media/portraits/yifan/02.jpg', alt: { zh: '拍立得里笑得眯起眼', en: 'Laughing with eyes shut, in a Polaroid' } },
    { src: 'media/portraits/yifan/03.jpg', alt: { zh: '迈阿密国际球场，梅西 10 号', en: 'Messi 10 at the Inter Miami stadium' } },
    { src: 'media/portraits/yifan/04.jpg', alt: { zh: '快船主场看球', en: 'At the Clippers arena' } },
    { src: 'media/portraits/yifan/05.jpg', alt: { zh: '海边投篮', en: 'Shooting hoops by the sea' } },
  ],
  jingyi: [
    { src: 'media/portraits/jingyi/01.jpg', alt: { zh: '博斯普鲁斯海峡边', en: 'By the Bosphorus' } },
    { src: 'media/portraits/jingyi/02.jpg', alt: { zh: '船上挡着太阳', en: 'On the water, shading her eyes' } },
    { src: 'media/portraits/jingyi/03.jpg', alt: { zh: '镜子前比耶', en: 'A mirror selfie with a V' } },
    { src: 'media/portraits/jingyi/04.jpg', alt: { zh: '海边的晚餐', en: 'Dinner by the sea at dusk' } },
    { src: 'media/portraits/jingyi/05.jpg', alt: { zh: '缆车上望着海', en: 'In a cable car, looking out to sea' } },
    { src: 'media/portraits/jingyi/06.jpg', alt: { zh: '抱着一只小羊', en: 'Holding a lamb' } },
    { src: 'media/portraits/jingyi/07.jpg', alt: { zh: '草坪上拿着相机', en: 'On the lawn with a camera' } },
  ],
};

/** The faces a player puzzles: always the other one's. */
export const portraitsFor = (player: PlayerId): Portrait[] => PORTRAITS[player === 'jingyi' ? 'yifan' : 'jingyi'];

/** The next portrait to show: a different one from the last, when there is a choice. */
export function nextPortrait(list: Portrait[], current: Portrait | undefined, rnd = Math.random): Portrait {
  const others = list.filter((p) => p !== current);
  const pool = others.length ? others : list;
  return pool[Math.floor(rnd() * pool.length)];
}
