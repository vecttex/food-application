import { describe, expect, it } from 'vitest'
import {
  computeOpeningStatus,
  formatTime,
  formatWeeklyHours,
  timeToMinutes,
} from './openingHours'
import type { OpeningHour } from './types'

const FUSO = 'America/Sao_Paulo'

function hora(weekday: number, overrides: Partial<OpeningHour> = {}): OpeningHour {
  return { weekday, closed: false, opens: '18:00:00', closes: '23:30:00', ...overrides }
}

/** Semana da hamburgaria: fechada na segunda, 18h→23h30 nos outros dias. */
const SEMANA = [0, 1, 2, 3, 4, 5, 6].map((dia) => hora(dia, { closed: dia === 1 }))

/**
 * Datas em UTC com o deslocamento já aplicado: Brasília é UTC-3, então
 * 19h local = 22h UTC. Escrever assim deixa o teste independente do fuso da
 * máquina que roda a suíte.
 */
function saoPaulo(iso: string): Date {
  return new Date(iso)
}

describe('timeToMinutes / formatTime', () => {
  it('converte hora do Postgres em minutos do dia', () => {
    expect(timeToMinutes('18:00:00')).toBe(1080)
    expect(timeToMinutes('23:30')).toBe(1410)
  })

  it('formata hora cheia sem os minutos', () => {
    expect(formatTime('18:00:00')).toBe('18h')
    expect(formatTime('23:30:00')).toBe('23h30')
    expect(formatTime('09:05:00')).toBe('9h05')
  })
})

describe('computeOpeningStatus', () => {
  it('está aberto dentro do expediente', () => {
    // Terça, 19h em Brasília.
    const status = computeOpeningStatus(SEMANA, saoPaulo('2026-08-25T22:00:00Z'), FUSO)

    expect(status).toEqual({ open: true, nextChange: '23h30' })
  })

  it('está fechado antes de abrir, e diz que horas abre hoje', () => {
    // Terça, 15h em Brasília.
    const status = computeOpeningStatus(SEMANA, saoPaulo('2026-08-25T18:00:00Z'), FUSO)

    expect(status).toEqual({ open: false, nextChange: 'hoje às 18h' })
  })

  it('está fechado depois de fechar, e aponta o próximo dia', () => {
    // Terça, 23h45 em Brasília.
    const status = computeOpeningStatus(SEMANA, saoPaulo('2026-08-26T02:45:00Z'), FUSO)

    expect(status).toEqual({ open: false, nextChange: 'amanhã às 18h' })
  })

  it('pula o dia fechado ao procurar a próxima abertura', () => {
    // Domingo, 23h50 em Brasília — segunda é fechada, então a próxima é terça.
    const status = computeOpeningStatus(SEMANA, saoPaulo('2026-08-24T02:50:00Z'), FUSO)

    expect(status.open).toBe(false)
    expect(status.nextChange).toBe('terça às 18h')
  })

  it('continua aberto na madrugada quando o expediente cruza a meia-noite', () => {
    const madrugada = [0, 1, 2, 3, 4, 5, 6].map((dia) => hora(dia, { closes: '01:00:00' }))
    // Quarta, 00h30 em Brasília — ainda é o expediente de terça.
    const status = computeOpeningStatus(madrugada, saoPaulo('2026-08-26T03:30:00Z'), FUSO)

    expect(status).toEqual({ open: true, nextChange: '1h' })
  })

  it('usa o fuso do restaurante, e não o do visitante', () => {
    // 23h em Brasília é 4h (do dia seguinte) em Londres: o mesmo instante dá
    // resultados opostos se o fuso for ignorado.
    const instante = saoPaulo('2026-08-26T02:00:00Z')

    expect(computeOpeningStatus(SEMANA, instante, FUSO).open).toBe(true)
    expect(computeOpeningStatus(SEMANA, instante, 'Europe/London').open).toBe(false)
  })

  it('não afirma nada quando não há horário cadastrado', () => {
    expect(computeOpeningStatus([], new Date(), FUSO)).toEqual({ open: false, nextChange: null })
  })

  it('devolve `nextChange` nulo quando a semana inteira está fechada', () => {
    const semanaFechada = SEMANA.map((h) => ({ ...h, closed: true }))

    expect(computeOpeningStatus(semanaFechada, new Date(), FUSO).nextChange).toBeNull()
  })
})

describe('formatWeeklyHours', () => {
  it('agrupa dias seguidos com o mesmo expediente', () => {
    expect(formatWeeklyHours(SEMANA)).toEqual([
      'Segunda — fechado',
      'Terça a domingo — 18h às 23h30',
    ])
  })

  it('quebra o grupo quando um dia tem horário diferente', () => {
    const semana = SEMANA.map((h) =>
      h.weekday === 6 ? { ...h, closes: '01:00:00' } : h,
    )

    expect(formatWeeklyHours(semana)).toEqual([
      'Segunda — fechado',
      'Terça a sexta — 18h às 23h30',
      'Sábado — 18h às 1h',
      'Domingo — 18h às 23h30',
    ])
  })

  it('devolve lista vazia sem horário cadastrado', () => {
    expect(formatWeeklyHours([])).toEqual([])
  })
})
