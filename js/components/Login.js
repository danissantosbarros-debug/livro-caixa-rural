import { html } from '../html.js';

export function Login(vm) {
  return html`
    <div style="min-height:100vh;display:flex;flex-direction:column;">
      <div style="flex:1;display:flex;flex-direction:column;align-items:center;padding:48px 28px 40px;background:#0b2e22;color:#eafaf1;">

        <div style="width:180px;height:180px;border-radius:22px;background:#0f3d2c;display:flex;align-items:center;justify-content:center;margin-bottom:22px;overflow:hidden;">
          <img src="./assets/login-logo.png" style="width:82%;height:82%;object-fit:contain;" alt="Livro Caixa Rural" />
        </div>

        <div style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#7fd9ae;font-weight:700;">Produtor rural</div>
        <h2 style="margin:4px 0 32px;font-size:19px;font-weight:400;color:#cfeede;text-align:center;">Livro Caixa da sua propriedade</h2>

        <div style="width:100%;max-width:340px;">
          <div style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#7fd9ae;font-weight:700;margin-bottom:8px;">Usuário</div>
          <input type="text" placeholder="CPF ou e-mail" value=${vm.loginUser} onChange=${vm.setLoginUser}
            style="width:100%;box-sizing:border-box;padding:15px 16px;border-radius:10px;border:none;font-size:15px;font-family:var(--font-body);background:#ffffff;color:#0b2e22;margin-bottom:20px;" />

          <div style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#7fd9ae;font-weight:700;margin-bottom:8px;">Senha</div>
          <input type="password" placeholder="Sua senha" value=${vm.loginPass} onChange=${vm.setLoginPass}
            style="width:100%;box-sizing:border-box;padding:15px 16px;border-radius:10px;border:none;font-size:15px;font-family:var(--font-body);background:#ffffff;color:#0b2e22;margin-bottom:8px;" />

          ${vm.hasLoginError ? html`<div style="font-size:12.5px;color:#ffb4a8;margin:6px 0 4px;">${vm.loginError}</div>` : null}

          <div style="display:flex;justify-content:flex-end;margin:6px 0 26px;">
            <a onClick=${vm.noop} style="font-size:12.5px;color:#9fe6c2;cursor:pointer;">Esqueci minha senha</a>
          </div>

          <button onClick=${vm.doLogin} style="width:100%;padding:16px 18px;border-radius:10px;border:none;background:#2fae72;color:#ffffff;cursor:pointer;">
            <span style="font-family:var(--font-heading);font-weight:800;font-size:15px;">Entrar</span>
          </button>
        </div>
      </div>
    </div>
  `;
}
