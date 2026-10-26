// Photos: a shutter for the try-on view, and the two-up "together" card for a couple apart.
// Everything is drawn on a canvas in the browser; nothing is uploaded.

const NAVY = '#102e49';
const GOLD = '#d3a557';
const CREAM = '#f1e4c8';
const HAND = "'Ma Shan Zheng', 'Kaiti SC', cursive";
const SERIF = "'Cormorant Garamond', Georgia, serif";

export interface Caption { title: string; line: string }

/** Freeze the try-on view: webcam frame + ring layer, mirrored if the stage is, with a small caption. */
export function captureTryOn(video: HTMLVideoElement, rings: HTMLCanvasElement, mirrored: boolean, caption: Caption): HTMLCanvasElement {
  const w = video.videoWidth, h = video.videoHeight;
  const out = document.createElement('canvas');
  out.width = w; out.height = h;
  const ctx = out.getContext('2d')!;
  if (mirrored) { ctx.translate(w, 0); ctx.scale(-1, 1); }
  ctx.drawImage(video, 0, 0, w, h);
  ctx.drawImage(rings, 0, 0, w, h);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const s = h / 720;
  ctx.fillStyle = 'rgba(16, 46, 73, 0.55)';
  ctx.fillRect(0, h - 64 * s, w, 64 * s);
  ctx.fillStyle = GOLD;
  ctx.font = `${26 * s}px ${HAND}`;
  ctx.textBaseline = 'middle';
  ctx.fillText(caption.title, 24 * s, h - 32 * s);
  ctx.fillStyle = CREAM;
  ctx.font = `italic ${18 * s}px ${SERIF}`;
  ctx.textAlign = 'right';
  ctx.fillText(caption.line, w - 24 * s, h - 32 * s);
  return out;
}

/** Draw `img` into the rect, cropped like CSS object-fit: cover, anchored slightly above centre. */
function cover(ctx: CanvasRenderingContext2D, img: CanvasImageSource & { width: number; height: number }, x: number, y: number, w: number, h: number): void {
  const iw = 'naturalWidth' in img ? (img as HTMLImageElement).naturalWidth : img.width;
  const ih = 'naturalHeight' in img ? (img as HTMLImageElement).naturalHeight : img.height;
  const k = Math.max(w / iw, h / ih);
  const sw = w / k, sh = h / k;
  ctx.drawImage(img, (iw - sw) / 2, (ih - sh) * 0.4, sw, sh, x, y, w, h);
}

export interface TogetherText { title: string; left: string; right: string; line: string }

/** Two photos side by side, joined by one gold meridian, with a caption band. */
export function composeTogether(left: HTMLImageElement, right: HTMLImageElement, text: TogetherText): HTMLCanvasElement {
  const W = 1800, H = 1200, band = 170, gutter = 6;
  const out = document.createElement('canvas');
  out.width = W; out.height = H;
  const ctx = out.getContext('2d')!;
  ctx.fillStyle = NAVY;
  ctx.fillRect(0, 0, W, H);
  const half = (W - gutter) / 2, ph = H - band;
  cover(ctx, left, 0, 0, half, ph);
  cover(ctx, right, half + gutter, 0, half, ph);
  // the meridian: one gold line through both halves and the caption band
  ctx.fillStyle = GOLD;
  ctx.fillRect(half, 0, gutter, H);
  ctx.beginPath();
  ctx.arc(W / 2, ph, 22, 0, Math.PI * 2);
  ctx.fillStyle = NAVY; ctx.fill();
  ctx.lineWidth = 5; ctx.strokeStyle = GOLD; ctx.stroke();
  ctx.beginPath(); ctx.arc(W / 2, ph, 7, 0, Math.PI * 2); ctx.fillStyle = '#2d57c9'; ctx.fill();   // the hidden sapphire
  // caption band
  ctx.textBaseline = 'middle';
  ctx.fillStyle = CREAM;
  ctx.font = `44px ${HAND}`;
  ctx.textAlign = 'center';
  ctx.fillText(text.left, W / 4, ph + band * 0.5);       // each name under its own photo
  ctx.fillText(text.right, (3 * W) / 4, ph + band * 0.5);
  ctx.fillStyle = GOLD;
  ctx.font = `34px ${HAND}`;
  ctx.fillText(text.title, W / 2, ph + band * 0.42 - 2);
  ctx.fillStyle = 'rgba(241, 228, 200, 0.75)';
  ctx.font = `italic 26px ${SERIF}`;
  ctx.fillText(text.line, W / 2, ph + band * 0.78);
  return out;
}

export const loadImage = (file: File): Promise<HTMLImageElement> => new Promise((resolve, reject) => {
  const img = new Image();
  img.onload = () => { URL.revokeObjectURL(img.src); resolve(img); };
  img.onerror = reject;
  img.src = URL.createObjectURL(file);
});

export function download(canvas: HTMLCanvasElement, name: string): void {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: name });
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 10_000);
  }, 'image/png');
}
