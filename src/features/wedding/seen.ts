// Whether the wedding has happened on this device. After it, the town dresses its two people as
// bride and groom and Rayford says so. Kept apart from the scene so the town can ask cheaply.
import { safeStorage } from '../../core/storage';

const store = safeStorage();
const KEY = 'yi.wedding';
export const weddingDone = (): boolean => store.getItem(KEY) !== null;
/** The day it happened (YYYY-MM-DD), or null. */
export const weddingDay = (): string | null => store.getItem(KEY);
export const markWedding = (day: string): void => { if (!weddingDone()) store.setItem(KEY, day); };
