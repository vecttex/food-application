# src/styles

**A camada de estilo global: tokens, temas, base e um punhado de utilitários.**
Estilo de componente **não** mora aqui — cada componente tem o seu `.module.css`.

Regra que governa tudo: **nenhum `.module.css` escreve valor de cor literal.**
Se falta um tom, ele nasce em `themes/`, nunca no módulo.

---

## Ordem em `index.css` — a única regra difícil

```
1. tokens/     valores crus e escalas. Não pintam nada sozinhos.
2. themes/     brands.css traz a paleta da marca; light/dark amarram os --color-*
3. base/       reset e defaults do documento, já usando os semânticos
4. utilities/  classes globais que não valem um componente
```

Inverter isso quebra a cascata. `main.tsx` importa só `./styles/index.css`.

---

## `tokens/` — valores crus

Ninguém consome `palette.css` direto: quem usa são os arquivos de tema, que dão a cada
escala um **papel**. Essa indireção é o que permite dois temas sem duplicar o CSS dos
componentes.

**`palette.css`** — espaço de cor **oklch** (lightness é perceptual: `--neutral-40` tem o
mesmo peso visual em qualquer matiz, o que não vale para HSL).
- `--neutral-0 … --neutral-100` (18 degraus), levemente quentes (matiz 80) — seguram
  qualquer cor de marca sem esfriar a foto de comida, o conteúdo dominante do site.
- Estado, dois tons cada: `--red-45/70` · `--green-45/70` · `--amber-50/75`.
- **A cor da marca NÃO está aqui** — vive em `themes/brands.css`.

**`space.css`** — escala de 4px, com saltos de propósito (6→8→10→12→16): espaço grande é
decisão de composição, e meio-tom para tudo produz ritmo aleatório.
- `--space-1 … --space-20` · `--radius-xs|sm|md|lg|xl|2xl|pill`
- `--width-content` 1280 · `--width-menu` 1080 · `--width-order` 680 · `--width-text`
- `--height-top-bar` · `--height-bottom-bar`
- `--bp-md` 768 · `--bp-lg` 1080 — ⚠️ **documentação apenas.** Custom property não
  funciona dentro de `@media`; o valor aparece literal nas media queries.

**`typography.css`**
- `--font-heading` (Space Grotesk) · `--font-body` (Manrope) · `--font-mono`
- `--text-xs` 11px … `--text-5xl` 56px
- `--font-weight-normal|medium|semibold|bold` · `--line-height-tight|heading|body`
- `--letter-spacing-heading` · `--letter-spacing-label`

**`elevation.css`** — `--shadow-sm|md|lg|xl` · `--shadow-brand` · `--ring` ·
`--ring-strong` · `--glass-blur`. Todas derivam de `--shadow-color`, definida por tema.

**`motion.css`** — `--duration-fast|media|lenta` · `--easing-standard|saida|suave` ·
atalhos `--transition` e `--transition-medium`.

## `themes/` — os tokens semânticos

**`light.css` é o piso e define TODO token semântico do projeto.** Está em `:root` puro
de propósito. `dark.css` sobrescreve **só o que muda** — assim nenhum token corre o risco
de existir num tema e faltar no outro. **`--color-*` novo nasce em `light.css` primeiro.**

Grupos em `light.css`:
```
Superfícies  --color-background · --color-background-alt · --color-surface{,-2,-3,-raised,-inverted}
             --color-text-inverted · --color-glass · --color-overlay
Traços       --color-border · --color-border-strong · --color-border-dashed
Marca        --color-brand · --color-brand-light · --color-brand-dark · --color-brand-text
             --color-brand-soft{,-strong} · --color-on-brand · --color-brand-gradient
Texto        --color-text{,-strong,-soft,-secondary,-tertiary,-faint}
Estado       --color-error{,-soft} · --color-success{,-soft} · --color-warning{,-soft} · --color-focus
Elevação     --shadow-color · --cover-glow
```

**`brands.css`** — uma paleta por `[data-brand='<id>']`, com **quatro papéis por tema**:
`fill` (preenchimento) · `fill-hover` · `ink` (a marca virando texto sobre a página)
· `on` (o texto por cima do preenchimento). `fill` e `ink` são valores diferentes
porque o tom que preenche um botão quase nunca tem contraste para virar texto sobre
branco. `light.css`/`dark.css` só decidem qual papel cada tom cumpre.

O banco guarda o **ID** da paleta, nunca o hexadecimal — cada uma é um conjunto de tons
conferidos à mão, com **todos os pares de texto acima de 4.5:1 nos dois temas**.

Como o CSS chega ao tema: o **script inline do `index.html`** resolve e escreve
`data-theme` antes do primeiro pintar. Por isso o CSS só conhece `:root` (claro) e
`:root[data-theme='dark']` — **não existe cópia dos tokens dentro de
`@media (prefers-color-scheme: dark)`**, que só cobriria o caso sem JavaScript, em que
este SPA não renderiza nada de qualquer forma.

## `base/`

**`reset.css`** — reset mínimo. **`document.css`** — defaults de body, títulos, links,
já usando os semânticos.

**`a11y.css`** — transversal, e o que você não deve reimplementar por componente:
- `:focus-visible` global — `outline: 2px solid var(--color-focus)`, offset 2px. Teclado é
  navegação de primeira classe.
- `@media (pointer: coarse)` — `touch-action: manipulation` em interativos (alvo de
  toque mínimo de 44px, WCAG 2.2).
- **`.u-apenas-leitor`** — texto só para leitor de tela. Use esta classe; não escreva
  outro `sr-only`.
- `@media (prefers-reduced-motion: reduce)` — zera animação/transição globalmente.

## `utilities/layout.css`

Lista curta de propósito: utilitário demais vira framework paralelo e o CSS Module perde
a razão de existir. Entra só o que é usado por telas diferentes **e** não tem
comportamento próprio.

- **`.u-container`** — faixa central. `--width-max` (variável local) deixa cada tela
  apertar o limite sem classe nova. Padding 20px, 32px acima de 768px.
- **`.u-trilho`** — rolagem horizontal com snap e sem barra visível (carrossel de
  destaques, abas, galeria).
- **`.u-linhas-2` / `.u-linhas-3`** — corte de texto em N linhas.

---

## Ao mexer no estilo

1. Precisa de um tom novo? Nasce em `themes/light.css`; se muda no escuro, ganha a linha
   em `dark.css`. **Nunca** hexadecimal num `.module.css`.
2. Espaço, raio, sombra, tamanho de texto: use o token existente. Se nenhum serve, o
   problema provavelmente é a composição, não a escala.
3. Classes dos `.module.css` em **inglês** (`.trigger`, `.summaryRow`), como o resto do
   código — só o *conteúdo* (texto, mensagens) é em português.
4. Breakpoint: 768px é o principal (900px no admin; 480px/1080px pontuais). Valor
   literal na media query, com o token como referência mental.
5. Paleta nova: bloco em `brands.css` + id no catálogo `features/theme/brands.ts` + id no
   `check` de `site_config.brand_color`. Confira contraste ≥ 4.5:1 nos dois temas.
