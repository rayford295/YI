// Whether a player has watched the birthday prologue on this device. Kept apart from the scene so
// the router can ask without loading it.
import type { PlayerId } from '../../core/quest';
import { safeStorage } from '../../core/storage';

const store = safeStorage();
const key = (p: PlayerId) => `yi.birthday.${p}`;
export const birthdaySeen = (p: PlayerId): boolean => store.getItem(key(p)) === '1';
export const markBirthdaySeen = (p: PlayerId): void => store.setItem(key(p), '1');
