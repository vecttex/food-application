import { IconClock, IconMap, IconPin, IconTruck, IconWallet } from '../../../../components/Icon'
import { formatWeeklyHours } from '../../../../features/site/openingHours'
import { useSite } from '../../../../features/site/useSite'
import { formatPrice } from '../../../../lib/format'
import styles from './InfoCards.module.css'

/**
 * Faixa de cartões com o que a pessoa pergunta antes de pedir: entrega,
 * pagamento, endereço e horário.
 *
 * Cada cartão só aparece se tiver conteúdo — um cartão "Pagamento" vazio é
 * pior do que a ausência dele, porque ocupa espaço e não responde nada. É por
 * isso que a seção inteira também desaparece quando nada sobra.
 */
export function InfoCards() {
  const { config, hours } = useSite()
  const { contact, operation } = config

  const hoursLines = formatWeeklyHours(hours)
  const hasDelivery = operation.deliveryTime || operation.deliveryFeeCents > 0
  const hasPayment = operation.paymentMethods.length > 0
  const hasAddress = Boolean(contact.addressStreet || contact.addressCity)
  const hasHours = hoursLines.length > 0

  if (!hasDelivery && !hasPayment && !hasAddress && !hasHours) return null

  return (
    <section className={styles.grid} aria-label="Informações do restaurante">
      {hasDelivery ? (
        <article className={styles.card}>
          <span className={styles.icon} aria-hidden="true">
            <IconTruck width={18} height={18} />
          </span>
          <h2 className={styles.title}>Entrega</h2>
          <p className={styles.highlight}>{operation.deliveryTime || 'Sob consulta'}</p>
          <p className={styles.detail}>
            {operation.deliveryFeeCents > 0
              ? `Taxa de ${formatPrice(operation.deliveryFeeCents)}`
              : 'Sem taxa de entrega'}
            {operation.minOrderCents > 0
              ? ` · mínimo de ${formatPrice(operation.minOrderCents)}`
              : ''}
          </p>
        </article>
      ) : null}

      {hasPayment ? (
        <article className={styles.card}>
          <span className={styles.icon} aria-hidden="true">
            <IconWallet width={18} height={18} />
          </span>
          <h2 className={styles.title}>Pagamento</h2>
          <ul className={styles.chips}>
            {operation.paymentMethods.map((method) => (
              <li key={method} className={styles.chip}>
                {method}
              </li>
            ))}
          </ul>
        </article>
      ) : null}

      {hasAddress ? (
        <article className={styles.card}>
          <span className={styles.icon} aria-hidden="true">
            <IconPin width={18} height={18} />
          </span>
          <h2 className={styles.title}>Onde estamos</h2>
          <p className={styles.highlight}>{contact.addressStreet}</p>
          <p className={styles.detail}>{contact.addressCity}</p>
          {contact.mapsUrl ? (
            <a
              className={styles.link}
              href={contact.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconMap width={14} height={14} />
              Abrir no mapa
            </a>
          ) : null}
        </article>
      ) : null}

      {hasHours ? (
        <article className={styles.card}>
          <span className={styles.icon} aria-hidden="true">
            <IconClock width={18} height={18} />
          </span>
          <h2 className={styles.title}>Funcionamento</h2>
          <ul className={styles.hours}>
            {hoursLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </article>
      ) : null}
    </section>
  )
}
