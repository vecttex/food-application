import { IconStar } from '../Icon'
import styles from './Rating.module.css'

type Props = {
  /** Nota de 1 a 5. */
  value: number
  size?: number
  /** Texto ao lado (ex.: "4,8" ou "12 avaliações"). */
  caption?: string
}

const ESTRELAS = [1, 2, 3, 4, 5]

/**
 * Nota em estrelas.
 *
 * As estrelas são decorativas (`aria-hidden`) e a nota vai por escrito no
 * `aria-label` do container: cinco elementos anunciados um a um viram "estrela
 * estrela estrela…" no leitor de tela, que não é informação nenhuma.
 */
export function Rating({ value, size = 14, caption }: Props) {
  const nota = Math.max(0, Math.min(5, Math.round(value)))

  return (
    <span className={styles.base} role="img" aria-label={`Nota ${nota} de 5`}>
      <span className={styles.stars} aria-hidden="true">
        {ESTRELAS.map((estrela) => (
          <IconStar
            key={estrela}
            width={size}
            height={size}
            className={estrela <= nota ? styles.filled : styles.empty}
          />
        ))}
      </span>
      {caption ? <span className={styles.caption}>{caption}</span> : null}
    </span>
  )
}
