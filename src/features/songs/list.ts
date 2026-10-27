// Our songs, in the order the owner listed them (2026-10-26). Each plays from `start` seconds
// for `length` seconds on the level, and the jukebox plays them whole. Files live in
// public/media/music/<id>.mp3 (the owner's own copies).
import type { L10n } from '../../core/i18n';

export interface Song {
  id: string; title: string; artist?: string;
  /** QQ Music song id: the level embeds the official player (`qqPlayer`) instead of a file. */
  qq?: number;
  start: number; length: number; note?: L10n;
}
export const songSrc = (s: Song): string => `media/music/${s.id}.mp3`;
/** The official QQ Music out-chain player for a song (plays from its start; title shown inside). */
export const qqPlayer = (id: number): string => `https://i.y.qq.com/n2/m/outchain/player/index.html?songid=${id}&songtype=0`;

export const SONGS: Song[] = [
  { id: 'only-you', qq: 7126044, title: '只对你有感觉', artist: '飞轮海 / 田馥甄', start: 60, length: 20 },
  { id: 'drop-tower', qq: 542574330, title: '跳楼机', artist: 'LBI利比', start: 50, length: 20 },
  { id: 'last-page', qq: 721636, title: '最后一页', artist: '江语晨', start: 60, length: 20 },
  { id: 'best-in-the-world', qq: 620077883, title: '天下第一好', artist: '李小眼', start: 60, length: 20 },
  { id: 'until-you-came', qq: 102201966, title: '直到你降临', artist: '阿肆', start: 60, length: 20 },
  { id: 'more-and-more', qq: 7121887, title: '越来越爱', artist: '飞轮海', start: 60, length: 20 },
];

/** Shuffle a copy of `xs` with `rnd`. */
export function shuffle<T>(xs: readonly T[], rnd: () => number = Math.random): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

/** Four titles to choose from: the right one and three others, in random order. */
export function choices(song: Song, all: readonly Song[] = SONGS, n = 4, rnd: () => number = Math.random): Song[] {
  const others = shuffle(all.filter((s) => s.id !== song.id), rnd).slice(0, n - 1);
  return shuffle([song, ...others], rnd);
}
