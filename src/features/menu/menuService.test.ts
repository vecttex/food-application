import { describe, expect, it, vi } from 'vitest'

// O mapeamento de foto é responsabilidade da camada de storage; aqui só
// interessa que o service delegue para ela. Um duplo simples deixa o teste
// independente de credencial e de rede.
vi.mock('../../lib/storage', () => ({
  getPublicPhotoUrl: (path: string | null) => (path ? `https://cdn.teste/${path}` : null),
}))

const { buildMenu, allItems, showcaseItems } = await import('./menuService')

function item(overrides: Record<string, unknown> = {}) {
  return {
    id: 'i1',
    category: 'lanche',
    name: 'Clássico Brasa',
    description: 'Blend de 180 g.',
    price_cents: 3400,
    ingredients: ['Pão brioche'],
    photo_url: null,
    tag: null,
    featured: false,
    bestseller: false,
    ...overrides,
  }
}

const categories = [
  { slug: 'lanche', label: 'Lanches' },
  { slug: 'combo', label: 'Combos' },
  { slug: 'bebida', label: 'Bebidas' },
]

describe('buildMenu', () => {
  it('agrupa os itens sob a categoria correspondente', () => {
    const menu = buildMenu(categories, [
      item({ id: 'i1', category: 'lanche' }),
      item({ id: 'i2', category: 'bebida' }),
      item({ id: 'i3', category: 'lanche' }),
    ])

    expect(menu.categories.map((c) => c.slug)).toEqual(['lanche', 'bebida'])
    expect(menu.categories[0].items.map((i) => i.id)).toEqual(['i1', 'i3'])
  })

  it('respeita a ordem das categorias devolvida pelo banco', () => {
    const menu = buildMenu(categories, [
      item({ id: 'i1', category: 'bebida' }),
      item({ id: 'i2', category: 'lanche' }),
    ])

    expect(menu.categories.map((c) => c.label)).toEqual(['Lanches', 'Bebidas'])
  })

  it('preserva a ordem dos itens dentro da categoria', () => {
    const menu = buildMenu(categories, [item({ id: 'segundo' }), item({ id: 'primeiro' })])

    expect(menu.categories[0].items.map((i) => i.id)).toEqual(['segundo', 'primeiro'])
  })

  it('descarta categoria sem nenhum item disponível', () => {
    const menu = buildMenu(categories, [item({ category: 'lanche' })])

    expect(menu.categories.map((c) => c.slug)).toEqual(['lanche'])
  })

  it('converte a linha do banco no modelo de domínio', () => {
    const menu = buildMenu(categories, [
      item({ photo_url: 'lanches/classico.jpg', tag: 'veggie', price_cents: 3200 }),
    ])

    expect(menu.categories[0].items[0]).toEqual({
      id: 'i1',
      name: 'Clássico Brasa',
      description: 'Blend de 180 g.',
      priceCents: 3200,
      ingredients: ['Pão brioche'],
      photoUrl: 'https://cdn.teste/lanches/classico.jpg',
      tag: 'veggie',
      featured: false,
      bestseller: false,
    })
  })

  it('trata ingredientes nulos como lista vazia, para a UI não precisar checar', () => {
    const menu = buildMenu(categories, [item({ ingredients: null })])

    expect(menu.categories[0].items[0].ingredients).toEqual([])
  })

  it('ignora item cuja categoria não existe mais na tabela de categorias', () => {
    const menu = buildMenu(categories, [item({ category: 'sobremesa' })])

    expect(menu.categories).toEqual([])
  })
})

describe('allItems', () => {
  it('achata as categorias preservando a ordem de exibição', () => {
    const menu = buildMenu(categories, [
      item({ id: 'i1', category: 'bebida' }),
      item({ id: 'i2', category: 'lanche' }),
      item({ id: 'i3', category: 'bebida' }),
    ])

    expect(allItems(menu).map((i) => i.id)).toEqual(['i2', 'i1', 'i3'])
  })
})

describe('showcaseItems', () => {
  it('devolve apenas os itens marcados quando existe marcação', () => {
    const menu = buildMenu(categories, [
      item({ id: 'i1' }),
      item({ id: 'i2', featured: true }),
      item({ id: 'i3', featured: true }),
    ])

    expect(showcaseItems(menu, 'featured').map((i) => i.id)).toEqual(['i2', 'i3'])
  })

  it('separa destaque de mais pedido', () => {
    const menu = buildMenu(categories, [
      item({ id: 'i1', featured: true }),
      item({ id: 'i2', bestseller: true }),
    ])

    expect(showcaseItems(menu, 'bestseller').map((i) => i.id)).toEqual(['i2'])
  })

  it('cai nos primeiros itens do cardápio quando nada está marcado, para a seção não ficar oca', () => {
    const menu = buildMenu(categories, [item({ id: 'i1' }), item({ id: 'i2' })])

    expect(showcaseItems(menu, 'featured').map((i) => i.id)).toEqual(['i1', 'i2'])
  })

  it('respeita o limite pedido', () => {
    const menu = buildMenu(
      categories,
      [1, 2, 3, 4].map((n) => item({ id: `i${n}`, featured: true })),
    )

    expect(showcaseItems(menu, 'featured', 2)).toHaveLength(2)
  })

  it('devolve lista vazia para cardápio vazio, em vez de quebrar', () => {
    expect(showcaseItems(buildMenu(categories, []), 'featured')).toEqual([])
  })
})
