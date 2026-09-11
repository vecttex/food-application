/**
 * Formatação de valores para exibição.
 *
 * Preço trafega e é calculado sempre em centavos (inteiro). Real com ponto
 * flutuante acumula erro de arredondamento na soma do carrinho — o tipo
 * `integer` da coluna `price_cents` já reflete essa decisão no banco.
 */

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

/**
 * Espaço não separável (U+00A0) e espaço estreito não separável (U+202F): os
 * dois caracteres que o ICU já usou entre "R$" e o número, conforme a versão.
 * Escritos por escape para não deixar caractere invisível no código-fonte.
 */
const NON_BREAKING_SPACES = /[\u00a0\u202f]/g

export function formatPrice(cents: number): string {
  // O caractere exato varia entre versões de Node e de navegador. Normalizar
  // para espaço comum deixa a saída idêntica em todo lugar — inclusive no texto
  // que vai para o WhatsApp, onde um invisível diferente já causou confusão.
  return currencyFormatter.format(cents / 100).replace(NON_BREAKING_SPACES, ' ')
}

export function formatItemCount(quantity: number): string {
  return quantity === 1 ? '1 item' : `${quantity} itens`
}

/** Formata centavos como string decimal para um `<input type="number">`. */
export function centsToReaisInput(cents: number): string {
  return (cents / 100).toFixed(2)
}

/**
 * `<input type="number">` sempre usa ponto como separador decimal,
 * independente do locale — por isso `parseFloat` direto, sem troca de vírgula.
 */
export function reaisInputToCents(reais: string): number {
  const value = Number.parseFloat(reais)
  return Math.round((Number.isFinite(value) ? value : 0) * 100)
}
