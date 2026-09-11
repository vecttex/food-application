import { useId, type SelectHTMLAttributes } from 'react'
import { IconChevron } from '../Icon'
import styles from './Select.module.css'

export type SelectOption = {
  value: string
  label: string
}

type Props = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id' | 'children'> & {
  label: string
  options: SelectOption[]
  hiddenLabel?: boolean
  error?: string
  placeholder?: string
}

/**
 * Campo de seleção.
 *
 * `<select>` nativo por baixo, com a seta desenhada por cima: no celular isso
 * significa a roleta do sistema, com busca por digitação e acessibilidade
 * prontas. Um dropdown customizado teria mais controle visual e muito mais
 * chance de não funcionar no teclado.
 */
export function Select({ label, options, hiddenLabel, error, placeholder, className, ...props }: Props) {
  const id = useId()
  const errorId = `${id}-erro`

  const classes = [styles.field, error ? styles.hasError : null, className].filter(Boolean).join(' ')

  return (
    <div className={classes}>
      <label htmlFor={id} className={styles.label} hidden={hiddenLabel}>
        {label}
      </label>

      <div className={styles.box}>
        <select
          id={id}
          className={styles.control}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          {...props}
        >
          {placeholder ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <IconChevron className={styles.arrow} width={16} height={16} />
      </div>

      {error ? (
        <span id={errorId} className={styles.error} role="alert">
          {error}
        </span>
      ) : null}
    </div>
  )
}
