import type { CartAction, CartLine, CartState } from './types'
import type { MenuItem } from '../menu/types'

export const INITIAL_STATE: CartState = { lines: [] }

function newLine(item: MenuItem): CartLine {
  return {
    id: item.id,
    name: item.name,
    priceCents: item.priceCents,
    photoUrl: item.photoUrl,
    quantity: 1,
  }
}

function adjustQuantity(state: CartState, id: string, delta: number): CartState {
  const lines = state.lines
    .map((line) => (line.id === id ? { ...line, quantity: line.quantity + delta } : line))
    // Quantidade zero não é um estado válido de carrinho: a linha some.
    // Isso mantém o invariante "toda linha tem quantidade >= 1" e evita que
    // seletores e a mensagem do WhatsApp precisem filtrar zeros.
    .filter((line) => line.quantity > 0)

  return { lines }
}

/**
 * Reducer do carrinho — puro e sem dependência de React.
 *
 * Concentrar aqui as transições (em vez de espalhar `setState` pelas telas)
 * torna a regra testável isoladamente e garante o invariante acima em um
 * único lugar.
 */
export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'add': {
      const alreadyInCart = state.lines.some((line) => line.id === action.item.id)
      if (alreadyInCart) {
        return adjustQuantity(state, action.item.id, 1)
      }
      return { lines: [...state.lines, newLine(action.item)] }
    }

    case 'increment':
      return adjustQuantity(state, action.id, 1)

    case 'decrement':
      return adjustQuantity(state, action.id, -1)

    case 'remove':
      return { lines: state.lines.filter((line) => line.id !== action.id) }

    case 'clear':
      return INITIAL_STATE
  }
}
