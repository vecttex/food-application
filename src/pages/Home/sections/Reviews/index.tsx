import { Avatar } from '../../../../components/Avatar'
import { Rating } from '../../../../components/Rating'
import { Section } from '../../../../components/Section'
import { useSite } from '../../../../features/site/useSite'
import { HOME_SECTIONS } from '../../../../routes'
import styles from './Reviews.module.css'

/**
 * Avaliações de clientes.
 *
 * Some por completo quando não há nenhuma publicada — e é assim que a seção
 * nasce, vazia. Depoimento é conteúdo que só o dono do restaurante pode
 * cadastrar, com nome de gente de verdade; encher a tela com texto inventado
 * seria mentir para quem está decidindo onde jantar.
 */
export function Reviews() {
  const { config, testimonials } = useSite()

  if (!config.sections.reviews || testimonials.length === 0) return null

  return (
    <Section
      id={HOME_SECTIONS.reviews}
      eyebrow="Avaliações"
      title="O que dizem por aí"
      description="Comentários de quem já pediu."
    >
      <ul className={styles.grid}>
        {testimonials.map((testimonial) => (
          <li key={testimonial.id} className={styles.card}>
            <Rating value={testimonial.rating} />
            <p className={styles.comment}>{testimonial.comment}</p>
            <div className={styles.author}>
              <Avatar name={testimonial.author} size="sm" />
              <span className={styles.name}>{testimonial.author}</span>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  )
}
