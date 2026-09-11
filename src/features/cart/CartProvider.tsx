import { useCallback, useMemo, useReducer, type ReactNode } from 'react'
import { CartContext, type CartContextValue } from './CartContext'
import { INITIAL_STATE, cartReducer } from './cartReducer'
import { isEmpty, totalQuantity, totalCents } from './selectors'
import type { MenuItem } from '../menu/types'

type Props = { children: ReactNode }

/**
 * O carrinho é o único estado realmente compartilhado entre telas (o Cardápio
 * escreve, o Pedido e a navegação leem). Context + useReducer resolve isso sem
 * dependência externa; uma store dedicada só se justificaria com mais estados
 * globais ou com necessidade de seleção granular por performance.
 */
export function CartProvider({ children }: Props) {
  const [state, dispatch] = useReducer(cartReducer, INITIAL_STATE)

  const add = useCallback((item: MenuItem) => dispatch({ type: 'add', item }), [])
  const increment = useCallback((id: string) => dispatch({ type: 'increment', id }), [])
  const decrement = useCallback((id: string) => dispatch({ type: 'decrement', id }), [])
  const remove = useCallback((id: string) => dispatch({ type: 'remove', id }), [])
  const clear = useCallback(() => dispatch({ type: 'clear' }), [])

  // `dispatch` não é exposto: quem consome o carrinho fala por intenções
  // ("adicionar este item"), não por ações do reducer. Isso deixa o formato
  // interno do estado livre para mudar sem quebrar as telas.
  const value = useMemo<CartContextValue>(
    () => ({
      lines: state.lines,
      totalQuantity: totalQuantity(state),
      totalCents: totalCents(state),
      empty: isEmpty(state),
      add,
      increment,
      decrement,
      remove,
      clear,
    }),
    [state, add, increment, decrement, remove, clear],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
