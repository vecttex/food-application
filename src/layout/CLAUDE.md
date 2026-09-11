# src/layout

**Cascas: navegação, rodapé e o `<Outlet/>` das páginas.** O conteúdo muda, a casca fica.

As duas são **route elements** em `App.tsx` — recebem as páginas por `<Outlet/>`,
**não** por prop `children`:

```tsx
<Route element={<AppShell />}>
  <Route path={ROUTES.home} element={<Home />} />
</Route>
```

Nenhuma das duas tem lógica de negócio própria: consomem hooks de `features/`.

---

## Princípio comum: uma árvore, dois formatos

A barra superior e a barra inferior **convivem no DOM**; o CSS decide qual aparece.
Renderizar layouts diferentes por breakpoint em JavaScript custaria duas cópias da
navegação para manter em sincronia — e um flash de layout errado antes de o JS medir a
tela. `display: none` também remove o elemento da árvore de acessibilidade, então
leitores de tela nunca veem navegação duplicada.

**Não crie `MobileNav`/`DesktopNav`.** A lista de destinos é declarada uma vez
(`NAV_ITEMS`) e renderizada nas duas barras.

---

## `AppShell` — site público

Consome: `useCart()` (`totalQuantity`), `useSite()` (`config`, `hours`),
`buildContactLink`, `formatWeeklyHours`, `OpenStatusBadge`.

**Estrutura:**

```
aviso (operation.notice, role="status")   ← só se houver
header .barraSuperior
  marca (logoUrl + identity.name)
  nav .navegacao          ← NAV_ITEMS, visível no desktop
  acoes: OpenStatusBadge · ThemeToggle · atalho do pedido · LinkButton WhatsApp
main .conteudo → <Outlet/>
footer  marca+status · Funcionamento · Navegar · Falar com a gente · © ano
nav .barraInferior        ← NAV_ITEMS + Pedido, visível no mobile
```

**Renderização condicional — o que aparece depende de config:**
- `operation.notice` → faixa de aviso no topo
- `appearance.allowThemeToggle` → `<ThemeToggle/>`
- `contact.whatsappNumber` → botão de WhatsApp
- `sections.hours` + linhas de horário → coluna "Funcionamento" no rodapé
- `sections.faq` / `sections.contact` → links de âncora no rodapé
- `totalQuantity > 0` → atalho do pedido no header e contador na barra inferior

`NAV_ITEMS` (topo do arquivo) é `[{ to, label, icon }]`. Página pública nova que deva
aparecer na navegação entra aqui.

### `useNavegacaoDeRolagem()`

Hook local. O navegador restaura a rolagem entre páginas, mas um SPA não troca de
documento — quem sai do fim do cardápio e clica em "Início" cairia no meio da Home.
O efeito devolve o comportamento esperado: topo a cada rota nova, e `scrollIntoView` na
seção certa quando o link traz âncora (`/#faq`, vindo do rodapé). Usa um
`requestAnimationFrame` de espera porque a seção pode não existir no primeiro quadro
(dados ainda em carga).

As âncoras vêm de `HOME_SECTIONS` em `src/routes.ts`.

---

## `AdminShell` — área administrativa

Consome: `useAdminAuth()` (`signOut`), `useSite()` (`config.identity.name`).
**Sem carrinho e sem WhatsApp** — para deixar claro que é outro contexto.

```
aside .lateral
  marca (identity.name + etiqueta "Admin")
  nav .navegacao  ← NAV_ITEMS
  rodapeLateral: ThemeToggle · "Ver o site" (→ ROUTES.home) · Button "Sair"
main .conteudo → <Outlet/>
```

`NAV_ITEMS`: Visão geral (`end: true`) · Cardápio · Configurações.
São **três destinos, o que dispensa menu sanduíche** — o padrão que mais esconde
funcionalidade em painel administrativo.

`end: true` na rota `/admin` impede que ela fique ativa em `/admin/items`.

Quebra em **900px**: abaixo a navegação vira barra de abas fixa embaixo, acima é coluna
lateral fixa.

`handleSignOut` faz `await signOut()` e navega para `ROUTES.adminLogin`.

---

## Ao alterar uma casca

- Item de navegação novo → `NAV_ITEMS` do arquivo, nunca JSX solto duplicado.
- Elemento que depende de configuração → renderização condicional pela flag de
  `config`, do mesmo jeito que os existentes.
- Breakpoint → media query no `.module.css`, não `useMediaQuery`.
- `aria-label` distinto por `<nav>` já está posto; preserve-o ao editar.
