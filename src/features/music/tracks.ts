// The jukebox's playlist: the same six songs as the Songs level, played whole. Drop the files in
// public/media/music/<id>.mp3 (see the folder README); a track whose file is missing is skipped,
// and the jukebox turns itself off when none plays.
import { SONGS, songSrc } from '../songs/list';

export interface Track { src: string; title: string; artist?: string }

export const TRACKS: Track[] = SONGS.map((s) => ({ src: songSrc(s), title: s.title, artist: s.artist }));

/** The track after `i`, wrapping; the same one when there is only one. */
export const nextIndex = (i: number, n: number): number => (n <= 0 ? 0 : (i + 1) % n);
