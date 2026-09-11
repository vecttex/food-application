import { createContext } from 'react'
import type { MenuItem } from '../menu/types'
import type { CartLine } from './types'

export type CartContextValue = {
  lines: CartLine[]
  totalQuantity: number
  totalCents: number
  empty: boolean
  add: (item: MenuItem) => void
  increment: (id: string) => void
  decrement: (id: string) => void
  remove: (id: string) => void
  clear: () => void
}

/**
 * O contexto vive em arquivo próprio (sem componente junto) por duas razões:
 * mantém o Fast Refresh do Vite funcionando no provider e deixa explícito que
 * a API pública do carrinho é este contrato, não o reducer.
 *
 * `undefined` como default é intencional: permite que o hook detecte uso fora
 * do provider e falhe alto, em vez de devolver um carrinho fantasma que não
 * atualiza nada.
 */
export const CartContext = createContext<CartContextValue | undefined>(undefined)
