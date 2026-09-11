import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../components/Button'
import { buttonClasses } from '../../components/Button/classes'
import {
  IconEye,
  IconLogOut,
  IconPlus,
  IconSettings,
  IconSparkle,
} from '../../components/Icon'
import { Panel } from '../../components/Panel'
import { Skeleton } from '../../components/Skeleton'
import { StatusMessage } from '../../components/StatusMessage'
import { ThemeToggle } from '../../components/ThemeToggle'
import { listAdminMenuItems } from '../../features/admin/menuAdminService'
import { useAdminAuth } from '../../features/admin/useAdminAuth'
import { OpenStatusBadge } from '../../features/site/components/OpenStatusBadge'
import { useSite } from '../../features/site/useSite'
import { ROUTES } from '../../routes'
import styles from './AdminOverview.module.css'

type Counts = {
  total: number
  available: number
  featured: number
  bestsellers: number
}

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; counts: Counts }

/**
 * Primeira tela do admin.
 *
 * Existe para responder "está tudo certo?" em um olhar: se o restaurante
 * aparece aberto, quantos itens estão no ar, quanta coisa está marcada como
 * destaque e o que ainda falta cadastrar. Sem ela, a área administrativa
 * abriria direto numa lista de itens, que não diz nada sobre o estado do site.
 */
export function AdminOverview() {
  const { config, faq, testimonials, gallery, loading: loadingSite } = useSite()
  const { signOut } = useAdminAuth()
  const navigate = useNavigate()

  const [state, setState] = useState<State>({ status: 'loading' })

  useEffect(() => {
    let active = true

    listAdminMenuItems()
      .then((items) => {
        if (!active) return
        setState({
          status: 'ready',
          counts: {
            total: items.length,
            available: items.filter((item) => item.available).length,
            featured: items.filter((item) => item.featured).length,
            bestsellers: items.filter((item) => item.bestseller).length,
          },
        })
      })
      .catch((error: unknown) => {
        if (!active) return
        setState({
          status: 'error',
          message: error instanceof Error ? error.message : 'Erro ao carregar os itens.',
        })
      })

    return () => {
      active = false
    }
  }, [])

  async function handleSignOut() {
    await signOut()
    navigate(ROUTES.adminLogin)
  }

  const counts = state.status === 'ready' ? state.counts : null
  const sectionsOn = Object.values(config.sections).filter(Boolean).length
  const totalSections = Object.keys(config.sections).length

  const stats = [
    { label: 'Itens no cardápio', value: counts?.total, detail: `${counts?.available ?? 0} disponíveis` },
    { label: 'Em destaque', value: counts?.featured, detail: 'aparecem na Home' },
    { label: 'Mais pedidos', value: counts?.bestsellers, detail: 'aparecem na Home' },
    { label: 'Avaliações', value: testimonials.length, detail: 'publicadas' },
    { label: 'Fotos na galeria', value: gallery.length, detail: 'publicadas' },
    { label: 'Perguntas no FAQ', value: faq.length, detail: 'publicadas' },
  ]

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Visão geral</h1>
          <p className={styles.subtitle}>
            O estado do site agora — e os atalhos para o que muda com mais frequência.
          </p>
        </div>
        <OpenStatusBadge withDetail />
      </header>

      {state.status === 'error' ? (
        <StatusMessage type="error" title="Não deu para carregar os itens" description={state.message} />
      ) : null}

      <section className={styles.stats} aria-label="Números do site">
        {stats.map((stat) => (
          <Panel key={stat.label} padding="compact" className={styles.stat}>
            <span className={styles.statLabel}>{stat.label}</span>
            {stat.value === undefined ? (
              <Skeleton height="2rem" width="3rem" />
            ) : (
              <span className={styles.statValue}>{stat.value}</span>
            )}
            <span className={styles.statDetail}>{stat.detail}</span>
          </Panel>
        ))}
      </section>

      <div className={styles.blocks}>
        <Panel stacked className={styles.block}>
          <h2 className={styles.blockTitle}>Atalhos</h2>
          <div className={styles.shortcuts}>
            <Link to={ROUTES.adminNewItem} className={buttonClasses({ size: 'md' })}>
              <IconPlus width={16} height={16} />
              Novo item
            </Link>
            <Link
              to={ROUTES.adminSettings}
              className={buttonClasses({ variant: 'secondary', size: 'md' })}
            >
              <IconSettings width={16} height={16} />
              Configurações
            </Link>
            <Link to={ROUTES.home} className={buttonClasses({ variant: 'ghost', size: 'md' })}>
              <IconEye width={16} height={16} />
              Ver o site
            </Link>
          </div>
        </Panel>

        <Panel stacked className={styles.block}>
          <h2 className={styles.blockTitle}>Vitrine</h2>
          <p className={styles.blockText}>
            {loadingSite
              ? 'Carregando a configuração…'
              : `${sectionsOn} de ${totalSections} seções estão ligadas na página inicial.`}
          </p>
          <p className={styles.blockText}>
            Tema padrão: <strong>{themeLabel(config.appearance.defaultTheme)}</strong>
            {config.appearance.allowThemeToggle ? ', com botão de troca visível.' : ', sem botão de troca.'}
          </p>
          <Link
            to={ROUTES.adminSettings}
            className={buttonClasses({ variant: 'soft', size: 'sm', pill: true })}
          >
            <IconSparkle width={15} height={15} />
            Ajustar a vitrine
          </Link>
        </Panel>
      </div>

      {/* No desktop estas ações moram na coluna lateral; no celular ela vira
          uma barra de abas e não teria espaço para elas. */}
      <div className={styles.mobileActions}>
        <ThemeToggle />
        <Button variant="ghost" size="sm" onClick={handleSignOut}>
          <IconLogOut width={16} height={16} />
          Sair
        </Button>
      </div>
    </div>
  )
}

function themeLabel(theme: string): string {
  if (theme === 'light') return 'claro'
  if (theme === 'dark') return 'escuro'
  return 'o do sistema'
}
