import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Button } from '../../components/Button'
import {
  IconDashboard,
  IconEye,
  IconList,
  IconLogOut,
  IconSettings,
} from '../../components/Icon'
import { ThemeToggle } from '../../components/ThemeToggle'
import { useAdminAuth } from '../../features/admin/useAdminAuth'
import { useSite } from '../../features/site/useSite'
import { ROUTES } from '../../routes'
import styles from './AdminShell.module.css'

type AdminNavItem = {
  to: string
  label: string
  icon: typeof IconList
  end?: boolean
}

const NAV_ITEMS: AdminNavItem[] = [
  { to: ROUTES.admin, label: 'Visão geral', icon: IconDashboard, end: true },
  { to: ROUTES.adminItems, label: 'Cardápio', icon: IconList },
  { to: ROUTES.adminSettings, label: 'Configurações', icon: IconSettings },
]

function linkClasses({ isActive }: { isActive: boolean }) {
  return isActive ? `${styles.link} ${styles.linkActive}` : styles.link
}

/**
 * Casca própria da área admin — sem carrinho e sem WhatsApp do site público,
 * para deixar claro que é outro contexto.
 *
 * Navegação lateral no desktop e uma barra de abas no celular: a mesma lista de
 * itens renderizada uma vez, com o CSS decidindo a forma. São três destinos, o
 * que dispensa menu sanduíche — o padrão que mais esconde funcionalidade em
 * painel administrativo.
 */
export function AdminShell() {
  const { signOut } = useAdminAuth()
  const { config } = useSite()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate(ROUTES.adminLogin)
  }

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.brandName}>{config.identity.name}</span>
          <span className={styles.brandTag}>Admin</span>
        </div>

        <nav className={styles.nav} aria-label="Navegação do admin">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClasses}>
              <item.icon width={18} height={18} />
              <span className={styles.linkText}>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <ThemeToggle />

          <NavLink to={ROUTES.home} className={styles.linkSecundario}>
            <IconEye width={16} height={16} />
            Ver o site
          </NavLink>

          <Button variant="ghost" size="sm" fullWidth onClick={handleSignOut}>
            <IconLogOut width={16} height={16} />
            Sair
          </Button>
        </div>
      </aside>

      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  )
}
