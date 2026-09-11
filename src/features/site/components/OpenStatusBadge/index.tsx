import { Badge } from '../../../../components/Badge'
import { useOpeningStatus } from '../../useOpeningStatus'
import { useSite } from '../../useSite'

type Props = {
  /** Mostra também "fecha às 23h30" / "abre amanhã às 18h". */
  withDetail?: boolean
}

/**
 * Selo "aberto agora".
 *
 * Some junto com a seção de status desligada no admin — e some sozinho quando
 * não há horário cadastrado, porque um selo "fechado" permanente por falta de
 * dado é pior do que selo nenhum.
 */
export function OpenStatusBadge({ withDetail }: Props) {
  const { config, hours } = useSite()
  const status = useOpeningStatus()

  if (!config.sections.status || hours.length === 0) return null

  const showDetail = withDetail && status.nextChange
  const text = status.open
    ? showDetail
      ? `Aberto · fecha às ${status.nextChange}`
      : 'Aberto agora'
    : showDetail
      ? `Fechado · abre ${status.nextChange}`
      : 'Fechado agora'

  return (
    <Badge variant={status.open ? 'success' : 'neutral'} withDot>
      {text}
    </Badge>
  )
}
