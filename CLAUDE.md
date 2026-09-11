# CLAUDE.md — App Base (`brasa-nove`)

Vitrine web de hamburgaria: institucional + cardápio + montagem de pedido finalizado
no WhatsApp, mais uma área administrativa para manter conteúdo sem SQL.
Uma base responsiva atende desktop e celular — não há build separado nem app nativo.

**Stack real:** Vite 8 · React 19 · TypeScript 6 · react-router-dom 7 · CSS Modules ·
Supabase (Postgres + Auth + Storage) · Vitest + Testing Library.

> O [README.md](README.md) é a fonte da verdade para **arquitetura, modelo de dados,
> RLS, decisões de produto e o que ficou de fora**. Leia-o antes de mudanças
> estruturais. Este arquivo cobre o que o README não cobre: regras operacionais,
> API exata dos módulos e onde mexer para cada tipo de tarefa.

---

## Comandos

```bash
npm run dev        # servidor de desenvolvimento
npm run verify     # tipos + lint + testes — RODE ISTO ANTES DE ENTREGAR
npm run test       # vitest em watch
npm run test:run   # vitest uma vez (CI)
npm run lint       # eslint
npm run build      # tsc -b && vite build
```

`npm run verify` é o portão. Não declare uma tarefa concluída sem ele passando.

Ambiente: `cp .env.example .env.local` com `VITE_SUPABASE_URL` e
`VITE_SUPABASE_PUBLISHABLE_KEY`. `src/lib/env.ts` valida no boot e quebra com
mensagem acionável se faltar.

---

## Regras invioláveis

Estas causam bug ou dívida silenciosa quando ignoradas:

1. **Nenhum `.module.css` escreve cor literal.** Todo valor sai de token semântico
   (`--color-*`, `--space-*`, `--radius-*`, `--shadow-*`). Tom novo nasce em
   `styles/themes/light.css` (o piso) e, se mudar no escuro, ganha a linha em `dark.css`.
2. **Preço é sempre `integer` em centavos.** Converte só na exibição (`lib/format.ts`).
   Nunca use float para dinheiro.
3. **Escrita no banco só pelo `adminSupabase`** (`features/admin/authService.ts`).
   O client público (`lib/supabase.ts`) não carrega o papel `authenticated` do RLS.
4. **`photo_url` guarda o path relativo do bucket, nunca a URL absoluta.**
   Resolva com `getPublicPhotoUrl()` na hora de exibir.
5. **Contexto novo mora em arquivo separado do provider** (`XContext.ts` +
   `XProvider.tsx`). Misturar quebra o Fast Refresh do Vite.
6. **Idioma:** todo identificador de código é em **inglês** — tipos, props, funções,
   variáveis locais, tokens CSS (`--color-brand`), classes de `.module.css` e o alias
   `styles` (nunca `estilos`). Fica em **português** só o conteúdo voltado ao usuário
   final: textos de UI, mensagens de WhatsApp e os comentários que explicam decisões.
   Exceções deliberadas, não identificadores: valores de `BrandId` (`'ambar'`,
   `'verde-claro'`…, presos ao `check` de `site_config.brand_color`) e os segmentos de
   `ROUTES` (`/cardapio`, `/pedido` — são URLs públicas, não código).
7. **Uma árvore só para mobile e desktop.** Quem decide o que aparece é o CSS, não o
   JavaScript. Não crie `MobileX`/`DesktopX`.
8. **Comentário explica *por quê*, não *o quê*.** O código deste projeto comenta a
   decisão e a alternativa descartada. Mantenha esse tom; não narre o óbvio.

---

## Mapa

```
src/
├── components/   UI genérica, sem conhecimento do domínio      → components/CLAUDE.md
├── features/     domínio: dados, regras, contextos, providers  → features/CLAUDE.md
├── layout/       AppShell e AdminShell (cascas com <Outlet>)   → layout/CLAUDE.md
├── lib/          infraestrutura: supabase, env, format, storage → lib/CLAUDE.md
├── pages/        uma pasta por rota                            → pages/CLAUDE.md
├── styles/       tokens, temas, base, utilitários              → styles/CLAUDE.md
├── test/         setup do Vitest                               → test/CLAUDE.md
├── routes.ts     ROUTES, HOME_SECTIONS, editItemPath()
├── App.tsx       providers + rotas
└── main.tsx      createRoot + import de styles/index.css
```

Cada pasta tem seu próprio `CLAUDE.md` com API exata e armadilhas. **Consulte o da
pasta que você vai alterar antes de escrever código.**

### Providers e rotas (`App.tsx`)

Ordem real, de fora para dentro — e o porquê:

```
ThemeProvider        não depende de nada; vale para as duas cascas
└ SiteProvider       lê o tema padrão do admin, então vem depois do tema
  └ CartProvider     estado do visitante
    └ AddressProvider
      └ BrowserRouter
        ├ <AppShell/>            → Home · Menu · Order · NotFound ("*")
        └ <AdminAuthProvider/>   → escopado a /admin/*: o site público
          ├ AdminLogin             nunca precisa checar sessão
          └ <AdminGuard/>          sem sessão → renderiza <NotFound/> (404, não login)
            └ <AdminShell/>      → AdminOverview · AdminMenuItems
                                   · AdminMenuItemForm (new + :id) · AdminSiteSettings
```

`AdminAuthProvider`, `AdminGuard`, `AppShell` e `AdminShell` são **route elements**:
recebem filhos por `<Outlet/>`, não por prop `children`.

### Fluxo de dados

```
Supabase → siteService → SiteProvider → toda a aplicação (uma leitura no topo)
Supabase → menuService → useMenu → páginas → add(item) → CartProvider
                                                  → buildOrderMessage → link wa.me
```

Os services convertem a linha do banco (`snake_case`) no modelo de domínio
(`camelCase`, `photoUrl` resolvida). É esse mapeamento que permite mudar coluna no
Postgres sem tocar em componente.

Dois padrões de carga, deliberadamente opostos:
- **`useMenu`** devolve união discriminada `loading | error | ready`. O tipo impede
  estados impossíveis; a tela vira checagem exaustiva.
- **`useSite`** *nunca* devolve `undefined` para os dados — enquanto a leitura não
  volta, valem os padrões de `features/site/defaults.ts`. Quem precisa de esqueleto
  olha a flag `loading`.

---

## Receitas

| Tarefa | Passos |
| --- | --- |
| **Nova página** | pasta em `pages/` · entrada em `ROUTES` (`src/routes.ts`) · `<Route>` em `App.tsx` sob a casca certa · se for pública e navegável, `NAV_ITEMS` no `AppShell` |
| **Novo componente de UI** | pasta em `components/` com `index.tsx` + `.module.css` · só tokens semânticos · props que estendem o atributo HTML nativo quando fizer sentido |
| **Nova seção da Home** | componente em `pages/Home/sections/` · coluna `show_<seção>` em `site_config` · campo no grupo `sections` de `features/site/types.ts` · mapeamento em `siteService.toSiteConfig` e `siteConfigService.buildSiteConfigPayload` · entrada na lista de `AppearanceTab`. A seção deve sumir sozinha quando não houver conteúdo |
| **Novo campo de configuração** | coluna no Postgres · campo no grupo certo de `SiteConfig` · `toSiteConfig` (leitura) · `buildSiteConfigPayload` (escrita) · `defaults.ts` · campo na aba correspondente de `AdminSiteSettings/tabs/` |
| **Nova paleta de marca** | bloco `[data-brand='<id>']` em `styles/themes/brands.css` com os 8 valores · mesmo id no catálogo `features/theme/brands.ts` · id no `check` de `site_config.brand_color` |
| **Nova categoria de cardápio** | só SQL: `INSERT` em `menu_categories` (`slug`, `label`, `sort_order`). Não há tela |
| **Regenerar tipos do banco** | `npx supabase gen types typescript --project-id <ref> > src/lib/database.types.ts` |

---

## Testes

`npm run test:run`. A cobertura mira **regra de negócio**, não percentual: reducers,
selectors, mapeamentos service↔banco, formatação, cálculo de horário, e componentes
cujo valor é a semântica ARIA (`Tabs`, `MenuItemCard`, `BrandSwatches`).

Telas do admin **não** têm teste de componente — decisão consciente: testa-se a função
pura do service, não o hook/tela que faz a chamada de rede. Não crie testes de tela
admin sem o usuário pedir.

Os testes consultam por **papel e texto visível**, como o usuário percebe a tela —
nunca por classe CSS ou detalhe de implementação.

---

## Armadilhas conhecidas

- **`index.html` tem um script inline de tema** que repete a chave do `localStorage` e
  a regra de resolução de `features/theme/themeStorage.ts`. Mudou lá, muda aqui —
  senão volta o flash branco em quem usa tema escuro.
- **Custom property não funciona dentro de `@media`.** Os breakpoints aparecem
  literais nas media queries (768px principal; 900px no admin; 480px/1080px pontuais).
  `--bp-md`/`--bp-lg` em `space.css` existem só como documentação.
- **O carrinho não persiste** entre reloads — decisão explícita, não bug.
- **A finalização não valida endereço**; a mensagem apenas omite campos vazios.
- **`_to_delete/` e `dist/`** não são código vivo. Ignore-os.
