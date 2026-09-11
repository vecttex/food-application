# src/features

**O domínio.** Dados, regras, contextos, providers e os componentes que só existem por
causa do negócio. Uma feature é dona do seu assunto de ponta a ponta: tipo → service →
context → provider → hook → componentes.

Anatomia recorrente (nem toda feature tem todas as peças):

```
features/<assunto>/
├── types.ts            modelo de domínio (camelCase), independente do banco
├── <assunto>Service.ts leitura/escrita + mapeamento linha do banco ↔ modelo
├── <Assunto>Context.ts contrato público (arquivo separado — Fast Refresh)
├── <Assunto>Provider.tsx
├── use<Assunto>.ts     hook que falha alto fora do provider
└── components/         componentes que conhecem o domínio
```

**Por que Context e Provider em arquivos separados:** mantém o Fast Refresh do Vite
funcionando no provider (o módulo de componente só exporta componente) e deixa
explícito que a API pública é o contrato do contexto, não o reducer interno.

**Por que `createContext(undefined)`:** permite o hook detectar uso fora do provider e
falhar alto, em vez de devolver um estado fantasma que não atualiza nada.

---

## `menu` — cardápio

```ts
// types.ts — modelo de domínio, sem created_at/available/sort_order
type MenuItem = { id, name, description, priceCents, ingredients: string[],
                  photoUrl: string|null, tag: string|null, featured, bestseller }
type MenuCategory = { slug, label, items: MenuItem[] }
type Menu = { categories: MenuCategory[] }

// menuService.ts
buildMenu(categories: CategoryRow[], items: ItemRow[]): Menu
allItems(menu): MenuItem[]
showcaseItems(menu, 'featured' | 'bestseller'): MenuItem[]
fetchMenu(): Promise<Menu>

// useMenu.ts
useMenu(): ({ status:'loading' } | { status:'error', message } | { status:'ready', menu })
           & { reload: () => void }
```

`showcaseItems` **cai nos primeiros itens do cardápio quando nada está marcado** — uma
seção ligada no admin não pode aparecer oca só porque ninguém marcou item ainda.

`useMenu` usa união discriminada de propósito: o tipo impede erro preenchido junto com
dados. `reload()` volta para `loading` no evento, não dentro do efeito (setState
síncrono em efeito provoca renderização em cascata), e a resposta é descartada se o
componente desmontar.

`components/`: `MenuItemCard` (lista do cardápio, expansível) · `ShowcaseCard` (vitrine
da Home). Testes: `menuService.test.ts`.

## `cart` — carrinho

```ts
type CartLine = { id, name, priceCents, photoUrl, quantity }
type CartAction = { type:'add', item } | { type:'increment'|'decrement'|'remove', id }
                | { type:'clear' }

// CartContext.ts — a API pública
{ lines, totalQuantity, totalCents, empty, add(item), increment(id),
  decrement(id), remove(id), clear() }

// selectors.ts (puros)
totalQuantity(state) · totalCents(state) · isEmpty(state) · itemQuantity(state, id)
```

**Invariante mantido em um lugar só: toda linha tem quantidade ≥ 1.** Decrementar a
última unidade remove a linha — por isso os selectors e a mensagem do WhatsApp nunca
precisam filtrar zeros. Se você mexer no reducer, preserve isso.

O provider **não expõe `dispatch`**: quem consome fala por intenções. Isso deixa o
formato interno do estado livre para mudar sem quebrar tela.

A linha guarda cópia de nome/preço/foto e não só o `id` — permite abrir `/pedido` direto
pela URL, antes de o cardápio carregar. Contrapartida assumida: preço que mudar no banco
no meio da sessão fica desatualizado na linha (aceitável, o pedido é confirmado no
WhatsApp antes de virar venda).

**O carrinho não persiste entre reloads.** Decisão explícita, não bug.

`components/`: `OrderLine`. Testes: `cartReducer.test.ts`, `selectors.test.ts`,
`CartProvider.test.tsx`.

## `order` — endereço e WhatsApp

```ts
type DeliveryAddress = { ... };  EMPTY_ADDRESS;  type AddressField = keyof DeliveryAddress

// whatsappMessage.ts
buildOrderMessage({ lines, totalCents, address, site }): string
buildOrderLink(data): string      // wa.me completo, já codificado
buildContactLink(site: SiteConfig): string   // contato simples, sem pedido
```

`buildContactLink` é o usado pelo `AppShell` (header e rodapé). `buildOrderLink` é o do
checkout. Campos vazios do endereço são **omitidos** da mensagem — não há validação
bloqueante hoje.

`components/`: `AddressForm`. Testes: `whatsappMessage.test.ts`.

## `site` — configuração da vitrine

Modelo de domínio agrupado por assunto, **deliberadamente diferente** da linha do banco
(`site_config` é uma tabela larga e plana de uma linha só). Cada grupo corresponde a uma
aba da tela de Configurações — é isso que permite acrescentar/renomear coluna no Postgres
sem mexer em componente.

```ts
SiteConfig = { identity, contact, operation, appearance, sections }
SiteContent = { config, hours: OpeningHour[], faq, testimonials, gallery }

// SiteContext.ts
SiteContent & { loading: boolean; error: string | null; reload(): void }

// siteService.ts — mapeadores linha → modelo, todos exportados e testáveis
toSiteConfig(row) · toOpeningHour(row) · toFaqItem(row) · toTestimonial(row)
toGalleryPhoto(row) · getCoverPhoto() · fetchSiteContent(): Promise<SiteContent>

// openingHours.ts
computeOpeningStatus(...) · formatWeeklyHours(hours): string[] · formatTime(time)
timeToMinutes(time) · weekdayName(n) · weekdaysInDisplayOrder()

// useOpeningStatus.ts → OpeningStatus reativo
```

`useSite()` **nunca devolve `undefined` para os dados** — enquanto a leitura não volta,
o contexto carrega os padrões de `defaults.ts` (`DEFAULT_SITE_CONFIG`). Isso tira de
toda tela a obrigação de tratar "ainda não sei o nome do restaurante". Quem precisa
mostrar esqueleto olha `loading`. Uma leitura só, no topo da árvore.

`sections` é uma flag booleana por seção da Home (`status`, `highlights`, `bestsellers`,
`infoCards`, `hours`, `reviews`, `gallery`, `faq`, `contact`, `menuSearch`).
**Seção desligada some; seção ligada sem conteúdo também.** Nunca renderize bloco vazio.

O cálculo de "aberto agora" usa o fuso do restaurante (`operation.timezone`), **não o do
visitante** — senão um cliente viajando veria "fechado" com a cozinha aberta. Cobre
expediente que cruza a meia-noite.

`testSiteConfig(overrides?)` é o factory para testes. Use-o em vez de montar `SiteConfig`
à mão.

`components/`: `OpenStatusBadge` (`{ withDetail? }`).
Testes: `openingHours.test.ts`, `siteService.test.ts`.

## `admin` — autenticação e escrita

```ts
// authService.ts
adminSupabase                 // client SEPARADO: persistSession + autoRefreshToken,
                              // storageKey 'brasa-nove-admin-auth'
signIn(email, password): Promise<Session>   // + rpc('is_admin'); reprova → signOut
signOut() · getSession() · onAuthChange(cb): () => void

// AdminAuthContext.ts
{ loading, session: Session | null, signIn(email, pw), signOut() }

// menuAdminService.ts
toFormValues(item) · emptyFormValues(category?) · buildMenuItemPayload(values)
listAdminMenuItems() · listCategories() · getAdminMenuItem(id)
saveMenuItem(...) · deleteMenuItem(id, photoPath)

// siteConfigService.ts
buildSiteConfigPayload(config): TablesUpdate<'site_config'>
getSiteConfig() · saveSiteConfig(config)
updateCoverPhoto(file) · updateLogo(file)
listOpeningHours() · saveOpeningHours(hours)
listAdminFaq() · saveFaqItem(item) · deleteFaqItem(id)
listAdminTestimonials() · saveTestimonial(item) · deleteTestimonial(id)
listAdminGallery() · addGalleryPhoto(file, caption, sortOrder)
updateGalleryPhoto(photo) · deleteGalleryPhoto(photo)

// validatePhotoFile.ts
validatePhotoFile(file): string | null   // JPG/PNG/WEBP, máx. 5MB; null = ok
```

**Dois clients Supabase coexistem de propósito.** `lib/supabase.ts` é o público
(`persistSession: false`); `adminSupabase` é o único que carrega o papel `authenticated`
nas policies de RLS, então é **o único usado para escrita**. Leituras do admin (listar
itens/categorias) usam o client público mesmo — a policy de `select` já é livre.

Login exige duas condições: credencial válida **e** `user_id` em `admins` (checado via
`rpc('is_admin')` logo após o login; se falhar, a sessão é encerrada na hora).

`AdminGuard` renderiza **`<NotFound/>`** sem sessão — 404, não tela de login nem "sem
permissão". Decisão de produto: não revelar que a rota existe.

Ao trocar foto, o arquivo anterior é apagado do Storage **depois** que o novo upload tem
sucesso — falha no upload não derruba a foto que já está no ar. Mantenha essa ordem.

`AdminAuthProvider` e `AdminGuard` são **route elements** (usam `<Outlet/>`).
Testes: `menuAdminService.test.ts`, `siteConfigService.test.ts`, `validatePhotoFile.test.ts`.

## `theme` — tema e cor de marca

```ts
type ThemePreference = 'light' | 'dark' | 'system'   // TRÊS estados
type ResolvedTheme  = 'light' | 'dark'
isThemePreference(v) · THEME_PREFERENCES

// ThemeContext.ts
{ preference, theme, setPreference(p), toggle(), applyDefaultPreference(p) }

// themeStorage.ts — THEME_STORAGE_KEY = 'brasa-nove-tema'
readStoredPreference() · storePreference(p) · systemPrefersDark()
resolveTheme(p) · watchSystemTheme(cb) · applyThemeToDocument(theme)

// brands.ts — DEFAULT_BRAND = 'ambar'
type BrandId; BRANDS: Brand[]; isBrandId(v); brandLabel(id)

// brandStorage.ts — BRAND_STORAGE_KEY = 'brasa-nove-marca'
readCachedBrand() · cacheBrand(b) · setDocumentBrand(b) · applyBrandToDocument(b)
```

**"Seguir o sistema" é escolha de primeira classe**, não a ausência de escolha. Guardar
só `claro | escuro` congelaria o tema no momento da primeira visita.

**A preferência do visitante ganha do padrão do admin.** `applyDefaultPreference` só tem
efeito enquanto a pessoa não tiver escolhido nada.

`applyThemeToDocument` também atualiza o `<meta name="theme-color">` lendo a cor de fundo
resolvida — sem isso a barra do navegador no celular fica branca sobre site escuro.

⚠️ **`index.html` tem um script inline** que repete a chave e a regra de resolução deste
módulo, para escrever `data-theme` antes do primeiro pintar. **Mudou aqui, muda lá.**

O banco guarda o **ID da paleta**, nunca o hexadecimal — cada paleta é um conjunto de
tons conferidos à mão (todos os pares de texto passam de 4.5:1 nos dois temas). O
`localStorage` da marca é cache de conveniência para o script inline, **nunca fonte da
verdade**.

Testes: `ThemeProvider.test.tsx`, `brands.test.ts`.

---

## Ao criar uma feature

1. `types.ts` primeiro — modelo de domínio em camelCase, sem colunas que a UI não usa.
2. Service faz o mapeamento linha↔modelo, e **exporta os mapeadores individualmente**
   (é o que os torna testáveis sem rede).
3. Context em arquivo próprio, `undefined` como default.
4. Hook lança erro explícito fora do provider.
5. Provider registrado em `App.tsx` — escopado à rota se só uma área precisa dele.
6. Escrita? Use `adminSupabase`. Leitura pública? `supabase`.
7. Teste a função pura do service, não o hook que faz a chamada de rede.
