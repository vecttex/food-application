import { useState } from 'react'
import { IconChevron } from '../Icon'
import styles from './Accordion.module.css'

export type AccordionItem = {
  id: string
  question: string
  answer: string
}

type Props = {
  items: AccordionItem[]
  /** Prefixo dos ids gerados — precisa ser único na página. */
  idPrefix?: string
}

/**
 * Lista de perguntas e respostas.
 *
 * Um item aberto por vez: com tudo aberto a seção vira um muro de texto e
 * perde a função de escaneabilidade que justifica um acordeão.
 *
 * Botão + região com `aria-controls`/`aria-expanded` em vez de
 * `<details>/<summary>`: o nativo é ótimo, mas anima mal e não dá para manter
 * "só um aberto" sem JavaScript de qualquer forma.
 */
export function Accordion({ items, idPrefix = 'faq' }: Props) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null)

  return (
    <div className={styles.list}>
      {items.map((item) => {
        const open = openId === item.id
        const panelId = `${idPrefix}-painel-${item.id}`
        const triggerId = `${idPrefix}-gatilho-${item.id}`

        return (
          <div key={item.id} className={`${styles.item} ${open ? styles.itemOpen : ''}`}>
            <h3 className={styles.header}>
              <button
                type="button"
                id={triggerId}
                className={styles.trigger}
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenId(open ? null : item.id)}
              >
                <span className={styles.question}>{item.question}</span>
                <IconChevron
                  width={18}
                  height={18}
                  className={`${styles.arrow} ${open ? styles.arrowOpen : ''}`}
                />
              </button>
            </h3>

            <div
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              className={styles.panel}
              hidden={!open}
            >
              <p className={styles.answer}>{item.answer}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
