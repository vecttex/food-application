import styles from './Avatar.module.css'

type Props = {
  name: string
  size?: 'sm' | 'md'
}

/** Duas iniciais no máximo — "Ana Paula Souza" vira "AS", não "APS". */
function iniciais(name: string): string {
  const partes = name.trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return '?'
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
}

/**
 * Círculo com as iniciais de quem escreveu o depoimento.
 *
 * Sem foto de propósito: o cliente que avalia não manda retrato, e um ícone
 * genérico de pessoa repetido cinco vezes só polui. `aria-hidden` porque o
 * nome aparece por escrito ao lado.
 */
export function Avatar({ name, size = 'md' }: Props) {
  return (
    <span className={`${styles.base} ${styles[size]}`} aria-hidden="true">
      {iniciais(name)}
    </span>
  )
}
