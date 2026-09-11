import { Link } from 'react-router-dom'
import { LinkButton } from '../../../../components/Button'
import { buttonClasses } from '../../../../components/Button/classes'
import { IconArrowRight, IconClock, IconStar, IconTruck, IconWhatsApp } from '../../../../components/Icon'
import { ItemPhoto } from '../../../../components/ItemPhoto'
import { Rating } from '../../../../components/Rating'
import { OpenStatusBadge } from '../../../../features/site/components/OpenStatusBadge'
import { buildContactLink } from '../../../../features/order/whatsappMessage'
import { useSite } from '../../../../features/site/useSite'
import { formatPrice } from '../../../../lib/format'
import { ROUTES } from '../../../../routes'
import styles from './Hero.module.css'

/** Média das avaliações publicadas, arredondada a uma casa. */
function averageRating(ratings: number[]): number | null {
  if (ratings.length === 0) return null
  return Math.round((ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length) * 10) / 10
}

/**
 * Abertura da Home: foto grande, promessa da casa e os dois caminhos possíveis
 * (ver cardápio, falar no WhatsApp).
 *
 * A faixa de números embaixo — tempo de entrega, taxa, nota — existe porque é
 * exatamente o que a pessoa quer saber antes de decidir olhar o cardápio. Cada
 * bloco some sozinho quando não há o dado configurado, em vez de mostrar
 * "R$ 0,00" ou um traço.
 */
export function Hero() {
  const { config, testimonials } = useSite()
  const { identity, contact, operation, sections } = config

  const rating = sections.reviews ? averageRating(testimonials.map((t) => t.rating)) : null

  return (
    <section className={styles.hero} aria-labelledby="hero-titulo">
      <div className={styles.background}>
        <ItemPhoto
          url={identity.coverPhotoUrl}
          alt={`Fachada de ${identity.name}`}
          format="large"
          priority
        />
        <span className={styles.overlay} aria-hidden="true" />
      </div>

      <div className={styles.content}>
        <OpenStatusBadge withDetail />

        <h1 id="hero-titulo" className={styles.title}>
          {identity.tagline || identity.name}
        </h1>

        {identity.description ? <p className={styles.lead}>{identity.description}</p> : null}

        <div className={styles.actions}>
          <Link to={ROUTES.menu} className={buttonClasses({ size: 'lg' })}>
            Ver cardápio
            <IconArrowRight width={18} height={18} />
          </Link>

          {contact.whatsappNumber ? (
            <LinkButton href={buildContactLink(config)} variant="secondary" size="lg">
              <IconWhatsApp width={18} height={18} />
              Falar no WhatsApp
            </LinkButton>
          ) : null}
        </div>

        <dl className={styles.stats}>
          {operation.deliveryTime ? (
            <div className={styles.stat}>
              <dt className={styles.statLabel}>
                <IconClock width={14} height={14} />
                Entrega
              </dt>
              <dd className={styles.statValue}>{operation.deliveryTime}</dd>
            </div>
          ) : null}

          <div className={styles.stat}>
            <dt className={styles.statLabel}>
              <IconTruck width={14} height={14} />
              Taxa
            </dt>
            <dd className={styles.statValue}>
              {operation.deliveryFeeCents > 0 ? formatPrice(operation.deliveryFeeCents) : 'Grátis'}
            </dd>
          </div>

          {operation.minOrderCents > 0 ? (
            <div className={styles.stat}>
              <dt className={styles.statLabel}>Pedido mínimo</dt>
              <dd className={styles.statValue}>{formatPrice(operation.minOrderCents)}</dd>
            </div>
          ) : null}

          {rating !== null ? (
            <div className={styles.stat}>
              <dt className={styles.statLabel}>
                <IconStar width={14} height={14} />
                Avaliação
              </dt>
              <dd className={styles.statValue}>
                <Rating value={rating} caption={rating.toLocaleString('pt-BR')} />
              </dd>
            </div>
          ) : null}
        </dl>
      </div>
    </section>
  )
}
