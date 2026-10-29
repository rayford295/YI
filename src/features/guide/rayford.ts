// Rayford, the town's guide: Yifan in a suit, who explains the project, says where to go next
// and can walk you to that door. Everything he says is written here in advance (no model, no
// server); the town page turns his choices into talk-box buttons. Pure, so it can be tested.
import { t, type Key } from '../../core/i18n';
import { LEVELS, levelNumber, type PlayerId } from '../../core/quest';
import { BUILDINGS, PORTAL_SPOT, type Point } from '../world/town';

export type Topic = 'hello' | 'about' | 'next' | 'levels' | 'town' | 'me';

/** What a button does: open another topic, walk the player somewhere, or close the talk box. */
export type Choice =
  | { label: string; to: Topic }
  | { label: string; walkTo: Point }
  | { label: string; go: string }
  | { label: string; close: true };

export interface Line { text: string; choices: Choice[] }

export interface GuideState {
  player: PlayerId;
  other: PlayerId;
  name(p: PlayerId): string;
  cleared(level: string, p: PlayerId): boolean;
  /** The wedding has happened on this device (only then may he say what the suit was for). */
  wed?: boolean;
}

const doorOf = (level: string): Point => BUILDINGS.find((b) => b.level === level)!.door;
const hintKey = (level: string) => `guide.hint.${level}` as Key;
const back = (): Choice => ({ label: t('guide.back'), to: 'hello' });
const bye = (): Choice => ({ label: t('guide.bye'), close: true });

export function rayfordSays(topic: Topic, s: GuideState): Line {
  const me = s.name(s.player), them = s.name(s.other);
  const next = LEVELS.find((l) => !s.cleared(l.id, s.player));
  switch (topic) {
    case 'hello':
      return {
        text: t('guide.hello', { name: me }),
        choices: [
          { label: t('guide.ask.next'), to: 'next' },
          { label: t('guide.ask.about'), to: 'about' },
          { label: t('guide.ask.levels'), to: 'levels' },
          { label: t('guide.ask.town'), to: 'town' },
          { label: t('guide.ask.me'), to: 'me' },
          { label: t('guide.ask.birthday'), go: '/birthday' },
          bye(),
        ],
      };
    case 'about':
      return { text: t('guide.about', { total: LEVELS.length }), choices: [{ label: t('guide.ask.next'), to: 'next' }, back()] };
    case 'me':
      return { text: t('guide.me'), choices: [back()] };
    case 'town':
      return { text: t('guide.town', { other: them }), choices: [back()] };
    case 'levels': {
      const list = LEVELS.map((l) => `<li${s.cleared(l.id, s.player) ? ' class="done"' : ''}>${levelNumber(l.id)} · ${t(l.title)}</li>`).join('');
      const done = LEVELS.filter((l) => s.cleared(l.id, s.player)).length;
      return { text: `${t('guide.levels', { done, total: LEVELS.length })}<ol class="guide-levels">${list}</ol>`, choices: [{ label: t('guide.ask.next'), to: 'next' }, back()] };
    }
    case 'next': {
      if (next) {
        return {
          text: t('guide.next', { n: levelNumber(next.id), title: t(next.title), hint: t(hintKey(next.id), { other: them }) }),
          choices: [{ label: t('guide.take'), walkTo: doorOf(next.id) }, back()],
        };
      }
      if (s.wed) return { text: t(s.player === 'jingyi' ? 'guide.wed' : 'guide.wed.yifan'), choices: [{ label: t('world.wedding'), go: '/wedding' }, back(), bye()] };
      if (!s.cleared('ring', s.other)) return { text: t('guide.wait', { other: them }), choices: [back(), bye()] };
      return { text: t('guide.portal'), choices: [{ label: t('guide.take'), walkTo: { x: PORTAL_SPOT.x, y: PORTAL_SPOT.y + 1 } }, back(), bye()] };
    }
  }
}
