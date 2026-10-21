import React, { useEffect, useState, useMemo } from 'react'
import { apiService } from '@/services/florestalApi'
import { useAuth } from '@/context/AuthContext'
import {
  Talhao,
  Fazenda,
  HistoricoFeller,
  HistoricoSkidder,
  HistoricoBaldeio,
  HistoricoDescarga,
  HistoricoPicador,
  Pilha,
} from '@/types/florestal'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  GitBranch,
  MapPin,
  Tractor,
  ArrowRightLeft,
  ArrowDownToLine,
  Flame,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
  Truck,
  Loader2,
  RefreshCw,
  Search,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  formatDataHoraOperacional,
  formatNotaFiscal,
  formatTempoHorasMinutos,
  isStatusCarregamento,
  isStatusDescarga,
  notaFiscalValida,
} from '@/lib/historicoOperacional'

export default function RastreabilidadePage() {
  const { fazendaAtiva } = useAuth()

  const [talhoes, setTalhoes] = useState<Talhao[]>([])
  const [talhaoSelecionadoId, setTalhaoSelecionadoId] = useState<string>('')
  const [pilhas, setPilhas] = useState<Pilha[]>([])

  // Os 5 históricos da cadeia completa
  const [fellers, setFellers] = useState<HistoricoFeller[]>([])
  const [skidders, setSkidders] = useState<HistoricoSkidder[]>([])
  const [baldeios, setBaldeios] = useState<HistoricoBaldeio[]>([])
  const [descargas, setDescargas] = useState<HistoricoDescarga[]>([])
  const [picadores, setPicadores] = useState<HistoricoPicador[]>([])

  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    setLoading(true)
    try {
      const [talList, pilhasList, fellList, skidList, baldList, descList, picList] =
        await Promise.all([
          apiService.getTalhoes(fazendaAtiva?.id),
          apiService.getPilhas(fazendaAtiva?.id),
          apiService.getHistoricoFeller(),
          apiService.getHistoricoSkidder(),
          apiService.getHistoricoBaldeio(),
          apiService.getHistoricoDescarga(),
          apiService.getHistoricoPicador(),
        ])

      setTalhoes(talList)
      setPilhas(pilhasList)
      setFellers(fellList)
      setSkidders(skidList)
      setBaldeios(baldList)
      setDescargas(descList)
      setPicadores(picList)

      if (talList.length > 0) {
        if (!talhaoSelecionadoId || !talList.some((t) => t.id === talhaoSelecionadoId)) {
          setTalhaoSelecionadoId(talList[0].id)
        }
      } else {
        setTalhaoSelecionadoId('')
      }
    } catch (err) {
      console.error(err)
      toast.error('Erro ao carregar dados da cadeia de rastreabilidade')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [fazendaAtiva])

  // Talhão selecionado atual
  const talhaoAtual = useMemo(() => {
    return talhoes.find((t) => t.id === talhaoSelecionadoId) || null
  }, [talhoes, talhaoSelecionadoId])

  // 1. Histórico Feller neste talhão
  const fellersTalhao = useMemo(() => {
    return fellers.filter((f) => f.talhao_id === talhaoSelecionadoId)
  }, [fellers, talhaoSelecionadoId])

  // 2. Histórico Skidder neste talhão
  const skiddersTalhao = useMemo(() => {
    return skidders.filter((s) => s.talhao_id === talhaoSelecionadoId)
  }, [skidders, talhaoSelecionadoId])

  // 3. Histórico de Baldeio originado neste talhão (Saída do talhão com volume SR e placa)
  const baldeiosTalhao = useMemo(() => {
    return baldeios.filter(
      (b) => isStatusCarregamento(b.status_evento) && b.talhao_origem_id === talhaoSelecionadoId,
    )
  }, [baldeios, talhaoSelecionadoId])

  // Identificação de pilhas de destino que receberam madeira deste talhão
  const pilhasAlcancadasIds = useMemo(() => {
    const ids = new Set<string>()
    baldeiosTalhao.forEach((b) => {
      if (b.pilha_destino_id) ids.add(b.pilha_destino_id)
    })
    // Também inclui pilhas explicitamente vinculadas a este talhão
    pilhas.forEach((p) => {
      if (p.talhao_id === talhaoSelecionadoId) ids.add(p.id)
    })
    return Array.from(ids)
  }, [baldeiosTalhao, pilhas, talhaoSelecionadoId])

  // 4. Histórico de Descarga no Pátio (recebimento nas pilhas alcançadas)
  // Juntamos baldeio e descarga por placa / viagem / pilha para evidenciar divergência SR
  const descargasTalhao = useMemo(() => {
    return descargas.filter(
      (d) =>
        isStatusDescarga(d.status_evento) &&
        Boolean(d.pilha_destino_id) &&
        pilhasAlcancadasIds.includes(d.pilha_destino_id || ''),
    )
  }, [descargas, pilhasAlcancadasIds])

  // 5. Histórico do Picador (consumo nas pilhas de origem e expedição para NF e cliente)
  const picadoresTalhao = useMemo(() => {
    return picadores.filter(
      (p) =>
        isStatusCarregamento(p.status_evento) && pilhasAlcancadasIds.includes(p.pilha_origem_id),
    )
  }, [picadores, pilhasAlcancadasIds])

  // ANÁLISE DE DIVERGÊNCIA ENTRE BALDEIO E DESCARGA
  // Comparação de SR declarado no carregamento do talhão vs SR registrado no recebimento do pátio
  const comparativoCargas = useMemo(() => {
    return baldeiosTalhao.map((bal) => {
      // Procura descarga correspondente por caminhão e pilha próxima no tempo
      const descCorrespondente = descargasTalhao.find(
        (d) =>
          Boolean(bal.pilha_destino_id) &&
          Boolean(bal.caminhao_baldeio_id) &&
          d.pilha_destino_id === bal.pilha_destino_id &&
          d.caminhao_baldeio_id === bal.caminhao_baldeio_id,
      )

      const srBaldeio = bal.volume_sr || 0
      const srDescarga = descCorrespondente ? descCorrespondente.volume_sr : null
      const diffSr = srDescarga !== null ? srDescarga - srBaldeio : 0
      const diffPerc =
        srBaldeio > 0 && srDescarga !== null ? (Math.abs(diffSr) / srBaldeio) * 100 : 0
      const temDivergencia = diffPerc > 2.0 // tolerância operacional de 2%

      return {
        baldeio: bal,
        descarga: descCorrespondente,
        srBaldeio,
        srDescarga,
        diffSr,
        diffPerc,
        temDivergencia,
      }
    })
  }, [baldeiosTalhao, descargasTalhao])

  // Totais consolidados da rastreabilidade
  const totaisCadeia = useMemo(() => {
    const totalArvores = fellersTalhao.reduce((acc, f) => acc + (f.arvores_derrubadas || 0), 0)
    const totalHorasCorte =
      fellersTalhao.reduce((acc, f) => acc + (f.horas_trabalhadas || 0), 0) +
      skiddersTalhao.reduce((acc, s) => acc + (s.horas_trabalhadas || 0), 0)
    const totalSrBaldeado = baldeiosTalhao.reduce((acc, b) => acc + (b.volume_sr || 0), 0)
    const totalM3Recebido = descargasTalhao
      .filter((d) => d.status_aceite === 'aceito')
      .reduce((acc, d) => acc + (d.volume_m3_calculado || 0), 0)
    const totalCavacoExpedidoM3 = picadoresTalhao.reduce(
      (acc, p) => acc + (p.volume_cavaco_m3 || 0),
      0,
    )
    const notasFiscaisGeradas = Array.from(
      new Set(
        picadoresTalhao
          .map((p) => notaFiscalValida(p.nota_fiscal))
          .filter((nota): nota is string => nota !== null),
      ),
    )

    return {
      totalArvores,
      totalHorasCorte,
      totalSrBaldeado,
      totalM3Recebido,
      totalCavacoExpedidoM3,
      notasFiscaisCount: notasFiscaisGeradas.length,
      notasFiscaisGeradas,
    }
  }, [fellersTalhao, skiddersTalhao, baldeiosTalhao, descargasTalhao, picadoresTalhao])

  return (
    <div className="space-y-6">
      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A2E1A] flex items-center gap-2">
            <GitBranch className="w-6 h-6 text-[#1565C0]" />
            Rastreabilidade Completa da Cadeia Florestal (Núcleo E)
          </h1>
          <p className="text-sm text-[#5A6D5A]">
            Consulta ponta a ponta a partir de um talhão: Feller/Skidder → Baldeio → Descarga Pátio
            → Pilha/Lote → Picador → Nota Fiscal & Cliente.
          </p>
        </div>

        {/* SELETOR DO TALHÃO */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Label className="text-xs font-semibold text-[#5A6D5A] shrink-0">Talhão Alvo:</Label>
          <Select value={talhaoSelecionadoId} onValueChange={setTalhaoSelecionadoId}>
            <SelectTrigger className="h-9 w-full sm:w-64 text-xs font-bold border-[#1565C0]/40">
              <SelectValue placeholder="Selecione um talhão..." />
            </SelectTrigger>
            <SelectContent>
              {talhoes.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.talhao} — {t.especie || 'Eucalipto'} ({t.area_ha || 0} ha)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* PAINEL DE DADOS DO TALHÃO E CONSOLIDAÇÃO */}
      {talhaoAtual && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Card className="border-[#DDE4DE] shadow-2xs bg-white">
            <CardContent className="p-3.5 space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#5A6D5A] block">
                Origem Florestal
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-bold text-[#1A2E1A] font-mono">
                  {talhaoAtual.talhao}
                </span>
                <Badge variant="outline" className="text-[10px] capitalize">
                  {talhaoAtual.status}
                </Badge>
              </div>
              <span className="text-xs text-[#5A6D5A] block">
                {talhaoAtual.especie || 'Eucalyptus'} • {talhaoAtual.area_ha || 0} ha
              </span>
            </CardContent>
          </Card>

          <Card className="border-[#DDE4DE] shadow-2xs bg-white">
            <CardContent className="p-3.5 space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#5A6D5A] block">
                Colheita (Feller & Skidder)
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-bold text-[#1B5E20] font-mono">
                  {totaisCadeia.totalArvores} árvores
                </span>
                <span className="text-xs text-[#5A6D5A] font-mono">
                  {totaisCadeia.totalHorasCorte}h op.
                </span>
              </div>
              <span className="text-xs text-[#5A6D5A] block">
                {fellersTalhao.length} ops Feller • {skiddersTalhao.length} ops Skidder
              </span>
            </CardContent>
          </Card>

          <Card className="border-[#DDE4DE] shadow-2xs bg-white">
            <CardContent className="p-3.5 space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#5A6D5A] block">
                Transporte & Recepção Pátio
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-bold text-[#1565C0] font-mono">
                  {totaisCadeia.totalSrBaldeado.toFixed(1)} SR
                </span>
                <span className="text-xs font-mono font-bold text-[#1B5E20]">
                  {totaisCadeia.totalM3Recebido.toFixed(1)} m³
                </span>
              </div>
              <span className="text-xs text-[#5A6D5A] block">
                {baldeiosTalhao.length} viagens baldeio • {descargasTalhao.length} descargas
              </span>
            </CardContent>
          </Card>

          <Card className="border-[#DDE4DE] shadow-2xs bg-white">
            <CardContent className="p-3.5 space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#5A6D5A] block">
                Processamento & Expedição
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-bold text-[#FF8F00] font-mono">
                  {totaisCadeia.totalCavacoExpedidoM3.toFixed(1)} m³
                </span>
                <Badge className="bg-emerald-600 text-white text-[10px]">
                  {totaisCadeia.notasFiscaisCount} NFs
                </Badge>
              </div>
              <span className="text-xs text-[#5A6D5A] block truncate">
                {totaisCadeia.notasFiscaisGeradas.join(', ') || 'Nenhuma NF expedida ainda'}
              </span>
            </CardContent>
          </Card>
        </div>
      )}

      {/* DESTAQUE DE DIVERGÊNCIA: SR CARREGAMENTO vs SR RECEBIMENTO */}
      <Card className="border-amber-300 bg-amber-50/40 shadow-xs">
        <CardHeader className="py-3 px-4 border-b border-amber-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              Auditoria de Carga: SR Declarado no Baldeio vs SR no Recebimento do Pátio
            </span>
            <span className="text-[11px] text-amber-800">
              Tolerância operacional normal: <strong>±2,0%</strong>
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {comparativoCargas.length === 0 ? (
            <div className="py-6 text-center text-xs text-[#5A6D5A]">
              Nenhum baldeio de toras registrado para este talhão até o momento.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-amber-100/60 text-amber-950 font-semibold border-b border-amber-200">
                <tr>
                  <th className="py-2.5 px-4">Viagem</th>
                  <th className="py-2.5 px-4">Caminhão Baldeio</th>
                  <th className="py-2.5 px-4">Data Saída Talhão</th>
                  <th className="py-2.5 px-4 text-right">SR Declarado (Saída)</th>
                  <th className="py-2.5 px-4 text-right">SR Conferido (Descarga)</th>
                  <th className="py-2.5 px-4 text-right">Diferença SR</th>
                  <th className="py-2.5 px-4 text-center">Variação %</th>
                  <th className="py-2.5 px-4 text-center">Status Auditoria</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-200/60">
                {comparativoCargas.map((item, idx) => {
                  const caminhao = item.baldeio.expand?.caminhao_baldeio_id
                  return (
                    <tr
                      key={idx}
                      className={item.temDivergencia ? 'bg-red-50/50 font-medium' : 'bg-white/80'}
                    >
                      <td className="py-2.5 px-4 font-mono font-bold text-[#1A2E1A]">
                        {item.baldeio.numero_viagem || `VG-${item.baldeio.id.slice(0, 5)}`}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-[#1B5E20]">
                        {caminhao?.placa_baldeio || 'BALDEIO'}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-[#5A6D5A]">
                        {item.baldeio.data_hora_saida.replace('T', ' ')}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-[#1A2E1A]">
                        {item.srBaldeio.toFixed(2)} SR
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-[#1A2E1A]">
                        {item.srDescarga !== null ? `${item.srDescarga.toFixed(2)} SR` : 'Pendente'}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono">
                        {item.srDescarga !== null ? (
                          <span
                            className={
                              Math.abs(item.diffSr) > 0.5
                                ? 'text-red-700 font-bold'
                                : 'text-[#1B5E20]'
                            }
                          >
                            {item.diffSr > 0
                              ? `+${item.diffSr.toFixed(2)}`
                              : item.diffSr.toFixed(2)}{' '}
                            SR
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-center font-mono">
                        {item.srDescarga !== null ? (
                          <Badge
                            className={`text-[10px] ${
                              item.temDivergencia
                                ? 'bg-[#C62828] text-white'
                                : 'bg-emerald-600 text-white'
                            }`}
                          >
                            {item.diffPerc.toFixed(1)}%
                          </Badge>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        {item.temDivergencia ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] border-red-500 text-red-600"
                          >
                            Divergência de Carga
                          </Badge>
                        ) : item.srDescarga !== null ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] border-emerald-500 text-emerald-700"
                          >
                            Conforme
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[10px] text-amber-600 border-amber-300"
                          >
                            Em trânsito
                          </Badge>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* LINHA DO TEMPO DA CADEIA COMPLETA (5 ETAPAS) */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-[#1A2E1A] flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#1B5E20]" />
          Linha do Tempo Operacional por Talhão ({talhaoAtual?.talhao})
        </h2>

        {/* ETAPA 1: CORTE (FELLER BUNCHER) */}
        <Card className="border-[#DDE4DE] shadow-xs">
          <CardHeader className="py-3 px-4 border-b border-[#DDE4DE] bg-neutral-50 flex flex-row items-center justify-between">
            <span className="text-xs font-bold text-[#1A2E1A] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#1B5E20] text-white text-[10px] flex items-center justify-center font-bold">
                1
              </span>
              Corte & Derrubada — Histórico Feller ({fellersTalhao.length})
            </span>
            <span className="text-xs text-[#5A6D5A]">
              Equipamento primário de colheita no talhão
            </span>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            {fellersTalhao.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#5A6D5A]">
                Nenhuma operação de Feller registrada neste talhão.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F7F5] text-[#5A6D5A] font-semibold border-b border-[#DDE4DE]">
                  <tr>
                    <th className="py-2.5 px-4">Data Operação</th>
                    <th className="py-2.5 px-4">Máquina</th>
                    <th className="py-2.5 px-4 text-right">Horas Trabalhadas</th>
                    <th className="py-2.5 px-4 text-right">Combustível (L)</th>
                    <th className="py-2.5 px-4 text-right">Árvores Derrubadas</th>
                    <th className="py-2.5 px-4">Observações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDE4DE]">
                  {fellersTalhao.map((f) => {
                    const maquina = f.expand?.maquina_id
                    return (
                      <tr key={f.id} className="hover:bg-neutral-50/80">
                        <td className="py-2.5 px-4 font-mono">{f.data_operacao}</td>
                        <td className="py-2.5 px-4 font-bold text-[#1B5E20]">
                          {maquina?.id_maquina || 'FELLER'} ({maquina?.equipamento || 'CAT'})
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold">
                          {formatTempoHorasMinutos(f.tempo)}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono">
                          {f.combustivel_litros} L
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-[#1B5E20]">
                          {f.arvores_derrubadas || 0}
                        </td>
                        <td className="py-2.5 px-4 text-[#5A6D5A]">{f.observacoes || '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* ETAPA 2: ARRASTE (SKIDDER) */}
        <Card className="border-[#DDE4DE] shadow-xs">
          <CardHeader className="py-3 px-4 border-b border-[#DDE4DE] bg-neutral-50 flex flex-row items-center justify-between">
            <span className="text-xs font-bold text-[#1A2E1A] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#1B5E20] text-white text-[10px] flex items-center justify-center font-bold">
                2
              </span>
              Arraste de Feixes — Histórico Skidder ({skiddersTalhao.length})
            </span>
            <span className="text-xs text-[#5A6D5A]">
              Movimentação das árvores do interior do talhão até a beira de talhão
            </span>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            {skiddersTalhao.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#5A6D5A]">
                Nenhum ciclo de Skidder apontado para este talhão.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F7F5] text-[#5A6D5A] font-semibold border-b border-[#DDE4DE]">
                  <tr>
                    <th className="py-2.5 px-4">Data Operação</th>
                    <th className="py-2.5 px-4">Máquina</th>
                    <th className="py-2.5 px-4 text-right">Horas Trabalhadas</th>
                    <th className="py-2.5 px-4 text-right">Combustível (L)</th>
                    <th className="py-2.5 px-4 text-right">Ciclos de Arraste</th>
                    <th className="py-2.5 px-4">Observações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDE4DE]">
                  {skiddersTalhao.map((s) => {
                    const maquina = s.expand?.maquina_id
                    return (
                      <tr key={s.id} className="hover:bg-neutral-50/80">
                        <td className="py-2.5 px-4 font-mono">{s.data_operacao}</td>
                        <td className="py-2.5 px-4 font-bold text-[#1B5E20]">
                          {maquina?.id_maquina || 'SKIDDER'} ({maquina?.equipamento || 'JD'})
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold">
                          {formatTempoHorasMinutos(s.tempo)}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono">
                          {s.combustivel_litros} L
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-[#1B5E20]">
                          {s.ciclos_arraste || 0} ciclos
                        </td>
                        <td className="py-2.5 px-4 text-[#5A6D5A]">{s.observacoes || '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* ETAPA 3: BALDEIO (TRANSPORTE INTERNO: TALHÃO → PÁTIO) */}
        <Card className="border-[#DDE4DE] shadow-xs">
          <CardHeader className="py-3 px-4 border-b border-[#DDE4DE] bg-neutral-50 flex flex-row items-center justify-between">
            <span className="text-xs font-bold text-[#1A2E1A] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#1565C0] text-white text-[10px] flex items-center justify-center font-bold">
                3
              </span>
              Baldeio de Toras — Saída do Talhão ({baldeiosTalhao.length})
            </span>
            <span className="text-xs text-[#5A6D5A]">
              Carregamento de toras em carretas de transbordo (unidade SR operacional)
            </span>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            {baldeiosTalhao.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#5A6D5A]">
                Nenhum baldeio registrado a partir deste talhão.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F7F5] text-[#5A6D5A] font-semibold border-b border-[#DDE4DE]">
                  <tr>
                    <th className="py-2.5 px-4">Nº Viagem</th>
                    <th className="py-2.5 px-4">Placa Baldeio</th>
                    <th className="py-2.5 px-4">Data / Hora Saída</th>
                    <th className="py-2.5 px-4">Pilha Destino</th>
                    <th className="py-2.5 px-4 text-right">Volume SR</th>
                    <th className="py-2.5 px-4 text-right">Volume m³ Est.</th>
                    <th className="py-2.5 px-4">Motorista</th>
                    <th className="py-2.5 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDE4DE]">
                  {baldeiosTalhao.map((b) => {
                    const caminhao = b.expand?.caminhao_baldeio_id
                    const pilhaDest = b.expand?.pilha_destino_id
                    return (
                      <tr key={b.id} className="hover:bg-neutral-50/80">
                        <td className="py-2.5 px-4 font-mono font-bold text-[#1A2E1A]">
                          {b.numero_viagem || '—'}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-[#1565C0] font-bold">
                          {caminhao?.placa_baldeio || 'BALDEIO'}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-[#5A6D5A]">
                          {b.data_hora_saida?.replace('T', ' ') || '—'}
                        </td>
                        <td className="py-2.5 px-4 font-bold text-[#1B5E20]">
                          {pilhaDest?.codigo || 'PILHA'}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-[#1A2E1A]">
                          {b.volume_sr != null && b.volume_sr > 0
                            ? `${b.volume_sr} SR${b.sr_toras_tipo ? ` · ${b.sr_toras_tipo}` : ''}`
                            : b.sr_toras_tipo || '—'}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono text-[#5A6D5A]">
                          {b.volume_m3_estimado ? `${b.volume_m3_estimado} m³` : '—'}
                        </td>
                        <td className="py-2.5 px-4 text-[#5A6D5A]">{b.motorista || '—'}</td>
                        <td className="py-2.5 px-4 text-center">
                          <Badge className="bg-emerald-600 text-white text-[10px]">
                            {b.status_baldeio || b.status_evento || '—'}
                          </Badge>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* ETAPA 4: DESCARGA NO PÁTIO / ACEITE DE ESTOQUE */}
        <Card className="border-[#DDE4DE] shadow-xs">
          <CardHeader className="py-3 px-4 border-b border-[#DDE4DE] bg-neutral-50 flex flex-row items-center justify-between">
            <span className="text-xs font-bold text-[#1A2E1A] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#2E7D32] text-white text-[10px] flex items-center justify-center font-bold">
                4
              </span>
              Descarga & Aceite no Pátio — Entrada na Pilha ({descargasTalhao.length})
            </span>
            <span className="text-xs text-[#5A6D5A]">
              Recepção física do lote com conferência e pesagem estimada
            </span>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            {descargasTalhao.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#5A6D5A]">
                Nenhuma descarga efetuada nas pilhas de destino deste talhão.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F7F5] text-[#5A6D5A] font-semibold border-b border-[#DDE4DE]">
                  <tr>
                    <th className="py-2.5 px-4">Data / Hora Descarga</th>
                    <th className="py-2.5 px-4">Pilha Destino</th>
                    <th className="py-2.5 px-4">Caminhão Baldeio</th>
                    <th className="py-2.5 px-4 text-right">Volume SR</th>
                    <th className="py-2.5 px-4 text-right">Volume m³ Calculado</th>
                    <th className="py-2.5 px-4 text-right">Peso Líquido (t)</th>
                    <th className="py-2.5 px-4">Conferente</th>
                    <th className="py-2.5 px-4 text-center">Situação Aceite</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDE4DE]">
                  {descargasTalhao.map((d) => {
                    const caminhao = d.expand?.caminhao_baldeio_id
                    const pilhaDest = d.expand?.pilha_destino_id
                    return (
                      <tr key={d.id} className="hover:bg-neutral-50/80">
                        <td className="py-2.5 px-4 font-mono">
                          {d.data_hora_descarga?.replace('T', ' ') || '—'}
                        </td>
                        <td className="py-2.5 px-4 font-mono font-bold text-[#1B5E20]">
                          {pilhaDest?.codigo || 'PILHA'}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-[#1565C0]">
                          {caminhao?.placa_baldeio || 'BALDEIO'}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold">
                          {d.volume_sr != null && d.volume_sr > 0
                            ? `${d.volume_sr} SR${d.sr_toras_tipo ? ` · ${d.sr_toras_tipo}` : ''}`
                            : d.sr_toras_tipo || '—'}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-[#1B5E20]">
                          {d.volume_m3_calculado != null && d.volume_m3_calculado > 0
                            ? `${d.volume_m3_calculado.toFixed(2)} m³`
                            : '—'}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono text-[#5A6D5A]">
                          {d.peso_liquido_t ? `${d.peso_liquido_t} t` : '—'}
                        </td>
                        <td className="py-2.5 px-4 text-[#5A6D5A]">{d.conferente_nome || '—'}</td>
                        <td className="py-2.5 px-4 text-center">
                          <Badge className="bg-emerald-600 text-white text-[10px]">
                            {d.status_aceite}
                          </Badge>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* ETAPA 5: CONSUMO PICADOR & NOTA FISCAL (EXPEDIÇÃO CLIENTE) */}
        <Card className="border-[#DDE4DE] shadow-xs">
          <CardHeader className="py-3 px-4 border-b border-[#DDE4DE] bg-neutral-50 flex flex-row items-center justify-between">
            <span className="text-xs font-bold text-[#1A2E1A] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#FF8F00] text-white text-[10px] flex items-center justify-center font-bold">
                5
              </span>
              Picador & Expedição — Nota Fiscal e Cliente ({picadoresTalhao.length})
            </span>
            <span className="text-xs text-[#5A6D5A]">
              Transformação em cavaco, saída para carreta rodoviária e faturamento
            </span>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            {picadoresTalhao.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#5A6D5A]">
                Nenhuma expedição de cavaco associada às pilhas deste talhão até o momento.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F7F5] text-[#5A6D5A] font-semibold border-b border-[#DDE4DE]">
                  <tr>
                    <th className="py-2.5 px-4">Nota Fiscal</th>
                    <th className="py-2.5 px-4">Data Expedição</th>
                    <th className="py-2.5 px-4">Cliente Destinatário</th>
                    <th className="py-2.5 px-4">Caminhão Rodoviário</th>
                    <th className="py-2.5 px-4 text-right">Cavaco (m³)</th>
                    <th className="py-2.5 px-4 text-right">Tora Consumida (m³)</th>
                    <th className="py-2.5 px-4 text-right">Umidade %</th>
                    <th className="py-2.5 px-4">Operador</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDE4DE]">
                  {picadoresTalhao.map((p) => {
                    const caminhao = p.expand?.caminhao_id
                    return (
                      <tr key={p.id} className="hover:bg-neutral-50/80">
                        <td className="py-2.5 px-4 font-mono font-bold text-[#1B5E20]">
                          {formatNotaFiscal(p.nota_fiscal)}
                        </td>
                        <td className="py-2.5 px-4 font-mono">
                          {formatDataHoraOperacional(p.data_hora_expedicao)}
                        </td>
                        <td className="py-2.5 px-4 font-bold text-[#1A2E1A]">{p.cliente || '—'}</td>
                        <td className="py-2.5 px-4 font-mono text-[#5A6D5A]">
                          {caminhao?.placa || 'RODOVIÁRIO'} ({caminhao?.modelo || 'Cavaqueiro'})
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-[#FF8F00]">
                          {p.volume_cavaco_m3 && p.volume_cavaco_m3 > 0
                            ? `${p.volume_cavaco_m3} m³`
                            : '—'}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-[#1A2E1A]">
                          {p.volume_tora_consumido_m3 && p.volume_tora_consumido_m3 > 0
                            ? `${p.volume_tora_consumido_m3} m³`
                            : '—'}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono">
                          {p.umidade_perc ? `${p.umidade_perc}%` : '—'}
                        </td>
                        <td className="py-2.5 px-4 text-[#5A6D5A]">{p.operador_nome || '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
