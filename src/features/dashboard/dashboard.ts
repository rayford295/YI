// jingyifan.love's front page: one card per product. The town is the first.
import './dashboard.css';
import { t } from '../../core/i18n';
import { PRODUCTS, type Product } from './products';

const card = (p: Product): string => {
  const status = p.status?.();
  return `
    <a class="dash-card sign" href="${p.route}" data-product="${p.id}">
      ${p.image ? `<img src="${import.meta.env.BASE_URL}${p.image}" alt="" loading="lazy" />` : ''}
      <div class="dash-body">
        <h2>${t(p.title)}</h2>
        <p>${t(p.blurb)}</p>
        ${status ? `<p class="dash-status">${status}</p>` : ''}
        <span class="dash-go">${t('dash.enter')} →</span>
      </div>
    </a>`;
};

export function renderDashboard(root: HTMLElement): () => void {
  root.innerHTML = `
    <section class="dash">
      <header class="sign dash-head">
        <p class="eyebrow">${t('dash.eyebrow')}</p>
        <h1>${t('dash.title')}</h1>
        <p class="dash-sub">${t('dash.subtitle')}</p>
      </header>
      <div class="dash-grid">
        ${PRODUCTS.map(card).join('')}
        <div class="dash-card dash-soon sign" aria-label="${t('dash.soon.title')}">
          <div class="dash-body"><span class="dash-seed" aria-hidden="true">🌱</span>
            <h2>${t('dash.soon.title')}</h2><p>${t('dash.soon.blurb')}</p></div>
        </div>
      </div>
    </section>`;
  return () => undefined;
}
