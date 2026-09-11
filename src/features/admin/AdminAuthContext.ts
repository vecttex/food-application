import { createContext } from 'react'
import type { Session } from '@supabase/supabase-js'

export type AdminAuthContextValue = {
  loading: boolean
  session: Session | null
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

export const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined)
