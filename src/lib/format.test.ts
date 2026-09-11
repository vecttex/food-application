import { describe, expect, it } from 'vitest'
import { formatItemCount, formatPrice } from './format'

describe('formatPrice', () => {
  it('converte centavos em real no formato brasileiro', () => {
    expect(formatPrice(3400)).toBe('R$ 34,00')
    expect(formatPrice(1250)).toBe('R$ 12,50')
  })

  it('formata valores altos com separador de milhar', () => {
    expect(formatPrice(123456)).toBe('R$ 1.234,56')
  })

  it('formata zero', () => {
    expect(formatPrice(0)).toBe('R$ 0,00')
  })
})

describe('formatItemCount', () => {
  it('usa singular para um item', () => {
    expect(formatItemCount(1)).toBe('1 item')
  })

  it('usa plural para os demais casos', () => {
    expect(formatItemCount(0)).toBe('0 itens')
    expect(formatItemCount(4)).toBe('4 itens')
  })
})
