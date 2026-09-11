import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { SiteContext, type SiteContextValue } from './SiteContext'
import { DEFAULT_SITE_CONFIG } from './defaults'
import { fetchSiteContent } from './siteService'
import { applyBrandToDocument } from '../theme/brandStorage'
import { useTheme } from '../theme/useTheme'
import type { SiteContent } from './types'

type Props = { children: ReactNode }

const INITIAL_CONTENT: SiteContent = {
  config: DEFAULT_SITE_CONFIG,
  hours: [],
  faq: [],
  testimonials: [],
  gallery: [],
}

/**
 * Carrega a configuração do site uma vez e a distribui para a aplicação
 * inteira.
 *
 * Uma leitura só, no topo: nome, telefone, horários e as flags de seção são
 * usados em quase toda tela, e buscá-los por página significaria a mesma query
 * repetida a cada navegação — com um piscar de conteúdo em cada uma.
 */
export function SiteProvider({ children }: Props) {
  const [content, setContent] = useState<SiteContent>(INITIAL_CONTENT)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  const { applyDefaultPreference } = useTheme()

  const reload = useCallback(() => {
    setLoading(true)
    setError(null)
    setAttempt((n) => n + 1)
  }, [])

  useEffect(() => {
    let active = true

    fetchSiteContent()
      .then((next) => {
        if (!active) return
        setContent(next)
        setError(null)
        // O tema padrão é configuração do restaurante, mas só vale para quem
        // ainda não escolheu — o provider de tema cuida dessa precedência.
        applyDefaultPreference(next.config.appearance.defaultTheme)
        // A cor da marca não tem essa negociação: é decisão do admin e vale
        // para todo mundo. O script inline já pintou a última conhecida; aqui
        // ela é confirmada (ou corrigida) e volta para o cache.
        applyBrandToDocument(next.config.appearance.brandColor)
      })
      .catch((cause: unknown) => {
        if (!active) return
        setError(
          cause instanceof Error ? cause.message : 'Erro inesperado ao carregar a configuração.',
        )
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [attempt, applyDefaultPreference])

  const value = useMemo<SiteContextValue>(
    () => ({ ...content, loading, error, reload }),
    [content, loading, error, reload],
  )

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>
}
