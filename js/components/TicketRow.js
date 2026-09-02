import { html } from '../html.js';

export function TicketRow(l) {
  return html`
    <div key=${l.id} onClick=${l.onClick} style="display:flex;align-items:center;gap:12px;padding:11px 0;border-bottom:1px solid var(--color-divider);cursor:${l.hasImage ? 'pointer' : 'default'};">
      <div style="flex:1;min-width:0;">
        <div style="display:flex;align-items:center;gap:6px;">
          <div style="font-weight:600;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${l.desc}</div>
          <span class=${l.statusClass}>${l.statusLabel}</span>
        </div>
        <div style="font-size:11.5px;opacity:0.6;margin-top:2px;">${l.meta}</div>
      </div>
      ${l.isEntrada ? html`<div style="font-weight:700;font-size:14px;font-variant-numeric:tabular-nums;">${l.valLabel}</div>` : null}
      ${l.isSaida ? html`<div style="font-weight:700;font-size:14px;font-variant-numeric:tabular-nums;color:var(--color-accent-700);">${l.valLabel}</div>` : null}
      ${l.isPendente ? html`
        <button class="btn btn-icon" onClick=${l.onMarkPaid} title="Marcar como pago" style="width:26px;height:26px;flex-shrink:0;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </button>` : null}
      <button class="btn btn-icon" onClick=${l.onEdit} title="Editar" style="width:26px;height:26px;flex-shrink:0;">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
      </button>
      <button class="btn btn-icon" onClick=${l.onDelete} style="width:26px;height:26px;flex-shrink:0;">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
  `;
}
