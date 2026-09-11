import { describe, expect, it } from 'vitest'
import { BRANDS, DEFAULT_BRAND, brandLabel, isBrandId } from './brands'

describe('catálogo de marcas', () => {
  it('não tem ID repetido — o ID é a chave no banco e no atributo do <html>', () => {
    const ids = BRANDS.map((brand) => brand.id)

    expect(new Set(ids).size).toBe(ids.length)
  })

  it('tem exatamente uma opção recomendada, e é a cor original da casa', () => {
    const recomendadas = BRANDS.filter((brand) => brand.recommended)

    expect(recomendadas).toHaveLength(1)
    expect(recomendadas[0].id).toBe(DEFAULT_BRAND)
  })

  it('traz o padrão em primeiro lugar na lista', () => {
    expect(BRANDS[0].id).toBe(DEFAULT_BRAND)
  })

  it('dá rótulo legível a toda opção', () => {
    for (const brand of BRANDS) {
      expect(brand.label.trim().length).toBeGreaterThan(0)
    }
  })

  it('oferece as seis cores pedidas em versão clara e escura', () => {
    for (const cor of ['verde', 'azul', 'vermelho', 'laranja', 'roxo', 'rosa']) {
      expect(isBrandId(`${cor}-claro`)).toBe(true)
      expect(isBrandId(`${cor}-escuro`)).toBe(true)
    }
  })
})

describe('isBrandId', () => {
  it('aceita um ID do catálogo', () => {
    expect(isBrandId('verde-escuro')).toBe(true)
  })

  it('recusa qualquer coisa fora dele', () => {
    // A coluna do banco é `text`; esta é a borda que protege o resto do app.
    expect(isBrandId('turquesa')).toBe(false)
    expect(isBrandId('')).toBe(false)
    expect(isBrandId(null)).toBe(false)
    expect(isBrandId(42)).toBe(false)
  })
})

describe('brandLabel', () => {
  it('devolve o rótulo do catálogo', () => {
    expect(brandLabel('rosa-claro')).toBe('Rosa claro')
  })
})
