import { html } from '../html.js';

export function Header(vm) {
  return html`
    <header data-print-hide style="position:sticky;top:0;z-index:5;display:flex;align-items:center;justify-content:space-between;padding:16px 20px 14px;border-bottom:2px solid var(--color-divider);background:var(--color-bg);">
      <div>
        <div style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:var(--color-accent);font-weight:600;">Livro Caixa</div>
        <h1 style="font-size:22px;margin:2px 0 0;">Meu Talhão</h1>
      </div>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-secondary btn-icon" onClick=${vm.openImoveis} title="Propriedades" style="width:40px;height:40px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        </button>
        <button class="btn btn-secondary btn-icon" onClick=${vm.doLogout} title="Sair" style="width:40px;height:40px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
      </div>
    </header>
  `;
}
