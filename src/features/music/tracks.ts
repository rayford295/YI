// The jukebox's playlist: the same six songs as the Songs level, played whole through the official
// YouTube embed (the owner chose not to host files). A song without a YouTube id is left out.
import { SONGS } from '../songs/list';

export interface Track { yt: string; title: string; artist?: string }

export const TRACKS: Track[] = SONGS.flatMap((s) => (s.yt ? [{ yt: s.yt, title: s.title, artist: s.artist }] : []));

/** The track after `i`, wrapping; the same one when there is only one. */
export const nextIndex = (i: number, n: number): number => (n <= 0 ? 0 : (i + 1) % n);
