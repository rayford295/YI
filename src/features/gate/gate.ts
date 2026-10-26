// The front door, shown before anything else until the question is answered once on this device.
import './gate.css';
import { t } from '../../core/i18n';
import { tryGate } from '../../core/gate';

export function renderGate(root: HTMLElement, onPass: () => void): () => void {
  root.innerHTML = `
    <section class="gate">
      <header class="sign gate-head">
        <p class="eyebrow">${t('gate.eyebrow')}</p>
        <h1>${t('gate.title')}</h1>
      </header>
      <form class="gate-form card" id="gate-form" autocomplete="off">
        <label for="gate-answer">${t('gate.question')}</label>
        <input id="gate-answer" name="answer" type="text" inputmode="numeric" placeholder="${t('gate.placeholder')}" required autofocus>
        <button type="submit" class="cta">${t('gate.enter')}</button>
        <p class="gate-wrong" id="gate-wrong" hidden>${t('gate.wrong')}</p>
      </form>
    </section>`;
  const form = root.querySelector<HTMLFormElement>('#gate-form')!;
  const input = root.querySelector<HTMLInputElement>('#gate-answer')!;
  const wrong = root.querySelector<HTMLElement>('#gate-wrong')!;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (await tryGate(input.value)) { onPass(); return; }
    wrong.hidden = false;
    form.classList.remove('shake'); void form.offsetWidth; form.classList.add('shake');
    input.select();
  });
  return () => undefined;
}
