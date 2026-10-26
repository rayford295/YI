// The reveal before the ring: black, a rose drawing itself in, then the ring surfacing out of the
// dark, then the page. Plays once when the level is first reached; "watch again" replays it.
import './intro.css';
import { t } from '../../core/i18n';
import { prefersReducedMotion } from '../../core/motion';

// A stylised rose: spiral heart, three rings of petals, stem and two leaves. viewBox 0 0 200 260.
const ROSE = {
  heart: 'M101 96 c-3 -5 -10 -3 -9 3 c1 7 11 8 15 2 c5 -8 -4 -18 -13 -14 c-12 5 -11 23 2 27 c17 5 30 -11 22 -26 c-10 -18 -38 -14 -42 7 c-4 24 21 38 41 28',
  petals: [
    'M70 100 c-16 22 4 54 32 52 c26 -2 42 -30 30 -54',
    'M60 88 c-26 20 -14 72 26 76 c42 4 64 -36 48 -70',
    'M132 76 c30 20 26 70 -14 84 c-40 14 -78 -10 -72 -50',
    'M48 118 c-10 30 20 62 54 56 c34 -6 50 -42 36 -70',
    'M150 110 c16 26 -4 66 -40 70 c-38 4 -66 -22 -62 -58',
  ],
  stem: 'M100 190 c-2 22 2 44 0 66',
  leafL: 'M99 222 c-20 -2 -34 -14 -40 -30 c18 -2 34 10 40 30 z',
  leafR: 'M101 236 c20 -2 34 -14 40 -30 c-18 -2 -34 10 -40 30 z',
};

function roseSvg(): string {
  const path = (d: string, cls: string, i: number) => `<path class="${cls}" d="${d}" pathLength="1" style="--i:${i}"/>`;
  return `<svg class="intro-rose" viewBox="0 0 200 260" aria-hidden="true">
    ${path(ROSE.stem, 'stem', 6)}${path(ROSE.leafL, 'leaf', 7)}${path(ROSE.leafR, 'leaf', 8)}
    ${ROSE.petals.map((d, i) => path(d, 'petal', 5 - i)).join('')}
    ${path(ROSE.heart, 'heart', 0)}
  </svg>`;
}

const wait = (ms: number, signal: AbortSignal) => new Promise<void>((res) => {
  const id = setTimeout(res, ms);
  signal.addEventListener('abort', () => { clearTimeout(id); res(); }, { once: true });
});

/**
 * Play the reveal around `stage` (the ring's 3D card). Resolves when the page is fully visible.
 * The stage itself is lifted above the black veil for the ring step, so the real, already
 * loading model is what surfaces; nothing is faked.
 */
export async function playIntro(stage: HTMLElement): Promise<void> {
  if (prefersReducedMotion()) return;
  const veil = document.createElement('div');
  veil.className = 'ring-intro';
  veil.innerHTML = `${roseSvg()}<p class="intro-line" hidden>${t('ring.eyebrow')}</p>
    <button type="button" class="intro-skip">${t('ring.intro.skip')}</button>`;
  document.body.appendChild(veil);
  document.body.classList.add('ring-intro-on');
  const ctl = new AbortController();
  veil.querySelector('.intro-skip')!.addEventListener('click', () => ctl.abort());
  const step = async (cls: string, ms: number) => { if (ctl.signal.aborted) return; veil.classList.add(cls); await wait(ms, ctl.signal); };

  stage.scrollIntoView({ block: 'center', behavior: 'instant' as ScrollBehavior });
  await step('in', 900);           // black
  await step('rose', 4200);        // the rose draws itself
  await step('bloom', 2400);       // ...and takes colour
  await step('rose-out', 900);     // fades
  veil.querySelector<HTMLElement>('.intro-line')!.hidden = false;
  stage.classList.add('intro-lift');
  await step('step-ring', 3800);   // the ring surfaces above the veil, turning ('ring' alone would match the page's .ring rules)
  await step('out', 1200);         // the veil thins and the page is there

  stage.classList.remove('intro-lift');
  document.body.classList.remove('ring-intro-on');
  veil.remove();
}
