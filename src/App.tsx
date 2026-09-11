import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from './layout/AppShell'
import { AdminShell } from './layout/AdminShell'
import { ThemeProvider } from './features/theme/ThemeProvider'
import { SiteProvider } from './features/site/SiteProvider'
import { CartProvider } from './features/cart/CartProvider'
import { AddressProvider } from './features/order/AddressProvider'
import { AdminAuthProvider } from './features/admin/AdminAuthProvider'
import { AdminGuard } from './features/admin/AdminGuard'
import { AdminLogin } from './pages/AdminLogin'
import { AdminMenuItemForm } from './pages/AdminMenuItemForm'
import { AdminMenuItems } from './pages/AdminMenuItems'
import { AdminOverview } from './pages/AdminOverview'
import { AdminSiteSettings } from './pages/AdminSiteSettings'
import { Menu } from './pages/Menu'
import { Home } from './pages/Home'
import { NotFound } from './pages/NotFound'
import { Order } from './pages/Order'
import { ROUTES } from './routes'

/**
 * Ordem dos providers, de fora para dentro:
 *
 *   ThemeProvider   não depende de nada e precisa valer para as duas cascas.
 *   SiteProvider    lê o tema padrão do admin, então vem depois do tema.
 *   CartProvider    e AddressProvider são estado do visitante, independentes.
 *
 * `AdminAuthProvider` fica só sob `/admin/*`: o site público nunca precisa
 * checar sessão, e escopá-lo aqui evita essa chamada em toda visita.
 */
export default function App() {
  return (
    <ThemeProvider>
      <SiteProvider>
        <CartProvider>
          <AddressProvider>
            <BrowserRouter>
              <Routes>
                <Route element={<AppShell />}>
                  <Route path={ROUTES.home} element={<Home />} />
                  <Route path={ROUTES.menu} element={<Menu />} />
                  <Route path={ROUTES.order} element={<Order />} />
                  <Route path="*" element={<NotFound />} />
                </Route>

                <Route element={<AdminAuthProvider />}>
                  <Route path={ROUTES.adminLogin} element={<AdminLogin />} />

                  <Route element={<AdminGuard />}>
                    <Route element={<AdminShell />}>
                      <Route path={ROUTES.admin} element={<AdminOverview />} />
                      <Route path={ROUTES.adminItems} element={<AdminMenuItems />} />
                      <Route path={ROUTES.adminNewItem} element={<AdminMenuItemForm />} />
                      <Route path={ROUTES.adminEditItem} element={<AdminMenuItemForm />} />
                      <Route path={ROUTES.adminSettings} element={<AdminSiteSettings />} />
                    </Route>
                  </Route>
                </Route>
              </Routes>
            </BrowserRouter>
          </AddressProvider>
        </CartProvider>
      </SiteProvider>
    </ThemeProvider>
  )
}
