# src/lib

**Infraestrutura.** Cliente HTTP, leitura de env, formatação, resolução de URL de
arquivo. Sem React, sem conhecimento do domínio — se um módulo aqui precisa saber o que
é um item de cardápio, ele está no lugar errado (vai para `features/`).

---

## `env.ts`

```ts
export const env = { supabaseUrl, supabasePublishableKey } as const
```

**A validação acontece na borda, no import do módulo.** Se faltar credencial, o app
quebra no boot com uma mensagem que diz o que fazer ("copie `.env.example` para
`.env.local`") — e não no meio de uma request, com erro genérico do supabase-js.

Variável nova segue o mesmo padrão: passe por `obrigatoria(nome, valor)`.
Tudo que começa com `VITE_` **vai para o bundle e fica visível no navegador**. A
`service_role` key nunca entra aqui — a proteção dos dados é RLS, não esconder chave.

## `supabase.ts`

```ts
export const supabase: SupabaseClient<Database>   // persistSession: false,
                                                  // autoRefreshToken: false
```

Instância única (não uma por chamada): o supabase-js mantém pool de conexão e sessão
internamente, e vários clients duplicam esse estado.

`persistSession: false` porque o site público não faz login — lê o cardápio com a chave
publishable, sob RLS de leitura anônima. Ligar sessão aqui só criaria escrita inútil no
`localStorage`.

⚠️ **Nunca use este client para escrever.** Ele não carrega o papel `authenticated` nas
policies. Escrita é `adminSupabase`, em `features/admin/authService.ts`.
E **não afrouxe este client** para atender o admin — os dois coexistem de propósito.

## `format.ts`

```ts
formatPrice(cents: number): string        // 1990 → "R$ 19,90"
formatItemCount(quantity: number): string // "1 item" | "3 itens"
centsToReaisInput(cents): string          // 1990 → "19.90"  (para <input type=number>)
reaisInputToCents(reais: string): number  // "19.90" → 1990
```

**Preço trafega e é calculado sempre em centavos (inteiro).** Float acumula erro de
arredondamento na soma do carrinho; o tipo `integer` de `price_cents` já reflete essa
decisão no banco. Formate só na exibição.

`formatPrice` normaliza o espaço não separável do ICU (U+00A0 / U+202F) para espaço
comum: o caractere exato varia entre versões de Node e navegador, e um invisível
diferente no texto que vai para o WhatsApp já causou confusão.

`reaisInputToCents` usa `parseFloat` direto, sem troca de vírgula: `<input type="number">`
sempre usa ponto como separador decimal, independente do locale.

Testes: `format.test.ts`.

## `storage.ts`

```ts
export const BUCKET_MENU = 'menu'
getPublicPhotoUrl(path: string | null): string | null
```

**O banco guarda o path relativo, não a URL absoluta.** Assim, trocar de bucket, de
projeto Supabase ou colocar um CDN na frente não exige reescrever registro nenhum — só
este módulo muda. Tolera registros legados que já guardaram a URL inteira.

Caminhos em uso: itens legados `lanches/<slug>.jpg` · itens do admin `items/<uuid>.<ext>`
· capa `cover/site.<ext>` · logo `cover/logo.<ext>` · galeria `gallery/<uuid>.<ext>`.

Resolva a URL no **service** (o modelo de domínio já sai com `photoUrl` pronta), não no
componente.

## `database.types.ts`

Tipos gerados do schema. **Não editar à mão.** Regenerar após migration:

```bash
npx supabase gen types typescript --project-id <ref> > src/lib/database.types.ts
```

Use `Tables<'menu_items'>` / `TablesUpdate<'site_config'>` nos services, e converta para
o modelo de domínio ali mesmo — nenhum componente deve importar tipo de banco.

---

## Ao adicionar um módulo aqui

Pergunte: isso funcionaria idêntico em outro projeto que não vendesse hambúrguer?
Se não, é `features/`. Se sim: sem React, sem estado, funções puras quando possível,
teste ao lado (`<nome>.test.ts`).
