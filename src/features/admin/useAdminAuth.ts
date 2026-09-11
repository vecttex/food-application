import { useContext } from 'react'
import { AdminAuthContext, type AdminAuthContextValue } from './AdminAuthContext'

export function useAdminAuth(): AdminAuthContextValue {
  const context = useContext(AdminAuthContext)

  if (!context) {
    throw new Error('useAdminAuth precisa estar dentro de <AdminAuthProvider>.')
  }

  return context
}
