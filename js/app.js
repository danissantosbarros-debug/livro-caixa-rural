import { html, React } from './html.js';
import { useApp } from './state.js';
import { Login } from './components/Login.js';
import { Header } from './components/Header.js';
import { BottomNav } from './components/BottomNav.js';
import { Dashboard } from './components/Dashboard.js';
import { Lista } from './components/Lista.js';
import { Relatorios } from './components/Relatorios.js';
import { Overlays } from './components/Overlays.js';
import { Toast } from './components/Toast.js';

function App() {
  const { vm, photoInputRef, attachInputRef } = useApp();

  if (!vm.loaded) {
    return html`<div class="app-shell"></div>`;
  }

  if (vm.isLogin) {
    return html`<div class="app-shell">${Login(vm)}</div>`;
  }

  return html`
    <div class="app-shell" style="padding-bottom:90px;">
      ${Header(vm)}
      <main style="flex:1;padding:18px 16px 8px;">
        ${vm.isDashboard ? Dashboard(vm) : null}
        ${vm.isLista ? Lista(vm) : null}
        ${vm.isRelatorios ? Relatorios(vm) : null}
      </main>
      ${BottomNav(vm)}

      <input ref=${photoInputRef} type="file" accept="image/*" capture="environment" style="display:none" onChange=${vm.handlePhoto} />
      <input ref=${attachInputRef} type="file" accept="image/*" style="display:none" onChange=${vm.handleManualAttach} />

      ${Overlays(vm)}
      ${Toast(vm)}
    </div>
  `;
}

const root = window.ReactDOM.createRoot(document.getElementById('root'));
root.render(html`<${App} />`);
