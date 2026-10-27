// Strokes are stored in unit coordinates (0..1 of the canvas width/height), so a drawing
// survives resizing, rotating the phone and re-rendering the page.
export type Point = [x: number, y: number];
export interface Stroke { color: string; size: number; erase: boolean; points: Point[] }

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export function toUnit(clientX: number, clientY: number, rect: Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>): Point {
  if (rect.width <= 0 || rect.height <= 0) return [0, 0];
  return [clamp01((clientX - rect.left) / rect.width), clamp01((clientY - rect.top) / rect.height)];
}

/** Paints every stroke; `size` is a fraction of the canvas width. */
export function paint(ctx: CanvasRenderingContext2D, strokes: readonly Stroke[], width: number, height: number): void {
  ctx.clearRect(0, 0, width, height);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const s of strokes) {
    if (s.points.length === 0) continue;
    ctx.globalCompositeOperation = s.erase ? 'destination-out' : 'source-over';
    ctx.strokeStyle = ctx.fillStyle = s.color;
    ctx.lineWidth = s.size * width;
    const [x0, y0] = s.points[0];
    if (s.points.length === 1) {
      ctx.beginPath();
      ctx.arc(x0 * width, y0 * height, ctx.lineWidth / 2, 0, Math.PI * 2);
      ctx.fill();
      continue;
    }
    ctx.beginPath();
    ctx.moveTo(x0 * width, y0 * height);
    for (const [x, y] of s.points.slice(1)) ctx.lineTo(x * width, y * height);
    ctx.stroke();
  }
  ctx.globalCompositeOperation = 'source-over';
}
