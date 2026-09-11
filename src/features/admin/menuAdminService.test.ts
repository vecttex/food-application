import { describe, expect, it } from 'vitest'
import {
  buildMenuItemPayload,
  centsToReaisInput,
  emptyFormValues,
  reaisInputToCents,
  toFormValues,
} from './menuAdminService'
import type { AdminMenuItem, MenuItemFormValues } from './types'

function formValues(overrides: Partial<MenuItemFormValues> = {}): MenuItemFormValues {
  return {
    name: 'Clássico Brasa',
    description: 'Blend de 180 g.',
    priceReais: '34.00',
    category: 'lanche',
    tag: '',
    available: true,
    featured: false,
    bestseller: false,
    sortOrder: '1',
    ingredients: ['Pão brioche', 'Blend de 180 g'],
    ...overrides,
  }
}

describe('centsToReaisInput / reaisInputToCents', () => {
  it('converte centavos para string decimal e volta', () => {
    expect(centsToReaisInput(3400)).toBe('34.00')
    expect(reaisInputToCents('34.00')).toBe(3400)
  })

  it('arredonda para o centavo mais próximo', () => {
    expect(reaisInputToCents('12.345')).toBe(1235)
  })

  it('trata entrada inválida como zero', () => {
    expect(reaisInputToCents('')).toBe(0)
    expect(reaisInputToCents('abc')).toBe(0)
  })
})

describe('buildMenuItemPayload', () => {
  it('converte o preço de reais para centavos', () => {
    expect(buildMenuItemPayload(formValues({ priceReais: '12.50' })).price_cents).toBe(1250)
  })

  it('filtra ingredientes vazios ou só com espaços', () => {
    const payload = buildMenuItemPayload(
      formValues({ ingredients: ['Pão brioche', '  ', '', 'Cheddar'] }),
    )

    expect(payload.ingredients).toEqual(['Pão brioche', 'Cheddar'])
  })

  it('converte tag em branco para null', () => {
    expect(buildMenuItemPayload(formValues({ tag: '   ' })).tag).toBeNull()
  })

  it('mantém a tag preenchida, sem espaços nas pontas', () => {
    expect(buildMenuItemPayload(formValues({ tag: ' veggie ' })).tag).toBe('veggie')
  })

  it('usa zero quando a ordem não é um número válido', () => {
    expect(buildMenuItemPayload(formValues({ sortOrder: '' })).sort_order).toBe(0)
  })
})

describe('toFormValues', () => {
  const item: AdminMenuItem = {
    id: 'i1',
    category: 'lanche',
    name: 'Clássico Brasa',
    description: 'Blend de 180 g.',
    priceCents: 3400,
    tag: 'veggie',
    available: true,
    featured: true,
    bestseller: false,
    photoUrl: 'https://cdn.teste/lanches/classico.jpg',
    photoPath: 'lanches/classico.jpg',
    sortOrder: 2,
    ingredients: ['Pão brioche'],
  }

  it('converte a linha do admin no shape do formulário', () => {
    expect(toFormValues(item)).toEqual({
      name: 'Clássico Brasa',
      description: 'Blend de 180 g.',
      priceReais: '34.00',
      category: 'lanche',
      tag: 'veggie',
      available: true,
      featured: true,
      bestseller: false,
      sortOrder: '2',
      ingredients: ['Pão brioche'],
    })
  })

  it('garante ao menos um campo de ingrediente para a lista dinâmica', () => {
    expect(toFormValues({ ...item, ingredients: [] }).ingredients).toEqual([''])
  })
})

describe('emptyFormValues', () => {
  it('começa disponível, com preço zero e um campo de ingrediente', () => {
    expect(emptyFormValues()).toEqual({
      name: '',
      description: '',
      priceReais: '0.00',
      category: '',
      tag: '',
      available: true,
      featured: false,
      bestseller: false,
      sortOrder: '0',
      ingredients: [''],
    })
  })

  it('aceita uma categoria pré-selecionada', () => {
    expect(emptyFormValues('bebida').category).toBe('bebida')
  })
})
