import React, { useEffect, useState, useMemo } from 'react'
import { apiService } from '@/services/florestalApi'
import { useAuth } from '@/context/AuthContext'
import {
  IntegracaoCredencial,
  IntegracaoLog,
  TipoIntegracao,
  StatusIngestaoLog,
  Pilha,
  Caminhao,
} from '@/types/florestal'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  KeyRound,
  Plus,
  Loader2,
  Copy,
  Check,
  Eye,
  EyeOff,
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Code2,
  RefreshCw,
  Terminal,
  ShieldCheck,
  Radio,
  FileJson,
  Send,
  Building2,
  Trash2,
  FileSpreadsheet,
} from 'lucide-react'
import { toast } from 'sonner'
import { GoogleSheetsD2Section } from './GoogleSheetsD2Section'
import { GoogleSheetsConfigRecord } from '@/types/florestal'

export default function IntegracoesPage() {
  const { user } = useAuth()
  const isAdmin = user?.papel === 'admin'

  // PocketBase Base URL para documentação real
  const backendBaseUrl = (import.meta.env.VITE_POCKETBASE_URL as string) || window.location.origin

  // Google Sheets Config
  const [sheetsConfig, setSheetsConfig] = useState<GoogleSheetsConfigRecord | null>(null)

  // Dados
  const [credenciais, setCredenciais] = useState<IntegracaoCredencial[]>([])
  const [logs, setLogs] = useState<IntegracaoLog[]>([])
  const [totalLogs, setTotalLogs] = useState(0)
  const [loading, setLoading] = useState(true)
  const [refreshingLogs, setRefreshingLogs] = useState(false)

  // Filtros de Logs
  const [filtroCredencial, setFiltroCredencial] = useState<string>('todas')
  const [filtroStatus, setFiltroStatus] = useState<string>('todos')
  const [paginaLog, setPaginaLog] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)

  // Modais
  const [modalNovaChaveOpen, setModalNovaChaveOpen] = useState(false)
  const [modalChaveReveladaOpen, setModalChaveReveladaOpen] = useState(false)
  const [novaChaveGerada, setNovaChaveGerada] = useState<{
    nome: string
    api_key: string
    tipo: string
  } | null>(null)

  // Form Nova Chave
  const [novoNome, setNovoNome] = useState('')
  const [novoTipo, setNovoTipo] = useState<TipoIntegracao>('picador_d2')
  const [novaDescricao, setNovaDescricao] = useState('')
  const [salvandoChave, setSalvandoChave] = useState(false)

  // Controle de exibição de chaves na tabela
  const [chavesVisiveis, setChavesVisiveis] = useState<Record<string, boolean>>({})
  const [chaveCopiadaId, setChaveCopiadaId] = useState<string | null>(null)

  // Credencial selecionada para documentação e simulação de teste
  const [credencialSelecionadaId, setCredencialSelecionadaId] = useState<string>('')

  // Teste de conectividade
  const [testandoConexao, setTestandoConexao] = useState(false)
  const [resultadoTeste, setResultadoTeste] = useState<{
    autenticado: boolean
    status?: string
    erro?: string
    timestamp?: string
  } | null>(null)

  // Simulador de Ingestão D2
  const [pilhasDisponiveis, setPilhasDisponiveis] = useState<Pilha[]>([])
  const [caminhoesDisponiveis, setCaminhoesDisponiveis] = useState<Caminhao[]>([])
  const [simNf, setSimNf] = useState('')
  const [simVolume, setSimVolume] = useState('45.0')
  const [simPeso, setSimPeso] = useState('14.4')
  const [simPilhaId, setSimPilhaId] = useState('')
  const [simCaminhaoId, setSimCaminhaoId] = useState('')
  const [enviandoSimulacao, setEnviandoSimulacao] = useState(false)

  // Carregar configuração do Google Sheets
  const loadSheetsConfig = async () => {
    try {
      const cfg = await apiService.getGoogleSheetsConfig()
      setSheetsConfig(cfg)
    } catch (err: any) {
      console.error(err)
    }
  }

  // Carregar dados principais
  const loadCredenciais = async () => {
    try {
      const list = await apiService.getIntegracoes()
      setCredenciais(list)
      if (list.length > 0 && !credencialSelecionadaId) {
        // Seleciona preferencialmente a D2 Toledo ou a primeira
        const d2 = list.find((c) => c.tipo === 'picador_d2')
        setCredencialSelecionadaId(d2 ? d2.id : list[0].id)
      }
    } catch (err: any) {
      console.error(err)
      toast.error('Erro ao carregar credenciais de integração')
    }
  }

  const loadLogs = async (page = 1) => {
    setRefreshingLogs(true)
    try {
      const res = await apiService.getLogsIngestao({
        credencialId: filtroCredencial,
        status: filtroStatus,
        page,
        limite: 15,
      })
      setLogs(res.items)
      setTotalLogs(res.totalItems)
      setTotalPaginas(res.totalPages)
      setPaginaLog(page)
    } catch (err: any) {
      console.error(err)
      toast.error('Erro ao carregar histórico de ingestão')
    } finally {
      setRefreshingLogs(false)
    }
  }

  const loadAuxData = async () => {
    try {
      const [pilhas, caminhoes] = await Promise.all([
        apiService.getPilhas(),
        apiService.getCaminhoes(),
      ])
      setPilhasDisponiveis(pilhas)
      setCaminhoesDisponiveis(caminhoes)
      if (pilhas.length > 0) setSimPilhaId(pilhas[0].id)
      if (caminhoes.length > 0) setSimCaminhaoId(caminhoes[0].id)
    } catch {
      /* intentionally ignored */
    }
  }

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await Promise.all([loadSheetsConfig(), loadCredenciais(), loadLogs(1), loadAuxData()])
      setLoading(false)
    }
    init()
  }, [])

  useEffect(() => {
    loadLogs(1)
  }, [filtroCredencial, filtroStatus])

  // Credencial ativa selecionada
  const credencialAtiva = useMemo(() => {
    return credenciais.find((c) => c.id === credencialSelecionadaId) || credenciais[0] || null
  }, [credenciais, credencialSelecionadaId])

  // Análise de situação da integração D2 (Picador BRF Toledo)
  const situacaoD2 = useMemo(() => {
    const credD2 = credenciais.find((c) => c.tipo === 'picador_d2')
    const sheetsAtivo = sheetsConfig && sheetsConfig.is_ativa

    // Prioriza o status da Planilha Google Sheets se configurada
    if (sheetsConfig) {
      if (!sheetsConfig.is_ativa) {
        return {
          status: 'inativa',
          label: 'Planilha Sheets Desativada',
          badgeClass: 'bg-neutral-200 text-neutral-700 border-neutral-400',
          descricao:
            'A integração Google Sheets está desativada; prévias e importações estão bloqueadas.',
          tempoUso: sheetsConfig.ultima_sincronizacao || null,
        }
      }
      if (!sheetsConfig.ultima_sincronizacao) {
        return {
          status: 'aguardando_importacao',
          label: sheetsConfig.has_credentials
            ? 'Conectada — aguardando importação'
            : 'Aguardando credencial',
          badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
          descricao: sheetsConfig.has_credentials
            ? 'A origem está configurada. Gere a prévia e confirme a importação manualmente; não há execução automática.'
            : 'Configure uma conta de serviço Google Sheets para iniciar a prévia manual.',
          tempoUso: null,
        }
      }
      if (sheetsConfig.ultima_sincronizacao) {
        return {
          status:
            sheetsConfig.ultimo_status === 'erro' || sheetsConfig.ultimo_status === 'parcial'
              ? 'erros_recentes'
              : 'ok',
          label:
            sheetsConfig.ultimo_status === 'erro'
              ? 'Atenção — Erro Sheets'
              : sheetsConfig.ultimo_status === 'parcial'
                ? 'Atenção — Importação parcial'
                : 'Google Sheets importado',
          badgeClass:
            sheetsConfig.ultimo_status === 'erro' || sheetsConfig.ultimo_status === 'parcial'
              ? 'bg-rose-100 text-rose-800 border-rose-300'
              : 'bg-emerald-100 text-emerald-800 border-emerald-300',
          descricao: `Última importação manual da planilha Google (${sheetsConfig.linhas_ingeridas_total || 0} novos registros).`,
          tempoUso: sheetsConfig.ultima_sincronizacao,
        }
      }
    }

    if (!credD2 && !sheetsAtivo) {
      return {
        status: 'nao_configurada',
        label: 'Aguardando Configuração',
        badgeClass: 'bg-neutral-100 text-neutral-600 border-neutral-300',
        descricao:
          'Configure a planilha Google Sheets acima para consultar a origem e importar manualmente os dados.',
        tempoUso: null,
      }
    }

    if (!credD2 || !credD2.is_ativa) {
      return {
        status: 'inativa',
        label: 'Integração Desativada',
        badgeClass: 'bg-neutral-200 text-neutral-700 border-neutral-400',
        descricao: credD2
          ? 'A chave de API REST está desativada no sistema.'
          : 'Nenhuma origem Google Sheets ou chave de API REST está configurada.',
        tempoUso: credD2?.ultimo_uso || null,
      }
    }

    // Busca o log mais recente associado à credencial D2 ou com origem contendo "D2" ou "Picador"
    const ultimoLog = logs.find(
      (l) =>
        l.credencial_id === credD2.id ||
        l.origem_nome.toLowerCase().includes('d2') ||
        l.origem_nome.toLowerCase().includes('toledo'),
    )

    if (!ultimoLog && !credD2.ultimo_uso) {
      return {
        status: 'nunca_conectou',
        label: 'Aguardando 1ª Conexão',
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
        descricao: 'Aguardando o primeiro envio de dados do picador Toledo via API.',
        tempoUso: null,
      }
    }

    if (ultimoLog?.status === 'erro' || ultimoLog?.status === 'rejeitado') {
      return {
        status: 'erros_recentes',
        label: 'Atenção — Erros Recentes',
        badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
        descricao: `Último envio rejeitado: ${ultimoLog.mensagem_erro || 'Falha de validação'}`,
        tempoUso: ultimoLog.timestamp_evento || credD2.ultimo_uso,
      }
    }

    // Sucesso ou parcial recente
    const dataRef = new Date(ultimoLog?.timestamp_evento || credD2.ultimo_uso || new Date())
    const agora = new Date()
    const diffHoras = Math.abs(agora.getTime() - dataRef.getTime()) / 36e5

    if (diffHoras > 48) {
      return {
        status: 'inativo_recente',
        label: 'Sem envios > 48h',
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
        descricao: `Último recebimento com sucesso foi há ${Math.floor(diffHoras / 24)} dia(s).`,
        tempoUso: dataRef.toISOString(),
      }
    }

    return {
      status: 'ok',
      label: 'Conectado & Operante',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      descricao: 'Endpoint respondendo com sucesso e gravando expedições no estoque.',
      tempoUso: dataRef.toISOString(),
    }
  }, [credenciais, logs, sheetsConfig])

  // Ações de Credencial
  const handleToggleAtiva = async (cred: IntegracaoCredencial) => {
    if (!isAdmin) {
      toast.error('Apenas Administradores podem ativar ou inativar chaves de API.')
      return
    }
    const novoStatus = !cred.is_ativa
    try {
      await apiService.toggleIntegracaoAtiva(cred.id, novoStatus)
      setCredenciais((prev) =>
        prev.map((c) => (c.id === cred.id ? { ...c, is_ativa: novoStatus } : c)),
      )
      toast.success(
        `Integração "${cred.nome}" ${novoStatus ? 'ativada' : 'desativada'} com sucesso!`,
      )
    } catch (err: any) {
      toast.error('Erro ao atualizar status da integração')
    }
  }

  const handleCopiarChave = (apiKey: string, id: string) => {
    navigator.clipboard.writeText(apiKey)
    setChaveCopiadaId(id)
    toast.success('Chave de API copiada para a área de transferência!')
    setTimeout(() => setChaveCopiadaId(null), 2500)
  }

  const handleToggleRevelarChave = (id: string) => {
    if (!isAdmin) {
      toast.error('Apenas Administradores têm permissão para revelar a chave de API.')
      return
    }
    setChavesVisiveis((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleOpenCriarChave = () => {
    if (!isAdmin) {
      toast.error('Apenas Administradores podem criar novas chaves de API.')
      return
    }
    setNovoNome('')
    setNovoTipo('picador_d2')
    setNovaDescricao('')
    setModalNovaChaveOpen(true)
  }

  const handleSalvarNovaChave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!novoNome.trim()) {
      toast.error('Informe o nome/identificação da integração.')
      return
    }

    setSalvandoChave(true)
    try {
      const criada = await apiService.createIntegracao({
        nome: novoNome.trim(),
        tipo: novoTipo,
        descricao: novaDescricao.trim(),
      })
      toast.success('Chave de API gerada com sucesso!')
      setModalNovaChaveOpen(false)
      setNovaChaveGerada({
        nome: criada.nome,
        api_key: criada.api_key,
        tipo: criada.tipo,
      })
      setModalChaveReveladaOpen(true)
      await loadCredenciais()
    } catch (err: any) {
      toast.error(err.message || 'Erro ao gerar credencial de API')
    } finally {
      setSalvandoChave(false)
    }
  }

  const handleDeleteCredencial = async (cred: IntegracaoCredencial) => {
    if (!isAdmin) {
      toast.error('Apenas Administradores podem excluir credenciais.')
      return
    }
    if (
      !confirm(
        `Tem certeza que deseja excluir permanentemente a credencial "${cred.nome}"? Chamadas futuras com esta chave serão rejeitadas com 401.`,
      )
    ) {
      return
    }
    try {
      await apiService.deleteIntegracao(cred.id)
      toast.success('Credencial removida com sucesso.')
      await loadCredenciais()
    } catch (err: any) {
      toast.error('Erro ao excluir credencial')
    }
  }

  // Testar conectividade do endpoint
  const handleTestarConectividade = async () => {
    if (!credencialAtiva) {
      toast.error('Nenhuma credencial selecionada para teste.')
      return
    }
    setTestandoConexao(true)
    setResultadoTeste(null)
    try {
      const res = await apiService.testarConectividadeApiKey(credencialAtiva.api_key)
      setResultadoTeste({
        autenticado: res.autenticado,
        status: res.status,
        erro: res.erro,
        timestamp: res.servidor_timestamp || new Date().toISOString(),
      })
      if (res.autenticado) {
        toast.success(`Chave autenticada com sucesso! Endpoint online.`)
      } else {
        toast.error(`Falha na autenticação: ${res.erro}`)
      }
    } catch (err: any) {
      setResultadoTeste({
        autenticado: false,
        erro: err.message || 'Erro de comunicação',
      })
      toast.error('Erro ao testar endpoint')
    } finally {
      setTestandoConexao(false)
    }
  }

  // Simular Envio D2
  const handleEnviarSimulacaoD2 = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!credencialAtiva) {
      toast.error('Selecione uma credencial de integração ativa.')
      return
    }
    const vol = Number(simVolume)
    if (isNaN(vol) || vol <= 0) {
      toast.error('Volume de cavaco inválido.')
      return
    }

    const nfFinal = simNf.trim() || `NF-${Math.floor(100000 + Math.random() * 900000)}-D2`

    setEnviandoSimulacao(true)
    try {
      const payload: any = {
        nota_fiscal: nfFinal,
        data_hora_expedicao: new Date().toISOString(),
        volume_cavaco_m3: vol,
        peso_cavaco_t: Number(simPeso) || Number((vol * 0.32).toFixed(2)),
        volume_tora_consumido_m3: Number((vol * 0.4).toFixed(2)),
        cliente: 'BRF Toledo — Fábrica de Cavaco',
        operador_nome: user?.name || 'Operador D2 Toledo',
      }
      if (simPilhaId) payload.pilha_origem_id = simPilhaId
      if (simCaminhaoId) payload.caminhao_id = simCaminhaoId

      const res = await apiService.enviarIngestaoD2(credencialAtiva.api_key, payload)
      if (res.sucesso) {
        toast.success(
          `Dados enviados com sucesso! NF: ${nfFinal} (${vol} m³ de cavaco registrados).`,
        )
        setSimNf('')
        await Promise.all([loadLogs(1), loadCredenciais()])
      } else {
        toast.error(`Falha no envio: ${res.mensagem}`)
      }
    } catch (err: any) {
      toast.error(err?.data?.erro || err?.message || 'Erro ao enviar dados para a API D2')
    } finally {
      setEnviandoSimulacao(false)
    }
  }

  const formatDataHora = (iso?: string) => {
    if (!iso) return '—'
    try {
      return new Date(iso).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    } catch (_) {
      return iso
    }
  }

  const renderBadgeStatus = (status: StatusIngestaoLog) => {
    switch (status) {
      case 'sucesso':
        return (
          <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-semibold flex items-center gap-1 w-fit">
            <CheckCircle2 className="w-3 h-3" />
            Sucesso
          </Badge>
        )
      case 'parcial':
        return (
          <Badge className="bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-semibold flex items-center gap-1 w-fit">
            <AlertTriangle className="w-3 h-3" />
            Parcial
          </Badge>
        )
      case 'rejeitado':
        return (
          <Badge className="bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-semibold flex items-center gap-1 w-fit">
            <ShieldCheck className="w-3 h-3" />
            401 Rejeitado
          </Badge>
        )
      case 'erro':
      default:
        return (
          <Badge className="bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-semibold flex items-center gap-1 w-fit">
            <XCircle className="w-3 h-3" />
            Erro
          </Badge>
        )
    }
  }

  // Exemplos de curl e código para o endpoint de ingestão
  const apiKeyExemplo = credencialAtiva ? credencialAtiva.api_key : 'sof_live_d2_toledo_sua_chave'
  const curlExemplo = `curl -X POST "${backendBaseUrl}/backend/v1/ingestao/d2" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: ${apiKeyExemplo}" \\
  -d '{
    "nota_fiscal": "NF-98421",
    "data_hora_expedicao": "${new Date().toISOString()}",
    "volume_cavaco_m3": 45.0,
    "peso_cavaco_t": 14.4,
    "volume_tora_consumido_m3": 18.0,
    "cliente": "BRF Toledo",
    "umidade_perc": 42.5,
    "operador_nome": "Operador Linha D2"
  }'`

  const payloadExemploJson = `{
  "nota_fiscal": "NF-98421",
  "data_hora_expedicao": "2026-10-15T14:30:00Z",
  "volume_cavaco_m3": 45.0,
  "peso_cavaco_t": 14.4,
  "volume_tora_consumido_m3": 18.0,
  "cliente": "BRF Toledo",
  "umidade_perc": 42.5,
  "pilha_codigo": "PIL-01",
  "placa": "ABC1D23",
  "operador_nome": "Operador Picador D2"
}`

  const respostaExemploJson = `{
  "sucesso": true,
  "status": "sucesso",
  "mensagem": "Processados: 1. Aceitos: 1, Rejeitados: 0.",
  "recebidos": 1,
  "aceitos": 1,
  "rejeitados": 0,
  "itens": [
    {
      "indice": 1,
      "nota_fiscal": "NF-98421",
      "status": "aceito",
      "id_registro": "k7x9p2q1m4w5y8z",
      "volume_cavaco_m3": 45.0
    }
  ],
  "timestamp": "2026-10-15T14:30:01.120Z"
}`

  return (
    <div className="space-y-6">
      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#1B5E20] text-white flex items-center justify-center shadow-xs">
              <KeyRound className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#1A2E1A]">
              Integração & Ingestão de Dados
            </h1>
          </div>
          <p className="text-sm text-[#5A6D5A] mt-1">
            Importe manualmente as 14 abas do Google Sheets e acompanhe as integrações REST de
            recebimento e seus eventos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button
              onClick={handleOpenCriarChave}
              className="bg-[#1B5E20] hover:bg-[#14521A] text-white shadow-xs"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Gerar Nova Chave API
            </Button>
          )}
        </div>
      </div>

      {/* Importação manual, somente leitura, das abas Google Sheets */}
      <GoogleSheetsD2Section
        config={sheetsConfig}
        isAdmin={isAdmin}
        onConfigUpdated={loadSheetsConfig}
        onIngestaoSucesso={() => {
          loadLogs(1)
          loadCredenciais()
        }}
      />

      {/* Status do recebimento REST legado, separado da leitura Google Sheets */}
      <Card className="border-[#DDE4DE] shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-900 to-[#1B5E20] text-white">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-200">
                  Painel de Recebimento Externo
                </span>
                <span className="text-emerald-300">•</span>
                <span className="text-[11px] text-emerald-200">API REST · Picador D2</span>
              </div>
              <h2 className="text-xl font-bold flex items-center gap-2.5">
                <Radio
                  className={`w-5 h-5 ${
                    situacaoD2.status === 'ok'
                      ? 'text-emerald-300 animate-pulse'
                      : situacaoD2.status === 'erros_recentes'
                        ? 'text-rose-400'
                        : 'text-amber-300'
                  }`}
                />
                Status da origem D2: {situacaoD2.label}
              </h2>
              <p className="text-xs text-emerald-100 max-w-2xl leading-relaxed">
                {situacaoD2.descricao}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="bg-white/10 backdrop-blur-xs rounded-lg px-3 py-2 border border-white/20 text-xs">
                <span className="text-[10px] text-emerald-200 block uppercase font-medium">
                  Última Atividade
                </span>
                <span className="font-mono font-semibold">
                  {situacaoD2.tempoUso ? formatDataHora(situacaoD2.tempoUso) : 'Nenhuma atividade'}
                </span>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={handleTestarConectividade}
                disabled={testandoConexao || !credencialAtiva}
                className="bg-white text-[#1B5E20] hover:bg-emerald-50 font-semibold shadow-xs text-xs h-9"
              >
                {testandoConexao ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Testando...
                  </>
                ) : (
                  <>
                    <Activity className="w-3.5 h-3.5 mr-1.5" />
                    Testar API REST
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* FEEDBACK DO TESTE DE CONECTIVIDADE */}
        {resultadoTeste && (
          <div
            className={`p-3.5 border-b text-xs flex items-center justify-between gap-3 ${
              resultadoTeste.autenticado
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-center gap-2">
              {resultadoTeste.autenticado ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>
                <strong>{resultadoTeste.autenticado ? 'Sucesso:' : 'Falha:'}</strong>{' '}
                {resultadoTeste.autenticado
                  ? `Endpoint /backend/v1/ingestao/status respondeu 200 OK. Chave de API "${credencialAtiva?.nome}" é válida.`
                  : resultadoTeste.erro}
              </span>
            </div>
            <span className="font-mono text-[11px] opacity-75 shrink-0">
              {formatDataHora(resultadoTeste.timestamp)}
            </span>
          </div>
        )}

        {/* CARDS RESUMO */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-[#DDE4DE] bg-neutral-50/50 text-xs">
          <div className="p-4">
            <span className="text-[11px] font-medium text-[#5A6D5A] uppercase block">
              Total de Integrações
            </span>
            <span className="text-xl font-bold text-[#1A2E1A] mt-0.5 block">
              {credenciais.length}
            </span>
            <span className="text-[11px] text-[#5A6D5A]">
              {credenciais.filter((c) => c.is_ativa).length} ativas
            </span>
          </div>

          <div className="p-4">
            <span className="text-[11px] font-medium text-[#5A6D5A] uppercase block">
              Eventos Registrados
            </span>
            <span className="text-xl font-bold text-[#1A2E1A] mt-0.5 block">{totalLogs}</span>
            <span className="text-[11px] text-[#5A6D5A]">Histórico completo de auditoria</span>
          </div>

          <div className="p-4">
            <span className="text-[11px] font-medium text-[#5A6D5A] uppercase block">
              Sucesso em Ingestão
            </span>
            <span className="text-xl font-bold text-emerald-700 mt-0.5 block">
              {logs.filter((l) => l.status === 'sucesso').length}
            </span>
            <span className="text-[11px] text-[#5A6D5A]">Na página atual</span>
          </div>

          <div className="p-4">
            <span className="text-[11px] font-medium text-[#5A6D5A] uppercase block">
              Rejeições / Erros
            </span>
            <span className="text-xl font-bold text-rose-700 mt-0.5 block">
              {logs.filter((l) => l.status === 'erro' || l.status === 'rejeitado').length}
            </span>
            <span className="text-[11px] text-[#5A6D5A]">Avisos ou chave inválida</span>
          </div>
        </div>
      </Card>

      {/* TABS PRINCIPAIS */}
      <Tabs defaultValue="credenciais" className="w-full space-y-4">
        <TabsList className="bg-white border border-[#DDE4DE] p-1 h-auto flex flex-wrap gap-1">
          <TabsTrigger
            value="credenciais"
            className="data-[state=active]:bg-[#1B5E20] data-[state=active]:text-white text-xs font-semibold py-2 px-3.5"
          >
            <KeyRound className="w-3.5 h-3.5 mr-1.5" />
            Chaves de API & Credenciais ({credenciais.length})
          </TabsTrigger>
          <TabsTrigger
            value="historico"
            className="data-[state=active]:bg-[#1B5E20] data-[state=active]:text-white text-xs font-semibold py-2 px-3.5"
          >
            <Clock className="w-3.5 h-3.5 mr-1.5" />
            Histórico de Ingestão ({totalLogs})
          </TabsTrigger>
          <TabsTrigger
            value="documentacao"
            className="data-[state=active]:bg-[#1B5E20] data-[state=active]:text-white text-xs font-semibold py-2 px-3.5"
          >
            <Code2 className="w-3.5 h-3.5 mr-1.5" />
            Documentação da API & Guia D2
          </TabsTrigger>
          <TabsTrigger
            value="simulador"
            className="data-[state=active]:bg-[#1B5E20] data-[state=active]:text-white text-xs font-semibold py-2 px-3.5"
          >
            <Terminal className="w-3.5 h-3.5 mr-1.5" />
            Simulador de Envio (D2)
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: LISTAGEM DE CREDENCIAIS */}
        <TabsContent value="credenciais" className="space-y-4 m-0">
          <Card className="border-[#DDE4DE] shadow-xs">
            <CardHeader className="p-4 border-b border-[#DDE4DE] bg-neutral-50/50 flex flex-row items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[#1A2E1A] block">
                  Chaves de API Autorizadas
                </span>
                <span className="text-[11px] text-[#5A6D5A]">
                  Cada integração externa utiliza sua própria chave no header HTTP (Authorization ou
                  X-API-Key).
                </span>
              </div>
              <Badge variant="outline" className="text-[11px] border-[#DDE4DE] text-[#5A6D5A]">
                {isAdmin ? 'Perfil Admin: Acesso total' : 'Perfil Somente Leitura'}
              </Badge>
            </CardHeader>

            <CardContent className="p-0 overflow-x-auto">
              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center text-[#5A6D5A] gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-[#1B5E20]" />
                  <span className="text-xs">Carregando credenciais de integração...</span>
                </div>
              ) : credenciais.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#5A6D5A]">
                  Nenhuma chave de API configurada no sistema.
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F5F7F5] border-b border-[#DDE4DE] text-[#5A6D5A] uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3 px-4">Integração / Nome</th>
                      <th className="py-3 px-4">Tipo</th>
                      <th className="py-3 px-4">Chave de API</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4">Último Uso</th>
                      <th className="py-3 px-4">Criada em</th>
                      <th className="py-3 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DDE4DE]">
                    {credenciais.map((cred) => {
                      const visivel = chavesVisiveis[cred.id]
                      const chaveExibida = visivel
                        ? cred.api_key
                        : cred.api_key.slice(0, 10) + '••••••••••••••••••••'

                      return (
                        <tr
                          key={cred.id}
                          className={`hover:bg-neutral-50/80 transition-colors ${
                            credencialSelecionadaId === cred.id ? 'bg-emerald-50/30' : ''
                          }`}
                        >
                          <td className="py-3.5 px-4 font-semibold text-[#1A2E1A]">
                            <div className="flex items-center gap-2">
                              <span>{cred.nome}</span>
                              {cred.tipo === 'picador_d2' && (
                                <Badge className="bg-[#1B5E20] text-white text-[9px] px-1.5 py-0">
                                  D2 Toledo
                                </Badge>
                              )}
                            </div>
                            {cred.descricao && (
                              <span className="text-[11px] text-[#5A6D5A] font-normal block mt-0.5 line-clamp-1">
                                {cred.descricao}
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <Badge
                              variant="outline"
                              className="text-[10px] uppercase font-mono font-semibold"
                            >
                              {cred.tipo}
                            </Badge>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2 font-mono text-[11px]">
                              <span className="bg-neutral-100 border border-neutral-200 px-2 py-1 rounded-md text-[#1A2E1A] font-medium tracking-tight">
                                {chaveExibida}
                              </span>

                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleCopiarChave(cred.api_key, cred.id)}
                                title="Copiar chave completa"
                                className="h-7 w-7 text-[#5A6D5A] hover:text-[#1B5E20]"
                              >
                                {chaveCopiadaId === cred.id ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </Button>

                              {isAdmin && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleToggleRevelarChave(cred.id)}
                                  title={visivel ? 'Ocultar chave' : 'Revelar chave'}
                                  className="h-7 w-7 text-[#5A6D5A] hover:text-[#1A2E1A]"
                                >
                                  {visivel ? (
                                    <EyeOff className="w-3.5 h-3.5" />
                                  ) : (
                                    <Eye className="w-3.5 h-3.5" />
                                  )}
                                </Button>
                              )}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {isAdmin ? (
                                <Switch
                                  checked={cred.is_ativa}
                                  onCheckedChange={() => handleToggleAtiva(cred)}
                                  title={
                                    cred.is_ativa ? 'Clique para inativar' : 'Clique para ativar'
                                  }
                                />
                              ) : cred.is_ativa ? (
                                <Badge className="bg-emerald-600 text-white text-[10px]">
                                  Ativa
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-[10px] text-neutral-400">
                                  Inativa
                                </Badge>
                              )}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 font-mono text-[#5A6D5A] text-[11px]">
                            {cred.ultimo_uso ? formatDataHora(cred.ultimo_uso) : 'Nunca utilizada'}
                          </td>

                          <td className="py-3.5 px-4 font-mono text-[#5A6D5A] text-[11px]">
                            {formatDataHora(cred.created)}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setCredencialSelecionadaId(cred.id)}
                                className={`h-7 text-xs ${
                                  credencialSelecionadaId === cred.id
                                    ? 'bg-emerald-100 text-[#1B5E20] font-bold'
                                    : 'text-[#5A6D5A]'
                                }`}
                              >
                                Selecionar
                              </Button>
                              {isAdmin && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteCredencial(cred)}
                                  title="Excluir credencial"
                                  className="h-7 w-7 text-[#5A6D5A] hover:text-rose-600 hover:bg-rose-50"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
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
        </TabsContent>

        {/* TAB 2: HISTÓRICO DE LOGS DE INGESTÃO */}
        <TabsContent value="historico" className="space-y-4 m-0">
          <Card className="border-[#DDE4DE] shadow-xs">
            <CardHeader className="p-4 border-b border-[#DDE4DE] bg-neutral-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-semibold text-[#1A2E1A] block">
                  Auditoria de Chamadas de Ingestão
                </span>
                <span className="text-[11px] text-[#5A6D5A]">
                  Cada requisição recebida no endpoint é gravada com IP, contagem de registros e
                  status.
                </span>
              </div>

              {/* FILTROS */}
              <div className="flex items-center gap-2 flex-wrap">
                <Select value={filtroCredencial} onValueChange={setFiltroCredencial}>
                  <SelectTrigger className="h-8 w-44 text-xs">
                    <SelectValue placeholder="Origem / Chave" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas as Origens</SelectItem>
                    {credenciais.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger className="h-8 w-36 text-xs">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos Status</SelectItem>
                    <SelectItem value="sucesso">Sucesso</SelectItem>
                    <SelectItem value="parcial">Parcial</SelectItem>
                    <SelectItem value="rejeitado">401 Rejeitado</SelectItem>
                    <SelectItem value="erro">Erro</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadLogs(paginaLog)}
                  disabled={refreshingLogs}
                  className="h-8 px-2.5 text-xs border-[#DDE4DE]"
                  title="Atualizar lista de eventos"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${refreshingLogs ? 'animate-spin text-[#1B5E20]' : ''}`}
                  />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-0 overflow-x-auto">
              {refreshingLogs && logs.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-[#5A6D5A] gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-[#1B5E20]" />
                  <span className="text-xs">Buscando histórico de chamadas...</span>
                </div>
              ) : logs.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#5A6D5A]">
                  Nenhum evento registrado com os filtros selecionados.
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F5F7F5] border-b border-[#DDE4DE] text-[#5A6D5A] uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3 px-4">Data / Hora</th>
                      <th className="py-3 px-4">Origem / Integração</th>
                      <th className="py-3 px-4">Endpoint</th>
                      <th className="py-3 px-4 text-center">Recebidos</th>
                      <th className="py-3 px-4 text-center">Aceitos</th>
                      <th className="py-3 px-4 text-center">Rejeitados</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Mensagem / Auditoria</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DDE4DE]">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono text-[#1A2E1A] whitespace-nowrap">
                          {formatDataHora(log.timestamp_evento)}
                        </td>

                        <td className="py-3 px-4 font-medium text-[#1A2E1A]">
                          <span>{log.origem_nome}</span>
                          {log.ip_origem && (
                            <span className="text-[10px] text-[#5A6D5A] font-mono block">
                              IP: {log.ip_origem}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 font-mono text-[11px] text-[#1B5E20]">
                          {log.endpoint}
                        </td>

                        <td className="py-3 px-4 text-center font-mono font-semibold">
                          {log.registros_recebidos}
                        </td>

                        <td className="py-3 px-4 text-center font-mono font-semibold text-emerald-700">
                          {log.registros_aceitos}
                        </td>

                        <td className="py-3 px-4 text-center font-mono font-semibold text-rose-700">
                          {log.registros_rejeitados}
                        </td>

                        <td className="py-3 px-4">{renderBadgeStatus(log.status)}</td>

                        <td className="py-3 px-4 max-w-sm">
                          {log.mensagem_erro ? (
                            <span className="text-rose-700 font-medium block truncate">
                              {log.mensagem_erro}
                            </span>
                          ) : (
                            <span className="text-emerald-700 text-[11px]">
                              Processado com sucesso
                            </span>
                          )}
                          {log.detalhes_json && (
                            <span className="text-[10px] text-[#5A6D5A] font-mono block truncate opacity-75">
                              {log.detalhes_json}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>

            {/* PAGINAÇÃO */}
            {totalPaginas > 1 && (
              <div className="p-3 border-t border-[#DDE4DE] bg-neutral-50 flex items-center justify-between text-xs text-[#5A6D5A]">
                <span>
                  Mostrando página {paginaLog} de {totalPaginas} ({totalLogs} eventos no total)
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={paginaLog <= 1}
                    onClick={() => loadLogs(paginaLog - 1)}
                    className="h-7 text-xs"
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={paginaLog >= totalPaginas}
                    onClick={() => loadLogs(paginaLog + 1)}
                    className="h-7 text-xs"
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* TAB 3: DOCUMENTAÇÃO INTERATIVA EMBUTIDA */}
        <TabsContent value="documentacao" className="space-y-4 m-0">
          <Card className="border-[#DDE4DE] shadow-xs">
            <CardHeader className="p-4 border-b border-[#DDE4DE] bg-neutral-50/50">
              <span className="text-xs font-semibold text-[#1A2E1A] block">
                Guia Técnico de Integração: Leitura Google Sheets (D2 Toledo) & Ingestão REST
              </span>
              <span className="text-[11px] text-[#5A6D5A]">
                Os dados de produção do Picador D2 BRF Toledo são{' '}
                <strong>PUXADOS diretamente da planilha Google Sheets</strong> via Conta de Serviço.
                O endpoint REST continua ativo para contingência ou para o aplicativo móvel offline
                de campo.
              </span>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 space-y-6">
              {/* FLUXO GOOGLE SHEETS D2 EXPLICADO */}
              <div className="p-4 bg-emerald-50/80 border border-emerald-300 rounded-xl space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#1B5E20] text-white flex items-center justify-center">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#1B5E20]">
                      Fluxo Real D2 — Leitura Direta de Planilha Google Sheets
                    </h3>
                    <p className="text-[11px] text-[#3D523D]">
                      Alimentação contínua do Picador BRF Toledo sem necessidade de programar
                      chamadas de API externas
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-[#1A2E1A] pt-1">
                  <div className="p-3 bg-white rounded-lg border border-emerald-200 shadow-2xs space-y-1">
                    <span className="text-[10px] font-bold uppercase text-[#1B5E20] block">
                      Passo 1 • Planilha Compartilhada
                    </span>
                    <p className="text-[11px] text-[#5A6D5A] leading-relaxed">
                      A planilha do picador é compartilhada como Leitor com o e-mail da Conta de
                      Serviço do Google Cloud gerado para a biotecnologia.
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-emerald-200 shadow-2xs space-y-1">
                    <span className="text-[10px] font-bold uppercase text-[#1B5E20] block">
                      Passo 2 • JWT OAuth2 & Backend
                    </span>
                    <p className="text-[11px] text-[#5A6D5A] leading-relaxed">
                      Ao clicar em "Testar conexão" ou "Sincronizar agora" (e pelo cron a cada 15
                      min), o backend autentica via JWT RS256 e lê o intervalo especificado.
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-emerald-200 shadow-2xs space-y-1">
                    <span className="text-[10px] font-bold uppercase text-[#1B5E20] block">
                      Passo 3 • Ingestão & Estoque
                    </span>
                    <p className="text-[11px] text-[#5A6D5A] leading-relaxed">
                      Cada linha vira uma expedição no histórico do picador. Linhas com nota/ticket
                      já registrados são preservadas por idempotência.
                    </p>
                  </div>
                </div>
              </div>

              {/* ENDPOINT INFO */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 bg-neutral-50 rounded-lg border border-[#DDE4DE]">
                  <span className="text-[10px] text-[#5A6D5A] font-bold uppercase block">
                    Método HTTP
                  </span>
                  <span className="font-mono font-bold text-sm text-[#1B5E20] block mt-0.5">
                    POST
                  </span>
                </div>

                <div className="p-3 bg-neutral-50 rounded-lg border border-[#DDE4DE] md:col-span-2">
                  <span className="text-[10px] text-[#5A6D5A] font-bold uppercase block">
                    URL do Endpoint de Ingestão (D2 Toledo)
                  </span>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <span className="font-mono text-xs text-[#1A2E1A] truncate select-all">
                      {backendBaseUrl}/backend/v1/ingestao/d2
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        navigator.clipboard.writeText(`${backendBaseUrl}/backend/v1/ingestao/d2`)
                        toast.success('URL copiada!')
                      }}
                      className="h-6 w-6 shrink-0"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* HEADERS */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A2E1A]">
                  Headers de Autenticação Necessários
                </h3>
                <div className="p-3 bg-neutral-900 text-neutral-100 rounded-lg font-mono text-xs space-y-1">
                  <div>
                    <span className="text-emerald-400">Content-Type:</span> application/json
                  </div>
                  <div>
                    <span className="text-emerald-400">X-API-Key:</span>{' '}
                    <span className="text-amber-300">{apiKeyExemplo}</span>
                  </div>
                  <div className="text-neutral-500 text-[11px] pt-1">
                    # Alternativamente aceito: Authorization: Bearer {apiKeyExemplo}
                  </div>
                </div>
              </div>

              {/* PAYLOAD EXPLICADO */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A2E1A]">
                  Estrutura do Payload JSON (Unidade ou Lote)
                </h3>
                <p className="text-xs text-[#5A6D5A]">
                  O endpoint aceita um único objeto JSON ou uma lista de registros para envio em
                  lote. Campos numéricos aceitam decimais com ponto flutuante.
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Exemplo de envio */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#1A2E1A] flex items-center gap-1.5">
                        <FileJson className="w-3.5 h-3.5 text-[#1B5E20]" />
                        Exemplo de Envio (Request Body)
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(payloadExemploJson)
                          toast.success('JSON copiado!')
                        }}
                        className="h-6 text-[11px]"
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Copiar
                      </Button>
                    </div>
                    <pre className="p-3 bg-neutral-900 text-neutral-100 rounded-lg font-mono text-[11px] overflow-x-auto leading-relaxed border border-neutral-800">
                      {payloadExemploJson}
                    </pre>
                  </div>

                  {/* Resposta esperada */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#1A2E1A] flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Resposta Sucesso 200 OK (Response Body)
                      </span>
                    </div>
                    <pre className="p-3 bg-neutral-900 text-neutral-100 rounded-lg font-mono text-[11px] overflow-x-auto leading-relaxed border border-neutral-800">
                      {respostaExemploJson}
                    </pre>
                  </div>
                </div>
              </div>

              {/* COMANDO CURL */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#1A2E1A] flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-[#1B5E20]" />
                    Comando cURL para Teste via Terminal
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(curlExemplo)
                      toast.success('Comando cURL copiado!')
                    }}
                    className="h-6 text-[11px]"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copiar cURL
                  </Button>
                </div>
                <pre className="p-3 bg-neutral-950 text-emerald-400 rounded-lg font-mono text-[11px] overflow-x-auto leading-relaxed border border-neutral-800">
                  {curlExemplo}
                </pre>
              </div>

              {/* REGRAS DE IDEMPOTÊNCIA E AUDITORIA */}
              <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2 text-xs text-[#1A2E1A]">
                <span className="font-bold text-[#1B5E20] block uppercase tracking-wider text-[11px]">
                  Regras de Idempotência & Controle de Estoque
                </span>
                <ul className="list-disc pl-4 space-y-1 leading-relaxed text-[#5A6D5A]">
                  <li>
                    <strong>Idempotência:</strong> A nota fiscal / número de ticket é validado como
                    identificador único. Re-leituras da planilha com a mesma nota são identificadas
                    como duplicadas e marcadas como{' '}
                    <code className="text-emerald-800 font-mono font-bold">
                      ignorado_idempotente
                    </code>
                    , evitando duplicidade no volume do picador.
                  </li>
                  <li>
                    <strong>Conexão Google Sheets vs API REST:</strong> A leitura da planilha é o
                    canal oficial de alimentação contínua da D2 Toledo. O endpoint POST{' '}
                    <code className="text-emerald-800 font-mono">/backend/v1/ingestao/d2</code>{' '}
                    permanece 100% ativo para o aplicativo offline de campo.
                  </li>
                  <li>
                    <strong>Segurança da Chave Privada:</strong> O token JWT da conta de serviço
                    Google é gerado com assinatura RS256 e a chave privada nunca é exposta na tela
                    após salva.
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: SIMULADOR DE ENVIO D2 */}
        <TabsContent value="simulador" className="space-y-4 m-0">
          <Card className="border-[#DDE4DE] shadow-xs">
            <CardHeader className="p-4 border-b border-[#DDE4DE] bg-neutral-50/50">
              <span className="text-xs font-semibold text-[#1A2E1A] block">
                Simulador de Expedição do Picador D2
              </span>
              <span className="text-[11px] text-[#5A6D5A]">
                Simule um disparo direto do equipamento para verificar a resposta do endpoint,
                consumo de estoque da pilha e registro em tempo real no log.
              </span>
            </CardHeader>

            <CardContent className="p-4 sm:p-6">
              <form onSubmit={handleEnviarSimulacaoD2} className="space-y-4 max-w-xl">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Credencial de Envio</Label>
                  <Select
                    value={credencialSelecionadaId}
                    onValueChange={setCredencialSelecionadaId}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Selecione a chave de API" />
                    </SelectTrigger>
                    <SelectContent>
                      {credenciais.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.nome} ({c.is_ativa ? 'Ativa' : 'Inativa'})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Nota Fiscal / Ticket</Label>
                    <Input
                      placeholder="Deixe em branco para auto-gerar"
                      value={simNf}
                      onChange={(e) => setSimNf(e.target.value)}
                      className="h-9 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Volume de Cavaco (m³) *</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={simVolume}
                      onChange={(e) => setSimVolume(e.target.value)}
                      className="h-9 font-mono font-bold"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Peso Estimado (t)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={simPeso}
                      onChange={(e) => setSimPeso(e.target.value)}
                      className="h-9 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Pilha de Origem (Consumo)</Label>
                    <Select value={simPilhaId} onValueChange={setSimPilhaId}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Selecione a pilha" />
                      </SelectTrigger>
                      <SelectContent>
                        {pilhasDisponiveis.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            [{p.codigo}] {p.nome || 'Pilha'} ({p.volume_atual_m3 || 0} m³)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Caminhão Rodoviário</Label>
                  <Select value={simCaminhaoId} onValueChange={setSimCaminhaoId}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Selecione o caminhão" />
                    </SelectTrigger>
                    <SelectContent>
                      {caminhoesDisponiveis.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.placa} — {c.modelo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  disabled={enviandoSimulacao}
                  className="bg-[#1B5E20] hover:bg-[#14521A] text-white w-full h-9 font-semibold text-xs shadow-xs"
                >
                  {enviandoSimulacao ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                      Enviando para o Endpoint de Ingestão...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5 mr-2" />
                      Disparar Carga de Teste D2 Toledo
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* MODAL 1: CRIAR NOVA CHAVE */}
      <Dialog open={modalNovaChaveOpen} onOpenChange={setModalNovaChaveOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg text-[#1A2E1A] flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-[#1B5E20]" />
              Gerar Nova Chave de API
            </DialogTitle>
            <DialogDescription className="text-xs text-[#5A6D5A]">
              Crie uma credencial exclusiva para o picador, balança ou aplicativo móvel. A chave
              será gerada com entropia segura.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSalvarNovaChave} className="space-y-4">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Identificação da Integração *</Label>
              <Input
                placeholder="Ex: D2 — Picador BRF Toledo"
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                className="h-9"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Tipo de Integração *</Label>
              <Select value={novoTipo} onValueChange={(val: TipoIntegracao) => setNovoTipo(val)}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="picador_d2">Picador D2 (BRF Toledo)</SelectItem>
                  <SelectItem value="app_campo">App de Campo Offline</SelectItem>
                  <SelectItem value="balanca_terceiros">Balança de Terceiros</SelectItem>
                  <SelectItem value="outro">Outro Sistema Externo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Descrição Operacional</Label>
              <Input
                placeholder="Ex: Rastreamento contínuo de esteira e expedição de biomassa"
                value={novaDescricao}
                onChange={(e) => setNovaDescricao(e.target.value)}
                className="h-9"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setModalNovaChaveOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={salvandoChave}
                className="bg-[#1B5E20] hover:bg-[#14521A] text-white"
              >
                {salvandoChave ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  'Gerar Chave Segura'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: CHAVE REVELADA UMA ÚNICA VEZ */}
      <Dialog open={modalChaveReveladaOpen} onOpenChange={setModalChaveReveladaOpen}>
        <DialogContent className="sm:max-w-lg border-amber-300">
          <DialogHeader>
            <DialogTitle className="text-lg text-[#1A2E1A] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Chave de API Criada com Sucesso!
            </DialogTitle>
            <DialogDescription className="text-xs text-[#5A6D5A]">
              Copie a chave agora. Por motivos de segurança e boas práticas de integração,
              configure-a imediatamente no seu sistema externo.
            </DialogDescription>
          </DialogHeader>

          {novaChaveGerada && (
            <div className="space-y-4 py-2">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>Atenção:</strong> Guarde esta credencial com segurança. Qualquer
                  requisição com ela terá permissão para registrar expedições e movimentações de
                  estoque.
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-[#1A2E1A] block">
                  Chave Gerada para: {novaChaveGerada.nome}
                </span>
                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value={novaChaveGerada.api_key}
                    className="h-10 font-mono font-bold text-xs bg-neutral-100 select-all border-[#1B5E20]"
                  />
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(novaChaveGerada.api_key)
                      toast.success('Chave de API copiada!')
                    }}
                    className="bg-[#1B5E20] hover:bg-[#14521A] text-white h-10 px-4 shrink-0"
                  >
                    <Copy className="w-4 h-4 mr-1.5" />
                    Copiar
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              onClick={() => setModalChaveReveladaOpen(false)}
              className="bg-[#1A2E1A] hover:bg-neutral-800 text-white w-full sm:w-auto"
            >
              Entendido e Copiado
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
