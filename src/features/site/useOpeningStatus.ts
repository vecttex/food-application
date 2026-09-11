import { useEffect, useMemo, useState } from 'react'
import { computeOpeningStatus, type OpeningStatus } from './openingHours'
import { useSite } from './useSite'

/** De minuto em minuto: o selo muda no máximo uma vez por minuto. */
const INTERVAL_MS = 60_000

/**
 * "Aberto agora" recalculado enquanto a aba fica aberta.
 *
 * Sem o relógio, quem deixa a página aberta às 23h29 continua vendo "aberto"
 * pela madrugada inteira — e clica em finalizar pedido com a cozinha fechada.
 */
export function useOpeningStatus(): OpeningStatus {
  const { hours, config } = useSite()
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [])

  return useMemo(
    () => computeOpeningStatus(hours, now, config.operation.timezone),
    [hours, now, config.operation.timezone],
  )
}
