import type { CartState } from './types'

/**
 * Leituras derivadas do carrinho.
 *
 * Ficam fora do estado (e não como campos calculados no reducer) porque são
 * função pura do que já está guardado — duplicá-las no estado criaria a chance
 * de total e linhas discordarem.
 */

export function totalQuantity(state: CartState): number {
  return state.lines.reduce((sum, line) => sum + line.quantity, 0)
}

export function totalCents(state: CartState): number {
  return state.lines.reduce((sum, line) => sum + line.priceCents * line.quantity, 0)
}

export function isEmpty(state: CartState): boolean {
  return state.lines.length === 0
}

export function itemQuantity(state: CartState, id: string): number {
  return state.lines.find((line) => line.id === id)?.quantity ?? 0
}
