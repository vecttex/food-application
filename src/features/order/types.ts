export type DeliveryAddress = {
  street: string
  neighborhood: string
  complement: string
  reference: string
}

export const EMPTY_ADDRESS: DeliveryAddress = {
  street: '',
  neighborhood: '',
  complement: '',
  reference: '',
}

export type AddressField = keyof DeliveryAddress
