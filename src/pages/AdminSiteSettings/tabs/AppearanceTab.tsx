import { useEffect } from 'react'
import { BrandSwatches } from '../../../components/BrandSwatches'
import { Panel } from '../../../components/Panel'
import { Select } from '../../../components/Select'
import { Switch } from '../../../components/Switch'
import { setDocumentBrand } from '../../../features/theme/brandStorage'
import { brandLabel } from '../../../features/theme/brands'
import { isThemePreference } from '../../../features/theme/types'
import { useSite } from '../../../features/site/useSite'
import type { SiteSections } from '../../../features/site/types'
import type { TabProps } from './types'
import styles from '../Settings.module.css'

const THEMES = [
  { value: 'system', label: 'Seguir o aparelho do visitante' },
  { value: 'light', label: 'Sempre claro' },
  { value: 'dark', label: 'Sempre escuro' },
]

type DescribedSection = {
  key: keyof SiteSections
  label: string
  description: string
}

/**
 * A lista que governa a vitrine.
 *
 * Uma entrada por flag de `site_config`: acrescentar uma seção nova ao site é
 * acrescentar a coluna, o bloco na Home e uma linha aqui — e o dono do
 * restaurante ganha o interruptor sem que ninguém precise fazer deploy.
 */
const SECTIONS: DescribedSection[] = [
  {
    key: 'status',
    label: 'Selo “aberto agora”',
    description: 'Mostra se o restaurante está aberto, calculado pelo horário cadastrado.',
  },
  {
    key: 'infoCards',
    label: 'Cartões de informação',
    description: 'Entrega, pagamento, endereço e funcionamento logo abaixo da abertura.',
  },
  {
    key: 'highlights',
    label: 'Vitrine de destaques',
    description: 'Itens marcados como destaque no cadastro do cardápio.',
  },
  {
    key: 'bestsellers',
    label: 'Vitrine de mais pedidos',
    description: 'Itens marcados como mais pedidos no cadastro do cardápio.',
  },
  {
    key: 'reviews',
    label: 'Avaliações de clientes',
    description: 'Só aparece quando há avaliação publicada na aba Conteúdo.',
  },
  {
    key: 'gallery',
    label: 'Galeria de fotos',
    description: 'Só aparece quando há foto publicada na aba Conteúdo.',
  },
  {
    key: 'faq',
    label: 'Perguntas frequentes',
    description: 'Só aparece quando há pergunta publicada na aba Conteúdo.',
  },
  {
    key: 'contact',
    label: 'Bloco de contato',
    description: 'Endereço, telefone e atalhos para WhatsApp, mapa e Instagram.',
  },
  {
    key: 'hours',
    label: 'Horários no rodapé',
    description: 'Lista da semana no rodapé de todas as páginas.',
  },
  {
    key: 'menuSearch',
    label: 'Busca no cardápio',
    description: 'Campo de busca por nome e ingrediente na tela de cardápio.',
  },
]

export function AppearanceTab({ config, patch }: TabProps) {
  // O que está salvo no banco, para onde a tela volta se a pessoa sair sem
  // salvar. O rascunho vive no estado da página; este é o outro lado.
  const { config: savedConfig } = useSite()
  const draftBrand = config.appearance.brandColor
  const savedBrand = savedConfig.appearance.brandColor

  // Pré-visualização: a cor escolhida pinta o admin inteiro na hora — botões,
  // menu lateral, selos. Ver a paleta aplicada de verdade decide muito mais do
  // que um quadradinho isolado. Sair da aba sem salvar desfaz.
  useEffect(() => {
    setDocumentBrand(draftBrand)
    return () => setDocumentBrand(savedBrand)
  }, [draftBrand, savedBrand])

  return (
    <>
      <Panel stacked>
        <h2 className={styles.sectionTitle}>Cor do site</h2>
        <p className={styles.sectionText}>
          Vale para botões, selos, links e destaques, nos dois temas. Cada cor tem uma versão
          calibrada para o claro e outra para o escuro — o quadradinho mostra a que está em uso
          agora. O pontinho no meio é a cor do texto que aparece por cima dela.
        </p>

        <BrandSwatches
          label="Cor da marca"
          value={config.appearance.brandColor}
          onChange={(brand) => patch('appearance', { brandColor: brand })}
        />

        <p className={styles.sectionText}>
          Em uso: <strong>{brandLabel(config.appearance.brandColor)}</strong>. A mudança aparece na
          hora aqui no admin e vale para o site depois de salvar.
        </p>
      </Panel>

      <Panel stacked>
        <h2 className={styles.sectionTitle}>Tema</h2>
        <p className={styles.sectionText}>
          O padrão vale para quem chega pela primeira vez. Quem trocar o tema pelo botão mantém a
          própria escolha nas visitas seguintes.
        </p>

        <Select
          label="Tema padrão"
          value={config.appearance.defaultTheme}
          options={THEMES}
          onChange={(event) => {
            const value = event.target.value
            if (isThemePreference(value)) patch('appearance', { defaultTheme: value })
          }}
        />

        <Switch
          label="Mostrar o botão de trocar o tema"
          description="Desligado, o site fica travado no tema padrão escolhido acima."
          checked={config.appearance.allowThemeToggle}
          onChange={(checked) => patch('appearance', { allowThemeToggle: checked })}
        />
      </Panel>

      <Panel stacked>
        <h2 className={styles.sectionTitle}>Seções da vitrine</h2>
        <p className={styles.sectionText}>
          O que aparece para o cliente. Seção desligada some da página; seção ligada sem conteúdo
          também não aparece — não existe bloco vazio no site.
        </p>

        {SECTIONS.map((section, index) => (
          <div key={section.key}>
            {index > 0 ? <div className={styles.divider} /> : null}
            <Switch
              label={section.label}
              description={section.description}
              checked={config.sections[section.key]}
              onChange={(checked) => patch('sections', { [section.key]: checked })}
            />
          </div>
        ))}
      </Panel>
    </>
  )
}
