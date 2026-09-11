import type { ButtonHTMLAttributes, ReactNode } from 'react'
import styles from './IconButton.module.css'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Obrigatório: sem texto visível, é a única descrição que o leitor de tela tem. */
  label: string
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md'
  children: ReactNode
}

/**
 * Botão quadrado só com ícone (adicionar, voltar, +/- do carrinho).
 *
 * Separado do `Button` porque a geometria é outra — quadrado, sem padding
 * horizontal, com alvo de toque mínimo — e porque `label` é obrigatório aqui:
 * o tipo impede que alguém entregue um botão mudo para leitores de tela.
 */
export function IconButton({
  label,
  variant = 'secondary',
  size = 'md',
  className,
  children,
  type = 'button',
  ...props
}: Props) {
  const classes = [styles.base, styles[variant], styles[size], className]
    .filter(Boolean)
    .join(' ')

  return (
    <button type={type} className={classes} aria-label={label} title={label} {...props}>
      {children}
    </button>
  )
}
