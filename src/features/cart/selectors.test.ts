import { describe, expect, it } from 'vitest'
import { isEmpty, itemQuantity, totalCents, totalQuantity } from './selectors'
import type { CartState } from './types'

const cart: CartState = {
  lines: [
    { id: 'a', name: 'Clássico Brasa', priceCents: 3400, photoUrl: null, quantity: 2 },
    { id: 'b', name: 'Limonada suíça', priceCents: 1200, photoUrl: null, quantity: 1 },
  ],
}

describe('seletores do carrinho', () => {
  it('soma a quantidade de todas as linhas', () => {
    expect(totalQuantity(cart)).toBe(3)
  })

  it('calcula o total multiplicando preço por quantidade', () => {
    expect(totalCents(cart)).toBe(3400 * 2 + 1200)
  })

  it('trabalha em centavos inteiros, sem erro de ponto flutuante', () => {
    const brokenCents: CartState = {
      lines: [
        { id: 'a', name: 'x', priceCents: 1010, photoUrl: null, quantity: 3 },
        { id: 'b', name: 'y', priceCents: 2020, photoUrl: null, quantity: 3 },
      ],
    }

    expect(totalCents(brokenCents)).toBe(9090)
    expect(Number.isInteger(totalCents(brokenCents))).toBe(true)
  })

  it('reconhece o carrinho vazio', () => {
    expect(isEmpty({ lines: [] })).toBe(true)
    expect(isEmpty(cart)).toBe(false)
  })

  it('devolve zero para item que não está no carrinho', () => {
    expect(itemQuantity(cart, 'a')).toBe(2)
    expect(itemQuantity(cart, 'inexistente')).toBe(0)
  })
})
