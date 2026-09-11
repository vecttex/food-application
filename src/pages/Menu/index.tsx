import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button } from '../../components/Button'
import { buttonClasses } from '../../components/Button/classes'
import { IconClose, IconSearch } from '../../components/Icon'
import { Skeleton } from '../../components/Skeleton'
import { StatusMessage } from '../../components/StatusMessage'
import { Tabs, type TabOption } from '../../components/Tabs'
import { MenuItemCard } from '../../features/menu/components/MenuItemCard'
import { useMenu } from '../../features/menu/useMenu'
import { allItems } from '../../features/menu/menuService'
import type { MenuItem } from '../../features/menu/types'
import { useCart } from '../../features/cart/useCart'
import { useSite } from '../../features/site/useSite'
import { formatItemCount, formatPrice } from '../../lib/format'
import { ROUTES } from '../../routes'
import styles from './Menu.module.css'

const TABS_ID = 'cardapio'
const CATEGORY_PARAM = 'categoria'
const SKELETONS = [0, 1, 2, 3]

/** Busca sem acento e sem caixa: "acai" acha "Açaí". */
function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function matches(item: MenuItem, term: string): boolean {
  const haystack = normalize(
    [item.name, item.description, item.tag ?? '', item.ingredients.join(' ')].join(' '),
  )
  return normalize(term)
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word))
}

type ListProps = {
  items: MenuItem[]
  panelProps?: { id: string; labelledBy: string }
}

function ItemList({ items, panelProps }: ListProps) {
  // Um item expandido por vez. O estado vive aqui, e não em cada cartão,
  // porque a regra é sobre o conjunto — não sobre o item.
  const [expandedItem, setExpandedItem] = useState<string | null>(null)
  const { add, lines } = useCart()

  return (
    <div
      className={styles.list}
      role={panelProps ? 'tabpanel' : undefined}
      id={panelProps?.id}
      aria-labelledby={panelProps?.labelledBy}
    >
      {items.map((item) => (
        <MenuItemCard
          key={item.id}
          item={item}
          expanded={expandedItem === item.id}
          onToggle={() => setExpandedItem((current) => (current === item.id ? null : item.id))}
          onAdd={() => add(item)}
          cartQuantity={lines.find((line) => line.id === item.id)?.quantity ?? 0}
        />
      ))}
    </div>
  )
}

export function Menu() {
  const state = useMenu()
  const { totalQuantity, totalCents, empty } = useCart()
  const { config } = useSite()

  const [searchTerm, setSearchTerm] = useState('')

  // A categoria ativa mora na URL: `/cardapio?categoria=bebida` pode ser
  // compartilhado, sobrevive ao refresh e o voltar do navegador funciona.
  const [params, setParams] = useSearchParams()

  const menu = state.status === 'ready' ? state.menu : null
  const categories = menu?.categories ?? []

  // Sem `useMemo`: são poucas categorias e o mapeamento é trivial. Memorizar
  // aqui custaria mais em complexidade do que economizaria em renderização.
  const options: TabOption<string>[] = categories.map((category) => ({
    value: category.slug,
    label: category.label,
  }))

  // Slug inválido ou ausente cai na primeira categoria em vez de mostrar tela
  // vazia — a URL é entrada do usuário e não dá para confiar nela.
  const slugFromUrl = params.get(CATEGORY_PARAM)
  const activeCategory = categories.find((c) => c.slug === slugFromUrl) ?? categories[0]

  const isSearching = searchTerm.trim().length > 0
  const results = useMemo(
    () => (menu && isSearching ? allItems(menu).filter((item) => matches(item, searchTerm)) : []),
    [menu, searchTerm, isSearching],
  )

  function selectCategory(slug: string) {
    // `replace` evita empilhar uma entrada de histórico por clique de aba —
    // senão o voltar percorreria cada troca antes de sair da tela.
    setParams({ [CATEGORY_PARAM]: slug }, { replace: true })
  }

  const totalItems = menu ? allItems(menu).length : 0

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>Cardápio</h1>
          {totalItems > 0 ? (
            <p className={styles.subtitle}>
              {formatItemCount(totalItems)} disponíveis · toque para ver os ingredientes
            </p>
          ) : null}
        </div>

        {config.sections.menuSearch ? (
          <div className={styles.search}>
            <IconSearch className={styles.searchIcon} width={17} height={17} aria-hidden="true" />
            <input
              type="search"
              className={styles.searchField}
              placeholder="Buscar por nome ou ingrediente"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              aria-label="Buscar no cardápio"
            />
            {isSearching ? (
              <button
                type="button"
                className={styles.searchClear}
                onClick={() => setSearchTerm('')}
                aria-label="Limpar busca"
              >
                <IconClose width={15} height={15} />
              </button>
            ) : null}
          </div>
        ) : null}
      </header>

      {state.status === 'loading' ? (
        <div className={styles.list} aria-busy="true">
          {SKELETONS.map((index) => (
            <div key={index} className={styles.skeleton}>
              <Skeleton height="5rem" width="5rem" radius="var(--radius-lg)" />
              <div className={styles.skeletonText}>
                <Skeleton height="1.1rem" width="55%" />
                <Skeleton height="0.85rem" width="85%" />
                <Skeleton height="0.85rem" width="40%" />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {state.status === 'error' ? (
        <StatusMessage
          type="error"
          title="Não deu para carregar o cardápio"
          description={state.message}
          action={
            <Button variant="ghost" size="sm" onClick={state.reload}>
              Tentar de novo
            </Button>
          }
        />
      ) : null}

      {state.status === 'ready' && !activeCategory ? (
        <StatusMessage
          type="empty"
          title="Nenhum item disponível"
          description="O cardápio está sem itens marcados como disponíveis no momento."
        />
      ) : null}

      {isSearching && menu ? (
        <>
          <p className={styles.result} role="status">
            {results.length === 0
              ? `Nada encontrado para “${searchTerm}”.`
              : `${formatItemCount(results.length)} para “${searchTerm}”.`}
          </p>
          <ItemList items={results} />
        </>
      ) : null}

      {!isSearching && activeCategory ? (
        <>
          <div className={styles.tabs}>
            <Tabs
              options={options}
              value={activeCategory.slug}
              onSelect={selectCategory}
              label="Categorias do cardápio"
              idPrefix={TABS_ID}
            />
          </div>

          {/* `key` reinicia o item expandido ao trocar de categoria. */}
          <ItemList
            key={activeCategory.slug}
            items={activeCategory.items}
            panelProps={{
              id: `${TABS_ID}-painel-${activeCategory.slug}`,
              labelledBy: `${TABS_ID}-aba-${activeCategory.slug}`,
            }}
          />
        </>
      ) : null}

      {empty ? null : (
        <div className={styles.orderBar}>
          <Link
            to={ROUTES.order}
            className={buttonClasses({ size: 'lg', fullWidth: true, spaceBetween: true })}
          >
            <span>Ver pedido</span>
            <span>
              {formatItemCount(totalQuantity)} · {formatPrice(totalCents)}
            </span>
          </Link>
        </div>
      )}
    </div>
  )
}
