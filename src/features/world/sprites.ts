// Pixel sprites, drawn in code so the repo carries no licensed art. One char per pixel; '.' is clear.
// Each character is 12 px wide and 16 px tall: a 12-row body per facing plus 4 rows of legs shared
// between facings, so a walk is the same leg frames under a different body.

export type Dir = 'down' | 'up' | 'left' | 'right';
export type Palette = Record<string, string>;
export interface Figure { palette: Palette; body: Record<'down' | 'up' | 'side', string[]>; legs: { front: string[][]; side: string[][] } }

const skin = '#f6d9c4', eye = '#2b1b1b', cheek = '#f1a3a3';

export const JINGYI: Figure = {
  palette: { h: '#4a2c1e', s: skin, e: eye, c: cheek, t: '#f4efe8', u: '#e4d9cb', p: '#d4506d', b: '#5a3b2e', w: '#fff6dc' },
  body: {
    down: [
      '....hhhh....',
      '..hhhhhhhh..',
      '.hhhhhhhhhh.',
      '.hhhsssshhhw',
      '.hssssssssh.',
      '.hsessssesh.',
      '.hscsssscsh.',
      '..hssssssh..',
      '....tttt....',
      '...tttttt...',
      '..sttttttts.',
      '...uuuuuu...',
    ],
    up: [
      '....hhhh....',
      '..hhhhhhhh..',
      '.hhhhhhhhhh.',
      '.hhhhhhhhhw.',
      '.hhhhhhhhhh.',
      '.hhhhhhhhhh.',
      '.hhhhhhhhhh.',
      '..hhhhhhhh..',
      '....tttt....',
      '...tttttt...',
      '..sttttttts.',
      '...uuuuuu...',
    ],
    side: [
      '....hhhh....',
      '...hhhhhhh..',
      '..hhhhhhhh..',
      '..hhhhhsss..',
      '.whhhhssss..',
      '.whhhhsess..',
      '..hhhhscss..',
      '...hhsssss..',
      '....tttt....',
      '...tttttt...',
      '...ttttts...',
      '...uuuuuu...',
    ],
  },
  legs: {
    front: [
      ['...pp..pp...', '...pp..pp...', '...bb..bb...', '............'],
      ['..pp....pp..', '..pp....pp..', '..bb....bb..', '............'],
    ],
    side: [
      ['....pp.pp...', '....pp.pp...', '....bb.bb...', '............'],
      ['...pp...pp..', '...pp...pp..', '...bb...bb..', '............'],
    ],
  },
};

export const YIFAN: Figure = {
  palette: { h: '#2b1a14', s: skin, e: eye, c: cheek, t: '#b8323d', u: '#e9b949', p: '#2c2340', b: '#1b1b1b' },
  body: {
    down: [
      '...hhhhhh...',
      '..hhhhhhhh..',
      '.hhhhhhhhhh.',
      '.hhhsshhshh.',
      '.hssssssssh.',
      '.hsessssesh.',
      '..scsssscs..',
      '...ssssss...',
      '..tuuuuuut..',
      '..tttttttt..',
      '..sttttttts.',
      '...tuttut...',
    ],
    up: [
      '...hhhhhh...',
      '..hhhhhhhh..',
      '.hhhhhhhhhh.',
      '.hhhhhhhhhh.',
      '.hhhhhhhhhh.',
      '.hhhhhhhhhh.',
      '..hhhhhhhh..',
      '...ssssss...',
      '..tttttttt..',
      '..tttttttt..',
      '..sttttttts.',
      '...tttttt...',
    ],
    side: [
      '....hhhhh...',
      '...hhhhhhh..',
      '..hhhhhhhh..',
      '..hhhhhhss..',
      '..hhhhssss..',
      '..hhhhsess..',
      '..hhhhscss..',
      '...hhsssss..',
      '....tutt....',
      '...ttuutt...',
      '...ttttts...',
      '...tttttt...',
    ],
  },
  legs: JINGYI.legs,
};

// Rayford, the guide: Yifan in a suit. Same face and hair, a navy jacket over a white shirt and
// his red as the tie, so he reads as "the other me" rather than a stranger.
export const RAYFORD: Figure = {
  palette: { ...YIFAN.palette, j: '#273047', w: '#f4f1ea', k: '#b8323d', p: '#1d2233' },
  body: {
    down: [...YIFAN.body.down.slice(0, 8),
      '..jjwkkwjj..',
      '..jjjwkjjj..',
      '..sjjjkjjjs.',
      '...jjjjjj...',
    ],
    up: [...YIFAN.body.up.slice(0, 8),
      '..jjjjjjjj..',
      '..jjjjjjjj..',
      '..sjjjjjjjs.',
      '...jjjjjj...',
    ],
    side: [...YIFAN.body.side.slice(0, 8),
      '....jwjj....',
      '...jjwkjj...',
      '...jjjjjs...',
      '...jjjjjj...',
    ],
  },
  legs: JINGYI.legs,
};

// The two cats, drawn after the real ones: Coffee, a seal-point Ragdoll (cream fluff, a dark
// mask around blue eyes, dark ears and tail), and Duoduo, a bicolour Ragdoll (white, a tan cap
// over the ears, a tan saddle on the back, a white blaze and a pink nose). One facing, two frames
// (a tail flick). Twelve wide so they sit on one tile like everyone else.
export type CatId = 'coffee' | 'duoduo';
export interface Cat { palette: Palette; frames: string[][] }
export const COFFEE: Cat = {
  palette: { c: '#f1e6d2', b: '#4b3528', m: '#8d6d55', e: '#5da4dc', n: '#2a1b16' },
  frames: [
    [
      '............',
      '............',
      '............',
      '..b......b..',
      '..bb....bb..',
      '.cbccccccbc.',
      '.cccccccccc.',
      '.ccmbccbmcc.',
      '.cbebccbebc.',
      '.cbbbnbbbbc.',
      '.ccbbbbbbcc.',
      '.cccccccccc.',
      'cccccccccccb',
      '.cccccccccb.',
      '..cc.cc.cc..',
      '............',
    ],
    [
      '............',
      '............',
      '............',
      '..b......b..',
      '..bb....bb..',
      '.cbccccccbc.',
      '.cccccccccc.',
      '.ccmbccbmcc.',
      '.cbebccbebc.',
      '.cbbbnbbbbc.',
      '.ccbbbbbbcc.',
      '.ccccccccccb',
      'ccccccccccc.',
      '.ccccccccc..',
      '..cc.cc.cc..',
      '............',
    ],
  ],
};
export const DUODUO: Cat = {
  palette: { w: '#fbfaf7', t: '#a98464', e: '#5da4dc', n: '#e3929d' },
  frames: [
    [
      '............',
      '............',
      '............',
      '..t......t..',
      '..tt....tt..',
      '..ttwwwwtt..',
      '..twwwwwwt..',
      '..wwwwwwww..',
      '..wewwwwew..',
      '..wwwnwwww..',
      '..wwwwwwww..',
      '.wwwttttwww.',
      '.wwtttttttww',
      '.wwwwtttwwt.',
      '..ww.ww.ww..',
      '............',
    ],
    [
      '............',
      '............',
      '............',
      '..t......t..',
      '..tt....tt..',
      '..ttwwwwtt..',
      '..twwwwwwt..',
      '..wwwwwwww..',
      '..wewwwwew..',
      '..wwwnwwww..',
      '..wwwwwwww..',
      '.wwwttttwww.',
      '.wwtttttttw.',
      '.wwwwtttwwtt',
      '..ww.ww.ww..',
      '............',
    ],
  ],
};
export const CATS: Record<CatId, Cat> = { coffee: COFFEE, duoduo: DUODUO };

// A wooden signpost with an arrow pointing east, where the road out of town would be.
export const SIGN_PALETTE: Palette = { w: '#8a5a32', d: '#5a3a1e', c: '#f4e9d6', n: '#102e49' };
export const SIGN: string[] = [
  '............',
  '............',
  '............',
  '.wwwwwwwwww.',
  '.wccccccccwd',
  '.wcnnncncnwd',
  '.wccccccccwd',
  '.wwwwwwwwwwd',
  '..dddddddddd',
  '.....ww.....',
  '.....wwd....',
  '.....wwd....',
  '.....wwd....',
  '.....wwd....',
  '....dwwdd...',
  '............',
];
// A red mailbox on a post, where the voice notes wait.
export const MAILBOX_PALETTE: Palette = { r: '#c74b5f', d: '#7a2a3a', c: '#f4e9d6', p: '#5a3a1e', n: '#102e49' };
export const MAILBOX: string[] = [
  '............',
  '............',
  '............',
  '...ddddddd..',
  '..drrrrrrrd.',
  '..drcccccrd.',
  '..drrnnnrrd.',
  '..drrrrrrrd.',
  '..ddddddddd.',
  '.....pp.....',
  '.....pp.....',
  '.....pp.....',
  '.....pp.....',
  '.....pp.....',
  '....pppp....',
  '............',
];
export function buildMailbox(): HTMLCanvasElement[] {
  const c = document.createElement('canvas');
  c.width = SPRITE_W; c.height = SPRITE_H;
  paint(c.getContext('2d')!, MAILBOX, MAILBOX_PALETTE, 0, 0);
  return [c];
}

export function buildSign(): HTMLCanvasElement[] {
  const c = document.createElement('canvas');
  c.width = SPRITE_W; c.height = SPRITE_H;
  paint(c.getContext('2d')!, SIGN, SIGN_PALETTE, 0, 0);
  return [c];
}

export const SPRITE_W = 12;
export const SPRITE_H = 16;

/** Paint a pixel grid onto a context at 1 px per char; `flip` mirrors horizontally. */
export function paint(ctx: CanvasRenderingContext2D, rows: readonly string[], palette: Palette, x: number, y: number, flip = false): void {
  rows.forEach((row, j) => {
    for (let i = 0; i < row.length; i++) {
      const c = palette[row[i]];
      if (!c) continue;
      ctx.fillStyle = c;
      ctx.fillRect(x + (flip ? row.length - 1 - i : i), y + j, 1, 1);
    }
  });
}

export type SpriteSheet = Record<Dir, HTMLCanvasElement[]>;

/** Pre-render a figure: every facing × two walk frames, as small canvases ready to blit. */
export function buildSheet(f: Figure): SpriteSheet {
  const make = (body: string[], legs: string[], flip: boolean): HTMLCanvasElement => {
    const c = document.createElement('canvas');
    c.width = SPRITE_W; c.height = SPRITE_H;
    const ctx = c.getContext('2d')!;
    paint(ctx, [...body, ...legs], f.palette, 0, 0, flip);
    return c;
  };
  const frames = (body: string[], legs: string[][], flip = false) => legs.map((l) => make(body, l, flip));
  return {
    down: frames(f.body.down, f.legs.front),
    up: frames(f.body.up, f.legs.front),
    right: frames(f.body.side, f.legs.side),
    left: frames(f.body.side, f.legs.side, true),
  };
}

export function buildCat(id: CatId): HTMLCanvasElement[] {
  const cat = CATS[id];
  return cat.frames.map((rows) => {
    const c = document.createElement('canvas');
    c.width = SPRITE_W; c.height = SPRITE_H;
    paint(c.getContext('2d')!, rows, cat.palette, 0, 0);
    return c;
  });
}

/** A head-and-shoulders portrait of a figure (the facing-down body, no legs) for the talk box. */
export function portraitUrl(f: Figure, bg = '#102e49', scale = 4): string {
  const rows = f.body.down;
  const c = document.createElement('canvas');
  const pad = 2;
  c.width = (SPRITE_W + pad * 2) * scale; c.height = (rows.length + pad * 2) * scale;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = bg; ctx.fillRect(0, 0, c.width, c.height);
  ctx.save(); ctx.scale(scale, scale);
  paint(ctx, rows, f.palette, pad, pad + 1);
  ctx.restore();
  return c.toDataURL();
}
