// A level opens only through its door in the town (owner, 2026-10-26: "每一关结束，必须出房子，再走到
// 下一个房子才行"). The town records which door was just opened; the router refuses a level route
// that was not reached that way and sends the player back to the town. The record lives for the
// tab (sessionStorage), so reloading inside a level keeps you there, and is cleared whenever the
// town renders, so the next level again needs a walk to its door.
const KEY = 'yi.door';
const store = (): Storage | null => { try { return typeof sessionStorage === 'undefined' ? null : sessionStorage; } catch { return null; } };

export function openDoor(route: string): void { store()?.setItem(KEY, route); }
export function enteredThrough(route: string): boolean { return store()?.getItem(KEY) === route; }
export function closeDoors(): void { store()?.removeItem(KEY); }
