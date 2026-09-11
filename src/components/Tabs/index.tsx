import type { KeyboardEvent } from 'react'
import styles from './Tabs.module.css'

export type TabOption<T extends string> = {
  value: T
  label: string
}

type Props<T extends string> = {
  options: TabOption<T>[]
  value: T
  onSelect: (value: T) => void
  /** Descreve o conjunto de abas para leitores de tela. */
  label: string
  /** Prefixo dos ids; o painel correspondente deve usar `${idPrefix}-painel-${value}`. */
  idPrefix: string
}

/**
 * Abas controladas seguindo o padrão ARIA de tablist.
 *
 * Vale ser um componente de verdade (e não três `<button>` soltos na página)
 * porque acessibilidade de aba é onde mais se erra: navegação por setas, um
 * único item na ordem de tabulação e a ligação `aria-controls` com o painel.
 * Escrito uma vez aqui, vale para qualquer tela que use abas.
 */
export function Tabs<T extends string>({ options, value, onSelect, label, idPrefix }: Props<T>) {
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const direction = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
    if (direction === 0) return

    event.preventDefault()
    const currentIndex = options.findIndex((option) => option.value === value)
    const next = (currentIndex + direction + options.length) % options.length
    onSelect(options[next].value)
  }

  return (
    <div role="tablist" aria-label={label} className={styles.list} onKeyDown={onKeyDown}>
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            id={`${idPrefix}-aba-${option.value}`}
            aria-selected={selected}
            aria-controls={`${idPrefix}-painel-${option.value}`}
            // Só a aba ativa fica na ordem de tabulação: o Tab pula para o
            // conteúdo e as setas percorrem as abas, como manda o padrão.
            tabIndex={selected ? 0 : -1}
            className={`${styles.tab} ${selected ? styles.active : ''}`}
            onClick={() => onSelect(option.value)}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
