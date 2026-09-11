# src/components

**UI genérica, sem nenhum conhecimento do domínio.** Um componente daqui não sabe o
que é um hambúrguer, um pedido ou um horário de funcionamento. Se souber, ele
pertence a `features/<assunto>/components/`.

Convenção: uma pasta por componente, com `index.tsx` e o `.module.css` ao lado.
Import: `import { Button } from '../../components/Button'`.

---

## Catálogo

### Ação

**`Button`** · `Button.module.css` · `classes.ts`
```ts
variant?: 'primary' | 'secondary' | 'ghost' | 'suave' | 'perigo'   // padrão: primary
size?: 'sm' | 'md' | 'lg'                                          // padrão: md
fullWidth? · pill? · spaceBetween?                                 // + ButtonHTMLAttributes
```
`type="button"` por padrão — dentro de `<form>` o default do HTML é `submit`, um dos
bugs mais silenciosos em formulário React.

**`LinkButton`** — mesma aparência, renderiza `<a>` com `target="_blank"` e
`rel="noopener noreferrer"` por padrão. Use para navegação (WhatsApp, Instagram, maps):
`<a href>` permite nova aba, copiar link, e é o que o leitor de tela anuncia. Um
`<button onClick={window.open}>` perde tudo isso e costuma ser bloqueado como popup.

**`buttonClasses(props, externalClass?)`** (`classes.ts`) — monta as classes sem
renderizar elemento. Existe para que o `<Link>` do react-router tenha aparência de
botão sem a camada de UI importar o router, e para manter o Fast Refresh (o módulo de
componente só exporta componente).

**`IconButton`** — `{ label: string; variant?: 'primary'|'secondary'|'ghost'; size?: 'sm'|'md' }`
+ `ButtonHTMLAttributes`. `label` vira o rótulo acessível; é obrigatório.

**`QuantityStepper`** — `{ quantity, onIncrement, onDecrement, description }`.
`description` descreve *o que* está sendo contado, para o leitor de tela.

### Entrada

**`Input`** — `Omit<InputHTMLAttributes, 'id'> & { label; hiddenLabel?; error? }`
**`Textarea`** — idem + `{ showCount? }` (contador só aparece com `maxLength`), `rows=4`
**`Select`** — `Omit<SelectHTMLAttributes, 'id'|'children'> & { label; options: SelectOption[]; hiddenLabel?; error?; placeholder? }`

Contrato comum aos três: o `id` vem de `useId()` internamente (por isso é omitido das
props), o `<label>` é amarrado por `htmlFor`, e `error` é anunciado via
`aria-describedby` + `aria-invalid`. `hiddenLabel` esconde visualmente sem tirar da
árvore de acessibilidade. **Não passe `id` manualmente.**

**`Switch`** — `{ checked, onChange, label, description?, disabled? }`.
É um `<input type="checkbox" role="switch">` real escondido sob a pastilha, não uma
`<div role="switch">`: o input nativo já traz foco, tecla de espaço e estado para o
leitor de tela.

### Superfície e layout

**`Panel`** — `{ variant?: PanelVariant; stacked?; interactive?; padding?: 'padrao'|'compacto'|'nenhum'; className?; id? }`

| variant | uso |
| --- | --- |
| `base` | superfície padrão dos cartões |
| `contorno` | só o anel de borda — cartão dentro de superfície já elevada |
| `vidro` | translúcido com desfoque, para o que flutua sobre foto |
| `destaque` | fundo da marca em versão suave |
| `tracejado` | bloco informativo leve (tempo de entrega, avisos) |
| `discreto` | encaixe dentro de outro cartão (lista de ingredientes) |

Antes de criar uma sétima variante, verifique se ela não é uma das seis com outro nome.

**`Section`** — `{ title; description?; eyebrow?; action?; children; tone?: 'padrao'|'alternado'; bleed?; id?; className? }`.
`id` é o que liga a seção às âncoras de `HOME_SECTIONS`.

**`InfoRow`** — `{ icon: ReactNode; label: string; children }`. Linha ícone + rótulo + valor.

### Feedback

**`StatusMessage`** — `{ type: 'loading'|'error'|'empty'; title; description?; action? }`.
Os três estados moram no mesmo componente porque ocupam o mesmo lugar do layout e têm a
mesma estrutura; três componentes quase idênticos divergiriam na primeira mudança de
espaçamento. `role="alert"` quando `type='error'`, `role="status"` nos demais — anuncia
a mudança sem roubar o foco, importante porque estes blocos aparecem após a
renderização inicial.

**`Skeleton`** — `{ height='1rem'; width='100%'; radius?; className? }`.
**`Badge`** — `{ children; variant?: BadgeVariant; withDot?; icon?; className? }` (padrão `suave`).

### Navegação

**`Tabs<T extends string>`** — `{ options: TabOption<T>[]; value: T; onSelect; label; idPrefix }`.
Padrão ARIA tablist completo: setas ←/→ percorrem as abas, só a ativa fica na ordem de
tabulação (`tabIndex`), e `aria-controls` liga ao painel.
**O painel correspondente DEVE ter `id={`${idPrefix}-painel-${value}`}` e
`aria-labelledby={`${idPrefix}-aba-${value}`}`** — senão a ligação ARIA quebra.
Testado em `Tabs.test.tsx`.

**`Accordion`** — `{ items: AccordionItem[]; idPrefix='faq' }`, onde
`AccordionItem = { id, question, answer }`. Um item aberto por vez.

### Mídia e identidade

**`ItemPhoto`** — `{ url: string | null; alt; width?; height?; format?: PhotoFormat; ratio?; priority? }`.
Com `url` nula (ou arquivo inexistente) mostra um placeholder no mesmo espaço que a foto
ocuparia — permite cadastrar fotos aos poucos sem a lista "pular". **Passe a URL já
resolvida por `getPublicPhotoUrl()`**, não o path do banco.

**`Avatar`** — `{ name; size?: 'sm'|'md' }`. Deriva as iniciais de `name`.
**`Rating`** — `{ value; size?=14; caption? }`.

### Tema

**`ThemeToggle`** — `{ variant?: 'segmentado'|'compacto'; className? }`. Alterna entre
os três estados de `ThemePreference` (`light | dark | system`). Consome `useTheme()`.

**`BrandSwatches`** — `{ value: BrandId; onChange; label }`. Cada botão carrega o
próprio `data-brand` e é pintado com `var(--brand-swatch)` — a mesma variável do CSS,
no tema que está na tela. **Nenhum hexadecimal atravessa o TypeScript**, então não
existe amostra dizendo uma coisa e o site pintando outra. Testado em
`BrandSwatches.test.tsx`.

### `Icon`

Arquivo único com ~40 exportações (`IconPin`, `IconBag`, `IconSettings`…), agrupadas por
contexto no arquivo: geral · Tema · Vitrine · Admin. São one-liners com a mesma
assinatura (`SVGProps<SVGSVGElement>`); quebrar em quarenta pastas seria cerimônia sem
ganho.

Padrão do wrapper `Svg`: `20×20`, `viewBox="0 0 24 24"`, `stroke="currentColor"`,
`strokeWidth="1.8"`, `aria-hidden="true"`, `focusable="false"`.
**Os ícones herdam a cor via `currentColor` e são sempre decorativos** — o significado
vem do texto ao lado ou do `aria-label` de quem os usa. Redimensione por
`width`/`height`, não por CSS.

Ícone novo: adicione uma função no grupo temático certo, usando `<Svg>`. Nunca importe
biblioteca de ícones.

---

## Ao criar um componente aqui

1. Ele é genérico? Se conhece o domínio, vai para `features/<assunto>/components/`.
2. Estende o elemento HTML nativo quando houver um (`Omit<XHTMLAttributes, 'id'> & {...}`).
3. `id` interno via `useId()` — nunca peça `id` como prop de campo de formulário.
4. Só tokens semânticos no `.module.css`. Zero cor literal.
5. Classes do CSS Module em inglês (`styles.trigger`, não `styles.gatilho`); mesmo
   idioma dos props e tipos. Import sempre como `styles`, nunca `estilos`.
6. Teste só se o valor estiver na semântica (ARIA, teclado) ou em lógica de fato —
   não teste que uma `<div>` renderiza.
