import styles from './Button.module.css'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'soft' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export type ButtonVisualProps = {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Ocupa toda a largura do container — o padrão nas telas mobile. */
  fullWidth?: boolean
  /** Bordas totalmente arredondadas (usado na navegação do desktop). */
  pill?: boolean
  /** Empurra o conteúdo para as pontas, como no CTA "Ver pedido · R$ 80,00". */
  spaceBetween?: boolean
}

/**
 * Monta as classes de um botão sem renderizar elemento nenhum.
 *
 * Fica em arquivo próprio por duas razões: mantém o Fast Refresh funcionando
 * (o módulo de componentes só exporta componentes) e permite que o `<Link>` do
 * react-router tenha aparência de botão sem que a camada de UI precise
 * importar o router. Assim não existe uma segunda definição de "botão".
 */
export function buttonClasses(
  { variant = 'primary', size = 'md', fullWidth, pill, spaceBetween }: ButtonVisualProps,
  externalClass?: string,
): string {
  return [
    styles.base,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : null,
    pill ? styles.pill : null,
    spaceBetween ? styles.spaceBetween : null,
    externalClass,
  ]
    .filter(Boolean)
    .join(' ')
}
