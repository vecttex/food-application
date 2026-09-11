import { Badge } from '../../../../components/Badge'
import { IconButton } from '../../../../components/IconButton'
import { IconChevron, IconPlus } from '../../../../components/Icon'
import { ItemPhoto } from '../../../../components/ItemPhoto'
import { formatPrice } from '../../../../lib/format'
import type { MenuItem } from '../../types'
import styles from './MenuItemCard.module.css'

type Props = {
  item: MenuItem
  expanded: boolean
  onToggle: () => void
  onAdd: () => void
  cartQuantity: number
}

/**
 * Item do cardápio: foto, nome, descrição, preço, botão de adicionar e a lista
 * de ingredientes que abre ao clicar.
 *
 * Componente controlado — quem decide o que está aberto é a página. Isso é o
 * que permite manter "só um item expandido por vez" sem que os cartões
 * precisem conhecer uns aos outros.
 */
export function MenuItemCard({ item, expanded, onToggle, onAdd, cartQuantity }: Props) {
  const idIngredients = `ingredientes-${item.id}`
  const hasIngredients = item.ingredients.length > 0

  return (
    <article className={`${styles.card} ${cartQuantity > 0 ? styles.inCart : ''}`}>
      <div className={styles.main}>
        <button
          type="button"
          className={styles.trigger}
          onClick={onToggle}
          aria-expanded={hasIngredients ? expanded : undefined}
          aria-controls={hasIngredients ? idIngredients : undefined}
          disabled={!hasIngredients}
        >
          <ItemPhoto url={item.photoUrl} alt="" width="5rem" height="5rem" className={styles.photo} />

          <span className={styles.info}>
            <span className={styles.nameRow}>
              <span className={styles.name}>{item.name}</span>
              {item.tag ? <Badge variant="soft">{item.tag}</Badge> : null}
              {item.bestseller ? <Badge variant="neutral">Mais pedido</Badge> : null}
            </span>
            <span className={`${styles.description} u-lines-2`}>{item.description}</span>

            {hasIngredients ? (
              <span className={styles.seeMore}>
                {expanded ? 'Ocultar ingredientes' : 'Ver ingredientes'}
                <IconChevron
                  width={14}
                  height={14}
                  className={`${styles.chevron} ${expanded ? styles.chevronOpen : ''}`}
                />
              </span>
            ) : null}
          </span>
        </button>

        <div className={styles.side}>
          <span className={styles.price}>{formatPrice(item.priceCents)}</span>
          <div className={styles.addAction}>
            {cartQuantity > 0 ? (
              <span
                className={styles.counter}
                aria-label={`${cartQuantity} no pedido`}
                title={`${cartQuantity} no pedido`}
              >
                {cartQuantity}
              </span>
            ) : null}
            <IconButton
              variant="primary"
              size="md"
              label={`Adicionar ${item.name} ao pedido`}
              onClick={onAdd}
            >
              <IconPlus width={17} height={17} />
            </IconButton>
          </div>
        </div>
      </div>

      {hasIngredients && expanded ? (
        <div id={idIngredients} className={styles.ingredients}>
          <p className={styles.ingredientsTitle}>Ingredientes</p>
          <ul className={styles.ingredientList}>
            {item.ingredients.map((ingredient) => (
              <li key={ingredient} className={styles.ingredient}>
                {ingredient}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  )
}
