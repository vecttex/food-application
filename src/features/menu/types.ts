/**
 * Modelo de domínio do cardápio.
 *
 * Deliberadamente diferente da linha do banco (`Tables<'menu_items'>`): camelCase,
 * `photoUrl` já resolvida para URL pública e sem colunas que a UI não usa
 * (`created_at`, `available`, `sort_order`). O mapeamento acontece no service — é
 * o que permite mudar coluna no Postgres sem tocar em nenhum componente.
 */
export type MenuItem = {
  id: string
  name: string
  description: string
  priceCents: number
  ingredients: string[]
  photoUrl: string | null
  tag: string | null
  /** Aparece na vitrine de destaques da Home. */
  featured: boolean
  /** Aparece na vitrine de "mais pedidos" da Home. */
  bestseller: boolean
}

export type MenuCategory = {
  slug: string
  label: string
  items: MenuItem[]
}

export type Menu = {
  categories: MenuCategory[]
}
