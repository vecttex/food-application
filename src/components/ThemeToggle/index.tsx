import { IconAuto, IconMoon, IconSun } from '../Icon'
import { useTheme } from '../../features/theme/useTheme'
import type { ThemePreference } from '../../features/theme/types'
import styles from './ThemeToggle.module.css'

type Option = {
  value: ThemePreference
  label: string
  icon: typeof IconSun
}

const OPTIONS: Option[] = [
  { value: 'light', label: 'Tema claro', icon: IconSun },
  { value: 'dark', label: 'Tema escuro', icon: IconMoon },
  { value: 'system', label: 'Acompanhar o sistema', icon: IconAuto },
]

type Props = {
  /**
   * `segmented` mostra as três opções (claro/escuro/sistema) — é o controle
   * completo, para barra de topo e configurações.
   * `compact` é um botão só que alterna claro ↔ escuro, para onde não cabe
   * mais do que um ícone (barra inferior do celular).
   */
  variant?: 'segmented' | 'compact'
  className?: string
}

/**
 * Troca de tema.
 *
 * As três opções são um grupo de botões com `aria-pressed`, e não um
 * `radiogroup`: um leitor de tela anuncia "Tema escuro, pressionado" sem que
 * seja preciso implementar navegação por setas para três alvos que já estão na
 * ordem de tabulação. O rótulo do grupo diz do que se trata.
 */
export function ThemeToggle({ variant = 'segmented', className }: Props) {
  const { preference, theme, setPreference, toggle } = useTheme()

  if (variant === 'compact') {
    const target = theme === 'dark' ? 'claro' : 'escuro'
    return (
      <button
        type="button"
        className={[styles.compact, className].filter(Boolean).join(' ')}
        onClick={toggle}
        aria-label={`Mudar para o tema ${target}`}
        title={`Mudar para o tema ${target}`}
      >
        {theme === 'dark' ? <IconSun width={18} height={18} /> : <IconMoon width={18} height={18} />}
      </button>
    )
  }

  return (
    <div
      role="group"
      aria-label="Tema da página"
      className={[styles.group, className].filter(Boolean).join(' ')}
    >
      {OPTIONS.map((option) => {
        const active = preference === option.value
        return (
          <button
            key={option.value}
            type="button"
            className={`${styles.option} ${active ? styles.active : ''}`}
            aria-pressed={active}
            aria-label={option.label}
            title={option.label}
            onClick={() => setPreference(option.value)}
          >
            <option.icon width={15} height={15} />
          </button>
        )
      })}
    </div>
  )
}
