// The sky over one place at one instant: stars, planets and the Moon in horizontal coordinates,
// projected onto a disc (zenith at the centre, horizon at the rim, north up, east on the left as
// when you lie on your back and look up).
import { Body, Equator, Horizon, Illumination, MoonPhase, Observer, type AstroTime, MakeTime } from 'astronomy-engine';
import { STARS, type Star } from './catalog';

export interface SkyPoint { id: string; x: number; y: number; mag: number; kind: 'star' | 'planet' | 'moon'; alt: number }
export interface Sky { points: SkyPoint[]; moonPhase: number; moonLit: number }

export const R = 1; // disc radius in projection units

/** Azimuthal equidistant projection of (altitude, azimuth) in degrees onto the unit disc. */
export function project(alt: number, az: number): { x: number; y: number } {
  const r = (90 - alt) / 90;
  const a = (az * Math.PI) / 180;
  // North (az 0) up, East (az 90) to the LEFT: we are looking up, not down at a map.
  return { x: -r * Math.sin(a), y: -r * Math.cos(a) };
}

const PLANETS: readonly [Body, string][] = [[Body.Venus, 'Venus'], [Body.Mars, 'Mars'], [Body.Jupiter, 'Jupiter'], [Body.Saturn, 'Saturn']];

export function computeSky(date: Date, lat: number, lng: number): Sky {
  const obs = new Observer(lat, lng, 0);
  const time: AstroTime = MakeTime(date);
  const points: SkyPoint[] = [];
  const push = (id: string, ra: number, dec: number, mag: number, kind: SkyPoint['kind']) => {
    const h = Horizon(time, obs, ra, dec, 'normal');
    if (h.altitude < -1) return;
    const { x, y } = project(h.altitude, h.azimuth);
    points.push({ id, x, y, mag, kind, alt: h.altitude });
  };
  for (const [id, ra, dec, mag] of STARS as readonly Star[]) push(id, ra, dec, mag, 'star');
  for (const [body, id] of PLANETS) {
    const eq = Equator(body, time, obs, true, true);
    push(id, eq.ra, eq.dec, Illumination(body, time).mag, 'planet');
  }
  const moon = Equator(Body.Moon, time, obs, true, true);
  push('Moon', moon.ra, moon.dec, -10, 'moon');
  const moonInfo = Illumination(Body.Moon, time);
  return { points, moonPhase: MoonPhase(time), moonLit: moonInfo.phase_fraction };
}
