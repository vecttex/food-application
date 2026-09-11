import type { BrandId } from '../theme/brands'
import type { ThemePreference } from '../theme/types'

/**
 * Modelo de domínio da configuração do site.
 *
 * Deliberadamente diferente da linha do banco (`Tables<'site_config'>`, uma
 * tabela larga e plana): aqui a configuração é agrupada por assunto, e cada
 * grupo corresponde a uma aba da tela de Configurações do admin. É isso que
 * permite acrescentar uma coluna no Postgres — ou renomear uma — sem sair
 * mexendo em componente.
 */

export type SiteIdentity = {
  name: string
  tagline: string
  description: string
  /** URL pública já resolvida (o banco guarda só o path no bucket). */
  coverPhotoUrl: string | null
  logoUrl: string | null
}

export type SiteContact = {
  addressStreet: string
  addressCity: string
  phone: string
  whatsappDisplay: string
  /** Formato internacional sem símbolos, exigido pelo link wa.me. */
  whatsappNumber: string
  instagramUrl: string | null
  mapsUrl: string | null
}

export type SiteOperation = {
  timezone: string
  deliveryTime: string
  deliveryFeeCents: number
  minOrderCents: number
  paymentMethods: string[]
  /** Desligado, a vitrine continua no ar mas sem botão de finalizar pedido. */
  acceptsOrders: boolean
  /** Faixa de aviso no topo ("Hoje fechamos mais cedo"). */
  notice: string | null
}

export type SiteAppearance = {
  defaultTheme: ThemePreference
  allowThemeToggle: boolean
  /** Paleta de marca ativa — vale para o site inteiro, nos dois temas. */
  brandColor: BrandId
}

/**
 * Quais seções aparecem na vitrine. Uma flag por seção, todas no banco: é o
 * que permite ao dono do restaurante montar a Home sem deploy.
 */
export type SiteSections = {
  status: boolean
  highlights: boolean
  bestsellers: boolean
  infoCards: boolean
  hours: boolean
  reviews: boolean
  gallery: boolean
  faq: boolean
  contact: boolean
  menuSearch: boolean
}

export type SiteConfig = {
  identity: SiteIdentity
  contact: SiteContact
  operation: SiteOperation
  appearance: SiteAppearance
  sections: SiteSections
}

export type OpeningHour = {
  /** 0 = domingo, como no Postgres e no `Date.getDay()`. */
  weekday: number
  closed: boolean
  /** 'HH:MM' ou 'HH:MM:SS', como vem do tipo `time`. */
  opens: string
  closes: string
}

export type FaqItem = {
  id: string
  question: string
  answer: string
  sortOrder: number
  published: boolean
}

export type Testimonial = {
  id: string
  author: string
  rating: number
  comment: string
  sortOrder: number
  published: boolean
}

export type GalleryPhoto = {
  id: string
  photoUrl: string | null
  photoPath: string
  caption: string
  sortOrder: number
  published: boolean
}

/** Tudo que a vitrine precisa, em uma leitura só. */
export type SiteContent = {
  config: SiteConfig
  hours: OpeningHour[]
  faq: FaqItem[]
  testimonials: Testimonial[]
  gallery: GalleryPhoto[]
}
