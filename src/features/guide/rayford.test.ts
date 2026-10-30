import { describe, expect, it } from 'vitest';
import { LEVELS } from '../../core/quest';
import { BUILDINGS } from '../world/town';
import { rayfordSays, type GuideState, type Topic } from './rayford';

const state = (mine: string[], theirs: string[] = []): GuideState => ({
  player: 'jingyi', other: 'yifan',
  name: (p) => (p === 'jingyi' ? 'Jingyi' : 'Yifan'),
  cleared: (id, p) => (p === 'jingyi' ? mine : theirs).includes(id),
});

describe('Rayford', () => {
  it('opens with a menu whose every topic answers and leads somewhere', () => {
    const hello = rayfordSays('hello', state([]));
    const topics = hello.choices.flatMap((c) => ('to' in c ? [c.to] : []));
    expect(topics.length).toBeGreaterThanOrEqual(5);
    for (const tp of topics as Topic[]) {
      const line = rayfordSays(tp, state([]));
      expect(line.text).not.toMatch(/\{\w+\}|guide\./);
      expect(line.choices.length).toBeGreaterThan(0);
    }
  });

  it('sends a new player to the first door and walks them there', () => {
    const line = rayfordSays('next', state([]));
    const walk = line.choices.find((c) => 'walkTo' in c);
    expect(walk && 'walkTo' in walk ? walk.walkTo : null).toEqual(BUILDINGS.find((b) => b.level === LEVELS[0].id)!.door);
  });

  it('has a hint for every level and points at the first one not cleared', () => {
    for (let i = 0; i < LEVELS.length; i++) {
      const line = rayfordSays('next', state(LEVELS.slice(0, i).map((l) => l.id)));
      expect(line.text).not.toMatch(/\{\w+\}|guide\.hint/);
      const walk = line.choices.find((c) => 'walkTo' in c)!;
      expect('walkTo' in walk && walk.walkTo).toEqual(BUILDINGS.find((b) => b.level === LEVELS[i].id)!.door);
    }
  });

  it('after the ring, points to the portal whether or not the other one has arrived', () => {
    const all = LEVELS.map((l) => l.id);
    const alone = rayfordSays('next', state(all, []));
    const both = rayfordSays('next', state(all, all));
    expect(alone.choices.some((c) => 'walkTo' in c)).toBe(true);
    expect(alone.text).toBe(both.text);
  });
});

describe('Rayford after the wedding', () => {
  it('congratulates and offers the wedding again; before it, never mentions it', () => {
    const all = LEVELS.map((l) => l.id);
    const wed = rayfordSays('next', { ...state(all, all), wed: true });
    expect(wed.choices.some((c) => 'go' in c && c.go === '/wedding')).toBe(true);
    const before = rayfordSays('next', state(all, all));
    expect(before.choices.some((c) => 'go' in c && c.go === '/wedding')).toBe(false);
  });
});
