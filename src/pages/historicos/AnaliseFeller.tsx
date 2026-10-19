import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  AlertTriangle,
  CalendarDays,
  ChartNoAxesCombined,
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
    if (dateOptions.length > 0 && !dateOptions.includes(selectedDate)) {
      setSelectedDate(dateOptions[0])
    } else if (dateOptions.length === 0 && selectedDate) {
      setSelectedDate('')
    }
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

  return (
    <main className="space-y-6">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#5A6D5A]">
            <ChartNoAxesCombined className="h-4 w-4 text-[#1B5E20]" />
            Análise operacional
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A2E1A] sm:text-3xl">
            Desempenho do Feller
          </h1>
          <p className="mt-1 text-sm text-[#5A6D5A]">
            Produção, disponibilidade e eventos operacionais a partir dos apontamentos registrados.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline" className="border-[#DDE4DE] text-[#1B5E20]">
            <Link to="/historicos/feller">Abrir histórico operacional</Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => void loadRecords()}
            disabled={loading}
            className="border-[#DDE4DE]"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </header>

      <Card className="border-[#DDE4DE] shadow-xs">
        <CardContent className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_auto] xl:items-end">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#5A6D5A]" htmlFor="feller-machine">
              Máquina
            </label>
            <Select value={selectedMachine} onValueChange={handleMachineChange}>
              <SelectTrigger id="feller-machine" className="h-9">
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
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#5A6D5A]" htmlFor="feller-talho">
              Talhão
            </label>
            <Select value={selectedTalhao} onValueChange={setSelectedTalhao}>
              <SelectTrigger id="feller-talho" className="h-9">
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
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#5A6D5A]" htmlFor="feller-date">
              Dia da operação
            </label>
            <Select
              value={selectedDate}
              onValueChange={setSelectedDate}
              disabled={!dateOptions.length}
            >
              <SelectTrigger id="feller-date" className="h-9">
                <SelectValue placeholder="Selecione um dia" />
              </SelectTrigger>
              <SelectContent>
                {dateOptions.map((date) => (
                  <SelectItem key={date} value={date}>
                    {dateLabel(date, {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex h-9 items-center gap-2 rounded-md bg-[#F5F7F5] px-3 text-xs text-[#5A6D5A]">
            <CalendarDays className="h-4 w-4 text-[#1B5E20]" />
            {dayRecords.length} evento(s) no dia
          </div>
        </CardContent>
      </Card>

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
      ) : error ? null : records.length === 0 ? (
        <Card className="border-dashed border-[#C8D4C9]">
          <CardContent className="flex min-h-64 flex-col items-center justify-center text-center">
            <Trees className="mb-3 h-9 w-9 text-[#6B8F71]" />
            <h2 className="font-semibold text-[#1A2E1A]">Ainda não há apontamentos do Feller</h2>
            <p className="mt-1 max-w-md text-sm text-[#5A6D5A]">
              Quando registros forem adicionados ao histórico operacional, a análise aparecerá aqui.
            </p>
            <Button asChild className="mt-4 bg-[#1B5E20] text-white hover:bg-[#14521A]">
              <Link to="/historicos/feller">Ir para o histórico do Feller</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <section
            aria-label="Indicadores do dia"
            className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5"
          >
            <KpiCard
              label="Árvores derrubadas"
              value={kpis.trees.toLocaleString('pt-BR')}
              unit="árvores"
              icon={<Trees className="h-4 w-4" />}
            />
            <KpiCard
              label="Produtividade"
              value={kpis.productivity.toLocaleString('pt-BR', {
                maximumFractionDigits: 1,
                minimumFractionDigits: 1,
              })}
              unit="árv./h em produção"
              icon={<Activity className="h-4 w-4" />}
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
            />
            <KpiCard
              label="Combustível"
              value={kpis.fuel.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}
              unit="litros"
              icon={<Fuel className="h-4 w-4" />}
            />
            <KpiCard
              label="Alertas do dia"
              value={String(alerts.length)}
              unit={alerts.length ? 'requerem atenção' : 'nenhuma pendência'}
              icon={<AlertTriangle className="h-4 w-4" />}
              warning={alerts.length > 0}
            />
          </section>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(300px,0.9fr)]">
            <Card className="border-[#DDE4DE] shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base text-[#1A2E1A]">
                  <MapPin className="h-4 w-4 text-[#1B5E20]" />
                  Localização dos apontamentos
                </CardTitle>
                <p className="text-xs text-[#5A6D5A]">
                  Trajeto relativo aos pontos registrados · {dayLabel}
                </p>
              </CardHeader>
              <CardContent>
                <EventMap records={dayRecords} />
                <StatusLegend />
              </CardContent>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <Card className="border-[#DDE4DE] shadow-xs">
                <CardHeader className="pb-1">
                  <CardTitle className="text-base text-[#1A2E1A]">
                    Produção · últimos 7 dias
                  </CardTitle>
                  <p className="text-xs text-[#5A6D5A]">Árvores derrubadas por dia</p>
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

              <Card className="border-[#DDE4DE] shadow-xs">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base text-[#1A2E1A]">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    Alertas e observações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {alerts.length === 0 ? (
                    <div className="rounded-md bg-[#F5F7F5] px-3 py-4 text-sm text-[#5A6D5A]">
                      Nenhum alerta registrado para este dia.
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {alerts.map((alert) => (
                        <li
                          key={alert.id}
                          className="flex gap-2 rounded-md border border-amber-200 bg-amber-50/70 p-3 text-sm text-[#4E3B1F]"
                        >
                          <span className="shrink-0 font-mono text-xs font-semibold">
                            {alert.time}
                          </span>
                          <span>{alert.text}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="border-[#DDE4DE] shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base text-[#1A2E1A]">
                <Clock3 className="h-4 w-4 text-[#1B5E20]" />
                Linha do tempo do turno
              </CardTitle>
              <p className="text-xs text-[#5A6D5A]">
                {dayLabel}
                {dayRecords[0]?.operador ? ` · Operador: ${dayRecords[0].operador}` : ''}
              </p>
            </CardHeader>
            <CardContent>
              <ShiftTimeline records={dayRecords} range={timelineRange} />
            </CardContent>
          </Card>

          <Card className="border-[#DDE4DE] shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <CardTitle className="text-base text-[#1A2E1A]">Apontamentos do dia</CardTitle>
                  <p className="mt-1 text-xs text-[#5A6D5A]">
                    {dayRecords[0] ? getMachineName(dayRecords[0]) : 'Sem máquina selecionada'}
                    {dayRecords[0] ? ` · Talhão ${getTalhaoName(dayRecords[0])}` : ''}
                  </p>
                </div>
                <Badge variant="outline" className="w-fit border-[#DDE4DE] text-[#5A6D5A]">
                  {dayRecords.length} registro(s)
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {dayRecords.length === 0 ? (
                <div className="px-6 py-12 text-center text-sm text-[#5A6D5A]">
                  Não há apontamentos para os filtros selecionados.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[950px] text-left text-xs">
                    <thead className="border-y border-[#DDE4DE] bg-[#F5F7F5] text-[10px] uppercase tracking-wider text-[#5A6D5A]">
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
                    <tbody className="divide-y divide-[#E7ECE7]">
                      {dayRecords.map((record) => {
                        const status = eventStatus(record)
                        const config = EVENT_STATUS[status]
                        return (
                          <tr key={record.id} className="align-top hover:bg-[#F8FAF8]">
                            <td className="whitespace-nowrap px-4 py-3 font-mono text-[#1A2E1A]">
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
}: {
  label: string
  value: string
  unit: string
  icon: ReactNode
  warning?: boolean
}) {
  return (
    <Card
      className={`border shadow-xs ${warning ? 'border-amber-200 bg-amber-50/40' : 'border-[#DDE4DE]'}`}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between text-[#5A6D5A]">
          <span className="text-xs font-semibold">{label}</span>
          <span className={warning ? 'text-amber-700' : 'text-[#1B5E20]'}>{icon}</span>
        </div>
        <div
          className={`mt-3 text-2xl font-bold tracking-tight ${warning ? 'text-amber-800' : 'text-[#1A2E1A]'}`}
        >
          {value}
        </div>
        <div className="mt-1 text-[11px] text-[#5A6D5A]">{unit}</div>
      </CardContent>
    </Card>
  )
}

function EventMap({ records }: { records: HistoricoFeller[] }) {
  const points = records
    .map((record) => ({ record, coordinates: parseLocation(record.localizacao) }))
    .filter(
      (item): item is { record: HistoricoFeller; coordinates: Coordinates } =>
        item.coordinates !== null,
    )

  if (points.length === 0) {
    return (
      <div className="flex min-h-56 items-center justify-center rounded-lg border border-dashed border-[#C8D4C9] bg-[#F5F7F5] px-4 text-center text-sm text-[#5A6D5A]">
        Nenhum evento deste dia possui coordenadas válidas.
      </div>
    )
  }

  const minLat = Math.min(...points.map((point) => point.coordinates.lat))
  const maxLat = Math.max(...points.map((point) => point.coordinates.lat))
  const minLng = Math.min(...points.map((point) => point.coordinates.lng))
  const maxLng = Math.max(...points.map((point) => point.coordinates.lng))
  const latPad = Math.max((maxLat - minLat) * 0.25, 0.0005)
  const lngPad = Math.max((maxLng - minLng) * 0.25, 0.0005)
  const width = 720
  const height = 300
  const pad = 32
  const project = ({ lat, lng }: Coordinates) => ({
    x: pad + ((lng - (minLng - lngPad)) / (maxLng - minLng + lngPad * 2)) * (width - pad * 2),
    y:
      height -
      pad -
      ((lat - (minLat - latPad)) / (maxLat - minLat + latPad * 2)) * (height - pad * 2),
  })
  const projected = points.map((point) => project(point.coordinates))

  return (
    <div className="overflow-hidden rounded-lg border border-[#DDE4DE] bg-[#183820]">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Trajeto relativo dos eventos do Feller com localização registrada"
        className="block h-auto max-h-[340px] w-full"
      >
        <defs>
          <pattern id="feller-map-grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#91A892" strokeOpacity=".12" />
          </pattern>
        </defs>
        <rect width={width} height={height} fill="url(#feller-map-grid)" />
        {projected.length > 1 && (
          <polyline
            points={projected.map(({ x, y }) => `${x},${y}`).join(' ')}
            fill="none"
            stroke="#DDEBD8"
            strokeDasharray="5 5"
            strokeOpacity=".75"
            strokeWidth="2"
          />
        )}
        {points.map(({ record }, index) => {
          const point = projected[index]
          const config = EVENT_STATUS[eventStatus(record)]
          return (
            <g key={record.id}>
              <circle
                cx={point.x}
                cy={point.y}
                r="9"
                fill={config.color}
                stroke="white"
                strokeWidth="2"
              />
              <text
                x={point.x}
                y={point.y - 15}
                fill="white"
                fontSize="11"
                fontFamily="sans-serif"
                textAnchor="middle"
              >
                {formatTime(record.inicio)}
              </text>
            </g>
          )
        })}
      </svg>
      <p className="border-t border-white/10 px-3 py-2 text-[10px] text-emerald-100/80">
        Visualização relativa das coordenadas dos registros; não representa mapa geográfico.
      </p>
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
      <div className="rounded-md bg-[#F5F7F5] px-4 py-6 text-center text-sm text-[#5A6D5A]">
        Não há horários de início e fim suficientes para montar a linha do tempo.
      </div>
    )
  }

  return (
    <div>
      <div
        className="flex h-9 overflow-hidden rounded-md bg-[#EDF1ED]"
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
      <div className="mt-2 flex justify-between font-mono text-[11px] text-[#5A6D5A]">
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
