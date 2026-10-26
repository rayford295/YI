import { describe, expect, it } from 'vitest';
import { NOTES, notesFor } from './notes';

describe('voice notes', () => {
  it('keeps every note under media/voice/notes with a date', () => {
    for (const n of NOTES) { expect(n.src.startsWith('media/voice/notes/')).toBe(true); expect(n.date).toMatch(/^\d{4}-\d{2}-\d{2}$/); expect(n.seconds).toBeGreaterThan(0); }
  });
  it('hands each player the other one\'s notes, newest first', () => {
    const all = [
      { src: 'media/voice/notes/a.m4a', from: 'jingyi', date: '2026-10-13', seconds: 3 },
      { src: 'media/voice/notes/b.m4a', from: 'jingyi', date: '2026-10-25', seconds: 39 },
      { src: 'media/voice/notes/c.m4a', from: 'yifan', date: '2026-10-20', seconds: 5 },
    ] as const;
    NOTES.splice(0, NOTES.length, ...all);
    expect(notesFor('yifan').map((n) => n.date)).toEqual(['2026-10-25', '2026-10-13']);
    expect(notesFor('jingyi').map((n) => n.src)).toEqual(['media/voice/notes/c.m4a']);
    expect(notesFor('yifan', 1)).toHaveLength(1);
    NOTES.splice(0, NOTES.length);
  });
});
