import { useContext } from 'react'
import { SiteContext, type SiteContextValue } from './SiteContext'

/**
 * Configuração e conteúdo do site.
 *
 * Nunca devolve `undefined` para os dados: enquanto a leitura não volta, o que
 * está no contexto são os padrões de `defaults.ts`. Isso tira de toda tela a
 * obrigação de tratar "ainda não sei o nome do restaurante" — quem precisa
 * mostrar esqueleto olha `loading`.
 */
export function useSite(): SiteContextValue {
  const context = useContext(SiteContext)

  if (!context) {
    throw new Error('useSite precisa estar dentro de <SiteProvider>.')
  }

  return context
}
