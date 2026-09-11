import type { SiteConfig } from '../../../features/site/types'

/**
 * Contrato comum das abas de configuração.
 *
 * `patch` altera um grupo (identidade, contato, operação…) sem que a aba
 * precise remontar o objeto inteiro — e sem que ela possa, por descuido,
 * apagar um grupo vizinho ao espalhar o estado.
 */
export type TabProps = {
  config: SiteConfig
  patch: <K extends keyof SiteConfig>(group: K, values: Partial<SiteConfig[K]>) => void
}
