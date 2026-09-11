import { describe, expect, it } from 'vitest'
import { INITIAL_STATE, cartReducer } from './cartReducer'
import type { CartState } from './types'
import type { MenuItem } from '../menu/types'

function testItem(overrides: Partial<MenuItem> = {}): MenuItem {
  return {
    id: 'item-1',
    name: 'Clássico Brasa',
    description: 'Blend de 180 g, cheddar e cebola caramelizada.',
    priceCents: 3400,
    ingredients: ['Pão brioche', 'Blend de 180 g'],
    photoUrl: null,
    tag: null,
    featured: false,
    bestseller: false,
    ...overrides,
  }
}

function withLines(...lines: { id: string; quantity: number }[]): CartState {
  return {
    lines: lines.map(({ id, quantity }) => ({
      id,
      name: `Item ${id}`,
      priceCents: 1000,
      photoUrl: null,
      quantity,
    })),
  }
}

describe('cartReducer', () => {
  it('adiciona um item novo com quantidade 1', () => {
    const state = cartReducer(INITIAL_STATE, { type: 'add', item: testItem() })

    expect(state.lines).toHaveLength(1)
    expect(state.lines[0]).toMatchObject({ id: 'item-1', name: 'Clássico Brasa', quantity: 1 })
  })

  it('copia preço e foto do item para a linha, para o pedido não depender do cardápio carregado', () => {
    const item = testItem({ priceCents: 4200, photoUrl: 'https://cdn/foto.jpg' })
    const state = cartReducer(INITIAL_STATE, { type: 'add', item })

    expect(state.lines[0]).toMatchObject({ priceCents: 4200, photoUrl: 'https://cdn/foto.jpg' })
  })

  it('somar o mesmo item de novo aumenta a quantidade em vez de duplicar a linha', () => {
    const item = testItem()
    const first = cartReducer(INITIAL_STATE, { type: 'add', item })
    const second = cartReducer(first, { type: 'add', item })

    expect(second.lines).toHaveLength(1)
    expect(second.lines[0].quantity).toBe(2)
  })

  it('incrementa a quantidade da linha indicada sem tocar nas outras', () => {
    const state = cartReducer(withLines({ id: 'a', quantity: 1 }, { id: 'b', quantity: 3 }), {
      type: 'increment',
      id: 'a',
    })

    expect(state.lines.map((line) => line.quantity)).toEqual([2, 3])
  })

  it('decrementa a quantidade quando ainda sobra item', () => {
    const state = cartReducer(withLines({ id: 'a', quantity: 2 }), {
      type: 'decrement',
      id: 'a',
    })

    expect(state.lines[0].quantity).toBe(1)
  })

  it('remove a linha ao decrementar a última unidade — quantidade zero não é estado válido', () => {
    const state = cartReducer(withLines({ id: 'a', quantity: 1 }, { id: 'b', quantity: 2 }), {
      type: 'decrement',
      id: 'a',
    })

    expect(state.lines.map((line) => line.id)).toEqual(['b'])
  })

  it('remove a linha inteira independentemente da quantidade', () => {
    const state = cartReducer(withLines({ id: 'a', quantity: 5 }), {
      type: 'remove',
      id: 'a',
    })

    expect(state.lines).toEqual([])
  })

  it('ignora ações sobre um id que não está no carrinho', () => {
    const initial = withLines({ id: 'a', quantity: 1 })
    const state = cartReducer(initial, { type: 'increment', id: 'inexistente' })

    expect(state.lines).toEqual(initial.lines)
  })

  it('limpar zera o carrinho', () => {
    const state = cartReducer(withLines({ id: 'a', quantity: 3 }), { type: 'clear' })

    expect(state).toEqual(INITIAL_STATE)
  })

  it('não muta o estado recebido', () => {
    const initial = withLines({ id: 'a', quantity: 1 })
    const copy = structuredClone(initial)

    cartReducer(initial, { type: 'increment', id: 'a' })

    expect(initial).toEqual(copy)
  })
})
