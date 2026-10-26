// The jukebox's playlist. Drop the files in public/media/music/ and list them here; the jukebox
// hides itself while this is empty. Keep to songs you may share privately (see the folder README).
export interface Track { src: string; title: string; artist?: string }

export const TRACKS: Track[] = [
  // { src: 'media/music/example.mp3', title: '歌名', artist: '歌手' },
];

/** The track after `i`, wrapping; the same one when there is only one. */
export const nextIndex = (i: number, n: number): number => (n <= 0 ? 0 : (i + 1) % n);
