import { html } from '../html.js';

function TabLivro(vm) {
  return html`
    <div>
      <div class="card" style="margin-bottom:20px;">
        <div class="card-kicker">${vm.resultLabel} · ${vm.periodLabel}</div>
        <div style="font-family:var(--font-heading);font-weight:800;font-size:28px;font-variant-numeric:tabular-nums;margin-top:2px;color:${vm.annualPositive ? 'inherit' : 'var(--color-accent-700)'};">${vm.annualSaldo}</div>
        <div class="hr" style="margin:10px 0;"></div>
        <div style="display:flex;gap:24px;">
          <div style="flex:1;"><div style="font-size:11px;text-transform:uppercase;letter-spacing:0.06em;opacity:0.6;">Entradas</div><div style="font-weight:600;font-size:15px;margin-top:2px;">${vm.annualEntrada}</div></div>
          <div style="flex:1;"><div style="font-size:11px;text-transform:uppercase;letter-spacing:0.06em;opacity:0.6;">Saídas</div><div style="font-weight:600;font-size:15px;margin-top:2px;color:var(--color-accent-700);">${vm.annualSaida}</div></div>
        </div>
      </div>

      <h6 style="margin:0 0 10px;">Entradas x saídas por mês</h6>
      <div style="display:flex;align-items:flex-end;gap:8px;height:150px;margin-bottom:8px;padding:0 2px;">
        ${vm.chartMonths.map((m, i) => html`
          <div key=${i} style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;">
            <div style="display:flex;align-items:flex-end;gap:2px;height:130px;">
              <div style="width:7px;background:var(--color-neutral-800);height:${m.entradaH}px;"></div>
              <div style="width:7px;background:var(--color-accent-700);height:${m.saidaH}px;"></div>
            </div>
            <div onClick=${m.select} style="font-size:10px;opacity:${m.labelOpacity};font-weight:${m.labelWeight};cursor:pointer;">${m.label}</div>
          </div>
        `)}
      </div>
      <div style="display:flex;gap:16px;margin-bottom:24px;font-size:11px;">
        <div style="display:flex;align-items:center;gap:5px;"><div style="width:8px;height:8px;background:var(--color-neutral-800);"></div>Entradas</div>
        <div style="display:flex;align-items:center;gap:5px;"><div style="width:8px;height:8px;background:var(--color-accent-700);"></div>Saídas</div>
      </div>

      ${vm.hasMaiorGasto ? html`
        <div class="card" style="margin-bottom:20px;">
          <div class="card-kicker">Maior saída do período</div>
          <div class="card-title" style="margin-top:2px;">${vm.maiorGasto.desc}</div>
          <div class="card-body">${vm.maiorGasto.categoria} · ${vm.maiorGasto.valor}</div>
          <div class="card-meta">${vm.maiorGasto.data}</div>
        </div>` : null}
      ${vm.noMaiorGasto ? html`<div class="card" style="margin-bottom:20px;"><div class="card-body" style="opacity:0.7;">Nenhuma saída no período selecionado.</div></div>` : null}

      <h6 style="margin:0 0 10px;">Livro caixa — ${vm.periodLabel}</h6>
      ${vm.noLedger ? html`<div style="text-align:center;padding:24px 12px;opacity:0.6;font-size:13.5px;margin-bottom:20px;">Nenhum lançamento pago com os filtros selecionados.</div>` : null}
      ${vm.hasLedger ? html`
        <div style="overflow-x:auto;margin-bottom:20px;">
          <table class="table">
            <thead><tr><th>Data</th><th>Descrição</th><th>Entrada</th><th>Saída</th><th>Saldo</th></tr></thead>
            <tbody>
              ${vm.ledgerRows.map((r, i) => html`
                <tr key=${i}>
                  <td style="white-space:nowrap;">${r.data}</td>
                  <td>${r.desc}</td>
                  <td style="font-variant-numeric:tabular-nums;">${r.entrada}</td>
                  <td style="font-variant-numeric:tabular-nums;">${r.saida}</td>
                  <td style="font-variant-numeric:tabular-nums;font-weight:600;white-space:nowrap;color:${r.saldoNeg ? 'var(--color-accent-700)' : 'inherit'};">${r.saldo}</td>
                </tr>
              `)}
            </tbody>
          </table>
        </div>` : null}
    </div>
  `;
}

function TabVenc(vm) {
  return html`
    <div>
      <div class="card" style="margin-bottom:20px;">
        <div class="card-kicker">Contas por vencimento · ${vm.periodLabel}</div>
        <div class="hr" style="margin:10px 0;"></div>
        <div style="display:flex;gap:24px;">
          <div style="flex:1;"><div style="font-size:11px;text-transform:uppercase;letter-spacing:0.06em;opacity:0.6;">A receber (em aberto)</div><div style="font-weight:600;font-size:15px;margin-top:2px;">${vm.vencTotalEntrada}</div></div>
          <div style="flex:1;"><div style="font-size:11px;text-transform:uppercase;letter-spacing:0.06em;opacity:0.6;">A pagar (em aberto)</div><div style="font-weight:600;font-size:15px;margin-top:2px;color:var(--color-accent-700);">${vm.vencTotalSaida}</div></div>
        </div>
        <div class="hr" style="margin:10px 0;"></div>
        <div style="display:flex;gap:24px;">
          <div style="flex:1;"><div style="font-size:11px;text-transform:uppercase;letter-spacing:0.06em;opacity:0.6;">Em aberto</div><div style="font-weight:600;font-size:15px;margin-top:2px;">${vm.vencTotalAberto}</div></div>
          <div style="flex:1;"><div style="font-size:11px;text-transform:uppercase;letter-spacing:0.06em;opacity:0.6;">Vencido</div><div style="font-weight:600;font-size:15px;margin-top:2px;color:var(--color-accent-700);">${vm.vencTotalAtrasado}</div></div>
        </div>
      </div>

      <h6 style="margin:0 0 10px;">Contas · ${vm.periodLabel}</h6>
      ${vm.noVenc ? html`<div style="text-align:center;padding:24px 12px;opacity:0.6;font-size:13.5px;margin-bottom:20px;">Nenhuma conta com os filtros selecionados.</div>` : null}
      ${vm.hasVenc ? html`
        <div style="overflow-x:auto;margin-bottom:20px;">
          <table class="table">
            <thead><tr><th>Vencimento</th><th>Descrição</th><th>Valor</th><th>Situação</th><th>Pagamento</th></tr></thead>
            <tbody>
              ${vm.vencRows.map((r, i) => html`
                <tr key=${i}>
                  <td style="white-space:nowrap;">${r.vencimento}</td>
                  <td>${r.desc}</td>
                  <td style="font-variant-numeric:tabular-nums;white-space:nowrap;color:${r.isSaida ? 'var(--color-accent-700)' : 'inherit'};">${r.valor}</td>
                  <td style="white-space:nowrap;"><span class=${r.statusClass}>${r.statusLabel}</span></td>
                  <td style="white-space:nowrap;">${r.pagamento}</td>
                </tr>
              `)}
            </tbody>
          </table>
        </div>` : null}
    </div>
  `;
}

function TabFluxo(vm) {
  return html`
    <div>
      <div class="card" style="margin-bottom:20px;">
        <div class="card-kicker">Fluxo de caixa · ${vm.periodLabel}</div>
        <div style="font-family:var(--font-heading);font-weight:800;font-size:28px;font-variant-numeric:tabular-nums;margin-top:2px;color:${vm.fluxoPositive ? 'inherit' : 'var(--color-accent-700)'};">${vm.fluxoSaldo}</div>
        <div class="hr" style="margin:10px 0;"></div>
        <div style="display:flex;gap:24px;">
          <div style="flex:1;"><div style="font-size:11px;text-transform:uppercase;letter-spacing:0.06em;opacity:0.6;">Entradas</div><div style="font-weight:600;font-size:15px;margin-top:2px;">${vm.fluxoEntrada}</div></div>
          <div style="flex:1;"><div style="font-size:11px;text-transform:uppercase;letter-spacing:0.06em;opacity:0.6;">Saídas</div><div style="font-weight:600;font-size:15px;margin-top:2px;color:var(--color-accent-700);">${vm.fluxoSaida}</div></div>
        </div>
        <div class="card-meta" style="margin-top:10px;">${vm.fluxoBasisNote}</div>
      </div>

      <h6 style="margin:0 0 10px;">Movimento por mês</h6>
      ${vm.noFluxo ? html`<div style="text-align:center;padding:24px 12px;opacity:0.6;font-size:13.5px;margin-bottom:20px;">Nenhum movimento com os filtros selecionados.</div>` : null}
      ${vm.hasFluxo ? html`
        <div style="overflow-x:auto;margin-bottom:20px;">
          <table class="table">
            <thead><tr><th>Mês</th><th>Entradas</th><th>Saídas</th><th>Saldo</th><th>Acumulado</th></tr></thead>
            <tbody>
              ${vm.fluxoRows.map((r, i) => html`
                <tr key=${i}>
                  <td style="white-space:nowrap;">${r.mes}</td>
                  <td style="font-variant-numeric:tabular-nums;">${r.entrada}</td>
                  <td style="font-variant-numeric:tabular-nums;">${r.saida}</td>
                  <td style="font-variant-numeric:tabular-nums;font-weight:600;white-space:nowrap;color:${r.saldoNeg ? 'var(--color-accent-700)' : 'inherit'};">${r.saldo}</td>
                  <td style="font-variant-numeric:tabular-nums;font-weight:600;white-space:nowrap;color:${r.acumNeg ? 'var(--color-accent-700)' : 'inherit'};">${r.acumulado}</td>
                </tr>
              `)}
            </tbody>
          </table>
        </div>` : null}
    </div>
  `;
}

export function Relatorios(vm) {
  return html`
    <div>
      <div style="display:flex;gap:6px;margin-bottom:16px;overflow-x:auto;">
        ${vm.years.map((y) => html`<span key=${y.year} class="tag ${y.selected ? 'tag-accent' : 'tag-outline'}" onClick=${y.select} style="cursor:pointer;">${y.year}</span>`)}
      </div>

      <div data-print-hide style="display:flex;gap:6px;margin-bottom:16px;overflow-x:auto;">
        ${vm.reportTabs.map((tb) => html`<span key=${tb.label} class=${tb.chipClass} onClick=${tb.select} style="cursor:pointer;white-space:nowrap;">${tb.label}</span>`)}
      </div>

      <div class="card" data-print-hide style="margin-bottom:20px;padding:14px 16px;">
        <div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:10px;">
          <div class="card-kicker">Filtros</div>
          ${vm.hasFilters ? html`<a onClick=${vm.clearFilters} style="font-size:12px;cursor:pointer;">limpar filtros</a>` : null}
        </div>
        <div style="display:flex;flex-direction:column;gap:12px;">
          <div>
            <div style="font-size:10.5px;text-transform:uppercase;letter-spacing:0.06em;opacity:0.6;margin-bottom:6px;">Período — ${vm.periodBasis}</div>
            <div style="display:flex;gap:8px;">
              <div class="field" style="flex:1;margin-bottom:0;">
                <label style="font-size:10.5px;">De</label>
                <input class="input" type="date" value=${vm.reportFrom} onChange=${vm.setReportFrom} style="min-height:42px;font-size:14px;" />
              </div>
              <div class="field" style="flex:1;margin-bottom:0;">
                <label style="font-size:10.5px;">Até</label>
                <input class="input" type="date" value=${vm.reportTo} onChange=${vm.setReportTo} style="min-height:42px;font-size:14px;" />
              </div>
            </div>
            <div style="display:flex;gap:6px;overflow-x:auto;padding:8px 0 2px;">
              ${vm.monthFilters.map((m) => html`<span key=${m.label} class=${m.chipClass} onClick=${m.select} style="cursor:pointer;white-space:nowrap;">${m.label}</span>`)}
            </div>
          </div>
          <div>
            <div style="font-size:10.5px;text-transform:uppercase;letter-spacing:0.06em;opacity:0.6;margin-bottom:6px;">Tipo</div>
            <div style="display:flex;gap:6px;">
              ${vm.tipoFilters.map((t) => html`<span key=${t.label} class=${t.chipClass} onClick=${t.select} style="cursor:pointer;white-space:nowrap;">${t.label}</span>`)}
            </div>
          </div>
          ${vm.showStatusFilter ? html`
            <div>
              <div style="font-size:10.5px;text-transform:uppercase;letter-spacing:0.06em;opacity:0.6;margin-bottom:6px;">Situação</div>
              <div style="display:flex;gap:6px;">
                ${vm.statusFilters.map((st) => html`<span key=${st.label} class=${st.chipClass} onClick=${st.select} style="cursor:pointer;white-space:nowrap;">${st.label}</span>`)}
              </div>
            </div>` : null}
          ${vm.showImovelFilter ? html`
            <div>
              <div style="font-size:10.5px;text-transform:uppercase;letter-spacing:0.06em;opacity:0.6;margin-bottom:6px;">Imóvel</div>
              <div style="display:flex;gap:6px;flex-wrap:wrap;">
                ${vm.imovelFilters.map((i) => html`<span key=${i.label} class=${i.chipClass} onClick=${i.select} style="cursor:pointer;white-space:nowrap;">${i.label}</span>`)}
              </div>
            </div>` : null}
          <div>
            <div style="font-size:10.5px;text-transform:uppercase;letter-spacing:0.06em;opacity:0.6;margin-bottom:6px;">Categoria</div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              ${vm.catFilters.map((c) => html`<span key=${c.label} class=${c.chipClass} onClick=${c.select} style="cursor:pointer;white-space:nowrap;">${c.label}</span>`)}
            </div>
          </div>
        </div>
      </div>

      ${vm.isTabLivro ? TabLivro(vm) : null}
      ${vm.isTabVenc ? TabVenc(vm) : null}
      ${vm.isTabFluxo ? TabFluxo(vm) : null}

      <button class="btn btn-secondary btn-block" onClick=${vm.exportarRelatorioPDF}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Exportar relatório em PDF
      </button>
    </div>
  `;
}
