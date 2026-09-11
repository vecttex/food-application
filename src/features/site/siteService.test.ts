import { describe, expect, it, vi } from 'vitest'

// O service só é interessante pelo mapeamento; rede e storage entram como
// duplos para o teste não precisar de credencial nem de conexão.
vi.mock('../../lib/storage', () => ({
  getPublicPhotoUrl: (path: string | null) => (path ? `https://cdn.teste/${path}` : null),
}))
vi.mock('../../lib/supabase', () => ({ supabase: {} }))

const { toSiteConfig } = await import('./siteService')

type Linha = Parameters<typeof toSiteConfig>[0]

function linha(overrides: Partial<Linha> = {}): Linha {
  return {
    id: true,
    updated_at: '2026-08-24T00:00:00Z',
    restaurant_name: 'Brasa Nove',
    tagline: 'Grelhados na brasa',
    description: 'Lanches de blend próprio.',
    cover_photo_url: 'cover/site.jpg',
    logo_url: null,
    address_street: 'Rua das Brasas, 90',
    address_city: 'Goiânia, GO',
    phone: '(62) 3222-4090',
    whatsapp_display: '(62) 99887-4090',
    whatsapp_number: '5562998874090',
    instagram_url: null,
    maps_url: null,
    timezone: 'America/Sao_Paulo',
    delivery_time: '35–50 min',
    delivery_fee_cents: 700,
    min_order_cents: 3000,
    payment_methods: ['Pix', 'Crédito'],
    accepts_orders: true,
    notice: null,
    default_theme: 'system',
    allow_theme_toggle: true,
    brand_color: 'ambar',
    show_status: true,
    show_highlights: true,
    show_bestsellers: false,
    show_info_cards: true,
    show_hours: true,
    show_reviews: true,
    show_gallery: false,
    show_faq: true,
    show_contact: true,
    show_menu_search: true,
    ...overrides,
  }
}

describe('toSiteConfig', () => {
  it('agrupa a linha plana por assunto', () => {
    const config = toSiteConfig(linha())

    expect(config.identity.name).toBe('Brasa Nove')
    expect(config.contact.phone).toBe('(62) 3222-4090')
    expect(config.operation.deliveryFeeCents).toBe(700)
    expect(config.appearance.allowThemeToggle).toBe(true)
  })

  it('resolve o path da foto para URL pública', () => {
    expect(toSiteConfig(linha()).identity.coverPhotoUrl).toBe('https://cdn.teste/cover/site.jpg')
    expect(toSiteConfig(linha()).identity.logoUrl).toBeNull()
  })

  it('copia cada flag de seção para o grupo `sections`', () => {
    const { sections } = toSiteConfig(linha())

    expect(sections.highlights).toBe(true)
    expect(sections.bestsellers).toBe(false)
    expect(sections.gallery).toBe(false)
  })

  it('cai em "system" quando o tema salvo não é um valor conhecido', () => {
    // A coluna é `text` no Postgres; a garantia de valor válido é desta borda.
    expect(toSiteConfig(linha({ default_theme: 'neon' })).appearance.defaultTheme).toBe('system')
  })

  it('mantém um tema válido salvo no banco', () => {
    expect(toSiteConfig(linha({ default_theme: 'dark' })).appearance.defaultTheme).toBe('dark')
  })

  it('mantém a paleta de marca salva no banco', () => {
    expect(toSiteConfig(linha({ brand_color: 'azul-escuro' })).appearance.brandColor).toBe(
      'azul-escuro',
    )
  })

  it('cai no âmbar quando a paleta salva não existe mais', () => {
    // Cenário real: uma paleta é removida do catálogo e sobra a linha antiga
    // no banco. Melhor a cor da casa do que a tela sem cor nenhuma.
    expect(toSiteConfig(linha({ brand_color: 'turquesa' })).appearance.brandColor).toBe('ambar')
  })

  it('trata aviso em branco como ausência de aviso', () => {
    expect(toSiteConfig(linha({ notice: '   ' })).operation.notice).toBeNull()
    expect(toSiteConfig(linha({ notice: 'Feriado' })).operation.notice).toBe('Feriado')
  })

  it('usa o nome padrão se a coluna estiver vazia, para o site nunca ficar sem título', () => {
    expect(toSiteConfig(linha({ restaurant_name: '' })).identity.name).toBe('Brasa Nove')
  })
})
