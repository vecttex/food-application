# src/pages

**Uma pasta por rota.** A página orquestra: busca dados por hooks de `features/`,
compõe `components/` e resolve o fluxo daquela tela. Lógica que outra tela vai
reaproveitar não mora aqui — sobe para `features/`.

Rotas em `src/routes.ts` (`ROUTES`, `HOME_SECTIONS`, `editItemPath(id)`).
Registro em `App.tsx`, sob a casca certa.

---

## Padrão de carga (use este, não invente outro)

Toda página que busca dados usa união discriminada em estado local:

```ts
type Estado =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; dados: T }
```

E o `reload` dispara **no evento, não dentro do efeito** — `setState` síncrono em efeito
provoca renderização em cascata:

```ts
const reload = useCallback(() => {
  setEstado({ status: 'loading' })
  setTentativa((n) => n + 1)
}, [])

useEffect(() => {
  let active = true          // descarta resposta fora de ordem / após desmontar
  buscar().then((d) => { if (active) setEstado({ status: 'ready', dados: d }) })
          .catch(...)
  return () => { active = false }
}, [tentativa])
```

Erro renderiza `<StatusMessage type="error" action={<Button onClick={reload}>} />`.
Carregando renderiza `Skeleton` quando o layout é conhecido (listas), `StatusMessage
type="loading"` quando não é.

---

## Públicas — dentro de `AppShell`

### `Home` — `/`

Composição de seções, cada uma em `sections/<Nome>/`: **Hero · InfoCards · Showcase
(destaques) · Showcase (mais pedidos) · Reviews · Gallery · Contact**. O FAQ usa
`Accordion` direto.

**Cada seção decide sozinha se aparece:** a flag correspondente em `config.sections`
(ligada no admin) **e** a existência de conteúdo. Por isso não há um `if` gigante no
topo — a regra de visibilidade mora junto do bloco que ela governa, que é onde alguém
vai procurá-la. Seção ligada sem conteúdo também não aparece: **nunca renderize bloco
vazio**.

O cardápio é buscado **uma vez, aqui**, e distribuído para as duas vitrines via
`showcaseItems(menu, 'featured' | 'bestseller')`. Cada `Showcase` chamando `useMenu`
sozinho renderia duas requisições idênticas por visita.

As seções recebem `id` de `HOME_SECTIONS` — é o que faz as âncoras do rodapé (`/#faq`)
funcionarem.

### `Menu` — `/cardapio`

Consome `useMenu()`, `useCart()`, `useSite()`. Abas por categoria (`Tabs` + `TABS_ID`),
busca opcional (`config.sections.menuSearch`), categoria refletida na URL
(`?categoria=`, via `useSearchParams`).

Busca normalizada: `normalizar()` remove acento (NFD + strip de diacríticos) e caixa —
"acai" acha "Açaí". `combina()` exige que **toda** palavra do termo apareça em
nome+descrição+tag+ingredientes.

`ItemList` (componente local) mantém **um item expandido por vez**: o estado vive na
lista, não em cada cartão, porque a regra é sobre o conjunto.

### `Order` — `/pedido`

Consome `useCart()`, `useAddress()`, `useSite()`. Renderiza `OrderLine` por linha,
`AddressForm`, e o CTA de WhatsApp com `buildOrderLink()`.

Regras de negócio da tela, lidas de `config.operation`:
```ts
totalComTaxa   = totalCents + deliveryFeeCents
faltaParaMinimo = Math.max(0, minOrderCents - totalCents)
podeFinalizar  = acceptsOrders && faltaParaMinimo === 0 && Boolean(contact.whatsappNumber)
```
Carrinho vazio → `StatusMessage type="empty"` com link para o cardápio.
**Endereço não é validado**; campos vazios são omitidos da mensagem.

### `NotFound` — `path="*"` (e destino do `AdminGuard`)

Estático. Também é o que o `AdminGuard` renderiza sem sessão — 404 em vez de tela de
login, para não revelar que `/admin/*` existe.

---

## Admin — dentro de `AdminShell` + `AdminGuard`

### `AdminLogin` — `/admin/login`

Fora da casca e fora do guard. E-mail + senha → `signIn()` → `navigate(ROUTES.admin)`.
Erro exibido inline. `signIn` já reprova quem não está em `admins`.

### `AdminOverview` — `/admin`

Responde "está tudo certo?" em um olhar: restaurante aberto, quantos itens no ar,
quantos destaques, o que falta cadastrar. Sem ela, a área abriria numa lista de itens,
que não diz nada sobre o estado do site.

Monta `Contagens { total, disponiveis, destaques, maisPedidos }` de
`listAdminMenuItems()`, e lê `faq`/`testimonials`/`gallery` de `useSite()`.

### `AdminMenuItems` — `/admin/items`

Lista com filtro por termo e por categoria (`Select`). Carrega
`Promise.all([listAdminMenuItems(), listCategories()])`. Excluir chama
`deleteMenuItem(id, photoPath)` e depois `reload()`. Editar → `editItemPath(id)`.

### `AdminMenuItemForm` — `/admin/items/new` e `/admin/items/:id`

**Uma página para criar e editar.** `const isEditing = Boolean(useParams().id)`.
Novo → `emptyFormValues()`. Edição → `getAdminMenuItem(id)` → `toFormValues(item)`.

Foto: `validatePhotoFile(file)` **antes** do upload (JPG/PNG/WEBP, máx. 5MB), preview
local por object URL, e o arquivo antigo só é apagado depois que o novo upload tem
sucesso.

Estado separado por responsabilidade: `values` · `currentPhotoPath` · `photoPreview` ·
`photoFile` · `photoError` · `submitError` · `submitting`.

### `AdminSiteSettings` — `/admin/settings`

Quatro abas em `tabs/`, refletidas na URL por `?aba=`:

| aba | arquivo | conteúdo |
| --- | --- | --- |
| `perfil` | `ProfileTab.tsx` | identidade + contato |
| `operacao` | `OperationTab.tsx` | entrega, mínimo, pagamento, horários, aviso |
| `aparencia` | `AppearanceTab.tsx` | tema padrão, toggle, paleta de marca, flags de seção |
| `conteudo` | `ContentTab.tsx` | FAQ, depoimentos, galeria |

Decisão: **tudo concentrado numa tela só**, em vez de espalhar cada assunto pela área
onde aparece — quem administra precisa saber onde procurar, e "está nas configurações"
é a resposta que não exige memória.

**O rascunho vive em estado local e só vai para o banco no botão do rodapé.** Salvar a
cada tecla geraria dezenas de escritas por edição e faria a vitrine piscar a cada letra.
Flags de controle: `salvando`, `salvo`, `erroAoSalvar`, `alterado`.

A aba Aparência pré-visualiza a marca ao vivo no admin inteiro; sair sem salvar desfaz.

---

## Convenções

- **`sections/` e `tabs/`** guardam componentes que só existem para aquela página. Não
  os promova a `components/` "por via das dúvidas".
- **Todo identificador em inglês** — variáveis locais, tipos e props (`styles`,
  `loading`, `tabFromUrl`, `SKELETONS`). Só o texto voltado ao usuário (labels,
  mensagens) e os comentários ficam em português. Siga o arquivo vizinho.
- **Estado de UI efêmero** (aba ativa, termo de busca, item expandido) é `useState`
  local. Só sobe para contexto o que outra tela precisa.
- **Estado que o usuário deve poder compartilhar por link** (categoria do cardápio, aba
  das configurações) vai para `useSearchParams`, não `useState`.
- Página nova: pasta + `index.tsx` + `.module.css` · `ROUTES` · `<Route>` em `App.tsx` ·
  `NAV_ITEMS` do shell se for navegável.
