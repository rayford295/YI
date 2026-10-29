// The wedding: after the last letter, Yi Town holds a ceremony in the fountain garden. Rayford
// (who kept his suit a secret all along) is the master of ceremonies, Coffee and Duoduo are the
// guests, the bride walks the aisle to the Wedding March, both say "I do" (aloud, if the browser
// can listen), Coffee brings the Meridian rings, the kiss, bells, doves, and a marriage certificate
// to keep. Opens only once both players have cleared the last level on this device.
import '../theatre/theatre.css';
import { pick, getLang, type L10n } from '../../core/i18n';
import { config } from '../../core/config';
import { avatarHtml, avatarUrl } from '../../core/quest-ui';
import { go, refresh } from '../../core/router';
import { confetti } from '../../core/celebrate';
import { pauseJukebox } from '../music/jukebox';
import { canListen, listen } from '../home/speech';
import { Aborted, Stage, type Actor } from '../theatre/stage';
import { audio, bells, boom, hush, twinkle } from '../theatre/music';
import { soundOn } from '../world/sound';
import { JINGYI_BRIDE, RAYFORD, YIFAN_GROOM, buildCat } from '../world/sprites';
import { bigHeart, gardenBack, gardenFront, gardenLit, newGarden } from './garden';
import { markWedding, weddingDay } from './seen';

// Set once the scene has played to the end in this tab, so a re-render (the language button) shows
// the certificate instead of a second ceremony. 'Watch again' clears it.
let finished = false;

const L = (zh: string, en: string): L10n => ({ zh, en });
const S = {
  eyebrow: L('尾声之后 · 婚礼', 'After the epilogue · the wedding'),
  skip: L('跳过', 'Skip'),
  begin: L('打开声音，开始', 'Sound on, begin'),
  opening: L('最后一封信读完了。\n<small>可是故事，还没有讲完。</small>', 'The last letter has been read.\n<small>But the story is not over yet.</small>'),
  rayford: L('Rayford · 司仪', 'Rayford · master of ceremonies'),
  yifan: L('一帆', 'Yifan'),
  jingyi: L('静仪', 'Jingyi'),
  n1: L('仪见小镇，喷泉花园，傍晚。\n咖啡和哆哆戴上了小领结，早早坐在第一排。', 'Yi Town, the fountain garden, early evening.\nCoffee and Duoduo, in little bow ties, took the front row early.'),
  r1: L('各位来宾——咖啡、哆哆，喷泉里的锦鲤，还有今晚会升起来的天秤和天蝎——欢迎来到杨一帆先生与陈静仪女士的婚礼。', 'Dear guests — Coffee, Duoduo, the koi in the fountain, and Libra and Scorpius who will rise tonight — welcome to the wedding of Mr Yifan Yang and Ms Jingyi Chen.'),
  r2: L('静仪，还记得吗？你问我为什么穿西装，我说先保密。\n现在可以说了：今天，我是你们的司仪。', 'Jingyi, remember? You asked why I wear a suit and I said it was a secret.\nNow I can tell you: today I am your master of ceremonies.'),
  n2: L('新郎就位。他的手有点抖——不是因为冷。', 'The groom takes his place. His hands are shaking a little, and not from the cold.'),
  r3: L('请全体起立。请新娘入场。', 'Please rise. Here comes the bride.'),
  n3: L('她穿着白纱走过来的这几步，他后来说，比从深圳到纽约还远，又比一眨眼还快。', 'Those few steps she took in white, he said later, were longer than Shenzhen to New York and quicker than a blink.'),
  askHim: L('杨一帆先生，你是否愿意娶陈静仪女士为妻？\n无论顺境或逆境，富有或贫穷，健康或疾病，无论相隔多少个时区，你都爱她、珍惜她、听她说话，直到永远？', 'Mr Yifan Yang, do you take Ms Jingyi Chen to be your wife?\nFor better or worse, richer or poorer, in sickness and in health, across however many time zones, to love her, cherish her and listen to her, for ever?'),
  askHer: L('陈静仪女士，你是否愿意嫁给杨一帆先生为妻？\n无论顺境或逆境，富有或贫穷，健康或疾病，无论相隔多少个时区，你都爱他、珍惜他、听他说话，直到永远？', 'Ms Jingyi Chen, do you take Mr Yifan Yang to be your husband?\nFor better or worse, richer or poorer, in sickness and in health, across however many time zones, to love him, cherish him and listen to him, for ever?'),
  speak: L('🎙 说出来', '🎙 Say it'),
  iDo: L('我愿意', 'I do'),
  listening: L('在听……说「我愿意」。（也可以直接点下面的按钮。）', 'Listening… say “I do”. (Or just press the button.)'),
  micNo: L('麦克风打不开，那就用按钮说吧。', 'The microphone would not open; say it with the button instead.'),
  skipped: L('这次先跳过了。想看完整的婚礼，随时从小镇底部的「婚礼」再进来。', 'Skipped for now. The whole ceremony is waiting under “The wedding” at the bottom of the town.'),
  again: L('没听清，再说一次？', 'Didn’t catch that. Once more?'),
  saidHim: L('我愿意。', 'I do.'),
  saidHer: L('我愿意。', 'I do.'),
  echo: L('第一关里，你们对着麦克风说过一次「我愿意」。那一次是做男女朋友，这一次，是一辈子。', 'In the first level you both said “I do” into a microphone once. That time it was to be a couple; this time it is for life.'),
  r4: L('请戒指。', 'The rings, please.'),
  n4: L('咖啡从座位上跳下来，叼着一个红丝绒的小枕头，沿着红毯走过来。', 'Coffee hops off the chair and pads down the aisle with a little red velvet pillow.'),
  rings: L('子午线。一对戒指，同一条金色经线，同一种平宽拉丝的环身。\n她的内侧刻着 Dr. Yifan Yang, 25th Sept.，他的刻着 Jingyi, 31st Oct.', 'Meridian. A pair of rings, one gold meridian, one wide brushed band.\nHers reads “Dr. Yifan Yang, 25th Sept.” inside; his, “Jingyi, 31st Oct.”'),
  ringsGo: L('为对方戴上', 'Put them on each other'),
  hers: L('她的', 'Hers'),
  his: L('他的', 'His'),
  r5: L('我以仪见小镇的名义宣布：你们正式结为夫妻！\n新郎，现在可以亲吻新娘了。', 'By the power vested in me by Yi Town, I now pronounce you husband and wife!\nYou may kiss the bride.'),
  kiss: L('💋 亲吻新娘', '💋 Kiss the bride'),
  banner: L('新婚快乐', 'Just Married'),
  y1: L('从 2026 年 9 月 20 日，走到这里。\n静仪，下一站，我们住在同一个时区。', 'From 20 September 2026 to here.\nJingyi, next stop: we live in the same time zone.'),
  r6: L('礼成！请两位新人，去领你们的结婚证。', 'The ceremony is complete! Newlyweds, come and collect your certificate.'),
  certEyebrow: L('结婚证 · 仪见小镇', 'Certificate of Marriage · Yi Town'),
  certTitle: L('杨一帆 ♥ 陈静仪', 'Yifan Yang ♥ Jingyi Chen'),
  certText: L('于 {date} 在仪见小镇喷泉花园结为夫妻。\n认识于 2026 年 9 月 20 日，相约 2027 年 2 月 5 日纽约。', 'were married on {date} in the fountain garden of Yi Town.\nMet on 20 September 2026; to meet in New York on 5 February 2027.'),
  certWitness: L('证婚人：Rayford（司仪）· 咖啡 · 哆哆', 'Witnesses: Rayford (master of ceremonies) · Coffee · Duoduo'),
  save: L('保存结婚证', 'Save the certificate'),
  town: L('回到小镇', 'Back to town'),
  again2: L('再看一遍', 'Watch again'),
};
const s = (l: L10n, vars: Record<string, string | number> = {}) => pick(l).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));

const today = (): string => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const longDate = (iso: string): string => {
  const [y, m, d] = iso.split('-').map(Number);
  return getLang() === 'zh' ? `${y} 年 ${m} 月 ${d} 日` : new Date(y, m - 1, d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
};

export function renderWedding(root: HTMLElement): () => void {
  pauseJukebox();
  root.innerHTML = `
    <section class="theatre">
      <div class="th-top"><p class="eyebrow">${s(S.eyebrow)}</p><button type="button" class="th-skip">${s(S.skip)}</button></div>
      <div class="th-host"></div>
    </section>`;
  const stage = new Stage(root.querySelector<HTMLElement>('.th-host')!);
  const march = new Audio(`${import.meta.env.BASE_URL}media/ring/wedding-march.m4a`);
  let card: HTMLElement | undefined;
  const skip = root.querySelector<HTMLButtonElement>('.th-skip')!;

  let vowed = false;
  const finish = () => {
    skip.hidden = true;
    if (vowed) { finished = true; markWedding(today()); }
    else if (!weddingDay()) { showSkipped(); return; }
    const day = weddingDay() ?? today();
    card?.remove();
    card = document.createElement('div');
    card.className = 'th-card';
    card.innerHTML = `<div class="th-card-inner" role="dialog" aria-modal="true">
      <p class="eyebrow">${s(S.certEyebrow)}</p>
      <div class="pair">${avatarHtml('yifan', 'big')}<b>♥</b>${avatarHtml('jingyi', 'big')}</div>
      <h2>${s(S.certTitle)}</h2>
      <p>${s(S.certText, { date: longDate(day) }).replace(/\n/g, '<br>')}</p>
      <p class="fine">${s(S.certWitness)}</p>
      <div class="row">
        <button type="button" class="btn go" data-save>${s(S.save)}</button>
        <button type="button" class="btn quiet" data-town>${s(S.town)}</button>
        <button type="button" class="btn quiet" data-again>${s(S.again2)}</button>
      </div>
    </div>`;
    document.body.appendChild(card);
    confetti(card, 180);
    card.querySelector('[data-save]')!.addEventListener('click', () => { void saveCertificate(day); });
    card.querySelector('[data-town]')!.addEventListener('click', () => go('/town'));
    card.querySelector('[data-again]')!.addEventListener('click', () => { finished = false; refresh(); });
    card.querySelector<HTMLButtonElement>('[data-save]')!.focus();
  };
  // Skipped before the vows and never married on this device: no certificate, just the way back.
  const showSkipped = () => {
    card?.remove();
    card = document.createElement('div');
    card.className = 'th-card';
    card.innerHTML = `<div class="th-card-inner" role="dialog" aria-modal="true"><p>${s(S.skipped)}</p>
      <div class="row"><button type="button" class="btn go" data-town>${s(S.town)}</button><button type="button" class="btn quiet" data-again>${s(S.again2)}</button></div></div>`;
    document.body.appendChild(card);
    card.querySelector('[data-town]')!.addEventListener('click', () => go('/town'));
    card.querySelector('[data-again]')!.addEventListener('click', () => refresh());
  };
  if (finished) { stage.destroy(); finish(); return () => { card?.remove(); }; }
  skip.addEventListener('click', () => { stage.destroy(); fadeOut(march); finish(); });

  void ceremony(stage, march, () => { vowed = true; }).then(finish, (err: unknown) => { if (!(err instanceof Aborted)) { console.error(err); finish(); } });
  return () => { stage.destroy(); march.pause(); hush(); card?.remove(); };
}

function fadeOut(a: HTMLAudioElement, ms = 1500): void {
  const from = a.volume, t0 = performance.now();
  const tick = (now: number) => { const k = Math.min(1, (now - t0) / ms); a.volume = from * (1 - k); if (k < 1) requestAnimationFrame(tick); else a.pause(); };
  requestAnimationFrame(tick);
}

/** Ask the vow; resolves when "I do" is said (heard by the mic) or pressed. */
async function vow(stage: Stage, question: string): Promise<void> {
  // "I do" in either language; a "no" or a "don't" anywhere in the alternatives is not a yes.
  const accept = (heard: string) => !/不愿|不要|没有|don'?t|do not|\bno\b|\bnot\b/i.test(heard) && /愿意|我愿|\bi do\b|\byes\b|\byeah\b|\bi will\b/i.test(heard);
  const choices: { label: string; value: 'speak' | 'press'; cls?: string }[] = [{ label: s(S.iDo), value: 'press' }];
  let canSpeak = canListen();
  let prompt = question;
  for (;;) {
    const how = await stage.ask(s(S.rayford), prompt, canSpeak ? [{ label: s(S.speak), value: 'speak' as const }, ...choices] : choices);
    if (how === 'press') return;
    // While listening, the button stays: pressing it is as good as saying it.
    stage.narrate(s(S.rayford), s(S.listening));
    const box = stage.controls(`<button type="button" class="btn quiet">${s(S.iDo)}</button>`);
    const btn = box.querySelector<HTMLButtonElement>('button')!;
    const ear = listen(getLang() === 'zh' ? 'zh-CN' : 'en-US');
    const stop = () => ear.abort();
    let pressed = false;
    btn.addEventListener('click', () => { pressed = true; ear.abort(); });
    btn.focus({ preventScroll: true });
    stage.signal.addEventListener('abort', stop, { once: true });
    try {
      const heard = await ear.done;
      if (accept(heard)) return;
    } catch (err) {
      if (pressed) return;
      const why = err instanceof Error ? err.message : '';
      if (why === 'not-allowed' || why === 'service-not-allowed' || why === 'unsupported') { canSpeak = false; prompt = `${s(S.micNo)}\n\n${question}`; continue; }
    } finally { stage.signal.removeEventListener('abort', stop); }
    if (stage.signal.aborted) throw new Aborted();
    if (pressed) return;
    prompt = `${s(S.again)}\n\n${question}`;
  }
}

async function ceremony(stage: Stage, march: HTMLAudioElement, onVowed: () => void): Promise<void> {
  const g = newGarden();
  const cats = [buildCat('coffee'), buildCat('duoduo')];
  const ov = stage.overlay;
  let heartK = 0;

  // ---- 0. black, a title, one tap
  stage.dark = 1;
  const title = document.createElement('p');
  title.className = 'th-title';
  title.innerHTML = s(S.opening).replace('\n', '<br>');
  ov.appendChild(title);
  await stage.wait(80); title.classList.add('on');
  await stage.ask('', '', [{ label: s(S.begin), value: 1 }]);
  audio(); twinkle();
  title.classList.remove('on');
  await stage.wait(800); title.remove();

  // ---- 1. the garden; Rayford walks to the arch
  stage.back = (c, t) => gardenBack(c, t, g, cats);
  stage.front = (c, t) => { gardenFront(c, t, g, cats); bigHeart(c, 64, Math.round(40 - heartK * 10), heartK); };
  stage.lit = (c, t) => gardenLit(c, t, g);
  const ray: Actor = stage.actor(RAYFORD, 140, 60, 'left');
  const groom: Actor = stage.actor(YIFAN_GROOM, 140, 68, 'left');
  const bride: Actor = stage.actor(JINGYI_BRIDE, -10, 68, 'right');
  await stage.fade(0, 1400);
  // Petals all the way through.
  const petals = window.setInterval(() => stage.emit({ x: Math.random() * 140 - 6, y: -2, vx: -2 + Math.random() * 4, vy: 6 + Math.random() * 5, max: 9000, color: Math.random() < 0.6 ? '#f3c4cd' : '#ffffff', size: Math.random() * 6, kind: 'petal' }), 260);
  try {
    stage.narrate('', s(S.n1));
    await stage.walk(ray, 64, 60, 20);
    ray.dir = 'down';
    await stage.wait(900);
    await stage.say(s(S.rayford), s(S.r1));
    await stage.say(s(S.rayford), s(S.r2));

    // ---- 2. the groom, then the bride down the aisle to the march
    stage.narrate('', s(S.n2));
    await stage.walk(groom, 72, 68, 22);
    groom.dir = 'left';
    await stage.wait(1200);
    await stage.say(s(S.rayford), s(S.r3));
    march.volume = 0.85;
    if (soundOn()) march.play().catch(() => undefined);
    stage.narrate('', s(S.n3));
    stage.fire(stage.tween(16000, (q) => { g.dusk = q * 0.55; }));
    await stage.walk(bride, 56, 68, 4.4);
    bride.dir = 'right';
    stage.burst(64, 50, ['#f3c4cd', '#ffffff', '#fff6dc'], 18, 16, 'heart');
    await stage.wait(1200);
    fadeOut(march, 3000);

    // ---- 3. the vows
    await vow(stage, s(S.askHim));
    await stage.hop(groom, 2);
    stage.emit({ x: 70, y: 48, vy: -10, max: 1600, color: '#e0516b', kind: 'heart' });
    await stage.say(s(S.yifan), s(S.saidHim));
    await vow(stage, s(S.askHer));
    await stage.hop(bride, 2);
    stage.emit({ x: 54, y: 48, vy: -10, max: 1600, color: '#e0516b', kind: 'heart' });
    await stage.say(s(S.jingyi), s(S.saidHer));
    onVowed();
    await stage.say('', s(S.echo));

    // ---- 4. Coffee brings the rings
    await stage.say(s(S.rayford), s(S.r4));
    stage.narrate('', s(S.n4));
    g.pillowAt = 26;
    await stage.tween(3600, (q) => { g.pillowAt = 26 + q * 38; });
    twinkle();
    const rings = document.createElement('div');
    rings.className = 'th-rings';
    const img = (f: string) => `${import.meta.env.BASE_URL}media/ring/renders/${f}`;
    rings.innerHTML = `<figure class="hers"><img src="${img('hers_hero.jpg')}" alt=""><figcaption>${s(S.hers)}</figcaption></figure>
      <figure class="his"><img src="${img('his_hero.jpg')}" alt=""><figcaption>${s(S.his)}</figcaption></figure>`;
    ov.appendChild(rings);
    await stage.fade(0.55, 600);
    rings.classList.add('on');
    await stage.ask('', s(S.rings), [{ label: s(S.ringsGo), value: 1 }]);
    rings.classList.add('close');
    twinkle();
    await stage.wait(1700);
    rings.classList.remove('on');
    await stage.fade(0, 700);
    rings.remove();
    g.pillowAt = null;
    stage.burst(56, 52, ['#f3c94e', '#fff6dc'], 12, 12, 'spark');
    stage.burst(72, 52, ['#f3c94e', '#fff6dc'], 12, 12, 'spark');

    // ---- 5. husband and wife; the kiss
    await stage.ask(s(S.rayford), s(S.r5), [{ label: s(S.kiss), value: 1 }]);
    await Promise.all([stage.walk(bride, 59, 68, 6), stage.walk(groom, 69, 68, 6)]);
    bride.dir = 'right'; groom.dir = 'left';
    await stage.tween(900, (q) => { heartK = q; });
    bells(3);
    stage.shake = 2;
    const banner = document.createElement('div');
    banner.className = 'th-banner';
    banner.textContent = s(S.banner);
    ov.appendChild(banner);
    await stage.wait(40); banner.classList.add('on');
    // Doves up into the sky, a storm of petals, fireworks as the lights come on.
    for (let i = 0; i < 6; i++) g.doves.push({ x: 60 + i * 2, y: 50 - (i % 2) * 3, vx: 10 + Math.random() * 12 - (i % 2 ? 20 : 0), vy: -14 - Math.random() * 8 });
    const flyDoves = window.setInterval(() => { for (const d of g.doves) { d.x += d.vx / 30; d.y += d.vy / 30; } }, 33);
    for (let i = 0; i < 90; i++) stage.emit({ x: Math.random() * 128, y: -Math.random() * 30, vx: (Math.random() - 0.5) * 8, vy: 10 + Math.random() * 10, g: 2, max: 7000, color: ['#f3c4cd', '#ffffff', '#d4506d', '#fff6dc'][i % 4], size: i, kind: 'petal' });
    stage.fire(stage.tween(4000, (q) => { g.dusk = 0.55 + q * 0.45; }));
    const colours = ['#f3c94e', '#f3c4cd', '#7fb2d9', '#fff6dc', '#e0516b'];
    const fire = window.setInterval(() => { boom(); stage.burst(14 + Math.random() * 100, 8 + Math.random() * 18, [colours[Math.floor(Math.random() * colours.length)], '#fff6dc'], 24, 22); }, 800);
    try {
      stage.fire(stage.hop(bride, 3)); stage.fire(stage.hop(groom, 3));
      await stage.wait(2400);
      await stage.say(s(S.yifan), s(S.y1));
      ray.dir = 'down';
      await stage.say(s(S.rayford), s(S.r6));
    } finally { clearInterval(fire); clearInterval(flyDoves); }
  } finally { clearInterval(petals); }
  stage.hideCaption();
}

/** Draw the certificate as a PNG and hand it to the viewer. */
async function saveCertificate(day: string): Promise<void> {
  await document.fonts?.ready;
  const c = document.createElement('canvas');
  c.width = 1200; c.height = 850;
  const x = c.getContext('2d')!;
  const zh = getLang() === 'zh';
  x.fillStyle = '#fffaf3'; x.fillRect(0, 0, c.width, c.height);
  x.strokeStyle = '#c39a5c'; x.lineWidth = 10; x.strokeRect(30, 30, 1140, 790);
  x.lineWidth = 2; x.strokeRect(52, 52, 1096, 746);
  x.textAlign = 'center'; x.fillStyle = '#a8324f';
  x.font = '600 30px "Noto Serif SC", "Cormorant Garamond", serif';
  x.fillText(s(S.certEyebrow), 600, 130);
  // The two portraits.
  const load = (src: string) => new Promise<HTMLImageElement | null>((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
  const [him, her] = await Promise.all([load(avatarUrl('yifan')), load(avatarUrl('jingyi'))]);
  const portrait = (img: HTMLImageElement | null, cx: number) => {
    x.save(); x.beginPath(); x.arc(cx, 260, 90, 0, Math.PI * 2); x.closePath();
    x.fillStyle = '#f3c4cd'; x.fill(); x.clip();
    if (img) x.drawImage(img, cx - 90, 170, 180, 180);
    x.restore();
    x.lineWidth = 5; x.strokeStyle = '#c39a5c'; x.beginPath(); x.arc(cx, 260, 92, 0, Math.PI * 2); x.stroke();
  };
  portrait(him, 430); portrait(her, 770);
  x.fillStyle = '#d4506d'; x.font = '64px serif'; x.fillText('♥', 600, 282);
  x.fillStyle = '#3b2430';
  x.font = zh ? '72px "Ma Shan Zheng", "Kaiti SC", cursive' : 'italic 600 64px "Cormorant Garamond", Georgia, serif';
  x.fillText(s(S.certTitle), 600, 470);
  x.font = zh ? '30px "Noto Serif SC", serif' : '30px "Cormorant Garamond", Georgia, serif';
  s(S.certText, { date: longDate(day) }).split('\n').forEach((line, i) => x.fillText(line, 600, 545 + i * 48));
  x.fillStyle = '#8b6a76'; x.font = zh ? '24px "Noto Serif SC", serif' : 'italic 24px "Cormorant Garamond", Georgia, serif';
  x.fillText(s(S.certWitness), 600, 670);
  // A red seal.
  x.save(); x.translate(980, 700); x.rotate(-0.18);
  x.strokeStyle = '#c0392b'; x.lineWidth = 6; x.beginPath(); x.arc(0, 0, 70, 0, Math.PI * 2); x.stroke();
  x.fillStyle = '#c0392b'; x.font = '44px "Ma Shan Zheng", "Kaiti SC", cursive'; x.fillText('仪见', 0, -4); x.font = '20px "Noto Serif SC", serif'; x.fillText('小镇民政处', 0, 30);
  x.restore();
  x.fillStyle = '#a8324f'; x.font = '26px "Ma Shan Zheng", "Kaiti SC", cursive';
  x.fillText(`${pick(config.him.name)} · ${pick(config.her.name)}`, 220, 730);
  const blob = await new Promise<Blob | null>((res) => c.toBlob(res, 'image/png'));
  if (!blob) return;
  const name = `yi-town-wedding-${day}.png`;
  const file = new File([blob], name, { type: 'image/png' });
  // On a phone the share sheet saves to Photos; iOS ignores `download` on data links.
  if (navigator.canShare?.({ files: [file] })) { try { await navigator.share({ files: [file], title: name }); return; } catch { /* dismissed: fall through */ } }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
  // And inline, so it can be long-pressed and saved where neither works.
  const card = document.querySelector('.th-card-inner');
  if (card && !card.querySelector('.th-cert')) { const img = new Image(); img.className = 'th-cert'; img.src = url; img.alt = name; card.appendChild(img); }
}
