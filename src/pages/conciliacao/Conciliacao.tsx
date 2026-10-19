import React, { useEffect, useState, useMemo } from 'react'
import { apiService } from '@/services/florestalApi'
import { useAuth } from '@/context/AuthContext'
import {
  ConciliacaoAlerta,
  ConciliacaoAjuste,
  ConciliacaoDivergenciaHist,
  Pilha,
  InventarioPilha,
  HistoricoDescarga,
  HistoricoPicador,
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Scale,
  AlertTriangle,
  CheckCircle2,
  FileCheck,
  Search,
  ArrowRight,
  ShieldCheck,
  Clock,
  User,
  Loader2,
  RefreshCw,
  PlusCircle,
  HelpCircle,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { toast } from 'sonner'

export default function ConciliacaoPage() {
  const { user, fazendaAtiva, refreshAlertasCount } = useAuth()

  const [alertas, setAlertas] = useState<ConciliacaoAlerta[]>([])
  const [ajustes, setAjustes] = useState<ConciliacaoAjuste[]>([])
  const [pilhas, setPilhas] = useState<Pilha[]>([])
  const [inventarios, setInventarios] = useState<InventarioPilha[]>([])
  const [descargas, setDescargas] = useState<HistoricoDescarga[]>([])
  const [picadores, setPicadores] = useState<HistoricoPicador[]>([])
  const [loading, setLoading] = useState(true)

  // Filtro
  const [filtroStatus, setFiltroStatus] = useState<string>('todos')
  const [filtroPilha, setFiltroPilha] = useState<string>('todas')

  // Modais
  const [alertaDetalhe, setAlertaDetalhe] = useState<ConciliacaoAlerta | null>(null)
  const [historicoAlerta, setHistoricoAlerta] = useState<ConciliacaoDivergenciaHist[]>([])
  const [modalDetalhesOpen, setModalDetalhesOpen] = useState(false)
  const [modalInvestigarOpen, setModalInvestigarOpen] = useState(false)
  const [modalAjusteOpen, setModalAjusteOpen] = useState(false)
  const [modalNovoAlertaManualOpen, setModalNovoAlertaManualOpen] = useState(false)

  const [saving, setSaving] = useState(false)

  // Form Investigação
  const [responsavelInvestigacao, setResponsavelInvestigacao] = useState(user?.name || '')
  const [motivoDivergencia, setMotivoDivergencia] = useState('')
  const [novoStatusAlerta, setNovoStatusAlerta] = useState<
    'em_investigacao' | 'ajuste_solicitado' | 'resolvido' | 'descartado'
  >('em_investigacao')
  const [parecerInvestigacao, setParecerInvestigacao] = useState('')

  // Form Solicitar / Aprovar Ajuste
  const [pilhaAjusteId, setPilhaAjusteId] = useState('')
  const [tipoAjuste, setTipoAjuste] = useState<
    'entrada_correcao' | 'baixa_perda' | 'recalibracao_metodo' | 'outros'
  >('baixa_perda')
  const [volumeAjustadoM3, setVolumeAjustadoM3] = useState<number | ''>('')
  const [justificativaAjuste, setJustificativaAjuste] = useState('')
  const [aprovadoPor, setAprovadoPor] = useState(user?.name || '')
  const [dataAprovacao, setDataAprovacao] = useState(new Date().toISOString().split('T')[0])

  // Form Novo Alerta / Comparação Manual
  const [novaPilhaId, setNovaPilhaId] = useState('')
  const [novoSaldoCalculado, setNovoSaldoCalculado] = useState<number | ''>('')
  const [novoInventarioFisico, setNovoInventarioFisico] = useState<number | ''>('')

  const loadData = async () => {
    setLoading(true)
    try {
      const [alertasList, ajustList, pilhasList, invList, descList, picList] = await Promise.all([
        apiService.getAlertas(),
        apiService.getAjustesConciliacao(),
        apiService.getPilhas(fazendaAtiva?.id),
        apiService.getInventariosPilha(),
        apiService.getHistoricoDescarga(),
        apiService.getHistoricoPicador(),
      ])
      setAlertas(alertasList)
      setAjustes(ajustList)
      setPilhas(pilhasList)
      setInventarios(invList)
      setDescargas(descList)
      setPicadores(picList)
    } catch (err) {
      console.error(err)
      toast.error('Erro ao carregar dados de conciliação de estoque')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [fazendaAtiva])

  // Abrir detalhes do alerta com histórico de eventos
  const handleOpenDetalhes = async (alerta: ConciliacaoAlerta) => {
    setAlertaDetalhe(alerta)
    try {
      const hist = await apiService.getHistoricoAlerta(alerta.id)
      setHistoricoAlerta(hist)
      setModalDetalhesOpen(true)
    } catch (err) {
      console.error(err)
      toast.error('Erro ao carregar histórico do alerta')
    }
  }

  // Abrir modal de investigação
  const handleOpenInvestigar = (alerta: ConciliacaoAlerta) => {
    setAlertaDetalhe(alerta)
    setResponsavelInvestigacao(alerta.responsavel_investigacao || user?.name || '')
    setMotivoDivergencia(alerta.motivo_divergencia || '')
    setNovoStatusAlerta(alerta.status === 'pendente' ? 'em_investigacao' : (alerta.status as any))
    setParecerInvestigacao('')
    setModalInvestigarOpen(true)
  }

  // Salvar investigação
  const handleSalvarInvestigacao = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!alertaDetalhe) return
    if (!parecerInvestigacao.trim()) {
      toast.error('Informe um parecer ou observação da investigação.')
      return
    }

    setSaving(true)
    try {
      await apiService.updateAlerta(alertaDetalhe.id, {
        responsavel_investigacao: responsavelInvestigacao.trim(),
        motivo_divergencia: motivoDivergencia.trim(),
        status: novoStatusAlerta,
      })

      // Grava no histórico imutável
      await apiService.addEventoHistAlerta({
        alerta_id: alertaDetalhe.id,
        etapa_evento: `investigacao_${novoStatusAlerta}`,
        descricao: parecerInvestigacao.trim(),
        usuario_nome: user?.name || 'Operador',
        data_hora: new Date().toISOString(),
        dados_adicionais: `Motivo: ${motivoDivergencia} | Novo status: ${novoStatusAlerta}`,
      })

      toast.success('Investigação documentada com sucesso!')
      setModalInvestigarOpen(false)
      await loadData()
      await refreshAlertasCount()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Erro ao registrar investigação')
    } finally {
      setSaving(false)
    }
  }

  // Abrir modal de criação/aprovação de ajuste
  const handleOpenAjuste = (alerta?: ConciliacaoAlerta) => {
    if (alerta) {
      setAlertaDetalhe(alerta)
      setPilhaAjusteId(alerta.pilha_id)
      // Sugere o volume ajustado para zerar a diferença (invertendo o sinal da diferença)
      // diferenca_m3 = saldo_calculado - inventario_fisico
      // Para trazer o saldo calculado ao físico: volume_ajustado = inventario - saldo = -diferenca_m3
      const volumeSugerido = -alerta.diferenca_m3
      setVolumeAjustadoM3(Number(volumeSugerido.toFixed(2)))
      setTipoAjuste(volumeSugerido < 0 ? 'baixa_perda' : 'entrada_correcao')
      setJustificativaAjuste(
        `Ajuste para conciliação física da pilha. Divergência de ${alerta.diferenca_perc}% apurada em ${alerta.data_identificacao}.`,
      )
    } else {
      setAlertaDetalhe(null)
      setPilhaAjusteId(pilhas[0]?.id || '')
      setVolumeAjustadoM3('')
      setTipoAjuste('baixa_perda')
      setJustificativaAjuste('')
    }
    setAprovadoPor(user?.name || '')
    setDataAprovacao(new Date().toISOString().split('T')[0])
    setModalAjusteOpen(true)
  }

  // Salvar Ajuste Autorizado
  const handleSalvarAjuste = async (e: React.FormEvent) => {
    e.preventDefault()
    if (volumeAjustadoM3 === '' || volumeAjustadoM3 === 0) {
      toast.error('Informe o volume a ajustar em m³.')
      return
    }
    if (!justificativaAjuste.trim()) {
      toast.error('Todo ajuste de estoque EXIGE justificativa textual obrigatória.')
      return
    }
    if (!aprovadoPor.trim()) {
      toast.error('Informe o responsável pela aprovação.')
      return
    }

    const pilhaIdAlvo = alertaDetalhe ? alertaDetalhe.pilha_id : pilhaAjusteId
    if (!pilhaIdAlvo) {
      toast.error('Selecione a pilha que receberá o ajuste.')
      return
    }

    setSaving(true)
    try {
      // 1. Cria o registro de ajuste
      const novoAjuste = await apiService.createAjusteConciliacao({
        alerta_id: alertaDetalhe ? alertaDetalhe.id : undefined,
        pilha_id: pilhaIdAlvo,
        tipo_ajuste: tipoAjuste,
        volume_ajustado_m3: Number(volumeAjustadoM3),
        justificativa: justificativaAjuste.trim(),
        aprovado_por: aprovadoPor.trim(),
        data_aprovacao: dataAprovacao,
        status_ajuste: 'aprovado',
      })

      // 2. Se vinculado a alerta, atualiza o status do alerta para 'resolvido'
      if (alertaDetalhe) {
        await apiService.updateAlerta(alertaDetalhe.id, {
          status: 'resolvido',
        })

        await apiService.addEventoHistAlerta({
          alerta_id: alertaDetalhe.id,
          etapa_evento: 'ajuste_aprovado',
          descricao: `Ajuste de estoque de ${volumeAjustadoM3} m³ aprovado por ${aprovadoPor}. Motivo: ${justificativaAjuste}`,
          usuario_nome: user?.name || 'Administrador',
          data_hora: new Date().toISOString(),
          dados_adicionais: `Ajuste ID: ${novoAjuste.id} | Tipo: ${tipoAjuste}`,
        })
      }

      // 3. Atualiza o volume_atual_m3 da pilha diretamente no banco para refletir o movimento
      const pilhaAlvo = pilhas.find((p) => p.id === pilhaIdAlvo)
      if (pilhaAlvo) {
        const novoVol = Math.max(
          0,
          Number(((pilhaAlvo.volume_atual_m3 || 0) + Number(volumeAjustadoM3)).toFixed(2)),
        )
        await apiService.updatePilha(pilhaIdAlvo, {
          volume_atual_m3: novoVol,
        })
      }

      toast.success(
        'Movimento de ajuste de estoque gerado com sucesso! Rastreabilidade e auditoria garantidas.',
      )
      setModalAjusteOpen(false)
      await loadData()
      await refreshAlertasCount()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Erro ao processar ajuste de conciliação')
    } finally {
      setSaving(false)
    }
  }

  // Filtragem dos alertas
  const alertasFiltrados = useMemo(() => {
    return alertas.filter((a) => {
      if (filtroStatus !== 'todos' && a.status !== filtroStatus) return false
      if (filtroPilha !== 'todas' && a.pilha_id !== filtroPilha) return false
      return true
    })
  }, [alertas, filtroStatus, filtroPilha])

  return (
    <div className="space-y-6">
      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A2E1A] flex items-center gap-2">
            <Scale className="w-6 h-6 text-[#C62828]" />
            Conciliação de Estoque & Divergências (Núcleo C)
          </h1>
          <p className="text-sm text-[#5A6D5A]">
            Comparação entre o saldo calculado por movimentos (descargas - picador + ajustes) e o
            inventário físico ToraCerta. Divergência é ALERTA — jamais correção automática.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={loadData}
            className="border-[#DDE4DE] text-[#1A2E1A] hover:bg-neutral-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Recarregar Dados
          </Button>
          <Button
            onClick={() => handleOpenAjuste()}
            className="bg-[#1B5E20] hover:bg-[#14521A] text-white"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Novo Ajuste Documentado
          </Button>
        </div>
      </div>

      {/* FLUXO OPERACIONAL DE AJUSTE EM 4 PASSOS VISÍVEL NA TELA */}
      <Card className="border-[#1B5E20]/30 bg-gradient-to-r from-emerald-50/50 via-white to-neutral-50 shadow-xs">
        <CardHeader className="py-3 px-4 border-b border-[#DDE4DE]/60">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1B5E20] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#1B5E20]" />
            Fluxo Oficial de Governança e Ajuste de Estoque (4 Passos de Auditoria)
          </span>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Passo 1 */}
            <div className="p-3 bg-white rounded-lg border border-red-200 shadow-2xs space-y-1.5 relative">
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-full bg-red-100 text-red-700 font-bold text-xs flex items-center justify-center">
                  1
                </span>
                <Badge variant="outline" className="text-[10px] text-red-700 border-red-300">
                  Divergência &gt; 5%
                </Badge>
              </div>
              <h4 className="text-xs font-bold text-[#1A2E1A]">Identificação & Alerta</h4>
              <p className="text-[11px] text-[#5A6D5A] leading-relaxed">
                Sistema compara saldo calculado vs medição ToraCerta. Se ultrapassar o limiar de 5%,
                emite <strong>alerta</strong> (não ajusta automaticamente).
              </p>
            </div>

            {/* Passo 2 */}
            <div className="p-3 bg-white rounded-lg border border-amber-200 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 font-bold text-xs flex items-center justify-center">
                  2
                </span>
                <Badge variant="outline" className="text-[10px] text-amber-700 border-amber-300">
                  Investigação
                </Badge>
              </div>
              <h4 className="text-xs font-bold text-[#1A2E1A]">Investigação da Causa</h4>
              <p className="text-[11px] text-[#5A6D5A] leading-relaxed">
                Responsável técnico apura fatores: perda de umidade, erro de anotação de carga,
                compactação da pilha ou desvio de balanço.
              </p>
            </div>

            {/* Passo 3 */}
            <div className="p-3 bg-white rounded-lg border border-blue-200 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                  3
                </span>
                <Badge variant="outline" className="text-[10px] text-blue-700 border-blue-300">
                  Aprovação
                </Badge>
              </div>
              <h4 className="text-xs font-bold text-[#1A2E1A]">Aprovação Documentada</h4>
              <p className="text-[11px] text-[#5A6D5A] leading-relaxed">
                Ajuste é aprovado formalmente com justificativa textual, tipo de perda e assinatura
                digital do responsável.
              </p>
            </div>

            {/* Passo 4 */}
            <div className="p-3 bg-white rounded-lg border border-emerald-200 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">
                  4
                </span>
                <Badge
                  variant="outline"
                  className="text-[10px] text-emerald-700 border-emerald-300"
                >
                  Movimento Físico
                </Badge>
              </div>
              <h4 className="text-xs font-bold text-[#1A2E1A]">Movimento no Estoque</h4>
              <p className="text-[11px] text-[#5A6D5A] leading-relaxed">
                Sistema gera o movimento de ajuste rastreável, atualiza o saldo oficial da pilha e
                arquiva o ciclo no histórico imutável.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FILTROS E STATUS DOS ALERTAS */}
      <Card className="border-[#DDE4DE] shadow-xs">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-[#5A6D5A]">Filtrar por Pilha</Label>
              <Select value={filtroPilha} onValueChange={setFiltroPilha}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Todas as Pilhas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as Pilhas</SelectItem>
                  {pilhas.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.codigo} — {p.nome || p.produto}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-[#5A6D5A]">Status da Divergência</Label>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Todos os Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Status</SelectItem>
                  <SelectItem value="pendente">Pendente de Investigação</SelectItem>
                  <SelectItem value="em_investigacao">Em Investigação</SelectItem>
                  <SelectItem value="ajuste_solicitado">Ajuste Solicitado</SelectItem>
                  <SelectItem value="resolvido">Resolvido / Ajustado</SelectItem>
                  <SelectItem value="descartado">Descartado (Justificado)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <div className="p-2.5 rounded-lg bg-neutral-100 border border-[#DDE4DE] w-full flex items-center justify-between text-xs">
                <span className="text-[#5A6D5A]">Alertas Pendentes:</span>
                <span className="font-bold text-[#C62828] text-sm">
                  {
                    alertas.filter((a) => a.status === 'pendente' || a.status === 'em_investigacao')
                      .length
                  }
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* TABELA DE DIVERGÊNCIAS E ALERTAS */}
      <Card className="border-[#DDE4DE] shadow-xs">
        <CardHeader className="p-4 border-b border-[#DDE4DE] bg-neutral-50/50 flex flex-row items-center justify-between">
          <span className="text-xs font-semibold text-[#1A2E1A]">
            Divergências de Estoque Detectadas ({alertasFiltrados.length})
          </span>
          <span className="text-xs text-[#5A6D5A]">
            Limiar de disparo: <strong className="text-[#1B5E20]">5,0% (Parametrizável)</strong>
          </span>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-[#5A6D5A] gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#1B5E20]" />
              <span className="text-xs">Carregando conciliações...</span>
            </div>
          ) : alertasFiltrados.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#5A6D5A]">
              Nenhuma divergência registrada no momento. O estoque está alinhado às medições.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F7F5] border-b border-[#DDE4DE] text-[#5A6D5A] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Data Alerta</th>
                  <th className="py-3 px-4">Pilha</th>
                  <th className="py-3 px-4 text-right">Saldo Movimentos</th>
                  <th className="py-3 px-4 text-right">Inventário Físico</th>
                  <th className="py-3 px-4 text-right">Diferença m³</th>
                  <th className="py-3 px-4 text-right">Divergência %</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Responsável</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE4DE]">
                {alertasFiltrados.map((item) => {
                  const pilha = item.expand?.pilha_id || pilhas.find((p) => p.id === item.pilha_id)
                  const isCritical = item.diferenca_perc > 10.0
                  const isPendente = item.status === 'pendente'

                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors ${
                        isPendente
                          ? 'bg-red-50/30 font-medium'
                          : item.status === 'resolvido'
                            ? 'bg-emerald-50/20'
                            : 'hover:bg-neutral-50/80'
                      }`}
                    >
                      <td className="py-3 px-4 font-mono text-[#1A2E1A]">
                        {item.data_identificacao}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-[#1B5E20]">
                          {pilha?.codigo || '—'}
                        </span>
                        <span className="block text-[10px] text-[#5A6D5A]">
                          {pilha?.nome || pilha?.produto}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[#1A2E1A]">
                        {item.saldo_calculado_m3.toFixed(2)} m³
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[#1A2E1A]">
                        {item.inventario_fisico_m3.toFixed(2)} m³
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#1A2E1A]">
                        {item.diferenca_m3 > 0 ? `+${item.diferenca_m3}` : item.diferenca_m3} m³
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Badge
                          className={`font-mono text-xs ${
                            isCritical ? 'bg-[#C62828] text-white' : 'bg-amber-600 text-white'
                          }`}
                        >
                          {item.diferenca_perc.toFixed(1)}%
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {item.status === 'pendente' && (
                          <Badge
                            variant="outline"
                            className="text-[10px] border-red-500 text-red-600"
                          >
                            Pendente
                          </Badge>
                        )}
                        {item.status === 'em_investigacao' && (
                          <Badge
                            variant="outline"
                            className="text-[10px] border-amber-500 text-amber-700"
                          >
                            Em Investigação
                          </Badge>
                        )}
                        {item.status === 'ajuste_solicitado' && (
                          <Badge
                            variant="outline"
                            className="text-[10px] border-blue-500 text-blue-700"
                          >
                            Ajuste Solicitado
                          </Badge>
                        )}
                        {item.status === 'resolvido' && (
                          <Badge className="bg-emerald-600 text-white text-[10px]">Resolvido</Badge>
                        )}
                        {item.status === 'descartado' && (
                          <Badge variant="secondary" className="text-[10px]">
                            Descartado
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[#5A6D5A] text-xs">
                        {item.responsavel_investigacao || 'Não atribuído'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDetalhes(item)}
                            className="h-7 text-xs border-[#DDE4DE] text-[#1A2E1A]"
                            title="Ver histórico e auditoria"
                          >
                            <Search className="w-3 h-3 mr-1" />
                            Histórico
                          </Button>
                          {item.status !== 'resolvido' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenInvestigar(item)}
                                className="h-7 text-xs border-amber-400 text-amber-800 hover:bg-amber-50"
                              >
                                Investigar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenAjuste(item)}
                                className="h-7 text-xs bg-emerald-700 hover:bg-emerald-800 text-white border-none"
                              >
                                Ajustar
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* HISTÓRICO DE AJUSTES APROVADOS */}
      <Card className="border-[#DDE4DE] shadow-xs">
        <CardHeader className="p-4 border-b border-[#DDE4DE] bg-neutral-50/50">
          <span className="text-xs font-semibold text-[#1A2E1A]">
            Ajustes de Estoque Autorizados & Documentados ({ajustes.length})
          </span>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {ajustes.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#5A6D5A]">
              Nenhum movimento de ajuste autorizado até o momento.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F7F5] border-b border-[#DDE4DE] text-[#5A6D5A] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Data Aprovação</th>
                  <th className="py-3 px-4">Pilha</th>
                  <th className="py-3 px-4">Tipo do Ajuste</th>
                  <th className="py-3 px-4 text-right">Volume Ajustado (m³)</th>
                  <th className="py-3 px-4">Justificativa Textual</th>
                  <th className="py-3 px-4">Aprovado Por</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE4DE]">
                {ajustes.map((aj) => {
                  const pilha = aj.expand?.pilha_id || pilhas.find((p) => p.id === aj.pilha_id)
                  return (
                    <tr key={aj.id} className="hover:bg-neutral-50/80">
                      <td className="py-3 px-4 font-mono text-[#1A2E1A]">{aj.data_aprovacao}</td>
                      <td className="py-3 px-4 font-mono font-bold text-[#1B5E20]">
                        {pilha?.codigo || '—'}
                      </td>
                      <td className="py-3 px-4 capitalize text-[#1A2E1A]">
                        {aj.tipo_ajuste.replace('_', ' ')}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold">
                        <span
                          className={aj.volume_ajustado_m3 >= 0 ? 'text-[#1B5E20]' : 'text-red-700'}
                        >
                          {aj.volume_ajustado_m3 > 0
                            ? `+${aj.volume_ajustado_m3}`
                            : aj.volume_ajustado_m3}{' '}
                          m³
                        </span>
                      </td>
                      <td
                        className="py-3 px-4 text-[#5A6D5A] max-w-sm truncate"
                        title={aj.justificativa}
                      >
                        {aj.justificativa}
                      </td>
                      <td className="py-3 px-4 text-[#1A2E1A] font-medium">{aj.aprovado_por}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge className="bg-emerald-600 text-white text-[10px]">
                          {aj.status_ajuste}
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

      {/* MODAL HISTÓRICO DE AUDITORIA DO ALERTA */}
      <Dialog open={modalDetalhesOpen} onOpenChange={setModalDetalhesOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg text-[#1A2E1A] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#1B5E20]" />
              Linha do Tempo & Auditoria do Alerta
            </DialogTitle>
            <DialogDescription className="text-xs text-[#5A6D5A]">
              Histórico imutável de eventos registrados para esta divergência de conciliação.
            </DialogDescription>
          </DialogHeader>

          {alertaDetalhe && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 p-3 bg-neutral-50 rounded border border-[#DDE4DE] text-xs">
                <div>
                  <span className="text-[#5A6D5A] block">Saldo Movimentos:</span>
                  <span className="font-mono font-bold text-[#1A2E1A]">
                    {alertaDetalhe.saldo_calculado_m3} m³
                  </span>
                </div>
                <div>
                  <span className="text-[#5A6D5A] block">Inventário Físico ToraCerta:</span>
                  <span className="font-mono font-bold text-[#1B5E20]">
                    {alertaDetalhe.inventario_fisico_m3} m³
                  </span>
                </div>
                <div>
                  <span className="text-[#5A6D5A] block">Diferença Absoluta:</span>
                  <span className="font-mono font-bold text-[#C62828]">
                    {alertaDetalhe.diferenca_m3} m³ ({alertaDetalhe.diferenca_perc}%)
                  </span>
                </div>
                <div>
                  <span className="text-[#5A6D5A] block">Status Atual:</span>
                  <span className="font-bold text-[#1A2E1A] capitalize">
                    {alertaDetalhe.status}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-[#1A2E1A] uppercase tracking-wider block">
                  Eventos Registrados ({historicoAlerta.length})
                </span>
                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                  {historicoAlerta.map((h) => (
                    <div
                      key={h.id}
                      className="p-2.5 bg-white border border-[#DDE4DE] rounded-md text-xs space-y-1 shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#1B5E20] capitalize">
                          {h.etapa_evento.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] text-[#5A6D5A] font-mono">
                          {new Date(h.data_hora).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-[#1A2E1A]">{h.descricao}</p>
                      <div className="text-[10px] text-[#5A6D5A] flex items-center justify-between pt-1 border-t border-neutral-100">
                        <span>
                          Registrado por: <strong>{h.usuario_nome}</strong>
                        </span>
                        {h.dados_adicionais && <span>{h.dados_adicionais}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setModalDetalhesOpen(false)}>
                  Fechar
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL INVESTIGAÇÃO DA CAUSA (PASSO 2) */}
      <Dialog open={modalInvestigarOpen} onOpenChange={setModalInvestigarOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg text-[#1A2E1A] flex items-center gap-2">
              <Search className="w-5 h-5 text-amber-600" />
              Passo 2: Investigação da Causa
            </DialogTitle>
            <DialogDescription className="text-xs text-[#5A6D5A]">
              Documente a averiguação técnica realizada para justificar a divergência dimensional.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSalvarInvestigacao} className="space-y-4">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Responsável pela Investigação *</Label>
              <Input
                value={responsavelInvestigacao}
                onChange={(e) => setResponsavelInvestigacao(e.target.value)}
                className="h-9"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Causa Primária Apurada</Label>
              <Select value={motivoDivergencia} onValueChange={setMotivoDivergencia}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Selecione o motivo..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Perda por dessecação / perda de umidade natural">
                    Perda por dessecação / umidade natural
                  </SelectItem>
                  <SelectItem value="Acomodação dimensional e quebra de casca na pilha">
                    Acomodação dimensional / quebra de casca
                  </SelectItem>
                  <SelectItem value="Erro de cubagem na recepção de carga do baldeio">
                    Erro de cubagem na recepção / baldeio
                  </SelectItem>
                  <SelectItem value="Consumo do picador não apontado tempestivamente">
                    Consumo do picador não apontado
                  </SelectItem>
                  <SelectItem value="Recalibração do fator tridimensional ToraCerta">
                    Recalibração de fator ToraCerta
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Próximo Passo / Status *</Label>
              <Select
                value={novoStatusAlerta}
                onValueChange={(val: any) => setNovoStatusAlerta(val)}
              >
                <SelectTrigger className="h-9 text-xs font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="em_investigacao">
                    Em Investigação (Aguardando laudo)
                  </SelectItem>
                  <SelectItem value="ajuste_solicitado">
                    Ajuste Solicitado (Encaminhar para aprovação)
                  </SelectItem>
                  <SelectItem value="resolvido">Resolvido Sem Ajuste Físico</SelectItem>
                  <SelectItem value="descartado">Descartar Alerta (Falso positivo)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Parecer Técnico da Investigação *</Label>
              <textarea
                rows={3}
                placeholder="Descreva detalhadamente o que foi verificado em campo..."
                value={parecerInvestigacao}
                onChange={(e) => setParecerInvestigacao(e.target.value)}
                className="w-full text-xs p-2 rounded-md border border-[#DDE4DE] focus-visible:ring-1 focus-visible:ring-[#1B5E20]"
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setModalInvestigarOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                {saving && <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />}
                Registrar Investigação
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL DE AJUSTE DE ESTOQUE (PASSOS 3 E 4) */}
      <Dialog open={modalAjusteOpen} onOpenChange={setModalAjusteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg text-[#1A2E1A] flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-[#1B5E20]" />
              Passo 3 & 4: Aprovação & Ajuste de Estoque
            </DialogTitle>
            <DialogDescription className="text-xs text-[#5A6D5A]">
              Gera movimento auditável no saldo da pilha. Todo ajuste exige justificativa textual e
              aprovação formal.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSalvarAjuste} className="space-y-4">
            {alertaDetalhe ? (
              <div className="p-2.5 bg-[#F4F6F4] rounded-md border border-[#E0E0E0] text-xs">
                <span className="text-[#5A6D5A]">Pilha vinculada ao Alerta: </span>
                <span className="font-semibold text-[#1A2E1A]">
                  {alertaDetalhe.expand?.pilha_id?.codigo || alertaDetalhe.pilha_id}
                </span>
              </div>
            ) : (
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Pilha a Ajustar *</Label>
                <Select value={pilhaAjusteId} onValueChange={setPilhaAjusteId}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Selecione a Pilha" />
                  </SelectTrigger>
                  <SelectContent>
                    {pilhas.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.codigo} — {p.nome || p.produto}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Tipo de Ajuste *</Label>
                <Select value={tipoAjuste} onValueChange={(val: any) => setTipoAjuste(val)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixa_perda">Baixa por Perda / Umidade</SelectItem>
                    <SelectItem value="entrada_correcao">Entrada de Correção</SelectItem>
                    <SelectItem value="recalibracao_metodo">Recalibração de Método</SelectItem>
                    <SelectItem value="outros">Outros Motivos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Volume a Ajustar (m³) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Ex: -12.5 ou +8.0"
                  value={volumeAjustadoM3}
                  onChange={(e) =>
                    setVolumeAjustadoM3(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="h-9 font-mono font-bold"
                  required
                />
                <span className="text-[10px] text-[#5A6D5A] block">
                  Use negativo para baixa e positivo para acréscimo.
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Aprovado Por *</Label>
                <Input
                  value={aprovadoPor}
                  onChange={(e) => setAprovadoPor(e.target.value)}
                  className="h-9"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Data da Aprovação *</Label>
                <Input
                  type="date"
                  value={dataAprovacao}
                  onChange={(e) => setDataAprovacao(e.target.value)}
                  className="h-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Justificativa Textual Obrigatória *</Label>
              <textarea
                rows={3}
                placeholder="Descreva a fundamentação técnica do ajuste (obrigatório para fins de auditoria)..."
                value={justificativaAjuste}
                onChange={(e) => setJustificativaAjuste(e.target.value)}
                className="w-full text-xs p-2 rounded-md border border-[#DDE4DE] focus-visible:ring-1 focus-visible:ring-[#1B5E20]"
                required
              />
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-[#1B5E20]">
              Ao confirmar, o sistema registrará o movimento na coleção de ajustes e recalculará o
              estoque da pilha com rastreabilidade completa.
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setModalAjusteOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-[#1B5E20] hover:bg-[#14521A] text-white"
              >
                {saving && <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />}
                Autorizar Movimento de Ajuste
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
