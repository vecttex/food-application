import { ItemPhoto } from '../../../../components/ItemPhoto'
import { QuantityStepper } from '../../../../components/QuantityStepper'
import { formatPrice } from '../../../../lib/format'
import type { CartLine } from '../../types'
import styles from './OrderLine.module.css'

type Props = {
  line: CartLine
  onIncrement: () => void
  onDecrement: () => void
}

/**
 * Uma linha do pedido: foto, nome, subtotal e o controle de quantidade.
 *
 * Mostra o subtotal (preço × quantidade) e o unitário ao lado — só o unitário
 * obrigaria a pessoa a fazer a conta de cabeça para conferir o total.
 */
export function OrderLine({ line, onIncrement, onDecrement }: Props) {
  return (
    <li className={styles.row}>
      <ItemPhoto url={line.photoUrl} alt="" width="3.5rem" height="3.5rem" />

      <div className={styles.info}>
        <p className={styles.name}>{line.name}</p>
        <p className={styles.price}>
          {formatPrice(line.priceCents * line.quantity)}{' '}
          {line.quantity > 1 ? (
            <span className={styles.unitPrice}>({formatPrice(line.priceCents)} cada)</span>
          ) : null}
        </p>
      </div>

      <QuantityStepper
        quantity={line.quantity}
        onIncrement={onIncrement}
        onDecrement={onDecrement}
        description={line.name}
      />
    </li>
  )
}
