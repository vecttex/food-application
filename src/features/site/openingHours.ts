import type { OpeningHour } from './types'

/**
 * Horário de funcionamento: leitura, formatação e o cálculo de "aberto agora".
 *
 * Tudo aqui é função pura, sem React e sem rede — recebe as linhas do banco e
 * um `Date`. É o que permite testar o caso das 23h29 de uma terça-feira sem
 * congelar o relógio da máquina.
 *
 * Fuso: o restaurante tem um, o visitante pode ter outro. Quem manda é o do
 * restaurante (`site_config.timezone`), então toda conversão passa pelo
 * `Intl.DateTimeFormat` com `timeZone` explícito. Usar `Date.getDay()` direto
 * marcaria "fechado" para um cliente viajando com o celular em outro fuso.
 */

const DAY_NAMES = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
] as const

/** Ordem de exibição: a semana brasileira começa na segunda-feira. */
const DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0]

const WEEKDAY_INDEX_BY_ABBR: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
}

export type OpeningStatus = {
  open: boolean
  /** Quando fecha (se aberto) ou quando abre (se fechado). Nulo se nunca abre. */
  nextChange: string | null
}

/** 'HH:MM' ou 'HH:MM:SS' → minutos desde a meia-noite. */
export function timeToMinutes(time: string): number {
  const [hours = '0', minutes = '0'] = time.split(':')
  return Number(hours) * 60 + Number(minutes)
}

/** '18:00:00' → '18h'; '23:30:00' → '23h30'. */
export function formatTime(time: string): string {
  const [hours = '0', minutes = '00'] = time.split(':')
  const hh = String(Number(hours))
  return minutes === '00' ? `${hh}h` : `${hh}h${minutes}`
}

/** Dia da semana e minutos do dia, no fuso do restaurante. */
function zonedNow(now: Date, timezone: string): { weekday: number; minutes: number } {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  })

  const parts = Object.fromEntries(
    formatter.formatToParts(now).map((part) => [part.type, part.value]),
  )

  return {
    weekday: WEEKDAY_INDEX_BY_ABBR[parts.weekday ?? 'Sun'] ?? 0,
    minutes: Number(parts.hour ?? 0) * 60 + Number(parts.minute ?? 0),
  }
}

function byWeekday(hours: OpeningHour[]): Map<number, OpeningHour> {
  return new Map(hours.map((hour) => [hour.weekday, hour]))
}

/**
 * Está aberto agora?
 *
 * Trata expediente que cruza a meia-noite (`closes <= opens`, ex.: 18h→01h) de
 * duas formas: pelo dia de hoje, que ainda não fechou, e pelo dia anterior, que
 * continua valendo na madrugada. Sem o segundo caso, um pedido à 00h30 veria
 * "fechado" com a cozinha funcionando.
 */
export function computeOpeningStatus(
  hours: OpeningHour[],
  now: Date,
  timezone: string,
): OpeningStatus {
  if (hours.length === 0) return { open: false, nextChange: null }

  const hoursByWeekday = byWeekday(hours)
  const { weekday, minutes } = zonedNow(now, timezone)

  const today = hoursByWeekday.get(weekday)
  if (today && !today.closed) {
    const opens = timeToMinutes(today.opens)
    const closes = timeToMinutes(today.closes)
    const crossesMidnight = closes <= opens

    if (crossesMidnight ? minutes >= opens : minutes >= opens && minutes < closes) {
      return { open: true, nextChange: formatTime(today.closes) }
    }
  }

  const yesterday = hoursByWeekday.get((weekday + 6) % 7)
  if (yesterday && !yesterday.closed) {
    const opens = timeToMinutes(yesterday.opens)
    const closes = timeToMinutes(yesterday.closes)
    if (closes <= opens && minutes < closes) {
      return { open: true, nextChange: formatTime(yesterday.closes) }
    }
  }

  return { open: false, nextChange: nextOpening(hoursByWeekday, weekday, minutes) }
}

/** Próxima abertura, olhando de hoje até daqui a uma semana. */
function nextOpening(
  hoursByWeekday: Map<number, OpeningHour>,
  weekday: number,
  minutes: number,
): string | null {
  for (let offset = 0; offset < 7; offset += 1) {
    const checkDay = (weekday + offset) % 7
    const entry = hoursByWeekday.get(checkDay)
    if (!entry || entry.closed) continue

    const opens = timeToMinutes(entry.opens)
    if (offset === 0 && minutes >= opens) continue

    const when = offset === 0 ? 'hoje' : offset === 1 ? 'amanhã' : DAY_NAMES[checkDay].toLowerCase()
    return `${when} às ${formatTime(entry.opens)}`
  }

  return null
}

/**
 * Linhas legíveis do horário, agrupando dias seguidos com o mesmo expediente:
 * sete linhas quase idênticas é ruído, "Terça a domingo — 18h às 23h30" é
 * informação.
 */
export function formatWeeklyHours(hours: OpeningHour[]): string[] {
  if (hours.length === 0) return []

  const hoursByWeekday = byWeekday(hours)
  const lines: string[] = []

  let group: { start: number; end: number; text: string } | null = null

  const textFor = (entry: OpeningHour | undefined): string => {
    if (!entry || entry.closed) return 'fechado'
    return `${formatTime(entry.opens)} às ${formatTime(entry.closes)}`
  }

  const closeGroup = () => {
    if (!group) return
    const startName = DAY_NAMES[group.start]
    // "Terça a domingo", não "Terça a Domingo": em português o segundo dia do
    // intervalo não abre maiúscula.
    const endName = DAY_NAMES[group.end].toLowerCase()
    const days = group.start === group.end ? startName : `${startName} a ${endName}`
    lines.push(group.text === 'fechado' ? `${days} — fechado` : `${days} — ${group.text}`)
    group = null
  }

  for (const weekday of DISPLAY_ORDER) {
    const text = textFor(hoursByWeekday.get(weekday))

    if (group && group.text === text) {
      group.end = weekday
    } else {
      closeGroup()
      group = { start: weekday, end: weekday, text }
    }
  }

  closeGroup()
  return lines
}

export function weekdayName(weekday: number): string {
  return DAY_NAMES[weekday] ?? ''
}

/** Dias na ordem em que aparecem para o usuário (segunda → domingo). */
export function weekdaysInDisplayOrder(): number[] {
  return [...DISPLAY_ORDER]
}
