import React, { useEffect, useState, useMemo } from 'react'
import { apiService } from '@/services/florestalApi'
import { useAuth } from '@/context/AuthContext'
import {
  IntegracaoCredencial,
  IntegracaoLog,
  TipoIntegracao,
  StatusIngestaoLog,
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
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Code2,
  RefreshCw,
  Terminal,
  ShieldCheck,
  FileJson,
  Trash2,
  RotateCcw,
} from 'lucide-react'
import { toast } from 'sonner'
import { GoogleSheetsD2Section } from './GoogleSheetsD2Section'
import { GoogleSheetsConfigRecord } from '@/types/florestal'

export default function IntegracoesPage() {
  const { user } = useAuth()
  const isAdmin = user?.papel === 'admin'

  // PocketBase Base URL para documentação real
  const backendBaseUrl =
    (import.meta.env.VITE_POCKETBASE_URL as string) ||
    (typeof window !== 'undefined' ? window.location.origin : '')

  // Google Sheets Config
  const [sheetsConfig, setSheetsConfig] = useState<GoogleSheetsConfigRecord | null>(null)
  const [sheetsConfigLoaded, setSheetsConfigLoaded] = useState(false)
  const [sheetsConfigError, setSheetsConfigError] = useState<string | null>(null)

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

  // Modal e Ação de Zerar Base de Dados
  const [modalPurgeOpen, setModalPurgeOpen] = useState(false)
  const [purgandoBase, setPurgandoBase] = useState(false)
  const [confirmacaoPurgeTexto, setConfirmacaoPurgeTexto] = useState('')

  // Modal e Ação de Limpar Apenas Histórico de Ingestão
  const [modalLimparHistoricoOpen, setModalLimparHistoricoOpen] = useState(false)
  const [limpandoHistorico, setLimpandoHistorico] = useState(false)
  const [confirmacaoLimparTexto, setConfirmacaoLimparTexto] = useState('')

  // Controle de exibição de chaves na tabela
  const [chavesVisiveis, setChavesVisiveis] = useState<Record<string, boolean>>({})
  const [chaveCopiadaId, setChaveCopiadaId] = useState<string | null>(null)

  // Credencial selecionada para a documentação da API
  const [credencialSelecionadaId, setCredencialSelecionadaId] = useState<string>('')

  // Carregar configuração do Google Sheets
  const loadSheetsConfig = async () => {
    try {
      const cfg = await apiService.getGoogleSheetsConfig()
      setSheetsConfig(cfg || null)
      setSheetsConfigLoaded(true)
      setSheetsConfigError(null)
    } catch (err: any) {
      console.error('Erro ao carregar configuração do Google Sheets:', err)
      const msg = err?.message || 'Falha ao carregar configuração do Google Sheets'
      setSheetsConfigError(msg)
      setSheetsConfigLoaded(false)
      toast.error(`Erro ao carregar configuração do Google Sheets: ${msg}`)
    }
  }

  // Carregar dados principais
  const loadCredenciais = async () => {
    try {
      const list = await apiService.getIntegracoes().catch(() => [])
      const listaSegura = Array.isArray(list) ? list : []
      setCredenciais(listaSegura)
      if (listaSegura.length > 0 && !credencialSelecionadaId) {
        setCredencialSelecionadaId(listaSegura[0]?.id || '')
      }
    } catch (err: any) {
      console.error(err)
      setCredenciais([])
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

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await Promise.all([loadSheetsConfig(), loadCredenciais(), loadLogs(1)])
      setLoading(false)
    }
    init()
  }, [])

  useEffect(() => {
    loadLogs(1)
  }, [filtroCredencial, filtroStatus])

  // Credencial ativa selecionada
  const credencialAtiva = useMemo(() => {
    if (!Array.isArray(credenciais) || credenciais.length === 0) return null
    return credenciais.find((c) => c?.id === credencialSelecionadaId) || credenciais[0] || null
  }, [credenciais, credencialSelecionadaId])

  // Ações de Credencial
  const handleToggleAtiva = async (cred: IntegracaoCredencial) => {
    if (!isAdmin) {
      toast.error('Apenas Administradores podem ativar ou inativar chaves de API.')
      return
    }
    const novoStatus = !cred?.is_ativa
    try {
      await apiService.toggleIntegracaoAtiva(cred.id, novoStatus)
      setCredenciais((prev) =>
        prev.map((c) => (c.id === cred.id ? { ...c, is_ativa: novoStatus } : c)),
      )
      toast.success(
        `Integração "${cred?.nome || 'API'}" ${novoStatus ? 'ativada' : 'desativada'} com sucesso!`,
      )
    } catch (_err: any) {
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

  // Executar limpeza exclusiva do histórico de ingestão
  const handleExecutarLimparHistorico = async () => {
    if (!isAdmin) {
      toast.error('Apenas Administradores podem limpar o histórico de ingestão.')
      return
    }
    if (confirmacaoLimparTexto.trim().toUpperCase() !== 'LIMPAR') {
      toast.error('Digite a palavra LIMPAR para confirmar a ação.')
      return
    }

    setLimpandoHistorico(true)
    try {
      const res = await apiService.limparHistoricoIngestao()
      if (res.sucesso) {
        toast.success(
          res.mensagem ||
            'Histórico de ingestão limpo com sucesso! Eventos apagados e contadores zerados.',
        )
        setModalLimparHistoricoOpen(false)
        setConfirmacaoLimparTexto('')
        await Promise.all([loadLogs(1), loadSheetsConfig()])
      } else {
        toast.error(res.erro || 'Falha ao limpar histórico de ingestão.')
      }
    } catch (err: any) {
      toast.error(
        err?.data?.erro || err?.message || 'Erro ao processar limpeza do histórico de ingestão.',
      )
    } finally {
      setLimpandoHistorico(false)
    }
  }

  // Executar limpeza e reset total da base de dados
  const handleExecutarPurge = async () => {
    if (!isAdmin) {
      toast.error('Apenas Administradores podem zerar a base de dados.')
      return
    }
    if (confirmacaoPurgeTexto.trim().toUpperCase() !== 'ZERAR') {
      toast.error('Digite a palavra ZERAR para confirmar a ação irreversível.')
      return
    }

    setPurgandoBase(true)
    try {
      const res = await apiService.purgarBaseDados()
      if (res.sucesso) {
        toast.success(
          res.mensagem || 'Base de dados zerada com sucesso! Cadastros e históricos foram limpos.',
        )
        setModalPurgeOpen(false)
        setConfirmacaoPurgeTexto('')
        await Promise.all([loadLogs(1), loadSheetsConfig()])
      } else {
        toast.error(res.erro || 'Falha ao executar limpeza da base de dados.')
      }
    } catch (err: any) {
      toast.error(err?.data?.erro || err?.message || 'Erro ao processar limpeza da base.')
    } finally {
      setPurgandoBase(false)
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
  const apiKeyExemplo = credencialAtiva ? credencialAtiva.api_key : 'sua_chave_api'
  const curlExemplo = `curl -X POST "${backendBaseUrl}/backend/v1/ingestao/d2" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: ${apiKeyExemplo}" \\
  -d '{
    "nota_fiscal": "NF-98421",
    "data_hora_expedicao": "${new Date().toISOString()}",
    "volume_cavaco_m3": 45.0,
    "peso_cavaco_t": 14.4,
    "volume_tora_consumido_m3": 18.0,
    "cliente": "Unidade de processamento",
    "umidade_perc": 42.5,
    "operador_nome": "Operador"
  }'`

  const payloadExemploJson = `{
  "nota_fiscal": "NF-98421",
  "data_hora_expedicao": "2026-10-15T14:30:00Z",
  "volume_cavaco_m3": 45.0,
  "peso_cavaco_t": 14.4,
  "volume_tora_consumido_m3": 18.0,
  "cliente": "Unidade de processamento",
  "umidade_perc": 42.5,
  "pilha_codigo": "PIL-01",
  "placa": "ABC1D23",
  "operador_nome": "Operador"
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
            Gestão de chaves de API, importação de planilhas e auditoria de eventos recebidos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setConfirmacaoPurgeTexto('')
                  setModalPurgeOpen(true)
                }}
                className="border-rose-300 text-rose-700 hover:bg-rose-50 hover:text-rose-800 shadow-xs text-xs h-9"
                title="Zerar dados de operação para iniciar com dados reais"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Zerar Base de Dados
              </Button>
              <Button
                onClick={handleOpenCriarChave}
                className="bg-[#1B5E20] hover:bg-[#14521A] text-white shadow-xs text-xs h-9"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Gerar Nova Chave API
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Importação e sincronização via Google Sheets */}
      <GoogleSheetsD2Section
        config={sheetsConfig}
        isConfigLoaded={sheetsConfigLoaded}
        configError={sheetsConfigError}
        onRetryLoadConfig={loadSheetsConfig}
        isAdmin={isAdmin}
        onConfigUpdated={loadSheetsConfig}
        onIngestaoSucesso={() => {
          loadLogs(1)
          loadCredenciais()
        }}
      />

      <Card className="border-[#DDE4DE] shadow-xs overflow-hidden">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-[#DDE4DE] bg-neutral-50/50 text-xs">
          <div className="p-4">
            <span className="text-[11px] font-medium text-[#5A6D5A] uppercase block">
              Total de Integrações
            </span>
            <span className="text-xl font-bold text-[#1A2E1A] mt-0.5 block">
              {credenciais.length}
            </span>
            <span className="text-[11px] text-[#5A6D5A]">
              {(credenciais || []).filter((c) => Boolean(c?.is_ativa)).length} ativas
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
            Documentação da API
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
                              {cred.tipo === 'picador_d2'
                                ? 'Integração de Picador'
                                : cred.tipo.replaceAll('_', ' ')}
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
                                  checked={Boolean(cred?.is_ativa)}
                                  onCheckedChange={() => handleToggleAtiva(cred)}
                                  title={
                                    cred?.is_ativa ? 'Clique para inativar' : 'Clique para ativar'
                                  }
                                />
                              ) : cred?.is_ativa ? (
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

              {/* FILTROS E AÇÃO DE LIMPAR HISTÓRICO */}
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

                {isAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setConfirmacaoLimparTexto('')
                      setModalLimparHistoricoOpen(true)
                    }}
                    disabled={refreshingLogs || totalLogs === 0}
                    className="h-8 text-xs border-amber-300 text-amber-800 hover:bg-amber-50 hover:text-amber-900 font-medium"
                    title="Limpar apenas os registros de chamadas e eventos de ingestão"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1 text-amber-700" />
                    Limpar Histórico de Ingestão
                  </Button>
                )}
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
                Guia Técnico de Integração via Google Sheets e API REST
              </span>
              <span className="text-[11px] text-[#5A6D5A]">
                A importação de dados do Google Sheets usa uma conta de serviço. O endpoint REST
                também está disponível para integrações externas e aplicativos de campo.
              </span>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 space-y-6">
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
                    URL do Endpoint de Ingestão
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
                    <strong>Google Sheets e API REST:</strong> A leitura da planilha é realizada
                    pelo importador. O endpoint POST{' '}
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
                placeholder="Ex: Integração do picador"
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
                  <SelectItem value="picador_d2">Integração de Picador</SelectItem>
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

      {/* MODAL LIMPAR HISTÓRICO DE INGESTÃO (ADMIN ONLY) */}
      <Dialog open={modalLimparHistoricoOpen} onOpenChange={setModalLimparHistoricoOpen}>
        <DialogContent className="sm:max-w-lg border-amber-300">
          <DialogHeader>
            <DialogTitle className="text-lg text-amber-950 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-amber-600" />
              Limpar Histórico de Ingestão
            </DialogTitle>
            <DialogDescription className="text-xs text-[#5A6D5A]">
              Esta ação apaga <strong>
                apenas o registro de eventos/chamadas de ingestão
              </strong> e
              zera os contadores de sincronização do importador, preservando todos os dados
              importados.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-1 text-xs">
            <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-lg text-amber-950 space-y-2">
              <div className="font-semibold flex items-center gap-1.5 text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                O que será excluído (zerado):
              </div>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-amber-900/90 leading-relaxed">
                <li>
                  <strong>Auditoria de chamadas:</strong> Todos os registros da tabela de logs de
                  ingestão ({totalLogs} eventos registrados).
                </li>
                <li>
                  <strong>Contador de ingestão:</strong> A contagem de linhas ingeridas pela
                  planilha configurada volta a zero.
                </li>
              </ul>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-950 space-y-1">
              <div className="font-semibold flex items-center gap-1.5 text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                O que será PRESERVADO intacto (não será apagado):
              </div>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-emerald-900 leading-relaxed">
                <li>
                  <strong>Cadastros:</strong> Fazendas, Talhões, Máquinas, Caminhões, Pilhas e
                  Usuários mantidos.
                </li>
                <li>
                  <strong>Dados operacionais já importados:</strong> Expedições do Picador, baldeio,
                  descarga, feller, skidder e medições do ToraCerta continuam salvos.
                </li>
                <li>
                  <strong>Chaves de API & Conexões:</strong> Credenciais de API e a conexão Google
                  Sheets permanecem ativas e funcionais.
                </li>
              </ul>
            </div>

            <div className="space-y-1.5 pt-1">
              <Label className="text-xs font-semibold text-[#1A2E1A]">
                Para confirmar a limpeza do histórico, digite{' '}
                <span className="text-amber-800 font-mono font-bold">LIMPAR</span> abaixo:
              </Label>
              <Input
                placeholder="Digite LIMPAR"
                value={confirmacaoLimparTexto}
                onChange={(e) => setConfirmacaoLimparTexto(e.target.value)}
                className="h-9 font-mono tracking-wider border-amber-300 focus:border-amber-600 focus:ring-amber-500 text-xs"
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={limpandoHistorico}
              onClick={() => setModalLimparHistoricoOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={
                limpandoHistorico || confirmacaoLimparTexto.trim().toUpperCase() !== 'LIMPAR'
              }
              onClick={handleExecutarLimparHistorico}
              className="bg-amber-700 hover:bg-amber-800 text-white font-semibold"
            >
              {limpandoHistorico ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Limpando histórico...
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  Confirmar e Limpar Histórico
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 3: ZERAR BASE DE DADOS (ADMIN PURGE) */}
      <Dialog open={modalPurgeOpen} onOpenChange={setModalPurgeOpen}>
        <DialogContent className="sm:max-w-lg border-rose-300">
          <DialogHeader>
            <DialogTitle className="text-lg text-rose-900 flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-rose-600" />
              Zerar Base de Dados do Sistema
            </DialogTitle>
            <DialogDescription className="text-xs text-[#5A6D5A]">
              Esta ação limpa todos os registros de dados de demonstração/testes para início com
              dados reais de operação.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-1 text-xs">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-950 space-y-2">
              <div className="font-semibold flex items-center gap-1.5 text-rose-800">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                O que será excluído (zerado permanentemente):
              </div>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-rose-900/90 leading-relaxed">
                <li>
                  <strong>Cadastros:</strong> Fazendas, Talhões, Máquinas, Caminhões, Caminhões de
                  Baldeio, Pilhas e Motivos de Parada.
                </li>
                <li>
                  <strong>Históricos operacionais:</strong> Apontamentos de Feller, Skidder,
                  Baldeio, Descarga no Pátio e Expedição do Picador.
                </li>
                <li>
                  <strong>Estoques e conciliação:</strong> Inventários físicos ToraCerta, alertas de
                  divergência, ajustes e histórico de conciliação.
                </li>
                <li>
                  <strong>Parâmetros e tabelas de conversão:</strong> Registros das tabelas de SR de
                  toras, cavaco e fatores operacionais.
                </li>
                <li>
                  <strong>Histórico de ingestão:</strong> Logs de eventos de sincronização
                  anteriores.
                </li>
              </ul>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-950 space-y-1">
              <div className="font-semibold flex items-center gap-1.5 text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                O que será PRESERVADO intacto:
              </div>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-emerald-900 leading-relaxed">
                <li>
                  <strong>Usuários e Acesso:</strong> Usuário administrador
                  (henrique@julitago.com.br) e login mantidos sem perda de acesso.
                </li>
                <li>
                  <strong>Chaves de API:</strong> Credenciais de integrações parceiras preservadas.
                </li>
                <li>
                  <strong>Conexão Google Sheets:</strong> Credencial de serviço, planilha e
                  mapeamentos de abas preservados para você reimportar dados reais a qualquer
                  momento.
                </li>
              </ul>
            </div>

            <div className="space-y-1.5 pt-1">
              <Label className="text-xs font-semibold text-[#1A2E1A]">
                Para confirmar a exclusão definitiva, digite{' '}
                <span className="text-rose-700 font-mono font-bold">ZERAR</span> abaixo:
              </Label>
              <Input
                placeholder="Digite ZERAR"
                value={confirmacaoPurgeTexto}
                onChange={(e) => setConfirmacaoPurgeTexto(e.target.value)}
                className="h-9 font-mono tracking-wider border-rose-300 focus:border-rose-600 focus:ring-rose-500 text-xs"
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={purgandoBase}
              onClick={() => setModalPurgeOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={purgandoBase || confirmacaoPurgeTexto.trim().toUpperCase() !== 'ZERAR'}
              onClick={handleExecutarPurge}
              className="bg-rose-700 hover:bg-rose-800 text-white font-semibold"
            >
              {purgandoBase ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Zerando base de dados...
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  Confirmar e Zerar Base
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
