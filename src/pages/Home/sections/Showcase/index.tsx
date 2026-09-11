import { Link } from 'react-router-dom'
import { buttonClasses } from '../../../../components/Button/classes'
import { Skeleton } from '../../../../components/Skeleton'
import { Section } from '../../../../components/Section'
import { ShowcaseCard } from '../../../../features/menu/components/ShowcaseCard'
import { useCart } from '../../../../features/cart/useCart'
import type { MenuItem } from '../../../../features/menu/types'
import { ROUTES } from '../../../../routes'
import styles from './Showcase.module.css'

type Props = {
  id: string
  eyebrow: string
  title: string
  description: string
  items: MenuItem[]
  loading: boolean
  /** Selo mostrado sobre a foto de cada cartão. */
  highlightLabel?: string
}

/** Três esqueletos: o suficiente para ocupar a largura da dobra sem exagero. */
const SKELETONS = [0, 1, 2]

/**
 * Vitrine horizontal de itens do cardápio — serve tanto para "destaques"
 * quanto para "mais pedidos", que são a mesma tela com outra fonte de dados.
 *
 * Trilho com rolagem e encaixe (`scroll-snap`) em vez de um carrossel com
 * setas: no celular o dedo já faz o trabalho, e no desktop a barra aparece no
 * hover. Carrossel automático seria uma animação a mais para dar errado e um
 * problema de acessibilidade a mais para resolver.
 */
export function Showcase({ id, eyebrow, title, description, items, loading, highlightLabel }: Props) {
  const { add, lines } = useCart()

  if (!loading && items.length === 0) return null

  return (
    <Section
      id={id}
      eyebrow={eyebrow}
      title={title}
      description={description}
      bleed
      action={
        <Link to={ROUTES.menu} className={buttonClasses({ variant: 'soft', size: 'sm', pill: true })}>
          Ver tudo
        </Link>
      }
    >
      <div className={`${styles.rail} u-rail`} aria-busy={loading}>
        {loading
          ? SKELETONS.map((index) => (
              <div key={index} className={styles.skeleton}>
                <Skeleton height="11rem" radius="var(--radius-lg)" />
                <Skeleton height="1.1rem" width="70%" />
                <Skeleton height="0.9rem" width="45%" />
              </div>
            ))
          : items.map((item) => (
              <ShowcaseCard
                key={item.id}
                item={item}
                highlight={highlightLabel}
                onAdd={() => add(item)}
                cartQuantity={lines.find((line) => line.id === item.id)?.quantity ?? 0}
              />
            ))}
      </div>
    </Section>
  )
}
