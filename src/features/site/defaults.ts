import { DEFAULT_BRAND } from '../theme/brands'
import type { SiteConfig } from './types'

/**
 * Configuração de partida.
 *
 * Serve para duas coisas: o primeiro render, enquanto a leitura do Supabase não
 * voltou, e a rede de segurança se a leitura falhar. Sem isso, um erro de rede
 * deixaria a vitrine sem nome, sem telefone e sem seção nenhuma — pior do que
 * mostrar dados um pouco genéricos.
 *
 * Não é "a configuração do restaurante": essa mora no banco e se edita no
 * admin. Aqui ficam só valores neutros o suficiente para a tela se desenhar.
 */
export const DEFAULT_SITE_CONFIG: SiteConfig = {
  identity: {
    name: 'Brasa Nove',
    tagline: 'Hambúrgueres artesanais grelhados na brasa',
    description: '',
    coverPhotoUrl: null,
    logoUrl: null,
  },
  contact: {
    addressStreet: '',
    addressCity: '',
    phone: '',
    whatsappDisplay: '',
    whatsappNumber: '',
    instagramUrl: null,
    mapsUrl: null,
  },
  operation: {
    timezone: 'America/Sao_Paulo',
    deliveryTime: '',
    deliveryFeeCents: 0,
    minOrderCents: 0,
    paymentMethods: [],
    acceptsOrders: true,
    notice: null,
  },
  appearance: {
    defaultTheme: 'system',
    allowThemeToggle: true,
    brandColor: DEFAULT_BRAND,
  },
  sections: {
    status: true,
    highlights: true,
    bestsellers: true,
    infoCards: true,
    hours: true,
    reviews: true,
    gallery: true,
    faq: true,
    contact: true,
    menuSearch: true,
  },
}
