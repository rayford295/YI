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
