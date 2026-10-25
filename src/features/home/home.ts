import './home.css';
import { t, pick, getLang } from '../../core/i18n';
import { config } from '../../core/config';
import { letter, letterParagraphs } from '../birthday-map/letter';
import { dayNumberSince, clockIn, hoursApart, countdownTo } from '../../core/dates';

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
  const nm = config.nextMeeting;
  root.innerHTML = `
    <section class="hero">
      <p class="eyebrow">${t('home.eyebrow')}</p>
      <h1 class="hero-title">${t('home.greeting')}</h1>
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
    <section class="letter card">
      <h2>${t('home.letter.title')}</h2>
      ${letterParagraphs(lang, hoursApart(config.her.zone, config.him.zone, new Date())).map((p) => `<p>${p}</p>`).join('')}
      <p class="signature">— ${pick(letter.signature)}</p>
    </section>
    <a class="cta" href="#/map">${t('home.cta.map')} →</a>`;

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
  return () => clearInterval(timer);
}
