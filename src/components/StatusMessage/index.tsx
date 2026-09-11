import type { ReactNode } from 'react'
import { IconAlert } from '../Icon'
import styles from './StatusMessage.module.css'

type Props = {
  type: 'loading' | 'error' | 'empty'
  title: string
  description?: string
  /** Ação de recuperação (ex.: "Tentar de novo"). */
  action?: ReactNode
}

/**
 * Bloco de estado da tela: carregando, erro ou lista vazia.
 *
 * Os três moram no mesmo componente porque ocupam o mesmo lugar do layout e
 * têm a mesma estrutura (ícone, título, descrição, ação opcional). Três
 * componentes quase idênticos divergiriam na primeira mudança de espaçamento.
 *
 * `role="status"` faz o leitor de tela anunciar a mudança sem roubar o foco —
 * importante porque estes blocos aparecem depois da renderização inicial.
 */
export function StatusMessage({ type, title, description, action }: Props) {
  return (
    <div
      className={`${styles.base} ${type === 'error' ? styles.error : ''}`}
      role={type === 'error' ? 'alert' : 'status'}
    >
      {type === 'loading' ? <span className={styles.spinner} aria-hidden="true" /> : null}
      {type === 'error' ? <IconAlert className={styles.icone} width={26} height={26} /> : null}

      <p className={styles.title}>{title}</p>
      {description ? <p className={styles.description}>{description}</p> : null}
      {action}
    </div>
  )
}
