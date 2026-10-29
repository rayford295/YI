import './home.css';
import { t, pick, getLang } from '../../core/i18n';
import { config } from '../../core/config';
import { dayNumberSince, clockIn, hoursApart, countdownTo } from '../../core/dates';
import { QUESTIONS } from '../../core/quiz';
import { getPlayer, isCleared, levelNumber, type PlayerId } from '../../core/quest';
import { escapeAttr } from '../../core/html';
import { LINE, VOW, saidTheLine } from './vow';
import { canListen, listen, type Listening } from './speech';
import { levelCleared, toast } from '../../core/quest-ui';
import { shuffle } from '../../core/random';

function clockCard(id: string, label: string): string {
  return `<div class="clock card" id="clock-${id}">
    <span class="clock-icon" aria-hidden="true"></span>
    <p class="clock-label">${label}</p>
    <p class="clock-time"></p>
    <p class="clock-day"></p>
  </div>`;
}

export function renderHome(root: HTMLElement): () => void {
  const lang = getLang();
  const me: PlayerId = getPlayer() ?? 'jingyi';
  const nm = config.nextMeeting;
  root.innerHTML = `
    <section class="hero sign">
      <p class="eyebrow">${t('home.eyebrow')}</p>
      <h1 class="hero-title">${t(getPlayer() === 'yifan' ? 'home.greeting.yifan' : 'home.greeting')}</h1>
      <p class="hero-sub">${t('home.subline')}</p>
    </section>
    <section class="counter card">
      <span>${t('home.counter.prefix')}</span>
      <strong id="day-n"></strong>
      <span>${t('home.counter.suffix')}</span>
    </section>
    <section class="clocks">
      ${clockCard('her', t('home.clock.her'))}
      <div class="clocks-link" aria-hidden="true">❤</div>
      ${clockCard('him', t('home.clock.him'))}
    </section>
    <p class="diff" id="diff"></p>
    <section class="countdown card">
      <p class="countdown-title" id="countdown-title">${t('home.countdown.title', { flight: nm.flight, place: pick(nm.place) })}</p>
      <div class="countdown-grid" id="countdown"></div>
    </section>
    <section class="quiz card" id="quiz">
      <p class="quest-task${isCleared('met') ? ' done' : ''}">${isCleared('met') ? t('quest.cleared.eyebrow', { n: levelNumber('met') }) : t('quest.task.met', { n: levelNumber('met') })}</p>
      ${isCleared('met') ? '' : (() => {
        const q = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
        const opts = shuffle(q.options.map((o, i) => ({ o, i })));
        return `<h2>${pick(q.q)}</h2><div class="quiz-options">${opts.map(({ o, i }) =>
          `<button type="button" class="quiz-opt" data-ok="${i === q.answer ? 1 : 0}">${pick(o)}</button>`).join('')}</div>`;
      })()}
    </section>
    <section class="vow card" id="vow" ${isCleared('met') ? '' : 'hidden'}>
      <p class="vow-eyebrow">${t('home.vow.eyebrow')}</p>
      <h2>${t('home.vow.title')}</h2>
      <p class="vow-text">${escapeAttr(pick(VOW[me]))}</p>
      <p class="vow-ask">${isCleared('met') ? t('home.vow.said') : t('home.vow.ask')}</p>
      <p class="vow-line">${escapeAttr(LINE[me])}</p>
      ${isCleared('met') ? '' : `
      <button type="button" class="cta vow-mic" id="vow-mic">${canListen() ? t('home.vow.mic') : t('home.vow.type')}</button>
      ${canListen() ? `<button type="button" class="link vow-or" id="vow-or">${t('home.vow.ortype')}</button>` : ''}
      <p class="vow-heard" id="vow-heard" aria-live="polite"></p>
      <form class="vow-typed" id="vow-typed" hidden autocomplete="off">
        <input type="text" id="vow-input" placeholder="${escapeAttr(LINE[me])}" required>
        <button type="submit" class="cta">${t('home.vow.send')}</button>
      </form>`}
    </section>
    <a class="cta" href="/town">${t('quest.back.town')}</a>`;

  root.querySelectorAll<HTMLButtonElement>('.quiz-opt').forEach((b) => b.addEventListener('click', () => {
    if (b.dataset.ok === '1') {
      root.querySelectorAll<HTMLButtonElement>('.quiz-opt').forEach((x) => { x.disabled = true; x.classList.toggle('right', x === b); });
      root.querySelector<HTMLElement>('#vow')!.hidden = false;
      root.querySelector<HTMLElement>('#vow')!.scrollIntoView({ behavior: 'smooth', block: 'start' });
      toast(t('home.vow.unlocked'));
    } else { b.classList.add('wrong'); b.disabled = true; toast(t('quest.task.met.wrong')); }
  }));

  // The vow: say the line (or, where the browser cannot listen, type it).
  const mic = root.querySelector<HTMLButtonElement>('#vow-mic');
  const heard = root.querySelector<HTMLElement>('#vow-heard');
  const typed = root.querySelector<HTMLFormElement>('#vow-typed');
  let session: Listening | null = null;
  let misses = 0;
  let disposed = false;
  const accept = (text: string) => {
    if (disposed) return;
    if (!saidTheLine(text, me)) {
      misses++;
      heard!.textContent = t('home.vow.notyet', { heard: text });
      if (misses >= 3 && typed) { typed.hidden = false; root.querySelector<HTMLInputElement>('#vow-input')!.focus(); }
      return;
    }
    heard!.textContent = t('home.vow.yes', { heard: text });
    root.querySelector<HTMLElement>('#vow .vow-ask')!.textContent = t('home.vow.said');
    mic!.hidden = true; if (typed) typed.hidden = true;
    root.querySelector('#quiz .quest-task')!.classList.add('done');
    levelCleared('met');
  };
  mic?.addEventListener('click', () => {
    if (!canListen()) { typed!.hidden = false; root.querySelector<HTMLInputElement>('#vow-input')!.focus(); return; }
    if (session) { session.stop(); return; }
    mic.classList.add('listening'); mic.textContent = t('home.vow.listening'); heard!.textContent = '';
    session = listen();
    session.done.then(accept, (err: Error) => {
      heard!.textContent = t(err.message === 'not-allowed' || err.message === 'service-not-allowed' ? 'home.vow.denied' : 'home.vow.silence');
      misses++;
      if (misses >= 2 && typed) typed.hidden = false;
    }).finally(() => { session = null; mic.classList.remove('listening'); mic.textContent = t('home.vow.mic'); });
  });
  root.querySelector('#vow-or')?.addEventListener('click', (e) => { typed!.hidden = false; (e.currentTarget as HTMLElement).hidden = true; root.querySelector<HTMLInputElement>('#vow-input')!.focus(); });
  typed?.addEventListener('submit', (e) => { e.preventDefault(); accept(root.querySelector<HTMLInputElement>('#vow-input')!.value); });

  const q = <T extends HTMLElement = HTMLElement>(sel: string) => root.querySelector<T>(sel)!;

  const paintClock = (id: string, zone: string, now: Date) => {
    const c = clockIn(zone, now, getLang());
    const el = q(`#clock-${id}`);
    el.classList.toggle('is-night', !c.isDay);
    el.querySelector('.clock-icon')!.textContent = c.isDay ? '☀' : '☾';
    el.querySelector('.clock-time')!.textContent = c.time;
    el.querySelector('.clock-day')!.textContent = `${c.day} · ${t(c.isDay ? 'home.clock.day' : 'home.clock.night')}`;
  };

  const tick = () => {
    const now = new Date();
    q('#day-n').textContent = String(dayNumberSince(config.metOn, now, config.her.zone));
    paintClock('her', config.her.zone, now);
    paintClock('him', config.him.zone, now);
    q('#diff').textContent = t('home.diff', { h: hoursApart(config.her.zone, config.him.zone, now) });
    const cd = countdownTo(new Date(nm.at), now);
    q('#countdown-title').hidden = cd.done;
    q('#countdown').innerHTML = cd.done
      ? `<p class="together">${t('home.countdown.together')}</p>`
      : (['days', 'hours', 'minutes'] as const)
          .map((u) => `<div><strong>${cd[u]}</strong><span>${t(`home.countdown.${u}`)}</span></div>`)
          .join('');
  };

  tick();
  const timer = setInterval(tick, 1000);
  return () => { clearInterval(timer); disposed = true; session?.abort(); };
}
