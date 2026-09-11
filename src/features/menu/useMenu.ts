import { useCallback, useEffect, useState } from 'react'
import { fetchMenu } from './menuService'
import type { Menu } from './types'

type MenuState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; menu: Menu }

type UseMenuResult = MenuState & { reload: () => void }

/**
 * Carrega o cardápio e expõe o resultado como união discriminada em vez de
 * `{ dados, carregando, erro }`. O tipo passa a impedir estados impossíveis
 * (erro preenchido junto com dados) e a tela vira uma checagem exaustiva.
 */
export function useMenu(): UseMenuResult {
  const [state, setState] = useState<MenuState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  // Voltar para "carregando" acontece aqui, no evento, e não dentro do efeito:
  // setState síncrono em efeito provoca renderização em cascata. O estado
  // inicial já é "carregando", então a primeira busca não precisa disso.
  const reload = useCallback(() => {
    setState({ status: 'loading' })
    setAttempt((n) => n + 1)
  }, [])

  useEffect(() => {
    // Descarta a resposta se o componente desmontar ou uma nova busca começar,
    // evitando setState em componente desmontado e resposta fora de ordem.
    let active = true

    fetchMenu()
      .then((menu) => {
        if (active) setState({ status: 'ready', menu })
      })
      .catch((error: unknown) => {
        if (!active) return
        setState({
          status: 'error',
          message: error instanceof Error ? error.message : 'Erro inesperado ao carregar o cardápio.',
        })
      })

    return () => {
      active = false
    }
  }, [attempt])

  return { ...state, reload }
}
