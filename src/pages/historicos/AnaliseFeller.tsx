import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  LngLatBounds,
  Map as MapLibre,
  Marker,
  NavigationControl,
  Popup,
  setWorkerUrl,
  type LngLatBoundsLike,
} from 'maplibre-gl'
import mapLibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Link } from 'react-router-dom'
import {
  Activity,
  AlertTriangle,
  CalendarDays,
  Clock3,
  Fuel,
  Gauge,
  MapPin,
  RefreshCw,
  Trees,
  UserRound,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { apiService } from '@/services/florestalApi'
import { HistoricoFeller } from '@/types/florestal'

const ALL = '__todos__'

setWorkerUrl(mapLibreWorkerUrl)

const EVENT_STATUS: Record<string, { label: string; color: string }> = {
  inicio_turno: { label: 'Início de turno', color: '#2F77B5' },
  inicio_producao: { label: 'Produção', color: '#3E8E5A' },
  almoco: { label: 'Almoço', color: '#7B5EA7' },
  abastecimento: { label: 'Abastecimento', color: '#E08A1E' },
  sem_operacao: { label: 'Sem operação', color: '#8C8F94' },
  fim_turno: { label: 'Fim de turno', color: '#1B2E1A' },
  registro_diario: { label: 'Apontamento diário', color: '#64748B' },
  outro: { label: 'Outro evento', color: '#64748B' },
}

type Coordinates = { lat: number; lng: number }
type DailyProduction = { date: string; trees: number }

function dateLabel(date: string, options?: Intl.DateTimeFormatOptions) {
  if (!date) return '—'
  const parsed = new Date(`${date.slice(0, 10)}T12:00:00`)
  if (Number.isNaN(parsed.getTime())) return date
  return parsed.toLocaleDateString('pt-BR', options || { day: '2-digit', month: '2-digit' })
}

function formatTime(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function formatHours(value: number) {
  const totalMinutes = Math.max(0, Math.round(value * 60))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${hours}h${String(minutes).padStart(2, '0')}`
}

function eventStatus(record: HistoricoFeller) {
  const raw = record.status_evento?.trim().toLowerCase()
  if (!raw) return 'registro_diario'
  const normalized = raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
  return EVENT_STATUS[normalized] ? normalized : 'outro'
}

function eventHours(record: HistoricoFeller) {
  const reported = Number(record.horas_trabalhadas)
  if (Number.isFinite(reported) && reported > 0) return reported
  if (!record.inicio || !record.fim) return 0
  const duration = new Date(record.fim).getTime() - new Date(record.inicio).getTime()
  return Number.isFinite(duration) && duration > 0 ? duration / 3_600_000 : 0
}

function parseLocation(value?: string | null): Coordinates | null {
  if (!value) return null
  const [lat, lng] = value.split(',').map((part) => Number(part.trim()))
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return null
  }
  return { lat, lng }
}

function getMachineName(record: HistoricoFeller) {
  const machine = record.expand?.maquina_id
  return machine ? `${machine.id_maquina} · ${machine.equipamento}` : record.maquina_id
}

function getTalhaoName(record: HistoricoFeller) {
  return record.expand?.talhao_id?.talhao || record.talhao_id
}

function formatTalhaoLabel(value: string) {
  return `Talhão ${value.replace(/^talh[aã]o[\s_-]*/i, '')}`
}

function getReason(record: HistoricoFeller) {
  const reason = record.expand?.motivo_id
  return reason
    ? `${reason.id_motivo} · ${reason.motivo}`
    : record.motivo_id || 'Motivo não informado'
}

function addDays(date: string, offset: number) {
  const day = new Date(`${date}T12:00:00`)
  day.setDate(day.getDate() + offset)
  return `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`
}

export default function AnaliseFellerPage() {
  const [records, setRecords] = useState<HistoricoFeller[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedMachine, setSelectedMachine] = useState(ALL)
  const [selectedTalhao, setSelectedTalhao] = useState(ALL)

  const loadRecords = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiService.getHistoricoFeller()
      setRecords(data)
    } catch (cause) {
      console.error('Erro ao carregar dados para análise do Feller:', cause)
      const message =
        cause instanceof Error ? cause.message : 'Não foi possível carregar os apontamentos.'
      setError(message)
      toast.error('Erro ao carregar os apontamentos do Feller.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadRecords()
  }, [loadRecords])

  const machineOptions = useMemo(() => {
    const options = new Map<string, string>()
    records.forEach((record) => options.set(record.maquina_id, getMachineName(record)))
    return [...options.entries()].sort((a, b) => a[1].localeCompare(b[1], 'pt-BR'))
  }, [records])

  const machineRecords = useMemo(
    () =>
      selectedMachine === ALL
        ? records
        : records.filter((record) => record.maquina_id === selectedMachine),
    [records, selectedMachine],
  )

  const talhaoOptions = useMemo(() => {
    const options = new Map<string, string>()
    machineRecords.forEach((record) => options.set(record.talhao_id, getTalhaoName(record)))
    return [...options.entries()].sort((a, b) => a[1].localeCompare(b[1], 'pt-BR'))
  }, [machineRecords])

  const scopedRecords = useMemo(
    () =>
      machineRecords.filter(
        (record) => selectedTalhao === ALL || record.talhao_id === selectedTalhao,
      ),
    [machineRecords, selectedTalhao],
  )

  const dateOptions = useMemo(
    () =>
      [...new Set(scopedRecords.map((record) => record.data_operacao).filter(Boolean))].sort(
        (a, b) => b.localeCompare(a),
      ),
    [scopedRecords],
  )

  useEffect(() => {
    if (!selectedDate && dateOptions.length > 0) setSelectedDate(dateOptions[0])
  }, [dateOptions, selectedDate])

  const dayRecords = useMemo(
    () =>
      scopedRecords
        .filter((record) => record.data_operacao === selectedDate)
        .sort((a, b) => {
          const aTime = a.inicio || a.created || ''
          const bTime = b.inicio || b.created || ''
          return aTime.localeCompare(bTime)
        }),
    [scopedRecords, selectedDate],
  )

  const kpis = useMemo(() => {
    const hoursByStatus: Record<string, number> = {}
    let trees = 0
    let fuel = 0
    let productionHours = 0
    let totalHours = 0
    let hasCompleteStatusBreakdown = dayRecords.length > 0

    dayRecords.forEach((record) => {
      const status = eventStatus(record)
      const hours = eventHours(record)
      hoursByStatus[status] = (hoursByStatus[status] || 0) + hours
      totalHours += hours
      if (!record.status_evento?.trim() || status === 'outro' || status === 'registro_diario') {
        hasCompleteStatusBreakdown = false
      }
      if (status === 'registro_diario' || status === 'inicio_producao') {
        productionHours += hours
      }
      trees += Number(record.arvores_derrubadas) || 0
      fuel += Number(record.combustivel_litros ?? record.litros) || 0
    })

    const availability =
      hasCompleteStatusBreakdown && totalHours > 0 ? (productionHours / totalHours) * 100 : null
    const productivity = productionHours > 0 ? trees / productionHours : 0

    return {
      trees,
      fuel,
      productionHours,
      totalHours,
      availability,
      productivity,
      hoursByStatus,
      hasCompleteStatusBreakdown,
    }
  }, [dayRecords])

  const weeklyProduction = useMemo<DailyProduction[]>(() => {
    if (!selectedDate) return []
    const totals = new Map<string, number>()
    for (let offset = -6; offset <= 0; offset += 1) {
      totals.set(addDays(selectedDate, offset), 0)
    }
    scopedRecords.forEach((record) => {
      if (totals.has(record.data_operacao)) {
        totals.set(
          record.data_operacao,
          (totals.get(record.data_operacao) || 0) + (Number(record.arvores_derrubadas) || 0),
        )
      }
    })
    return [...totals.entries()].map(([date, trees]) => ({ date, trees }))
  }, [scopedRecords, selectedDate])

  const alerts = useMemo(() => {
    const result: { id: string; time: string; text: string }[] = []
    dayRecords.forEach((record) => {
      if (eventStatus(record) === 'sem_operacao' && record.motivo_id) {
        result.push({
          id: `${record.id}-reason`,
          time: formatTime(record.inicio),
          text: `Parada: ${getReason(record)}`,
        })
      }
      if (record.observacoes?.trim()) {
        result.push({
          id: `${record.id}-note`,
          time: formatTime(record.inicio),
          text: record.observacoes,
        })
      }
      if (record.inicio && !record.fim) {
        result.push({
          id: `${record.id}-open`,
          time: formatTime(record.inicio),
          text: `Evento "${EVENT_STATUS[eventStatus(record)].label}" ainda está em aberto.`,
        })
      }
    })
    return result
  }, [dayRecords])

  const timelineRange = useMemo(() => {
    const timedRecords = dayRecords.filter((record) => record.inicio)
    if (timedRecords.length === 0) return null
    const start = Math.min(...timedRecords.map((record) => new Date(record.inicio!).getTime()))
    const end = Math.max(
      ...timedRecords.map((record) =>
        record.fim ? new Date(record.fim).getTime() : new Date(record.inicio!).getTime(),
      ),
    )
    return end > start ? { start, end, duration: end - start } : null
  }, [dayRecords])

  const maxWeeklyTrees = Math.max(1, ...weeklyProduction.map((day) => day.trees))
  const dayTitle = selectedDate
    ? dateLabel(selectedDate, { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
    : 'Sem data selecionada'
  const dayLabel = dayTitle.length > 0 ? dayTitle[0].toUpperCase() + dayTitle.slice(1) : dayTitle

  const handleMachineChange = (value: string) => {
    setSelectedMachine(value)
    setSelectedTalhao(ALL)
  }

  const referenceRecord = dayRecords[0] || scopedRecords[0]

  return (
    <main className="-m-4 min-h-full space-y-3 bg-[#F6F3EA] p-4 text-[#262117] sm:-m-6 sm:space-y-4 sm:p-6">
      <header className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-[0.06em] text-[#7A7260]">
            {referenceRecord
              ? `${getMachineName(referenceRecord)} · Operador: ${referenceRecord.operador || '—'}`
              : 'Análise operacional do Feller'}
          </p>
          <h1 className="mt-0.5 font-serif text-2xl font-semibold leading-tight text-[#262117] sm:text-[27px]">
            {referenceRecord ? `${formatTalhaoLabel(getTalhaoName(referenceRecord))} — ` : ''}
            Avanço da derrubada
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-[150px]">
            <label className="sr-only" htmlFor="feller-date">
              Dia da operação
            </label>
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#7A7260]" />
              <input
                id="feller-date"
                type="date"
                aria-label="Dia da operação"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                className="h-9 w-full rounded-md border border-[#E4DFD1] bg-[#FFFDF8] pl-9 pr-2 text-xs text-[#262117] outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E20]"
              />
            </div>
          </div>
          <div className="w-[132px]">
            <label className="sr-only" htmlFor="feller-talho">
              Talhão
            </label>
            <Select value={selectedTalhao} onValueChange={setSelectedTalhao}>
              <SelectTrigger
                id="feller-talho"
                className="h-9 border-[#E4DFD1] bg-[#FFFDF8] text-xs"
              >
                <SelectValue placeholder="Todos os talhões" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todos os talhões</SelectItem>
                {talhaoOptions.map(([id, name]) => (
                  <SelectItem key={id} value={id}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-[150px]">
            <label className="sr-only" htmlFor="feller-machine">
              Máquina
            </label>
            <Select value={selectedMachine} onValueChange={handleMachineChange}>
              <SelectTrigger
                id="feller-machine"
                className="h-9 border-[#E4DFD1] bg-[#FFFDF8] text-xs"
              >
                <SelectValue placeholder="Todas as máquinas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todas as máquinas</SelectItem>
                {machineOptions.map(([id, name]) => (
                  <SelectItem key={id} value={id}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Atualizar apontamentos"
            title="Atualizar apontamentos"
            onClick={() => void loadRecords()}
            disabled={loading}
            className="h-9 w-9 border-[#E4DFD1] bg-[#FFFDF8] text-[#5B5444]"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button asChild variant="link" className="h-9 px-1 text-xs text-[#3E6B49]">
            <Link to="/historicos/feller">Histórico</Link>
          </Button>
        </div>
      </header>

      {error && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900 sm:flex-row sm:items-center sm:justify-between"
        >
          <span>Não foi possível carregar os registros: {error}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void loadRecords()}
            className="border-rose-300 text-rose-900 hover:bg-rose-100"
          >
            Tentar novamente
          </Button>
        </div>
      )}

      {loading ? (
        <Card className="border-[#DDE4DE]">
          <CardContent className="flex min-h-64 items-center justify-center gap-3 text-sm text-[#5A6D5A]">
            <RefreshCw className="h-5 w-5 animate-spin text-[#1B5E20]" />
            Carregando dados operacionais do Feller...
          </CardContent>
        </Card>
      ) : error ? null : (
        <>
          <section
            aria-label="Indicadores do dia"
            className="grid gap-2 sm:grid-cols-2 lg:grid-cols-6"
          >
            <KpiCard
              label="Árvores derrubadas"
              value={kpis.trees.toLocaleString('pt-BR')}
              unit="árvores"
              icon={<Trees className="h-4 w-4" />}
              compact
            />
            <KpiCard
              label="Produtividade"
              value={kpis.productivity.toLocaleString('pt-BR', {
                maximumFractionDigits: 1,
                minimumFractionDigits: 1,
              })}
              unit="árv./h em produção"
              icon={<Activity className="h-4 w-4" />}
              compact
            />
            <KpiCard
              label="Disponibilidade"
              value={
                kpis.availability == null
                  ? '—'
                  : `${kpis.availability.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}%`
              }
              unit={
                kpis.hasCompleteStatusBreakdown
                  ? `${formatHours(kpis.productionHours)} em produção`
                  : 'Sem detalhamento dos eventos'
              }
              icon={<Gauge className="h-4 w-4" />}
              compact
            />
            <KpiCard
              label="Combustível"
              value={kpis.fuel.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}
              unit="litros"
              icon={<Fuel className="h-4 w-4" />}
              compact
            />
            <KpiCard
              label="Alertas do dia"
              value={String(alerts.length)}
              unit={alerts.length ? 'requerem atenção' : 'nenhuma pendência'}
              icon={<AlertTriangle className="h-4 w-4" />}
              warning={alerts.length > 0}
              compact
            />
            <KpiCard
              label="Apontamentos"
              value={String(dayRecords.length)}
              unit="eventos no dia"
              icon={<CalendarDays className="h-4 w-4" />}
              compact
            />
          </section>

          <div className="grid gap-3 lg:grid-cols-[minmax(0,1.8fr)_minmax(280px,0.9fr)]">
            <Card className="border-[#E4DFD1] bg-[#FFFDF8] shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm text-[#3B3529]">
                  <MapPin className="h-4 w-4 text-[#3E6B49]" />
                  Mapa do talhão · eventos registrados
                </CardTitle>
                <p className="text-[11px] text-[#7A7260]">OpenFreeMap · {dayLabel}</p>
              </CardHeader>
              <CardContent>
                <EventMap records={dayRecords} />
                <StatusLegend />
              </CardContent>
            </Card>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <Card className="border-[#E4DFD1] bg-[#FFFDF8] shadow-none">
                <CardHeader className="pb-1">
                  <CardTitle className="text-sm text-[#3B3529]">Avanço · últimos 7 dias</CardTitle>
                  <p className="text-[11px] text-[#7A7260]">Árvores derrubadas por dia</p>
                </CardHeader>
                <CardContent>
                  <WeeklyProductionChart
                    days={weeklyProduction}
                    selectedDate={selectedDate}
                    maximum={maxWeeklyTrees}
                    availableDates={dateOptions}
                    onSelectDate={setSelectedDate}
                  />
                </CardContent>
              </Card>

              <Card className="border-[#E4DFD1] bg-[#FFFDF8] shadow-none">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm text-[#3B3529]">
                    <AlertTriangle className="h-4 w-4 text-[#C47722]" />
                    Alertas do dia
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {alerts.length === 0 ? (
                    <div className="rounded-md bg-[#F6F3EA] px-3 py-3 text-xs text-[#7A7260]">
                      Nenhum alerta registrado para este dia.
                    </div>
                  ) : (
                    <ul className="space-y-1.5">
                      {alerts.map((alert) => (
                        <li key={alert.id} className="flex gap-2 text-xs leading-5 text-[#4E3B1F]">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C47722]" />
                          <span>
                            <b className="font-semibold">{alert.time}</b> {alert.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              <Card className="border-[#E4DFD1] bg-[#FFFDF8] shadow-none">
                <CardHeader className="pb-1">
                  <CardTitle className="text-sm text-[#3B3529]">Apontamentos do dia</CardTitle>
                </CardHeader>
                <CardContent className="space-y-0 p-0">
                  {dayRecords.slice(0, 5).map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between gap-3 border-t border-[#EFEADC] px-4 py-2 text-[11px]"
                    >
                      <span className="flex min-w-0 items-center gap-2 text-[#4B4539]">
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: EVENT_STATUS[eventStatus(record)].color }}
                        />
                        <span className="truncate">
                          {formatTime(record.inicio)} {EVENT_STATUS[eventStatus(record)].label}
                        </span>
                      </span>
                      <span className="shrink-0 text-[#7A7260]">
                        {record.localizacao ? 'GPS ok' : 'Sem GPS'}
                      </span>
                    </div>
                  ))}
                  {dayRecords.length === 0 && (
                    <p className="px-4 pb-3 text-xs text-[#7A7260]">
                      Não há apontamentos neste dia.
                    </p>
                  )}
                  {dayRecords.length > 5 && (
                    <p className="border-t border-[#EFEADC] px-4 py-2 text-[10px] text-[#7A7260]">
                      + {dayRecords.length - 5} apontamento(s) na tabela abaixo
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="border-[#E4DFD1] bg-[#FFFDF8] shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm text-[#3B3529]">
                <Clock3 className="h-4 w-4 text-[#3E6B49]" />
                Linha do tempo do turno
              </CardTitle>
              <p className="text-[11px] text-[#7A7260]">
                {dayLabel}
                {dayRecords[0]?.operador ? ` · Operador: ${dayRecords[0].operador}` : ''}
              </p>
            </CardHeader>
            <CardContent>
              <ShiftTimeline records={dayRecords} range={timelineRange} />
            </CardContent>
          </Card>

          <Card className="border-[#E4DFD1] bg-[#FFFDF8] shadow-none">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <CardTitle className="text-sm text-[#3B3529]">
                    Detalhamento dos apontamentos
                  </CardTitle>
                  <p className="mt-1 text-xs text-[#7A7260]">
                    {dayRecords[0] ? getMachineName(dayRecords[0]) : 'Sem máquina selecionada'}
                    {dayRecords[0] ? ` · ${formatTalhaoLabel(getTalhaoName(dayRecords[0]))}` : ''}
                  </p>
                </div>
                <Badge variant="outline" className="w-fit border-[#E4DFD1] text-[#7A7260]">
                  {dayRecords.length} registro(s)
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {dayRecords.length === 0 ? (
                <div className="px-6 py-12 text-center text-sm text-[#7A7260]">
                  Não há apontamentos para os filtros selecionados.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[950px] text-left text-xs">
                    <thead className="border-y border-[#E4DFD1] bg-[#F6F3EA] text-[10px] uppercase tracking-wider text-[#7A7260]">
                      <tr>
                        <th className="px-4 py-3">Horário</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Duração</th>
                        <th className="px-4 py-3 text-right">Árvores</th>
                        <th className="px-4 py-3 text-right">Horímetro</th>
                        <th className="px-4 py-3">Abastecimento</th>
                        <th className="px-4 py-3">Motivo / observação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EFEADC]">
                      {dayRecords.map((record) => {
                        const status = eventStatus(record)
                        const config = EVENT_STATUS[status]
                        return (
                          <tr key={record.id} className="align-top hover:bg-[#FAF8F1]">
                            <td className="whitespace-nowrap px-4 py-3 font-mono text-[#3B3529]">
                              {formatTime(record.inicio)}
                              {record.fim ? `–${formatTime(record.fim)}` : ' · em aberto'}
                            </td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center gap-2 font-medium text-[#1A2E1A]">
                                <span
                                  className="h-2 w-2 shrink-0 rounded-full"
                                  style={{ backgroundColor: config.color }}
                                />
                                {config.label}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-right font-mono text-[#1A2E1A]">
                              {eventHours(record) ? formatHours(eventHours(record)) : '—'}
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-[#1A2E1A]">
                              {record.arvores_derrubadas
                                ? record.arvores_derrubadas.toLocaleString('pt-BR')
                                : '—'}
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-[#1A2E1A]">
                              {record.horimetro != null
                                ? record.horimetro.toLocaleString('pt-BR', {
                                    minimumFractionDigits: 1,
                                    maximumFractionDigits: 1,
                                  })
                                : '—'}
                            </td>
                            <td className="px-4 py-3 text-[#1A2E1A]">
                              {record.veiculo_abastecimento || '—'}
                              {(record.combustivel_litros ?? record.litros)
                                ? ` · ${Number(record.combustivel_litros ?? record.litros).toLocaleString('pt-BR')} L`
                                : ''}
                            </td>
                            <td className="max-w-sm px-4 py-3 text-[#5A6D5A]">
                              <div>{record.motivo_id ? getReason(record) : '—'}</div>
                              {record.observacoes && (
                                <div className="mt-1 whitespace-normal text-[#1A2E1A]">
                                  {record.observacoes}
                                </div>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#5A6D5A]">
            <span className="inline-flex items-center gap-1.5">
              <UserRound className="h-3.5 w-3.5" />
              {dayRecords[0]?.operador || 'Operador não informado'}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="h-3.5 w-3.5" />
              {formatHours(kpis.totalHours)} registradas no turno
            </span>
            {kpis.availability != null && (
              <span className="inline-flex items-center gap-1.5">
                <Gauge className="h-3.5 w-3.5" />
                {kpis.availability.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}% do tempo
                em produção
              </span>
            )}
          </div>
        </>
      )}
    </main>
  )
}

function KpiCard({
  label,
  value,
  unit,
  icon,
  warning = false,
  compact = false,
}: {
  label: string
  value: string
  unit: string
  icon: ReactNode
  warning?: boolean
  compact?: boolean
}) {
  return (
    <Card
      className={`border shadow-none ${warning ? 'border-[#F0D6B7] bg-[#FFF7EC]' : 'border-[#E4DFD1] bg-[#FFFDF8]'}`}
    >
      <CardContent className={compact ? 'p-3' : 'p-4'}>
        <div className="flex items-center justify-between text-[#7A7260]">
          <span className="text-[10px] font-medium uppercase tracking-[0.04em]">{label}</span>
          <span className={warning ? 'text-[#B96519]' : 'text-[#3E6B49]'}>{icon}</span>
        </div>
        <div
          className={`mt-1 text-[22px] font-semibold tracking-tight ${warning ? 'text-[#A85B1B]' : 'text-[#262117]'}`}
        >
          {value}
        </div>
        <div className="mt-0.5 text-[10px] text-[#7A7260]">{unit}</div>
      </CardContent>
    </Card>
  )
}

function EventMap({ records }: { records: HistoricoFeller[] }) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const points = useMemo(
    () =>
      records
        .map((record) => ({ record, coordinates: parseLocation(record.localizacao) }))
        .filter(
          (point): point is { record: HistoricoFeller; coordinates: Coordinates } =>
            point.coordinates !== null,
        ),
    [records],
  )

  useEffect(() => {
    if (!mapContainer.current) return

    const map = new MapLibre({
      container: mapContainer.current,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: [-46, -19],
      zoom: 5,
    })
    map.addControl(new NavigationControl({ showCompass: false }), 'top-right')

    const bounds = new LngLatBounds()
    points.forEach(({ record, coordinates }) => {
      const config = EVENT_STATUS[eventStatus(record)]
      const markerElement = document.createElement('button')
      markerElement.type = 'button'
      markerElement.className =
        'flex h-7 w-7 items-center justify-center rounded-full border-2 border-white shadow-md'
      markerElement.style.backgroundColor = config.color
      markerElement.setAttribute('aria-label', `${config.label} às ${formatTime(record.inicio)}`)
      markerElement.textContent = formatTime(record.inicio).slice(0, 5)

      new Marker({ element: markerElement })
        .setLngLat([coordinates.lng, coordinates.lat])
        .setPopup(
          new Popup({ offset: 18 }).setText(
            `${config.label} · ${formatTime(record.inicio)} · ${coordinates.lat}, ${coordinates.lng}`,
          ),
        )
        .addTo(map)
      bounds.extend([coordinates.lng, coordinates.lat])
    })

    if (points.length > 0) {
      const mapBounds = bounds.toArray()
      const isSinglePoint =
        mapBounds[0][0] === mapBounds[1][0] && mapBounds[0][1] === mapBounds[1][1]
      const fitBounds: LngLatBoundsLike = isSinglePoint
        ? [
            [mapBounds[0][0] - 0.005, mapBounds[0][1] - 0.005],
            [mapBounds[1][0] + 0.005, mapBounds[1][1] + 0.005],
          ]
        : mapBounds
      map.fitBounds(fitBounds, { padding: 48, maxZoom: 15, duration: 0 })
    }

    return () => map.remove()
  }, [points])

  return (
    <div className="relative overflow-hidden rounded-lg border border-[#E4DFD1]">
      <div
        ref={mapContainer}
        role="img"
        aria-label="Mapa geográfico dos eventos do Feller"
        className="h-[300px] w-full"
      />
      {points.length === 0 && (
        <div className="pointer-events-none absolute inset-x-4 bottom-4 rounded-md bg-white/95 px-3 py-2 text-xs text-[#5A6D5A] shadow-sm">
          Nenhuma localização válida registrada para este dia. Os eventos aparecerão quando houver
          coordenadas nos apontamentos.
        </div>
      )}
    </div>
  )
}

function StatusLegend() {
  return (
    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
      {Object.entries(EVENT_STATUS)
        .filter(([key]) => key !== 'outro')
        .map(([key, status]) => (
          <span key={key} className="inline-flex items-center gap-1.5 text-[11px] text-[#5A6D5A]">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: status.color }} />
            {status.label}
          </span>
        ))}
    </div>
  )
}

function WeeklyProductionChart({
  days,
  selectedDate,
  maximum,
  availableDates,
  onSelectDate,
}: {
  days: DailyProduction[]
  selectedDate: string
  maximum: number
  availableDates: string[]
  onSelectDate: (date: string) => void
}) {
  if (days.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-[#5A6D5A]">
        Selecione uma data para ver a produção.
      </div>
    )
  }

  return (
    <div
      className="flex h-40 items-end gap-2 pt-4"
      role="list"
      aria-label="Produção diária dos últimos sete dias"
    >
      {days.map((day) => {
        const selected = day.date === selectedDate
        const available = availableDates.includes(day.date)
        const height = day.trees === 0 ? 3 : Math.max(8, (day.trees / maximum) * 96)
        return (
          <button
            key={day.date}
            type="button"
            role="listitem"
            onClick={() => onSelectDate(day.date)}
            className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E20]"
            aria-label={`${dateLabel(day.date, { day: '2-digit', month: 'long' })}: ${day.trees} árvores`}
            aria-pressed={selected}
            disabled={!available}
            title={available ? undefined : 'Sem registros nesta data'}
          >
            <span className="text-[10px] font-medium text-[#5A6D5A]">
              {day.trees ? day.trees.toLocaleString('pt-BR') : '0'}
            </span>
            <span
              className={`w-full max-w-10 rounded-t transition-colors group-hover:bg-[#1B5E20] ${
                selected ? 'bg-[#1B5E20]' : 'bg-[#A8C6AC]'
              }`}
              style={{ height }}
            />
            <span
              className={`text-[10px] ${selected ? 'font-bold text-[#1B5E20]' : 'text-[#5A6D5A]'}`}
            >
              {dateLabel(day.date)}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function ShiftTimeline({
  records,
  range,
}: {
  records: HistoricoFeller[]
  range: { start: number; end: number; duration: number } | null
}) {
  if (!range) {
    return (
      <div className="rounded-md bg-[#F6F3EA] px-4 py-6 text-center text-sm text-[#7A7260]">
        Não há horários de início e fim suficientes para montar a linha do tempo.
      </div>
    )
  }

  return (
    <div>
      <div
        className="flex h-8 overflow-hidden rounded-md bg-[#EFEADC]"
        aria-label="Linha do tempo de eventos do turno"
      >
        {records.map((record) => {
          if (!record.inicio) return null
          const start = new Date(record.inicio).getTime()
          const end = record.fim ? new Date(record.fim).getTime() : start
          const duration = Math.max(0, end - start)
          if (!duration) return null
          const width = (duration / range.duration) * 100
          return (
            <div
              key={record.id}
              className="min-w-[2px] border-r border-white/50"
              style={{
                width: `${width}%`,
                backgroundColor: EVENT_STATUS[eventStatus(record)].color,
              }}
              title={`${EVENT_STATUS[eventStatus(record)].label} · ${formatTime(record.inicio)}–${formatTime(record.fim)}`}
            />
          )
        })}
      </div>
      <div className="mt-2 flex justify-between font-mono text-[10px] text-[#7A7260]">
        <span>
          {new Date(range.start).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
        <span>
          {new Date(range.end).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  )
}
