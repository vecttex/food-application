import { supabase } from '../../lib/supabase'
import { adminSupabase } from './authService'
import {
  toFaqItem,
  toGalleryPhoto,
  toOpeningHour,
  toSiteConfig,
  toTestimonial,
} from '../site/siteService'
import type { TablesUpdate } from '../../lib/database.types'
import type {
  FaqItem,
  GalleryPhoto,
  OpeningHour,
  SiteConfig,
  Testimonial,
} from '../site/types'

/**
 * Escrita da configuração e do conteúdo da vitrine.
 *
 * Toda escrita passa pelo `adminSupabase` (client autenticado) — é ele que
 * carrega o papel `authenticated` exigido pelas policies de RLS. As leituras
 * ficam no client público: a policy de `select` não filtra por `published`,
 * então o admin enxerga rascunho e publicado com a mesma query, sem duplicar
 * caminho de leitura.
 */

const COVER_PHOTO_PATH_PREFIX = 'cover/site'
const LOGO_PATH_PREFIX = 'cover/logo'
const GALLERY_PATH_PREFIX = 'gallery'

/** Usada na tela de login do admin — leitura pública, sem sessão. */
export { getCoverPhoto } from '../site/siteService'

/**
 * Configuração agrupada → payload plano da tabela.
 *
 * Função pura e exportada: é a tradução entre o modelo que a UI edita e o
 * schema do Postgres, e o ponto mais fácil de errar em silêncio (um campo que
 * some do payload simplesmente não é salvo, sem erro nenhum).
 */
export function buildSiteConfigPayload(config: SiteConfig): TablesUpdate<'site_config'> {
  return {
    restaurant_name: config.identity.name.trim(),
    tagline: config.identity.tagline.trim(),
    description: config.identity.description.trim(),

    address_street: config.contact.addressStreet.trim(),
    address_city: config.contact.addressCity.trim(),
    phone: config.contact.phone.trim(),
    whatsapp_display: config.contact.whatsappDisplay.trim(),
    // Só dígitos: o link wa.me não aceita parênteses, traço nem espaço, e essa
    // é a causa nº 1 de "o botão do WhatsApp não abre".
    whatsapp_number: config.contact.whatsappNumber.replace(/\D/g, ''),
    instagram_url: config.contact.instagramUrl?.trim() || null,
    maps_url: config.contact.mapsUrl?.trim() || null,

    timezone: config.operation.timezone,
    delivery_time: config.operation.deliveryTime.trim(),
    delivery_fee_cents: config.operation.deliveryFeeCents,
    min_order_cents: config.operation.minOrderCents,
    payment_methods: config.operation.paymentMethods.map((m) => m.trim()).filter(Boolean),
    accepts_orders: config.operation.acceptsOrders,
    notice: config.operation.notice?.trim() || null,

    default_theme: config.appearance.defaultTheme,
    allow_theme_toggle: config.appearance.allowThemeToggle,
    brand_color: config.appearance.brandColor,

    show_status: config.sections.status,
    show_highlights: config.sections.highlights,
    show_bestsellers: config.sections.bestsellers,
    show_info_cards: config.sections.infoCards,
    show_hours: config.sections.hours,
    show_reviews: config.sections.reviews,
    show_gallery: config.sections.gallery,
    show_faq: config.sections.faq,
    show_contact: config.sections.contact,
    show_menu_search: config.sections.menuSearch,

    updated_at: new Date().toISOString(),
  }
}

export async function getSiteConfig(): Promise<SiteConfig> {
  const { data, error } = await supabase.from('site_config').select('*').single()
  if (error) {
    throw new Error(`Não foi possível carregar a configuração: ${error.message}`)
  }
  return toSiteConfig(data)
}

export async function saveSiteConfig(config: SiteConfig): Promise<void> {
  const { error } = await adminSupabase
    .from('site_config')
    .update(buildSiteConfigPayload(config))
    .eq('id', true)

  if (error) {
    throw new Error(`Não foi possível salvar a configuração: ${error.message}`)
  }
}

/**
 * Troca uma das fotos institucionais (capa ou logo).
 *
 * Path fixo por tipo, com `upsert`: o arquivo antigo é substituído no lugar, o
 * que evita acumular lixo no bucket a cada troca. O preço é que o navegador
 * pode servir a versão em cache por alguns minutos — aceitável para uma foto
 * que muda uma vez por temporada.
 */
async function updateSitePhoto(
  file: File,
  prefix: string,
  column: 'cover_photo_url' | 'logo_url',
): Promise<void> {
  const extension = file.name.split('.').pop() ?? 'jpg'
  const path = `${prefix}.${extension}`

  const { error: uploadError } = await adminSupabase.storage
    .from('menu')
    .upload(path, file, { upsert: true })
  if (uploadError) {
    throw new Error(`Não foi possível enviar a foto: ${uploadError.message}`)
  }

  // Objeto literal por coluna em vez de chave computada: com `[column]: path`
  // o TypeScript perde o vínculo com o schema e o update passa a aceitar
  // qualquer nome de coluna.
  const patch =
    column === 'cover_photo_url' ? { cover_photo_url: path } : { logo_url: path }

  const { error: updateError } = await adminSupabase
    .from('site_config')
    .update(patch)
    .eq('id', true)
  if (updateError) {
    throw new Error(`Não foi possível salvar a foto: ${updateError.message}`)
  }
}

export function updateCoverPhoto(file: File): Promise<void> {
  return updateSitePhoto(file, COVER_PHOTO_PATH_PREFIX, 'cover_photo_url')
}

export function updateLogo(file: File): Promise<void> {
  return updateSitePhoto(file, LOGO_PATH_PREFIX, 'logo_url')
}

/* --- Horários --------------------------------------------------------- */

export async function listOpeningHours(): Promise<OpeningHour[]> {
  const { data, error } = await supabase
    .from('opening_hours')
    .select('*')
    .order('weekday', { ascending: true })

  if (error) {
    throw new Error(`Não foi possível carregar os horários: ${error.message}`)
  }

  return (data ?? []).map(toOpeningHour)
}

/**
 * Salva a semana inteira de uma vez.
 *
 * `upsert` com os sete dias em uma chamada, e não sete updates: a tela edita a
 * grade como um bloco, e salvar dia a dia deixaria a semana meio salva se a
 * conexão caísse no meio.
 */
export async function saveOpeningHours(hours: OpeningHour[]): Promise<void> {
  const { error } = await adminSupabase.from('opening_hours').upsert(
    hours.map((hour) => ({
      weekday: hour.weekday,
      closed: hour.closed,
      opens: hour.opens,
      closes: hour.closes,
    })),
  )

  if (error) {
    throw new Error(`Não foi possível salvar os horários: ${error.message}`)
  }
}

/* --- FAQ -------------------------------------------------------------- */

export async function listAdminFaq(): Promise<FaqItem[]> {
  const { data, error } = await supabase
    .from('faq_items')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) {
    throw new Error(`Não foi possível carregar o FAQ: ${error.message}`)
  }

  return (data ?? []).map(toFaqItem)
}

export async function saveFaqItem(item: FaqItem): Promise<void> {
  const payload = {
    question: item.question.trim(),
    answer: item.answer.trim(),
    sort_order: item.sortOrder,
    published: item.published,
  }

  const { error } = item.id
    ? await adminSupabase.from('faq_items').update(payload).eq('id', item.id)
    : await adminSupabase.from('faq_items').insert(payload)

  if (error) {
    throw new Error(`Não foi possível salvar a pergunta: ${error.message}`)
  }
}

export async function deleteFaqItem(id: string): Promise<void> {
  const { error } = await adminSupabase.from('faq_items').delete().eq('id', id)
  if (error) {
    throw new Error(`Não foi possível excluir a pergunta: ${error.message}`)
  }
}

/* --- Depoimentos ------------------------------------------------------ */

export async function listAdminTestimonials(): Promise<Testimonial[]> {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) {
    throw new Error(`Não foi possível carregar as avaliações: ${error.message}`)
  }

  return (data ?? []).map(toTestimonial)
}

export async function saveTestimonial(item: Testimonial): Promise<void> {
  const payload = {
    author: item.author.trim(),
    rating: item.rating,
    comment: item.comment.trim(),
    sort_order: item.sortOrder,
    published: item.published,
  }

  const { error } = item.id
    ? await adminSupabase.from('testimonials').update(payload).eq('id', item.id)
    : await adminSupabase.from('testimonials').insert(payload)

  if (error) {
    throw new Error(`Não foi possível salvar a avaliação: ${error.message}`)
  }
}

export async function deleteTestimonial(id: string): Promise<void> {
  const { error } = await adminSupabase.from('testimonials').delete().eq('id', id)
  if (error) {
    throw new Error(`Não foi possível excluir a avaliação: ${error.message}`)
  }
}

/* --- Galeria ---------------------------------------------------------- */

export async function listAdminGallery(): Promise<GalleryPhoto[]> {
  const { data, error } = await supabase
    .from('gallery_photos')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) {
    throw new Error(`Não foi possível carregar a galeria: ${error.message}`)
  }

  return (data ?? []).map(toGalleryPhoto)
}

/** Sobe a foto e cria a linha. Nome com UUID: a galeria acumula arquivos. */
export async function addGalleryPhoto(file: File, caption: string, sortOrder: number): Promise<void> {
  const extension = file.name.split('.').pop() ?? 'jpg'
  const path = `${GALLERY_PATH_PREFIX}/${crypto.randomUUID()}.${extension}`

  const { error: uploadError } = await adminSupabase.storage.from('menu').upload(path, file)
  if (uploadError) {
    throw new Error(`Não foi possível enviar a foto: ${uploadError.message}`)
  }

  const { error } = await adminSupabase.from('gallery_photos').insert({
    photo_url: path,
    caption: caption.trim(),
    sort_order: sortOrder,
  })

  if (error) {
    // A linha não entrou; o arquivo órfão no bucket seria lixo silencioso.
    await adminSupabase.storage.from('menu').remove([path])
    throw new Error(`Não foi possível salvar a foto: ${error.message}`)
  }
}

export async function updateGalleryPhoto(photo: GalleryPhoto): Promise<void> {
  const { error } = await adminSupabase
    .from('gallery_photos')
    .update({
      caption: photo.caption.trim(),
      sort_order: photo.sortOrder,
      published: photo.published,
    })
    .eq('id', photo.id)

  if (error) {
    throw new Error(`Não foi possível salvar a foto: ${error.message}`)
  }
}

export async function deleteGalleryPhoto(photo: GalleryPhoto): Promise<void> {
  const { error } = await adminSupabase.from('gallery_photos').delete().eq('id', photo.id)
  if (error) {
    throw new Error(`Não foi possível excluir a foto: ${error.message}`)
  }

  await adminSupabase.storage.from('menu').remove([photo.photoPath])
}
