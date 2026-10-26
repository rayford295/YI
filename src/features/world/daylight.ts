// The time of day in the town follows the clock where the player lives (Shenzhen for Jingyi,
// College Station for Yifan), so the two of us see the same town under different skies. Pure
// rules: an hour in, a tint out.
export type Phase = 'dawn' | 'day' | 'dusk' | 'night';
export interface Tint { color: string; alpha: number; lights: boolean }

export function phaseAt(hour: number): Phase {
  if (hour >= 6 && hour < 7) return 'dawn';
  if (hour >= 7 && hour < 17) return 'day';
  if (hour >= 17 && hour < 19) return 'dusk';
  return 'night';
}

/** The wash painted over the whole map; `lights` turns the house windows warm. */
export function tintFor(phase: Phase): Tint | undefined {
  switch (phase) {
    case 'dawn': return { color: '#f6b18a', alpha: 0.12, lights: true };
    case 'dusk': return { color: '#e8893f', alpha: 0.16, lights: true };
    case 'night': return { color: '#102e49', alpha: 0.42, lights: true };
    default: return undefined;
  }
}
