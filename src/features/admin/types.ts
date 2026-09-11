/**
 * Visão de admin de um item do cardápio: linha completa (`Tables<'menu_items'>`)
 * em camelCase, com `photoUrl` já resolvida. Diferente de `MenuItem` (visão
 * pública, enxuta): aqui entram `available` e `sortOrder`, que a UI pública
 * não usa mas o admin precisa editar.
 */
export type AdminMenuItem = {
  id: string
  category: string
  name: string
  description: string
  priceCents: number
  tag: string | null
  available: boolean
  featured: boolean
  bestseller: boolean
  photoUrl: string | null
  photoPath: string | null
  sortOrder: number
  ingredients: string[]
}

/** Shape do formulário de criar/editar item — preço em reais (string) para o `Input`. */
export type MenuItemFormValues = {
  name: string
  description: string
  priceReais: string
  category: string
  tag: string
  available: boolean
  featured: boolean
  bestseller: boolean
  sortOrder: string
  ingredients: string[]
}

export type CategoryOption = {
  slug: string
  label: string
}
