import { IconCheck } from '../Icon'
import { BRANDS, type BrandId } from '../../features/theme/brands'
import styles from './BrandSwatches.module.css'

type Props = {
  value: BrandId
  onChange: (brand: BrandId) => void
  /** Descreve o conjunto para quem usa leitor de tela. */
  label: string
}

/**
 * Seletor da cor da marca: um quadradinho por paleta.
 *
 * Cada botão carrega o próprio `data-brand`, e o quadrado é pintado com
 * `var(--brand-swatch)` — a mesma variável que `themes/brands.css` define
 * para aquela paleta, no tema que está na tela agora. Ou seja: a amostra não
 * é uma aproximação da cor, é a cor. Nenhum hexadecimal atravessa o
 * JavaScript, então não existe o clássico "o quadradinho mostra um azul e o
 * site pinta outro".
 *
 * Grupo de botões com `aria-pressed`, como o `ThemeToggle`, e não um
 * `radiogroup`: treze alvos já estão na ordem de tabulação e o leitor de tela
 * anuncia "Verde claro, pressionado" sem precisar de navegação por setas
 * escrita à mão.
 *
 * O ponto menor dentro do quadrado é a cor secundária — a que vira texto por
 * cima do preenchimento. Mostrá-la aqui evita a surpresa de escolher um tom e
 * só depois descobrir que o rótulo do botão principal ficou branco.
 */
export function BrandSwatches({ value, onChange, label }: Props) {
  return (
    <div role="group" aria-label={label} className={styles.grid}>
      {BRANDS.map((brand) => {
        const active = brand.id === value

        return (
          <button
            key={brand.id}
            type="button"
            data-brand={brand.id}
            className={`${styles.option} ${active ? styles.active : ''}`}
            aria-pressed={active}
            onClick={() => onChange(brand.id)}
          >
            <span className={styles.swatch} aria-hidden="true">
              {active ? <IconCheck width={18} height={18} /> : <span className={styles.dot} />}
            </span>

            <span className={styles.name}>{brand.label}</span>
            {brand.recommended ? (
              <span className={styles.recommended}>Recomendada</span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
