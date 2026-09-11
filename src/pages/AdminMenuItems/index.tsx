import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '../../components/Badge'
import { buttonClasses } from '../../components/Button/classes'
import { IconButton } from '../../components/IconButton'
import { IconEdit, IconPlus, IconSearch, IconTrash } from '../../components/Icon'
import { ItemPhoto } from '../../components/ItemPhoto'
import { Select } from '../../components/Select'
import { Skeleton } from '../../components/Skeleton'
import { StatusMessage } from '../../components/StatusMessage'
import type { AdminMenuItem, CategoryOption } from '../../features/admin/types'
import {
  deleteMenuItem,
  listAdminMenuItems,
  listCategories,
} from '../../features/admin/menuAdminService'
import { formatPrice } from '../../lib/format'
import { ROUTES, editItemPath } from '../../routes'
import styles from './AdminMenuItems.module.css'

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; items: AdminMenuItem[]; categories: CategoryOption[] }

const SKELETONS = [0, 1, 2, 3, 4]

export function AdminMenuItems() {
  const [state, setState] = useState<State>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [category, setCategory] = useState('')

  // Recarregar acontece aqui, no evento (após excluir), e não dentro do
  // efeito: setState síncrono em efeito provoca renderização em cascata. O
  // estado inicial já é "loading", então a primeira busca não precisa disso.
  const reload = useCallback(() => {
    setState({ status: 'loading' })
    setAttempt((n) => n + 1)
  }, [])

  useEffect(() => {
    let active = true

    Promise.all([listAdminMenuItems(), listCategories()])
      .then(([items, categories]) => {
        if (active) setState({ status: 'ready', items, categories })
      })
      .catch((error: unknown) => {
        if (!active) return
        setState({
          status: 'error',
          message: error instanceof Error ? error.message : 'Erro inesperado ao carregar os itens.',
        })
      })

    return () => {
      active = false
    }
  }, [attempt])

  // Em `useMemo` porque `visible` depende delas: um array literal novo a cada
  // renderização invalidaria a memoização do filtro sem que nada tivesse mudado.
  const items = useMemo(() => (state.status === 'ready' ? state.items : []), [state])
  const categories = useMemo(() => (state.status === 'ready' ? state.categories : []), [state])

  const visible = useMemo(() => {
    const search = searchTerm.trim().toLowerCase()
    return items.filter((item) => {
      const matchesCategory = !category || item.category === category
      const matchesSearch = !search || item.name.toLowerCase().includes(search)
      return matchesCategory && matchesSearch
    })
  }, [items, searchTerm, category])

  async function handleDelete(item: AdminMenuItem) {
    if (!window.confirm(`Excluir "${item.name}"? Essa ação não pode ser desfeita.`)) return

    await deleteMenuItem(item.id, item.photoPath)
    reload()
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Cardápio</h1>
          <p className={styles.subtitle}>
            {state.status === 'ready'
              ? `${items.length} itens cadastrados · ${items.filter((i) => i.available).length} disponíveis`
              : 'Carregando os itens…'}
          </p>
        </div>

        <Link to={ROUTES.adminNewItem} className={buttonClasses({ size: 'md' })}>
          <IconPlus width={16} height={16} />
          Novo item
        </Link>
      </header>

      <div className={styles.filters}>
        <div className={styles.search}>
          <IconSearch className={styles.searchIcon} width={16} height={16} aria-hidden="true" />
          <input
            type="search"
            className={styles.searchField}
            placeholder="Buscar item pelo nome"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            aria-label="Buscar item pelo nome"
          />
        </div>

        <Select
          label="Categoria"
          hiddenLabel
          className={styles.categoryFilter}
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          options={[
            { value: '', label: 'Todas as categorias' },
            ...categories.map((c) => ({ value: c.slug, label: c.label })),
          ]}
        />
      </div>

      {state.status === 'loading' ? (
        <ul className={styles.list} aria-busy="true">
          {SKELETONS.map((index) => (
            <li key={index} className={styles.row}>
              <Skeleton height="3.25rem" width="3.25rem" radius="var(--radius-md)" />
              <div className={styles.skeletonText}>
                <Skeleton height="1rem" width="45%" />
                <Skeleton height="0.8rem" width="25%" />
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {state.status === 'error' ? (
        <StatusMessage type="error" title="Não deu para carregar os itens" description={state.message} />
      ) : null}

      {state.status === 'ready' && items.length === 0 ? (
        <StatusMessage
          type="empty"
          title="Nenhum item cadastrado ainda"
          description="Comece criando o primeiro lanche do cardápio."
          action={
            <Link to={ROUTES.adminNewItem} className={buttonClasses({ size: 'md' })}>
              Criar item
            </Link>
          }
        />
      ) : null}

      {state.status === 'ready' && items.length > 0 && visible.length === 0 ? (
        <StatusMessage type="empty" title="Nenhum item com esses filtros" />
      ) : null}

      {visible.length > 0 ? (
        <ul className={styles.list}>
          {visible.map((item) => {
            const itemCategory = categories.find((option) => option.slug === item.category)
            return (
              <li key={item.id} className={styles.row}>
                <ItemPhoto url={item.photoUrl} alt="" width="3.25rem" height="3.25rem" />

                <div className={styles.info}>
                  <Link to={editItemPath(item.id)} className={styles.name}>
                    {item.name}
                  </Link>
                  <span className={styles.category}>
                    {itemCategory?.label ?? item.category}
                  </span>
                </div>

                <div className={styles.badges}>
                  {item.featured ? <Badge variant="soft">Destaque</Badge> : null}
                  {item.bestseller ? <Badge variant="neutral">Mais pedido</Badge> : null}
                  <Badge variant={item.available ? 'success' : 'error'}>
                    {item.available ? 'Disponível' : 'Indisponível'}
                  </Badge>
                </div>

                <span className={styles.price}>{formatPrice(item.priceCents)}</span>

                <div className={styles.actions}>
                  <Link
                    to={editItemPath(item.id)}
                    className={styles.editButton}
                    aria-label={`Editar ${item.name}`}
                  >
                    <IconEdit width={16} height={16} />
                  </Link>
                  <IconButton
                    label={`Excluir ${item.name}`}
                    variant="ghost"
                    onClick={() => handleDelete(item)}
                  >
                    <IconTrash width={16} height={16} />
                  </IconButton>
                </div>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
