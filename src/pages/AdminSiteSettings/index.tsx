import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '../../components/Button'
import { StatusMessage } from '../../components/StatusMessage'
import { Tabs, type TabOption } from '../../components/Tabs'
import {
  getSiteConfig,
  listAdminFaq,
  listAdminGallery,
  listAdminTestimonials,
  listOpeningHours,
  saveOpeningHours,
  saveSiteConfig,
} from '../../features/admin/siteConfigService'
import { useSite } from '../../features/site/useSite'
import type {
  FaqItem,
  GalleryPhoto,
  OpeningHour,
  SiteConfig,
  Testimonial,
} from '../../features/site/types'
import { AppearanceTab } from './tabs/AppearanceTab'
import { ContentTab } from './tabs/ContentTab'
import { OperationTab } from './tabs/OperationTab'
import { ProfileTab } from './tabs/ProfileTab'
import styles from './Settings.module.css'

const TABS_ID = 'configuracoes'
const TAB_PARAM = 'aba'

type TabId = 'profile' | 'operation' | 'appearance' | 'content'

const TABS: TabOption<TabId>[] = [
  { value: 'profile', label: 'Perfil' },
  { value: 'operation', label: 'Operação' },
  { value: 'appearance', label: 'Aparência' },
  { value: 'content', label: 'Conteúdo' },
]

type Data = {
  config: SiteConfig
  hours: OpeningHour[]
  faq: FaqItem[]
  testimonials: Testimonial[]
  gallery: GalleryPhoto[]
}

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: Data }

function isTabId(value: string | null): value is TabId {
  return TABS.some((tab) => tab.value === value)
}

/**
 * Configurações do site.
 *
 * Tudo que a vitrine mostra é editado aqui: identidade, contato, operação,
 * aparência e conteúdo. Foi uma decisão explícita concentrar em uma tela só, em
 * vez de espalhar cada assunto pela área onde ele aparece — quem administra
 * precisa saber onde procurar, e "está nas configurações" é a resposta que não
 * exige memória.
 *
 * O rascunho vive em estado local e só vai para o banco no botão do rodapé.
 * Salvar a cada tecla digitada geraria dezenas de escritas por edição e faria a
 * vitrine piscar a cada letra.
 */
export function AdminSiteSettings() {
  const [state, setState] = useState<State>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [dirty, setDirty] = useState(false)

  const [params, setParams] = useSearchParams()
  const tabFromUrl = params.get(TAB_PARAM)
  const activeTab: TabId = isTabId(tabFromUrl) ? tabFromUrl : 'profile'

  // A vitrine inteira lê a configuração pelo `SiteProvider`; recarregá-lo é o
  // que faz o nome novo aparecer no cabeçalho sem precisar de F5.
  const { reload: reloadSite } = useSite()

  const reload = useCallback(() => {
    setAttempt((n) => n + 1)
    reloadSite()
  }, [reloadSite])

  useEffect(() => {
    let active = true

    Promise.all([
      getSiteConfig(),
      listOpeningHours(),
      listAdminFaq(),
      listAdminTestimonials(),
      listAdminGallery(),
    ])
      .then(([config, hours, faq, testimonials, gallery]) => {
        if (!active) return
        setState({ status: 'ready', data: { config, hours, faq, testimonials, gallery } })
        setDirty(false)
      })
      .catch((error: unknown) => {
        if (!active) return
        setState({
          status: 'error',
          message: error instanceof Error ? error.message : 'Erro ao carregar as configurações.',
        })
      })

    return () => {
      active = false
    }
  }, [attempt])

  function patch<K extends keyof SiteConfig>(group: K, values: Partial<SiteConfig[K]>) {
    setState((current) => {
      if (current.status !== 'ready') return current
      return {
        ...current,
        data: {
          ...current.data,
          config: {
            ...current.data.config,
            [group]: { ...current.data.config[group], ...values },
          },
        },
      }
    })
    setDirty(true)
    setSaved(false)
  }

  function updateHours(hours: OpeningHour[]) {
    setState((current) =>
      current.status === 'ready' ? { ...current, data: { ...current.data, hours } } : current,
    )
    setDirty(true)
    setSaved(false)
  }

  async function save() {
    if (state.status !== 'ready') return

    setSaving(true)
    setSaveError(null)

    try {
      await saveSiteConfig(state.data.config)
      await saveOpeningHours(state.data.hours)
      setDirty(false)
      setSaved(true)
      reloadSite()
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Não foi possível salvar.')
    } finally {
      setSaving(false)
    }
  }

  if (state.status === 'loading') {
    return <StatusMessage type="loading" title="Carregando as configurações…" />
  }

  if (state.status === 'error') {
    return (
      <StatusMessage
        type="error"
        title="Não deu para carregar as configurações"
        description={state.message}
        action={
          <Button variant="ghost" size="sm" onClick={() => setAttempt((n) => n + 1)}>
            Tentar de novo
          </Button>
        }
      />
    )
  }

  const { data } = state

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Configurações</h1>
          <p className={styles.subtitle}>
            Tudo que aparece no site do cliente é definido aqui — inclusive quais seções existem na
            página inicial.
          </p>
        </div>
      </header>

      <div className={styles.tabs}>
        <Tabs
          options={TABS}
          value={activeTab}
          onSelect={(tab) => setParams({ [TAB_PARAM]: tab }, { replace: true })}
          label="Seções das configurações"
          idPrefix={TABS_ID}
        />
      </div>

      <div
        className={styles.content}
        role="tabpanel"
        id={`${TABS_ID}-painel-${activeTab}`}
        aria-labelledby={`${TABS_ID}-aba-${activeTab}`}
      >
        {activeTab === 'profile' ? (
          <ProfileTab config={data.config} patch={patch} onPhotoSaved={reload} />
        ) : null}

        {activeTab === 'operation' ? (
          <OperationTab
            config={data.config}
            patch={patch}
            hours={data.hours}
            onHoursChange={updateHours}
          />
        ) : null}

        {activeTab === 'appearance' ? <AppearanceTab config={data.config} patch={patch} /> : null}

        {activeTab === 'content' ? (
          <ContentTab
            key={attempt}
            faq={data.faq}
            testimonials={data.testimonials}
            gallery={data.gallery}
            onReload={reload}
          />
        ) : null}
      </div>

      {/* A aba de conteúdo salva item a item; a barra continua visível para não
          fazer o rodapé aparecer e sumir a cada troca de aba. */}
      <div className={styles.saveBar}>
        <p className={styles.barText} role="status">
          {saveError ? (
            <span className={styles.error}>{saveError}</span>
          ) : dirty ? (
            'Você tem alterações não salvas.'
          ) : saved ? (
            <span className={styles.saved}>Configurações salvas.</span>
          ) : (
            'Nenhuma alteração pendente.'
          )}
        </p>

        <Button size="lg" onClick={save} disabled={saving || !dirty}>
          {saving ? 'Salvando…' : 'Salvar alterações'}
        </Button>
      </div>
    </div>
  )
}
