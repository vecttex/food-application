import { createClient, type Session } from '@supabase/supabase-js'
import { env } from '../../lib/env'
import type { Database } from '../../lib/database.types'

/**
 * Cliente Supabase separado do público (`src/lib/supabase.ts`).
 *
 * Mesma URL/chave, mas com sessão persistida e renovada automaticamente — o
 * admin precisa continuar logado entre reloads. `storageKey` próprio evita
 * colidir com qualquer coisa do client público (que hoje não guarda nada).
 * É este client, autenticado, que carrega o papel `authenticated` nas
 * policies de RLS — por isso é o único usado para escritas (itens, fotos,
 * configuração do site).
 */
export const adminSupabase = createClient<Database>(env.supabaseUrl, env.supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'brasa-nove-admin-auth',
  },
})

export async function signIn(email: string, password: string): Promise<Session> {
  const { data, error } = await adminSupabase.auth.signInWithPassword({ email, password })
  if (error || !data.session) {
    throw new Error('E-mail ou senha inválidos.')
  }

  const { data: isAdmin, error: adminError } = await adminSupabase.rpc('is_admin')
  if (adminError || !isAdmin) {
    await adminSupabase.auth.signOut()
    throw new Error('Este usuário não tem permissão de administrador.')
  }

  return data.session
}

export async function signOut(): Promise<void> {
  await adminSupabase.auth.signOut()
}

export async function getSession(): Promise<Session | null> {
  const { data } = await adminSupabase.auth.getSession()
  return data.session
}

/** Wrapper de `onAuthStateChange` — devolve a função de unsubscribe. */
export function onAuthChange(callback: (session: Session | null) => void): () => void {
  const {
    data: { subscription },
  } = adminSupabase.auth.onAuthStateChange((_event, session) => callback(session))

  return () => subscription.unsubscribe()
}
