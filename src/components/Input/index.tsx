import { useId, type InputHTMLAttributes } from 'react'
import styles from './Input.module.css'

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & {
  label: string
  /** Esconde o rótulo visualmente sem tirá-lo do leitor de tela. */
  hiddenLabel?: boolean
  error?: string
}

/**
 * Campo de texto com rótulo e mensagem de erro.
 *
 * O `id` é gerado com `useId` e amarrado ao `<label>` internamente: o
 * componente garante a associação, em vez de depender de cada tela lembrar de
 * passar um id único. Por isso `id` é removido das props aceitas — deixar as
 * duas formas conviverem só criaria caminhos divergentes.
 */
export function Input({ label, hiddenLabel, error, className, ...props }: Props) {
  const id = useId()
  const errorId = `${id}-erro`

  const classes = [styles.field, error ? styles.hasError : null, className]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes}>
      <label htmlFor={id} className={styles.label} hidden={hiddenLabel}>
        {label}
      </label>
      <input
        id={id}
        className={styles.control}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...props}
      />
      {error ? (
        <span id={errorId} className={styles.error} role="alert">
          {error}
        </span>
      ) : null}
    </div>
  )
}
