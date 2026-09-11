import { supabase } from '../../lib/supabase'
import { getPublicPhotoUrl } from '../../lib/storage'
import { centsToReaisInput, reaisInputToCents } from '../../lib/format'
import { adminSupabase } from './authService'
import type { Tables } from '../../lib/database.types'
import type { AdminMenuItem, CategoryOption, MenuItemFormValues } from './types'

type ItemRow = Tables<'menu_items'>

function toAdminMenuItem(row: ItemRow): AdminMenuItem {
  return {
    id: row.id,
    category: row.category,
    name: row.name,
    description: row.description,
    priceCents: row.price_cents,
    tag: row.tag,
    available: row.available,
    featured: row.featured,
    bestseller: row.bestseller,
    photoUrl: getPublicPhotoUrl(row.photo_url),
    photoPath: row.photo_url,
    sortOrder: row.sort_order,
    ingredients: row.ingredients ?? [],
  }
}

/**
 * A conversão reais↔centavos mora em `lib/format` — é usada também pela tela de
 * configurações (taxa de entrega, pedido mínimo). Reexportada aqui porque este
 * módulo é a porta de entrada do formulário de item.
 */
export { centsToReaisInput, reaisInputToCents }

export function toFormValues(item: AdminMenuItem): MenuItemFormValues {
  return {
    name: item.name,
    description: item.description,
    priceReais: centsToReaisInput(item.priceCents),
    category: item.category,
    tag: item.tag ?? '',
    available: item.available,
    featured: item.featured,
    bestseller: item.bestseller,
    sortOrder: String(item.sortOrder),
    ingredients: item.ingredients.length > 0 ? item.ingredients : [''],
  }
}

export function emptyFormValues(category = ''): MenuItemFormValues {
  return {
    name: '',
    description: '',
    priceReais: '0.00',
    category,
    tag: '',
    available: true,
    featured: false,
    bestseller: false,
    sortOrder: '0',
    ingredients: [''],
  }
}

/**
 * Converte o formulário no payload de escrita do banco. Função pura — é a
 * regra de conversão (reais↔centavos, ingredientes vazios descartados) e o
 * ponto mais fácil de quebrar sem perceber, por isso é o que os testes cobrem.
 */
export function buildMenuItemPayload(values: MenuItemFormValues) {
  return {
    category: values.category,
    name: values.name.trim(),
    description: values.description.trim(),
    price_cents: reaisInputToCents(values.priceReais),
    tag: values.tag.trim() || null,
    available: values.available,
    featured: values.featured,
    bestseller: values.bestseller,
    sort_order: Number.parseInt(values.sortOrder, 10) || 0,
    ingredients: values.ingredients.map((ingredient) => ingredient.trim()).filter(Boolean),
  }
}

/**
 * Lista todos os itens (inclusive indisponíveis) via client público — a policy
 * de select não filtra por `available`, só a query pública filtra. Evita
 * duplicar a leitura no client autenticado.
 */
export async function listAdminMenuItems(): Promise<AdminMenuItem[]> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .order('category', { ascending: true })
    .order('sort_order', { ascending: true })

  if (error) {
    throw new Error(`Não foi possível carregar os itens: ${error.message}`)
  }

  return (data ?? []).map(toAdminMenuItem)
}

export async function listCategories(): Promise<CategoryOption[]> {
  const { data, error } = await supabase
    .from('menu_categories')
    .select('slug, label')
    .order('sort_order', { ascending: true })

  if (error) {
    throw new Error(`Não foi possível carregar as categorias: ${error.message}`)
  }

  return data ?? []
}

export async function getAdminMenuItem(id: string): Promise<AdminMenuItem> {
  const { data, error } = await supabase.from('menu_items').select('*').eq('id', id).single()

  if (error) {
    throw new Error(`Não foi possível carregar o item: ${error.message}`)
  }

  return toAdminMenuItem(data)
}

/**
 * Cria (sem `id`) ou atualiza (com `id`) um item. Se houver `photoFile`, sobe
 * a nova foto e só depois apaga a anterior — assim uma falha no upload não
 * derruba a foto que já estava no ar.
 */
export async function saveMenuItem(
  id: string | null,
  values: MenuItemFormValues,
  photoFile: File | null,
  currentPhotoPath: string | null,
): Promise<void> {
  let photoPath = currentPhotoPath

  if (photoFile) {
    const extension = photoFile.name.split('.').pop() ?? 'jpg'
    const newPath = `items/${crypto.randomUUID()}.${extension}`

    const { error: uploadError } = await adminSupabase.storage.from('menu').upload(newPath, photoFile)
    if (uploadError) {
      throw new Error(`Não foi possível enviar a foto: ${uploadError.message}`)
    }

    if (currentPhotoPath) {
      await adminSupabase.storage.from('menu').remove([currentPhotoPath])
    }

    photoPath = newPath
  }

  const payload = { ...buildMenuItemPayload(values), photo_url: photoPath }

  if (id) {
    const { error } = await adminSupabase.from('menu_items').update(payload).eq('id', id)
    if (error) {
      throw new Error(`Não foi possível salvar o item: ${error.message}`)
    }
  } else {
    const { error } = await adminSupabase.from('menu_items').insert(payload)
    if (error) {
      throw new Error(`Não foi possível criar o item: ${error.message}`)
    }
  }
}

export async function deleteMenuItem(id: string, photoPath: string | null): Promise<void> {
  const { error } = await adminSupabase.from('menu_items').delete().eq('id', id)
  if (error) {
    throw new Error(`Não foi possível excluir o item: ${error.message}`)
  }

  if (photoPath) {
    await adminSupabase.storage.from('menu').remove([photoPath])
  }
}
