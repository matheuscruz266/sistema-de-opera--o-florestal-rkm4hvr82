import React, { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { apiService } from '@/services/florestalApi'
import { useAuth } from '@/context/AuthContext'
import {
  InventarioPilha,
  HistoricoDescarga,
  HistoricoPicador,
  ConciliacaoAlerta,
  Pilha,
  Talhao,
  Fazenda,
} from '@/types/florestal'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Trees,
  Compass,
  Flame,
  Layers,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Calendar,
  Building2,
  CheckCircle2,
  Clock,
  Loader2,
  Scale,
  MapPin,
  RefreshCw,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { toast } from 'sonner'
import {
  isStatusCarregamento,
  isStatusDescarga,
  operationalDateKey,
} from '@/lib/historicoOperacional'

export default function DashboardPage() {
  const { user, fazendaAtiva, fazendas } = useAuth()

  const [loading, setLoading] = useState(true)
  const [inventarios, setInventarios] = useState<InventarioPilha[]>([])
  const [descargas, setDescargas] = useState<HistoricoDescarga[]>([])
  const [picadores, setPicadores] = useState<HistoricoPicador[]>([])
  const [alertas, setAlertas] = useState<ConciliacaoAlerta[]>([])
  const [pilhas, setPilhas] = useState<Pilha[]>([])
  const [talhoes, setTalhoes] = useState<Talhao[]>([])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const [invList, descList, picList, alertasList, pilhasList, talhoesList] = await Promise.all([
        apiService.getInventariosPilha(),
        apiService.getHistoricoDescarga(),
        apiService.getHistoricoPicador(),
        apiService.getAlertas(),
        apiService.getPilhas(),
        apiService.getTalhoes(),
      ])

      setInventarios(invList)
      setDescargas(descList)
      setPicadores(picList)
      setAlertas(alertasList)
      setPilhas(pilhasList)
      setTalhoes(talhoesList)
    } catch (err) {
      console.error(err)
      toast.error('Erro ao carregar dados do Dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  // FILTRAGEM POR FAZENDA ATIVA (SE SELECIONADA NO HEADER)
  const pilhasFiltradas = useMemo(() => {
    if (!fazendaAtiva) return pilhas
    return pilhas.filter((p) => p.fazenda_id === fazendaAtiva.id)
  }, [pilhas, fazendaAtiva])

  const pilhasIdsFiltradas = useMemo(() => {
    return new Set(pilhasFiltradas.map((p) => p.id))
  }, [pilhasFiltradas])

  const talhoesFiltrados = useMemo(() => {
    if (!fazendaAtiva) return talhoes
    return talhoes.filter((t) => t.fazenda_id === fazendaAtiva.id)
  }, [talhoes, fazendaAtiva])

  // 1. CARDS DE MÉTRICAS PRINCIPAIS (4 CARDS)
  // Total de Toras Medidas m³ (Soma dos inventários oficiais recentes de cada pilha)
  const totalTorasMedidasM3 = useMemo(() => {
    // Para cada pilha, pega a medição oficial mais recente
    const pilhasMap = new Map<string, number>()
    inventarios
      .filter((i) => i.status_registro === 'oficial')
      .forEach((inv) => {
        if (!fazendaAtiva || pilhasIdsFiltradas.has(inv.pilha_id)) {
          if (!pilhasMap.has(inv.pilha_id)) {
            pilhasMap.set(inv.pilha_id, inv.volume_oficial_m3)
          }
        }
      })
    let total = 0
    pilhasMap.forEach((vol) => {
      total += vol
    })
    // Se não houver inventário oficial, soma das descargas aceitas
    if (total === 0) {
      total = descargas
        .filter(
          (d) =>
            isStatusDescarga(d.status_evento) &&
            d.status_aceite === 'aceito' &&
            (!fazendaAtiva || (d.pilha_destino_id && pilhasIdsFiltradas.has(d.pilha_destino_id))),
        )
        .reduce((acc, d) => acc + (d.volume_m3_calculado || 0), 0)
    }
    return total
  }, [inventarios, descargas, fazendaAtiva, pilhasIdsFiltradas])

  // Total de Cavaco Medido m³ (Soma expedida pelo picador)
  const totalCavacoMedidoM3 = useMemo(() => {
    return picadores
      .filter(
        (p) =>
          isStatusCarregamento(p.status_evento) &&
          (!fazendaAtiva || pilhasIdsFiltradas.has(p.pilha_origem_id)),
      )
      .reduce((acc, p) => acc + (p.volume_cavaco_m3 || 0), 0)
  }, [picadores, fazendaAtiva, pilhasIdsFiltradas])

  // Estoques da Semana m³ (Soma do volume_atual_m3 das pilhas ativas)
  const estoqueSemanaM3 = useMemo(() => {
    return pilhasFiltradas
      .filter((p) => p.status === 'ativa' || p.status === 'em_consumo')
      .reduce((acc, p) => acc + (p.volume_atual_m3 || 0), 0)
  }, [pilhasFiltradas])

  // Divergências Ativas (> 5%) com badge de alerta
  const divergenciasAtivas = useMemo(() => {
    return alertas.filter((a) => {
      if (a.status !== 'pendente' && a.status !== 'em_investigacao') return false
      if (fazendaAtiva && !pilhasIdsFiltradas.has(a.pilha_id)) return false
      return true
    })
  }, [alertas, fazendaAtiva, pilhasIdsFiltradas])

  // 2. GRÁFICO DE PRODUÇÃO (ÚLTIMOS 30 DIAS: Toras vs Cavaco por dia)
  const dadosGraficoProducao = useMemo(() => {
    const diasMap = new Map<string, { data: string; toras: number; cavaco: number }>()

    // Preenche com as datas reais das descargas e do picador
    descargas.forEach((d) => {
      if (!isStatusDescarga(d.status_evento) || d.status_aceite !== 'aceito') return
      if (fazendaAtiva && (!d.pilha_destino_id || !pilhasIdsFiltradas.has(d.pilha_destino_id)))
        return
      const dia = operationalDateKey(d.data_hora_descarga)
      if (!dia) return
      if (!diasMap.has(dia)) {
        diasMap.set(dia, { data: dia, toras: 0, cavaco: 0 })
      }
      diasMap.get(dia)!.toras += Number((d.volume_m3_calculado || 0).toFixed(1))
    })

    picadores.forEach((p) => {
      if (!isStatusCarregamento(p.status_evento)) return
      if (fazendaAtiva && !pilhasIdsFiltradas.has(p.pilha_origem_id)) return
      const dia = operationalDateKey(p.data_hora_expedicao)
      if (!dia) return
      if (!diasMap.has(dia)) {
        diasMap.set(dia, { data: dia, toras: 0, cavaco: 0 })
      }
      diasMap.get(dia)!.cavaco += Number((p.volume_cavaco_m3 || 0).toFixed(1))
    })

    // Ordena por data
    const sorted = Array.from(diasMap.values()).sort((a, b) => a.data.localeCompare(b.data))
    return sorted.slice(-30).map((item) => ({
      ...item,
      dataFormatada: item.data.split('-').slice(1).join('/'),
    }))
  }, [descargas, picadores, fazendaAtiva, pilhasIdsFiltradas])

  // 3. GRÁFICO DE ESTOQUE ATUAL (Rosquinha por Fazenda, destacando a ativa)
  const dadosGraficoEstoque = useMemo(() => {
    const fazendasMap = new Map<string, { id: string; nome: string; volume: number }>()

    fazendas.forEach((f) => {
      fazendasMap.set(f.id, { id: f.id, nome: f.nome, volume: 0 })
    })

    pilhas.forEach((p) => {
      if (p.volume_atual_m3 && p.volume_atual_m3 > 0) {
        if (fazendasMap.has(p.fazenda_id)) {
          fazendasMap.get(p.fazenda_id)!.volume += p.volume_atual_m3
        }
      }
    })

    return Array.from(fazendasMap.values())
      .filter((item) => item.volume > 0)
      .map((item) => ({
        ...item,
        volume: Number(item.volume.toFixed(1)),
        isAtiva: fazendaAtiva?.id === item.id,
      }))
  }, [fazendas, pilhas, fazendaAtiva])

  const CORES_ROSQUINHA = ['#1B5E20', '#2E7D32', '#1565C0', '#FF8F00', '#6A1B9A', '#00838F']

  // 4. LISTA DE ALERTAS RECENTES DE DIVERGÊNCIA (> 5%)
  const alertasRecentes = useMemo(() => {
    return alertas.filter((a) => !fazendaAtiva || pilhasIdsFiltradas.has(a.pilha_id)).slice(0, 5)
  }, [alertas, fazendaAtiva, pilhasIdsFiltradas])

  // 5. PRÓXIMAS ATIVIDADES / TALHÕES PLANEJADOS EM COLHEITA
  const proximasAtividades = useMemo(() => {
    return talhoesFiltrados
      .filter((t) => t.status === 'colheita' || t.status === 'cultivo')
      .slice(0, 5)
  }, [talhoesFiltrados])

  return (
    <div className="space-y-6">
      {/* CABEÇALHO DO DASHBOARD */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A2E1A] flex items-center gap-2">
            <Trees className="w-6 h-6 text-[#1B5E20]" />
            Painel Geral de Operações Florestais
          </h1>
          <p className="text-sm text-[#5A6D5A]">
            Visão consolidada da produção, estoques físicos ToraCerta e conciliações em tempo real.
            {fazendaAtiva ? (
              <span className="font-semibold text-[#1B5E20] ml-1">
                [Filtrado: {fazendaAtiva.nome}]
              </span>
            ) : (
              <span className="text-neutral-500 ml-1">[Todas as Fazendas]</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadDashboardData}
            className="border-[#DDE4DE] text-[#1A2E1A] hover:bg-neutral-50 h-9"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Atualizar
          </Button>
          <Button asChild className="bg-[#1B5E20] hover:bg-[#14521A] text-white h-9 text-xs">
            <Link to="/toracerta">
              <Compass className="w-4 h-4 mr-1.5" />
              Novo Inventário ToraCerta
            </Link>
          </Button>
        </div>
      </div>

      {/* 4 CARDS DE MÉTRICAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total de Toras Medidas */}
        <Card className="border-[#DDE4DE] shadow-xs bg-white">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#5A6D5A]">Toras Medidas</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#1B5E20] flex items-center justify-center">
                <Compass className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-bold tracking-tight text-[#1A2E1A] font-mono block">
                {loading ? '—' : `${totalTorasMedidasM3.toFixed(1)} m³`}
              </span>
              <span className="text-[11px] text-[#5A6D5A]">Inventários oficiais vigentes</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Total de Cavaco Medido */}
        <Card className="border-[#DDE4DE] shadow-xs bg-white">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#5A6D5A]">Cavaco Expedido</span>
              <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FF8F00] flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-bold tracking-tight text-[#1A2E1A] font-mono block">
                {loading ? '—' : `${totalCavacoMedidoM3.toFixed(1)} m³`}
              </span>
              <span className="text-[11px] text-[#5A6D5A]">Expedição via picador com NF</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Estoques da Semana */}
        <Card className="border-[#DDE4DE] shadow-xs bg-white">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#5A6D5A]">Estoque Ativo em Pátio</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1565C0] flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-bold tracking-tight text-[#1A2E1A] font-mono block">
                {loading ? '—' : `${estoqueSemanaM3.toFixed(1)} m³`}
              </span>
              <span className="text-[11px] text-[#5A6D5A]">
                {pilhasFiltradas.length} pilhas cadastradas
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Divergências Ativas */}
        <Card
          className={`border-2 shadow-xs transition-colors ${
            divergenciasAtivas.length > 0
              ? 'border-[#C62828] bg-red-50/20'
              : 'border-[#DDE4DE] bg-white'
          }`}
        >
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#5A6D5A]">Divergências Ativas</span>
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  divergenciasAtivas.length > 0
                    ? 'bg-red-100 text-[#C62828]'
                    : 'bg-emerald-50 text-[#1B5E20]'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-bold tracking-tight text-[#1A2E1A] font-mono block">
                  {loading ? '—' : divergenciasAtivas.length}
                </span>
                <span className="text-[11px] text-[#5A6D5A]">Acima do limiar (5%)</span>
              </div>
              {divergenciasAtivas.length > 0 ? (
                <Badge className="bg-[#C62828] text-white text-[10px] animate-pulse">Atenção</Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-[10px] border-emerald-500 text-emerald-700"
                >
                  Conforme
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* GRÁFICOS: PRODUÇÃO DIÁRIA & ESTOQUE POR FAZENDA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* GRÁFICO 1: Toras vs Cavaco (Barras, últimos 30 dias) */}
        <Card className="lg:col-span-2 border-[#DDE4DE] shadow-xs bg-white">
          <CardHeader className="p-4 border-b border-[#DDE4DE] flex flex-row items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#1A2E1A] uppercase tracking-wide block">
                Histórico Diário de Produção (Últimos 30 dias)
              </span>
              <span className="text-[11px] text-[#5A6D5A]">
                Entrada de Toras (m³) vs Expedição de Cavaco (m³)
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {loading ? (
              <div className="h-64 flex flex-col items-center justify-center text-[#5A6D5A] gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-[#1B5E20]" />
                <span className="text-xs">Carregando série temporal...</span>
              </div>
            ) : dadosGraficoProducao.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-[#5A6D5A] gap-2 bg-neutral-50/50 rounded-lg border border-dashed border-[#DDE4DE]">
                <Trees className="w-8 h-8 text-neutral-300" />
                <span className="text-xs font-medium">
                  Nenhum movimento registrado nos últimos 30 dias.
                </span>
                <span className="text-[11px] text-neutral-400">
                  Os dados reais aparecerão conforme descargas e picagens forem apontadas.
                </span>
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dadosGraficoProducao}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E0E6E0" vertical={false} />
                    <XAxis dataKey="dataFormatada" tick={{ fontSize: 11, fill: '#5A6D5A' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#5A6D5A' }} />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderColor: '#DDE4DE',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                      formatter={(val: any) => [`${val} m³`]}
                    />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                    <Bar
                      dataKey="toras"
                      name="Toras Recebidas (m³)"
                      fill="#1B5E20"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="cavaco"
                      name="Cavaco Expedido (m³)"
                      fill="#FF8F00"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* GRÁFICO 2: Estoque Atual por Fazenda (Rosquinha) */}
        <Card className="border-[#DDE4DE] shadow-xs bg-white">
          <CardHeader className="p-4 border-b border-[#DDE4DE]">
            <span className="text-xs font-bold text-[#1A2E1A] uppercase tracking-wide block">
              Distribuição de Estoque por Fazenda
            </span>
            <span className="text-[11px] text-[#5A6D5A]">Volume físico atual em pátio (m³)</span>
          </CardHeader>
          <CardContent className="p-4">
            {loading ? (
              <div className="h-64 flex flex-col items-center justify-center text-[#5A6D5A]">
                <Loader2 className="w-6 h-6 animate-spin text-[#1B5E20]" />
              </div>
            ) : dadosGraficoEstoque.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-[#5A6D5A] gap-2 bg-neutral-50/50 rounded-lg border border-dashed border-[#DDE4DE]">
                <Building2 className="w-8 h-8 text-neutral-300" />
                <span className="text-xs font-medium">Sem estoque registrado nas fazendas.</span>
              </div>
            ) : (
              <div className="h-64 w-full flex flex-col items-center justify-center">
                <ResponsiveContainer width="100%" height={190}>
                  <PieChart>
                    <Pie
                      data={dadosGraficoEstoque}
                      dataKey="volume"
                      nameKey="nome"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                    >
                      {dadosGraficoEstoque.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CORES_ROSQUINHA[index % CORES_ROSQUINHA.length]}
                          stroke={entry.isAtiva ? '#1A2E1A' : '#ffffff'}
                          strokeWidth={entry.isAtiva ? 3 : 1}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderColor: '#DDE4DE',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                      formatter={(val: any) => [`${val} m³`, 'Volume']}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Legenda customizada */}
                <div className="w-full space-y-1 mt-2">
                  {dadosGraficoEstoque.map((item, idx) => (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between text-[11px] px-2 py-0.5 rounded ${
                        item.isAtiva ? 'bg-emerald-50 font-bold text-[#1B5E20]' : 'text-[#5A6D5A]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: CORES_ROSQUINHA[idx % CORES_ROSQUINHA.length] }}
                        />
                        <span className="truncate">{item.nome}</span>
                      </div>
                      <span className="font-mono font-semibold">{item.volume} m³</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* DUAS SEÇÕES: ALERTAS RECENTES & PRÓXIMAS ATIVIDADES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ALERTAS RECENTES DE DIVERGÊNCIA */}
        <Card className="border-[#DDE4DE] shadow-xs bg-white">
          <CardHeader className="p-4 border-b border-[#DDE4DE] flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#C62828]" />
              <span className="text-xs font-bold text-[#1A2E1A] uppercase tracking-wide">
                Alertas Recentes de Divergência (&gt; 5%)
              </span>
            </div>
            <Button asChild variant="ghost" size="sm" className="h-7 text-xs text-[#1B5E20]">
              <Link to="/conciliacao">
                Ver todos
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {alertasRecentes.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#5A6D5A]">
                Nenhum alerta de divergência registrado. O sistema está com 100% de conciliação.
              </div>
            ) : (
              <div className="divide-y divide-[#DDE4DE]">
                {alertasRecentes.map((alerta) => {
                  const pilha =
                    alerta.expand?.pilha_id || pilhas.find((p) => p.id === alerta.pilha_id)
                  const isPendente = alerta.status === 'pendente'

                  return (
                    <div
                      key={alerta.id}
                      className="p-3.5 flex items-center justify-between hover:bg-neutral-50/80 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-[#1A2E1A]">
                            {pilha?.codigo || 'PILHA'}
                          </span>
                          <span className="text-[10px] text-[#5A6D5A] font-mono">
                            {alerta.data_identificacao}
                          </span>
                          <Badge
                            className={`text-[9px] ${
                              isPendente ? 'bg-[#C62828] text-white' : 'bg-emerald-600 text-white'
                            }`}
                          >
                            {alerta.diferenca_perc.toFixed(1)}% div.
                          </Badge>
                        </div>
                        <p className="text-[11px] text-[#5A6D5A] line-clamp-1">
                          Saldo movimentos: {alerta.saldo_calculado_m3} m³ vs Físico:{' '}
                          {alerta.inventario_fisico_m3} m³ (Diferença: {alerta.diferenca_m3} m³)
                        </p>
                      </div>

                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs border-[#DDE4DE] text-[#1B5E20] hover:bg-emerald-50 shrink-0"
                      >
                        <Link to="/conciliacao">Investigar</Link>
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* PRÓXIMAS ATIVIDADES: TALHÕES EM COLHEITA / CULTIVO */}
        <Card className="border-[#DDE4DE] shadow-xs bg-white">
          <CardHeader className="p-4 border-b border-[#DDE4DE] flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#1B5E20]" />
              <span className="text-xs font-bold text-[#1A2E1A] uppercase tracking-wide">
                Talhões Ativos em Operação
              </span>
            </div>
            <Button asChild variant="ghost" size="sm" className="h-7 text-xs text-[#1B5E20]">
              <Link to="/cadastros/talhoes">
                Gerenciar
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {proximasAtividades.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#5A6D5A]">
                Nenhum talhão agendado para colheita ou cultivo nesta fazenda.
              </div>
            ) : (
              <div className="divide-y divide-[#DDE4DE]">
                {proximasAtividades.map((talhao) => {
                  const fazenda =
                    talhao.expand?.fazenda_id || fazendas.find((f) => f.id === talhao.fazenda_id)
                  const isColheita = talhao.status === 'colheita'

                  return (
                    <div
                      key={talhao.id}
                      className="p-3.5 flex items-center justify-between hover:bg-neutral-50/80 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-[#1B5E20]">
                            {talhao.talhao}
                          </span>
                          <span className="text-[11px] font-medium text-[#1A2E1A]">
                            {talhao.especie || 'Eucalyptus'}
                          </span>
                          <Badge
                            className={`text-[9px] ${
                              isColheita
                                ? 'bg-emerald-600 text-white'
                                : 'bg-neutral-200 text-neutral-800'
                            }`}
                          >
                            {talhao.status}
                          </Badge>
                        </div>
                        <div className="text-[11px] text-[#5A6D5A] flex items-center gap-3">
                          <span>{fazenda?.nome || 'Fazenda'}</span>
                          <span>•</span>
                          <span>Área: {talhao.area_ha || 0} ha</span>
                        </div>
                      </div>

                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-[#1565C0] hover:bg-blue-50"
                      >
                        <Link to="/rastreabilidade">
                          Rastrear
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
