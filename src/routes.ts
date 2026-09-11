/**
 * Caminhos das rotas em um lugar só.
 *
 * Evita string literal espalhada por `<Link to>`, `navigate()` e testes — um
 * rename de URL passa a ser uma alteração de uma linha.
 */
export const ROUTES = {
  home: '/',
  menu: '/cardapio',
  order: '/pedido',
  admin: '/admin',
  adminLogin: '/admin/login',
  adminItems: '/admin/items',
  adminNewItem: '/admin/items/new',
  adminEditItem: '/admin/items/:id',
  adminSettings: '/admin/settings',
} as const

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES]

export function editItemPath(id: string): string {
  return `/admin/items/${id}`
}

/** Âncoras das seções da Home, usadas pela navegação do rodapé. */
export const HOME_SECTIONS = {
  highlights: 'destaques',
  bestsellers: 'mais-pedidos',
  reviews: 'avaliacoes',
  gallery: 'galeria',
  faq: 'faq',
  contact: 'contato',
} as const
