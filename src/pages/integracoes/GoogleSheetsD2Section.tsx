import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
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
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  RefreshCw,
  Play,
  Save,
  KeyRound,
  ExternalLink,
  ShieldCheck,
  Clock,
  Sparkles,
  Layers,
  Search,
  Database,
  ArrowRight,
  ListOrdered,
  Eye,
  Check,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { toast } from 'sonner'
import { apiService } from '@/services/florestalApi'
import {
  GoogleSheetsConfigRecord,
  ImportadorBaseConfigItem,
  PreviaImportacaoResponse,
  RegraDuplicidade,
} from '@/types/florestal'
import { createGoogleServiceAccountJwt } from '@/lib/googleJwt'
import { BASES_IMPORTADOR_CATALOGO } from './importadorCatalogo'

interface GoogleSheetsD2SectionProps {
  config: GoogleSheetsConfigRecord | null
  isConfigLoaded?: boolean
  configError?: string | null
  onRetryLoadConfig?: () => void
  isAdmin: boolean
  onConfigUpdated: () => void
  onIngestaoSucesso: () => void
}

export const GoogleSheetsD2Section: React.FC<GoogleSheetsD2SectionProps> = ({
  config,
  isConfigLoaded = true,
  configError = null,
  onRetryLoadConfig,
  isAdmin,
  onConfigUpdated,
  onIngestaoSucesso,
}) => {
  // Formulário Principal de Conexão
  const [spreadsheetId, setSpreadsheetId] = useState(config?.spreadsheet_id || '')
  const [sheetRange, setSheetRange] = useState(config?.sheet_range || 'Historico_Feller!A:P')
  const [serviceAccountJson, setServiceAccountJson] = useState('')
  const [substituindoChave, setSubstituindoChave] = useState(!config?.client_email)
  const [sincronizacaoAutomatica, setSincronizacaoAutomatica] = useState(
    config?.sincronizacao_automatica ?? true,
  )
  const [isAtiva, setIsAtiva] = useState(Boolean(config?.is_ativa ?? true))

  // Estados de ação do conector
  const [salvando, setSalvando] = useState(false)
  const [testando, setTestando] = useState(false)
  const [carregandoAbas, setCarregandoAbas] = useState(false)
  const [abasDetectadas, setAbasDetectadas] = useState<string[]>([])

  // Estado das 14 bases do importador multi-base
  const [basesConfig, setBasesConfig] = useState<Record<string, ImportadorBaseConfigItem>>({})
  const [basesConfigLoaded, setBasesConfigLoaded] = useState(false)
  const [basesConfigError, setBasesConfigError] = useState<string | null>(null)
  const [carregandoBases, setCarregandoBases] = useState(true)
  const [salvandoMapeamentoModal, setSalvandoMapeamentoModal] = useState(false)
  const [baseSelecionadaModal, setBaseSelecionadaModal] = useState<string | null>(null)
  const [lendoCabecalhosBase, setLendoCabecalhosBase] = useState<string | null>(null)

  // Estados de Prévia & Execução da Importação
  const [gerandoPrevia, setGerandoPrevia] = useState(false)
  const [previaResultado, setPreviaResultado] = useState<PreviaImportacaoResponse | null>(null)
  const [modalPreviaOpen, setModalPreviaOpen] = useState(false)
  const [executandoImportacao, setExecutandoImportacao] = useState(false)

  // Filtro de busca na listagem das bases
  const [filtroTexto, setFiltroTexto] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState<'todas' | 'cadastro' | 'historico'>(
    'todas',
  )

  // Feedback do último teste
  const [resultadoTeste, setResultadoTeste] = useState<{
    sucesso: boolean
    mensagem?: string
    linhas?: number
    colunas?: number
    erro?: string
    instrucao?: string
  } | null>(null)

  // Carrega configurações das bases de forma segura (sem mascarar erros como vazio)
  const carregarConfiguracoesBases = async () => {
    setCarregandoBases(true)
    setBasesConfigError(null)
    try {
      const salvas = await apiService.getImportadorBasesConfig()
      const mapaSalvo: Record<string, ImportadorBaseConfigItem> = {}

      if (Array.isArray(salvas)) {
        salvas.forEach((item: any) => {
          if (item?.base_key) {
            mapaSalvo[item.base_key] = {
              id: item.id,
              base_key: item.base_key,
              base_nome: item.base_nome || item.base_key,
              destino_tabela: item.destino_tabela || item.base_key,
              aba_planilha: item.aba_planilha || '',
              coluna_id_unico: item.coluna_id_unico || '_ID_',
              regra_duplicidade: item.regra_duplicidade || 'atualizar',
              ordem_execucao: item.ordem_execucao || 1,
              is_ativa: item.is_ativa !== false,
              mapeamento_campos: item.mapeamento_campos || {},
              cabecalhos_detectados: item.cabecalhos_detectados || [],
              ultima_importacao: item.ultima_importacao,
              total_importados: item.total_importados || 0,
              ultimo_status: item.ultimo_status,
              ultimo_erro: item.ultimo_erro,
            }
          }
        })
      }

      // Garante que todas as 14 bases existam no estado com valores padrão
      const mapaFinal: Record<string, ImportadorBaseConfigItem> = {}
      BASES_IMPORTADOR_CATALOGO.forEach((b) => {
        const salvo = mapaSalvo[b.key]
        mapaFinal[b.key] = {
          id: salvo?.id,
          base_key: b.key,
          base_nome: b.nome,
          destino_tabela: b.destino,
          aba_planilha: salvo?.aba_planilha || b.nome, // Sugere aba com o mesmo nome da base
          coluna_id_unico: salvo?.coluna_id_unico || '_ID_',
          regra_duplicidade: (salvo?.regra_duplicidade as RegraDuplicidade) || 'atualizar',
          ordem_execucao: salvo?.ordem_execucao || b.ordemPadrao,
          is_ativa: salvo?.is_ativa !== false,
          mapeamento_campos: salvo?.mapeamento_campos || {},
          cabecalhos_detectados: salvo?.cabecalhos_detectados || [],
          ultima_importacao: salvo?.ultima_importacao,
          total_importados: salvo?.total_importados || 0,
          ultimo_status: salvo?.ultimo_status,
          ultimo_erro: salvo?.ultimo_erro,
        }
      })

      setBasesConfig(mapaFinal)
      setBasesConfigLoaded(true)
      setBasesConfigError(null)
    } catch (err: any) {
      console.error('Erro ao inicializar bases do importador:', err)
      const msg = err?.message || 'Falha ao carregar configurações das bases do importador.'
      setBasesConfigError(msg)
      setBasesConfigLoaded(false)
      toast.error(`Erro ao carregar configurações das bases: ${msg}`)
    } finally {
      setCarregandoBases(false)
    }
  }

  // Inicializa configurações locais das bases ao carregar
  useEffect(() => {
    carregarConfiguracoesBases()
  }, [])

  // Atualizar form quando config carregar
  useEffect(() => {
    if (config) {
      setSpreadsheetId(config.spreadsheet_id || '')
      setSheetRange(config.sheet_range || 'Historico_Feller!A:P')
      setSincronizacaoAutomatica(config.sincronizacao_automatica ?? true)
      setIsAtiva(Boolean(config.is_ativa ?? true))
      if (config.client_email) {
        setSubstituindoChave(false)
      }
    } else {
      setIsAtiva(true)
    }
  }, [config])

  // Formatar data hora
  const formatDataHora = (iso?: string) => {
    if (!iso) return 'Nunca sincronizado'
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

  // Parse e validação do JSON da conta de serviço
  const parseServiceAccountJson = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString)
      if (parsed.type !== 'service_account') {
        throw new Error('O JSON informado não é do tipo "service_account".')
      }
      if (!parsed.client_email || !parsed.private_key) {
        throw new Error('O JSON deve conter "client_email" e "private_key".')
      }
      return parsed
    } catch (err: any) {
      throw new Error(`JSON de conta de serviço inválido: ${err.message}`)
    }
  }

  // Obter credencial ativa (do form ou do backend se mantida)
  const obterCredencialParaAcao = async () => {
    let clientEmail = config?.client_email || ''
    let privateKey = config?.private_key || ''

    if (serviceAccountJson.trim()) {
      const parsed = parseServiceAccountJson(serviceAccountJson.trim())
      clientEmail = parsed.client_email
      privateKey = parsed.private_key
    }

    if (!clientEmail || !privateKey) {
      throw new Error('Cole o JSON da Conta de Serviço do Google para autenticar.')
    }

    return { clientEmail, privateKey }
  }

  // Gerar JWT Google
  const gerarJwtGoogle = async () => {
    const { clientEmail, privateKey } = await obterCredencialParaAcao()
    return await createGoogleServiceAccountJwt(
      clientEmail,
      privateKey,
      'https://www.googleapis.com/auth/spreadsheets.readonly',
    )
  }

  // Listar todas as abas da planilha
  const handleCarregarAbas = async () => {
    if (!spreadsheetId.trim()) {
      toast.error('Informe o ID da planilha para buscar as abas.')
      return
    }

    setCarregandoAbas(true)
    try {
      const signedJwt = await gerarJwtGoogle()
      const res = await apiService.listarAbasPlanilha({
        spreadsheet_id: spreadsheetId.trim(),
        signed_jwt: signedJwt,
      })

      if (res.sucesso && Array.isArray(res.abas) && res.abas.length > 0) {
        setAbasDetectadas(res.abas)
        toast.success(`${res.abas.length} aba(s) detectada(s) na planilha!`)

        // Tenta auto-atribuir abas com nomes similares às bases não configuradas
        setBasesConfig((prev) => {
          const next = { ...prev }
          res.abas.forEach((abaNome) => {
            const abaLimpa = abaNome.toLowerCase().replace(/[^a-z0-9]/g, '')
            Object.keys(next).forEach((key) => {
              const baseDef = BASES_IMPORTADOR_CATALOGO.find((b) => b.key === key)
              if (baseDef) {
                const keyLimpa = baseDef.nome.toLowerCase().replace(/[^a-z0-9]/g, '')
                if (abaLimpa === keyLimpa || abaLimpa.includes(keyLimpa)) {
                  if (!next[key].aba_planilha || next[key].aba_planilha === baseDef.nome) {
                    next[key] = { ...next[key], aba_planilha: abaNome }
                  }
                }
              }
            })
          })
          return next
        })
      } else {
        toast.error(res.erro || 'Nenhuma aba encontrada na planilha.')
      }
    } catch (err: any) {
      toast.error(err.message || 'Erro ao carregar abas da planilha Google.')
    } finally {
      setCarregandoAbas(false)
    }
  }

  // Detectar cabeçalhos de uma base específica e sugerir mapeamento
  const handleDetectarCabecalhosBase = async (baseKey: string) => {
    const baseItem = basesConfig[baseKey]
    if (!baseItem?.aba_planilha) {
      toast.error('Informe o nome da aba para detectar cabeçalhos.')
      return
    }

    setLendoCabecalhosBase(baseKey)
    try {
      const signedJwt = await gerarJwtGoogle()
      const res = await apiService.inspecionarCabecalhosAba({
        spreadsheet_id: spreadsheetId.trim(),
        aba: baseItem.aba_planilha,
        signed_jwt: signedJwt,
      })

      if (res.sucesso && Array.isArray(res.cabecalhos) && res.cabecalhos.length > 0) {
        const baseDef = BASES_IMPORTADOR_CATALOGO.find((b) => b.key === baseKey)
        const novoMapeamento: Record<string, string> = { ...baseItem.mapeamento_campos }

        // Função utilitária robusta de normalização (sem acentos, minúsculas, apenas alfanuméricos)
        const normalizarTexto = (txt: string) =>
          txt
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '')

        // Mapeia por prioridade:
        // 1ª passada: match exato na lista de sugestões / nome de campo (normalizados)
        // 2ª passada: match exato de sinônimos conhecidos
        // 3ª passada: prefixo / substring se muito evidente (comprimento >= 4)
        res.cabecalhos.forEach((colHeader) => {
          if (novoMapeamento[colHeader] || !baseDef) return
          const colNorm = normalizarTexto(colHeader)
          if (!colNorm) return

          // 1. Match exato normalizado
          for (const campoDest of baseDef.camposDestino) {
            const candidatos = [
              campoDest.campo,
              campoDest.label,
              ...(campoDest.sugestoesCabecalho || []),
            ]
            const matchExato = candidatos.some((cand) => normalizarTexto(cand) === colNorm)
            if (matchExato) {
              novoMapeamento[colHeader] = campoDest.campo
              return
            }
          }

          // 2. Regras semânticas específicas se ainda não mapeado
          if (
            (colNorm === 'email' || colNorm.includes('email') || colNorm === 'login') &&
            baseDef.camposDestino.some((c) => c.campo === 'email_registro')
          ) {
            novoMapeamento[colHeader] = 'email_registro'
            return
          }

          if (
            (colNorm === 'operador' ||
              colNorm.includes('motorista') ||
              colNorm.includes('operador')) &&
            baseDef.camposDestino.some((c) => c.campo === 'operador')
          ) {
            novoMapeamento[colHeader] = 'operador'
            return
          }

          if (
            (colNorm === 'fazenda' || colNorm.includes('fazenda') || colNorm === 'propriedade') &&
            baseDef.camposDestino.some((c) => c.campo === 'fazenda_id')
          ) {
            novoMapeamento[colHeader] = 'fazenda_id'
            return
          }

          if (
            (colNorm === 'talhao' || colNorm.includes('talhao')) &&
            baseDef.camposDestino.some((c) => c.campo === 'talhao_origem_id')
          ) {
            novoMapeamento[colHeader] = 'talhao_origem_id'
            return
          }

          if (
            (colNorm === 'talhao' || colNorm.includes('talhao')) &&
            baseDef.camposDestino.some((c) => c.campo === 'talhao_id')
          ) {
            novoMapeamento[colHeader] = 'talhao_id'
            return
          }

          if (
            (colNorm === 'pilha' || colNorm.includes('pilha')) &&
            baseDef.camposDestino.some((c) => c.campo === 'pilha_destino_id')
          ) {
            novoMapeamento[colHeader] = 'pilha_destino_id'
            return
          }

          if (
            (colNorm === 'pilha' || colNorm.includes('pilha')) &&
            baseDef.camposDestino.some((c) => c.campo === 'pilha_origem_id')
          ) {
            novoMapeamento[colHeader] = 'pilha_origem_id'
            return
          }

          if (
            (colNorm === 'status' || colNorm === 'statusevento') &&
            baseDef.camposDestino.some((c) => c.campo === 'status_evento')
          ) {
            novoMapeamento[colHeader] = 'status_evento'
            return
          }

          if (
            (colNorm === 'statushis' || colNorm === 'statushistorico') &&
            baseDef.camposDestino.some((c) => c.campo === 'status_his')
          ) {
            novoMapeamento[colHeader] = 'status_his'
            return
          }

          if (
            (colNorm === 'veiculoabastecimento' ||
              colNorm.includes('abastecimento') ||
              colNorm === 'comboio') &&
            baseDef.camposDestino.some((c) => c.campo === 'veiculo_abastecimento')
          ) {
            novoMapeamento[colHeader] = 'veiculo_abastecimento'
            return
          }

          if (
            (colNorm === 'horimetro' || colNorm === 'bt') &&
            baseDef.camposDestino.some((c) => c.campo === 'horimetro')
          ) {
            novoMapeamento[colHeader] = 'horimetro'
            return
          }

          if (
            (colNorm === 'litros' || colNorm === 'diesel' || colNorm === 'combustivel') &&
            baseDef.camposDestino.some((c) => c.campo === 'litros')
          ) {
            novoMapeamento[colHeader] = 'litros'
            return
          }

          if (
            (colNorm === 'motivo' || colNorm === 'justificativa') &&
            baseDef.camposDestino.some((c) => c.campo === 'motivo_id')
          ) {
            novoMapeamento[colHeader] = 'motivo_id'
            return
          }

          if (
            (colNorm === 'fim' || colNorm === 'datafim' || colNorm === 'horafim') &&
            baseDef.camposDestino.some((c) => c.campo === 'fim')
          ) {
            novoMapeamento[colHeader] = 'fim'
            return
          }

          if (
            (colNorm === 'inicio' || colNorm === 'datainicio' || colNorm === 'horainicio') &&
            baseDef.camposDestino.some((c) => c.campo === 'inicio')
          ) {
            novoMapeamento[colHeader] = 'inicio'
            return
          }

          if (
            (colNorm === 'tempo' || colNorm === 'duracao' || colNorm === 'tempohoras') &&
            baseDef.camposDestino.some((c) => c.campo === 'tempo')
          ) {
            novoMapeamento[colHeader] = 'tempo'
            return
          }

          if (
            (colNorm === 'srtoras' ||
              colNorm === 'volumesr' ||
              colNorm === 'volumestereo' ||
              colNorm === 'sr') &&
            baseDef.camposDestino.some((c) => c.campo === 'volume_sr')
          ) {
            novoMapeamento[colHeader] = 'volume_sr'
            return
          }

          if (
            (colNorm === 'equipamento' ||
              colNorm === 'placabaldeio' ||
              colNorm === 'caminhaobaldeio') &&
            baseDef.camposDestino.some((c) => c.campo === 'caminhao_baldeio_id')
          ) {
            novoMapeamento[colHeader] = 'caminhao_baldeio_id'
            return
          }

          if (
            (colNorm === 'equipamento' || colNorm === 'maquina') &&
            baseDef.camposDestino.some((c) => c.campo === 'maquina_id')
          ) {
            novoMapeamento[colHeader] = 'maquina_id'
            return
          }

          if (
            (colNorm === 'equipamento' || colNorm === 'picador') &&
            baseDef.camposDestino.some((c) => c.campo === 'picador_maquina_id')
          ) {
            novoMapeamento[colHeader] = 'picador_maquina_id'
            return
          }

          // 3. Substring bidirecional cautelosa (mínimo 4 caracteres para evitar falso positivo)
          if (colNorm.length >= 4) {
            for (const campoDest of baseDef.camposDestino) {
              const sugestoes = [campoDest.campo, ...(campoDest.sugestoesCabecalho || [])]
              const matchParcial = sugestoes.some((s) => {
                const sNorm = normalizarTexto(s)
                return (
                  sNorm.length >= 4 &&
                  (colNorm === sNorm || colNorm.includes(sNorm) || sNorm.includes(colNorm))
                )
              })
              if (matchParcial) {
                novoMapeamento[colHeader] = campoDest.campo
                return
              }
            }
          }
        })

        if (baseKey === 'historico_picador') {
          const colunaStatus = res.cabecalhos.find((header) => {
            const normalizado = normalizarTexto(header)
            return (
              normalizado === 'status' ||
              normalizado === 'statuspicador' ||
              normalizado === 'statusevento'
            )
          })
          if (colunaStatus) {
            Object.keys(novoMapeamento).forEach((header) => {
              if (
                (novoMapeamento[header] === 'status_picador' ||
                  novoMapeamento[header] === 'status_evento') &&
                header !== colunaStatus
              ) {
                delete novoMapeamento[header]
              }
            })
            // Mapeia para status_evento se existir no catálogo, ou status_picador
            const campoDestinoStatus = baseDef?.camposDestino.some(
              (c) => c.campo === 'status_evento',
            )
              ? 'status_evento'
              : 'status_picador'
            novoMapeamento[colunaStatus] = campoDestinoStatus
          }
        }

        // Atualiza a coluna de ID se sugerida e não configurada
        const colunaIdAtualizada =
          res.id_sugerido && (!baseItem.coluna_id_unico || baseItem.coluna_id_unico === '_ID_')
            ? res.id_sugerido
            : baseItem.coluna_id_unico || res.id_sugerido || '_ID_'

        setBasesConfig((prev) => ({
          ...prev,
          [baseKey]: {
            ...prev[baseKey],
            cabecalhos_detectados: res.cabecalhos,
            mapeamento_campos: novoMapeamento,
            coluna_id_unico: colunaIdAtualizada,
          },
        }))

        toast.success(
          `${res.cabecalhos.length} cabeçalhos detectados na aba "${baseItem.aba_planilha}". Mapeamento sugerido!`,
        )
      } else {
        toast.error(res.erro || 'Nenhum cabeçalho encontrado na primeira linha da aba.')
      }
    } catch (err: any) {
      toast.error(err.message || 'Erro ao inspecionar cabeçalhos da aba.')
    } finally {
      setLendoCabecalhosBase(null)
    }
  }

  // Salvar mapeamento da base ativa no modal
  const handleSalvarMapeamentoModal = async () => {
    if (!baseSelecionadaModal) return
    const baseDef = BASES_IMPORTADOR_CATALOGO.find((b) => b.key === baseSelecionadaModal)
    const baseAtual = basesConfig[baseSelecionadaModal]

    const itemParaPersistir = {
      base_key: baseSelecionadaModal,
      base_nome: baseAtual?.base_nome || baseDef?.nome || baseSelecionadaModal,
      destino_tabela: baseAtual?.destino_tabela || baseDef?.destino || baseSelecionadaModal,
      aba_planilha: baseAtual?.aba_planilha || '',
      coluna_id_unico: baseAtual?.coluna_id_unico || '_ID_',
      regra_duplicidade: baseAtual?.regra_duplicidade || 'atualizar',
      ordem_execucao: baseAtual?.ordem_execucao ?? (baseDef?.ordemPadrao || 1),
      is_ativa: baseAtual?.is_ativa !== false,
      mapeamento_campos: baseAtual?.mapeamento_campos || {},
      cabecalhos_detectados: baseAtual?.cabecalhos_detectados || [],
    }

    setSalvandoMapeamentoModal(true)
    try {
      const salvo = await apiService.salvarImportadorBaseConfig(itemParaPersistir)
      // Atualiza estado local com o ID retornado se novo
      if (salvo?.id) {
        setBasesConfig((prev) => ({
          ...prev,
          [baseSelecionadaModal]: {
            ...prev[baseSelecionadaModal],
            id: salvo.id,
          },
        }))
      }
      toast.success(`Mapeamento da base "${itemParaPersistir.base_nome}" salvo com sucesso!`)
      setBaseSelecionadaModal(null)
    } catch (err: any) {
      console.error('Erro ao persistir mapeamento da base:', err)
      const msg = err?.message || 'Falha ao persistir mapeamento no banco de dados.'
      toast.error(`Erro ao salvar mapeamento: ${msg}`)
      // Mantém o modal aberto conforme requisito
    } finally {
      setSalvandoMapeamentoModal(false)
    }
  }

  // Salvar configurações gerais e de todas as bases
  const handleSalvarTudo = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!isAdmin) {
      toast.error('Apenas Administradores podem salvar configurações da integração.')
      return
    }

    if (!isConfigLoaded) {
      toast.error('Aguarde o carregamento da configuração Google Sheets antes de salvar.')
      return
    }

    if (!basesConfigLoaded) {
      toast.error('Aguarde o carregamento das configurações das bases antes de salvar.')
      return
    }

    if (!spreadsheetId.trim()) {
      toast.error('Informe o ID da planilha Google (Spreadsheet ID).')
      return
    }

    setSalvando(true)
    try {
      // 1. Salva configuração master do Google Sheets
      const payload: Partial<GoogleSheetsConfigRecord> = {
        nome: 'Importador Google Sheets',
        spreadsheet_id: spreadsheetId.trim(),
        sheet_range: sheetRange.trim() || 'Historico_Feller!A:P',
        is_ativa: isAtiva,
        sincronizacao_automatica: sincronizacaoAutomatica,
        intervalo_minutos: 15,
      }

      if (serviceAccountJson.trim()) {
        const parsed = parseServiceAccountJson(serviceAccountJson.trim())
        payload.client_email = parsed.client_email
        payload.project_id = parsed.project_id || ''
        payload.private_key = parsed.private_key
      }

      await apiService.salvarGoogleSheetsConfig(payload)

      // 2. Salva as configurações individuais de cada base
      const listaParaSalvar = Object.values(basesConfig).map((b) => ({
        base_key: b.base_key,
        base_nome: b.base_nome,
        destino_tabela: b.destino_tabela,
        aba_planilha: b.aba_planilha,
        coluna_id_unico: b.coluna_id_unico || '_ID_',
        regra_duplicidade: b.regra_duplicidade || 'atualizar',
        ordem_execucao: b.ordem_execucao,
        is_ativa: b.is_ativa,
        mapeamento_campos: b.mapeamento_campos || {},
        cabecalhos_detectados: b.cabecalhos_detectados || [],
      }))

      await apiService.salvarTodasBasesConfig(listaParaSalvar)

      toast.success('Configurações do Importador Multi-Base salvas com sucesso!')
      setServiceAccountJson('')
      setSubstituindoChave(false)
      onConfigUpdated()
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar configurações do importador.')
    } finally {
      setSalvando(false)
    }
  }

  // Testar Conexão Básica
  const handleTestarConexao = async () => {
    if (!spreadsheetId.trim()) {
      toast.error('Informe o ID da planilha para realizar o teste.')
      return
    }

    setTestando(true)
    setResultadoTeste(null)

    try {
      const signedJwt = await gerarJwtGoogle()
      const res = await apiService.testarGoogleSheets({
        spreadsheet_id: spreadsheetId.trim(),
        sheet_range: sheetRange.trim() || 'A1:Z50',
        signed_jwt: signedJwt,
      })

      if (res.sucesso) {
        setResultadoTeste({
          sucesso: true,
          mensagem: res.mensagem || 'Conexão estabelecida com sucesso!',
          linhas: res.linhas_detectadas,
          colunas: res.colunas_detectadas,
        })
        toast.success(`Google Sheets validado! ${res.linhas_detectadas} linha(s) encontrada(s).`)
        // Aproveita e lista abas se ainda não tiver
        if (abasDetectadas.length === 0) {
          handleCarregarAbas()
        }
      } else {
        setResultadoTeste({
          sucesso: false,
          erro: res.erro,
          instrucao: res.instrucao,
        })
        toast.error(res.erro || 'Falha ao conectar com o Google Sheets.')
      }
    } catch (err: any) {
      setResultadoTeste({
        sucesso: false,
        erro: err.message || 'Erro durante o teste de conexão',
      })
      toast.error(err.message || 'Falha ao autenticar com o Google.')
    } finally {
      setTestando(false)
    }
  }

  // Gerar Prévia de Importação Multi-Base (Validação Sem Gravar)
  const handleGerarPrevia = async () => {
    if (!spreadsheetId.trim()) {
      toast.error('Informe o ID da planilha Google.')
      return
    }

    const basesAtivas = Object.values(basesConfig).filter((b) => b.is_ativa && b.aba_planilha)
    if (basesAtivas.length === 0) {
      toast.error('Habilite ao menos uma base com aba configurada para gerar a prévia.')
      return
    }

    setGerandoPrevia(true)
    try {
      const signedJwt = await gerarJwtGoogle()
      const payloadBases = basesAtivas.map((b) => ({
        key: b.base_key,
        nome: b.base_nome,
        destino: b.destino_tabela,
        aba: b.aba_planilha,
        coluna_id: b.coluna_id_unico || '_ID_',
        regra: b.regra_duplicidade || 'atualizar',
        ordem: b.ordem_execucao,
        ativo: b.is_ativa,
        mapeamento: b.mapeamento_campos || {},
      }))

      const res = await apiService.gerarPreviaImportacao({
        spreadsheet_id: spreadsheetId.trim(),
        signed_jwt: signedJwt,
        bases: payloadBases,
      })

      if (res.sucesso) {
        setPreviaResultado(res)
        setModalPreviaOpen(true)
        toast.success('Prévia de validação gerada com sucesso!')
      } else {
        toast.error(res.erro || 'Falha ao gerar prévia de importação.')
      }
    } catch (err: any) {
      toast.error(err.message || 'Erro ao analisar a planilha.')
    } finally {
      setGerandoPrevia(false)
    }
  }

  // Executar a Importação Multi-Base de Fato
  const handleConfirmarImportacao = async () => {
    if (!isAdmin) {
      toast.error('Apenas Administradores podem executar a importação.')
      return
    }

    const basesAtivas = Object.values(basesConfig).filter((b) => b.is_ativa && b.aba_planilha)
    if (basesAtivas.length === 0) {
      toast.error('Nenhuma base ativa configurada.')
      return
    }

    setExecutandoImportacao(true)
    try {
      const signedJwt = await gerarJwtGoogle()
      const payloadBases = basesAtivas.map((b) => ({
        key: b.base_key,
        nome: b.base_nome,
        destino: b.destino_tabela,
        aba: b.aba_planilha,
        coluna_id: b.coluna_id_unico || '_ID_',
        regra: b.regra_duplicidade || 'atualizar',
        ordem: b.ordem_execucao,
        ativo: b.is_ativa,
        mapeamento: b.mapeamento_campos || {},
      }))

      const res = await apiService.executarImportacaoMultiBase({
        spreadsheet_id: spreadsheetId.trim(),
        signed_jwt: signedJwt,
        bases: payloadBases,
      })

      if (res.sucesso) {
        toast.success(
          `Importação concluída! ${res.total_inseridos} inserido(s), ${res.total_atualizados} atualizado(s), ${res.total_rejeitados} rejeitado(s).`,
        )
        setModalPreviaOpen(false)
        onConfigUpdated()
        onIngestaoSucesso()
      } else {
        toast.error(`Falha na importação: ${res.erros?.join(', ') || 'Erro desconhecido'}`)
      }
    } catch (err: any) {
      toast.error(err.message || 'Erro ao executar a importação multi-base.')
    } finally {
      setExecutandoImportacao(false)
    }
  }

  // Filtragem das 14 bases para exibição no card
  const basesFiltradas = useMemo(() => {
    return BASES_IMPORTADOR_CATALOGO.filter((b) => {
      const configItem = basesConfig[b.key]
      const matchTexto =
        b.nome.toLowerCase().includes(filtroTexto.toLowerCase()) ||
        b.tela.toLowerCase().includes(filtroTexto.toLowerCase()) ||
        (configItem?.aba_planilha || '').toLowerCase().includes(filtroTexto.toLowerCase())

      const matchCat =
        filtroCategoria === 'todas'
          ? true
          : filtroCategoria === 'cadastro'
            ? b.categoria === 'cadastro'
            : b.categoria === 'historico' || b.categoria === 'operacao'

      return matchTexto && matchCat
    }).sort((a, b) => a.ordemPadrao - b.ordemPadrao)
  }, [basesConfig, filtroTexto, filtroCategoria])

  // Base atualmente em edição no modal de mapeamento
  const baseDefEdicao = useMemo(() => {
    if (!baseSelecionadaModal) return null
    return BASES_IMPORTADOR_CATALOGO.find((b) => b.key === baseSelecionadaModal) || null
  }, [baseSelecionadaModal])

  const baseConfigEdicao = useMemo(() => {
    if (!baseSelecionadaModal) return null
    return basesConfig[baseSelecionadaModal] || null
  }, [baseSelecionadaModal, basesConfig])

  return (
    <Card className="border-[#DDE4DE] shadow-xs overflow-hidden">
      {/* CABEÇALHO DO CARD COM IDENTIFICAÇÃO VISUAL FORTE */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950 via-[#14421A] to-[#1B5E20] text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                Importador Multi-Base & Ingestão
              </span>
              <span className="text-emerald-400">•</span>
              <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30 text-[10px]">
                Google Sheets / AppSheet (14 Bases)
              </Badge>
            </div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              Importador Multi-Base Florestal (Google Sheets)
            </h2>
            <p className="text-xs text-emerald-100/90 max-w-3xl leading-relaxed">
              Mapeie cada aba da planilha do AppSheet para o respectivo cadastro ou histórico do
              sistema com chave de ID único, modo Atualizar (upsert), resolução automática de
              dependências e prévia de validação antes de confirmar.
            </p>
          </div>

          {/* STATUS ATUAL RESUMO */}
          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-xs rounded-lg px-3 py-2 border border-white/20 text-xs text-right">
              <span className="text-[10px] text-emerald-200 block uppercase font-medium">
                Última Importação
              </span>
              <span className="font-mono font-semibold">
                {formatDataHora(config?.ultima_sincronizacao)}
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs rounded-lg px-3 py-2 border border-white/20 text-xs text-right">
              <span className="text-[10px] text-emerald-200 block uppercase font-medium">
                Registros Ingeridos
              </span>
              <span className="font-mono font-bold text-emerald-300">
                {config?.linhas_ingeridas_total || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* FEEDBACK DO TESTE DE CONEXÃO */}
      {resultadoTeste && (
        <div
          className={`p-4 border-b text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            resultadoTeste.sucesso
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : 'bg-rose-50 border-rose-200 text-rose-950'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {resultadoTeste.sucesso ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <span className="font-bold block text-sm">
                {resultadoTeste.sucesso
                  ? 'Conexão com Google Sheets validada com sucesso!'
                  : 'Falha na conexão com o Google Sheets'}
              </span>
              <span className="text-xs opacity-90 block mt-0.5">
                {resultadoTeste.mensagem || resultadoTeste.erro}
              </span>
              {resultadoTeste.instrucao && (
                <div className="mt-1.5 p-2 bg-rose-100/70 border border-rose-300 rounded font-medium text-rose-900">
                  {resultadoTeste.instrucao}
                </div>
              )}
            </div>
          </div>
          {resultadoTeste.linhas !== undefined && (
            <div className="flex items-center gap-2 font-mono text-xs shrink-0 self-end sm:self-center">
              <Badge
                variant="outline"
                className="border-emerald-300 bg-emerald-100 text-emerald-800"
              >
                {resultadoTeste.linhas} linha(s)
              </Badge>
              <Badge
                variant="outline"
                className="border-emerald-300 bg-emerald-100 text-emerald-800"
              >
                {resultadoTeste.colunas} coluna(s)
              </Badge>
            </div>
          )}
        </div>
      )}

      <CardContent className="p-4 sm:p-6 space-y-6">
        {/* PARTE 1: CREDENCIAIS E CONEXÃO MASTER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-6 border-b border-[#DDE4DE]">
          {/* LADO ESQUERDO: CONTA DE SERVIÇO & SPREADSHEET ID */}
          <div className="lg:col-span-7 space-y-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold uppercase tracking-wider text-[#1A2E1A] flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-[#1B5E20]" />
                  JSON da Conta de Serviço do Google (Service Account) *
                </Label>
                {config?.client_email && !substituindoChave && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSubstituindoChave(true)}
                    className="h-6 text-[11px] text-[#1B5E20] hover:text-[#14421A] hover:bg-emerald-50 px-2"
                  >
                    Substituir Credencial
                  </Button>
                )}
              </div>

              {config?.client_email && !substituindoChave ? (
                <div className="p-3 bg-neutral-50 rounded-lg border border-[#DDE4DE] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[#1A2E1A] flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Credencial Configurada & Criptografada
                    </span>
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px]">
                      •••• Ativa ••••
                    </Badge>
                  </div>
                  <div className="font-mono text-xs bg-white p-2 rounded border border-neutral-200 text-[#1A2E1A]">
                    <span className="text-[#5A6D5A] select-none block text-[10px] uppercase font-semibold">
                      Client Email (Compartilhe a planilha com este endereço):
                    </span>
                    <span className="select-all font-semibold text-emerald-900 block truncate">
                      {config.client_email}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Textarea
                    placeholder={`Cole aqui o JSON da conta de serviço Google Cloud:\n{\n  "type": "service_account",\n  "project_id": "meu-projeto",\n  "private_key": "-----BEGIN PRIVATE KEY-----\\n...",\n  "client_email": "conta@meu-projeto.iam.gserviceaccount.com"\n}`}
                    value={serviceAccountJson}
                    onChange={(e) => setServiceAccountJson(e.target.value)}
                    rows={4}
                    className="font-mono text-[11px] bg-neutral-50 focus:bg-white resize-y"
                  />
                </div>
              )}
            </div>

            {/* ID DA PLANILHA E DETECTAR ABAS */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-[#1A2E1A]">
                ID da Planilha Google (Spreadsheet ID) *
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Ex: 1ChM-50S7cGbKaT71uXsOuKltFgArXYztkzSfPPGAWfA"
                  value={spreadsheetId}
                  onChange={(e) => setSpreadsheetId(e.target.value)}
                  className="font-mono text-xs h-9 flex-1"
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCarregarAbas}
                  disabled={carregandoAbas || !spreadsheetId.trim()}
                  className="h-9 text-xs border-[#DDE4DE] shrink-0"
                  title="Detectar abas da planilha"
                >
                  {carregandoAbas ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  ) : (
                    <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-emerald-700" />
                  )}
                  Buscar Abas
                </Button>
              </div>
              <span className="text-[10px] text-[#5A6D5A] block truncate">
                O ID presente na URL: docs.google.com/spreadsheets/d/
                <strong className="text-emerald-800">[ID-DA-PLANILHA]</strong>/edit
              </span>
            </div>

            {/* SWITCHES E SINCRONIZAÇÃO */}
            <div className="p-3 bg-neutral-50 rounded-lg border border-[#DDE4DE] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-[#1A2E1A] block">Integração Ativa</span>
                  <span className="text-[11px] text-[#5A6D5A]">
                    Habilita o conector e o importador multi-base.
                  </span>
                </div>
                <Switch checked={isAtiva} onCheckedChange={setIsAtiva} disabled={!isAdmin} />
              </div>
              <div className="border-t border-[#DDE4DE] pt-2 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-[#1A2E1A] block flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#1B5E20]" />
                    Sincronização Periódica Automática (a cada 15 min)
                  </span>
                  <span className="text-[11px] text-[#5A6D5A]">
                    O cron processa todas as bases ativas na ordem correta.
                  </span>
                </div>
                <Switch
                  checked={sincronizacaoAutomatica}
                  onCheckedChange={setSincronizacaoAutomatica}
                  disabled={!isAdmin}
                />
              </div>
            </div>

            {/* ALERTAS DE FALHA DE CARGA (NÃO MASCARADA) */}
            {(!isConfigLoaded || Boolean(configError)) && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>
                    <strong>Falha ao carregar configuração Google Sheets:</strong>{' '}
                    {configError || 'Não foi possível obter a configuração.'}
                  </span>
                </div>
                {onRetryLoadConfig && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onRetryLoadConfig}
                    className="h-7 text-xs border-rose-300 text-rose-800 hover:bg-rose-100 shrink-0"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Tentar Novamente
                  </Button>
                )}
              </div>
            )}

            {basesConfigError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>
                    <strong>Falha ao carregar mapeamento das bases:</strong> {basesConfigError}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={carregarConfiguracoesBases}
                  className="h-7 text-xs border-rose-300 text-rose-800 hover:bg-rose-100 shrink-0"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Recarregar Bases
                </Button>
              </div>
            )}

            {/* BOTÕES DE AÇÃO MASTER */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {isAdmin && (
                <Button
                  onClick={handleSalvarTudo}
                  disabled={salvando || !isConfigLoaded || !basesConfigLoaded || carregandoBases}
                  title={
                    !isConfigLoaded || !basesConfigLoaded
                      ? 'Aguarde o carregamento das configurações para salvar'
                      : undefined
                  }
                  className="bg-[#1B5E20] hover:bg-[#14521A] text-white shadow-xs text-xs h-9"
                >
                  {salvando ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5 mr-1.5" />
                      Salvar Todas as Configurações
                    </>
                  )}
                </Button>
              )}

              <Button
                variant="outline"
                onClick={handleTestarConexao}
                disabled={testando || !spreadsheetId.trim()}
                className="border-[#DDE4DE] hover:bg-neutral-50 text-xs h-9"
              >
                {testando ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin text-[#1B5E20]" />
                    Testando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-[#1B5E20]" />
                    Testar Conexão
                  </>
                )}
              </Button>

              <Button
                onClick={handleGerarPrevia}
                disabled={gerandoPrevia || !spreadsheetId.trim()}
                className="bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs text-xs h-9"
              >
                {gerandoPrevia ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Analisando Planilha...
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5 mr-1.5" />
                    Analisar Planilha & Ver Prévia
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* LADO DIREITO: REGRAS E INSTRUÇÕES */}
          <div className="lg:col-span-5 space-y-3">
            <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-2 text-xs text-[#1A2E1A]">
              <span className="font-bold text-[#1B5E20] block uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Regras do Importador Multi-Base
              </span>
              <ul className="list-disc pl-4 space-y-1 text-[#2C402C] text-[11px]">
                <li>
                  <strong>Chave de Upsert:</strong> Toda linha da planilha do AppSheet possui um ID
                  único (campo <code>_ID_</code> ou similar). Se o ID já existe no sistema, os
                  campos são atualizados; se for novo, inserido.
                </li>
                <li>
                  <strong>Sem Exclusão:</strong> Registros que sumirem da planilha NÃO são excluídos
                  do sistema (preservação de histórico).
                </li>
                <li>
                  <strong>Ordem de Execução:</strong> Cadastros (Fazendas &rarr; Talhões &rarr;
                  Máquinas/Caminhões/Pilhas/Usuários) são importados primeiro. Os históricos são
                  importados após, resolvendo as referências pelo ID da planilha.
                </li>
              </ul>
            </div>

            {abasDetectadas.length > 0 && (
              <div className="p-3 bg-neutral-50 border border-[#DDE4DE] rounded-xl space-y-2 text-xs">
                <span className="font-bold text-[#1A2E1A] block uppercase tracking-wider text-[11px]">
                  Abas Detectadas na Planilha ({abasDetectadas.length})
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                  {abasDetectadas.map((aba) => (
                    <Badge
                      key={aba}
                      variant="outline"
                      className="bg-white border-[#DDE4DE] text-[10px] font-mono"
                    >
                      {aba}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* PARTE 2: CONFIGURAÇÃO DAS 14 BASES DO IMPORTADOR */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-[#1A2E1A] flex items-center gap-2">
                <ListOrdered className="w-4 h-4 text-[#1B5E20]" />
                Destinos e Regras da Importação (14 Bases)
              </h3>
              <p className="text-xs text-[#5A6D5A]">
                Configure qual aba alimenta qual tela/coleção, o ID único de upsert e o mapeamento
                coluna&rarr;campo.
              </p>
            </div>

            {/* FILTROS DA LISTA */}
            <div className="flex items-center gap-2">
              <div className="relative w-48">
                <Search className="w-3.5 h-3.5 text-[#5A6D5A] absolute left-2.5 top-2.5" />
                <Input
                  placeholder="Filtrar base..."
                  value={filtroTexto}
                  onChange={(e) => setFiltroTexto(e.target.value)}
                  className="pl-8 text-xs h-8"
                />
              </div>

              <Select value={filtroCategoria} onValueChange={(val: any) => setFiltroCategoria(val)}>
                <SelectTrigger className="w-36 text-xs h-8">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as Bases</SelectItem>
                  <SelectItem value="cadastro">Apenas Cadastros</SelectItem>
                  <SelectItem value="historico">Apenas Históricos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* TABELA DE CONFIGURAÇÃO DAS 14 BASES */}
          {carregandoBases && (
            <div className="p-4 bg-neutral-50 border border-[#DDE4DE] rounded-xl flex items-center justify-center gap-2 text-xs text-[#5A6D5A]">
              <Loader2 className="w-4 h-4 animate-spin text-[#1B5E20]" />
              <span>Carregando configurações das bases...</span>
            </div>
          )}

          <div className="border border-[#DDE4DE] rounded-xl overflow-hidden bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F7F5] border-b border-[#DDE4DE] text-[#5A6D5A] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-2.5 px-3 w-12 text-center">Ordem</th>
                    <th className="py-2.5 px-3">Base / Tela Destino</th>
                    <th className="py-2.5 px-3">Aba da Planilha</th>
                    <th className="py-2.5 px-3">Coluna ID Único</th>
                    <th className="py-2.5 px-3">Regra de Duplicidade</th>
                    <th className="py-2.5 px-3 text-center">Ativa</th>
                    <th className="py-2.5 px-3 text-right">Mapeamento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDE4DE]">
                  {basesFiltradas.map((baseDef) => {
                    const cfg = basesConfig[baseDef.key] || {
                      base_key: baseDef.key,
                      base_nome: baseDef.nome,
                      destino_tabela: baseDef.destino,
                      aba_planilha: baseDef.nome,
                      coluna_id_unico: '_ID_',
                      regra_duplicidade: 'atualizar',
                      ordem_execucao: baseDef.ordemPadrao,
                      is_ativa: true,
                      mapeamento_campos: {},
                    }

                    const numCamposMapeados = Object.keys(cfg.mapeamento_campos || {}).length
                    const estaLendo = lendoCabecalhosBase === baseDef.key

                    return (
                      <tr
                        key={baseDef.key}
                        className={`hover:bg-neutral-50/80 transition-colors ${
                          !cfg.is_ativa ? 'opacity-60 bg-neutral-50/40' : ''
                        }`}
                      >
                        {/* ORDEM */}
                        <td className="py-3 px-3 text-center">
                          <Badge
                            variant="outline"
                            className="w-6 h-6 rounded-full p-0 flex items-center justify-center font-mono text-[10px] bg-neutral-100 text-[#1A2E1A] border-[#DDE4DE]"
                          >
                            {cfg.ordem_execucao || baseDef.ordemPadrao}
                          </Badge>
                        </td>

                        {/* BASE & DESTINO */}
                        <td className="py-3 px-3">
                          <div className="font-semibold text-[#1A2E1A] flex items-center gap-1.5">
                            <span className="font-mono text-emerald-900">{baseDef.nome}</span>
                            <span className="text-[#5A6D5A]">&rarr;</span>
                            <span className="text-neutral-700">{baseDef.tela}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[#5A6D5A]">
                            <span className="font-mono">coleção: {baseDef.destino}</span>
                            <span>•</span>
                            <Badge
                              variant="outline"
                              className={`text-[9px] px-1 py-0 uppercase ${
                                baseDef.categoria === 'cadastro'
                                  ? 'border-blue-300 bg-blue-50 text-blue-800'
                                  : 'border-amber-300 bg-amber-50 text-amber-800'
                              }`}
                            >
                              {baseDef.categoria}
                            </Badge>
                          </div>
                        </td>

                        {/* ABA DA PLANILHA */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1">
                            {abasDetectadas.length > 0 ? (
                              <Select
                                value={cfg.aba_planilha || ''}
                                onValueChange={(val) => {
                                  setBasesConfig((prev) => ({
                                    ...prev,
                                    [baseDef.key]: { ...prev[baseDef.key], aba_planilha: val },
                                  }))
                                }}
                              >
                                <SelectTrigger className="h-7 text-xs font-mono w-44">
                                  <SelectValue placeholder="Selecione a aba" />
                                </SelectTrigger>
                                <SelectContent>
                                  {abasDetectadas.map((a) => (
                                    <SelectItem key={a} value={a} className="font-mono text-xs">
                                      {a}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Input
                                value={cfg.aba_planilha || ''}
                                onChange={(e) => {
                                  const val = e.target.value
                                  setBasesConfig((prev) => ({
                                    ...prev,
                                    [baseDef.key]: { ...prev[baseDef.key], aba_planilha: val },
                                  }))
                                }}
                                placeholder="Nome da aba"
                                className="h-7 text-xs font-mono w-40"
                              />
                            )}

                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDetectarCabecalhosBase(baseDef.key)}
                              disabled={estaLendo || !cfg.aba_planilha}
                              title="Detectar cabeçalhos desta aba"
                              className="h-7 w-7 text-[#1B5E20] hover:bg-emerald-50 shrink-0"
                            >
                              {estaLendo ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Sparkles className="w-3.5 h-3.5" />
                              )}
                            </Button>
                          </div>
                        </td>

                        {/* COLUNA ID ÚNICO */}
                        <td className="py-3 px-3">
                          <Input
                            value={cfg.coluna_id_unico || ''}
                            onChange={(e) => {
                              const val = e.target.value
                              setBasesConfig((prev) => ({
                                ...prev,
                                [baseDef.key]: { ...prev[baseDef.key], coluna_id_unico: val },
                              }))
                            }}
                            placeholder="_ID_"
                            className="h-7 text-xs font-mono w-28"
                          />
                        </td>

                        {/* REGRA DE DUPLICIDADE */}
                        <td className="py-3 px-3">
                          <Select
                            value={cfg.regra_duplicidade || 'atualizar'}
                            onValueChange={(val: RegraDuplicidade) => {
                              setBasesConfig((prev) => ({
                                ...prev,
                                [baseDef.key]: { ...prev[baseDef.key], regra_duplicidade: val },
                              }))
                            }}
                          >
                            <SelectTrigger className="h-7 text-xs w-36">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="atualizar">Atualizar (upsert)</SelectItem>
                              <SelectItem value="inserir_apenas">Inserir apenas</SelectItem>
                              <SelectItem value="substituir">Substituir</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>

                        {/* ATIVA / INATIVA */}
                        <td className="py-3 px-3 text-center">
                          <Switch
                            checked={cfg.is_ativa !== false}
                            onCheckedChange={(val) => {
                              setBasesConfig((prev) => ({
                                ...prev,
                                [baseDef.key]: { ...prev[baseDef.key], is_ativa: val },
                              }))
                            }}
                          />
                        </td>

                        {/* MAPEAR COLUNAS */}
                        <td className="py-3 px-3 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setBaseSelecionadaModal(baseDef.key)}
                            className="h-7 text-[11px] border-[#DDE4DE] text-[#1B5E20] hover:bg-emerald-50"
                          >
                            Mapear Colunas
                            {numCamposMapeados > 0 && (
                              <Badge className="ml-1.5 bg-[#1B5E20] text-white text-[9px] px-1 py-0">
                                {numCamposMapeados}
                              </Badge>
                            )}
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </CardContent>

      {/* MODAL 1: MAPEAMENTO DETALHADO COLUNA -> CAMPO */}
      <Dialog
        open={Boolean(baseSelecionadaModal)}
        onOpenChange={(open) => !open && setBaseSelecionadaModal(null)}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-[#1A2E1A]">
              <FileSpreadsheet className="w-5 h-5 text-[#1B5E20]" />
              Mapeamento de Colunas: {baseDefEdicao?.nome}
            </DialogTitle>
            <DialogDescription className="text-xs text-[#5A6D5A]">
              Destino: <strong>{baseDefEdicao?.tela}</strong> (coleção:{' '}
              <code>{baseDefEdicao?.destino}</code>). Aba atual:{' '}
              <strong>{baseConfigEdicao?.aba_planilha || 'Não informada'}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="p-3 bg-neutral-50 border border-[#DDE4DE] rounded-lg text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#1A2E1A]">Cabeçalhos Detectados na Aba:</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => baseDefEdicao && handleDetectarCabecalhosBase(baseDefEdicao.key)}
                  disabled={Boolean(lendoCabecalhosBase)}
                  className="h-7 text-xs border-[#DDE4DE]"
                >
                  {lendoCabecalhosBase ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5 mr-1 text-[#1B5E20]" />
                  )}
                  Ler Cabeçalhos Agora
                </Button>
              </div>

              {baseConfigEdicao?.cabecalhos_detectados &&
              baseConfigEdicao.cabecalhos_detectados.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {baseConfigEdicao.cabecalhos_detectados.map((col) => {
                      const mapeamentoAtual = baseConfigEdicao?.mapeamento_campos || {}
                      const temDestino = Boolean(mapeamentoAtual[col])
                      return (
                        <Badge
                          key={col}
                          variant="outline"
                          className={`text-[10px] font-mono ${
                            temDestino
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-amber-50 text-amber-800 border-amber-300'
                          }`}
                          title={
                            temDestino
                              ? `Mapeado para: ${mapeamentoAtual[col]}`
                              : 'Coluna sem campo próprio — será gravada automaticamente em extras (JSON)'
                          }
                        >
                          {col} {temDestino ? '✓' : '→ extras'}
                        </Badge>
                      )
                    })}
                  </div>

                  {(() => {
                    const mapeamentoAtual = baseConfigEdicao?.mapeamento_campos || {}
                    const semDestino = (baseConfigEdicao.cabecalhos_detectados || []).filter(
                      (col) => !mapeamentoAtual[col],
                    )
                    if (semDestino.length > 0) {
                      return (
                        <div className="p-2 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-900 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>
                            <strong>{semDestino.length} coluna(s)</strong> sem destino sugerido:{' '}
                            <code className="text-[10px] font-mono bg-amber-100 px-1 py-0.5 rounded">
                              {semDestino.join(', ')}
                            </code>
                            . Pela regra de segurança, nenhuma informação é descartada: serão
                            gravadas automaticamente em <strong>extras (JSON)</strong>.
                          </span>
                        </div>
                      )
                    }
                    return (
                      <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-[11px] text-emerald-900 flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>100% das colunas detectadas possuem destino mapeado!</span>
                      </div>
                    )
                  })()}
                </div>
              ) : (
                <span className="text-[11px] text-[#5A6D5A] italic block">
                  Nenhum cabeçalho lido ainda. Clique em "Ler Cabeçalhos Agora" para inspecionar a
                  primeira linha da aba na planilha.
                </span>
              )}
            </div>

            {/* TABELA DE MAPEAMENTO: CAMPO DESTINO -> COLUNA DA PLANILHA */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-[#1A2E1A] uppercase tracking-wider block">
                Campos do Sistema & Coluna Correspondente
              </Label>
              <div className="border border-[#DDE4DE] rounded-lg overflow-hidden divide-y divide-[#DDE4DE]">
                {baseDefEdicao?.camposDestino.map((campoDest) => {
                  // Procura qual coluna da planilha está mapeada para este campo
                  const mapeamentoAtual = baseConfigEdicao?.mapeamento_campos || {}
                  const colunaAtual =
                    Object.keys(mapeamentoAtual).find(
                      (col) => mapeamentoAtual[col] === campoDest.campo,
                    ) || ''

                  return (
                    <div
                      key={campoDest.campo}
                      className="p-2.5 flex items-center justify-between gap-3 text-xs bg-white"
                    >
                      <div className="w-1/2">
                        <div className="font-semibold text-[#1A2E1A] flex items-center gap-1.5">
                          <span>{campoDest.label}</span>
                          {campoDest.obrigatorio && (
                            <span className="text-rose-600 font-bold" title="Campo obrigatório">
                              *
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-[#5A6D5A] font-mono block">
                          campo: {campoDest.campo}
                        </span>
                      </div>

                      <div className="w-1/2">
                        {baseConfigEdicao?.cabecalhos_detectados &&
                        baseConfigEdicao.cabecalhos_detectados.length > 0 ? (
                          <Select
                            value={colunaAtual || '__nenhuma__'}
                            onValueChange={(val) => {
                              if (!baseDefEdicao) return
                              setBasesConfig((prev) => {
                                const b = prev[baseDefEdicao.key]
                                const novoMapeamento = { ...(b.mapeamento_campos || {}) }

                                // Remove mapeamento anterior deste campo se houver
                                Object.keys(novoMapeamento).forEach((c) => {
                                  if (novoMapeamento[c] === campoDest.campo) {
                                    delete novoMapeamento[c]
                                  }
                                })

                                if (val !== '__nenhuma__') {
                                  novoMapeamento[val] = campoDest.campo
                                }

                                return {
                                  ...prev,
                                  [baseDefEdicao.key]: {
                                    ...b,
                                    mapeamento_campos: novoMapeamento,
                                  },
                                }
                              })
                            }}
                          >
                            <SelectTrigger className="h-8 text-xs font-mono">
                              <SelectValue placeholder="Selecione a coluna" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__nenhuma__" className="text-neutral-400 text-xs">
                                (Não mapear / automático)
                              </SelectItem>
                              {baseConfigEdicao.cabecalhos_detectados.map((h) => (
                                <SelectItem key={h} value={h} className="font-mono text-xs">
                                  {h}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            placeholder="Nome da coluna na planilha"
                            value={colunaAtual}
                            onChange={(e) => {
                              const val = e.target.value
                              if (!baseDefEdicao) return
                              setBasesConfig((prev) => {
                                const b = prev[baseDefEdicao.key]
                                const novoMapeamento = { ...(b.mapeamento_campos || {}) }
                                Object.keys(novoMapeamento).forEach((c) => {
                                  if (novoMapeamento[c] === campoDest.campo) {
                                    delete novoMapeamento[c]
                                  }
                                })
                                if (val.trim()) {
                                  novoMapeamento[val.trim()] = campoDest.campo
                                }
                                return {
                                  ...prev,
                                  [baseDefEdicao.key]: {
                                    ...b,
                                    mapeamento_campos: novoMapeamento,
                                  },
                                }
                              })
                            }}
                            className="h-8 text-xs font-mono"
                          />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-[#DDE4DE]">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBaseSelecionadaModal(null)}
              disabled={salvandoMapeamentoModal}
              className="text-xs border-[#DDE4DE]"
            >
              Cancelar
            </Button>

            <Button
              onClick={handleSalvarMapeamentoModal}
              disabled={salvandoMapeamentoModal || !isAdmin}
              className="bg-[#1B5E20] hover:bg-[#14521A] text-white text-xs"
            >
              {salvandoMapeamentoModal ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Salvando Mapeamento...
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  Salvar Mapeamento
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: PRÉVIA DE VALIDAÇÃO ANTES DA CONFIRMAÇÃO */}
      <Dialog open={modalPreviaOpen} onOpenChange={setModalPreviaOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-[#1A2E1A]">
              <Eye className="w-5 h-5 text-emerald-700" />
              Prévia de Validação da Importação (Sem Gravar)
            </DialogTitle>
            <DialogDescription className="text-xs text-[#5A6D5A]">
              Verifique os registros analisados por base antes de confirmar a gravação no banco de
              dados.
            </DialogDescription>
          </DialogHeader>

          {previaResultado && (
            <div className="space-y-4 py-2">
              {/* CARDS COM RESUMO GERAL */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                <div className="p-3 bg-neutral-100 rounded-lg border border-neutral-200">
                  <span className="text-[10px] text-[#5A6D5A] uppercase block font-semibold">
                    Total Linhas
                  </span>
                  <span className="text-lg font-bold text-[#1A2E1A]">
                    {previaResultado.resumo_geral?.total_linhas || 0}
                  </span>
                </div>
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <span className="text-[10px] text-emerald-700 uppercase block font-semibold">
                    Serão Inseridos
                  </span>
                  <span className="text-lg font-bold text-emerald-800">
                    {previaResultado.resumo_geral?.total_inserir || 0}
                  </span>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-[10px] text-blue-700 uppercase block font-semibold">
                    Serão Atualizados
                  </span>
                  <span className="text-lg font-bold text-blue-800">
                    {previaResultado.resumo_geral?.total_atualizar || 0}
                  </span>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <span className="text-[10px] text-amber-700 uppercase block font-semibold">
                    Ignorados
                  </span>
                  <span className="text-lg font-bold text-amber-800">
                    {previaResultado.resumo_geral?.total_ignorar || 0}
                  </span>
                </div>
                <div className="p-3 bg-rose-50 rounded-lg border border-rose-200">
                  <span className="text-[10px] text-rose-700 uppercase block font-semibold">
                    Rejeitados
                  </span>
                  <span className="text-lg font-bold text-rose-800">
                    {previaResultado.resumo_geral?.total_rejeitar || 0}
                  </span>
                </div>
              </div>

              {/* LISTA DETALHADA POR BASE */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1A2E1A] block">
                  Resultado por Base & Aba
                </span>
                <div className="border border-[#DDE4DE] rounded-xl overflow-hidden divide-y divide-[#DDE4DE] text-xs">
                  {previaResultado.bases?.map((b) => (
                    <div key={b.key} className="p-3 space-y-2 bg-white">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="font-bold text-[#1A2E1A] flex items-center gap-2">
                            <span>{b.nome}</span>
                            <span className="text-[#5A6D5A] font-normal">&rarr; aba:</span>
                            <Badge variant="outline" className="font-mono text-[10px]">
                              {b.aba}
                            </Badge>
                          </div>
                          <span className="text-[10px] text-[#5A6D5A]">
                            destino: <code>{b.destino}</code> | chave de upsert:{' '}
                            <code>{b.coluna_id || '_ID_'}</code> | modo: <code>{b.regra}</code>
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 font-mono text-[11px]">
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">
                            +{b.inserir} novos
                          </Badge>
                          <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                            ~{b.atualizar} updates
                          </Badge>
                          {b.ignorar > 0 && (
                            <Badge className="bg-amber-100 text-amber-800 border-amber-300">
                              {b.ignorar} ignorados
                            </Badge>
                          )}
                          {b.rejeitar > 0 && (
                            <Badge className="bg-rose-100 text-rose-800 border-rose-300">
                              ! {b.rejeitar} rejeitados
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* LISTA DE REJEITADOS CASO HAJA */}
                      {b.rejeitados_lista && b.rejeitados_lista.length > 0 && (
                        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg space-y-1 text-[11px] text-rose-950">
                          <span className="font-bold block flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                            Registros com pendência nesta base:
                          </span>
                          <ul className="list-disc pl-4 space-y-0.5">
                            {b.rejeitados_lista.map((rej, idx) => (
                              <li key={idx}>
                                Linha {rej.linha}: {rej.motivo}{' '}
                                {rej.id_planilha ? `(ID: ${rej.id_planilha})` : ''}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-[#DDE4DE]">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModalPreviaOpen(false)}
              className="text-xs border-[#DDE4DE]"
            >
              Fechar Prévia
            </Button>

            {isAdmin && (
              <Button
                onClick={handleConfirmarImportacao}
                disabled={executandoImportacao}
                className="bg-[#1B5E20] hover:bg-[#14521A] text-white shadow-xs text-xs"
              >
                {executandoImportacao ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Gravando Registros...
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1.5" />
                    Confirmar e Importar Agora
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
