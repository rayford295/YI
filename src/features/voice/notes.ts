// Voice notes kept in the mailbox by the fountain: the little recordings we send each other.
// Drop the files in public/media/voice/notes/ and list them here, newest first.
import type { PlayerId } from '../../core/quest';

export interface Note { src: string; from: PlayerId; date: string; seconds: number }

export const NOTES: Note[] = [
  // { src: 'media/voice/notes/2026-10-25.m4a', from: 'jingyi', date: '2026-10-25', seconds: 39 },
];

/** Notes addressed to `player`: the ones the other one sent, newest first, at most `limit`. */
export const notesFor = (player: PlayerId, limit = 8): Note[] =>
  NOTES.filter((n) => n.from !== player).sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, limit);
