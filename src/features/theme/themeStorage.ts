import { isThemePreference, type ResolvedTheme, type ThemePreference } from './types'

/**
 * Persistência e resolução do tema.
 *
 * Fica fora do React de propósito: o mesmo par de funções é usado pelo
 * provider e pelo script inline do `index.html`, que roda antes de qualquer
 * componente montar. Os dois precisam concordar no nome da chave e na regra de
 * resolução — e a única forma de garantir isso é ter um lugar só que descreva
 * as duas coisas.
 */

/** Mesma chave usada no script anti-flash do `index.html`. */
export const THEME_STORAGE_KEY = 'brasa-nove-tema'

const DARK_QUERY = '(prefers-color-scheme: dark)'

/** Leitura tolerante: modo anônimo e storage bloqueado não podem quebrar o app. */
export function readStoredPreference(): ThemePreference | null {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    return isThemePreference(stored) ? stored : null
  } catch {
    return null
  }
}

export function storePreference(preference: ThemePreference): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, preference)
  } catch {
    // Sem storage a escolha vale só para esta sessão. Perder a preferência é
    // muito melhor do que derrubar a tela com uma exceção de segurança.
  }
}

export function systemPrefersDark(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(DARK_QUERY).matches
}

export function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference === 'system') {
    return systemPrefersDark() ? 'dark' : 'light'
  }
  return preference
}

/** Observa a troca de tema do sistema operacional enquanto a aba está aberta. */
export function watchSystemTheme(onChange: () => void): () => void {
  if (typeof window === 'undefined') return () => {}

  const query = window.matchMedia(DARK_QUERY)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

/**
 * Aplica o tema no documento.
 *
 * `data-theme` é o que o CSS lê (`themes/dark.css`), e `theme-color` é o que
 * pinta a barra do navegador no celular — sem ele, o topo do Chrome fica
 * branco por cima de um site escuro.
 */
export function applyThemeToDocument(theme: ResolvedTheme): void {
  const root = document.documentElement
  root.dataset.theme = theme

  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) {
    // Lê a cor de fundo já resolvida em vez de repetir o valor aqui: assim a
    // barra do navegador acompanha qualquer mudança feita nos tokens.
    const background = getComputedStyle(root).getPropertyValue('--color-background').trim()
    if (background) meta.setAttribute('content', background)
  }
}
