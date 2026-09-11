import { createContext } from 'react'
import type { AddressField, DeliveryAddress } from './types'

export type AddressContextValue = {
  address: DeliveryAddress
  updateField: (field: AddressField, value: string) => void
  clear: () => void
}

/**
 * Contexto separado do carrinho de propósito: são dois assuntos com razões de
 * mudança diferentes (itens do pedido × dados de entrega). Juntá-los faria
 * qualquer digitação no endereço re-renderizar tudo que só observa o carrinho.
 */
export const AddressContext = createContext<AddressContextValue | undefined>(undefined)
