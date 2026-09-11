import { useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { LinkButton } from '../../components/Button'
import { IconBag, IconHome, IconInstagram, IconMenu, IconWhatsApp } from '../../components/Icon'
import { ThemeToggle } from '../../components/ThemeToggle'
import { useCart } from '../../features/cart/useCart'
import { buildContactLink } from '../../features/order/whatsappMessage'
import { OpenStatusBadge } from '../../features/site/components/OpenStatusBadge'
import { formatWeeklyHours } from '../../features/site/openingHours'
import { useSite } from '../../features/site/useSite'
import { HOME_SECTIONS, ROUTES } from '../../routes'
import styles from './AppShell.module.css'

type NavItem = {
  to: string
  label: string
  icon: typeof IconHome
}

const NAV_ITEMS: NavItem[] = [
  { to: ROUTES.home, label: 'Início', icon: IconHome },
  { to: ROUTES.menu, label: 'Cardápio', icon: IconMenu },
]

function linkClasses(base: string, active: string) {
  return ({ isActive }: { isActive: boolean }) => (isActive ? `${base} ${active}` : base)
}

/**
 * O navegador restaura a rolagem entre páginas; um SPA não troca de documento,
 * então quem sai do fim do cardápio e clica em "Início" cairia no meio da Home.
 * Este efeito devolve o comportamento esperado: topo a cada rota nova, e a
 * seção certa quando o link traz âncora (`/#faq`, vindo do rodapé).
 */
function useScrollNavigation() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0 })
      return
    }

    // A seção pode ainda não existir no primeiro quadro (dados em carga); um
    // quadro de espera cobre o caso comum sem inventar um observador de DOM.
    const id = window.requestAnimationFrame(() => {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' })
    })

    return () => window.cancelAnimationFrame(id)
  }, [pathname, hash])
}

/**
 * Casca com a navegação, o rodapé e o `<Outlet>` das páginas.
 *
 * Uma única árvore para os dois formatos: a barra superior e a barra inferior
 * convivem no DOM e o CSS decide qual aparece. Renderizar layouts diferentes
 * por breakpoint em JavaScript custaria duas cópias da navegação para manter em
 * sincronia — e um flash de layout errado antes do JS medir a tela.
 *
 * A barra superior existe nos dois tamanhos, com conteúdos diferentes: no
 * celular ela carrega marca, status e tema (que não cabem na barra inferior);
 * no desktop, a navegação inteira.
 */
export function AppShell() {
  useScrollNavigation()

  const { totalQuantity } = useCart()
  const { config, hours } = useSite()
  const hasItems = totalQuantity > 0

  const { identity, contact, operation, appearance, sections } = config
  const linhasHorario = formatWeeklyHours(hours)

  return (
    <div className={styles.shell}>
      {operation.notice ? (
        <p className={styles.notice} role="status">
          {operation.notice}
        </p>
      ) : null}

      <header className={styles.topBar}>
        <div className={styles.topBarInner}>
          <NavLink to={ROUTES.home} className={styles.brand}>
            {identity.logoUrl ? (
              <img src={identity.logoUrl} alt="" className={styles.logo} />
            ) : null}
            <span className={styles.brandName}>{identity.name}</span>
          </NavLink>

          <nav className={styles.nav} aria-label="Navegação principal">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === ROUTES.home}
                className={linkClasses(styles.linkNavegacao, styles.linkNavegacaoAtivo)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className={styles.actions}>
            <span className={styles.statusDesktop}>
              <OpenStatusBadge />
            </span>

            {appearance.allowThemeToggle ? <ThemeToggle /> : null}

            {hasItems ? (
              <NavLink to={ROUTES.order} className={styles.orderShortcut}>
                <IconBag width={16} height={16} />
                <span>{totalQuantity}</span>
                <span className="u-sr-only">itens no pedido</span>
              </NavLink>
            ) : null}

            {contact.whatsappNumber ? (
              <LinkButton
                href={buildContactLink(config)}
                size="sm"
                pill
                className={styles.whatsappButton}
              >
                <IconWhatsApp width={16} height={16} />
                WhatsApp
              </LinkButton>
            ) : null}
          </div>
        </div>
      </header>

      <main className={styles.content}>
        <Outlet />
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <span className={styles.footerName}>{identity.name}</span>
            {identity.tagline ? <p className={styles.footerText}>{identity.tagline}</p> : null}
            <OpenStatusBadge withDetail />
          </div>

          {sections.hours && linhasHorario.length > 0 ? (
            <div className={styles.footerColumn}>
              <h2 className={styles.footerTitle}>Funcionamento</h2>
              <ul className={styles.footerList}>
                {linhasHorario.map((linha) => (
                  <li key={linha}>{linha}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className={styles.footerColumn}>
            <h2 className={styles.footerTitle}>Navegar</h2>
            <ul className={styles.footerList}>
              <li>
                <NavLink to={ROUTES.menu} className={styles.footerLink}>
                  Cardápio completo
                </NavLink>
              </li>
              {sections.faq ? (
                <li>
                  <NavLink to={`${ROUTES.home}#${HOME_SECTIONS.faq}`} className={styles.footerLink}>
                    Perguntas frequentes
                  </NavLink>
                </li>
              ) : null}
              {sections.contact ? (
                <li>
                  <NavLink
                    to={`${ROUTES.home}#${HOME_SECTIONS.contact}`}
                    className={styles.footerLink}
                  >
                    Contato e endereço
                  </NavLink>
                </li>
              ) : null}
            </ul>
          </div>

          <div className={styles.footerColumn}>
            <h2 className={styles.footerTitle}>Falar com a gente</h2>
            <ul className={styles.footerList}>
              {contact.phone ? <li>{contact.phone}</li> : null}
              {contact.whatsappDisplay ? (
                <li>
                  <a
                    href={buildContactLink(config)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.footerLink}
                  >
                    <IconWhatsApp width={14} height={14} />
                    {contact.whatsappDisplay}
                  </a>
                </li>
              ) : null}
              {contact.instagramUrl ? (
                <li>
                  <a
                    href={contact.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.footerLink}
                  >
                    <IconInstagram width={14} height={14} />
                    Instagram
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
        </div>

        <p className={styles.footerBottom}>
          © {new Date().getFullYear()} {identity.name}
          {contact.addressCity ? ` · ${contact.addressCity}` : ''}
        </p>
      </footer>

      <nav className={styles.bottomBar} aria-label="Navegação principal">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === ROUTES.home}
            className={linkClasses(styles.bottomTab, styles.bottomTabActive)}
          >
            <item.icon />
            {item.label}
          </NavLink>
        ))}

        <NavLink
          to={ROUTES.order}
          className={linkClasses(styles.bottomTab, styles.bottomTabActive)}
        >
          <span className={styles.tabIcon}>
            <IconBag />
            {hasItems ? (
              <span className={styles.counter} aria-hidden="true">
                {totalQuantity}
              </span>
            ) : null}
          </span>
          Pedido
        </NavLink>
      </nav>
    </div>
  )
}
