import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { buttonClasses, type ButtonVisualProps } from './classes'

type ButtonProps = ButtonVisualProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }

/**
 * Botão de ação. `type="button"` por padrão: dentro de um `<form>`, o default
 * do HTML é `submit`, e esse é um dos bugs mais comuns e mais silenciosos em
 * formulário React.
 */
export function Button({
  variant,
  size,
  fullWidth,
  pill,
  spaceBetween,
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses({ variant, size, fullWidth, pill, spaceBetween }, className)}
      {...props}
    >
      {children}
    </button>
  )
}

type LinkButtonProps = ButtonVisualProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode }

/**
 * Mesma aparência do Button, mas renderiza `<a>`.
 *
 * Existe porque ir para o WhatsApp é navegação, não ação: um `<a href>` permite
 * abrir em nova aba, copiar o link, e é o que leitores de tela anunciam
 * corretamente. Um `<button onClick={window.open}>` perde tudo isso — e ainda
 * costuma ser bloqueado como popup em navegador mobile.
 */
export function LinkButton({
  variant,
  size,
  fullWidth,
  pill,
  spaceBetween,
  className,
  children,
  target = '_blank',
  rel = 'noopener noreferrer',
  ...props
}: LinkButtonProps) {
  return (
    <a
      target={target}
      rel={rel}
      className={buttonClasses({ variant, size, fullWidth, pill, spaceBetween }, className)}
      {...props}
    >
      {children}
    </a>
  )
}
