import { useContext } from 'react'
import { CartContext, type CartContextValue } from './CartContext'

/**
 * Acesso ao carrinho. Falha alto quando usado fora do `CartProvider` —
 * é erro de montagem da árvore, e descobrir isso na primeira renderização é
 * muito mais barato do que investigar por que um botão "não faz nada".
 */
export function useCart(): CartContextValue {
  const context = useContext(CartContext)

  if (!context) {
    throw new Error('useCart precisa estar dentro de <CartProvider>.')
  }

  return context
}
