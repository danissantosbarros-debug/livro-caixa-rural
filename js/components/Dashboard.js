import { html } from '../html.js';
import { TicketRow } from './TicketRow.js';

export function Dashboard(vm) {
  return html`
    <div>
      <div class="card" style="margin-bottom:14px;background:#22331f;color:#f5f1e3;padding:18px;">
        <div class="card-kicker" style="color:#d3ad4e;">Saldo de ${vm.todayLabel}</div>
        <div style="font-family:var(--font-heading);font-weight:700;font-size:34px;font-variant-numeric:tabular-nums;margin-top:2px;color:${vm.saldoPositive ? '#ffffff' : '#e2a98a'};">${vm.saldoLabel}</div>
        <div style="height:1px;background:rgba(245,241,227,0.22);margin:12px 0;"></div>
        <div style="display:flex;gap:24px;">
          <div style="flex:1;">
            <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.06em;opacity:0.65;">Entradas</div>
            <div style="font-weight:600;font-size:15px;margin-top:2px;color:#9ec98f;">${vm.entradaLabel}</div>
          </div>
          <div style="flex:1;">
            <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.06em;opacity:0.65;">Saídas</div>
            <div style="font-weight:600;font-size:15px;margin-top:2px;color:#e2a98a;">${vm.saidaLabel}</div>
          </div>
        </div>
      </div>

      ${vm.hasPendentes ? html`
        <div style="border:1px solid var(--color-divider);padding:12px 14px;margin-bottom:14px;font-size:12.5px;">
          <strong>Pendente de pagamento:</strong> ${vm.pendentesAPagarLabel} a pagar · ${vm.pendentesAReceberLabel} a receber — só entram no livro caixa quando pagos.
        </div>` : null}

      <button class="btn btn-primary btn-block" onClick=${vm.triggerPhoto} style="padding:16px 18px;gap:14px;">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3.2"/></svg>
        <span style="display:flex;flex-direction:column;gap:2px;">
          <span style="font-family:var(--font-heading);font-weight:800;font-size:16px;">Fotografar compra</span>
          <span style="font-size:12px;font-weight:400;opacity:0.85;">A nota vira lançamento automaticamente</span>
        </span>
      </button>
      <div onClick=${vm.openManual} style="text-align:center;font-size:13px;color:var(--color-accent-700);text-decoration:underline;cursor:pointer;margin:10px 0 4px;font-weight:600;">ou lançar manualmente</div>

      ${vm.hasBreakdown ? html`
        <h6 style="margin:24px 0 10px;">Gastos por atividade</h6>
        <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:8px;">
          ${vm.breakdown.map((b) => html`
            <div key=${b.cat} style="display:flex;align-items:center;gap:10px;font-size:13px;">
              <div style="width:96px;flex-shrink:0;font-weight:600;">${b.cat}</div>
              <div style="flex:1;height:6px;background:var(--color-neutral-200);"><div style="height:100%;background:var(--color-neutral-800);width:${b.pct}%;"></div></div>
              <div style="width:74px;text-align:right;flex-shrink:0;font-variant-numeric:tabular-nums;">${b.val}</div>
            </div>
          `)}
        </div>` : null}

      <div style="display:flex;align-items:baseline;justify-content:space-between;margin:24px 0 8px;">
        <h6 style="margin:0;">Últimos lançamentos</h6>
        <a onClick=${vm.goLista} style="font-size:12px;cursor:pointer;">ver todos</a>
      </div>
      ${vm.noRecent ? html`<div style="text-align:center;padding:32px 12px;opacity:0.6;font-size:13.5px;">Nenhum lançamento ainda.<br/>Fotografe sua primeira nota acima.</div>` : null}
      ${vm.hasRecent ? html`<div>${vm.recent.map((l) => TicketRow(l))}</div>` : null}
    </div>
  `;
}
