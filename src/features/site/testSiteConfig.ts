import { DEFAULT_SITE_CONFIG } from './defaults'
import type { SiteConfig } from './types'

/**
 * Configuração de exemplo para os testes.
 *
 * Mora no código de produção (e não dentro de um `.test.ts`) porque mais de um
 * arquivo de teste precisa dela — e uma segunda cópia divergiria do modelo na
 * primeira mudança de campo. `overrides` cobre o caso de cada teste mexer só no
 * que lhe interessa.
 */
export function testSiteConfig(overrides: Partial<SiteConfig> = {}): SiteConfig {
  return {
    ...DEFAULT_SITE_CONFIG,
    ...overrides,
    identity: { ...DEFAULT_SITE_CONFIG.identity, name: 'Brasa Nove', ...overrides.identity },
    contact: {
      ...DEFAULT_SITE_CONFIG.contact,
      whatsappDisplay: '(62) 99887-4090',
      whatsappNumber: '5562998874090',
      ...overrides.contact,
    },
    operation: {
      ...DEFAULT_SITE_CONFIG.operation,
      deliveryTime: '35–50 min',
      ...overrides.operation,
    },
  }
}
