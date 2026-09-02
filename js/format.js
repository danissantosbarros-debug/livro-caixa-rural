export const DEFAULT_CATS = ['Soja', 'Milho', 'Pecuária', 'Insumos', 'Combustível', 'Manutenção', 'Mão de obra', 'Outros'];
export const TIPOS_DOC = ['Nota Fiscal', 'Recibo', 'Contrato', 'Folha de Pagamento', 'Outro'];
export const FORMAS_PGTO = [
  { v: 'conta', l: 'Conta bancária' },
  { v: 'especie', l: 'Espécie' },
  { v: 'transito', l: 'Numerário em trânsito' }
];
export const MONTH_ABBR = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
export const MONTH_FULL = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

export function fmtBRL(n) {
  return (n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function fmtDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

export function monthLabel(iso) {
  const d = new Date(iso + 'T00:00:00');
  const s = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function uid() {
  return 'l_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
}

export function lastDay(y, m) {
  return new Date(y, m, 0).getDate();
}

export function fmtValorInput(v) {
  const n = parseFloat(v);
  if (!v || isNaN(n)) return '';
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function compressImage(dataUrl, maxWidth = 900, quality = 0.6) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let w = img.width, h = img.height;
      if (w > maxWidth) { h = Math.round(h * (maxWidth / w)); w = maxWidth; }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => reject(new Error('Falha ao processar imagem'));
    img.src = dataUrl;
  });
}

export function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(new Error('Falha ao ler imagem'));
    r.readAsDataURL(file);
  });
}
