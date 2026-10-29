import { describe, expect, it } from 'vitest';
import { restoreOrder } from './moments';
import { sortedMemories } from './memories';

const list = sortedMemories();
describe('moments: the days being ordered, from the tab', () => {
  it('starts afresh when nothing is remembered', () => { expect(restoreOrder(null, list)).toBeNull(); });
  it('keeps the arrangement and whether it was checked', () => {
    const ids = list.slice(0, 5).reverse().map((m) => m.id);
    const r = restoreOrder({ ids, ordered: true }, list);
    expect(r?.order.map((m) => m.id)).toEqual(ids);
    expect(r?.ordered).toBe(true);
  });
  it('starts afresh when a day is unknown or repeated', () => {
    const ids = list.slice(0, 5).map((m) => m.id);
    expect(restoreOrder({ ids: [...ids.slice(0, 4), 'nope'] }, list)).toBeNull();
    expect(restoreOrder({ ids: [...ids.slice(0, 4), ids[0]] }, list)).toBeNull();
  });
});
