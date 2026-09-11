import { describe, expect, it, vi } from 'vitest'
import { testSiteConfig } from '../site/testSiteConfig'

// O módulo abre dois clients do Supabase no import; ambos viram duplos para o
// teste alcançar a função pura de payload sem credencial nenhuma.
vi.mock('../../lib/supabase', () => ({ supabase: {} }))
vi.mock('./authService', () => ({ adminSupabase: {} }))
vi.mock('../../lib/storage', () => ({
  getPublicPhotoUrl: (path: string | null) => path,
}))

const { buildSiteConfigPayload } = await import('./siteConfigService')

describe('buildSiteConfigPayload', () => {
  it('achata a configuração agrupada no formato da tabela', () => {
    const payload = buildSiteConfigPayload(testSiteConfig())

    expect(payload.restaurant_name).toBe('Brasa Nove')
    expect(payload.show_highlights).toBe(true)
    expect(payload.default_theme).toBe('system')
  })

  it('leva a paleta de marca escolhida', () => {
    const base = testSiteConfig()
    const payload = buildSiteConfigPayload({
      ...base,
      appearance: { ...base.appearance, brandColor: 'roxo-escuro' },
    })

    expect(payload.brand_color).toBe('roxo-escuro')
  })

  it('guarda só os dígitos do WhatsApp — wa.me rejeita máscara', () => {
    const payload = buildSiteConfigPayload(
      testSiteConfig({
        contact: {
          ...testSiteConfig().contact,
          whatsappNumber: '+55 (62) 99887-4090',
        },
      }),
    )

    expect(payload.whatsapp_number).toBe('5562998874090')
  })

  it('remove espaços nas pontas dos textos', () => {
    const payload = buildSiteConfigPayload(
      testSiteConfig({ identity: { ...testSiteConfig().identity, name: '  Brasa Nove  ' } }),
    )

    expect(payload.restaurant_name).toBe('Brasa Nove')
  })

  it('converte link e aviso em branco para null, em vez de string vazia', () => {
    const base = testSiteConfig()
    const payload = buildSiteConfigPayload({
      ...base,
      contact: { ...base.contact, instagramUrl: '   ', mapsUrl: '' },
      operation: { ...base.operation, notice: '  ' },
    })

    expect(payload.instagram_url).toBeNull()
    expect(payload.maps_url).toBeNull()
    expect(payload.notice).toBeNull()
  })

  it('descarta forma de pagamento vazia', () => {
    const base = testSiteConfig()
    const payload = buildSiteConfigPayload({
      ...base,
      operation: { ...base.operation, paymentMethods: ['Pix', '  ', '', ' Crédito '] },
    })

    expect(payload.payment_methods).toEqual(['Pix', 'Crédito'])
  })
})
