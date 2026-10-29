// The birthday prologue: before the town opens, 一帆 bakes Jingyi a cake against the clock in his
// College Station kitchen, the lights go out at Shenzhen midnight, everyone sings, she makes a
// wish and blows the candles out (with her real breath, if the mic is allowed). Plays once per
// player on this device before the first walk in town; the town footer replays it.
import '../theatre/theatre.css';
import { pick, type L10n } from '../../core/i18n';
import { getPlayer } from '../../core/quest';
import { avatarHtml } from '../../core/quest-ui';
import { go, refresh } from '../../core/router';
import { pauseJukebox } from '../music/jukebox';
import { confetti } from '../../core/celebrate';
import { Aborted, Stage, place, type Actor } from '../theatre/stage';
import { BEAT, BIRTHDAY_SONG, audio, crack, ding, hush, playPhrase, phraseSeconds, pop, puff, strike, twinkle, whisk, boom } from '../theatre/music';
import { BLOW, listenForBreath, type Breath } from '../theatre/blow';
import { JINGYI, JINGYI_CROWN, YIFAN_CHEF, buildCat } from '../world/sprites';
import { BERRIES, CANDLES, cakeBack, cakeLit, candleX, heartAbove, kitchenBack, kitchenFront, newCakeUp, newKitchen } from './kitchen';
import { markBirthdaySeen } from './seen';

// Once the scene has played to the end in this tab, a re-render (the language button) shows the
// card again instead of starting the cake over. 'Watch again' clears it.
let finished = false;

const L = (zh: string, en: string): L10n => ({ zh, en });
const S = {
  eyebrow: L('序章 · 10 月 31 日', 'Prologue · October 31'),
  skip: L('跳过', 'Skip'),
  begin: L('打开声音，开始', 'Sound on, begin'),
  opening: L('2026 年 10 月 30 日\n<small>COLLEGE STATION · 上午</small>', '30 October 2026\n<small>COLLEGE STATION · MORNING</small>'),
  yifan: L('一帆', 'Yifan'),
  jingyi: L('静仪', 'Jingyi'),
  n1: L('College Station，上午九点四十七分。\n深圳，晚上十点四十七分。离<em>静仪的生日</em>，还有七十三分钟。', 'College Station, 9:47 in the morning.\nShenzhen, 10:47 at night. Seventy-three minutes until <em>Jingyi’s birthday</em>.'),
  y1: L('来得及，来得及……今天一定要亲手做出来。', 'Plenty of time, plenty of time… today I make it with my own hands.'),
  n2: L('一帆系好围裙，戴上厨师帽。三个鸡蛋，一勺糖，一大捧面粉。', 'Yifan ties his apron and puts on the chef’s hat. Three eggs, a spoon of sugar, a big scoop of flour.'),
  whiskAsk: L('帮一帆把面糊打匀：连点「搅」或者点画面，十二下。', 'Help Yifan whisk the batter: tap “Whisk” or the picture, twelve times.'),
  whiskBtn: L('搅！', 'Whisk!'),
  y2: L('好了！细腻、顺滑，像……像她的声音。', 'Done! Smooth and silky, like… like her voice.'),
  n3: L('面糊进了烤箱。一帆蹲在烤箱前面，一动不动地盯着。', 'Into the oven. Yifan crouches in front of it and does not take his eyes off the glass.'),
  ding: L('叮！', 'Ding!'),
  y3: L('起来了，起来了！她会喜欢的吧？', 'It rose, it rose! She’ll like it, won’t she?'),
  n4: L('奶油抹平，沿着边挤一圈小花。', 'Cream smoothed on, and a ring of little rosettes piped around the edge.'),
  berryAsk: L('放草莓：点蛋糕，一颗一颗放上去。一共十颗。', 'Strawberries: tap the cake to place them one by one. Ten in all.'),
  berryBtn: L('放一颗', 'Place one'),
  berryDone: L('十颗草莓，拼成一颗心。和五子棋盘上那十颗金子，是同一颗心。', 'Ten strawberries make a heart: the same heart as the ten gold stones on the Gomoku board.'),
  plaque: L('静仪 · 生日快乐', 'Happy Birthday Jingyi'),
  n5: L('最后，九根蜡烛。九关，九九，久久。', 'Last, nine candles. Nine levels; and in Chinese, nine sounds like “for a long, long time”.'),
  y4: L('深圳快零点了。关灯！', 'Almost midnight in Shenzhen. Lights off!'),
  n6: L('一帆一根一根点亮蜡烛。', 'One by one, Yifan lights the candles.'),
  midnight: L('零点。10 月 31 日。', 'Midnight. October 31.'),
  n7: L('在仪见小镇，没有十三个小时的时差。\n门开了。', 'In Yi Town there is no thirteen-hour time difference.\nThe door opens.'),
  y5: L('静仪，生日快乐！快过来，我们给你唱歌。', 'Happy birthday, Jingyi! Come here, we’re singing for you.'),
  lyrics: [
    L('♪ 祝你生日快乐 ♪', '♪ Happy birthday to you ♪'),
    L('♪ 祝你生日快乐 ♪', '♪ Happy birthday to you ♪'),
    L('♪ 祝静仪生日快乐 ♪', '♪ Happy birthday, dear Jingyi ♪'),
    L('♪ 祝你生日快乐 ♪', '♪ Happy birthday to you ♪'),
  ],
  wish: L('闭上眼睛，许一个愿。\n（不用说出来。一帆说，他负责把它实现。）', 'Close your eyes and make a wish.\n(No need to say it. Yifan says making it come true is his job.)'),
  wishBtn: L('按住许愿', 'Hold to wish'),
  wished: L('愿望已经许好了。', 'The wish is made.'),
  blowAsk: L('现在，把蜡烛吹灭吧。对着麦克风轻轻吹一口气，或者按住下面的按钮。', 'Now blow the candles out. Breathe gently into the microphone, or hold the button below.'),
  mic: L('🎙 用麦克风吹', '🎙 Blow into the mic'),
  micOn: L('🎙 在听，吹吧', '🎙 Listening, blow'),
  hold: L('按住吹气', 'Hold to blow'),
  micNo: L('打不开麦克风，那就按住按钮吹吧。', 'The microphone would not open; hold the button to blow instead.'),
  left: L('还剩 {n} 根', '{n} left'),
  banner: L('生日快乐 · 静仪', 'Happy Birthday, Jingyi'),
  crown: L('今天你是公主。生日皇冠，戴好。', 'Today you are the princess. Your birthday crown.'),
  y6: L('生日快乐，静仪。\n这是我们认识之后，你的第一个生日。我飞不过去，就在这里给你做了一个。\n以后的每一个生日，我都想亲手给你做蛋糕——在同一个时区里。', 'Happy birthday, Jingyi.\nThis is your first birthday since we met. I couldn’t fly over, so I made you one here.\nEvery birthday after this one, I want to bake your cake myself — in the same time zone.'),
  y7: L('今天还有一整座小镇送给你。九栋房子，一栋一栋走。最后一栋里有什么？连 Rayford 都不肯说。', 'And there is a whole town for you today. Nine houses, one at a time. What is in the last one? Even Rayford won’t say.'),
  cardEyebrow: L('2026 · 10 · 31', '31 · 10 · 2026'),
  cardTitle: L('生日快乐，静仪', 'Happy birthday, Jingyi'),
  cardText: L('蛋糕吃完了，小镇的灯也亮了。\n九栋房子在等你，从我们认识的那一天开始。', 'The cake is eaten and the town’s lights are on.\nNine houses are waiting, starting from the day we met.'),
  cardGo: L('走进仪见小镇', 'Walk into Yi Town'),
  cardAgain: L('再看一遍', 'Watch again'),
  cardFine: L('序章随时可以在小镇下方「生日序章」里重看。', 'Replay the prologue any time from “Birthday prologue” under the town.'),
};
const s = (l: L10n, vars: Record<string, string | number> = {}) => pick(l).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));

// The two clocks on the wall: minutes after 22:47 in Shenzhen on 30 October (09:47 in College Station).
function clockText(min: number): { cs: string; sz: string } {
  const at = (h0: number, d0: number) => {
    const total = h0 * 60 + 47 + min, day = d0 + Math.floor(total / 1440), m = ((total % 1440) + 1440) % 1440;
    const hh = String(Math.floor(m / 60)).padStart(2, '0'), mm = String(m % 60).padStart(2, '0');
    return `10/${day} ${hh}:${mm}`;
  };
  return { cs: at(9, 30), sz: at(22, 30) };
}

export function renderBirthday(root: HTMLElement): () => void {
  const player = getPlayer()!;
  root.innerHTML = `
    <section class="theatre">
      <div class="th-top"><p class="eyebrow">${s(S.eyebrow)}</p><button type="button" class="th-skip">${s(S.skip)}</button></div>
      <div class="th-host"></div>
    </section>`;
  pauseJukebox();
  const stage = new Stage(root.querySelector<HTMLElement>('.th-host')!);
  let breath: Breath | undefined;
  let card: HTMLElement | undefined;

  const finish = () => {
    finished = true;
    skip.hidden = true;
    markBirthdaySeen(player);
    hush();
    card?.remove();
    card = document.createElement('div');
    card.className = 'th-card';
    card.innerHTML = `<div class="th-card-inner" role="dialog" aria-modal="true">
      <p class="eyebrow">${s(S.cardEyebrow)}</p>
      <div class="pair">${avatarHtml('yifan', 'big')}<b>♥</b>${avatarHtml('jingyi', 'big')}</div>
      <h2>${s(S.cardTitle)}</h2>
      <p>${s(S.cardText).replace(/\n/g, '<br>')}</p>
      <div class="row"><button type="button" class="btn go" data-go>${s(S.cardGo)}</button><button type="button" class="btn quiet" data-again>${s(S.cardAgain)}</button></div>
      <p class="fine">${s(S.cardFine)}</p>
    </div>`;
    document.body.appendChild(card);
    confetti(card, 160);
    card.querySelector('[data-go]')!.addEventListener('click', () => go('/town'));
    card.querySelector('[data-again]')!.addEventListener('click', () => { finished = false; refresh(); });
    card.querySelector<HTMLButtonElement>('[data-go]')!.focus();
  };
  if (finished) { stage.destroy(); finish(); return () => { card?.remove(); }; }
  const skip = root.querySelector<HTMLButtonElement>('.th-skip')!;
  skip.addEventListener('click', () => { stage.destroy(); breath?.stop(); finish(); });

  void play(stage, (b) => { breath = b; }).then(finish, (err: unknown) => { if (!(err instanceof Aborted)) { console.error(err); finish(); } });

  return () => { stage.destroy(); breath?.stop(); hush(); card?.remove(); };
}

async function play(stage: Stage, onBreath: (b: Breath) => void): Promise<void> {
  const k = newKitchen();
  const cake = newCakeUp();
  const name = (l: L10n) => s(l);
  const ov = stage.overlay;

  // ---- 0. black, a title, one tap (it also unlocks sound and, later, the mic)
  stage.dark = 1;
  const title = document.createElement('p');
  title.className = 'th-title';
  title.innerHTML = s(S.opening).replace('\n', '<br>');
  ov.appendChild(title);
  await stage.wait(80); title.classList.add('on');
  await stage.ask('', '', [{ label: s(S.begin), value: 1 }]);
  markBirthdaySeen(getPlayer()!);
  audio(); twinkle();
  title.classList.remove('on');
  await stage.wait(700); title.remove();

  // ---- 1. the kitchen in the morning
  stage.back = (c, t) => kitchenBack(c, t, k);
  stage.front = (c, t) => kitchenFront(c, t, k);
  let minutes = 0;
  const clocks = ['cs', 'sz'].map((id, i) => {
    const el = document.createElement('div');
    el.className = 'th-clock';
    place(el, i ? 83 : 57, 12.6);
    ov.appendChild(el);
    return { id, el };
  });
  const tickClocks = () => { const c = clockText(minutes); for (const { id, el } of clocks) el.innerHTML = `<small>${id === 'cs' ? 'COLLEGE STATION' : '深圳 SHENZHEN'}</small>${id === 'cs' ? c.cs : c.sz}`; };
  tickClocks();
  const runClock = (to: number, ms: number) => { const from = minutes; return stage.tween(ms, (q) => { minutes = Math.round(from + (to - from) * q); tickClocks(); }); };
  // Coffee and Duoduo watch from the floor.
  const cats = [buildCat('coffee'), buildCat('duoduo')];
  const back = stage.back;
  stage.back = (c, t) => { back(c, t); c.drawImage(cats[0][Math.floor(t / 700) % 2], 6, 62); c.drawImage(cats[1][Math.floor(t / 650 + 1) % 2], 108, 62); };

  const ri: Actor = stage.actor(YIFAN_CHEF, -8, 63, 'right');
  await stage.fade(0, 1000);
  stage.narrate('', s(S.n1));
  await stage.walk(ri, 64, 63, 26);
  ri.dir = 'down';
  await stage.wait(1400);
  await stage.say(name(S.yifan), s(S.y1));

  // ---- 2. eggs, sugar, flour, whisk
  k.bowl = true;
  stage.narrate('', s(S.n2));
  for (let i = 0; i < 3; i++) {
    stage.emit({ x: 64, y: 44, vy: 30, g: 60, max: 420, color: '#fffaf0', size: 2 });
    await stage.wait(420); crack(); k.batter = Math.min(1, k.batter + 0.2);
    stage.emit({ x: 63, y: 52, vx: -6, vy: -10, g: 40, max: 300, color: '#ffd36a', size: 1 });
    await stage.wait(250);
  }
  for (let i = 0; i < 14; i++) stage.emit({ x: 60 + Math.random() * 8, y: 52, vx: (Math.random() - 0.5) * 16, vy: -8 - Math.random() * 10, g: 4, max: 1200, color: '#ffffff', kind: 'smoke' });
  await stage.wait(1400);
  // The player whisks.
  await new Promise<void>((res, rej) => {
    let n = 0;
    stage.narrate('', s(S.whiskAsk));
    const box = stage.controls(`<div class="th-meter"><i></i></div><button type="button" class="btn go">${s(S.whiskBtn)}</button>`);
    const bar = box.querySelector<HTMLElement>('.th-meter i')!;
    const btn = box.querySelector<HTMLButtonElement>('button')!;
    const hit = () => {
      n++; whisk(); k.whisk += 1.6; k.batter = Math.min(1, 0.6 + n / 30); bar.style.width = `${(n / 12) * 100}%`;
      stage.emit({ x: 64 + (Math.random() - 0.5) * 8, y: 52, vx: (Math.random() - 0.5) * 20, vy: -14, g: 50, max: 500, color: '#f6dc9c' });
      stage.fire(stage.hop(ri, 1, 120));
      if (n >= 12) { off(); res(); }
    };
    const key = (e: KeyboardEvent) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); hit(); } };
    const abort = () => { off(); rej(new Aborted()); };
    const off = () => { btn.removeEventListener('click', hit); stage.canvas.removeEventListener('click', hit); window.removeEventListener('keydown', key); stage.signal.removeEventListener('abort', abort); };
    btn.addEventListener('click', hit); stage.canvas.addEventListener('click', hit); window.addEventListener('keydown', key);
    stage.signal.addEventListener('abort', abort, { once: true });
    btn.focus({ preventScroll: true });
  });
  k.whisk = 0;
  stage.fire(runClock(25, 1500));
  await stage.say(name(S.yifan), s(S.y2));

  // ---- 3. the oven
  k.bowl = false;
  stage.narrate('', s(S.n3));
  await stage.walk(ri, 110, 63, 30);
  ri.dir = 'up';
  k.ovenCake = 0.05;
  await stage.tween(900, (q) => { k.ovenGlow = q; });
  await Promise.all([runClock(53, 4200), stage.tween(4200, (q) => { k.ovenCake = 0.05 + q * 0.95; })]);
  ding(); stage.fire(stage.hop(ri, 4));
  stage.narrate(name(S.yifan), s(S.ding));
  await stage.wait(900);
  await stage.tween(500, (q) => { k.ovenGlow = 1 - q; });
  ri.dir = 'down';
  await stage.say(name(S.yifan), s(S.y3));

  // ---- 4. decorating, up close
  for (const { el } of clocks) el.style.opacity = '0';
  stage.actors.forEach((a) => { a.visible = false; });
  stage.back = (c, t) => cakeBack(c, t, cake);
  stage.front = () => undefined;
  stage.lit = (c, t) => cakeLit(c, t, cake);
  stage.narrate('', s(S.n4));
  await stage.tween(2600, (q) => { cake.piped = q; });
  // Strawberries, by the player's hand.
  await new Promise<void>((res, rej) => {
    stage.narrate('', s(S.berryAsk));
    const box = stage.controls(`<span class="th-count">0 / 10</span><button type="button" class="btn go">${s(S.berryBtn)}</button>`);
    const count = box.querySelector<HTMLElement>('.th-count')!;
    const btn = box.querySelector<HTMLButtonElement>('button')!;
    const hit = () => {
      if (cake.berries >= BERRIES.length) return;
      const [dx, dy] = BERRIES[cake.berries];
      cake.berries++; count.textContent = `${cake.berries} / 10`;
      twinkle();
      stage.emit({ x: 64 + dx, y: 47 + dy - 1, vy: -10, g: 0, max: 600, color: '#fff6c2', kind: 'spark' });
      if (cake.berries >= BERRIES.length) { off(); res(); }
    };
    const key = (e: KeyboardEvent) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); hit(); } };
    const abort = () => { off(); rej(new Aborted()); };
    const off = () => { btn.removeEventListener('click', hit); stage.canvas.removeEventListener('click', hit); window.removeEventListener('keydown', key); stage.signal.removeEventListener('abort', abort); };
    btn.addEventListener('click', hit); stage.canvas.addEventListener('click', hit); window.addEventListener('keydown', key);
    stage.signal.addEventListener('abort', abort, { once: true });
    btn.focus({ preventScroll: true });
  });
  for (let i = 0; i < 6; i++) stage.emit({ x: 58 + Math.random() * 12, y: 44, vy: -12, max: 1400, color: '#e0516b', kind: 'heart' });
  await stage.say('', s(S.berryDone));
  // The plaque, written letter by letter in chocolate.
  cake.plaque = true;
  const icing = document.createElement('div');
  icing.className = 'th-icing';
  icing.innerHTML = [...s(S.plaque)].map((ch) => `<span>${ch === ' ' ? '&nbsp;' : ch}</span>`).join('');
  place(icing, 64, 14);
  ov.appendChild(icing);
  for (const span of icing.querySelectorAll('span')) { span.classList.add('on'); await stage.wait(160); }
  stage.narrate('', s(S.n5));
  for (let i = 0; i < CANDLES; i++) { cake.candles = i + 1; await stage.wait(260); }
  stage.fire(runClock(72, 1600));
  await stage.wait(700);
  await stage.say(name(S.yifan), s(S.y4));

  // ---- 5. lights out, candles lit, midnight
  icing.style.transition = 'opacity 800ms'; icing.style.opacity = '0.35';
  await stage.fade(0.9, 1200);
  stage.narrate('', s(S.n6));
  for (let i = 0; i < CANDLES; i++) {
    strike(); cake.flames[i] = true;
    stage.glows.push({ x: candleX(i) + 1, y: 16, r: 15, flicker: true });
    await stage.wait(330);
  }
  icing.style.opacity = '0.8';
  await stage.wait(600);
  minutes = 73; tickClocks();
  stage.narrate('', s(S.midnight));
  for (let r = 0; r < 2; r++) { ding(); await stage.wait(700); }

  // ---- 6. the wide shot: the cake on the table, Jingyi comes in, everyone sings
  icing.remove();
  stage.glows.length = 0;
  k.tableCake = true; k.night = true;
  k.flames.fill(true);
  for (const { el } of clocks) { el.style.opacity = '0.75'; el.style.transition = 'opacity 600ms'; }
  stage.back = (c, t) => { kitchenBack(c, t, k); c.drawImage(cats[0][Math.floor(t / 700) % 2], 6, 62); c.drawImage(cats[1][Math.floor(t / 650 + 1) % 2], 108, 62); };
  stage.front = (c, t) => kitchenFront(c, t, k);
  const lightCandles = () => { stage.glows.length = 0; stage.glows.push({ x: 64, y: 44, r: 30, flicker: true }); };
  lightCandles();
  ri.visible = true; ri.x = 46; ri.y = 63; ri.dir = 'down';
  const jy: Actor = stage.actor(JINGYI, 136, 63, 'left', true);
  stage.lit = (c, t) => kitchenLitFlames(c, t, k);
  await stage.say('', s(S.n7));
  stage.glows.push({ x: 128, y: 50, r: 40 });
  await stage.tween(700, (q) => { k.door = q; });
  await stage.walk(jy, 82, 63, 20);
  await stage.tween(700, (q) => { k.door = 1 - q; });
  stage.glows.pop();
  stage.fire(stage.hop(ri, 3));
  await stage.say(name(S.yifan), s(S.y5));
  jy.dir = 'down'; ri.dir = 'down';
  // Happy Birthday, with the words under the picture.
  for (let i = 0; i < BIRTHDAY_SONG.length; i++) {
    stage.narrate('', s(S.lyrics[i]));
    playPhrase(i);
    const ms = phraseSeconds(i) * 1000;
    const notes = window.setInterval(() => stage.emit({ x: 44 + Math.random() * 4, y: 44, vx: (Math.random() - 0.5) * 6, vy: -9, max: 1600, color: i === 2 ? '#e0516b' : '#f3c94e', kind: 'heart' }), 420);
    try { await stage.wait(ms + BEAT * 300); } finally { clearInterval(notes); }
  }

  // ---- 7. a wish (hold), then the candles (breath or hold)
  stage.narrate('', s(S.wish));
  await holdFor(stage, s(S.wishBtn), 3000, (q) => { if (Math.random() < 0.25) stage.emit({ x: Math.random() * 128, y: Math.random() * 40, max: 900, color: '#fff6c2', kind: 'spark' }); void q; });
  twinkle();
  await stage.say(name(S.jingyi), s(S.wished));
  await blowOut(stage, k, onBreath);
  stage.glows.length = 0;

  // ---- 8. lights on, confetti, the crown, his words
  await stage.fade(0, 700);
  for (const { el } of clocks) el.style.opacity = '0';
  pop(); await stage.wait(160); pop();
  const colors = ['#d4506d', '#f3c94e', '#7fb2d9', '#9bd18b', '#fff6dc', '#f3c4cd'];
  for (let i = 0; i < 70; i++) stage.emit({ x: Math.random() * 128, y: -2 - Math.random() * 20, vx: (Math.random() - 0.5) * 10, vy: 8 + Math.random() * 14, g: 6, max: 5000, color: colors[i % colors.length], size: 1, kind: 'petal' });
  // Fireworks in the window.
  const fire = window.setInterval(() => { boom(); stage.burst(10 + Math.random() * 22, 13 + Math.random() * 10, [colors[Math.floor(Math.random() * colors.length)], '#fff6dc'], 18, 14); }, 900);
  try {
    const banner = document.createElement('div');
    banner.className = 'th-banner';
    banner.textContent = s(S.banner);
    ov.appendChild(banner);
    await stage.wait(50); banner.classList.add('on');
    stage.fire(stage.hop(jy, 4)); stage.fire(stage.hop(ri, 4));
    await stage.wait(1200);
    stage.dress(jy, JINGYI_CROWN); twinkle();
    stage.burst(82, 46, ['#f3c94e', '#fff6dc'], 16, 18, 'spark');
    await stage.say(name(S.yifan), s(S.crown));
    ri.dir = 'right'; jy.dir = 'left';
    let heartY = 38;
    const prevFront = stage.front;
    stage.front = (c, t) => { prevFront(c, t); heartAbove(c, 64, Math.round(heartY)); };
    stage.fire(stage.tween(1600, (q) => { heartY = 38 - q * 6; }));
    await stage.say(name(S.yifan), s(S.y6));
    await stage.say(name(S.yifan), s(S.y7));
  } finally { clearInterval(fire); }
  stage.hideCaption();
}

function kitchenLitFlames(ctx: CanvasRenderingContext2D, t: number, k: ReturnType<typeof newKitchen>): void {
  // The table cake's flames, again above the dark so they shine.
  if (!k.tableCake) return;
  for (let i = 0; i < CANDLES; i++) if (k.flames[i]) {
    const x = 55 + i * 2, lean = Math.round(k.bend * 2), flick = Math.sin(t / 70 + i * 1.7) > 0.4 ? 1 : 0;
    ctx.fillStyle = '#ffd36a'; ctx.fillRect(x + lean, 43 - flick, 1, 1 + flick);
    ctx.fillStyle = '#fff6c2'; ctx.fillRect(x + lean, 42 - flick, 1, 1);
  }
}

/** Resolve once `released()` is true, so a key or finger still down does not fall through to the next line. */
function settle(released: () => boolean, res: () => void): void {
  const tick = () => { if (released()) res(); else requestAnimationFrame(tick); };
  window.setTimeout(tick, 120);
}

/** A button held down for `ms` (pointer, Space or Enter); letting go early drains it slowly. */
function holdFor(stage: Stage, label: string, ms: number, onTick: (q: number) => void): Promise<void> {
  return new Promise((res, rej) => {
    const box = stage.controls(`<div class="th-meter"><i></i></div><button type="button" class="btn go th-hold">${label}</button>`);
    const bar = box.querySelector<HTMLElement>('.th-meter i')!;
    const btn = box.querySelector<HTMLButtonElement>('button')!;
    let down = false, q = 0, last = performance.now(), raf = 0;
    const loop = (now: number) => {
      const dt = now - last; last = now;
      q = Math.max(0, Math.min(1, q + (down ? dt / ms : -dt / (ms * 2))));
      bar.style.width = `${q * 100}%`;
      if (down) onTick(q);
      if (q >= 1) { cancelAnimationFrame(raf); settle(() => !down, () => { off(); res(); }); return; }
      raf = requestAnimationFrame(loop);
    };
    const on = (e: Event) => { e.preventDefault(); down = true; };
    const up = () => { down = false; };
    const key = (e: KeyboardEvent) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); down = e.type === 'keydown'; } };
    const abort = () => { off(); rej(new Aborted()); };
    const off = () => {
      cancelAnimationFrame(raf);
      btn.removeEventListener('pointerdown', on); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up);
      window.removeEventListener('keydown', key); window.removeEventListener('keyup', key); stage.signal.removeEventListener('abort', abort);
    };
    btn.addEventListener('pointerdown', on); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
    window.addEventListener('keydown', key); window.addEventListener('keyup', key);
    stage.signal.addEventListener('abort', abort, { once: true });
    btn.focus({ preventScroll: true });
    raf = requestAnimationFrame(loop);
  });
}

/** Blow the candles out: by breath into the mic, or by holding a button. Every ~0.18 s of blowing puts one out. */
function blowOut(stage: Stage, k: ReturnType<typeof newKitchen>, onBreath: (b: Breath) => void): Promise<void> {
  return new Promise((res, rej) => {
    stage.narrate('', s(S.blowAsk));
    const box = stage.controls(`<span class="th-count"></span><div class="th-meter"><i></i></div><button type="button" class="btn go" data-mic>${s(S.mic)}</button><button type="button" class="btn quiet th-hold" data-hold>${s(S.hold)}</button>`);
    const count = box.querySelector<HTMLElement>('.th-count')!;
    const bar = box.querySelector<HTMLElement>('.th-meter i')!;
    const micBtn = box.querySelector<HTMLButtonElement>('[data-mic]')!;
    const holdBtn = box.querySelector<HTMLButtonElement>('[data-hold]')!;
    let breath: Breath | undefined, holding = false, acc = 0, last = performance.now(), raf = 0;
    const lit = () => k.flames.filter(Boolean).length;
    count.textContent = s(S.left, { n: lit() });
    const loop = (now: number) => {
      const dt = now - last; last = now;
      const level = Math.max(breath ? breath.level() : 0, holding ? 0.6 : 0);
      bar.style.width = `${Math.min(100, (level / 0.8) * 100)}%`;
      k.bend = Math.min(1, level / BLOW);
      if (level >= BLOW) {
        acc += dt;
        if (acc >= 180) {
          acc = 0;
          const on = k.flames.map((f, i) => (f ? i : -1)).filter((i) => i >= 0);
          const i = on[Math.floor(Math.random() * on.length)];
          k.flames[i] = false; puff();
          for (let j = 0; j < 4; j++) stage.emit({ x: 55 + i * 2, y: 42, vx: 4 + Math.random() * 4, vy: -6 - Math.random() * 4, max: 1600, color: '#d8d4e8', kind: 'smoke' });
          count.textContent = s(S.left, { n: lit() });
          const g = stage.glows[0];
          if (g) g.r = 10 + 20 * (lit() / CANDLES);
          if (!lit()) { cancelAnimationFrame(raf); settle(() => !holding, () => { off(); res(); }); return; }
        }
      } else acc = Math.max(0, acc - dt);
      raf = requestAnimationFrame(loop);
    };
    const down = (e: Event) => { e.preventDefault(); holding = true; };
    const up = () => { holding = false; };
    const key = (e: KeyboardEvent) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); holding = e.type === 'keydown'; } };
    const mic = async () => {
      if (stage.signal.aborted) return;
      micBtn.disabled = true;
      try {
        const b = await listenForBreath();
        if (stage.signal.aborted) { b.stop(); return; }
        breath = b; onBreath(b); micBtn.textContent = s(S.micOn);
      }
      catch { stage.narrate('', s(S.micNo), true); micBtn.remove(); }
    };
    const abort = () => { off(); rej(new Aborted()); };
    const off = () => {
      cancelAnimationFrame(raf); breath?.stop(); k.bend = 0;
      holdBtn.removeEventListener('pointerdown', down); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up);
      window.removeEventListener('keydown', key); window.removeEventListener('keyup', key); stage.signal.removeEventListener('abort', abort);
    };
    micBtn.addEventListener('click', () => { void mic(); });
    holdBtn.addEventListener('pointerdown', down); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
    window.addEventListener('keydown', key); window.addEventListener('keyup', key);
    stage.signal.addEventListener('abort', abort, { once: true });
    if (!navigator.mediaDevices?.getUserMedia) micBtn.remove();
    (micBtn.isConnected ? micBtn : holdBtn).focus({ preventScroll: true });
    raf = requestAnimationFrame(loop);
  });
}

