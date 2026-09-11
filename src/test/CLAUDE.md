# src/test

**Setup compartilhado do Vitest.** Um arquivo só — `setup.ts`.

---

## Configuração

Em `vite.config.ts`:

```ts
test: {
  environment: 'jsdom',
  globals: true,                      // describe/it/expect sem import
  setupFiles: ['./src/test/setup.ts'],
  css: false,                         // CSS Modules viram proxy de identidade
}
```

`css: false` significa que **`styles.algumaClasse` é `undefined` nos testes**. Nunca
consulte por classe CSS — é mais uma razão para consultar por papel e texto visível.

## `setup.ts`

1. Importa `@testing-library/jest-dom/vitest` (matchers `toBeInTheDocument`, etc.).
2. **Duplo de `window.matchMedia`**, que não existe no jsdom. O tema depende dele para
   resolver a preferência "sistema"; sem o duplo, qualquer teste que monte um componente
   sob o `ThemeProvider` quebraria por um motivo sem relação com o que está sendo
   testado. O padrão é `matches: false` (não prefere escuro) — um teste que precise do
   contrário sobrescreve pontualmente:

```ts
window.matchMedia = ((q: string) => ({ ...anterior(q), matches: true })) as never
```

Duplo global novo entra aqui **só** quando faltar uma API do browser que o jsdom não tem
e que múltiplos testes precisem. Mock de módulo do projeto fica no arquivo de teste.

---

## Como se testa neste projeto

**Localização:** `<arquivo>.test.ts(x)` ao lado do arquivo testado, nunca em pasta espelho.

**O que é testado:** onde há regra de negócio de verdade — reducers, selectors,
mapeamentos service↔banco, formatação, cálculo de horário — e componentes cujo valor
está na semântica (ARIA, teclado).

**O que deliberadamente não é testado:**
- Telas do admin (`pages/Admin*`). Testa-se a função pura do service, não o hook/tela
  que faz a chamada de rede.
- O fluxo de autenticação em si — não vale o custo aqui.
- Componentes que só renderizam uma `<div>` com props.

Não crie testes nessas categorias sem o usuário pedir.

**Como se consulta:** por **papel e texto visível**, como o usuário percebe a tela
(`getByRole('tab', { name: 'Lanches' })`). Nunca por classe, `data-testid` ou estrutura
de DOM.

**Fixtures:** `testSiteConfig(overrides?)` em `features/site/testSiteConfig.ts` para
`SiteConfig`. `emptyFormValues()` em `menuAdminService` para o formulário de item. Use-os
em vez de montar objetos grandes à mão.

**Nomes:** descrevem comportamento, não implementação.
✅ `'remove a linha ao decrementar a última unidade'`
❌ `'chama dispatch com type decrement'`

## Comandos

```bash
npm run test       # watch
npm run test:run   # uma vez (CI)
npm run verify     # tipos + lint + testes — o portão antes de entregar
```
