import { IconButton } from '../IconButton'
import { IconMinus, IconPlus, IconTrash } from '../Icon'
import styles from './QuantityStepper.module.css'

type Props = {
  quantity: number
  onIncrement: () => void
  onDecrement: () => void
  /** Nome do item — entra nos rótulos acessíveis dos botões. */
  description: string
}

/**
 * Controle de quantidade (− valor +).
 *
 * Em quantidade 1 o botão de diminuir vira lixeira: o efeito é remover a linha,
 * e o ícone precisa dizer isso. Um "−" que faz o item sumir é uma surpresa.
 */
export function QuantityStepper({ quantity, onIncrement, onDecrement, description }: Props) {
  const willRemove = quantity <= 1

  return (
    <div className={styles.base}>
      <IconButton
        variant="ghost"
        size="sm"
        label={willRemove ? `Remover ${description} do pedido` : `Diminuir quantidade de ${description}`}
        onClick={onDecrement}
      >
        {willRemove ? <IconTrash width={16} height={16} /> : <IconMinus width={16} height={16} />}
      </IconButton>

      <span className={styles.value} aria-live="polite" aria-label={`Quantidade de ${description}`}>
        {quantity}
      </span>

      <IconButton
        variant="ghost"
        size="sm"
        label={`Aumentar quantidade de ${description}`}
        onClick={onIncrement}
      >
        <IconPlus width={16} height={16} />
      </IconButton>
    </div>
  )
}
