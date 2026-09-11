# 📋 Guia de Padronização: Labels e Branches

Este documento define as convenções de nomenclatura para tarefas (labels) e branches de desenvolvimento dentro deste projeto. Seguimos esses padrões para garantir rastreabilidade e clareza durante todo o fluxo de trabalho.

---

## 🏷️ Definições de Labels (Categorias)

Cada card ou tarefa deve ser classificado com um dos prefixos abaixo, de acordo com sua natureza:

| Prefixo | Descrição | Cor sugerida |
| :--- | :--- | :--- |
| `feature/` | Desenvolvimento de novas funcionalidades. | 🟦 Azul |
| `bugfix/` | Correções de bugs encontrados nos ambientes de Dev/Staging. | 🟧 Laranja |
| `hotfix/` | Correções críticas e urgentes implantadas diretamente em Produção. | 🟥 Vermelho |
| `chore/` | Tarefas de manutenção (ex.: atualização de dependências, logs, configurações). | ⬜ Cinza |
| `docs/` | Criação ou atualização exclusiva de documentação. | 🟩 Verde |
| `refactor/` | Melhorias no código que não alteram a lógica funcional. | 🟪 Roxo |

---

## 🚀 Fluxo de Trabalho (Branches)

Ao iniciar uma tarefa, a branch deve ser criada a partir da `main` (ou `develop`), seguindo este padrão:

`type/short-description`

**Exemplos:**

- `feature/jwt-authentication`
- `hotfix/production-login-error`
- `docs/update-readme`

---

## 🎨 Escala de Prioridade

Além do tipo da tarefa, utilizamos cores para indicar a urgência:

- **P0 - Crítica (Vermelho):** Bloqueia o projeto ou afeta usuários em produção.
- **P1 - Alta (Laranja):** Essencial para a entrega do milestone atual.
- **P2 - Média (Amarelo):** Tarefas comuns do backlog.
- **P3 - Baixa (Verde):** Melhorias não urgentes ou pequenas dívidas técnicas.

---

> **Observação:** Mantenha os nomes das branches em letras minúsculas e use hífens `-` para separar as palavras.

# App Base

Aplicativo web da hamburgaria: vitrine institucional, cardápio,
montagem de pedido com finalização pelo WhatsApp, e uma área administrativa
para manter o cardápio e a foto do estabelecimento sem precisar de SQL.

Uma única base responsiva atende navegador de desktop e de celular — não há
build separado nem app nativo.

---

## Stack

| Camada | Escolha | Por quê |
| ------ | ------- | ------- |
| Build | Vite + React 19 + TypeScript | Base já existente do projeto. |
| Rotas | `react-router-dom` | URLs reais (`/cardapio`, `/pedido`, `/admin/...`), deep link e botão voltar do navegador funcionando. |
| Estilo | CSS Modules | Escopo isolado por componente, sem dependência extra e sem risco de colisão de classe. |
| Estado | Context + `useReducer` | O carrinho é o único estado realmente global; uma store externa não se pagaria aqui. |
| Dados | Supabase (Postgres + Auth + Storage) | Cardápio, fotos e login do admin vêm do Supabase; leitura pública por RLS, escrita só para quem está em `admins`. |
| Testes | Vitest + Testing Library | Mesmo pipeline do Vite, sem configuração paralela. |

## Como rodar

```bash
npm install
cp .env.example .env.local   # preencha com as credenciais do projeto Supabase
npm run dev
```

Scripts disponíveis:

```bash
npm run dev        # servidor de desenvolvimento
npm run build      # checagem de tipos + build de produção
npm run test       # testes em modo watch
npm run test:run   # testes uma vez (CI)
npm run lint       # ESLint
npm run verify     # tipos + lint + testes — o que rodar antes de commitar
```

### Variáveis de ambiente

| Variável | Descrição |
| -------- | --------- |
| `VITE_SUPABASE_URL` | URL do projeto Supabase. |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Chave publicável (`sb_publishable_…`). |

Tudo que começa com `VITE_` vai para o bundle e fica visível no navegador.
A `service_role` key **nunca** entra aqui — a proteção dos dados é feita por RLS,
não por esconder a chave. A validação acontece em `src/lib/env.ts`, no boot: se
faltar credencial, o app quebra com uma mensagem que diz o que fazer, em vez de
falhar depois com um erro genérico do supabase-js.

---

## Estrutura de pastas

```
src/
├── components/          # UI genérica, sem conhecimento do domínio
│   ├── Accordion/  Avatar/  Badge/  BrandSwatches/  Button/  Icon/
│   ├── IconButton/  InfoRow/  Input/  ItemPhoto/  Panel/
│   ├── QuantityStepper/  Rating/  Section/  Select/  Skeleton/
│   └── StatusMessage/  Switch/  Tabs/  Textarea/  ThemeToggle/
├── features/            # domínio: dados, regras e componentes de negócio
│   ├── menu/             # types · menuService · useMenu · components/
│   ├── cart/             # reducer · selectors · context · provider · components/
│   ├── order/            # endereço · mensagem do WhatsApp · components/
│   ├── site/             # configuração da vitrine · horários · provider
│   ├── theme/            # tema claro/escuro · paletas de marca · provider
│   └── admin/            # auth · CRUD de itens · escrita da configuração
├── layout/
│   ├── AppShell/         # navegação pública (topo + barra inferior) + rodapé + <Outlet>
│   └── AdminShell/       # navegação do admin (lateral no desktop, abas no mobile)
├── pages/               # uma pasta por rota
│   ├── Home/             # sections/ — Hero · InfoCards · Showcase · Reviews · Gallery · Contact
│   ├── Menu/  Order/  NotFound/
│   ├── AdminLogin/  AdminOverview/  AdminMenuItems/  AdminMenuItemForm/
│   └── AdminSiteSettings/  # tabs/ — Profile · Operation · Appearance · Content
├── lib/                 # infraestrutura: supabase, storage, env, formatação
├── styles/              # camada de estilo (ver abaixo)
├── routes.ts            # caminhos das rotas em um lugar só
├── App.tsx              # providers + rotas
└── main.tsx
```

### Camada de estilo

```
src/styles/
├── index.css            # único ponto de entrada; importa tudo na ordem certa
├── tokens/
│   ├── palette.css      # escalas cruas (neutros e cores de estado)
│   ├── typography.css   # famílias, escala de tamanho, pesos
│   ├── space.css        # espaçamento, raio, larguras, breakpoints
│   ├── elevation.css    # sombras, anéis, vidro
│   └── motion.css       # durações e curvas
├── themes/
│   ├── brands.css       # uma paleta de marca por cor selecionável no admin
│   ├── light.css        # define TODO token semântico (--color-*) — é o piso
│   └── dark.css         # sobrescreve só o que muda
├── base/
│   ├── reset.css        # reset mínimo
│   ├── document.css     # defaults de body, títulos, links
│   └── a11y.css         # foco visível, .u-apenas-leitor, reduced motion
└── utilities/layout.css # punhado de classes globais (.u-container, .u-trilho…)
```

A ordem em `index.css` é a única regra difícil: tokens → temas → base →
utilitários. Componentes não entram aqui — cada um tem o seu `.module.css`.

Dentro de `themes/`, `brands.css` vem antes: ele traz a paleta escolhida no
admin (`--brand-*`), e `light.css`/`dark.css` só decidem qual tom dessa paleta
cumpre cada papel no tema. É por isso que trocar a cor do site não toca em
nenhum componente.

### Convenção de componente

Cada componente é uma pasta com `index.tsx` e o seu `.module.css` ao lado:

```
components/Button/
├── index.tsx            # Button e LinkButton
├── classes.ts           # buttonClasses — usada pelo <Link> sem duplicar estilo
└── Button.module.css
```

O import fica `import { Button } from '../../components/Button'`, e o estilo
sempre mora junto do componente que o usa. Nenhum `.module.css` escreve cor
literal: todo valor sai dos tokens semânticos (`--color-*`), definidos em
`styles/themes/`. É isso que faz um componente escrito uma vez funcionar nos
dois temas sem nenhuma regra a mais.

### Onde cada coisa vai

| Preciso de… | Vai em |
| ----------- | ------ |
| Um botão, campo, selo — nada específico de hamburgaria | `components/` |
| Regra de carrinho, formato do pedido, busca do cardápio, CRUD de admin | `features/<assunto>/` |
| Um componente que só existe por causa do domínio | `features/<assunto>/components/` |
| Uma tela inteira ligada a uma rota | `pages/` |
| Cliente HTTP, formatação, leitura de env | `lib/` |
| Um token de cor, espaço, sombra ou tipografia | `styles/tokens/` e `styles/themes/` |

### Nomenclatura

Todo identificador de código é em inglês — tabelas, colunas, tipos, props, funções,
variáveis locais, arquivos, tokens de estilo (`--color-brand`, `--space-4`) e classes de
`.module.css` (`styles.trigger`, não `styles.gatilho`), inclusive nos módulos de domínio
(`menuService`, `cartReducer`, `buildOrderMessage`). O que fica em português é só o
conteúdo voltado ao cliente final: textos de UI, mensagens do WhatsApp e os comentários
que explicam decisões — a tela que a pessoa vê é em português, o código que a desenha
não precisa ser.

Duas exceções deliberadas, que são dado e não identificador: os valores de `BrandId`
(`'ambar'`, `'verde-claro'`…) espelham o `check` de `site_config.brand_color` no banco, e
os segmentos de `ROUTES` (`/cardapio`, `/pedido`) são URL pública, não código — mudar
qualquer um dos dois quebra compatibilidade sem trazer ganho real.

---

## Responsividade

Uma única árvore de componentes serve os dois formatos; quem decide o que
aparece é o CSS. Não existem `MobileLayout` e `DesktopLayout` separados — isso
duplicaria a navegação em dois lugares para manter em sincronia e causaria um
flash de layout errado enquanto o JavaScript mede a tela.

Breakpoint principal do projeto: **768px**. Abaixo dele o app se comporta como
aplicativo (barra de abas fixa embaixo, listas em coluna, CTA de largura total);
acima, como site (navegação no topo, grid de duas colunas, conteúdo centralizado
com largura máxima). Alguns blocos usam pontos intermediários (480px e 900px)
quando a grade pede — a galeria e os cartões de informação, por exemplo.

A área admin quebra em **900px**: abaixo disso a navegação vira barra de abas
fixa embaixo, acima vira coluna lateral fixa. São três destinos, o que dispensa
menu sanduíche — o padrão que mais esconde funcionalidade em painel
administrativo.

A barra superior e a barra inferior do site público convivem no DOM e cada
breakpoint mostra uma. `display: none` também remove o elemento da árvore de
acessibilidade, então leitores de tela nunca veem navegação duplicada.

---

## Tema claro e escuro

Três estados, não dois: **claro**, **escuro** e **sistema** (o padrão). "Seguir
o sistema" é uma escolha de primeira classe — quem coloca o celular em escuro às
19h espera que o site acompanhe, e guardar só `claro | escuro` congelaria o tema
no momento da primeira visita.

```
index.html (script inline)  ──► resolve e escreve data-theme ANTES do 1º pintar
        │
        ▼
ThemeProvider ──► themeStorage (localStorage + matchMedia) ──► <html data-theme>
        ▲                                                            │
        │                                                            ▼
   ThemeToggle                                          styles/themes/dark.css
```

- O **script inline** do `index.html` é obrigatório: qualquer coisa carregada
  depois já chega tarde e quem usa escuro vê um flash branco. Ele repete a
  chave e a regra de resolução de `features/theme/themeStorage.ts` — se mudarem
  lá, mudam aqui.
- O CSS só conhece `:root` (claro) e `:root[data-theme='dark']`. Não existe
  cópia dos tokens dentro de `@media (prefers-color-scheme: dark)`: o script
  resolve "sistema" antes do primeiro pintar, então a media query só cobriria o
  caso sem JavaScript — em que este SPA não renderiza nada de qualquer forma.
- A preferência do visitante **ganha** do padrão do admin. `site_config`
  define o tema de quem chega pela primeira vez (`default_theme`) e se o botão
  de troca aparece (`allow_theme_toggle`); quem já clicou no botão mantém a
  própria escolha.
- `applyThemeToDocument` também atualiza o `<meta name="theme-color">` lendo a
  cor de fundo já resolvida — sem isso, a barra do navegador no celular fica
  branca por cima de um site escuro.

### Cor da marca

Treze paletas, escolhidas no admin em Configurações → Aparência: o âmbar
original (recomendado) e verde, azul, vermelho, laranja, roxo e rosa, cada uma
em versão clara e escura. A escolha é do restaurante, não do visitante — vale
para todo mundo, nos dois temas.

```
site_config.brand_color ──► SiteProvider ──► <html data-brand="azul-escuro">
                                                        │
                                                        ▼
                                           styles/themes/brands.css
                                           (--brand-light-* / --brand-dark-*)
                                                        │
                                                        ▼
                                        light.css / dark.css → --color-brand*
```

- **O banco guarda o ID da paleta, não a cor.** Um hexadecimal obrigaria a
  derivar hover, contraste e versão clara/escura em tempo de execução, sem
  nada garantindo o contraste mínimo do texto. Com IDs, cada paleta é um
  conjunto de tons escolhidos à mão e conferidos: **todos os pares de texto
  passam de 4.5:1 nos dois temas** (o pior caso da lista fica em 4.9:1).
- **Quatro papéis por tema**, não uma cor só: `fundo` (preenchimento),
  `fundo-hover`, `tinta` (a marca virando texto sobre a página) e `sobre` (o
  texto por cima do preenchimento — a "cor secundária", perto do preto nas
  paletas claras e do branco nas escuras). `fundo` e `tinta` são valores
  diferentes porque o tom que preenche um botão quase nunca tem contraste para
  virar texto sobre branco.
- **O quadradinho do seletor mostra a cor de verdade.** Cada botão carrega o
  próprio `data-brand` e é pintado com `var(--brand-swatch)` — a mesma
  variável do CSS, no tema que está na tela. Nenhum hexadecimal atravessa o
  TypeScript, então não existe amostra dizendo uma coisa e site pintando outra.
- **Pré-visualização ao vivo:** enquanto a aba Aparência está aberta, a cor
  escolhida pinta o admin inteiro; sair sem salvar desfaz. O `localStorage`
  guarda a última cor confirmada só para o script inline evitar o flash na
  próxima visita — cache de conveniência, nunca fonte da verdade.

---

## Modelo de dados

```
menu_categories (slug PK, label, sort_order)
        ▲
        │ FK  menu_items.category → menu_categories.slug
        │
menu_items (id, category, name, description, price_cents,
            ingredients text[], tag, available, photo_url, sort_order,
            featured, bestseller)

admins (user_id PK → auth.users, created_at)

site_config (id PK fixo = true)                    -- linha única
   identidade  restaurant_name, tagline, description, cover_photo_url, logo_url
   contato     address_street, address_city, phone, whatsapp_display,
               whatsapp_number, instagram_url, maps_url
   operação    timezone, delivery_time, delivery_fee_cents, min_order_cents,
               payment_methods text[], accepts_orders, notice
   aparência   default_theme, allow_theme_toggle, brand_color
   vitrine     show_status, show_highlights, show_bestsellers, show_info_cards,
               show_hours, show_reviews, show_gallery, show_faq, show_contact,
               show_menu_search

opening_hours (weekday PK 0–6, closed, opens time, closes time)
faq_items     (id, question, answer, sort_order, published)
testimonials  (id, author, rating 1–5, comment, sort_order, published)
gallery_photos(id, photo_url, caption, sort_order, published)
```

Decisões relevantes:

- **Categorias são dados, não `CHECK` no DDL.** Incluir "Sobremesas" é um
  `INSERT`, não uma migration seguida de deploy. As abas do cardápio saem
  direto da tabela, com rótulo e ordem vindos do banco.
- **Preço em centavos (`integer`).** Ponto flutuante acumula erro de
  arredondamento na soma do carrinho. Toda a aplicação calcula em centavos e só
  formata na exibição (`lib/format.ts`).
- **`ingredients` como `text[]`**, e não tabela separada: hoje é uma lista de
  exibição, sem regra própria nem reuso entre itens. Se virar entidade
  (alergênicos, estoque), promove-se para tabela.
- **`site_config` é uma tabela de uma linha só** (`id boolean` com `check (id)`
  forçando um único registro). Ela cresceu de propósito: nome, contato,
  entrega, tema padrão e as flags `show_*` saíram do código e viraram coluna,
  para que o dono do restaurante monte a vitrine sem deploy. Uma tabela larga de
  uma linha custa uma leitura só; o modelo de domínio agrupa esses campos por
  assunto (`features/site/types.ts`), e cada grupo vira uma aba da tela de
  Configurações.
- **Uma flag `show_*` por seção da vitrine.** Acrescentar seção nova ao site é
  acrescentar a coluna, o bloco na Home e uma linha na lista de
  `AppearanceTab` — o interruptor no admin sai de graça. Seção desligada some;
  seção ligada sem conteúdo (FAQ vazio, galeria vazia) também não aparece, então
  não existe bloco vazio no site.
- **`featured` e `bestseller` em `menu_items`** alimentam as duas vitrines da
  Home. Quando nada está marcado, a vitrine cai nos primeiros itens do cardápio
  (`showcaseItems`) — uma seção ligada no admin não pode aparecer oca só porque
  ninguém marcou item ainda.
- **Horário em tabela, não em texto.** `opening_hours` é o que permite calcular
  "aberto agora" de verdade (`features/site/openingHours.ts`), inclusive para
  expediente que cruza a meia-noite. O cálculo usa o fuso do restaurante
  (`site_config.timezone`), e não o do visitante: senão um cliente viajando com
  o celular em outro fuso veria "fechado" com a cozinha aberta.
- **`testimonials` nasce vazia.** Depoimento só entra cadastrado pelo dono, com
  nome de gente de verdade. A seção se esconde sozinha enquanto não houver
  nenhum publicado — encher a tela com avaliação inventada seria mentir para
  quem está decidindo onde jantar.
- **RLS ligada em tudo.** `SELECT` público em todas as tabelas de conteúdo
  (`menu_items`, `menu_categories`, `site_config`, `opening_hours`,
  `faq_items`, `testimonials`, `gallery_photos`);
  `INSERT/UPDATE/DELETE` só para quem está em `admins` (função
  `is_admin()`, `SECURITY DEFINER`). A tabela `admins` em si não tem nenhuma
  policy — só é lida através de `is_admin()`, nunca via `select` direto.
- **Admin é cadastrado manualmente**, via SQL/dashboard do Supabase
  (`insert into admins (user_id) values ('<uuid do usuário no Auth>')`). Não
  existe tela de "criar admin" de propósito — é uma operação rara e sensível.

### Imagens

O bucket `menu` é público. **`menu_items.photo_url` guarda o path relativo**
(`lanches/classico-brasa.jpg` para itens legados, `items/<uuid>.<ext>` para
itens criados pela área admin), não a URL absoluta — trocar de bucket, de
projeto ou colocar um CDN na frente não exige reescrever nenhum registro. Só
`lib/storage.ts` muda. A foto de capa do estabelecimento (`site_config.cover_photo_url`)
segue o mesmo esquema, em `cover/site.<ext>`; o logo em `cover/logo.<ext>` e as
fotos da galeria em `gallery/<uuid>.<ext>`.

Enquanto a foto for nula — ou apontar para um arquivo que não existe mais — o
componente `ItemPhoto` mostra um placeholder no mesmo espaço que a foto
ocuparia. Isso permite cadastrar as fotos aos poucos sem a lista "pular".

Ao trocar a foto de um item ou a de capa pela área admin, o arquivo anterior é
apagado do Storage **depois** que o novo upload tem sucesso — assim uma falha
no upload não derruba a foto que já estava no ar.

---

## Fluxo dos dados

```
Supabase ──► siteService ──► SiteProvider ──► toda a aplicação
             (linha larga     (uma leitura     (nome, contato, horários,
              → grupos)        no topo)         flags de seção)

Supabase ──► menuService ──► useMenu ──► página Menu
             (mapeia linha    (estado de    (renderiza)
              → modelo)        carga)
                                   │
                                   ▼  add(item)
                              CartProvider  ◄── página Order lê
                              (reducer + selectors)
                                   │
                                   ▼
                          buildOrderMessage ──► link wa.me
```

O service converte a linha do banco (`snake_case`, colunas que a UI não usa) no
modelo de domínio (`camelCase`, `photoUrl` já resolvida). É esse mapeamento que
permite mudar coluna no Postgres sem tocar em nenhum componente.

`useMenu` devolve uma união discriminada (`loading | error | ready`) em vez de
`{ data, loading, error }`: o tipo passa a impedir estados impossíveis, como
erro preenchido junto com dados.

`useSite` é o oposto de propósito: **nunca** devolve `undefined` para os dados.
Enquanto a leitura não volta, o que está no contexto são os padrões de
`features/site/defaults.ts` — isso tira de toda tela a obrigação de tratar
"ainda não sei o nome do restaurante". Quem precisa mostrar esqueleto olha
`loading`. Uma leitura só, no topo da árvore: nome, telefone, horário e flags
aparecem em quase toda tela, e buscá-los por página significaria a mesma query
repetida a cada navegação, com um piscar de conteúdo em cada uma.

### Carrinho

O reducer (`features/cart/cartReducer.ts`) é puro e não depende de React. O
provider não expõe `dispatch` — quem consome fala por intenções (`add`,
`increment`), o que deixa o formato interno do estado livre para mudar sem
quebrar as telas.

Invariante mantido em um lugar só: **toda linha tem quantidade ≥ 1**.
Decrementar a última unidade remove a linha, então os seletores e a mensagem do
WhatsApp nunca precisam filtrar zeros.

A linha do carrinho guarda uma cópia de nome, preço e foto — e não só o `id`.
Isso permite abrir `/pedido` direto pela URL, antes de o cardápio ter carregado.
Contrapartida assumida: se o preço mudar no banco no meio da sessão, a linha fica
com o valor antigo — aceitável porque o pedido é confirmado no WhatsApp antes de
virar venda.

### Área admin

```
adminSupabase (sessão persistida) ──► authService.signIn ──► AdminAuthProvider
                                                                     │
                                                     session? ───────┼─── não → AdminGuard renderiza <NotFound/>
                                                                     ▼
                                                                 <Outlet/> (AdminShell)
```

Dois clients Supabase coexistem de propósito:

- `src/lib/supabase.ts` — client público, `persistSession: false` (o site
  nunca loga; lê com a chave publishable, sob RLS de leitura anônima).
- `src/features/admin/authService.ts` (`adminSupabase`) — client separado,
  `persistSession: true` + `autoRefreshToken: true`, `storageKey` próprio. É o
  único que carrega o papel `authenticated` nas policies, então é o único
  usado para escrita (`menuAdminService`, `siteConfigService`). Leituras do
  admin (listar itens/categorias) usam o client público mesmo — a policy de
  `select` já é livre, então duplicar o client aí não ganharia nada.

Login exige duas condições: credencial válida no Supabase Auth **e** o
`user_id` estar em `admins` (checado via `rpc('is_admin')` logo após o login;
se falhar, a sessão é encerrada na hora). Sem sessão válida, qualquer rota
`/admin/*` cai em 404 (`AdminGuard` → `<NotFound/>`) — decisão de produto para
não revelar que a rota existe, em vez de mostrar tela de login ou "sem
permissão".

---

## Como estender

**Adicionar um item ao cardápio** — pela área admin (`/admin/items`), ou via
`INSERT` direto em `menu_items` com a `category` apontando para um slug
existente.

**Adicionar uma categoria** — ainda só via SQL: `INSERT` em `menu_categories`
(`slug`, `label`, `sort_order`). Não há tela de admin para isso hoje — a lista
de categorias muda raramente.

**Publicar uma foto** — pela área admin (upload no formulário do item, ou em
Configurações para a foto de capa), ou manualmente: envie o arquivo para o
bucket `menu` e grave o path em `menu_items.photo_url` / `site_config.cover_photo_url`.

**Criar uma página** — pasta em `pages/`, entrada em `ROUTES`
(`src/routes.ts`) e um `<Route>` em `App.tsx`. Se ela deve aparecer na
navegação pública, acrescente em `NAV_ITEMS` no `AppShell`.

**Criar um componente de UI** — pasta em `components/` com `index.tsx` e
`.module.css`. Use apenas tokens semânticos (`--color-*`); se precisar de um tom
novo, ele nasce em `styles/themes/light.css` (que é o piso) e, se mudar no
escuro, ganha a linha correspondente em `styles/themes/dark.css`. Nunca escreva
cor literal em um `.module.css`.

**Criar uma paleta de cor** — um bloco `[data-brand='<id>']` em
`styles/themes/brands.css` com os oito valores, o mesmo `<id>` no catálogo
(`features/theme/brands.ts`) e no `check` da coluna `site_config.brand_color`.
O seletor do admin e a validação de leitura saem prontos do catálogo.

**Criar uma seção da Home** — componente em `pages/Home/sections/`, coluna
`show_<seção>` em `site_config`, campo no grupo `sections` de
`features/site/types.ts` e uma entrada na lista `SECOES` de
`AppearanceTab`. A seção deve sumir sozinha quando não houver conteúdo.

**Mudar textos, contato, horário, tema padrão ou o que aparece na vitrine** —
tudo em `/admin/settings`, sem deploy.

**Regenerar os tipos do banco** depois de uma migration:

```bash
npx supabase gen types typescript --project-id <ref> > src/lib/database.types.ts
```

---

## Testes

`npm run test:run`. A cobertura mira onde há regra de negócio de verdade, e não
um percentual:

| Arquivo | O que garante |
| ------- | ------------- |
| `cartReducer.test.ts` | Transições do carrinho, invariante de quantidade, imutabilidade. |
| `selectors.test.ts` | Total e contagem, inclusive aritmética em centavos. |
| `whatsappMessage.test.ts` | Formato da mensagem, omissão de campos vazios, codificação da URL. |
| `menuService.test.ts` | Agrupamento por categoria e mapeamento linha → modelo. |
| `menuAdminService.test.ts` | Conversão reais↔centavos e mapeamento formulário↔linha do banco. |
| `validatePhotoFile.test.ts` | Tipos aceitos/rejeitados e limite de tamanho do upload. |
| `format.test.ts` | Formatação de moeda pt-BR e plural. |
| `CartProvider.test.tsx` | Integração provider + hook, e a falha explícita fora do provider. |
| `MenuItemCard.test.tsx` | Conteúdo, rótulos acessíveis e expansão dos ingredientes. |
| `Tabs.test.tsx` | Semântica ARIA e navegação por teclado. |
| `openingHours.test.ts` | "Aberto agora" com fuso do restaurante, expediente que cruza a meia-noite e o agrupamento dos dias da semana. |
| `siteService.test.ts` | Linha larga de `site_config` → configuração agrupada, incluindo tema inválido e aviso em branco. |
| `siteConfigService.test.ts` | Configuração agrupada → payload do banco: dígitos do WhatsApp, trims e nulls. |
| `ThemeProvider.test.tsx` | Resolução de tema, persistência da escolha e o atributo `data-theme` que o CSS lê. |
| `brands.test.ts` | Integridade do catálogo de paletas e a validação do ID vindo do banco. |
| `BrandSwatches.test.tsx` | Seleção, estado acessível de cada quadradinho e o `data-brand` que pinta a amostra. |

Os testes verificam comportamento, não detalhe de implementação: consultas por
papel e texto visível, como o usuário percebe a tela. As telas da área admin
não têm teste de componente (mesma escolha do resto do projeto: só a função
pura do service é testada, não o hook/tela que faz a chamada de rede) — e o
fluxo de autenticação em si não é mockado, por não valer o custo aqui.

---

## O que ficou de fora, de propósito

| Item | Por que não agora | Quando faria sentido |
| ---- | ----------------- | -------------------- |
| **Persistência do carrinho** | Decisão explícita de manter só em memória. Hoje, recarregar a página zera o pedido. | É a primeira melhoria que eu faria: `localStorage` no `CartProvider` resolve em poucas linhas. |
| **Validação do endereço** | A finalização não bloqueia com endereço vazio; a mensagem apenas omite os campos em branco. | Se começarem a chegar pedidos sem endereço no WhatsApp. |
| **Tela de admin para categorias** | Categoria muda raramente; SQL direto é suficiente hoje. | Se o cardápio passar a ganhar categoria com frequência. |
| **Arrastar para reordenar** | FAQ, avaliações e galeria são ordenados por `sort_order`, editado como número. | Quando alguma dessas listas passar de uma dezena de itens. |
| **Conta do cliente final** | O visitante não faz login: o pedido fecha no WhatsApp, e favoritos/histórico exigiriam Auth, tabelas e RLS novos. | Se o pedido passar a ser fechado dentro do site. |
| **Convite/recuperação de senha do admin** | Cadastro de admin é manual via SQL, evento raro e sensível. | Se a equipe de admins crescer além de 1–2 pessoas. |
| **Code splitting por rota** | O bundle fica em torno de ~545 kB (~156 kB gzip), dominado pelo supabase-js. Aceitável para o tamanho atual do app. | Se o app crescer ou o Lighthouse mobile reclamar. |
| **Cache do cardápio** | Cada visita à tela refaz a busca. São dezenas de linhas, não milhares. | Com muitos itens, ou se a navegação ficar perceptivelmente lenta. |
| **Testes end-to-end** | Os testes atuais cobrem regra e componente; e2e exigiria subir banco de teste. | Quando existir checkout de verdade, com pagamento. |
