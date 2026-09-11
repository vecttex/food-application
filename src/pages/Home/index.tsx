import { Accordion } from '../../components/Accordion'
import { Section } from '../../components/Section'
import { StatusMessage } from '../../components/StatusMessage'
import { showcaseItems } from '../../features/menu/menuService'
import { useMenu } from '../../features/menu/useMenu'
import { useSite } from '../../features/site/useSite'
import { HOME_SECTIONS } from '../../routes'
import { Contact } from './sections/Contact'
import { Gallery } from './sections/Gallery'
import { Hero } from './sections/Hero'
import { InfoCards } from './sections/InfoCards'
import { Reviews } from './sections/Reviews'
import { Showcase } from './sections/Showcase'
import styles from './Home.module.css'

/**
 * Home.
 *
 * A página é uma composição de seções, e cada seção decide sozinha se aparece:
 * a flag correspondente em `site_config` (ligada pelo admin) e a existência de
 * conteúdo. Por isso não há um `if` gigante aqui — a regra de visibilidade mora
 * junto do bloco que ela governa, que é onde alguém vai procurá-la.
 *
 * O cardápio é buscado uma vez, aqui, e distribuído para as duas vitrines.
 * Cada `Showcase` chamando `useMenu` sozinho renderia duas requisições
 * idênticas por visita.
 */
export function Home() {
  const { config, faq } = useSite()
  const state = useMenu()

  const loadingMenu = state.status === 'loading'
  const menu = state.status === 'ready' ? state.menu : null

  const highlights = menu ? showcaseItems(menu, 'featured') : []
  const bestsellers = menu ? showcaseItems(menu, 'bestseller') : []

  return (
    <div className={styles.page}>
      <Hero />

      <div className={styles.body}>
        {config.sections.infoCards ? <InfoCards /> : null}

        {config.sections.highlights ? (
          <Showcase
            id={HOME_SECTIONS.highlights}
            eyebrow="Destaques"
            title="Direto da brasa"
            description="O que a casa recomenda hoje."
            items={highlights}
            loading={loadingMenu}
            highlightLabel="Destaque"
          />
        ) : null}

        {config.sections.bestsellers ? (
          <Showcase
            id={HOME_SECTIONS.bestsellers}
            eyebrow="Mais pedidos"
            title="Os campeões de pedido"
            description="Os itens que mais saem no delivery."
            items={bestsellers}
            loading={loadingMenu}
          />
        ) : null}

        {state.status === 'error' ? (
          <StatusMessage
            type="error"
            title="Não deu para carregar o cardápio"
            description={state.message}
          />
        ) : null}

        <Reviews />
        <Gallery />

        {config.sections.faq && faq.length > 0 ? (
          <Section
            id={HOME_SECTIONS.faq}
            eyebrow="Dúvidas"
            title="Perguntas frequentes"
            description="As respostas que mais chegam pelo WhatsApp."
            tone="alternate"
          >
            <Accordion
              items={faq.map((item) => ({
                id: item.id,
                question: item.question,
                answer: item.answer,
              }))}
            />
          </Section>
        ) : null}

        <Contact />
      </div>
    </div>
  )
}
