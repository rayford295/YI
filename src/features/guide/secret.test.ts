import { describe, expect, it } from 'vitest';
import { dict, type Key } from '../../core/i18n';

// The ring is the surprise at the end. Nothing Rayford, the town or the sync page says before the
// last level may name it. (The ring level's own strings, ring.*, are only shown inside it.)
// Everything except the ring page itself, the wedding and the epilogue (shown after the ring).
const AFTER_THE_RING = /^(ring\.|letter\.|guide\.wed|world\.wedding|world\.partner\.wed|world\.portal)/;
// The one allowed mention: Jingyi's own joke on the Shenzhen Bay stop, which is about a flat, not a ring.
const ALLOWED = new Set<Key>(['sz.story.bay']);

describe('the ring stays a secret', () => {
  const keys = (Object.keys(dict.zh) as Key[]).filter((k) => !AFTER_THE_RING.test(k) && !ALLOWED.has(k));
  it('no 戒 in Chinese', () => {
    expect(keys.filter((k) => dict.zh[k].includes('戒'))).toEqual([]);
  });
  it('no "ring" in English', () => {
    expect(keys.filter((k) => /\brings?\b/i.test(dict.en[k]))).toEqual([]);
  });
  it('nor a wedding or a proposal', () => {
    expect(keys.filter((k) => /婚|嫁|娶|求婚|wedding|marr|propos|bride|groom/i.test(dict.zh[k] + dict.en[k]))).toEqual([]);
  });
});
