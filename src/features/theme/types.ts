/**
 * Preferência de tema — o que a pessoa escolheu.
 *
 * `sistema` é um valor de primeira classe, e não a ausência de escolha: quem
 * troca o celular para escuro às 19h espera que o site acompanhe. Guardar só
 * 'claro' | 'escuro' obrigaria a congelar o tema no momento da primeira
 * visita.
 */
export type ThemePreference = 'light' | 'dark' | 'system'

/** O tema efetivamente pintado na tela, depois de resolver `system`. */
export type ResolvedTheme = 'light' | 'dark'

export const THEME_PREFERENCES: ThemePreference[] = ['light', 'dark', 'system']

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system'
}
