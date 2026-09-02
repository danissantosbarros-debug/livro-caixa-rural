import { React } from './html.js';
import {
  DEFAULT_CATS, TIPOS_DOC, FORMAS_PGTO, MONTH_ABBR, MONTH_FULL,
  fmtBRL, fmtDate, monthLabel, todayISO, uid, lastDay, fmtValorInput,
  compressImage, fileToDataURL
} from './format.js';

const { useState, useRef, useEffect, useCallback, useMemo } = React;

function blankFormInit(imoveis) {
  return {
    tipo: 'saida', data: '', vencimento: '', dataPagamento: '', descricao: '', categoria: '',
    valor: '', showFiscal: false,
    imovelId: imoveis && imoveis.length === 1 ? imoveis[0].id : '',
    tipoDoc: 'Nota Fiscal', numDoc: '', participante: '',
    formaPagamento: 'conta', natureza: 'custeio'
  };
}

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* ignore */ }
  return fallback;
}

function persistJSON(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* ignore */ }
}

export function useApp() {
  const [s, setS] = useState({
    loaded: false,
    authenticated: false,
    loginUser: '', loginPass: '', loginError: '',
    view: 'dashboard',
    lancamentos: [],
    categorias: [...DEFAULT_CATS],
    imoveis: [],
    overlay: null,
    scanImage: null,
    scanError: null,
    viewingImage: null,
    toast: null,
    novoImovelForm: { nome: '', nirf: '', municipio: '', uf: '' },
    editingId: null,
    reportYear: new Date().getFullYear(),
    listaFrom: '', listaTo: '', listaTipo: 'all', listaStatus: 'all',
    reportTab: 'livro', reportStatus: 'all',
    reportFrom: '', reportTo: '', reportTipo: 'all', reportImovel: 'all', reportCategoria: 'all',
    form: blankFormInit([])
  });

  const patch = useCallback((p) => {
    setS((prev) => ({ ...prev, ...(typeof p === 'function' ? p(prev) : p) }));
  }, []);

  const patchForm = useCallback((k, v) => {
    setS((prev) => ({ ...prev, form: { ...prev.form, [k]: v } }));
  }, []);

  const toastTimer = useRef(null);
  const photoInputRef = useRef(null);
  const attachInputRef = useRef(null);

  // ---- initial load ----
  useEffect(() => {
    let lancamentos = loadJSON('lcr_lancamentos', []);
    const categorias = loadJSON('lcr_categorias', [...DEFAULT_CATS]);
    const imoveis = loadJSON('lcr_imoveis', []);
    lancamentos = lancamentos.map((l) =>
      typeof l.dataPagamento === 'undefined' ? { ...l, dataPagamento: l.data, vencimento: l.vencimento || '' } : l
    );
    const f = blankFormInit(imoveis);
    f.data = todayISO();
    f.categoria = categorias[0] || '';
    let authenticated = false;
    try { authenticated = localStorage.getItem('lcr_sessao') === '1'; } catch (e) { /* ignore */ }
    patch({ loaded: true, authenticated, lancamentos, categorias, imoveis, form: f });
  }, [patch]);

  const showToast = useCallback((msg) => {
    patch({ toast: msg });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => patch({ toast: null }), 2200);
  }, [patch]);

  // ---- auth ----
  const doLogin = useCallback(() => {
    setS((prev) => {
      if (!prev.loginUser.trim() || !prev.loginPass.trim()) {
        return { ...prev, loginError: 'Preencha usuário e senha.' };
      }
      try { localStorage.setItem('lcr_sessao', '1'); } catch (e) { /* ignore */ }
      return { ...prev, authenticated: true, loginError: '' };
    });
  }, []);

  const doLogout = useCallback(() => {
    try { localStorage.removeItem('lcr_sessao'); } catch (e) { /* ignore */ }
    patch({ authenticated: false, loginUser: '', loginPass: '', loginError: '', view: 'dashboard' });
  }, [patch]);

  // ---- navigation / overlays ----
  const switchView = useCallback((v) => patch({ view: v }), [patch]);

  const openManual = useCallback(() => {
    setS((prev) => {
      const f = blankFormInit(prev.imoveis);
      f.data = todayISO();
      f.categoria = prev.categorias[0] || '';
      return { ...prev, form: f, overlay: 'manual', editingId: null, scanImage: null, scanError: null };
    });
  }, []);

  const openEdit = useCallback((id) => {
    setS((prev) => {
      const l = prev.lancamentos.find((x) => x.id === id);
      if (!l) return prev;
      const f = blankFormInit(prev.imoveis);
      f.tipo = l.tipo; f.data = l.data || '';
      f.vencimento = l.vencimento || ''; f.dataPagamento = l.dataPagamento || '';
      f.descricao = l.descricao || ''; f.categoria = l.categoria || '';
      f.valor = String(l.valor); f.imovelId = l.imovelId || '';
      f.tipoDoc = l.tipoDoc || f.tipoDoc; f.numDoc = l.numDoc || '';
      f.participante = l.participante || ''; f.formaPagamento = l.formaPagamento || f.formaPagamento;
      f.natureza = l.natureza || f.natureza;
      f.showFiscal = !!(l.numDoc || l.participante);
      return { ...prev, form: f, overlay: 'editar', editingId: id, scanImage: l.imagem || null, scanError: null };
    });
  }, []);

  const closeOverlay = useCallback(() => patch({ overlay: null, editingId: null, scanImage: null, scanError: null }), [patch]);
  const toggleFiscal = useCallback(() => setS((prev) => ({ ...prev, form: { ...prev.form, showFiscal: !prev.form.showFiscal } })), []);
  const setTipo = useCallback((t) => patchForm('tipo', t), [patchForm]);

  const setValorMasked = useCallback((e) => {
    const digits = String(e.target.value).replace(/\D/g, '');
    if (!digits) { patchForm('valor', ''); return; }
    patchForm('valor', (parseInt(digits, 10) / 100).toFixed(2));
  }, [patchForm]);

  // ---- lançamentos ----
  const saveManual = useCallback(() => {
    setS((prev) => {
      const f = prev.form;
      if (!f.data || !f.valor || parseFloat(f.valor) <= 0) {
        showToast('Preencha data e valor');
        return prev;
      }
      if (prev.overlay === 'editar' && prev.editingId) {
        const list = prev.lancamentos.map((l) => l.id !== prev.editingId ? l : {
          ...l, tipo: f.tipo, data: f.data,
          vencimento: f.vencimento || '', dataPagamento: f.dataPagamento || '',
          descricao: (f.descricao || (f.tipo === 'entrada' ? 'Venda' : 'Compra')).toUpperCase(),
          categoria: f.categoria, valor: parseFloat(f.valor),
          imovelId: f.imovelId || null, tipoDoc: f.tipoDoc, numDoc: f.numDoc || '',
          participante: f.participante || '', formaPagamento: f.formaPagamento,
          natureza: f.tipo === 'saida' ? f.natureza : ''
        });
        persistJSON('lcr_lancamentos', list);
        showToast('Lançamento atualizado');
        return { ...prev, lancamentos: list, overlay: null, editingId: null, scanImage: null, scanError: null };
      }
      const record = {
        id: uid(), tipo: f.tipo, data: f.data,
        vencimento: f.vencimento || '', dataPagamento: f.dataPagamento || '',
        descricao: (f.descricao || (f.tipo === 'entrada' ? 'Venda' : 'Compra')).toUpperCase(),
        categoria: f.categoria, valor: parseFloat(f.valor),
        imovelId: f.imovelId || null, tipoDoc: f.tipoDoc, numDoc: f.numDoc || '',
        participante: f.participante || '', formaPagamento: f.formaPagamento,
        natureza: f.tipo === 'saida' ? f.natureza : '',
        imagem: prev.scanImage || null
      };
      const list = [record, ...prev.lancamentos];
      persistJSON('lcr_lancamentos', list);
      showToast('Lançamento salvo');
      return { ...prev, lancamentos: list, overlay: null, scanImage: null, scanError: null };
    });
  }, [showToast]);

  const deleteLancamento = useCallback((id) => {
    setS((prev) => {
      const list = prev.lancamentos.filter((l) => l.id !== id);
      persistJSON('lcr_lancamentos', list);
      return { ...prev, lancamentos: list };
    });
  }, []);

  const marcarPago = useCallback((id) => {
    setS((prev) => {
      const list = prev.lancamentos.map((l) => l.id === id ? { ...l, dataPagamento: todayISO() } : l);
      persistJSON('lcr_lancamentos', list);
      return { ...prev, lancamentos: list };
    });
    showToast('Marcado como pago');
  }, [showToast]);

  const addCustomCategory = useCallback(() => {
    const name = window.prompt('Nome da nova categoria/atividade:');
    if (name && name.trim()) {
      const clean = name.trim();
      setS((prev) => {
        let cats = prev.categorias;
        if (!cats.includes(clean)) {
          cats = [...cats, clean];
          persistJSON('lcr_categorias', cats);
        }
        return { ...prev, categorias: cats, form: { ...prev.form, categoria: clean } };
      });
    }
  }, []);

  // ---- imóveis ----
  const openImoveis = useCallback(() => patch({ overlay: 'imoveis' }), [patch]);
  const openNovoImovel = useCallback(() => patch({ overlay: 'novoImovel', novoImovelForm: { nome: '', nirf: '', municipio: '', uf: '' } }), [patch]);
  const setImovelField = useCallback((k, v) => setS((prev) => ({ ...prev, novoImovelForm: { ...prev.novoImovelForm, [k]: v } })), []);
  const voltarImoveis = useCallback(() => patch({ overlay: 'imoveis' }), [patch]);

  const saveNovoImovel = useCallback(() => {
    setS((prev) => {
      const f = prev.novoImovelForm;
      if (!f.nome.trim()) { showToast('Dê um nome pra propriedade'); return prev; }
      const novo = { id: uid(), nome: f.nome.trim(), nirf: f.nirf.trim(), municipio: f.municipio.trim(), uf: f.uf.trim().toUpperCase() };
      const list = [...prev.imoveis, novo];
      persistJSON('lcr_imoveis', list);
      return { ...prev, imoveis: list, overlay: 'imoveis' };
    });
  }, [showToast]);

  const deleteImovel = useCallback((id) => {
    setS((prev) => {
      const list = prev.imoveis.filter((i) => i.id !== id);
      persistJSON('lcr_imoveis', list);
      return { ...prev, imoveis: list };
    });
  }, []);

  const selectImovelInForm = useCallback((id) => patchForm('imovelId', id), [patchForm]);
  const viewImagem = useCallback((url) => patch({ overlay: 'verImagem', viewingImage: url }), [patch]);

  // ---- photo capture ----
  const triggerPhoto = useCallback(() => {
    const el = photoInputRef.current;
    if (el) { el.value = ''; el.click(); }
  }, []);
  const triggerManualAttach = useCallback(() => {
    const el = attachInputRef.current;
    if (el) { el.value = ''; el.click(); }
  }, []);

  const handleManualAttach = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    fileToDataURL(file).then((dataUrl) => {
      patch({ scanImage: dataUrl });
    }).catch(() => showToast('Não foi possível anexar essa imagem'));
  }, [patch, showToast]);

  const handlePhoto = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    patch({ overlay: 'scanning', scanError: null });
    try {
      const rawUrl = await fileToDataURL(file);
      let compressed = rawUrl;
      try { compressed = await compressImage(rawUrl); } catch (err) { /* keep raw */ }
      // Sem backend/API de visão computacional nesta versão — a foto fica
      // anexada ao lançamento e o produtor confere/preenche os dados na tela seguinte.
      await new Promise((r) => setTimeout(r, 700));
      setS((prev) => {
        const f = blankFormInit(prev.imoveis);
        f.data = todayISO();
        f.categoria = prev.categorias[0] || '';
        return { ...prev, form: f, overlay: 'review', editingId: null, scanImage: compressed };
      });
    } catch (err) {
      setS((prev) => {
        const f = blankFormInit(prev.imoveis);
        f.data = todayISO();
        f.categoria = prev.categorias[0] || '';
        return { ...prev, form: f, overlay: 'review', editingId: null, scanError: 'Não consegui ler essa foto direito. Preencha os dados manualmente abaixo.' };
      });
    }
  }, [patch]);

  // ---- exports ----
  const exportarTXT = useCallback(() => {
    setS((prev) => {
      if (prev.lancamentos.length === 0) { showToast('Nenhum lançamento pra exportar ainda'); return prev; }
      const header = ['Data', 'Vencimento', 'Data Pagamento', 'Status', 'Tipo', 'Descrição', 'Atividade', 'Valor', 'Propriedade', 'Tipo Documento', 'Nº Documento', 'CPF/CNPJ Participante', 'Forma Pagamento', 'Natureza'].join('\t');
      const rows = [...prev.lancamentos].sort((a, b) => (a.data || '').localeCompare(b.data || '')).map((l) => {
        const imovel = prev.imoveis.find((i) => i.id === l.imovelId);
        const forma = (FORMAS_PGTO.find((fp) => fp.v === l.formaPagamento) || {}).l || '';
        return [
          fmtDate(l.data), l.vencimento ? fmtDate(l.vencimento) : '', l.dataPagamento ? fmtDate(l.dataPagamento) : '', l.dataPagamento ? 'Pago' : 'Pendente',
          l.tipo === 'entrada' ? 'Entrada' : 'Saída', l.descricao || '', l.categoria || '',
          (l.valor || 0).toFixed(2).replace('.', ','), imovel ? imovel.nome : '', l.tipoDoc || '', l.numDoc || '',
          l.participante || '', forma, l.natureza ? (l.natureza === 'custeio' ? 'Custeio' : 'Investimento') : ''
        ].join('\t');
      });
      const content = [header, ...rows].join('\n');
      const blob = new Blob(['﻿' + content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'livro-caixa-rural-' + todayISO() + '.txt';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Arquivo exportado');
      return prev;
    });
  }, [showToast]);

  const exportarRelatorioPDF = useCallback(() => window.print(), []);

  // ---- report filters ----
  const setReportYear = useCallback((y) => patch({ reportYear: y, reportFrom: '', reportTo: '' }), [patch]);
  const setReportFilter = useCallback((k, v) => patch({ [k]: v }), [patch]);
  const setReportRange = useCallback((from, to) => patch({ reportFrom: from, reportTo: to }), [patch]);
  const clearReportFilters = useCallback(() => patch({ reportFrom: '', reportTo: '', reportStatus: 'all', reportTipo: 'all', reportImovel: 'all', reportCategoria: 'all' }), [patch]);
  const listaClear = useCallback(() => patch({ listaFrom: '', listaTo: '', listaTipo: 'all', listaStatus: 'all' }), [patch]);

  // =========================================================================
  // Derived view-model — recomputed each render, mirrors the design prototype.
  // =========================================================================
  const vm = useMemo(() => {
    if (!s.loaded) return { loaded: false };
    const todayIso = todayISO();

    const refDate = (l) => {
      if ((s.reportTab || 'livro') === 'vencimentos') return l.vencimento || l.dataPagamento || l.data || '';
      return l.dataPagamento || l.vencimento || l.data || '';
    };

    const reportBase = () => {
      const from = s.reportFrom || '', to = s.reportTo || '';
      const tipo = s.reportTipo || 'all';
      const imovel = s.reportImovel || 'all', cat = s.reportCategoria || 'all';
      return s.lancamentos.filter((l) => {
        const d = l.dataPagamento;
        if (!d) return false;
        if (from || to) {
          if (from && d < from) return false;
          if (to && d > to) return false;
        } else if (d.slice(0, 4) !== String(s.reportYear)) return false;
        if (tipo !== 'all' && l.tipo !== tipo) return false;
        if (cat !== 'all' && l.categoria !== cat) return false;
        if (imovel !== 'all' && l.imovelId !== imovel) return false;
        return true;
      });
    };

    const reportFlex = () => {
      const from = s.reportFrom || '', to = s.reportTo || '';
      const tipo = s.reportTipo || 'all', status = s.reportStatus || 'all';
      const imovel = s.reportImovel || 'all', cat = s.reportCategoria || 'all';
      return s.lancamentos.filter((l) => {
        const d = refDate(l);
        if (!d) return false;
        if (from || to) {
          if (from && d < from) return false;
          if (to && d > to) return false;
        } else if (d.slice(0, 4) !== String(s.reportYear)) return false;
        if (status === 'pago' && !l.dataPagamento) return false;
        if (status === 'aberto' && l.dataPagamento) return false;
        if (tipo !== 'all' && l.tipo !== tipo) return false;
        if (cat !== 'all' && l.categoria !== cat) return false;
        if (imovel !== 'all' && l.imovelId !== imovel) return false;
        return true;
      }).sort((a, b) => refDate(a).localeCompare(refDate(b)));
    };

    const currentMonthLancamentos = () => {
      const ym = todayIso.slice(0, 7);
      return s.lancamentos.filter((l) => l.dataPagamento && l.dataPagamento.slice(0, 7) === ym);
    };

    const totals = (list) => {
      let entrada = 0, saida = 0;
      list.forEach((l) => { if (l.tipo === 'entrada') entrada += l.valor; else saida += l.valor; });
      return { entrada, saida, saldo: entrada - saida };
    };

    const breakdownByCategoria = (list) => {
      const map = {};
      list.filter((l) => l.tipo === 'saida').forEach((l) => { map[l.categoria] = (map[l.categoria] || 0) + l.valor; });
      const arr = Object.entries(map).map(([k, v]) => ({ cat: k, val: v }));
      arr.sort((a, b) => b.val - a.val);
      const max = arr.length ? arr[0].val : 1;
      return arr.map((a) => ({ ...a, pct: Math.max(4, Math.round((a.val / max) * 100)) }));
    };

    const computeAnnual = () => {
      const list = reportBase();
      let entrada = 0, saida = 0;
      list.forEach((l) => { if (l.tipo === 'entrada') entrada += l.valor; else saida += l.valor; });
      const monthly = Array.from({ length: 12 }, () => ({ entrada: 0, saida: 0 }));
      list.forEach((l) => {
        const idx = parseInt(l.dataPagamento.slice(5, 7), 10) - 1;
        if (idx < 0 || idx > 11) return;
        if (l.tipo === 'entrada') monthly[idx].entrada += l.valor; else monthly[idx].saida += l.valor;
      });
      return { entrada, saida, saldo: entrada - saida, monthly, list };
    };

    const monthList = currentMonthLancamentos();
    const t = totals(monthList);
    const bd = breakdownByCategoria(monthList).slice(0, 6);
    const recentRaw = [...s.lancamentos].sort((a, b) => (b.data || '').localeCompare(a.data || '')).slice(0, 8);

    const lFrom = s.listaFrom || '', lTo = s.listaTo || '';
    const lTipo = s.listaTipo || 'all', lStatus = s.listaStatus || 'all';
    const vencOf = (l) => l.vencimento || l.dataPagamento || l.data || '';
    const allRaw = s.lancamentos.filter((l) => {
      const d = vencOf(l);
      if (lFrom && (!d || d < lFrom)) return false;
      if (lTo && (!d || d > lTo)) return false;
      if (lTipo !== 'all' && l.tipo !== lTipo) return false;
      if (lStatus === 'pago' && !l.dataPagamento) return false;
      if (lStatus === 'aberto' && l.dataPagamento) return false;
      if (lStatus === 'vencido' && (l.dataPagamento || !l.vencimento || l.vencimento >= todayIso)) return false;
      return true;
    }).sort((a, b) => (b.data || '').localeCompare(a.data || ''));

    const lChip = (on) => on ? 'tag tag-accent' : 'tag tag-outline';
    const listaTipoFilters = [{ label: 'Tudo', v: 'all' }, { label: 'Entradas', v: 'entrada' }, { label: 'Saídas', v: 'saida' }]
      .map((o) => ({ label: o.label, chipClass: lChip(lTipo === o.v), select: () => patch({ listaTipo: o.v }) }));
    const listaStatusFilters = [{ label: 'Todas', v: 'all' }, { label: 'Pagas', v: 'pago' }, { label: 'Em aberto', v: 'aberto' }, { label: 'Vencidas', v: 'vencido' }]
      .map((o) => ({ label: o.label, chipClass: lChip(lStatus === o.v), select: () => patch({ listaStatus: o.v }) }));
    const listaHasFilters = !!lFrom || !!lTo || lTipo !== 'all' || lStatus !== 'all';
    const listaTotalEntrada = fmtBRL(allRaw.filter((l) => l.tipo === 'entrada').reduce((a, l) => a + l.valor, 0));
    const listaTotalSaida = fmtBRL(allRaw.filter((l) => l.tipo === 'saida').reduce((a, l) => a + l.valor, 0));

    const mkTicketVM = (l) => {
      const imovel = s.imoveis.length > 1 && l.imovelId ? s.imoveis.find((i) => i.id === l.imovelId) : null;
      const isPendente = !l.dataPagamento;
      const dateMeta = isPendente
        ? (l.vencimento ? ('Pendente · vence ' + fmtDate(l.vencimento)) : 'Pendente · sem vencimento')
        : ('Pago em ' + fmtDate(l.dataPagamento));
      return {
        id: l.id,
        desc: l.descricao || (l.tipo === 'entrada' ? 'Venda' : 'Compra'),
        meta: dateMeta + ' · ' + l.categoria + (imovel ? ' · ' + imovel.nome : ''),
        valLabel: (l.tipo === 'entrada' ? '+ ' : '- ') + fmtBRL(l.valor),
        isEntrada: l.tipo === 'entrada', isSaida: l.tipo === 'saida',
        isPendente, statusClass: isPendente ? 'tag tag-outline' : 'tag tag-neutral',
        statusLabel: isPendente ? 'Pendente' : 'Pago',
        hasImage: !!l.imagem,
        onClick: l.imagem ? (() => viewImagem(l.imagem)) : (() => {}),
        onDelete: (e) => { if (e && e.stopPropagation) e.stopPropagation(); deleteLancamento(l.id); },
        onMarkPaid: (e) => { if (e && e.stopPropagation) e.stopPropagation(); marcarPago(l.id); },
        onEdit: (e) => { if (e && e.stopPropagation) e.stopPropagation(); openEdit(l.id); }
      };
    };
    const recent = recentRaw.map(mkTicketVM);
    const allTickets = allRaw.map(mkTicketVM);

    const yearSet = new Set(s.lancamentos.map((l) => l.data && l.data.slice(0, 4)).filter(Boolean));
    const curYear = new Date().getFullYear();
    yearSet.add(String(curYear));
    let years = Array.from(yearSet).sort();
    if (years.length > 6) years = years.slice(-6);
    const years_vm = years.map((y) => ({ year: y, selected: String(s.reportYear) === y, notSelected: String(s.reportYear) !== y, select: () => setReportYear(parseInt(y, 10)) }));

    const fFrom = s.reportFrom || '', fTo = s.reportTo || '';
    const fTipo = s.reportTipo || 'all';
    const fImovel = s.reportImovel || 'all', fCat = s.reportCategoria || 'all';
    const chipCls = (on) => on ? 'tag tag-accent' : 'tag tag-outline';
    const monthPreset = (i) => {
      const mm = String(i + 1).padStart(2, '0');
      return { from: s.reportYear + '-' + mm + '-01', to: s.reportYear + '-' + mm + '-' + String(lastDay(s.reportYear, i + 1)).padStart(2, '0') };
    };
    const monthFilters = [{ label: 'Ano inteiro', from: '', to: '' }]
      .concat(MONTH_ABBR.map((mn, i) => ({ label: mn, ...monthPreset(i) })))
      .map((o) => ({ label: o.label, chipClass: chipCls(fFrom === o.from && fTo === o.to), select: () => setReportRange(o.from, o.to) }));
    const tipoFilters = [{ label: 'Tudo', v: 'all' }, { label: 'Entradas', v: 'entrada' }, { label: 'Saídas', v: 'saida' }]
      .map((o) => ({ label: o.label, chipClass: chipCls(fTipo === o.v), select: () => setReportFilter('reportTipo', o.v) }));
    const imovelFilters = [{ label: 'Todos', v: 'all' }].concat(s.imoveis.map((i) => ({ label: i.nome, v: i.id })))
      .map((o) => ({ label: o.label, chipClass: chipCls(fImovel === o.v), select: () => setReportFilter('reportImovel', o.v) }));
    const catFilters = [{ label: 'Todas', v: 'all' }].concat(s.categorias.map((c) => ({ label: c, v: c })))
      .map((o) => ({ label: o.label, chipClass: chipCls(fCat === o.v), select: () => setReportFilter('reportCategoria', o.v) }));
    const fTab = s.reportTab || 'livro', fStatus = s.reportStatus || 'all';
    const reportTabs = [{ label: 'Livro caixa', v: 'livro' }, { label: 'Vencimentos', v: 'vencimentos' }, { label: 'Fluxo de caixa', v: 'fluxo' }]
      .map((o) => ({ label: o.label, chipClass: chipCls(fTab === o.v), select: () => setReportFilter('reportTab', o.v) }));
    const statusFilters = [{ label: 'Todas', v: 'all' }, { label: 'Pagas', v: 'pago' }, { label: 'Em aberto', v: 'aberto' }]
      .map((o) => ({ label: o.label, chipClass: chipCls(fStatus === o.v), select: () => setReportFilter('reportStatus', o.v) }));
    const hasFilters = !!fFrom || !!fTo || fStatus !== 'all' || fTipo !== 'all' || fImovel !== 'all' || fCat !== 'all';

    let periodLabel;
    if (fFrom && fTo) {
      const mFull = (d) => MONTH_FULL[parseInt(d.slice(5, 7), 10) - 1] + ' de ' + d.slice(0, 4);
      const isFullMonth = fFrom.slice(0, 7) === fTo.slice(0, 7) && fFrom.slice(8) === '01' && parseInt(fTo.slice(8), 10) === lastDay(parseInt(fTo.slice(0, 4), 10), parseInt(fTo.slice(5, 7), 10));
      periodLabel = isFullMonth ? mFull(fFrom) : (fmtDate(fFrom) + ' a ' + fmtDate(fTo));
    } else if (fFrom) periodLabel = 'a partir de ' + fmtDate(fFrom);
    else if (fTo) periodLabel = 'até ' + fmtDate(fTo);
    else periodLabel = String(s.reportYear);

    const annual = computeAnnual();
    const maxMonthVal = Math.max(1, ...annual.monthly.map((m) => Math.max(m.entrada, m.saida)));
    const chartMonths = annual.monthly.map((m, i) => {
      const p = monthPreset(i);
      const isSel = fFrom === p.from && fTo === p.to;
      return {
        label: MONTH_ABBR[i],
        entradaH: Math.max(2, Math.round((m.entrada / maxMonthVal) * 130)),
        saidaH: Math.max(2, Math.round((m.saida / maxMonthVal) * 130)),
        labelOpacity: isSel ? 0.9 : 0.6, labelWeight: isSel ? 700 : 400,
        select: () => isSel ? setReportRange('', '') : setReportRange(p.from, p.to)
      };
    });

    const saidasMonth = annual.list.filter((l) => l.tipo === 'saida');
    const maiorGastoRaw = saidasMonth.length ? saidasMonth.reduce((a, b) => b.valor > a.valor ? b : a) : null;
    const maiorGasto = maiorGastoRaw ? {
      desc: maiorGastoRaw.descricao || 'Compra', categoria: maiorGastoRaw.categoria,
      data: fmtDate(maiorGastoRaw.data), valor: fmtBRL(maiorGastoRaw.valor)
    } : null;

    const pendentesList = s.lancamentos.filter((l) => !l.dataPagamento);
    const pendentesAPagar = pendentesList.filter((l) => l.tipo === 'saida').reduce((a, l) => a + l.valor, 0);
    const pendentesAReceber = pendentesList.filter((l) => l.tipo === 'entrada').reduce((a, l) => a + l.valor, 0);
    const hasPendentes = pendentesList.length > 0;

    const ledgerRaw = [...annual.list].sort((a, b) => a.dataPagamento.localeCompare(b.dataPagamento));
    let running = 0;
    const ledgerRows = ledgerRaw.map((l) => {
      running += l.tipo === 'entrada' ? l.valor : -l.valor;
      return {
        data: fmtDate(l.dataPagamento),
        desc: l.descricao || (l.tipo === 'entrada' ? 'Venda' : 'Compra'),
        entrada: l.tipo === 'entrada' ? fmtBRL(l.valor) : '—',
        saida: l.tipo === 'saida' ? fmtBRL(l.valor) : '—',
        saldo: fmtBRL(running), saldoNeg: running < 0, saldoPos: running >= 0
      };
    });
    const hasLedger = ledgerRows.length > 0;

    const flexList = fTab === 'livro' ? [] : reportFlex();
    const vencRows = flexList.map((l) => {
      const pago = !!l.dataPagamento;
      const venc = l.vencimento || l.dataPagamento || l.data;
      const atrasado = !pago && venc && venc < todayIso;
      return {
        vencimento: venc ? fmtDate(venc) : '—',
        desc: l.descricao || (l.tipo === 'entrada' ? 'Venda' : 'Compra'),
        valor: fmtBRL(l.valor), isEntrada: l.tipo === 'entrada', isSaida: l.tipo === 'saida',
        statusClass: pago ? 'tag tag-neutral' : (atrasado ? 'tag tag-accent' : 'tag tag-outline'),
        statusLabel: pago ? 'Paga' : (atrasado ? 'Vencida' : 'Em aberto'),
        pagamento: pago ? fmtDate(l.dataPagamento) : '—'
      };
    });
    const sumBy = (fn) => flexList.filter(fn).reduce((a, l) => a + l.valor, 0);
    const vencTotalEntrada = fmtBRL(sumBy((l) => l.tipo === 'entrada' && !l.dataPagamento));
    const vencTotalSaida = fmtBRL(sumBy((l) => l.tipo === 'saida' && !l.dataPagamento));
    const vencTotalAberto = fmtBRL(sumBy((l) => !l.dataPagamento));
    const vencTotalAtrasado = fmtBRL(sumBy((l) => !l.dataPagamento && (l.vencimento || '') && l.vencimento < todayIso));

    const fluxoMap = {};
    flexList.forEach((l) => {
      const ym = refDate(l).slice(0, 7);
      if (!fluxoMap[ym]) fluxoMap[ym] = { entrada: 0, saida: 0 };
      if (l.tipo === 'entrada') fluxoMap[ym].entrada += l.valor; else fluxoMap[ym].saida += l.valor;
    });
    let acum = 0;
    const fluxoRows = Object.keys(fluxoMap).sort().map((ym) => {
      const m = fluxoMap[ym];
      const saldo = m.entrada - m.saida;
      acum += saldo;
      return {
        mes: MONTH_FULL[parseInt(ym.slice(5, 7), 10) - 1] + '/' + ym.slice(0, 4),
        entrada: fmtBRL(m.entrada), saida: fmtBRL(m.saida),
        saldo: fmtBRL(saldo), saldoPos: saldo >= 0, saldoNeg: saldo < 0,
        acumulado: fmtBRL(acum), acumPos: acum >= 0, acumNeg: acum < 0
      };
    });
    const fluxoEntradaVal = sumBy((l) => l.tipo === 'entrada'), fluxoSaidaVal = sumBy((l) => l.tipo === 'saida');
    const fluxoSaldoVal = fluxoEntradaVal - fluxoSaidaVal;

    const f = s.form;
    const categorias = s.categorias.map((c) => ({ name: c, chipClass: c === f.categoria ? 'tag tag-accent' : 'tag tag-outline', select: () => patchForm('categoria', c) }));
    const imoveisChip = s.imoveis.map((i) => ({ id: i.id, nome: i.nome, chipClass: i.id === f.imovelId ? 'tag tag-accent' : 'tag tag-outline', select: () => selectImovelInForm(i.id) }));
    const imoveisList = s.imoveis.map((i) => ({
      id: i.id, nome: i.nome,
      meta: (i.nirf ? ('NIRF/CCIR: ' + i.nirf + ' · ') : '') + (i.municipio || '') + (i.uf ? ('/' + i.uf) : ''),
      onDelete: () => deleteImovel(i.id)
    }));
    const tiposDoc = TIPOS_DOC.map((td) => ({ name: td, selected: td === f.tipoDoc }));
    const formasPgto = FORMAS_PGTO.map((o) => ({ value: o.v, label: o.l, selected: o.v === f.formaPagamento }));

    const isReview = s.overlay === 'review';

    return {
      loaded: true,
      isLogin: !s.authenticated, isLoggedIn: s.authenticated,
      loginUser: s.loginUser, loginPass: s.loginPass,
      setLoginUser: (e) => patch({ loginUser: e.target.value, loginError: '' }),
      setLoginPass: (e) => patch({ loginPass: e.target.value, loginError: '' }),
      hasLoginError: !!s.loginError, loginError: s.loginError,
      doLogin, doLogout, noop: () => {},
      todayLabel: monthLabel(todayIso),
      view: s.view,
      isDashboard: s.view === 'dashboard', isLista: s.view === 'lista', isRelatorios: s.view === 'relatorios',
      navOpacityDashboard: s.view === 'dashboard' ? 1 : 0.5,
      navOpacityRelatorios: s.view === 'relatorios' ? 1 : 0.5,
      navOpacityLista: s.view === 'lista' ? 1 : 0.5,
      goDashboard: () => switchView('dashboard'), goLista: () => switchView('lista'), goRelatorios: () => switchView('relatorios'),
      openManual, openImoveis,
      saldoLabel: fmtBRL(t.saldo), entradaLabel: fmtBRL(t.entrada), saidaLabel: fmtBRL(t.saida),
      saldoPositive: t.saldo >= 0, saldoNegative: t.saldo < 0,
      hasBreakdown: bd.length > 0, breakdown: bd.map((b) => ({ cat: b.cat, pct: b.pct, val: fmtBRL(b.val) })),
      hasRecent: recent.length > 0, noRecent: recent.length === 0, recent,
      hasPendentes, pendentesAPagarLabel: fmtBRL(pendentesAPagar), pendentesAReceberLabel: fmtBRL(pendentesAReceber),
      triggerPhoto,

      hasAll: allTickets.length > 0, noAll: allTickets.length === 0, allTickets,
      exportarTXT,

      years: years_vm,
      monthFilters, tipoFilters, imovelFilters, catFilters,
      showImovelFilter: s.imoveis.length > 1, hasFilters, periodLabel,
      listaFrom: lFrom, listaTo: lTo,
      setListaFrom: (e) => patch({ listaFrom: e.target.value }),
      setListaTo: (e) => patch({ listaTo: e.target.value }),
      listaTipoFilters, listaStatusFilters, listaHasFilters,
      listaClear,
      listaCount: String(allRaw.length), listaTotalEntrada, listaTotalSaida,
      listaEmptyMsg: listaHasFilters ? 'Nenhum lançamento com os filtros selecionados.' : 'Nenhum lançamento ainda.',
      reportTabs, statusFilters,
      isTabLivro: fTab === 'livro', isTabVenc: fTab === 'vencimentos', isTabFluxo: fTab === 'fluxo',
      showStatusFilter: fTab !== 'livro',
      periodBasis: fTab === 'livro' ? 'data de pagamento' : (fTab === 'vencimentos' ? 'vencimento' : 'data de caixa'),
      vencRows, hasVenc: vencRows.length > 0, noVenc: vencRows.length === 0,
      vencTotalEntrada, vencTotalSaida, vencTotalAberto, vencTotalAtrasado,
      fluxoRows, hasFluxo: fluxoRows.length > 0, noFluxo: fluxoRows.length === 0,
      fluxoEntrada: fmtBRL(fluxoEntradaVal), fluxoSaida: fmtBRL(fluxoSaidaVal),
      fluxoSaldo: fmtBRL(Math.abs(fluxoSaldoVal)), fluxoPositive: fluxoSaldoVal >= 0, fluxoNegative: fluxoSaldoVal < 0,
      fluxoBasisNote: fStatus === 'pago' ? 'Somente lançamentos pagos (realizado).' : (fStatus === 'aberto' ? 'Somente lançamentos em aberto (previsto pelo vencimento).' : 'Realizado pela data de pagamento e previsto pelo vencimento.'),
      reportFrom: fFrom, reportTo: fTo,
      setReportFrom: (e) => setReportRange(e.target.value, s.reportTo || ''),
      setReportTo: (e) => setReportRange(s.reportFrom || '', e.target.value),
      clearFilters: clearReportFilters,
      annualEntrada: fmtBRL(annual.entrada), annualSaida: fmtBRL(annual.saida),
      annualSaldo: fmtBRL(Math.abs(annual.saldo)), annualPositive: annual.saldo >= 0, annualNegative: annual.saldo < 0,
      resultLabel: annual.saldo >= 0 ? 'Lucro líquido' : 'Prejuízo líquido',
      chartMonths,
      hasLedger, noLedger: !hasLedger, ledgerRows,
      hasMaiorGasto: !!maiorGasto, noMaiorGasto: !maiorGasto, maiorGasto,
      exportarRelatorioPDF,

      overlayOpen: !!s.overlay,
      ovScanning: s.overlay === 'scanning', ovImoveis: s.overlay === 'imoveis', ovNovoImovel: s.overlay === 'novoImovel',
      ovVerImagem: s.overlay === 'verImagem', viewingImage: s.viewingImage || '',
      ovForm: s.overlay === 'manual' || s.overlay === 'review' || s.overlay === 'editar',
      isManualNew: s.overlay === 'manual',
      saveButtonLabel: s.overlay === 'editar' ? 'Salvar alterações' : 'Salvar lançamento',
      closeOverlay,

      hasImoveis: imoveisList.length > 0, noImoveis: imoveisList.length === 0, imoveisList,
      openNovoImovel, saveNovoImovel, voltarImoveis,
      novoImovelForm: s.novoImovelForm,
      setNomeImovel: (e) => setImovelField('nome', e.target.value),
      setNirfImovel: (e) => setImovelField('nirf', e.target.value),
      setMunicipioImovel: (e) => setImovelField('municipio', e.target.value),
      setUfImovel: (e) => setImovelField('uf', e.target.value),

      isReview,
      formTitle: s.overlay === 'editar' ? 'Editar lançamento' : (isReview ? 'Confira o lançamento' : 'Novo lançamento'),
      formSub: s.overlay === 'editar' ? 'Altere o que precisar e salve' : (isReview ? 'Foto anexada — confira e complete os dados' : 'Preencha os dados abaixo'),
      hasScanError: !!s.scanError, scanError: s.scanError,
      hasScanImage: !!s.scanImage, scanImage: s.scanImage || '',
      triggerManualAttach,
      tipoEntradaClass: f.tipo === 'entrada' ? 'btn btn-primary' : 'btn btn-secondary',
      tipoSaidaClass: f.tipo === 'saida' ? 'btn btn-primary' : 'btn btn-secondary',
      setTipoEntrada: () => setTipo('entrada'), setTipoSaida: () => setTipo('saida'),
      formData: f.data, formDescricao: f.descricao,
      formVencimento: f.vencimento, formDataPagamento: f.dataPagamento,
      setData: (e) => patchForm('data', e.target.value),
      formValorMask: fmtValorInput(f.valor),
      setValor: setValorMasked,
      setDescricao: (e) => patchForm('descricao', e.target.value),
      setVencimento: (e) => patchForm('vencimento', e.target.value),
      setDataPagamento: (e) => patchForm('dataPagamento', e.target.value),
      categorias, addCustomCategory,
      showFiscal: f.showFiscal, showFiscalOff: !f.showFiscal, toggleFiscal,
      hasImoveisForForm: imoveisChip.length > 0, noImoveisForForm: imoveisChip.length === 0, imoveisChip,
      tiposDoc, setTipoDoc: (e) => patchForm('tipoDoc', e.target.value),
      formNumDoc: f.numDoc, setNumDoc: (e) => patchForm('numDoc', e.target.value),
      formParticipante: f.participante, setParticipante: (e) => patchForm('participante', e.target.value),
      formasPgto, setFormaPagamento: (e) => patchForm('formaPagamento', e.target.value),
      isSaidaForm: f.tipo === 'saida',
      naturezaCusteioClass: f.natureza === 'custeio' ? 'btn btn-primary' : 'btn btn-secondary',
      naturezaInvestimentoClass: f.natureza === 'investimento' ? 'btn btn-primary' : 'btn btn-secondary',
      setNaturezaCusteio: () => patchForm('natureza', 'custeio'),
      setNaturezaInvestimento: () => patchForm('natureza', 'investimento'),
      saveManual,
      handlePhoto, handleManualAttach,

      hasToast: !!s.toast, toastMsg: s.toast
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s]);

  return { vm, photoInputRef, attachInputRef };
}
