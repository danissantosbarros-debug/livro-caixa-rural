# Livro Caixa Rural — PWA

App mobile para produtores rurais registrarem entradas e saídas do livro caixa (LCDPR), com lançamento manual ou por foto, contas a pagar/receber, relatórios e cadastro de propriedades.

## Tecnologia

Não há etapa de build (sem Node.js/npm necessário): React 18 real é carregado via CDN (unpkg/cdnjs) e a sintaxe de marcação usa [htm](https://github.com/developit/htm) (JSX-like em template literals). Todos os arquivos são estáticos — `.html`, `.css`, `.js` puro em módulos ES.

Dados ficam salvos no `localStorage` do navegador (sem backend). Isso é suficiente para uso pessoal/demo; para múltiplos usuários ou sincronização entre aparelhos seria preciso adicionar um backend depois.

## Testar agora (sem instalar nada)

Basta abrir `index.html` através de um servidor local — não funciona direto em `file://` porque o app usa módulos ES e service worker, que exigem `http://`.

Se você tiver Node.js instalado:
```bash
npx serve .
```

Se tiver Python:
```bash
python -m http.server 8080
```

## Publicar (deploy) — grátis, sem precisar instalar nada

**Opção mais rápida — Netlify Drop:**
1. Acesse https://app.netlify.com/drop
2. Arraste a pasta `app` (esta pasta) inteira para a página
3. Em segundos você recebe uma URL pública (ex: `nome-aleatorio.netlify.app`)
4. Abra essa URL no Safari do iPhone → botão Compartilhar → "Adicionar à Tela de Início"

**Alternativas:** Vercel (vercel.com, mesma lógica de arrastar pasta ou `vercel --prod` via CLI) ou GitHub Pages (subir esta pasta para um repositório e habilitar Pages nas configurações).

Não é necessário nenhum passo de build antes de publicar — a pasta já está pronta como está.

## Estrutura

- `index.html` — shell da página, carrega React/ReactDOM via CDN e o manifest da PWA
- `manifest.json` — nome, ícones, cores do app instalável
- `sw.js` — service worker (cache do app shell para funcionar offline)
- `css/styles.css` — tokens de design (cores, tipografia Bitter/Karla) e componentes
- `js/state.js` — toda a lógica de estado (login, lançamentos, filtros, relatórios)
- `js/components/` — telas (Login, Dashboard, Lista, Relatórios, Overlays, etc.)
- `assets/` — ícones do PWA e logo da tela de login

## O que difere do protótipo de design original

O protótipo original (pasta `design_handoff_livro_caixa_rural/` ao lado desta) usava a API da Claude para ler automaticamente os dados de uma foto de nota fiscal — isso só funciona dentro do ambiente de design, não em um app publicado sem backend. Nesta versão, a foto é anexada ao lançamento (comprimida) e o produtor confere/preenche os dados manualmente na tela seguinte. Para reativar a leitura automática seria preciso um backend próprio com uma chave de API.

## Rodando em Node.js/Vite no futuro

Se depois quiser instalar Node.js e migrar para um projeto Vite "de verdade" (com build, hot reload, etc.), a lógica em `js/state.js` e os componentes em `js/components/` podem ser reaproveitados quase sem alteração — a mudança principal seria trocar os imports por CDN por imports de pacotes npm (`react`, `react-dom`) e trocar `htm` por JSX.
