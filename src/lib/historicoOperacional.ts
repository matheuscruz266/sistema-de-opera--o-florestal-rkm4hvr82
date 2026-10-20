type StatusRecord = {
  status_evento?: string
  status_his?: string
  motivo_id?: string
  expand?: {
    motivo_id?: {
      motivo?: string
    }
  }
}

export function formatTempoHorasMinutos(tempo?: string | null) {
  const value = tempo?.trim()
  if (!value) return '—'

  const match = value.match(/^(\d{1,3}):(\d{1,2})(?::\d{1,2})?$/)
  if (!match) return value

  return `${Number(match[1])}:${match[2].padStart(2, '0')}`
}

export function formatStatusOperacao(record: StatusRecord) {
  const status = record.status_evento?.trim() || record.status_his?.trim()
  if (!status) return '—'

  const normalizedStatus = status
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[\s-]+/g, '_')

  if (normalizedStatus !== 'sem_operacao') return status

  const reason = record.expand?.motivo_id?.motivo?.trim() || record.motivo_id?.trim()
  return reason ? `${status} — ${reason}` : status
}

export function formatLitros(record: { litros?: number | null; combustivel_litros?: number | null }) {
  const value = record.litros ?? record.combustivel_litros
  return value == null ? '—' : `${value.toLocaleString('pt-BR')} L`
}

export function formatHorimetro(value?: number | null) {
  return value == null ? '—' : value.toLocaleString('pt-BR')
}
