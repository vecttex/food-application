import type { ReactNode } from 'react'
import styles from './Panel.module.css'

export type PanelVariant = 'base' | 'outline' | 'glass' | 'highlight' | 'dashed' | 'subtle'

type Props = {
  children: ReactNode
  /**
   * `base`      superfície padrão dos cartões.
   * `outline`  só o anel de borda, sem preenchimento — para cartões dentro de
   *             uma superfície que já é elevada.
   * `glass`     translúcido com desfoque, para o que flutua sobre foto.
   * `highlight`  fundo da marca em versão suave, para o bloco que puxa o olho.
   * `dashed` bloco informativo leve (tempo de entrega, avisos).
   * `subtle`  encaixe dentro de outro cartão (lista de ingredientes).
   */
  variant?: PanelVariant
  /** Empilha os filhos em coluna com espaçamento padrão. */
  stacked?: boolean
  /** Sobe a elevação no hover — só para painéis clicáveis. */
  interactive?: boolean
  padding?: 'standard' | 'compact' | 'none'
  className?: string
  /** Necessário quando o painel é o alvo de um `aria-controls`. */
  id?: string
}

/**
 * Superfície elevada.
 *
 * Existe para que "caixa com fundo e canto arredondado" tenha uma definição só
 * no projeto. As variantes cobrem os papéis que apareceram de verdade nas
 * telas — quando surgir um sétimo, a pergunta certa é se ele não é um dos seis
 * com outro nome.
 */
export function Panel({
  children,
  variant = 'base',
  stacked,
  interactive,
  padding = 'standard',
  className,
  id,
}: Props) {
  const classes = [
    styles[variant],
    padding !== 'standard' ? styles[padding] : null,
    stacked ? styles.stacked : null,
    interactive ? styles.interactive : null,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div id={id} className={classes}>
      {children}
    </div>
  )
}
