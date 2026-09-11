/**
 * Catálogo das paletas de marca.
 *
 * Aqui há só identidade e rótulo — nenhum valor de cor. Os tons vivem em
 * `src/styles/themes/brands.css`, e o quadradinho do admin os lê pelo próprio
 * `data-brand`. Repetir os hexadecimais em TypeScript daria uma segunda fonte
 * da verdade que sairia de sincronia no primeiro ajuste de tom — e o seletor
 * passaria a mostrar uma cor que o site não usa.
 *
 * O ID é o que vai para o banco (`site_config.brand_color`, com `check`
 * espelhando esta lista) e para o atributo `data-brand` do `<html>`.
 */

export type BrandId =
  | 'ambar'
  | 'verde-claro'
  | 'verde-escuro'
  | 'azul-claro'
  | 'azul-escuro'
  | 'vermelho-claro'
  | 'vermelho-escuro'
  | 'laranja-claro'
  | 'laranja-escuro'
  | 'roxo-claro'
  | 'roxo-escuro'
  | 'rosa-claro'
  | 'rosa-escuro'

export type Brand = {
  id: BrandId
  label: string
  /** Marcada na interface como a escolha da casa. */
  recommended?: boolean
}

/** A cor original do projeto — e o padrão de qualquer instalação nova. */
export const DEFAULT_BRAND: BrandId = 'ambar'

/**
 * Ordem de exibição: a recomendada primeiro, depois os matizes em pares
 * claro/escuro. Ver as duas versões lado a lado é o que deixa a diferença
 * óbvia sem precisar de legenda.
 */
export const BRANDS: Brand[] = [
  { id: 'ambar', label: 'Âmbar', recommended: true },
  { id: 'verde-claro', label: 'Verde claro' },
  { id: 'verde-escuro', label: 'Verde escuro' },
  { id: 'azul-claro', label: 'Azul claro' },
  { id: 'azul-escuro', label: 'Azul escuro' },
  { id: 'vermelho-claro', label: 'Vermelho claro' },
  { id: 'vermelho-escuro', label: 'Vermelho escuro' },
  { id: 'laranja-claro', label: 'Laranja claro' },
  { id: 'laranja-escuro', label: 'Laranja escuro' },
  { id: 'roxo-claro', label: 'Roxo claro' },
  { id: 'roxo-escuro', label: 'Roxo escuro' },
  { id: 'rosa-claro', label: 'Rosa claro' },
  { id: 'rosa-escuro', label: 'Rosa escuro' },
]

export function isBrandId(value: unknown): value is BrandId {
  return BRANDS.some((brand) => brand.id === value)
}

export function brandLabel(id: BrandId): string {
  return BRANDS.find((brand) => brand.id === id)?.label ?? id
}
