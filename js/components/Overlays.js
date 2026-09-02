import { html } from '../html.js';

const CloseBtn = (onClick) => html`
  <div style="display:flex;justify-content:flex-end;">
    <button class="btn btn-icon" onClick=${onClick}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
  </div>
`;

function Scanning() {
  return html`
    <div style="text-align:center;padding:40px 10px;">
      <div style="width:40px;height:40px;margin:0 auto 16px;border:3px solid var(--color-neutral-300);border-top-color:var(--color-accent);border-radius:50%;animation:lcr-spin 0.9s linear infinite;"></div>
      <p style="font-size:14px;opacity:0.7;margin:0;">Lendo sua nota…</p>
    </div>
  `;
}

function Imoveis(vm) {
  return html`
    <div>
      ${CloseBtn(vm.closeOverlay)}
      <h3 style="margin:0 0 4px;">Propriedades rurais</h3>
      <p style="font-size:12.5px;opacity:0.7;margin:0 0 16px;">Cadastre suas propriedades para vincular aos lançamentos (necessário pro LCDPR)</p>
      ${vm.noImoveis ? html`<div style="text-align:center;padding:24px 4px;opacity:0.6;font-size:13.5px;">Nenhuma propriedade cadastrada ainda.</div>` : null}
      ${vm.hasImoveis ? html`
        <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:14px;">
          ${vm.imoveisList.map((i) => html`
            <div key=${i.id} style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;background:var(--color-surface);">
              <div>
                <div style="font-weight:600;font-size:14.5px;">${i.nome}</div>
                <div style="font-size:11.5px;opacity:0.65;margin-top:2px;">${i.meta}</div>
              </div>
              <button class="btn btn-icon" onClick=${i.onDelete}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
          `)}
        </div>` : null}
      <button class="btn btn-primary btn-block" onClick=${vm.openNovoImovel}>+ Adicionar propriedade</button>
    </div>
  `;
}

function NovoImovel(vm) {
  return html`
    <div>
      ${CloseBtn(vm.voltarImoveis)}
      <h3 style="margin:0 0 4px;">Nova propriedade</h3>
      <p style="font-size:12.5px;opacity:0.7;margin:0 0 16px;">Dados que a Receita Federal exige no LCDPR</p>
      <div class="field" style="margin-bottom:12px;">
        <label>Nome da propriedade</label>
        <input class="input" type="text" placeholder="Ex: Fazenda Santa Rita" value=${vm.novoImovelForm.nome} onChange=${vm.setNomeImovel} style="min-height:44px;padding:11px 13px;font-size:15px;" />
      </div>
      <div class="field" style="margin-bottom:12px;">
        <label>NIRF ou CCIR</label>
        <input class="input" type="text" placeholder="Número do imóvel rural" value=${vm.novoImovelForm.nirf} onChange=${vm.setNirfImovel} style="min-height:44px;padding:11px 13px;font-size:15px;" />
      </div>
      <div style="display:flex;gap:10px;margin-bottom:16px;">
        <div class="field" style="flex:1;margin-bottom:0;">
          <label>Município</label>
          <input class="input" type="text" value=${vm.novoImovelForm.municipio} onChange=${vm.setMunicipioImovel} style="min-height:44px;padding:11px 13px;font-size:15px;" />
        </div>
        <div class="field" style="flex:1;margin-bottom:0;">
          <label>UF</label>
          <input class="input" type="text" maxlength="2" style="text-transform:uppercase;min-height:44px;padding:11px 13px;font-size:15px;" value=${vm.novoImovelForm.uf} onChange=${vm.setUfImovel} />
        </div>
      </div>
      <button class="btn btn-block" onClick=${vm.saveNovoImovel} style="justify-content:center;background:#22331f;color:#f5f1e3;padding:15px 18px;font-size:15px;">Salvar propriedade</button>
    </div>
  `;
}

function VerImagem(vm) {
  return html`
    <div>
      ${CloseBtn(vm.closeOverlay)}
      <h3 style="margin:0 0 12px;">Documento anexado</h3>
      <div style="width:100%;min-height:200px;background-image:url('${vm.viewingImage}');background-size:contain;background-position:center;background-repeat:no-repeat;border:1px solid var(--color-divider);"></div>
    </div>
  `;
}

function LancamentoForm(vm) {
  return html`
    <div>
      ${CloseBtn(vm.closeOverlay)}
      <h3 style="margin:0 0 4px;">${vm.formTitle}</h3>
      <p style="font-size:12.5px;opacity:0.7;margin:0 0 16px;">${vm.formSub}</p>

      ${vm.hasScanError ? html`<div style="background:var(--color-accent-100);border:1px solid var(--color-accent-700);color:var(--color-accent-800);padding:11px 13px;font-size:13px;margin-bottom:14px;">${vm.scanError}</div>` : null}
      ${vm.hasScanImage ? html`<div style="width:100%;height:160px;background-image:url('${vm.scanImage}');background-size:cover;background-position:center;border:1px solid var(--color-divider);margin-bottom:14px;"></div>` : null}

      ${vm.isManualNew ? html`
        <div class="field" style="margin-bottom:14px;">
          <label>Documento (opcional)</label>
          <button class="btn btn-secondary btn-block" onClick=${vm.triggerManualAttach}>Anexar foto do documento</button>
        </div>` : null}

      <div style="display:flex;gap:10px;margin-bottom:14px;">
        <button class=${vm.tipoEntradaClass} onClick=${vm.setTipoEntrada} style="flex:1;justify-content:center;">Entrada (venda)</button>
        <button class=${vm.tipoSaidaClass} onClick=${vm.setTipoSaida} style="flex:1;justify-content:center;">Saída (compra)</button>
      </div>

      <div style="display:flex;gap:10px;margin-bottom:14px;">
        <div class="field" style="flex:1;margin-bottom:0;">
          <label>Data de emissão</label>
          <input class="input" type="date" value=${vm.formData} onChange=${vm.setData} style="min-height:44px;padding:11px 13px;font-size:15px;" />
        </div>
        <div class="field" style="flex:1;margin-bottom:0;">
          <label>Valor</label>
          <div style="position:relative;">
            <span style="position:absolute;left:13px;top:50%;transform:translateY(-50%);font-size:15px;font-weight:700;color:var(--color-text);pointer-events:none;">R$</span>
            <input class="input" type="text" inputmode="numeric" placeholder="0,00" value=${vm.formValorMask} onChange=${vm.setValor} style="min-height:44px;padding:11px 13px 11px 42px;font-size:15px;font-variant-numeric:tabular-nums;text-align:right;" />
          </div>
        </div>
      </div>

      <div style="display:flex;gap:10px;margin-bottom:6px;">
        <div class="field" style="flex:1;margin-bottom:0;">
          <label>Vencimento</label>
          <input class="input" type="date" value=${vm.formVencimento} onChange=${vm.setVencimento} style="min-height:44px;padding:11px 13px;font-size:15px;" />
        </div>
        <div class="field" style="flex:1;margin-bottom:0;">
          <label>Data de pagamento</label>
          <input class="input" type="date" value=${vm.formDataPagamento} onChange=${vm.setDataPagamento} style="min-height:44px;padding:11px 13px;font-size:15px;" />
        </div>
      </div>
      <p style="font-size:11.5px;opacity:0.65;margin:0 0 14px;">Sem data de pagamento, o lançamento fica pendente e só entra no livro caixa no mês em que for pago.</p>

      <div class="field" style="margin-bottom:14px;">
        <label>Descrição</label>
        <input class="input" type="text" placeholder="Ex: ADUBO, DIESEL, VENDA DE SOJA..." value=${vm.formDescricao} onChange=${vm.setDescricao} style="min-height:44px;padding:11px 13px;font-size:15px;text-transform:uppercase;" />
      </div>

      <div class="field" style="margin-bottom:6px;">
        <label>Atividade</label>
        <div style="display:flex;flex-wrap:wrap;gap:8px;">
          ${vm.categorias.map((c) => html`<div key=${c.name} class=${c.chipClass} onClick=${c.select} style="cursor:pointer;padding:7px 13px;font-weight:600;">${c.name}</div>`)}
          <div class="tag tag-outline" style="cursor:pointer;border-style:dashed;padding:7px 13px;font-weight:600;" onClick=${vm.addCustomCategory}>+ nova</div>
        </div>
      </div>

      ${vm.showFiscalOff ? html`<div onClick=${vm.toggleFiscal} style="font-size:13px;color:var(--color-accent-700);font-weight:600;cursor:pointer;text-decoration:underline;margin:4px 0 16px;">+ adicionar detalhes fiscais (LCDPR)</div>` : null}
      ${vm.showFiscal ? html`
        <div style="border-top:1px dashed var(--color-divider);padding-top:14px;margin-top:2px;">
          <h6 style="margin:0 0 12px;">Detalhes fiscais (LCDPR)</h6>

          ${vm.hasImoveisForForm ? html`
            <div class="field" style="margin-bottom:14px;">
              <label>Propriedade</label>
              <div style="display:flex;flex-wrap:wrap;gap:8px;">
                ${vm.imoveisChip.map((ic) => html`<div key=${ic.id} class=${ic.chipClass} onClick=${ic.select} style="cursor:pointer;padding:7px 13px;font-weight:600;">${ic.nome}</div>`)}
              </div>
            </div>` : null}
          ${vm.noImoveisForForm ? html`<p style="font-size:12.5px;opacity:0.7;margin:0 0 14px;">Nenhuma propriedade cadastrada — toque no ícone no topo da tela pra adicionar.</p>` : null}

          <div style="display:flex;gap:10px;margin-bottom:14px;">
            <div class="field" style="flex:1;margin-bottom:0;">
              <label>Tipo de documento</label>
              <select class="input" onChange=${vm.setTipoDoc} style="min-height:44px;padding:11px 13px;font-size:15px;">
                ${vm.tiposDoc.map((td) => html`<option key=${td.name} selected=${td.selected}>${td.name}</option>`)}
              </select>
            </div>
            <div class="field" style="flex:1;margin-bottom:0;">
              <label>Nº do documento</label>
              <input class="input" type="text" value=${vm.formNumDoc} onChange=${vm.setNumDoc} style="min-height:44px;padding:11px 13px;font-size:15px;" />
            </div>
          </div>

          <div class="field" style="margin-bottom:14px;">
            <label>CPF/CNPJ do participante</label>
            <input class="input" type="text" placeholder="De quem comprou ou vendeu" value=${vm.formParticipante} onChange=${vm.setParticipante} style="min-height:44px;padding:11px 13px;font-size:15px;" />
          </div>

          <div class="field" style="margin-bottom:14px;">
            <label>Forma de pagamento</label>
            <select class="input" onChange=${vm.setFormaPagamento} style="min-height:44px;padding:11px 13px;font-size:15px;">
              ${vm.formasPgto.map((fp) => html`<option key=${fp.value} value=${fp.value} selected=${fp.selected}>${fp.label}</option>`)}
            </select>
          </div>

          ${vm.isSaidaForm ? html`
            <div class="field" style="margin-bottom:0;">
              <label>Natureza da despesa</label>
              <div style="display:flex;gap:10px;">
                <button class=${vm.naturezaCusteioClass} onClick=${vm.setNaturezaCusteio} style="flex:1;justify-content:center;">Custeio</button>
                <button class=${vm.naturezaInvestimentoClass} onClick=${vm.setNaturezaInvestimento} style="flex:1;justify-content:center;">Investimento</button>
              </div>
            </div>` : null}
        </div>` : null}

      <button class="btn btn-block" onClick=${vm.saveManual} style="justify-content:center;margin-top:6px;background:#22331f;color:#f5f1e3;padding:15px 18px;font-size:15px;">${vm.saveButtonLabel}</button>
      <div style="display:flex;justify-content:center;margin-top:12px;">
        <a onClick=${vm.closeOverlay} style="font-size:13px;cursor:pointer;color:var(--color-accent-700);">Cancelar</a>
      </div>
    </div>
  `;
}

export function Overlays(vm) {
  if (!vm.overlayOpen) return null;
  return html`
    <div data-print-hide style="position:fixed;inset:0;background:color-mix(in srgb, var(--color-neutral-900) 55%, transparent);z-index:20;display:flex;align-items:flex-end;justify-content:center;">
      <div style="background:var(--color-bg);width:100%;max-width:480px;padding:18px 18px 26px;max-height:88vh;overflow-y:auto;box-shadow:var(--shadow-lg);border-top:2px solid var(--color-divider);">
        ${vm.ovScanning ? Scanning() : null}
        ${vm.ovImoveis ? Imoveis(vm) : null}
        ${vm.ovNovoImovel ? NovoImovel(vm) : null}
        ${vm.ovVerImagem ? VerImagem(vm) : null}
        ${vm.ovForm ? LancamentoForm(vm) : null}
      </div>
    </div>
  `;
}
