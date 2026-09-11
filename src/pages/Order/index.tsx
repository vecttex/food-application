import { Link, useNavigate } from 'react-router-dom'
import { LinkButton } from '../../components/Button'
import { buttonClasses } from '../../components/Button/classes'
import { IconButton } from '../../components/IconButton'
import { IconArrowLeft, IconClock, IconTruck, IconWhatsApp } from '../../components/Icon'
import { Panel } from '../../components/Panel'
import { StatusMessage } from '../../components/StatusMessage'
import { OrderLine } from '../../features/cart/components/OrderLine'
import { useCart } from '../../features/cart/useCart'
import { AddressForm } from '../../features/order/components/AddressForm'
import { buildOrderLink } from '../../features/order/whatsappMessage'
import { useAddress } from '../../features/order/useAddress'
import { OpenStatusBadge } from '../../features/site/components/OpenStatusBadge'
import { useSite } from '../../features/site/useSite'
import { formatItemCount, formatPrice } from '../../lib/format'
import { ROUTES } from '../../routes'
import styles from './Order.module.css'

export function Order() {
  const navigate = useNavigate()
  const { lines, totalQuantity, totalCents, empty, increment, decrement } = useCart()
  const { address, updateField } = useAddress()
  const { config } = useSite()

  const { deliveryFeeCents, minOrderCents, deliveryTime, acceptsOrders } = config.operation

  const totalWithFee = totalCents + deliveryFeeCents
  const remainingForMinimum = Math.max(0, minOrderCents - totalCents)
  const canCheckout = acceptsOrders && remainingForMinimum === 0 && Boolean(config.contact.whatsappNumber)

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <IconButton
          label="Voltar para o cardápio"
          className={styles.backButton}
          onClick={() => navigate(ROUTES.menu)}
        >
          <IconArrowLeft width={18} height={18} />
        </IconButton>

        <div className={styles.titleGroup}>
          <h1 className={styles.title}>Seu pedido</h1>
          {empty ? null : <p className={styles.subtitle}>{formatItemCount(totalQuantity)}</p>}
        </div>

        <OpenStatusBadge withDetail />
      </div>

      {empty ? (
        <StatusMessage
          type="empty"
          title="Seu pedido está vazio"
          description="Escolha os lanches e bebidas no cardápio para montar o pedido."
          action={
            <Link to={ROUTES.menu} className={buttonClasses({ size: 'md' })}>
              Ver cardápio
            </Link>
          }
        />
      ) : (
        <div className={styles.columns}>
          <div className={styles.column}>
            <ul className={styles.lines}>
              {lines.map((line) => (
                <OrderLine
                  key={line.id}
                  line={line}
                  onIncrement={() => increment(line.id)}
                  onDecrement={() => decrement(line.id)}
                />
              ))}
            </ul>

            <Panel stacked>
              <AddressForm address={address} onChange={updateField} />
            </Panel>
          </div>

          <aside className={styles.summary}>
            <Panel stacked className={styles.summaryPanel}>
              <h2 className={styles.summaryTitle}>Resumo</h2>

              <dl className={styles.summaryRows}>
                <div className={styles.summaryRow}>
                  <dt>Subtotal</dt>
                  <dd>{formatPrice(totalCents)}</dd>
                </div>

                <div className={styles.summaryRow}>
                  <dt>
                    <IconTruck width={14} height={14} aria-hidden="true" />
                    Entrega
                  </dt>
                  <dd>{deliveryFeeCents > 0 ? formatPrice(deliveryFeeCents) : 'Grátis'}</dd>
                </div>

                {deliveryTime ? (
                  <div className={styles.summaryRow}>
                    <dt>
                      <IconClock width={14} height={14} aria-hidden="true" />
                      Tempo estimado
                    </dt>
                    <dd>{deliveryTime}</dd>
                  </div>
                ) : null}
              </dl>

              <div className={styles.total}>
                <span className={styles.totalLabel}>Total</span>
                <span className={styles.totalValue}>{formatPrice(totalWithFee)}</span>
              </div>

              {remainingForMinimum > 0 ? (
                <p className={styles.alert} role="status">
                  Faltam {formatPrice(remainingForMinimum)} para atingir o pedido mínimo de{' '}
                  {formatPrice(minOrderCents)}.
                </p>
              ) : null}

              {!acceptsOrders ? (
                <p className={styles.alert} role="status">
                  Os pedidos estão pausados no momento. Fale com a gente pelo WhatsApp para
                  confirmar a disponibilidade.
                </p>
              ) : null}

              <div className={styles.actions}>
                {canCheckout ? (
                  <LinkButton
                    href={buildOrderLink({ lines, totalCents: totalWithFee, address, site: config })}
                    size="lg"
                    fullWidth
                  >
                    <IconWhatsApp width={18} height={18} />
                    Finalizar no WhatsApp
                  </LinkButton>
                ) : (
                  <button
                    type="button"
                    className={buttonClasses({ size: 'lg', fullWidth: true })}
                    disabled
                  >
                    <IconWhatsApp width={18} height={18} />
                    Finalizar no WhatsApp
                  </button>
                )}

                <Link
                  to={ROUTES.menu}
                  className={buttonClasses({ variant: 'ghost', size: 'md', fullWidth: true })}
                >
                  Adicionar mais itens
                </Link>
              </div>
            </Panel>
          </aside>
        </div>
      )}
    </div>
  )
}
