export type LatLng = [number, number];

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

/** Shift the Americas east of the date line so the map centres on the Pacific between us. */
export function pacificLng(lng: number): number {
  return lng < -30 ? lng + 360 : lng;
}

function toVec([lat, lng]: LatLng): [number, number, number] {
  const la = rad(lat), lo = rad(lng);
  return [Math.cos(la) * Math.cos(lo), Math.cos(la) * Math.sin(lo), Math.sin(la)];
}

/** Points along the great circle from a to b, with longitudes unwrapped so the line never jumps. */
export function greatCircle(a: LatLng, b: LatLng, n = 64): LatLng[] {
  const v1 = toVec(a), v2 = toVec(b);
  const dot = Math.min(1, Math.max(-1, v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2]));
  const omega = Math.acos(dot);
  if (omega < 1e-9) return [a, b];
  const pts: LatLng[] = [];
  let prev = a[1];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const s1 = Math.sin((1 - t) * omega) / Math.sin(omega);
    const s2 = Math.sin(t * omega) / Math.sin(omega);
    const x = s1 * v1[0] + s2 * v2[0], y = s1 * v1[1] + s2 * v2[1], z = s1 * v1[2] + s2 * v2[2];
    let lng = deg(Math.atan2(y, x));
    while (lng - prev > 180) lng -= 360;
    while (lng - prev < -180) lng += 360;
    pts.push([deg(Math.atan2(z, Math.hypot(x, y))), lng]);
    prev = lng;
  }
  return pts;
}
