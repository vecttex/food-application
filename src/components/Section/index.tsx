import type { ReactNode } from 'react'
import styles from './Section.module.css'

type Props = {
  title: string
  description?: string
  /** Selo curto à esquerda do título (ex.: "Destaques"). */
  eyebrow?: string
  /** Link ou botão alinhado à direita do cabeçalho. */
  action?: ReactNode
  children: ReactNode
  /** Fundo alternado, para separar seções vizinhas sem desenhar linha. */
  tone?: 'standard' | 'alternate'
  /** Deixa o bloco ocupar a largura total (carrossel encostando na borda). */
  bleed?: boolean
  id?: string
  className?: string
}

/**
 * Bloco de seção da página: cabeçalho padronizado + conteúdo.
 *
 * Existe para que "título de seção" tenha uma definição só. Sem isso, cada
 * página inventa sua hierarquia e a Home vira uma colcha de retalhos — que é
 * exatamente o que acontece quando se acrescenta seção por seção ao longo do
 * tempo.
 *
 * Renderiza `<section>` com `aria-labelledby`: cada bloco vira um marco de
 * navegação de verdade para quem usa leitor de tela.
 */
export function Section({
  title,
  description,
  eyebrow,
  action,
  children,
  tone = 'standard',
  bleed,
  id,
  className,
}: Props) {
  const tituloId = `secao-${id ?? title.toLowerCase().replace(/\s+/g, '-')}`

  const classes = [styles.section, tone === 'alternate' ? styles.alternate : null, className]
    .filter(Boolean)
    .join(' ')

  return (
    <section id={id} className={classes} aria-labelledby={tituloId}>
      <div className={styles.header}>
        <div className={styles.textGroup}>
          {eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}
          <h2 id={tituloId} className={styles.title}>
            {title}
          </h2>
          {description ? <p className={styles.description}>{description}</p> : null}
        </div>
        {action ? <div className={styles.action}>{action}</div> : null}
      </div>

      <div className={bleed ? styles.contentWide : styles.content}>{children}</div>
    </section>
  )
}
