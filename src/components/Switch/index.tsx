import { useId } from 'react'
import styles from './Switch.module.css'

type Props = {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description?: string
  disabled?: boolean
}

/**
 * Interruptor de ligar/desligar.
 *
 * É um `<input type="checkbox">` de verdade escondido sob a pastilha, e não uma
 * `<div role="switch">`: o input nativo já traz foco, tecla de espaço, estado
 * para o leitor de tela e envio em formulário. Reimplementar isso à mão é o
 * caminho mais curto para um controle que o teclado não alcança.
 */
export function Switch({ checked, onChange, label, description, disabled }: Props) {
  const id = useId()
  const descriptionId = `${id}-descricao`

  return (
    <div className={`${styles.row} ${disabled ? styles.disabled : ''}`}>
      <div className={styles.textGroup}>
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
        {description ? (
          <p id={descriptionId} className={styles.description}>
            {description}
          </p>
        ) : null}
      </div>

      <span className={styles.switch}>
        <input
          id={id}
          type="checkbox"
          role="switch"
          className={styles.input}
          checked={checked}
          disabled={disabled}
          aria-describedby={description ? descriptionId : undefined}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span className={styles.track} aria-hidden="true">
          <span className={styles.thumb} />
        </span>
      </span>
    </div>
  )
}
