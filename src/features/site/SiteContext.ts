import { createContext } from 'react'
import type { SiteContent } from './types'

export type SiteContextValue = SiteContent & {
  /** Verdadeiro só na primeira leitura — depois disso sempre há conteúdo. */
  loading: boolean
  /** Preenchido quando a leitura falhou; a vitrine segue com os padrões. */
  error: string | null
  reload: () => void
}

export const SiteContext = createContext<SiteContextValue | undefined>(undefined)
