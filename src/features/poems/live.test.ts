import { describe, expect, it } from 'vitest';
import { restorePoems } from './poems';

describe('poems: the open line and the solved ones, from the tab', () => {
  it('starts at the first line when nothing is remembered', () => { expect(restorePoems(null, 5, false)).toEqual({ i: 0, solved: [] }); });
  it('picks up the open line and the solved ones', () => { expect(restorePoems({ i: 2, solved: [0, 1] }, 5, false)).toEqual({ i: 2, solved: [0, 1] }); });
  it('drops indices outside the poems', () => { expect(restorePoems({ i: 9, solved: [1, 7, -1, 'x'] }, 5, false)).toEqual({ i: 0, solved: [1] }); });
  it('shows everything once the level is cleared', () => { expect(restorePoems({ i: 0, solved: [] }, 3, true)).toEqual({ i: 2, solved: [0, 1, 2] }); });
});
