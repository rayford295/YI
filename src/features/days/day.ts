// A day in someone's city: the shape shared by Yifan's College Station and Jingyi's Shenzhen.
// Pure data and one rule (`stopAt`); the pages are drawn by render.ts from a `Day`.
import type { PlayerId } from '../../core/quest';
import type { Building, Point, TownMap } from '../world/town';
import type { CatId } from '../world/sprites';

export interface Stop extends Building {
  /** Hours of the day (local, 0–24) when the person is here; several windows allowed. */
  hours: [number, number][];
}

export interface Day {
  /** Route segment and i18n prefix: `cs` or `sz`. */
  id: 'cs' | 'sz';
  /** Whose day it is; the other player sees them standing where the clock puts them. */
  person: PlayerId;
  /** IANA zone the day's clock runs in. */
  zone: string;
  grid: readonly string[];
  /** In the order of the day; the roof numbers follow it. */
  stops: Stop[];
  map: TownMap;
  /** Where a visitor appears. */
  spawn: Point;
  /** Cats that live on this map and where they sit. */
  cats?: { id: CatId; at: Point }[];
}

/** The stop the person is at for a time of day given as a decimal hour (14.5 = 14:30). */
export function stopAt(day: Day, hour: number): Stop {
  const h = ((hour % 24) + 24) % 24;
  return day.stops.find((s) => s.hours.some(([a, b]) => h >= a && h < b)) ?? day.stops[0];
}
