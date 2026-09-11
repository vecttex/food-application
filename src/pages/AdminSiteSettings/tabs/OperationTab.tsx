import { useState } from 'react'
import { Button } from '../../../components/Button'
import { IconClose, IconPlus } from '../../../components/Icon'
import { Input } from '../../../components/Input'
import { Panel } from '../../../components/Panel'
import { Select } from '../../../components/Select'
import { Switch } from '../../../components/Switch'
import { Textarea } from '../../../components/Textarea'
import { weekdayName, weekdaysInDisplayOrder } from '../../../features/site/openingHours'
import type { OpeningHour } from '../../../features/site/types'
import { centsToReaisInput, reaisInputToCents } from '../../../lib/format'
import type { TabProps } from './types'
import styles from '../Settings.module.css'

type Props = TabProps & {
  hours: OpeningHour[]
  onHoursChange: (hours: OpeningHour[]) => void
}

/** Fusos com horário próprio no Brasil — evita uma lista de 400 opções. */
const TIMEZONES = [
  { value: 'America/Sao_Paulo', label: 'Brasília (São Paulo, Sul, Sudeste, Centro-Oeste)' },
  { value: 'America/Manaus', label: 'Amazonas (Manaus)' },
  { value: 'America/Cuiaba', label: 'Mato Grosso (Cuiabá)' },
  { value: 'America/Belem', label: 'Pará (Belém)' },
  { value: 'America/Fortaleza', label: 'Nordeste (Fortaleza, Recife)' },
  { value: 'America/Rio_Branco', label: 'Acre (Rio Branco)' },
  { value: 'America/Noronha', label: 'Fernando de Noronha' },
]

/** 'HH:MM:SS' → 'HH:MM', que é o formato aceito por `<input type="time">`. */
function toFieldValue(time: string): string {
  return time.slice(0, 5)
}

/**
 * Operação: entrega, pagamento, aviso e a grade de horários.
 *
 * A grade é a fonte do selo "aberto agora" da vitrine — por isso ela mora aqui,
 * junto do resto do que define como o restaurante funciona, e não numa tela
 * separada onde ninguém lembraria de atualizar.
 */
export function OperationTab({ config, patch, hours, onHoursChange }: Props) {
  const [newPaymentMethod, setNewPaymentMethod] = useState('')

  const { operation } = config

  function addPaymentMethod() {
    const value = newPaymentMethod.trim()
    if (!value || operation.paymentMethods.includes(value)) {
      setNewPaymentMethod('')
      return
    }
    patch('operation', { paymentMethods: [...operation.paymentMethods, value] })
    setNewPaymentMethod('')
  }

  function removePaymentMethod(method: string) {
    patch('operation', {
      paymentMethods: operation.paymentMethods.filter((current) => current !== method),
    })
  }

  function updateDay(weekday: number, change: Partial<OpeningHour>) {
    onHoursChange(
      hours.map((entry) => (entry.weekday === weekday ? { ...entry, ...change } : entry)),
    )
  }

  const hoursByWeekday = new Map(hours.map((entry) => [entry.weekday, entry]))

  return (
    <>
      <Panel stacked>
        <h2 className={styles.sectionTitle}>Pedidos e entrega</h2>

        <Switch
          label="Aceitar pedidos"
          description="Desligado, a vitrine continua no ar mas o botão de finalizar fica bloqueado."
          checked={operation.acceptsOrders}
          onChange={(checked) => patch('operation', { acceptsOrders: checked })}
        />

        <div className={styles.divider} />

        <div className={styles.twoColumn}>
          <Input
            label="Tempo estimado de entrega"
            placeholder="35–50 min"
            value={operation.deliveryTime}
            onChange={(event) => patch('operation', { deliveryTime: event.target.value })}
          />
          <Input
            label="Taxa de entrega (R$)"
            type="number"
            min="0"
            step="0.01"
            value={centsToReaisInput(operation.deliveryFeeCents)}
            onChange={(event) =>
              patch('operation', { deliveryFeeCents: reaisInputToCents(event.target.value) })
            }
          />
          <Input
            label="Pedido mínimo (R$)"
            type="number"
            min="0"
            step="0.01"
            value={centsToReaisInput(operation.minOrderCents)}
            onChange={(event) =>
              patch('operation', { minOrderCents: reaisInputToCents(event.target.value) })
            }
          />
        </div>
        <p className={styles.sectionText}>Zero em qualquer um dos dois esconde o campo na vitrine.</p>
      </Panel>

      <Panel stacked>
        <h2 className={styles.sectionTitle}>Formas de pagamento</h2>

        {operation.paymentMethods.length > 0 ? (
          <ul className={styles.chips}>
            {operation.paymentMethods.map((method) => (
              <li key={method} className={styles.chip}>
                {method}
                <button
                  type="button"
                  className={styles.removeChip}
                  onClick={() => removePaymentMethod(method)}
                  aria-label={`Remover ${method}`}
                >
                  <IconClose width={12} height={12} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.sectionText}>Nenhuma forma cadastrada — o cartão some da vitrine.</p>
        )}

        <div className={styles.newChip}>
          <Input
            label="Nova forma de pagamento"
            hiddenLabel
            placeholder="ex.: Pix"
            value={newPaymentMethod}
            onChange={(event) => setNewPaymentMethod(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                // Enter dentro de um formulário submeteria a página inteira.
                event.preventDefault()
                addPaymentMethod()
              }
            }}
          />
          <Button type="button" variant="secondary" onClick={addPaymentMethod}>
            <IconPlus width={16} height={16} />
            Adicionar
          </Button>
        </div>
      </Panel>

      <Panel stacked>
        <h2 className={styles.sectionTitle}>Horário de funcionamento</h2>
        <p className={styles.sectionText}>
          Define o selo “aberto agora” e o bloco de horários da página inicial.
        </p>

        <Select
          label="Fuso horário"
          value={operation.timezone}
          options={TIMEZONES}
          onChange={(event) => patch('operation', { timezone: event.target.value })}
        />

        <div className={styles.days}>
          {weekdaysInDisplayOrder().map((weekday) => {
            const entry = hoursByWeekday.get(weekday)
            if (!entry) return null

            return (
              <div key={weekday} className={styles.day}>
                <span className={styles.dayName}>{weekdayName(weekday)}</span>

                <div className={styles.dayHours}>
                  <input
                    type="time"
                    className={styles.dayField}
                    value={toFieldValue(entry.opens)}
                    disabled={entry.closed}
                    aria-label={`Abertura de ${weekdayName(weekday)}`}
                    onChange={(event) => updateDay(weekday, { opens: event.target.value })}
                  />
                  <span aria-hidden="true">–</span>
                  <input
                    type="time"
                    className={styles.dayField}
                    value={toFieldValue(entry.closes)}
                    disabled={entry.closed}
                    aria-label={`Fechamento de ${weekdayName(weekday)}`}
                    onChange={(event) => updateDay(weekday, { closes: event.target.value })}
                  />
                </div>

                <label className={styles.dayClosed}>
                  <input
                    type="checkbox"
                    checked={entry.closed}
                    onChange={(event) => updateDay(weekday, { closed: event.target.checked })}
                  />
                  Fechado
                </label>
              </div>
            )
          })}
        </div>
      </Panel>

      <Panel stacked>
        <h2 className={styles.sectionTitle}>Aviso no topo</h2>
        <p className={styles.sectionText}>
          Faixa dourada acima da navegação. Em branco, a faixa não aparece.
        </p>

        <Textarea
          label="Mensagem"
          hiddenLabel
          rows={2}
          maxLength={160}
          showCount
          placeholder="ex.: Hoje fechamos às 22h por causa do feriado."
          value={operation.notice ?? ''}
          onChange={(event) => patch('operation', { notice: event.target.value })}
        />
      </Panel>
    </>
  )
}
