import styles from './Skeleton.module.css'

type Props = {
  /** Altura da barra. Aceita qualquer unidade CSS. */
  height?: string
  width?: string
  radius?: string
  className?: string
}

/**
 * Placeholder de carregamento.
 *
 * Vale mais que um spinner nas listas: mantém a altura que o conteúdo real vai
 * ocupar, então a página não dá o pulo de layout no momento em que os dados
 * chegam. `aria-hidden` porque quem anuncia o carregamento é o `StatusMessage`
 * ou o `aria-busy` do container — repetir isso em doze retângulos só produziria
 * ruído no leitor de tela.
 */
export function Skeleton({ height = '1rem', width = '100%', radius, className }: Props) {
  return (
    <span
      aria-hidden="true"
      className={[styles.base, className].filter(Boolean).join(' ')}
      style={{ height, width, borderRadius: radius }}
    />
  )
}
