import { html } from '../html.js';

export function Toast(vm) {
  if (!vm.hasToast) return null;
  return html`
    <div data-print-hide style="position:fixed;bottom:100px;left:50%;transform:translateX(-50%);background:var(--color-text);color:var(--color-bg);padding:10px 18px;font-size:13px;font-weight:600;z-index:30;">${vm.toastMsg}</div>
  `;
}
