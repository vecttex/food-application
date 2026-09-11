import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { ThemeContext, type ThemeContextValue } from './ThemeContext'
import {
  applyThemeToDocument,
  readStoredPreference,
  storePreference,
  systemPrefersDark,
  watchSystemTheme,
} from './themeStorage'
import type { ResolvedTheme, ThemePreference } from './types'

type Props = { children: ReactNode }

/**
 * Dono do tema da aplicação.
 *
 * O primeiro pintar não passa por aqui: o script inline do `index.html` já
 * escreveu `data-theme` no <html> antes do React montar. Este provider assume o
 * controle depois — é o que evita o flash de tela branca em quem usa escuro,
 * mantendo uma fonte de verdade só (`themeStorage`) para as duas pontas.
 *
 * O tema pintado é derivado na renderização (preferência + estado do sistema),
 * e não guardado em um terceiro `useState`: dois estados que precisam concordar
 * é exatamente onde nasce o bug de "o botão diz claro e a tela está escura".
 */
export function ThemeProvider({ children }: Props) {
  const [preference, setPreferenceState] = useState<ThemePreference>(
    () => readStoredPreference() ?? 'system',
  )
  const [systemDark, setSystemDark] = useState(systemPrefersDark)

  // Escolha explícita trava o padrão do admin: se a pessoa já clicou no botão,
  // uma troca de configuração não pode passar por cima dela.
  const chosenByUser = useRef(readStoredPreference() !== null)

  const theme: ResolvedTheme = preference === 'system' ? (systemDark ? 'dark' : 'light') : preference

  useEffect(() => watchSystemTheme(() => setSystemDark(systemPrefersDark())), [])

  useEffect(() => {
    applyThemeToDocument(theme)
  }, [theme])

  const setPreference = useCallback((next: ThemePreference) => {
    chosenByUser.current = true
    storePreference(next)
    setPreferenceState(next)
  }, [])

  const toggle = useCallback(() => {
    setPreference(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setPreference])

  const applyDefaultPreference = useCallback((next: ThemePreference) => {
    if (chosenByUser.current) return
    setPreferenceState(next)
  }, [])

  const value = useMemo<ThemeContextValue>(
    () => ({ preference, theme, setPreference, toggle, applyDefaultPreference }),
    [preference, theme, setPreference, toggle, applyDefaultPreference],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
