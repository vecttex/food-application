import { supabase } from '../../lib/supabase'
import { getPublicPhotoUrl } from '../../lib/storage'
import { DEFAULT_BRAND, isBrandId } from '../theme/brands'
import { isThemePreference } from '../theme/types'
import { DEFAULT_SITE_CONFIG } from './defaults'
import type { Tables } from '../../lib/database.types'
import type {
  FaqItem,
  GalleryPhoto,
  OpeningHour,
  SiteConfig,
  SiteContent,
  Testimonial,
} from './types'

/**
 * Leitura pública da configuração e do conteúdo da vitrine.
 *
 * Escrita não mora aqui: o admin usa `features/admin/siteConfigService`, que
 * fala pelo client autenticado. A separação é a mesma de `menuService` ×
 * `menuAdminService` — e é o que garante que a vitrine nunca segure uma sessão.
 */

const CONFIG_COLUMNS = '*' as const

/**
 * Linha do banco → modelo de domínio.
 *
 * Função pura e exportada: é aqui que a tabela larga vira configuração
 * agrupada, e é o ponto que vale testar sem tocar na rede.
 */
export function toSiteConfig(row: Tables<'site_config'>): SiteConfig {
  return {
    identity: {
      name: row.restaurant_name || DEFAULT_SITE_CONFIG.identity.name,
      tagline: row.tagline,
      description: row.description,
      coverPhotoUrl: getPublicPhotoUrl(row.cover_photo_url),
      logoUrl: getPublicPhotoUrl(row.logo_url),
    },
    contact: {
      addressStreet: row.address_street,
      addressCity: row.address_city,
      phone: row.phone,
      whatsappDisplay: row.whatsapp_display,
      whatsappNumber: row.whatsapp_number,
      instagramUrl: row.instagram_url,
      mapsUrl: row.maps_url,
    },
    operation: {
      timezone: row.timezone || DEFAULT_SITE_CONFIG.operation.timezone,
      deliveryTime: row.delivery_time,
      deliveryFeeCents: row.delivery_fee_cents,
      minOrderCents: row.min_order_cents,
      paymentMethods: row.payment_methods ?? [],
      acceptsOrders: row.accepts_orders,
      notice: row.notice?.trim() ? row.notice : null,
    },
    appearance: {
      // A coluna é `text` para não travar o schema em três valores; a garantia
      // de que só entra o que o app entende fica aqui, na borda.
      defaultTheme: isThemePreference(row.default_theme) ? row.default_theme : 'system',
      allowThemeToggle: row.allow_theme_toggle,
      brandColor: isBrandId(row.brand_color) ? row.brand_color : DEFAULT_BRAND,
    },
    sections: {
      status: row.show_status,
      highlights: row.show_highlights,
      bestsellers: row.show_bestsellers,
      infoCards: row.show_info_cards,
      hours: row.show_hours,
      reviews: row.show_reviews,
      gallery: row.show_gallery,
      faq: row.show_faq,
      contact: row.show_contact,
      menuSearch: row.show_menu_search,
    },
  }
}

export function toOpeningHour(row: Tables<'opening_hours'>): OpeningHour {
  return {
    weekday: row.weekday,
    closed: row.closed,
    opens: row.opens,
    closes: row.closes,
  }
}

export function toFaqItem(row: Tables<'faq_items'>): FaqItem {
  return {
    id: row.id,
    question: row.question,
    answer: row.answer,
    sortOrder: row.sort_order,
    published: row.published,
  }
}

export function toTestimonial(row: Tables<'testimonials'>): Testimonial {
  return {
    id: row.id,
    author: row.author,
    rating: row.rating,
    comment: row.comment,
    sortOrder: row.sort_order,
    published: row.published,
  }
}

export function toGalleryPhoto(row: Tables<'gallery_photos'>): GalleryPhoto {
  return {
    id: row.id,
    photoUrl: getPublicPhotoUrl(row.photo_url),
    photoPath: row.photo_url,
    caption: row.caption,
    sortOrder: row.sort_order,
    published: row.published,
  }
}

/** Usada na tela de login do admin, que só precisa da capa. */
export async function getCoverPhoto(): Promise<string | null> {
  const { data, error } = await supabase.from('site_config').select('cover_photo_url').single()
  if (error) {
    throw new Error(`Não foi possível carregar a foto do estabelecimento: ${error.message}`)
  }

  return getPublicPhotoUrl(data.cover_photo_url)
}

/**
 * Busca tudo que a vitrine precisa em paralelo.
 *
 * Cinco queries e um `Promise.all` em vez de um select aninhado do PostgREST:
 * mesmo tempo de parede, e cada tabela continua com sua própria política de
 * ordenação e de filtro (`published`) sem virar uma expressão ilegível.
 *
 * Só a configuração é obrigatória — se o FAQ falhar, a Home ainda abre sem a
 * seção de FAQ. Nada aqui justifica derrubar a página inteira.
 */
export async function fetchSiteContent(): Promise<SiteContent> {
  const [configResponse, hoursResponse, faqResponse, testimonialsResponse, galleryResponse] =
    await Promise.all([
      supabase.from('site_config').select(CONFIG_COLUMNS).single(),
      supabase.from('opening_hours').select('*').order('weekday', { ascending: true }),
      supabase
        .from('faq_items')
        .select('*')
        .eq('published', true)
        .order('sort_order', { ascending: true }),
      supabase
        .from('testimonials')
        .select('*')
        .eq('published', true)
        .order('sort_order', { ascending: true }),
      supabase
        .from('gallery_photos')
        .select('*')
        .eq('published', true)
        .order('sort_order', { ascending: true }),
    ])

  if (configResponse.error) {
    throw new Error(
      `Não foi possível carregar a configuração do site: ${configResponse.error.message}`,
    )
  }

  return {
    config: toSiteConfig(configResponse.data),
    hours: (hoursResponse.data ?? []).map(toOpeningHour),
    faq: (faqResponse.data ?? []).map(toFaqItem),
    testimonials: (testimonialsResponse.data ?? []).map(toTestimonial),
    gallery: (galleryResponse.data ?? []).map(toGalleryPhoto),
  }
}
