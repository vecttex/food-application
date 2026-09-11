/**
 * Leitura das variáveis de ambiente.
 *
 * A validação acontece na borda, no import do módulo: se faltar credencial, o
 * app quebra no boot com uma mensagem que diz o que fazer — e não no meio de
 * uma request, com um erro genérico do supabase-js.
 */

function obrigatoria(nome: string, valor: string | undefined): string {
  if (!valor) {
    throw new Error(
      `Variável de ambiente ${nome} não definida. ` +
        'Copie .env.example para .env.local e preencha com as credenciais do projeto Supabase.',
    )
  }
  return valor
}

export const env = {
  supabaseUrl: obrigatoria('VITE_SUPABASE_URL', import.meta.env.VITE_SUPABASE_URL),
  supabasePublishableKey: obrigatoria(
    'VITE_SUPABASE_PUBLISHABLE_KEY',
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  ),
} as const
