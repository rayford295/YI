import { describe, expect, it } from 'vitest';
import { dict, type Key } from '../../core/i18n';

// The ring is the surprise at the end. Nothing Rayford, the town or the sync page says before the
// last level may name it. (The ring level's own strings, ring.*, are only shown inside it.)
const BEFORE_THE_RING = /^(guide|world|sync|journey|quest|start|home|nav)\./;

describe('the ring stays a secret', () => {
  const keys = (Object.keys(dict.zh) as Key[]).filter((k) => BEFORE_THE_RING.test(k));
  it('no 戒 in Chinese', () => {
    expect(keys.filter((k) => dict.zh[k].includes('戒'))).toEqual([]);
  });
  it('no "ring" in English', () => {
    expect(keys.filter((k) => /\brings?\b/i.test(dict.en[k]))).toEqual([]);
  });
  it('nor a wedding', () => {
    const early = keys.filter((k) => !k.startsWith('guide.wed') && !k.startsWith('world.partner.wed') && k !== 'world.wedding');
    expect(early.filter((k) => /婚礼|结婚|wedding|married/i.test(dict.zh[k] + dict.en[k]))).toEqual([]);
  });
});
