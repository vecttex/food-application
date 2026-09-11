import { Outlet } from 'react-router-dom'
import { StatusMessage } from '../../components/StatusMessage'
import { NotFound } from '../../pages/NotFound'
import { useAdminAuth } from './useAdminAuth'

/**
 * Guarda de UX das rotas admin — a policy de RLS (`is_admin()`) é o guarda
 * real. Sem sessão cai em 404 (não em "sem permissão" nem redirect pro
 * login): decisão de produto para não expor que a rota existe.
 */
export function AdminGuard() {
  const { loading, session } = useAdminAuth()

  if (loading) {
    return <StatusMessage type="loading" title="Carregando…" />
  }

  if (!session) {
    return <NotFound />
  }

  return <Outlet />
}
