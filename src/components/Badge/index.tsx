import type { ReactNode } from 'react'
import styles from './Badge.module.css'

export type BadgeVariant = 'solid' | 'soft' | 'neutral' | 'outline' | 'success' | 'error'

type Props = {
  children: ReactNode
  variant?: BadgeVariant
  /** Marcador circular à esquerda, usado nos selos de status. */
  withDot?: boolean
  /** Ícone pequeno à esquerda, no lugar do ponto. */
  icon?: ReactNode
  className?: string
}

/** Selo curto de status ou classificação ("Aberto agora", "veggie", "combo"). */
export function Badge({ children, variant = 'soft', withDot, icon, className }: Props) {
  return (
    <span className={[styles.base, styles[variant], className].filter(Boolean).join(' ')}>
      {withDot ? <span className={styles.dot} aria-hidden="true" /> : null}
      {icon ? (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      ) : null}
      {children}
    </span>
  )
}
