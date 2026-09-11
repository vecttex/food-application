import { useId, type TextareaHTMLAttributes } from 'react'
import styles from './Textarea.module.css'

type Props = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> & {
  label: string
  hiddenLabel?: boolean
  error?: string
  /** Contador de caracteres — só aparece quando há `maxLength`. */
  showCount?: boolean
}

/**
 * Campo de texto longo. Mesmo contrato do `Input` (rótulo amarrado por
 * `useId`, erro anunciado por `aria-describedby`) para que trocar um pelo
 * outro no formulário não exija reaprender nada.
 */
export function Textarea({
  label,
  hiddenLabel,
  error,
  showCount,
  className,
  rows = 4,
  maxLength,
  value,
  ...props
}: Props) {
  const id = useId()
  const errorId = `${id}-erro`
  const used = typeof value === 'string' ? value.length : 0

  const classes = [styles.field, error ? styles.hasError : null, className].filter(Boolean).join(' ')

  return (
    <div className={classes}>
      <label htmlFor={id} className={styles.label} hidden={hiddenLabel}>
        {label}
      </label>

      <textarea
        id={id}
        className={styles.control}
        rows={rows}
        maxLength={maxLength}
        value={value}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...props}
      />

      <div className={styles.footer}>
        {error ? (
          <span id={errorId} className={styles.error} role="alert">
            {error}
          </span>
        ) : (
          <span />
        )}
        {showCount && maxLength ? (
          <span className={styles.counter}>
            {used}/{maxLength}
          </span>
        ) : null}
      </div>
    </div>
  )
}
