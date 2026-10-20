type StatusRecord = {
  status_evento?: string
  motivo_id?: string
  expand?: {
    motivo_id?: {
      motivo?: string
    }
  }
}

type OperationalDateValue = string | number | null | undefined

const EXCEL_EPOCH_UTC = Date.UTC(1899, 11, 30)
const DAY_IN_MILLISECONDS = 86_400_000

function localDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`
}

function isValidDateParts(year: number, month: number, day: number) {
  const date = new Date(year, month - 1, day)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
}

export function parseOperationalDateTime(value: OperationalDateValue): Date | null {
  if (value == null || value === '') return null

  const raw = String(value).trim()
  if (!raw) return null

  const excelSerial = Number(raw)
  if (Number.isFinite(excelSerial) && excelSerial >= 1 && excelSerial < 2_958_466) {
    const wholeDays = Math.floor(excelSerial)
    const secondsInDay = Math.round((excelSerial - wholeDays) * 86_400)
    const excelDate = new Date(EXCEL_EPOCH_UTC + wholeDays * DAY_IN_MILLISECONDS)
    const date = new Date(
      excelDate.getUTCFullYear(),
      excelDate.getUTCMonth(),
      excelDate.getUTCDate(),
      0,
      0,
      secondsInDay,
    )
    return Number.isNaN(date.getTime()) ? null : date
  }

  const isoDate = raw.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/)
  if (isoDate) {
    if (/[zZ]|[+-]\d{2}:?\d{2}$/.test(raw)) {
      const zoned = new Date(raw.replace(' ', 'T'))
      return Number.isNaN(zoned.getTime()) ? null : zoned
    }
    const [, year, month, day, hour = '0', minute = '0', second = '0'] = isoDate
    const parts = [year, month, day, hour, minute, second].map(Number)
    if (!isValidDateParts(parts[0], parts[1], parts[2])) return null
    const date = new Date(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5])
    return Number.isNaN(date.getTime()) ? null : date
  }

  const brazilianDate = raw.match(
    /^(\d{1,2})[/. -](\d{1,2})[/. -](\d{4})(?:[ T,]+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/,
  )
  if (brazilianDate) {
    const [, day, month, year, hour = '0', minute = '0', second = '0'] = brazilianDate
    const parts = [year, month, day, hour, minute, second].map(Number)
    if (!isValidDateParts(parts[0], parts[1], parts[2])) return null
    const date = new Date(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5])
    return Number.isNaN(date.getTime()) ? null : date
  }

  const parsed = new Date(raw)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function operationalDateKey(value: OperationalDateValue): string | null {
  if (value == null || value === '') return null
  const raw = String(value).trim()

  const isoDate = raw.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (isoDate) {
    const [, year, month, day] = isoDate
    return isValidDateParts(Number(year), Number(month), Number(day))
      ? `${year}-${month}-${day}`
      : null
  }

  const brazilianDate = raw.match(/^(\d{1,2})[/. -](\d{1,2})[/. -](\d{4})/)
  if (brazilianDate) {
    const [, day, month, year] = brazilianDate
    const parts = [year, month, day].map(Number)
    return isValidDateParts(parts[0], parts[1], parts[2])
      ? `${year}-${String(parts[1]).padStart(2, '0')}-${String(parts[2]).padStart(2, '0')}`
      : null
  }

  const parsed = parseOperationalDateTime(value)
  return parsed ? localDateKey(parsed) : null
}

export function formatDataHoraOperacional(value: OperationalDateValue) {
  if (value == null || value === '') return '—'
  const parsed = parseOperationalDateTime(value)
  if (!parsed) return String(value)
  return parsed.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function parseTempoHoras(value?: string | number | null): number | null {
  if (value == null || value === '') return null
  const raw = String(value).trim()
  if (!raw) return null

  const time = raw.match(/^(\d{1,3}):(\d{1,2})(?::(\d{1,2}))?$/)
  if (time) {
    const hours = Number(time[1])
    const minutes = Number(time[2])
    const seconds = Number(time[3] || 0)
    if (minutes > 59 || seconds > 59) return null
    return hours + minutes / 60 + seconds / 3_600
  }

  const excelDuration = Number(raw)
  return Number.isFinite(excelDuration) && excelDuration >= 0 ? excelDuration * 24 : null
}

export function formatTempoHorasMinutos(tempo?: string | null) {
  const value = tempo?.trim()
  if (!value) return '—'

  const hours = parseTempoHoras(value)
  if (hours == null) return value

  const totalMinutes = Math.floor(hours * 60)
  return `${Math.floor(totalMinutes / 60)}:${String(totalMinutes % 60).padStart(2, '0')}`
}

export function formatStatusOperacao(record: StatusRecord) {
  const status = record.status_evento?.trim()
  if (!status) return '—'

  const normalizedStatus = status
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[\s-]+/g, '_')

  if (normalizedStatus !== 'sem_operacao') return status

  const reason = (record.expand?.motivo_id?.motivo || record.motivo_id)
    ?.trim()
    .replace(/^[\s\-–—]+/, '')
    .trim()
  return reason ? `${status} — ${reason}` : status
}

export function isStatusCarregamento(status?: string | null) {
  return (
    status
      ?.normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase() === 'carregamento'
  )
}

export function notaFiscalValida(value?: string | null) {
  const nota = value?.trim()
  return nota && !nota.toUpperCase().startsWith('PIC-S-NOTA-') ? nota : null
}

export function formatNotaFiscal(value?: string | null) {
  return notaFiscalValida(value) || 'Sem NF'
}

export function statusOperacaoClass(record: StatusRecord) {
  const status = record.status_evento
    ?.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')

  if (status === 'sem_operacao' || status === 'parada') {
    return 'border-amber-200 bg-amber-50 text-amber-800'
  }
  if (status === 'abastecimento') {
    return 'border-sky-200 bg-sky-50 text-sky-800'
  }
  if (status === 'inicio_turno' || status === 'inicio_de_turno') {
    return 'border-blue-200 bg-blue-50 text-blue-800'
  }
  if (status === 'fim_turno' || status === 'fim_de_turno') {
    return 'border-slate-200 bg-slate-100 text-slate-700'
  }
  if (
    ['operando', 'producao', 'inicio_producao', 'inicio_de_producao', 'carregamento'].includes(
      status || '',
    )
  ) {
    return 'border-emerald-200 bg-emerald-50 text-emerald-800'
  }
  return 'border-neutral-200 bg-neutral-50 text-neutral-700'
}

export function formatHorasTrabalhadas(record: {
  horas_trabalhadas?: number | null
  tempo?: string | null
}) {
  const duration = parseTempoHoras(record.tempo)
  if (duration != null) {
    return `${duration.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} h`
  }

  const reported = Number(record.horas_trabalhadas)
  if (!Number.isFinite(reported) || reported <= 0) return '—'
  return `${reported.toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} h`
}

export function formatReferenciaOperacional(value?: string | null) {
  const label = value?.trim()
  if (!label) return '—'

  const normalized = label
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
  return normalized.startsWith('PADRAO_SISTE') ? 'Vínculo não identificado' : label
}

export function formatLitros(record: {
  litros?: number | null
  combustivel_litros?: number | null
}) {
  const value = record.litros ?? record.combustivel_litros
  return value == null || value === 0 ? '—' : `${value.toLocaleString('pt-BR')} L`
}

export function formatHorimetro(value?: number | null) {
  return value == null || value === 0 ? '—' : value.toLocaleString('pt-BR')
}
