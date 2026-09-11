import { Link } from 'react-router-dom'
import { Badge } from '../../../../components/Badge'
import { IconButton } from '../../../../components/IconButton'
import { IconPlus } from '../../../../components/Icon'
import { ItemPhoto } from '../../../../components/ItemPhoto'
import { formatPrice } from '../../../../lib/format'
import { ROUTES } from '../../../../routes'
import type { MenuItem } from '../../types'
import styles from './ShowcaseCard.module.css'

type Props = {
  item: MenuItem
  onAdd: () => void
  cartQuantity: number
  /** Selo sobre a foto ("Destaque", "Mais pedido"). */
  highlight?: string
}

/**
 * Cartão de vitrine: foto grande, nome, preço e um botão de adicionar.
 *
 * Diferente do `MenuItemCard`, que é a linha densa do cardápio — aqui a foto é
 * o argumento de venda e o cartão vive em um trilho horizontal. Tentar servir
 * os dois papéis com um componente só produziria meia dúzia de props de
 * layout e nenhuma das duas telas ficaria boa.
 *
 * O cartão inteiro leva ao cardápio, com a categoria já filtrada; o botão de
 * adicionar fica fora desse link, porque link dentro de link é HTML inválido.
 */
export function ShowcaseCard({ item, onAdd, cartQuantity, highlight }: Props) {
  return (
    <article className={styles.card}>
      <Link to={ROUTES.menu} className={styles.photo} aria-label={`Ver ${item.name} no cardápio`}>
        <ItemPhoto url={item.photoUrl} alt="" format="card" zoomOnHover />
        {highlight ? (
          <span className={styles.badge}>
            <Badge variant="solid">{highlight}</Badge>
          </span>
        ) : null}
      </Link>

      <div className={styles.body}>
        <div className={styles.textGroup}>
          <h3 className={styles.name}>{item.name}</h3>
          <p className={`${styles.description} u-lines-2`}>{item.description}</p>
        </div>

        <div className={styles.footer}>
          <span className={styles.price}>{formatPrice(item.priceCents)}</span>

          <span className={styles.action}>
            {cartQuantity > 0 ? (
              <span className={styles.inCart} aria-label={`${cartQuantity} no pedido`}>
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
          </span>
        </div>
      </div>
    </article>
  )
}
