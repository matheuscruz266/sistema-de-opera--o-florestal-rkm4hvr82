import React, { useState } from 'react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
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
} from 'lucide-react'
import { toast } from 'sonner'
import { apiService } from '@/services/florestalApi'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { GoogleServiceAccountKey, GoogleSheetsConfigRecord } from '@/types/florestal'

interface GoogleSheetsD2SectionProps {
  config: GoogleSheetsConfigRecord | null
  isAdmin: boolean
  onConfigUpdated: () => void
  onIngestaoSucesso: () => void
}

export const GoogleSheetsD2Section: React.FC<GoogleSheetsD2SectionProps> = ({
  config,
  isAdmin,
  onConfigUpdated,
  onIngestaoSucesso,
}) => {
  // Formulário
  const [spreadsheetId, setSpreadsheetId] = useState(config?.spreadsheet_id || '')
  const [sheetRange, setSheetRange] = useState(config?.sheet_range || 'P1!A:Z')
  const [serviceAccountJson, setServiceAccountJson] = useState('')
  const [substituindoChave, setSubstituindoChave] = useState(!config?.has_credentials)
  const [isAtiva, setIsAtiva] = useState(config?.is_ativa ?? true)

  // Estados de ação
  const [salvando, setSalvando] = useState(false)
  const [testando, setTestando] = useState(false)
  const [sincronizando, setSincronizando] = useState(false)

  // Feedback do último teste
  const [resultadoTeste, setResultadoTeste] = useState<{
    sucesso: boolean
    mensagem?: string
    linhas?: number
    colunas?: number
    erro?: string
    instrucao?: string
  } | null>(null)

  // Atualizar form quando config carregar
  React.useEffect(() => {
    if (config) {
      setSpreadsheetId(config.spreadsheet_id || '')
      setSheetRange(config.sheet_range || 'P1!A:Z')
      setIsAtiva(config.is_ativa ?? true)
      if (config.client_email) {
        setSubstituindoChave(false)
      }
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
  const parseServiceAccountJson = (jsonString: string): GoogleServiceAccountKey => {
    try {
      const parsed: unknown = JSON.parse(jsonString)
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('O conteúdo precisa ser um objeto JSON.')
      }
      const account = parsed as Record<string, unknown>
      if (account.type !== 'service_account') {
        throw new Error('O JSON informado não é do tipo "service_account".')
      }
      if (
        typeof account.client_email !== 'string' ||
        typeof account.private_key !== 'string' ||
        !account.client_email ||
        !account.private_key.includes('-----BEGIN PRIVATE KEY-----') ||
        !account.private_key.includes('-----END PRIVATE KEY-----')
      ) {
        throw new Error('O JSON deve conter "client_email" e uma chave privada PKCS#8 válida.')
      }
      return {
        type: 'service_account',
        project_id: typeof account.project_id === 'string' ? account.project_id : '',
        private_key: account.private_key,
        client_email: account.client_email,
        private_key_id: typeof account.private_key_id === 'string' ? account.private_key_id : '',
        client_id: typeof account.client_id === 'string' ? account.client_id : '',
        auth_uri: typeof account.auth_uri === 'string' ? account.auth_uri : '',
        token_uri: typeof account.token_uri === 'string' ? account.token_uri : '',
        auth_provider_x509_cert_url:
          typeof account.auth_provider_x509_cert_url === 'string'
            ? account.auth_provider_x509_cert_url
            : '',
        client_x509_cert_url:
          typeof account.client_x509_cert_url === 'string' ? account.client_x509_cert_url : '',
        universe_domain: typeof account.universe_domain === 'string' ? account.universe_domain : '',
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'formato inválido'
      throw new Error(`JSON de conta de serviço inválido: ${message}`)
    }
  }

  // Salvar configurações
  const handleSalvarConfig = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!isAdmin) {
      toast.error('Apenas Administradores podem salvar configurações da integração.')
      return
    }

    if (!spreadsheetId.trim()) {
      toast.error('Informe o ID da planilha Google (Spreadsheet ID).')
      return
    }

    const payload: Partial<GoogleSheetsConfigRecord> = {
      nome: 'D2 Picador BRF Toledo (Google Sheets)',
      spreadsheet_id: spreadsheetId.trim(),
      sheet_range: sheetRange.trim() || 'P1!A:Z',
      is_ativa: isAtiva,
      sincronizacao_automatica: false,
      intervalo_minutos: 15,
    }

    let serviceAccount: GoogleServiceAccountKey | undefined
    if (serviceAccountJson.trim()) {
      try {
        serviceAccount = parseServiceAccountJson(serviceAccountJson.trim())
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'JSON de conta de serviço inválido.')
        return
      }
    } else if (!config?.has_credentials) {
      toast.error('Cole o JSON completo da conta de serviço do Google.')
      return
    }

    setSalvando(true)
    try {
      await apiService.salvarGoogleSheetsConfig(payload, serviceAccount)
      toast.success('Configurações do Google Sheets salvas com sucesso!')
      setServiceAccountJson('')
      setSubstituindoChave(false)
      onConfigUpdated()
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || 'Erro ao salvar configuração do Google Sheets.')
    } finally {
      setSalvando(false)
    }
  }

  // Testar Conexão
  const handleTestarConexao = async () => {
    if (!spreadsheetId.trim()) {
      toast.error('Informe o ID da planilha para realizar o teste.')
      return
    }

    setTestando(true)
    setResultadoTeste(null)

    try {
      const res = await apiService.testarGoogleSheets({
        spreadsheet_id: spreadsheetId.trim(),
        sheet_range: sheetRange.trim() || 'A1:Z50',
      })

      if (res.sucesso) {
        setResultadoTeste({
          sucesso: true,
          mensagem: res.mensagem || 'Conexão estabelecida com sucesso!',
          linhas: res.linhas_detectadas,
          colunas: res.colunas_detectadas,
        })
        toast.success(`Google Sheets validado! ${res.linhas_detectadas} linha(s) encontrada(s).`)
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
      toast.error(err.message || 'Falha ao gerar credencial JWT do Google.')
    } finally {
      setTestando(false)
    }
  }

  // Sincronizar Agora
  const handleSincronizarAgora = async () => {
    if (!isAdmin) {
      toast.error('Apenas Administradores podem acionar a sincronização.')
      return
    }

    if (!spreadsheetId.trim()) {
      toast.error('Informe o ID da planilha.')
      return
    }

    setSincronizando(true)
    try {
      const res = await apiService.sincronizarGoogleSheets({
        spreadsheet_id: spreadsheetId.trim(),
        sheet_range: sheetRange.trim() || 'A1:Z500',
      })

      if (res.sucesso) {
        toast.success(
          `Sincronização concluída! ${res.aceitos} registro(s) aceitos no Picador D2 Toledo.`,
        )
        onConfigUpdated()
        onIngestaoSucesso()
      } else {
        toast.error(`Falha na sincronização: ${res.mensagem || res.erro}`)
      }
    } catch (err: any) {
      toast.error(err.message || 'Erro ao sincronizar dados da planilha.')
    } finally {
      setSincronizando(false)
    }
  }

  return (
    <Card className="border-[#DDE4DE] shadow-xs overflow-hidden">
      {/* CABEÇALHO DO CARD */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950 via-[#14421A] to-[#1B5E20] text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Leitura Automática de Planilha
              </span>
              <span className="text-emerald-400">•</span>
              <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30 text-[10px]">
                D2 — Picador BRF Toledo
              </Badge>
            </div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              Conexão Google Sheets (D2 Toledo)
            </h2>
            <p className="text-xs text-emerald-100/90 max-w-3xl leading-relaxed">
              O sistema lê diretamente as linhas da planilha de apontamento do Picador via Google
              Sheets API (Conta de Serviço) e ingere os dados no estoque com idempotência por Nota
              Fiscal/Ticket.
            </p>
          </div>

          {/* STATUS ATUAL RESUMO */}
          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-xs rounded-lg px-3 py-2 border border-white/20 text-xs text-right">
              <span className="text-[10px] text-emerald-200 block uppercase font-medium">
                Última Sincronização
              </span>
              <span className="font-mono font-semibold">
                {formatDataHora(config?.ultima_sincronizacao)}
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs rounded-lg px-3 py-2 border border-white/20 text-xs text-right">
              <span className="text-[10px] text-emerald-200 block uppercase font-medium">
                Total Ingerido
              </span>
              <span className="font-mono font-bold text-emerald-300">
                {config?.linhas_ingeridas_total || 0} registros
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
                {resultadoTeste.linhas} linha(s) detectada(s)
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

      {/* CONTEÚDO PRINCIPAL DO FORMULÁRIO */}
      <CardContent className="p-4 sm:p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* COLUNA ESQUERDA: CAMPOS DE CONFIGURAÇÃO */}
          <div className="lg:col-span-7 space-y-5">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold uppercase tracking-wider text-[#1A2E1A] flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-[#1B5E20]" />
                  JSON da Conta de Serviço do Google (Service Account) *
                </Label>
                {config?.has_credentials && !substituindoChave && (
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

              {config?.has_credentials && !substituindoChave ? (
                <div className="p-3 bg-neutral-50 rounded-lg border border-[#DDE4DE] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[#1A2E1A] flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Credencial protegida no servidor
                    </span>
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px]">
                      •••• Ativa ••••
                    </Badge>
                  </div>
                  <div className="font-mono text-xs bg-white p-2 rounded border border-neutral-200 text-[#1A2E1A]">
                    <span className="text-[#5A6D5A] select-none block text-[10px] uppercase font-semibold">
                      Client Email (Compartilhar planilha com este endereço):
                    </span>
                    <span className="select-all font-semibold text-emerald-900 block truncate">
                      {config.client_email}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#5A6D5A]">
                    A chave privada fica criptografada no servidor e nunca é retornada à tela.
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Textarea
                    placeholder={`Cole aqui o JSON completo da chave da conta de serviço, por exemplo:\n{\n  "type": "service_account",\n  "project_id": "meu-projeto",\n  "private_key": "-----BEGIN PRIVATE KEY-----\\n...",\n  "client_email": "conta@meu-projeto.iam.gserviceaccount.com"\n}`}
                    value={serviceAccountJson}
                    onChange={(e) => setServiceAccountJson(e.target.value)}
                    rows={6}
                    className="font-mono text-[11px] bg-neutral-50 focus:bg-white resize-y"
                  />
                  <p className="text-[11px] text-[#5A6D5A]">
                    Arquivo obtido no Google Cloud Console &rarr; IAM & Admin &rarr; Contas de
                    Serviço &rarr; Chaves (Criar nova chave JSON).
                  </p>
                </div>
              )}
            </div>

            {/* ID DA PLANILHA E ABA */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <Label className="text-xs font-bold text-[#1A2E1A]">
                  ID da Planilha Google (Spreadsheet ID) *
                </Label>
                <Input
                  placeholder="Ex: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                  value={spreadsheetId}
                  onChange={(e) => setSpreadsheetId(e.target.value)}
                  className="font-mono text-xs h-9"
                  required
                />
                <span className="text-[10px] text-[#5A6D5A] block truncate">
                  O ID presente na URL: docs.google.com/spreadsheets/d/
                  <strong className="text-emerald-800">[ID-DA-PLANILHA]</strong>/edit
                </span>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-[#1A2E1A]">Aba / Intervalo</Label>
                <Input
                  placeholder="Ex: P1!A:Z"
                  value={sheetRange}
                  onChange={(e) => setSheetRange(e.target.value)}
                  className="font-mono text-xs h-9"
                />
                <span className="text-[10px] text-[#5A6D5A] block">Ex: P1!A:Z ou Dados!A:Z</span>
              </div>
            </div>

            {/* SWITCHES: ATIVA E SINCRONIZAÇÃO AUTOMÁTICA */}
            <div className="p-3 bg-neutral-50 rounded-lg border border-[#DDE4DE] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-[#1A2E1A] block">
                    Integração Ativa
                  </span>
                  <span className="text-[11px] text-[#5A6D5A]">
                    Habilita o agendamento e o consumo das linhas da D2 Toledo.
                  </span>
                </div>
                <Switch checked={isAtiva} onCheckedChange={setIsAtiva} disabled={!isAdmin} />
              </div>

              <div className="border-t border-[#DDE4DE] pt-3 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-[#1A2E1A] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#1B5E20]" />
                    Sincronização periódica automática
                  </span>
                  <span className="text-[11px] text-[#5A6D5A]">
                    Ainda indisponível. Use “Sincronizar Agora” para importar os dados.
                  </span>
                </div>
                <Switch checked={false} disabled />
              </div>
            </div>

            {/* BOTÕES DE AÇÃO */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {isAdmin && (
                <Button
                  onClick={handleSalvarConfig}
                  disabled={salvando}
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
                      Salvar Configurações
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
                    Testando Conexão...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-[#1B5E20]" />
                    Testar Conexão
                  </>
                )}
              </Button>

              {isAdmin && (
                <Button
                  onClick={handleSincronizarAgora}
                  disabled={sincronizando || !spreadsheetId.trim()}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs text-xs h-9"
                >
                  {sincronizando ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      Sincronizando Planilha...
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 mr-1.5" />
                      Sincronizar Agora
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* COLUNA DIREITA: INSTRUÇÕES E FORMATO ESPERADO */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-3 text-xs text-[#1A2E1A]">
              <span className="font-bold text-[#1B5E20] block uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Como Compartilhar a Planilha com a Conta de Serviço
              </span>
              <ol className="list-decimal pl-4 space-y-1.5 text-[#2C402C] leading-relaxed">
                <li>Abra sua planilha no Google Sheets (Dashboard D2 Toledo).</li>
                <li>
                  Clique no botão azul <strong>Compartilhar</strong> no canto superior direito.
                </li>
                <li>
                  Adicione o e-mail da Conta de Serviço:
                  <div className="mt-1 p-1.5 bg-white border border-emerald-300 rounded font-mono text-[11px] text-emerald-950 select-all font-semibold break-all">
                    {config?.client_email ||
                      'sua-service-account@seu-projeto.iam.gserviceaccount.com'}
                  </div>
                </li>
                <li>
                  Conceda a permissão de <strong>Leitor</strong> (ou Editor) e clique em Enviar.
                </li>
                <li>
                  Cole o ID da planilha e o nome da aba acima e clique em{' '}
                  <strong>Testar Conexão</strong>.
                </li>
              </ol>
            </div>

            <div className="p-4 bg-neutral-50 border border-[#DDE4DE] rounded-xl space-y-2 text-xs">
              <span className="font-bold text-[#1A2E1A] block uppercase tracking-wider text-[11px]">
                Mapeamento Automático de Colunas da Planilha
              </span>
              <p className="text-[#5A6D5A] text-[11px] leading-relaxed">
                A primeira linha da aba deve conter os cabeçalhos. O sistema reconhece
                automaticamente os seguintes nomes (com ou sem acento/maiúsculas):
              </p>
              <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px] text-[#1A2E1A]">
                <div className="p-1.5 bg-white rounded border border-neutral-200">
                  <strong>nota_fiscal</strong> / ticket / nf
                </div>
                <div className="p-1.5 bg-white rounded border border-neutral-200">
                  <strong>volume_cavaco_m3</strong> / volume
                </div>
                <div className="p-1.5 bg-white rounded border border-neutral-200">
                  <strong>data_hora</strong> / expedicao
                </div>
                <div className="p-1.5 bg-white rounded border border-neutral-200">
                  <strong>peso_cavaco_t</strong> / peso
                </div>
                <div className="p-1.5 bg-white rounded border border-neutral-200">
                  <strong>pilha</strong> / pilha_codigo
                </div>
                <div className="p-1.5 bg-white rounded border border-neutral-200">
                  <strong>placa</strong> / caminhao
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
