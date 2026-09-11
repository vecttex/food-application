import type { ReactNode } from 'react'
import styles from './InfoRow.module.css'

type Props = {
  icon: ReactNode
  label: string
  children: ReactNode
}

/** Linha de informação institucional: ícone + rótulo + valor (endereço, horário, telefone). */
export function InfoRow({ icon, label, children }: Props) {
  return (
    <div className={styles.row}>
      <span className={styles.icon} aria-hidden="true">
        {icon}
      </span>
      <div className={styles.content}>
        <div className={styles.label}>{label}</div>
        <div className={styles.value}>{children}</div>
      </div>
    </div>
  )
}
