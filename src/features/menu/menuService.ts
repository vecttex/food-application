import { supabase } from '../../lib/supabase'
import { getPublicPhotoUrl } from '../../lib/storage'
import type { Menu, MenuCategory, MenuItem } from './types'

/**
 * Linhas cruas devolvidas pelos selects. Tipadas com o subconjunto de colunas
 * realmente pedido (e não com `Tables<'menu_items'>`) para não dar a impressão
 * de que os campos ausentes estão disponíveis.
 */
type ItemRow = {
  id: string
  category: string
  name: string
  description: string
  price_cents: number
  ingredients: string[] | null
  photo_url: string | null
  tag: string | null
  featured: boolean
  bestseller: boolean
}

type CategoryRow = {
  slug: string
  label: string
}

const ITEM_COLUMNS =
  'id, category, name, description, price_cents, ingredients, photo_url, tag, featured, bestseller' as const

function toMenuItem(row: ItemRow): MenuItem {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    priceCents: row.price_cents,
    ingredients: row.ingredients ?? [],
    photoUrl: getPublicPhotoUrl(row.photo_url),
    tag: row.tag,
    featured: row.featured,
    bestseller: row.bestseller,
  }
}

/**
 * Agrupa os itens sob suas categorias, preservando a ordem em que cada lista
 * chegou do banco (`sort_order` ascendente). Categorias sem item disponível
 * são descartadas — aba vazia é ruído para quem está pedindo.
 *
 * Função pura e exportada: é a regra de montagem do cardápio e o ponto que
 * mais vale testar deste módulo.
 */
export function buildMenu(categories: CategoryRow[], items: ItemRow[]): Menu {
  const itemsByCategory = new Map<string, MenuItem[]>()

  for (const row of items) {
    const list = itemsByCategory.get(row.category)
    if (list) {
      list.push(toMenuItem(row))
    } else {
      itemsByCategory.set(row.category, [toMenuItem(row)])
    }
  }

  const result: MenuCategory[] = []
  for (const category of categories) {
    const categoryItems = itemsByCategory.get(category.slug)
    if (categoryItems && categoryItems.length > 0) {
      result.push({ slug: category.slug, label: category.label, items: categoryItems })
    }
  }

  return { categories: result }
}

/** Todos os itens do cardápio em uma lista só, na ordem em que aparecem. */
export function allItems(menu: Menu): MenuItem[] {
  return menu.categories.flatMap((category) => category.items)
}

/**
 * Itens de uma vitrine da Home (destaques ou mais pedidos).
 *
 * Quando nada está marcado, cai nos primeiros itens do cardápio em vez de
 * devolver lista vazia: uma seção ligada no admin não pode aparecer oca porque
 * ninguém marcou item nenhum ainda. Quem decide se a seção existe é a flag em
 * `site_config`; quem decide o conteúdo é a marcação, com esse fallback.
 */
export function showcaseItems(
  menu: Menu,
  field: 'featured' | 'bestseller',
  limit = 6,
): MenuItem[] {
  const items = allItems(menu)
  const marked = items.filter((item) => item[field])
  return (marked.length > 0 ? marked : items).slice(0, limit)
}

/**
 * Busca o cardápio completo.
 *
 * Duas queries em paralelo em vez de um select aninhado do PostgREST: mesmo
 * tempo de parede (`Promise.all`), semântica previsível e a montagem vira uma
 * função pura testável sem tocar na rede.
 */
export async function fetchMenu(): Promise<Menu> {
  const [categoriesResponse, itemsResponse] = await Promise.all([
    supabase.from('menu_categories').select('slug, label').order('sort_order', { ascending: true }),
    supabase
      .from('menu_items')
      .select(ITEM_COLUMNS)
      .eq('available', true)
      .order('sort_order', { ascending: true }),
  ])

  const error = categoriesResponse.error ?? itemsResponse.error
  if (error) {
    throw new Error(`Não foi possível carregar o cardápio: ${error.message}`)
  }

  return buildMenu(categoriesResponse.data ?? [], itemsResponse.data ?? [])
}
