import type { MenuItem } from '../menu/types'

/**
 * Linha do carrinho.
 *
 * Guarda uma cópia de nome/preço/foto em vez de só o `id` do item de propósito:
 * a tela de Pedido pode ser aberta direto pela URL (`/pedido`), antes — ou sem —
 * o cardápio ter sido carregado, e mesmo assim precisa se desenhar por inteiro.
 *
 * Contrapartida assumida: se o preço mudar no banco no meio da sessão, a linha
 * fica com o valor antigo. Aceitável aqui porque o pedido é confirmado pela
 * hamburgaria no WhatsApp antes de virar venda.
 */
export type CartLine = {
  id: string
  name: string
  priceCents: number
  photoUrl: string | null
  quantity: number
}

export type CartState = {
  lines: CartLine[]
}

export type CartAction =
  | { type: 'add'; item: MenuItem }
  | { type: 'increment'; id: string }
  | { type: 'decrement'; id: string }
  | { type: 'remove'; id: string }
  | { type: 'clear' }
