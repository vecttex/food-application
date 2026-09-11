import { createClient } from '@supabase/supabase-js'
import { env } from './env'
import type { Database } from './database.types'

/**
 * Cliente único do Supabase.
 *
 * Instância única (e não uma por chamada) porque o supabase-js mantém pool de
 * conexão e sessão internamente; criar vários clientes duplica esse estado.
 *
 * `persistSession: false` e `autoRefreshToken: false`: o app público não faz
 * login — lê o cardápio com a chave publishable, sob as políticas de RLS de
 * leitura anônima. Ligar sessão aqui só criaria escrita inútil no localStorage.
 * Quando existir a área administrativa, ela deve usar seu próprio cliente
 * autenticado, não afrouxar este.
 */
export const supabase = createClient<Database>(env.supabaseUrl, env.supabasePublishableKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})
