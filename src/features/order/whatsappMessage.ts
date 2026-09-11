import { formatPrice } from '../../lib/format'
import type { CartLine } from '../cart/types'
import type { SiteConfig } from '../site/types'
import type { DeliveryAddress } from './types'

type OrderData = {
  lines: CartLine[]
  totalCents: number
  address: DeliveryAddress
  /** Nome, WhatsApp e tempo de entrega vêm da configuração do admin. */
  site: SiteConfig
}

function itemLine(line: CartLine): string {
  const subtotal = formatPrice(line.priceCents * line.quantity)
  return `• ${line.quantity}x ${line.name} — ${subtotal}`
}

/**
 * Só entram no texto os campos que a pessoa preencheu. Um "Complemento:" vazio
 * na conversa é ruído para quem atende no balcão.
 */
function addressBlock(address: DeliveryAddress): string[] {
  const parts: string[] = []

  if (address.street.trim()) parts.push(address.street.trim())
  if (address.neighborhood.trim()) parts.push(`Bairro: ${address.neighborhood.trim()}`)
  if (address.complement.trim()) parts.push(`Complemento: ${address.complement.trim()}`)
  if (address.reference.trim()) parts.push(`Referência: ${address.reference.trim()}`)

  if (parts.length === 0) return []

  return ['', '*Entrega*', ...parts]
}

/** Taxa e mínimo só entram quando estão configurados — zero não é informação. */
function feeBlock(site: SiteConfig): string[] {
  const { deliveryFeeCents } = site.operation
  if (deliveryFeeCents <= 0) return []
  return ['', `Taxa de entrega: ${formatPrice(deliveryFeeCents)}`]
}

/**
 * Monta o texto do pedido em Markdown do WhatsApp (`*negrito*`).
 *
 * Função pura, separada do link: é a regra de negócio da saída do pedido e o
 * ponto mais fácil de quebrar sem perceber — por isso é o que os testes cobrem.
 */
export function buildOrderMessage({ lines, totalCents, address, site }: OrderData): string {
  const header = [`*Novo pedido — ${site.identity.name}*`, '', '*Itens*']
  const items = lines.map(itemLine)
  const total = ['', `*Total: ${formatPrice(totalCents)}*`]
  const deliveryTime = site.operation.deliveryTime.trim()
  const footer = deliveryTime ? ['', `Tempo estimado de entrega: ${deliveryTime}`] : []

  return [
    ...header,
    ...items,
    ...total,
    ...feeBlock(site),
    ...addressBlock(address),
    ...footer,
  ].join('\n')
}

/**
 * Link wa.me com a mensagem já embutida. `encodeURIComponent` é obrigatório:
 * a mensagem tem quebras de linha, acentos e `&`.
 */
export function buildOrderLink(data: OrderData): string {
  const text = encodeURIComponent(buildOrderMessage(data))
  return `https://wa.me/${data.site.contact.whatsappNumber}?text=${text}`
}

/** Link para conversa sem pedido — usado nos botões institucionais. */
export function buildContactLink(site: SiteConfig): string {
  return `https://wa.me/${site.contact.whatsappNumber}`
}
