import { ItemPhoto } from '../../../../components/ItemPhoto'
import { Section } from '../../../../components/Section'
import { useSite } from '../../../../features/site/useSite'
import { HOME_SECTIONS } from '../../../../routes'
import styles from './Gallery.module.css'

/**
 * Galeria da casa.
 *
 * Grade em mosaico com altura de linha fixa: a primeira foto ocupa quatro
 * células, o que evita o efeito de "grade de miniaturas" e dá alguma hierarquia
 * mesmo com fotos de proporções irregulares vindas do celular do dono.
 *
 * A altura vem da grade, não da proporção de cada foto — é o que mantém as
 * legendas coladas na base da imagem em vez de flutuarem no vão que sobra
 * quando uma célula é mais alta que a foto dentro dela.
 */
export function Gallery() {
  const { config, gallery } = useSite()

  if (!config.sections.gallery || gallery.length === 0) return null

  return (
    <Section
      id={HOME_SECTIONS.gallery}
      eyebrow="Galeria"
      title="Um pouco da casa"
      description="Ambiente, cozinha e o que sai da brasa."
    >
      <ul className={styles.mosaic}>
        {gallery.map((photo, index) => (
          <li key={photo.id} className={index === 0 ? styles.itemLarge : styles.item}>
            <ItemPhoto url={photo.photoUrl} alt={photo.caption} className={styles.photo} zoomOnHover />
            {photo.caption ? <span className={styles.caption}>{photo.caption}</span> : null}
          </li>
        ))}
      </ul>
    </Section>
  )
}
