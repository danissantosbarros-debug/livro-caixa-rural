import { html } from '../html.js';
import { TicketRow } from './TicketRow.js';

export function Lista(vm) {
  return html`
    <div>
      <div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:14px;">
        <h6 style="margin:0;">Extrato completo</h6>
        <a onClick=${vm.exportarTXT} style="font-size:12px;cursor:pointer;">exportar .txt</a>
      </div>

      <div class="card" data-print-hide style="margin-bottom:18px;padding:14px 16px;">
        <div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:10px;">
          <div class="card-kicker">Filtros</div>
          ${vm.listaHasFilters ? html`<a onClick=${vm.listaClear} style="font-size:12px;cursor:pointer;">limpar filtros</a>` : null}
        </div>
        <div style="display:flex;flex-direction:column;gap:12px;">
          <div>
            <div style="font-size:10.5px;text-transform:uppercase;letter-spacing:0.06em;opacity:0.6;margin-bottom:6px;">Vencimento</div>
            <div style="display:flex;gap:8px;">
              <div class="field" style="flex:1;margin-bottom:0;">
                <label style="font-size:10.5px;">De</label>
                <input class="input" type="date" value=${vm.listaFrom} onChange=${vm.setListaFrom} style="min-height:42px;font-size:14px;" />
              </div>
              <div class="field" style="flex:1;margin-bottom:0;">
                <label style="font-size:10.5px;">Até</label>
                <input class="input" type="date" value=${vm.listaTo} onChange=${vm.setListaTo} style="min-height:42px;font-size:14px;" />
              </div>
            </div>
          </div>
          <div>
            <div style="font-size:10.5px;text-transform:uppercase;letter-spacing:0.06em;opacity:0.6;margin-bottom:6px;">Tipo</div>
            <div style="display:flex;gap:6px;">
              ${vm.listaTipoFilters.map((t) => html`<span key=${t.label} class=${t.chipClass} onClick=${t.select} style="cursor:pointer;white-space:nowrap;">${t.label}</span>`)}
            </div>
          </div>
          <div>
            <div style="font-size:10.5px;text-transform:uppercase;letter-spacing:0.06em;opacity:0.6;margin-bottom:6px;">Situação</div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              ${vm.listaStatusFilters.map((st) => html`<span key=${st.label} class=${st.chipClass} onClick=${st.select} style="cursor:pointer;white-space:nowrap;">${st.label}</span>`)}
            </div>
          </div>
        </div>
        <div class="hr" style="margin:12px 0 10px;"></div>
        <div style="display:flex;gap:20px;">
          <div style="flex:1;"><div style="font-size:10.5px;text-transform:uppercase;letter-spacing:0.06em;opacity:0.6;">Lançamentos</div><div style="font-weight:600;font-size:14px;margin-top:2px;">${vm.listaCount}</div></div>
          <div style="flex:1;"><div style="font-size:10.5px;text-transform:uppercase;letter-spacing:0.06em;opacity:0.6;">Entradas</div><div style="font-weight:600;font-size:14px;margin-top:2px;">${vm.listaTotalEntrada}</div></div>
          <div style="flex:1;"><div style="font-size:10.5px;text-transform:uppercase;letter-spacing:0.06em;opacity:0.6;">Saídas</div><div style="font-weight:600;font-size:14px;margin-top:2px;color:var(--color-accent-700);">${vm.listaTotalSaida}</div></div>
        </div>
      </div>

      ${vm.noAll ? html`<div style="text-align:center;padding:32px 12px;opacity:0.6;font-size:13.5px;">${vm.listaEmptyMsg}</div>` : null}
      ${vm.hasAll ? html`<div>${vm.allTickets.map((l) => TicketRow(l))}</div>` : null}

      <div style="padding:14px 4px 0;font-size:11px;opacity:0.55;">O arquivo exportado é uma planilha organizada pra mandar pro seu contador — ainda não é o leiaute oficial do SPED LCDPR.</div>
    </div>
  `;
}
