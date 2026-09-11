import { useCallback, useEffect, useMemo, useState } from 'react'
import { Outlet } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { AdminAuthContext, type AdminAuthContextValue } from './AdminAuthContext'
import { getSession, onAuthChange, signIn as authSignIn, signOut as authSignOut } from './authService'

/**
 * Escopado só às rotas `/admin/*` (veja `App.tsx`) — evita checar sessão a
 * cada visita ao site público, que nunca precisa disso.
 */
export function AdminAuthProvider() {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    let active = true

    getSession().then((current) => {
      if (active) {
        setSession(current)
        setLoading(false)
      }
    })

    const unsubscribe = onAuthChange((next) => {
      if (active) setSession(next)
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const newSession = await authSignIn(email, password)
    setSession(newSession)
  }, [])

  const signOut = useCallback(async () => {
    await authSignOut()
    setSession(null)
  }, [])

  const value = useMemo<AdminAuthContextValue>(
    () => ({ loading, session, signIn, signOut }),
    [loading, session, signIn, signOut],
  )

  return (
    <AdminAuthContext.Provider value={value}>
      <Outlet />
    </AdminAuthContext.Provider>
  )
}
