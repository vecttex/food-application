import { describe, expect, it } from 'vitest'
import { buildContactLink, buildOrderLink, buildOrderMessage } from './whatsappMessage'
import { EMPTY_ADDRESS, type DeliveryAddress } from './types'
import { testSiteConfig } from '../site/testSiteConfig'
import type { CartLine } from '../cart/types'

const site = testSiteConfig()

const lines: CartLine[] = [
  { id: 'a', name: 'Clássico Brasa', priceCents: 3400, photoUrl: null, quantity: 2 },
  { id: 'b', name: 'Limonada suíça', priceCents: 1200, photoUrl: null, quantity: 1 },
]

const address: DeliveryAddress = {
  street: 'Rua das Palmeiras, 120',
  neighborhood: 'Setor Bueno',
  complement: 'Apto 302',
  reference: 'Em frente à praça',
}

const totalCents = 3400 * 2 + 1200

describe('buildOrderMessage', () => {
  it('lista cada item com quantidade e subtotal', () => {
    const message = buildOrderMessage({ lines, totalCents, address, site })

    expect(message).toContain('• 2x Clássico Brasa — R$ 68,00')
    expect(message).toContain('• 1x Limonada suíça — R$ 12,00')
  })

  it('inclui o total formatado em reais', () => {
    const message = buildOrderMessage({ lines, totalCents, address, site })

    expect(message).toContain('*Total: R$ 80,00*')
  })

  it('usa o nome do restaurante vindo da configuração', () => {
    const message = buildOrderMessage({
      lines,
      totalCents,
      address,
      site: testSiteConfig({ identity: { ...site.identity, name: 'Outro Nome' } }),
    })

    expect(message).toContain('*Novo pedido — Outro Nome*')
  })

  it('inclui os campos de endereço preenchidos', () => {
    const message = buildOrderMessage({ lines, totalCents, address, site })

    expect(message).toContain('*Entrega*')
    expect(message).toContain('Rua das Palmeiras, 120')
    expect(message).toContain('Bairro: Setor Bueno')
    expect(message).toContain('Complemento: Apto 302')
    expect(message).toContain('Referência: Em frente à praça')
  })

  it('omite campos vazios em vez de mandar rótulo sem valor', () => {
    const message = buildOrderMessage({
      lines,
      totalCents,
      address: { ...EMPTY_ADDRESS, street: 'Rua das Palmeiras, 120' },
      site,
    })

    expect(message).toContain('Rua das Palmeiras, 120')
    expect(message).not.toContain('Bairro:')
    expect(message).not.toContain('Complemento:')
    expect(message).not.toContain('Referência:')
  })

  it('trata campo só com espaços como vazio', () => {
    const message = buildOrderMessage({
      lines,
      totalCents,
      address: { ...EMPTY_ADDRESS, neighborhood: '   ' },
      site,
    })

    expect(message).not.toContain('*Entrega*')
  })

  it('omite o bloco de entrega inteiro quando nada foi preenchido', () => {
    const message = buildOrderMessage({ lines, totalCents, address: EMPTY_ADDRESS, site })

    expect(message).not.toContain('*Entrega*')
    expect(message).toContain('*Itens*')
  })

  it('informa o tempo estimado de entrega', () => {
    const message = buildOrderMessage({ lines, totalCents, address, site })

    expect(message).toContain('Tempo estimado de entrega: 35–50 min')
  })

  it('omite o tempo de entrega quando ele não está configurado', () => {
    const message = buildOrderMessage({
      lines,
      totalCents,
      address,
      site: testSiteConfig({ operation: { ...site.operation, deliveryTime: '' } }),
    })

    expect(message).not.toContain('Tempo estimado')
  })

  it('só menciona a taxa de entrega quando existe uma cobrada', () => {
    const semTaxa = buildOrderMessage({ lines, totalCents, address, site })
    expect(semTaxa).not.toContain('Taxa de entrega')

    const comTaxa = buildOrderMessage({
      lines,
      totalCents,
      address,
      site: testSiteConfig({ operation: { ...site.operation, deliveryFeeCents: 700 } }),
    })
    expect(comTaxa).toContain('Taxa de entrega: R$ 7,00')
  })
})

describe('buildOrderLink', () => {
  it('aponta para o número do restaurante em formato internacional', () => {
    const link = buildOrderLink({ lines, totalCents, address, site })

    expect(link.startsWith('https://wa.me/5562998874090?text=')).toBe(true)
  })

  it('codifica quebras de linha e acentos, senão a mensagem chega truncada', () => {
    const link = buildOrderLink({ lines, totalCents, address, site })

    expect(link).not.toContain('\n')
    expect(link).toContain('%0A')

    const decodedText = decodeURIComponent(link.split('?text=')[1])
    expect(decodedText).toBe(buildOrderMessage({ lines, totalCents, address, site }))
  })
})

describe('buildContactLink', () => {
  it('abre a conversa sem mensagem pré-preenchida', () => {
    expect(buildContactLink(site)).toBe('https://wa.me/5562998874090')
  })
})
