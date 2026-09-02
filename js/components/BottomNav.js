import { html } from '../html.js';

function navBtn(onClick, opacity, label, iconPath) {
  return html`
    <button onClick=${onClick} style="flex:1;background:none;border:none;padding:10px 4px 8px;font-family:var(--font-body);font-size:10.5px;font-weight:600;color:var(--color-text);cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:4px;opacity:${opacity};">
      ${iconPath}
      ${label}
    </button>
  `;
}

export function BottomNav(vm) {
  return html`
    <nav data-print-hide style="position:fixed;bottom:0;left:0;right:0;z-index:6;background:var(--color-surface);border-top:2px solid var(--color-divider);display:flex;justify-content:center;">
      <div style="max-width:480px;width:100%;display:flex;">
        ${navBtn(vm.goDashboard, vm.navOpacityDashboard, 'Painel', html`<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.5 12 3l9 6.5"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/></svg>`)}
        ${navBtn(vm.goRelatorios, vm.navOpacityRelatorios, 'Relatórios', html`<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`)}
        ${navBtn(vm.goLista, vm.navOpacityLista, 'Lançamentos', html`<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`)}
        ${navBtn(vm.openManual, 0.9, 'Lançar', html`<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`)}
      </div>
    </nav>
  `;
}
