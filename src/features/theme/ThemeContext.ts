import { createContext } from 'react'
import type { ResolvedTheme, ThemePreference } from './types'

export type ThemeContextValue = {
  /** O que a pessoa escolheu — pode ser 'system'. */
  preference: ThemePreference
  /** O que está pintado agora — nunca 'system'. */
  theme: ResolvedTheme
  setPreference: (preference: ThemePreference) => void
  /** Alterna claro ↔ escuro a partir do que está na tela. */
  toggle: () => void
  /**
   * Define o padrão vindo das configurações do admin. Só tem efeito enquanto a
   * pessoa não tiver escolhido nada: escolha do visitante ganha da do dono.
   */
  applyDefaultPreference: (preference: ThemePreference) => void
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)
