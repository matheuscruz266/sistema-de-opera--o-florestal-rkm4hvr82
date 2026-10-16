import React, { useEffect, useRef, useState } from 'react'
import {
  AlertCircle,
  ArrowDownToLine,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Clock3,
  FileJson2,
  FileSpreadsheet,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  Upload,
} from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { apiService } from '@/services/florestalApi'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import {
  GoogleServiceAccountKey,
  GoogleSheetsConfigRecord,
  GoogleSheetsImportPreview,
  GoogleSheetsImportResult,
} from '@/types/florestal'

interface GoogleSheetsD2SectionProps {
  config: GoogleSheetsConfigRecord | null
  isAdmin: boolean
  onConfigUpdated: () => void
  onIngestaoSucesso: () => void
}

const EXPECTED_SHEET_COUNT = 14

function spreadsheetIdFromInput(value: string): string {
  const input = value.trim()
  const match = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
  return match ? match[1] : input
}

function parseServiceAccountJson(jsonString: string): GoogleServiceAccountKey {
  let parsed: unknown
  try {
    parsed = JSON.parse(jsonString)
  } catch {
    throw new Error('O conteúdo não é um JSON válido. Confira o arquivo baixado do Google Cloud.')
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('A credencial precisa ser um objeto JSON de conta de serviço.')
  }

  const account = parsed as Record<string, unknown>
  if (
    account.type !== 'service_account' ||
    typeof account.client_email !== 'string' ||
    typeof account.private_key !== 'string' ||
    !account.client_email.trim() ||
    !account.private_key.includes('-----BEGIN PRIVATE KEY-----') ||
    !account.private_key.includes('-----END PRIVATE KEY-----')
  ) {
    throw new Error(
      'Use o JSON completo de uma conta de serviço: ele precisa conter type, client_email e private_key.',
    )
  }

  return {
    type: 'service_account',
    project_id: typeof account.project_id === 'string' ? account.project_id : '',
    private_key: account.private_key,
    client_email: account.client_email.trim(),
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
}

function formatDate(value?: string): string {
  if (!value) return 'Ainda não importado'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

function StatBlock({
  label,
  value,
  tone = 'neutral',
}: {
  label: string
  value: number
  tone?: 'neutral' | 'green' | 'amber' | 'red'
}) {
  const tones = {
    neutral: 'text-[#243328]',
    green: 'text-[#176334]',
    amber: 'text-[#97611b]',
    red: 'text-[#a13c32]',
  }
  return (
    <div className="min-w-0 border-l border-[#d8e1d7] pl-4 first:border-0 first:pl-0">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#657365]">{label}</p>
      <p className={`mt-1 font-mono text-xl font-semibold tabular-nums ${tones[tone]}`}>{value}</p>
    </div>
  )
}

function StepHeading({
  number,
  title,
  description,
  complete,
  id,
}: {
  number: number
  title: string
  description: string
  complete?: boolean
  id?: string
}) {
  return (
    <div className="flex items-start gap-3">
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
          complete ? 'bg-[#e3f1e6] text-[#176334]' : 'bg-[#1b5e36] text-white'
        }`}
      >
        {complete ? <Check className="h-4 w-4" aria-hidden="true" /> : number}
      </span>
      <div className="min-w-0">
        <h3 id={id} className="text-sm font-semibold text-[#243328]">
          {title}
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-[#637165]">{description}</p>
      </div>
    </div>
  )
}

export const GoogleSheetsD2Section: React.FC<GoogleSheetsD2SectionProps> = ({
  config,
  isAdmin,
  onConfigUpdated,
  onIngestaoSucesso,
}) => {
  const [spreadsheetInput, setSpreadsheetInput] = useState(config?.spreadsheet_id || '')
  const [serviceAccountJson, setServiceAccountJson] = useState('')
  const [replaceCredential, setReplaceCredential] = useState(!config?.has_credentials)
  const [isActive, setIsActive] = useState(config?.is_ativa ?? true)
  const [isSaving, setIsSaving] = useState(false)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [preview, setPreview] = useState<GoogleSheetsImportPreview | null>(null)
  const [importResult, setImportResult] = useState<GoogleSheetsImportResult | null>(null)
  const [expandedSheet, setExpandedSheet] = useState<string | null>(null)
  const [showConfirmImport, setShowConfirmImport] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!config) return
    setSpreadsheetInput(config.spreadsheet_id || '')
    setIsActive(config.is_ativa ?? true)
    setReplaceCredential(!config.has_credentials)
  }, [config])

  const spreadsheetId = spreadsheetIdFromInput(spreadsheetInput)
  const canReview = isAdmin && !!spreadsheetId && (config?.has_credentials || !!serviceAccountJson)
  const expectedSheetsPresent = (preview?.abas.length || 0) === EXPECTED_SHEET_COUNT
  const previewHasErrors = !preview?.sucesso || preview.erros > 0
  const completedImport = !!importResult && importResult.total.rejeitados === 0

  const handleCredentialFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.json')) {
      setError('Selecione o arquivo .json baixado da conta de serviço do Google.')
      event.target.value = ''
      return
    }
    try {
      const contents = await file.text()
      parseServiceAccountJson(contents)
      setServiceAccountJson(contents)
      setReplaceCredential(true)
      setError('')
      setPreview(null)
      setImportResult(null)
      toast.success('Credencial JSON carregada. Ela só será enviada ao PocketBase ao salvar.')
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível ler o arquivo JSON.')
    } finally {
      event.target.value = ''
    }
  }

  const handleSaveAndPreview = async () => {
    if (!isAdmin) {
      setError('Somente um Administrador pode configurar e importar esta planilha.')
      return
    }
    if (!spreadsheetId) {
      setError('Informe o link ou ID da planilha do Google Sheets.')
      return
    }
    if (!config?.has_credentials && !serviceAccountJson.trim()) {
      setError('Cole o JSON completo da conta de serviço ou selecione o arquivo .json.')
      return
    }

    let serviceAccount: GoogleServiceAccountKey | undefined
    if (serviceAccountJson.trim()) {
      try {
        serviceAccount = parseServiceAccountJson(serviceAccountJson.trim())
      } catch (cause: unknown) {
        setError(cause instanceof Error ? cause.message : 'Credencial JSON inválida.')
        return
      }
    }

    setIsSaving(true)
    setError('')
    setPreview(null)
    setImportResult(null)
    try {
      await apiService.salvarGoogleSheetsConfig(
        {
          nome: 'Operação Minas — Google Sheets',
          spreadsheet_id: spreadsheetId,
          sheet_range: 'A:Z',
          is_ativa: isActive,
          sincronizacao_automatica: false,
          intervalo_minutos: 15,
        },
        serviceAccount,
      )
      setServiceAccountJson('')
      setReplaceCredential(false)
      onConfigUpdated()
      toast.success(
        isActive
          ? 'Configuração salva no servidor; verificando as abas e os dados.'
          : 'Configuração salva. A integração permanece desativada.',
      )

      if (!isActive) return
      setIsPreviewing(true)
      const nextPreview = await apiService.previsualizarImportacaoGoogleSheets(spreadsheetId)
      setPreview(nextPreview)
      setExpandedSheet(nextPreview.abas.find((sheet) => sheet.errors > 0)?.name ?? null)
      if (nextPreview.sucesso) {
        toast.success(`Prévia pronta: ${nextPreview.abas.length} abas verificadas.`)
      } else {
        setError(
          `A prévia encontrou ${nextPreview.erros} problema(s). Revise as linhas sinalizadas antes de importar.`,
        )
      }
    } catch (cause: unknown) {
      const message = getErrorMessage(cause) || 'Não foi possível consultar a planilha.'
      setError(message)
      toast.error(message)
    } finally {
      setIsSaving(false)
      setIsPreviewing(false)
    }
  }

  const refreshPreview = async () => {
    if (!spreadsheetId) return
    setIsPreviewing(true)
    setError('')
    setImportResult(null)
    try {
      const nextPreview = await apiService.previsualizarImportacaoGoogleSheets(spreadsheetId)
      setPreview(nextPreview)
      setExpandedSheet(nextPreview.abas.find((sheet) => sheet.errors > 0)?.name ?? null)
      if (!nextPreview.sucesso) {
        setError(
          `A prévia encontrou ${nextPreview.erros} problema(s). Corrija os registros indicados na origem e gere a prévia novamente.`,
        )
      }
    } catch (cause: unknown) {
      const message = getErrorMessage(cause) || 'Não foi possível atualizar a prévia.'
      setError(message)
      toast.error(message)
    } finally {
      setIsPreviewing(false)
    }
  }

  const handleImport = async () => {
    if (!preview || previewHasErrors || !expectedSheetsPresent || !isAdmin) return
    setIsImporting(true)
    setShowConfirmImport(false)
    setError('')
    try {
      const result = await apiService.importarGoogleSheets(spreadsheetId)
      setImportResult(result)
      onConfigUpdated()
      onIngestaoSucesso()
      if (result.total.rejeitados === 0) {
        toast.success(result.mensagem)
      } else {
        setError(
          `A importação terminou com ${result.total.rejeitados} registro(s) rejeitado(s). Consulte o detalhamento por aba.`,
        )
        toast.error('Importação concluída parcialmente; alguns registros precisam de revisão.')
      }
    } catch (cause: unknown) {
      const message = getErrorMessage(cause) || 'Não foi possível importar os dados.'
      setError(message)
      toast.error(message)
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <Card className="overflow-hidden rounded-xl border-[#d7e0d5] bg-white shadow-sm">
      <div className="border-b border-[#d7e0d5] bg-[#f6f8f3] px-5 py-5 sm:px-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#33704a]">
                <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
                Fonte externa · Somente leitura
              </span>
              <Badge className="rounded-full border border-[#c8ddcc] bg-[#e8f2e8] px-2.5 text-[10px] font-medium text-[#285d39] hover:bg-[#e8f2e8]">
                14 abas
              </Badge>
            </div>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-[#1e3024] sm:text-2xl">
              Importar dados da planilha
            </h2>
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-[#5e6f61]">
              O PocketBase lê os cadastros e históricos da Operação Minas. Os dados da planilha
              nunca são alterados.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-3 rounded-lg border border-[#d7e0d5] bg-white px-4 py-3 sm:min-w-[310px]">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#718071]">
                Última importação
              </p>
              <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-[#314436]">
                <Clock3 className="h-3.5 w-3.5 text-[#728072]" aria-hidden="true" />
                {formatDate(config?.ultima_sincronizacao)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#718071]">
                Novos registros
              </p>
              <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-[#176334]">
                {config?.linhas_ingeridas_total || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3" aria-label="Etapas da importação">
          {[
            { number: 1, label: 'Conectar', active: !preview, complete: !!preview },
            {
              number: 2,
              label: 'Revisar prévia',
              active: !!preview && !importResult,
              complete: !!importResult,
            },
            { number: 3, label: 'Importar', active: !!importResult, complete: completedImport },
          ].map((step) => (
            <div key={step.number} className="min-w-0">
              <div
                className={`h-1 rounded-full transition-colors duration-200 ${
                  step.complete || step.active ? 'bg-[#347a4a]' : 'bg-[#dce4da]'
                }`}
              />
              <p
                className={`mt-2 truncate text-[11px] font-medium sm:text-xs ${
                  step.active || step.complete ? 'text-[#285c38]' : 'text-[#758176]'
                }`}
              >
                <span className="mr-1 font-mono tabular-nums">
                  {String(step.number).padStart(2, '0')}
                </span>
                {step.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <CardContent className="space-y-6 p-5 sm:p-7">
        {!isAdmin && (
          <Alert className="border-[#e5d8b6] bg-[#fbf7eb] text-[#72551b]">
            <CircleHelp className="h-4 w-4" aria-hidden="true" />
            <AlertTitle>Acesso somente para Administradores</AlertTitle>
            <AlertDescription>
              Um Administrador precisa configurar a credencial e confirmar a importação.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="border-[#edc8c2] bg-[#fff7f5] text-[#8c352b]">
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            <AlertTitle>É necessária uma revisão</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <section
          aria-labelledby="connection-step"
          className="grid gap-5 lg:grid-cols-[230px_minmax(0,1fr)]"
        >
          <div>
            <StepHeading
              number={1}
              title="Conectar a origem"
              description="Use a credencial de leitura da conta de serviço e o link da planilha."
              complete={!!config?.has_credentials && !!spreadsheetId}
              id="connection-step"
            />
            <div className="ml-11 mt-4 flex items-start gap-2 text-[11px] leading-relaxed text-[#6b776c]">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#347a4a]" aria-hidden="true" />
              A credencial é criptografada no PocketBase e nunca volta para o navegador.
            </div>
          </div>

          <div className="grid gap-4 rounded-lg border border-[#d9e2d7] bg-[#fbfcfa] p-4 sm:p-5">
            <div className="grid gap-4 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <div className="space-y-2">
                <div className="flex min-h-6 items-center justify-between gap-3">
                  <Label
                    htmlFor="google-service-account"
                    className="text-xs font-semibold text-[#2b3c2f]"
                  >
                    Credencial da conta de serviço
                  </Label>
                  {config?.has_credentials && !replaceCredential && (
                    <button
                      type="button"
                      onClick={() => setReplaceCredential(true)}
                      className="text-[11px] font-medium text-[#28623d] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#36744a]"
                    >
                      Substituir
                    </button>
                  )}
                </div>

                {config?.has_credentials && !replaceCredential ? (
                  <div className="flex min-h-[134px] flex-col justify-center rounded-md border border-[#c8ddcc] bg-white px-4 py-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-[#27603a]">
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                      Credencial protegida
                    </div>
                    <p className="mt-2 break-all font-mono text-[11px] leading-relaxed text-[#536357]">
                      {config.client_email || 'Conta de serviço configurada no servidor'}
                    </p>
                    <p className="mt-2 text-[11px] text-[#728072]">
                      Você não precisa reenviar o JSON salvo.
                    </p>
                  </div>
                ) : (
                  <>
                    <Textarea
                      id="google-service-account"
                      value={serviceAccountJson}
                      onChange={(event) => {
                        setServiceAccountJson(event.target.value)
                        setPreview(null)
                        setImportResult(null)
                        setError('')
                      }}
                      placeholder={
                        'Cole o JSON completo da conta de serviço:\n{\n  "type": "service_account",\n  "client_email": "...",\n  "private_key": "..." \n}'
                      }
                      rows={5}
                      autoComplete="off"
                      spellCheck={false}
                      disabled={!isAdmin || isSaving || isImporting}
                      className="min-h-[134px] resize-y rounded-md border-[#d4ded3] bg-white font-mono text-[11px] leading-relaxed text-[#334338] placeholder:text-[#929b92] focus-visible:ring-[#36744a]"
                    />
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="max-w-sm text-[11px] leading-relaxed text-[#718071]">
                        Não é uma API key. É o arquivo JSON de uma conta de serviço com acesso de
                        Leitor à planilha.
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json,application/json"
                        className="sr-only"
                        onChange={handleCredentialFile}
                        disabled={!isAdmin || isSaving || isImporting}
                        aria-label="Selecionar JSON da conta de serviço"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={!isAdmin || isSaving || isImporting}
                        className="h-8 border-[#d4ded3] bg-white text-[11px] text-[#425346] hover:bg-[#f0f5ef]"
                      >
                        <Upload className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                        Selecionar JSON
                      </Button>
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="google-spreadsheet-url"
                  className="text-xs font-semibold text-[#2b3c2f]"
                >
                  Link ou ID da planilha
                </Label>
                <Input
                  id="google-spreadsheet-url"
                  value={spreadsheetInput}
                  onChange={(event) => {
                    setSpreadsheetInput(event.target.value)
                    setPreview(null)
                    setImportResult(null)
                    setError('')
                  }}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  autoComplete="url"
                  disabled={!isAdmin || isSaving || isImporting}
                  className="h-10 rounded-md border-[#d4ded3] bg-white font-mono text-xs text-[#334338] placeholder:font-sans placeholder:text-[#929b92] focus-visible:ring-[#36744a]"
                />
                <p className="text-[11px] leading-relaxed text-[#718071]">
                  A conta de serviço deve estar compartilhada na planilha com permissão de{' '}
                  <strong className="font-semibold text-[#536357]">Leitor</strong>. A integração
                  consulta as 14 abas do arquivo.
                </p>

                <div className="flex items-center justify-between gap-4 rounded-md border border-[#e0e6dd] bg-white px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-[#35463a]">Integração ativa</p>
                    <p className="mt-0.5 text-[10px] leading-relaxed text-[#778277]">
                      Desative para impedir prévias e novas importações.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isActive}
                    aria-label="Integração ativa"
                    disabled={!isAdmin || isSaving || isImporting}
                    onClick={() => {
                      setIsActive((current) => !current)
                      setPreview(null)
                      setImportResult(null)
                    }}
                    className={`relative h-5 w-9 shrink-0 rounded-full transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#36744a] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                      isActive ? 'bg-[#347a4a]' : 'bg-[#aeb8ad]'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-150 ${
                        isActive ? 'translate-x-[18px]' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {isAdmin && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e1e7df] pt-4">
                <p className="text-[11px] text-[#778277]">
                  Prévia e importação acontecem somente após sua ação.
                </p>
                <Button
                  type="button"
                  onClick={handleSaveAndPreview}
                  disabled={!canReview || isSaving || isPreviewing || isImporting}
                  className="h-9 rounded-md bg-[#1b5e36] px-4 text-xs font-semibold text-white shadow-none hover:bg-[#164d2c] focus-visible:ring-[#36744a]"
                >
                  {isSaving || isPreviewing ? (
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <ArrowRight className="mr-2 h-4 w-4" aria-hidden="true" />
                  )}
                  {isSaving || isPreviewing
                    ? 'Conectando e validando…'
                    : isActive
                      ? 'Conectar e gerar prévia'
                      : 'Salvar configuração'}
                </Button>
              </div>
            )}
          </div>
        </section>

        {(preview || isPreviewing) && (
          <section
            aria-labelledby="preview-step"
            className="grid gap-5 border-t border-[#e0e6dd] pt-6 lg:grid-cols-[230px_minmax(0,1fr)]"
          >
            <div>
              <StepHeading
                number={2}
                title="Revisar a prévia"
                description="Confira os destinos, as atualizações previstas e as linhas com inconsistências."
                complete={!!importResult}
                id="preview-step"
              />
              <p className="ml-11 mt-3 text-[11px] leading-relaxed text-[#6b776c]">
                A confirmação não apaga usuários ou históricos. Cadastros ausentes na planilha são
                inativados para manter os vínculos.
              </p>
            </div>

            <div className="min-w-0 space-y-4">
              {isPreviewing && !preview ? (
                <div className="flex min-h-40 items-center justify-center gap-3 rounded-lg border border-[#d9e2d7] bg-[#fbfcfa] text-sm text-[#657365]">
                  <LoaderCircle
                    className="h-5 w-5 animate-spin text-[#347a4a]"
                    aria-hidden="true"
                  />
                  Lendo abas e validando os registros…
                </div>
              ) : preview ? (
                <>
                  <div className="grid grid-cols-2 gap-4 rounded-lg border border-[#d9e2d7] bg-[#fbfcfa] p-4 sm:grid-cols-4 sm:px-5">
                    <StatBlock label="Linhas lidas" value={preview.total_linhas} />
                    <StatBlock label="Novos" value={preview.novos} tone="green" />
                    <StatBlock label="Atualizações" value={preview.atualizacoes} tone="amber" />
                    <StatBlock
                      label="Problemas"
                      value={preview.erros}
                      tone={preview.erros ? 'red' : 'neutral'}
                    />
                  </div>

                  {!expectedSheetsPresent && (
                    <Alert className="border-[#edc8c2] bg-[#fff7f5] text-[#8c352b]">
                      <AlertCircle className="h-4 w-4" aria-hidden="true" />
                      <AlertTitle>A planilha não contém todas as abas esperadas</AlertTitle>
                      <AlertDescription>
                        Esperadas: {EXPECTED_SHEET_COUNT}. Encontradas: {preview.abas.length}. A
                        importação fica bloqueada até revisar a origem.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="overflow-hidden rounded-lg border border-[#d9e2d7] bg-white">
                    <div className="grid grid-cols-[minmax(0,1fr)_repeat(3,68px)_32px] items-center gap-2 border-b border-[#d9e2d7] bg-[#f6f8f3] px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#718071] sm:grid-cols-[minmax(0,1.2fr)_repeat(4,82px)_32px] sm:px-4">
                      <span>Aba → destino</span>
                      <span className="text-right">Linhas</span>
                      <span className="hidden text-right sm:block">Novos</span>
                      <span className="text-right">Atualiz.</span>
                      <span className="text-right">Problemas</span>
                      <span aria-hidden="true" />
                    </div>
                    <div className="divide-y divide-[#e7ece5]">
                      {preview.abas.map((sheet) => {
                        const isExpanded = expandedSheet === sheet.name
                        return (
                          <div key={sheet.name}>
                            <button
                              type="button"
                              aria-expanded={isExpanded}
                              onClick={() => setExpandedSheet(isExpanded ? null : sheet.name)}
                              className="grid w-full grid-cols-[minmax(0,1fr)_repeat(3,68px)_32px] items-center gap-2 px-3 py-3 text-left transition-colors hover:bg-[#f8faf7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#36744a] sm:grid-cols-[minmax(0,1.2fr)_repeat(4,82px)_32px] sm:px-4"
                            >
                              <span className="min-w-0">
                                <span className="block truncate text-xs font-semibold text-[#2b3c2f]">
                                  {sheet.name}
                                </span>
                                <span className="mt-0.5 block truncate text-[10px] text-[#758176]">
                                  {sheet.target}
                                </span>
                              </span>
                              <span className="text-right font-mono text-xs tabular-nums text-[#536357]">
                                {sheet.rows}
                              </span>
                              <span className="hidden text-right font-mono text-xs tabular-nums text-[#176334] sm:block">
                                {sheet.creates}
                              </span>
                              <span className="text-right font-mono text-xs tabular-nums text-[#97611b]">
                                {sheet.updates}
                              </span>
                              <span
                                className={`text-right font-mono text-xs tabular-nums ${
                                  sheet.errors ? 'font-semibold text-[#a13c32]' : 'text-[#899389]'
                                }`}
                              >
                                {sheet.errors}
                              </span>
                              <ChevronDown
                                className={`h-4 w-4 justify-self-end text-[#728072] transition-transform duration-150 ${
                                  isExpanded ? 'rotate-180' : ''
                                }`}
                                aria-hidden="true"
                              />
                            </button>
                            {isExpanded && (
                              <div className="space-y-3 border-t border-[#edf0eb] bg-[#fafbf9] px-4 py-3 sm:pl-7">
                                <div>
                                  <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#718071]">
                                    Regra de destino
                                  </p>
                                  <p className="mt-1 text-[11px] leading-relaxed text-[#536357]">
                                    Chave: <code className="font-mono">{sheet.key}</code> ·{' '}
                                    {sheet.mapping}
                                  </p>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {sheet.headers.map((header) => (
                                    <Badge
                                      key={`${sheet.name}-${header}`}
                                      variant="outline"
                                      className="rounded border-[#dce4d9] bg-white px-2 py-0.5 font-mono text-[10px] font-normal text-[#5b6a5d]"
                                    >
                                      {header || '(vazio)'}
                                    </Badge>
                                  ))}
                                </div>
                                {sheet.catalog && sheet.rows > 0 && (
                                  <p className="text-[11px] text-[#657365]">
                                    <ShieldCheck
                                      className="mr-1 inline h-3.5 w-3.5 text-[#347a4a]"
                                      aria-hidden="true"
                                    />
                                    Ausentes na planilha serão inativados, não apagados.
                                  </p>
                                )}
                                {sheet.catalog && sheet.rows === 0 && (
                                  <p className="text-[11px] text-[#657365]">
                                    A aba não tem registros; por segurança, nenhum cadastro será
                                    alterado ou inativado.
                                  </p>
                                )}
                                {sheet.skipped > 0 && (
                                  <p className="text-[11px] text-[#657365]">
                                    {sheet.skipped} linha(s) serão ignoradas por regra de segurança
                                    ou porque não representam um movimento.
                                  </p>
                                )}
                                {sheet.issues.length > 0 && (
                                  <ul className="space-y-1.5 rounded-md border border-[#edc8c2] bg-[#fff8f6] p-3 text-[11px] text-[#873d34]">
                                    {sheet.issues.map((issue, index) => (
                                      <li key={`${sheet.name}-${issue.row}-${index}`}>
                                        Linha {issue.row}: {issue.message}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="max-w-xl text-[11px] leading-relaxed text-[#718071]">
                      {preview.observacao} Usuários sem conta existente serão ignorados; a
                      integração não cria senhas nem usuários novos.
                    </p>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={refreshPreview}
                        disabled={isPreviewing || isImporting}
                        className="h-9 border-[#d4ded3] bg-white text-xs text-[#425346] hover:bg-[#f0f5ef]"
                      >
                        {isPreviewing ? (
                          <LoaderCircle
                            className="mr-1.5 h-3.5 w-3.5 animate-spin"
                            aria-hidden="true"
                          />
                        ) : (
                          <RefreshCw className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                        )}
                        Atualizar prévia
                      </Button>
                      {isAdmin && (
                        <Button
                          type="button"
                          onClick={() => setShowConfirmImport(true)}
                          disabled={
                            previewHasErrors || !expectedSheetsPresent || isImporting || !isActive
                          }
                          className="h-9 bg-[#1b5e36] px-4 text-xs font-semibold text-white hover:bg-[#164d2c] disabled:bg-[#d8e1d7] disabled:text-[#7c887d]"
                        >
                          <ArrowDownToLine className="mr-1.5 h-4 w-4" aria-hidden="true" />
                          Confirmar importação
                        </Button>
                      )}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </section>
        )}

        {importResult && (
          <section
            aria-labelledby="result-step"
            className="grid gap-5 border-t border-[#e0e6dd] pt-6 lg:grid-cols-[230px_minmax(0,1fr)]"
          >
            <div>
              <StepHeading
                number={3}
                title="Resultado"
                description="Registros criados, atualizados, ignorados e pendentes de revisão."
                complete={completedImport}
                id="result-step"
              />
            </div>
            <div className="space-y-4">
              <div
                className={`rounded-lg border p-4 ${
                  importResult.total.rejeitados
                    ? 'border-[#edc8c2] bg-[#fff8f6]'
                    : 'border-[#c8ddcc] bg-[#f4faf3]'
                }`}
              >
                <div className="flex items-start gap-3">
                  {importResult.total.rejeitados ? (
                    <AlertCircle
                      className="mt-0.5 h-5 w-5 shrink-0 text-[#a13c32]"
                      aria-hidden="true"
                    />
                  ) : (
                    <CheckCircle2
                      className="mt-0.5 h-5 w-5 shrink-0 text-[#347a4a]"
                      aria-hidden="true"
                    />
                  )}
                  <div>
                    <h3 className="text-sm font-semibold text-[#2b3c2f]">
                      {importResult.total.rejeitados
                        ? 'Importação parcial — revise os registros sinalizados'
                        : 'Importação concluída'}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-[#5e6f61]">
                      {importResult.mensagem}
                    </p>
                    <p className="mt-1 text-[11px] text-[#718071]">
                      {formatDate(importResult.timestamp)} · {importResult.observacao}
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 rounded-lg border border-[#d9e2d7] bg-[#fbfcfa] p-4 sm:grid-cols-5">
                <StatBlock label="Criados" value={importResult.total.criados} tone="green" />
                <StatBlock
                  label="Atualizados"
                  value={importResult.total.atualizados}
                  tone="amber"
                />
                <StatBlock label="Ignorados" value={importResult.total.ignorados} />
                <StatBlock
                  label="Rejeitados"
                  value={importResult.total.rejeitados}
                  tone={importResult.total.rejeitados ? 'red' : 'neutral'}
                />
                <StatBlock label="Inativados" value={importResult.total.inativados} />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={refreshPreview}
                disabled={isPreviewing || isImporting}
                className="h-9 border-[#d4ded3] bg-white text-xs text-[#425346] hover:bg-[#f0f5ef]"
              >
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                Preparar nova importação
              </Button>
            </div>
          </section>
        )}

        <div className="flex flex-col gap-2 border-t border-[#e0e6dd] pt-4 text-[11px] leading-relaxed text-[#788478] sm:flex-row sm:items-center sm:justify-between">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-[#347a4a]" aria-hidden="true" />
            Acesso Google Sheets: somente leitura
          </span>
          <span>Sem execução automática · a importação exige confirmação do Administrador</span>
        </div>
      </CardContent>

      {showConfirmImport && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#17221a]/40 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowConfirmImport(false)
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-import-title"
            aria-describedby="confirm-import-description"
            className="w-full max-w-md rounded-xl border border-[#d8e1d7] bg-white p-5 shadow-xl sm:p-6"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#e8f2e8] text-[#27603a]">
                <FileJson2 className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <h3 id="confirm-import-title" className="text-base font-semibold text-[#243328]">
                  Confirmar importação das 14 abas?
                </h3>
                <p
                  id="confirm-import-description"
                  className="mt-2 text-sm leading-relaxed text-[#5e6f61]"
                >
                  Serão criados {preview?.novos || 0} registros e atualizados{' '}
                  {preview?.atualizacoes || 0}. Cadastros de referência ausentes serão inativados;
                  contas de usuários e históricos não serão excluídos.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowConfirmImport(false)}
                disabled={isImporting}
                className="border-[#d4ded3] bg-white text-xs text-[#425346]"
              >
                Voltar à prévia
              </Button>
              <Button
                type="button"
                onClick={handleImport}
                disabled={isImporting}
                className="bg-[#1b5e36] text-xs text-white hover:bg-[#164d2c]"
              >
                {isImporting && (
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                )}
                {isImporting ? 'Importando…' : 'Confirmar e importar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
