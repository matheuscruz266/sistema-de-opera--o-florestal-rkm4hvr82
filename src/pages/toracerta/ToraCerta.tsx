import React, { useEffect, useState, useMemo } from 'react'
import { apiService } from '@/services/florestalApi'
import { useAuth } from '@/context/AuthContext'
import { InventarioPilha, Pilha, ConversaoSrToras } from '@/types/florestal'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Compass,
  Plus,
  Loader2,
  Info,
  Scale,
  Calculator,
  AlertTriangle,
  History,
  FileCheck,
  FileEdit,
  Trash2,
  Filter,
} from 'lucide-react'
import { toast } from 'sonner'

export default function ToraCertaPage() {
  const { user, fazendaAtiva, refreshAlertasCount } = useAuth()

  const [inventarios, setInventarios] = useState<InventarioPilha[]>([])
  const [pilhas, setPilhas] = useState<Pilha[]>([])
  const [conversaoVigente, setConversaoVigente] = useState<ConversaoSrToras | null>(null)
  const [loading, setLoading] = useState(true)

  // Filtros
  const [filtroPilha, setFiltroPilha] = useState<string>('todas')
  const [filtroDataInicio, setFiltroDataInicio] = useState<string>('')
  const [filtroDataFim, setFiltroDataFim] = useState<string>('')
  const [filtroStatus, setFiltroStatus] = useState<string>('todos')

  // Modais
  const [modalOpen, setModalOpen] = useState(false)
  const [correcaoModalOpen, setCorrecaoModalOpen] = useState(false)
  const [conversorPesoModalOpen, setConversorPesoModalOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Formulário de Nova Medição
  const [pilhaId, setPilhaId] = useState('')
  const [dataInventario, setDataInventario] = useState(new Date().toISOString().split('T')[0])
  const [responsavelNome, setResponsavelNome] = useState(user?.name || '')
  const [statusRegistro, setStatusRegistro] = useState<'rascunho' | 'oficial'>('rascunho')
  const [metodoEscolhido, setMetodoEscolhido] = useState<'geometrico' | 'amostragem_diametros'>(
    'geometrico',
  )
  const [observacoes, setObservacoes] = useState('')

  // Método Geométrico
  const [compPilha, setCompPilha] = useState<number | ''>(40)
  const [altMediaPilha, setAltMediaPilha] = useState<number | ''>(3.0)
  const [compToras, setCompToras] = useState<number | ''>(3.3)
  const [fatorCalibracao, setFatorCalibracao] = useState<number | ''>(0.7)

  // Método Amostragem de Diâmetros
  const [qtdTorasAmostradas, setQtdTorasAmostradas] = useState<number | ''>(50)
  const [diametroMedioCm, setDiametroMedioCm] = useState<number | ''>(22)
  const [compMedioToras, setCompMedioToras] = useState<number | ''>(3.3)

  // Escolha explícita do operador para o oficial
  const [metodoOficialAdotado, setMetodoOficialAdotado] = useState<
    'geometrico' | 'amostragem' | 'manual'
  >('geometrico')
  const [volumeManual, setVolumeManual] = useState<number | ''>('')

  // Estado para correção / substituição
  const [itemParaCorrigir, setItemParaCorrigir] = useState<InventarioPilha | null>(null)
  const [justificativaCorrecao, setJustificativaCorrecao] = useState('')

  // Conversor Auxiliar de Peso (ToraCerta não alimenta m³ direto por peso!)
  const [pesoEntradaT, setPesoEntradaT] = useState<number | ''>(35)
  const [fatorDensidadeValidado, setFatorDensidadeValidado] = useState<number | ''>(0.95)
  const [m3CalculadoConversor, setM3CalculadoConversor] = useState<number | null>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const [invList, pilhasList, conv] = await Promise.all([
        apiService.getInventariosPilha(),
        apiService.getPilhas(fazendaAtiva?.id),
        apiService.getConversaoSrTorasVigente(),
      ])
      setInventarios(invList)
      setPilhas(pilhasList)
      setConversaoVigente(conv)
    } catch (err) {
      console.error(err)
      toast.error('Erro ao carregar dados do Inventário ToraCerta')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [fazendaAtiva])

  // CÁLCULOS AUTOMÁTICOS
  // 1. Geométrico:
  // V_aparente = Comp × Altura × Comp_toras
  // V_sólido = V_aparente × Fator_calibração (ex 0.70)
  const vAparente = useMemo(() => {
    if (compPilha === '' || altMediaPilha === '' || compToras === '') return 0
    return Number((Number(compPilha) * Number(altMediaPilha) * Number(compToras)).toFixed(2))
  }, [compPilha, altMediaPilha, compToras])

  const vSolidoGeometrico = useMemo(() => {
    if (!vAparente || fatorCalibracao === '') return 0
    return Number((vAparente * Number(fatorCalibracao)).toFixed(2))
  }, [vAparente, fatorCalibracao])

  // 2. Amostragem de diâmetros:
  // Raio médio = (diametroMedioCm / 100) / 2
  // V_individual = PI * r² * comp_medio
  // Estimativa V_sólido = V_aparente * (somatório seccionado) ou modelo estatístico Huber simplificado:
  // Volume individual médio * estimativa de toras na pilha (ou amostral extrapolado)
  const vSolidoAmostragem = useMemo(() => {
    if (diametroMedioCm === '' || compMedioToras === '') return 0
    const raio = Number(diametroMedioCm) / 200 // metros
    const areaSecao = Math.PI * Math.pow(raio, 2)
    const vIndividual = areaSecao * Number(compMedioToras)
    // Se temos vAparente da pilha, podemos inferir o volume sólido pela ocupação estimada do diâmetro médio
    if (vAparente > 0 && compToras) {
      // Fator de empilhamento derivado da compacidade média dos cilindros (~0.65 a 0.75)
      const fatorEmpilhado = Math.min(
        0.78,
        Math.max(0.55, 0.68 + (Number(diametroMedioCm) - 20) * 0.003),
      )
      return Number((vAparente * fatorEmpilhado).toFixed(2))
    }
    // Caso contrário, volume amostral direto
    const qtd = qtdTorasAmostradas === '' ? 1 : Number(qtdTorasAmostradas)
    return Number((vIndividual * qtd).toFixed(2))
  }, [diametroMedioCm, compMedioToras, vAparente, compToras, qtdTorasAmostradas])

  // Volume Oficial Calculado pela escolha do operador
  const volumeOficialCalculado = useMemo(() => {
    if (metodoOficialAdotado === 'geometrico') {
      return vSolidoGeometrico
    } else if (metodoOficialAdotado === 'amostragem') {
      return vSolidoAmostragem
    } else {
      return volumeManual === '' ? 0 : Number(volumeManual)
    }
  }, [metodoOficialAdotado, vSolidoGeometrico, vSolidoAmostragem, volumeManual])

  const handleOpenCreate = () => {
    setItemParaCorrigir(null)
    setJustificativaCorrecao('')
    setPilhaId(pilhas.length > 0 ? pilhas[0].id : '')
    setDataInventario(new Date().toISOString().split('T')[0])
    setResponsavelNome(user?.name || '')
    setStatusRegistro('rascunho')
    setMetodoEscolhido('geometrico')
    setObservacoes('')

    setCompPilha(40)
    setAltMediaPilha(3.0)
    setCompToras(3.3)
    setFatorCalibracao(0.7)

    setQtdTorasAmostradas(50)
    setDiametroMedioCm(22)
    setCompMedioToras(3.3)

    setMetodoOficialAdotado('geometrico')
    setVolumeManual('')
    setModalOpen(true)
  }

  const handleOpenCorrigir = (item: InventarioPilha) => {
    setItemParaCorrigir(item)
    setJustificativaCorrecao('')
    setPilhaId(item.pilha_id)
    setDataInventario(item.data_inventario)
    setResponsavelNome(user?.name || '')
    setStatusRegistro('oficial')
    setMetodoEscolhido(item.metodo_escolhido)
    setObservacoes(item.observacoes || '')

    setCompPilha(item.comp_pilha_m ?? 40)
    setAltMediaPilha(item.alt_media_pilha_m ?? 3.0)
    setCompToras(item.comp_toras_m ?? 3.3)
    setFatorCalibracao(item.fator_calibracao ?? 0.7)

    setQtdTorasAmostradas(item.qtd_toras_amostradas ?? 50)
    setDiametroMedioCm(item.diametro_medio_cm ?? 22)
    setCompMedioToras(item.comp_medio_toras_m ?? 3.3)

    setMetodoOficialAdotado(item.metodo_escolhido === 'geometrico' ? 'geometrico' : 'amostragem')
    setVolumeManual(item.volume_oficial_m3)
    setCorrecaoModalOpen(true)
  }

  const handleSalvarMedicao = async (e: React.FormEvent, isCorrecao = false) => {
    e.preventDefault()
    if (!pilhaId) {
      toast.error('Selecione uma pilha cadastrada.')
      return
    }
    const volFinal = isCorrecao
      ? volumeManual !== ''
        ? Number(volumeManual)
        : volumeOficialCalculado
      : volumeOficialCalculado

    if (volFinal <= 0) {
      toast.error('O volume oficial calculado deve ser maior que zero.')
      return
    }
    if (isCorrecao && !justificativaCorrecao.trim()) {
      toast.error(
        'Para corrigir um registro oficial é OBRIGATÓRIO informar uma justificativa textual.',
      )
      return
    }

    setSaving(true)
    try {
      const payload: Partial<InventarioPilha> = {
        pilha_id: pilhaId,
        data_inventario: dataInventario,
        responsavel_nome: responsavelNome.trim(),
        metodo_escolhido: isCorrecao
          ? itemParaCorrigir?.metodo_escolhido || 'geometrico'
          : metodoOficialAdotado === 'amostragem'
            ? 'amostragem_diametros'
            : 'geometrico',
        status_registro: isCorrecao ? 'oficial' : statusRegistro,
        comp_pilha_m: compPilha !== '' ? Number(compPilha) : undefined,
        alt_media_pilha_m: altMediaPilha !== '' ? Number(altMediaPilha) : undefined,
        comp_toras_m: compToras !== '' ? Number(compToras) : undefined,
        v_aparente_m3: vAparente > 0 ? vAparente : undefined,
        fator_calibracao: fatorCalibracao !== '' ? Number(fatorCalibracao) : undefined,
        v_solido_geometrico_m3: vSolidoGeometrico > 0 ? vSolidoGeometrico : undefined,
        qtd_toras_amostradas: qtdTorasAmostradas !== '' ? Number(qtdTorasAmostradas) : undefined,
        diametro_medio_cm: diametroMedioCm !== '' ? Number(diametroMedioCm) : undefined,
        comp_medio_toras_m: compMedioToras !== '' ? Number(compMedioToras) : undefined,
        v_solido_amostragem_m3: vSolidoAmostragem > 0 ? vSolidoAmostragem : undefined,
        volume_oficial_m3: volFinal,
        observacoes: observacoes.trim() || undefined,
      }

      if (isCorrecao && itemParaCorrigir) {
        payload.justificativa_correcao = justificativaCorrecao.trim()
        payload.registro_substituido_id = itemParaCorrigir.id

        // Cria o novo registro oficial de correção
        await apiService.createInventarioPilha(payload)

        // Marca o anterior como substituído (preservando para auditoria)
        await apiService.updateInventarioPilha(itemParaCorrigir.id, {
          status_registro: 'substituido',
          justificativa_correcao: `Substituído por nova medição em ${dataInventario}. Motivo: ${justificativaCorrecao}`,
        })

        toast.success(
          'Correção oficial registrada com sucesso! O histórico anterior foi arquivado como "Substituído".',
        )
        setCorrecaoModalOpen(false)
      } else {
        await apiService.createInventarioPilha(payload)
        toast.success(
          statusRegistro === 'oficial'
            ? 'Medição OFICIAL registrada com sucesso! O hook de backend validará divergências.'
            : 'Medição em rascunho salva com sucesso!',
        )
        setModalOpen(false)
      }

      await loadData()
      await refreshAlertasCount()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Erro ao registrar medição ToraCerta')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingId) return
    try {
      await apiService.deleteInventarioPilha(deletingId)
      toast.success('Registro de medição excluído com sucesso.')
      setDeletingId(null)
      loadData()
    } catch (err: any) {
      console.error(err)
      toast.error(
        err.message ||
          'Falha ao excluir. Registros oficiais não podem ser excluídos pelo hook de auditoria do PocketBase.',
      )
    }
  }

  // Filtragem da listagem
  const inventariosFiltrados = useMemo(() => {
    return inventarios.filter((item) => {
      if (filtroPilha !== 'todas' && item.pilha_id !== filtroPilha) return false
      if (filtroStatus !== 'todos' && item.status_registro !== filtroStatus) return false
      if (filtroDataInicio && item.data_inventario < filtroDataInicio) return false
      if (filtroDataFim && item.data_inventario > filtroDataFim) return false
      return true
    })
  }, [inventarios, filtroPilha, filtroStatus, filtroDataInicio, filtroDataFim])

  return (
    <div className="space-y-6">
      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A2E1A] flex items-center gap-2">
            <Compass className="w-6 h-6 text-[#FF8F00]" />
            Inventário Físico ToraCerta (Núcleo C)
          </h1>
          <p className="text-sm text-[#5A6D5A]">
            Medição tridimensional de pilhas de toras no pátio. Compare método geométrico com
            amostragem e defina o volume oficial.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={() => setConversorPesoModalOpen(true)}
            className="border-[#DDE4DE] text-[#1A2E1A] hover:bg-neutral-50"
          >
            <Scale className="w-4 h-4 mr-2 text-[#1565C0]" />
            Conversor Peso → Volume (Validação)
          </Button>
          <Button onClick={handleOpenCreate} className="bg-[#1B5E20] hover:bg-[#14521A] text-white">
            <Plus className="w-4 h-4 mr-2" />
            Nova Medição de Pilha
          </Button>
        </div>
      </div>

      {/* Regras Operacionais e de Auditoria */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-[#E8F5E9] border border-emerald-200 rounded-xl flex items-start gap-3">
          <Info className="w-5 h-5 text-[#1B5E20] shrink-0 mt-0.5" />
          <div className="text-xs text-[#1A2E1A] leading-relaxed">
            <strong>Fórmula ToraCerta:</strong> Volume aparente = Comprimento × Altura média ×
            Comprimento das toras.
            <br />
            <strong>Volume Sólido:</strong> V_aparente × Fator de calibração empírico (padrão 0,70).
          </div>
        </div>

        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <strong>Auditoria e Preservação:</strong> Medições com status <strong>OFICIAL</strong>{' '}
            não podem ser excluídas (o backend bloqueia a exclusão). Correções preservam o registro
            anterior como "Substituído" com justificativa obrigatória.
          </div>
        </div>
      </div>

      {/* FILTROS DE CONSULTA */}
      <Card className="border-[#DDE4DE] shadow-xs">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-[#5A6D5A] flex items-center gap-1">
                <Filter className="w-3 h-3" /> Pilha Cadastrada
              </Label>
              <Select value={filtroPilha} onValueChange={setFiltroPilha}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Todas as Pilhas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as Pilhas</SelectItem>
                  {pilhas.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.codigo} - {p.nome || p.produto}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-[#5A6D5A]">Status da Medição</Label>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Status</SelectItem>
                  <SelectItem value="oficial">Apenas Oficiais</SelectItem>
                  <SelectItem value="rascunho">Apenas Rascunhos</SelectItem>
                  <SelectItem value="substituido">Apenas Substituídos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-[#5A6D5A]">Período De</Label>
              <Input
                type="date"
                value={filtroDataInicio}
                onChange={(e) => setFiltroDataInicio(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-[#5A6D5A]">Período Até</Label>
              <Input
                type="date"
                value={filtroDataFim}
                onChange={(e) => setFiltroDataFim(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* TABELA DE MEDIÇÕES */}
      <Card className="border-[#DDE4DE] shadow-xs">
        <CardHeader className="p-4 border-b border-[#DDE4DE] bg-neutral-50/50 flex flex-row items-center justify-between">
          <span className="text-xs font-semibold text-[#1A2E1A]">
            Histórico de Inventários ToraCerta ({inventariosFiltrados.length})
          </span>
          <span className="text-xs text-[#5A6D5A]">
            Oficiais Vigentes:{' '}
            <strong className="text-[#1B5E20]">
              {inventariosFiltrados.filter((i) => i.status_registro === 'oficial').length}
            </strong>
          </span>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-[#5A6D5A] gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#1B5E20]" />
              <span className="text-xs">Carregando medições ToraCerta...</span>
            </div>
          ) : inventariosFiltrados.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#5A6D5A]">
              Nenhuma medição encontrada com os filtros selecionados.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F7F5] border-b border-[#DDE4DE] text-[#5A6D5A] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Data</th>
                  <th className="py-3 px-4">Pilha</th>
                  <th className="py-3 px-4">Responsável</th>
                  <th className="py-3 px-4 text-right">V. Aparente</th>
                  <th className="py-3 px-4 text-right">V. Geométrico</th>
                  <th className="py-3 px-4 text-right">V. Amostragem</th>
                  <th className="py-3 px-4 text-right">Volume Oficial</th>
                  <th className="py-3 px-4 text-center">Método Oficial</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE4DE]">
                {inventariosFiltrados.map((item) => {
                  const pilha = item.expand?.pilha_id || pilhas.find((p) => p.id === item.pilha_id)
                  const isOficial = item.status_registro === 'oficial'
                  const isSubstituido = item.status_registro === 'substituido'

                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors ${
                        isOficial
                          ? 'bg-emerald-50/20 font-medium'
                          : isSubstituido
                            ? 'opacity-60 bg-neutral-50 line-through-text'
                            : 'hover:bg-neutral-50/80'
                      }`}
                    >
                      <td className="py-3 px-4 font-mono text-[#1A2E1A]">{item.data_inventario}</td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-[#1B5E20]">
                          {pilha?.codigo || '—'}
                        </span>
                        <span className="block text-[10px] text-[#5A6D5A]">
                          {pilha?.nome || pilha?.produto}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#1A2E1A]">{item.responsavel_nome}</td>
                      <td className="py-3 px-4 text-right font-mono text-[#5A6D5A]">
                        {item.v_aparente_m3 ? `${item.v_aparente_m3.toFixed(2)} m³` : '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[#5A6D5A]">
                        {item.v_solido_geometrico_m3
                          ? `${item.v_solido_geometrico_m3.toFixed(2)} m³`
                          : '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[#5A6D5A]">
                        {item.v_solido_amostragem_m3
                          ? `${item.v_solido_amostragem_m3.toFixed(2)} m³`
                          : '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-sm text-[#1B5E20]">
                        {item.volume_oficial_m3.toFixed(2)} m³
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {item.metodo_escolhido === 'geometrico' ? 'Geométrico' : 'Amostragem'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isOficial ? (
                          <Badge className="bg-emerald-600 text-white text-[10px] font-bold">
                            Oficial
                          </Badge>
                        ) : isSubstituido ? (
                          <Badge
                            variant="secondary"
                            className="bg-neutral-200 text-neutral-700 text-[10px]"
                            title={item.justificativa_correcao || 'Substituído por retificação'}
                          >
                            Substituído
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[10px] text-amber-700 border-amber-300"
                          >
                            Rascunho
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {isOficial && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenCorrigir(item)}
                              title="Criar retificação oficial com justificativa"
                              className="h-7 text-xs border-amber-300 text-amber-800 hover:bg-amber-50"
                            >
                              <History className="w-3 h-3 mr-1" />
                              Retificar
                            </Button>
                          )}

                          {!isOficial && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeletingId(item.id)}
                              title="Excluir medição rascunho"
                              className="h-7 w-7 text-neutral-400 hover:text-red-600 hover:bg-red-50"
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

      {/* MODAL NOVA MEDIÇÃO TORA CERTA */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg text-[#1A2E1A] flex items-center gap-2">
              <Calculator className="w-5 h-5 text-[#1B5E20]" />
              Nova Medição de Pilha — ToraCerta
            </DialogTitle>
            <DialogDescription className="text-xs text-[#5A6D5A]">
              Informe as dimensões tridimensionais da pilha. Selecione a pilha oficial de cadastro.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={(e) => handleSalvarMedicao(e, false)} className="space-y-5">
            {/* Bloco 1: Identificação Operacional */}
            <div className="p-3 bg-neutral-50 rounded-lg border border-[#DDE4DE] space-y-3">
              <span className="text-xs font-bold text-[#1A2E1A] uppercase tracking-wide block">
                1. Identificação Operacional (Sem Digitação Livre de Pilha)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Pilha Oficial *</Label>
                  <Select value={pilhaId} onValueChange={setPilhaId} required>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Selecione a pilha..." />
                    </SelectTrigger>
                    <SelectContent>
                      {pilhas.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.codigo} — {p.nome || p.produto} (Saldo atual: {p.volume_atual_m3 || 0}{' '}
                          m³)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Data da Medição *</Label>
                  <Input
                    type="date"
                    value={dataInventario}
                    onChange={(e) => setDataInventario(e.target.value)}
                    className="h-9"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Operador / Responsável *</Label>
                  <Input
                    value={responsavelNome}
                    onChange={(e) => setResponsavelNome(e.target.value)}
                    className="h-9"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Status do Registro *</Label>
                  <Select
                    value={statusRegistro}
                    onValueChange={(val: any) => setStatusRegistro(val)}
                  >
                    <SelectTrigger className="h-9 text-xs font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rascunho">
                        Rascunho (Pode ser excluído/recalculado)
                      </SelectItem>
                      <SelectItem value="oficial">
                        Oficial (Gera alerta de divergência e fica bloqueado)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Bloco 2: Método Geométrico ToraCerta */}
            <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1B5E20] uppercase tracking-wide">
                  2. Método A: Geométrico ToraCerta
                </span>
                <span className="text-[11px] font-mono text-[#1B5E20]">
                  V_aparente = C × A × Ltoras
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Comprimento Pilha (m) *</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="40.0"
                    value={compPilha}
                    onChange={(e) =>
                      setCompPilha(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    className="h-9 font-mono"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Altura Média Pilha (m) *</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="3.0"
                    value={altMediaPilha}
                    onChange={(e) =>
                      setAltMediaPilha(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    className="h-9 font-mono"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Comprimento Toras (m) *</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="3.3"
                    value={compToras}
                    onChange={(e) =>
                      setCompToras(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    className="h-9 font-mono"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Fator Calibração *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.70"
                    value={fatorCalibracao}
                    onChange={(e) =>
                      setFatorCalibracao(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    className="h-9 font-mono font-bold"
                    required
                  />
                </div>
              </div>

              {/* Resultado Geométrico */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-2.5 rounded bg-white border border-emerald-200">
                  <span className="text-[11px] text-[#5A6D5A] block">
                    Volume Aparente Calculado:
                  </span>
                  <span className="text-sm font-mono font-bold text-[#1A2E1A]">
                    {vAparente.toFixed(2)} m³
                  </span>
                </div>
                <div className="p-2.5 rounded bg-emerald-100/60 border border-emerald-300">
                  <span className="text-[11px] text-[#1B5E20] block font-semibold">
                    Volume Sólido Estimado (Geométrico):
                  </span>
                  <span className="text-base font-mono font-bold text-[#1B5E20]">
                    {vSolidoGeometrico.toFixed(2)} m³
                  </span>
                </div>
              </div>
            </div>

            {/* Bloco 3: Método B: Amostragem de Diâmetros */}
            <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1565C0] uppercase tracking-wide">
                  3. Método B: Amostragem de Diâmetros (Para Comparação)
                </span>
                <span className="text-[11px] font-mono text-[#1565C0]">
                  Huber / Smalian Seccionado
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Qtd Toras Amostradas</Label>
                  <Input
                    type="number"
                    placeholder="50"
                    value={qtdTorasAmostradas}
                    onChange={(e) =>
                      setQtdTorasAmostradas(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    className="h-9 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Diâmetro Médio (cm)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="22.0"
                    value={diametroMedioCm}
                    onChange={(e) =>
                      setDiametroMedioCm(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    className="h-9 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Comprimento Médio (m)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="3.3"
                    value={compMedioToras}
                    onChange={(e) =>
                      setCompMedioToras(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    className="h-9 font-mono"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded bg-blue-100/60 border border-blue-300 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-[#1565C0] block font-semibold">
                    Volume Sólido Calculado por Amostragem:
                  </span>
                  <span className="text-xs text-[#5A6D5A]">
                    Variação versus Geométrico:{' '}
                    {vSolidoGeometrico > 0
                      ? `${(((vSolidoAmostragem - vSolidoGeometrico) / vSolidoGeometrico) * 100).toFixed(1)}%`
                      : '—'}
                  </span>
                </div>
                <span className="text-base font-mono font-bold text-[#1565C0]">
                  {vSolidoAmostragem.toFixed(2)} m³
                </span>
              </div>
            </div>

            {/* Bloco 4: Escolha Explícita do Volume Oficial */}
            <div className="p-3.5 bg-neutral-100 rounded-lg border-2 border-[#1B5E20] space-y-3">
              <span className="text-xs font-bold text-[#1A2E1A] uppercase tracking-wide block">
                4. Decisão Operacional: Método Adotado para Volume Oficial *
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <label
                  className={`flex flex-col p-2.5 rounded border cursor-pointer transition-all ${
                    metodoOficialAdotado === 'geometrico'
                      ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-600/20'
                      : 'bg-white border-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="metodo_oficial"
                      checked={metodoOficialAdotado === 'geometrico'}
                      onChange={() => setMetodoOficialAdotado('geometrico')}
                      className="text-[#1B5E20] focus:ring-[#1B5E20]"
                    />
                    <span className="text-xs font-bold text-[#1A2E1A]">Método Geométrico</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#1B5E20] mt-1 pl-5">
                    {vSolidoGeometrico.toFixed(2)} m³
                  </span>
                </label>

                <label
                  className={`flex flex-col p-2.5 rounded border cursor-pointer transition-all ${
                    metodoOficialAdotado === 'amostragem'
                      ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-600/20'
                      : 'bg-white border-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="metodo_oficial"
                      checked={metodoOficialAdotado === 'amostragem'}
                      onChange={() => setMetodoOficialAdotado('amostragem')}
                      className="text-[#1565C0] focus:ring-[#1565C0]"
                    />
                    <span className="text-xs font-bold text-[#1A2E1A]">Por Amostragem</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#1565C0] mt-1 pl-5">
                    {vSolidoAmostragem.toFixed(2)} m³
                  </span>
                </label>

                <label
                  className={`flex flex-col p-2.5 rounded border cursor-pointer transition-all ${
                    metodoOficialAdotado === 'manual'
                      ? 'bg-amber-50 border-amber-600 ring-2 ring-amber-600/20'
                      : 'bg-white border-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="metodo_oficial"
                      checked={metodoOficialAdotado === 'manual'}
                      onChange={() => setMetodoOficialAdotado('manual')}
                      className="text-amber-600 focus:ring-amber-600"
                    />
                    <span className="text-xs font-bold text-[#1A2E1A]">
                      Ajuste Manual Ponderado
                    </span>
                  </div>
                  <div className="mt-1 pl-5">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Volume m³"
                      value={volumeManual}
                      onChange={(e) =>
                        setVolumeManual(e.target.value === '' ? '' : Number(e.target.value))
                      }
                      disabled={metodoOficialAdotado !== 'manual'}
                      className="h-7 text-xs font-mono font-bold"
                    />
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-white border border-[#DDE4DE]">
                <span className="text-xs font-semibold text-[#1A2E1A]">
                  Volume Final Gravado na Pilha:
                </span>
                <span className="text-lg font-mono font-extrabold text-[#1B5E20]">
                  {volumeOficialCalculado.toFixed(2)} m³
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Observações da Medição</Label>
              <Input
                placeholder="Ex: Medição realizada após 48h de chuva intensa; madeira com casca grossa."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                className="h-9"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving || volumeOficialCalculado <= 0}
                className="bg-[#1B5E20] hover:bg-[#14521A] text-white"
              >
                {saving && <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />}
                Salvar Medição ToraCerta
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL DE RETIFICAÇÃO / CORREÇÃO OFICIAL (PRESERVA HISTÓRICO) */}
      <Dialog open={correcaoModalOpen} onOpenChange={setCorrecaoModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg text-[#1A2E1A] flex items-center gap-2">
              <History className="w-5 h-5 text-amber-600" />
              Retificar Medição Oficial (Auditoria)
            </DialogTitle>
            <DialogDescription className="text-xs text-[#5A6D5A]">
              O registro original de {itemParaCorrigir?.data_inventario} (
              {itemParaCorrigir?.volume_oficial_m3} m³) será preservado com status "Substituído".
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={(e) => handleSalvarMedicao(e, true)} className="space-y-4">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 space-y-1">
              <strong>Regra de Conformidade:</strong> Toda alteração em medição oficial exige
              justificativa formal para fins de auditoria florestal.
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Novo Volume Oficial (m³) *</Label>
              <Input
                type="number"
                step="0.01"
                value={volumeManual}
                onChange={(e) =>
                  setVolumeManual(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="h-9 font-mono font-bold text-base"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Justificativa da Retificação *</Label>
              <textarea
                rows={3}
                placeholder="Explique o motivo técnico da correção (ex: recalibração de diâmetro após conferência física; erro de anotação na altura média)..."
                value={justificativaCorrecao}
                onChange={(e) => setJustificativaCorrecao(e.target.value)}
                className="w-full text-xs p-2 rounded-md border border-[#DDE4DE] focus-visible:ring-1 focus-visible:ring-[#1B5E20]"
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setCorrecaoModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving || !justificativaCorrecao.trim()}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                {saving && <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />}
                Confirmar Retificação
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* CONVERSOR AUXILIAR DE PESO → VOLUME (VALIDAÇÃO SEPARADA) */}
      <Dialog open={conversorPesoModalOpen} onOpenChange={setConversorPesoModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg text-[#1A2E1A] flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#1565C0]" />
              Validação de Peso → Volume (m³)
            </DialogTitle>
            <DialogDescription className="text-xs text-[#5A6D5A]">
              Quando a referência vier de balança externa (toneladas), a conversão deve ser validada
              e registrada separadamente — nunca alimentando diretamente campos de m³ da pilha.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 leading-relaxed">
              <strong>Atenção:</strong> O sistema ToraCerta opera primariamente por volumetria
              tridimensional. Este cálculo serve para balizamento de pesagens fiscais e de
              transporte.
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Peso Bruto / Líquido (t) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="35.0"
                  value={pesoEntradaT}
                  onChange={(e) =>
                    setPesoEntradaT(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="h-9 font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Densidade Validada (t/m³) *</Label>
                <Input
                  type="number"
                  step="0.0001"
                  placeholder="0.95"
                  value={fatorDensidadeValidado}
                  onChange={(e) =>
                    setFatorDensidadeValidado(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="h-9 font-mono font-bold"
                />
                <span className="text-[10px] text-[#5A6D5A] block">
                  Vigente: {conversaoVigente?.fator_t_m3 ?? 0.95} t/m³
                </span>
              </div>
            </div>

            <Button
              type="button"
              onClick={() => {
                if (pesoEntradaT && fatorDensidadeValidado && Number(fatorDensidadeValidado) > 0) {
                  const m3 = Number(pesoEntradaT) / Number(fatorDensidadeValidado)
                  setM3CalculadoConversor(Number(m3.toFixed(2)))
                  toast.success('Conversão calculada!')
                }
              }}
              className="w-full bg-[#1565C0] hover:bg-[#0D47A1] text-white"
            >
              Calcular Equivalência em m³
            </Button>

            {m3CalculadoConversor !== null && (
              <div className="p-3 bg-neutral-100 rounded-lg border border-[#DDE4DE] space-y-1 text-center">
                <span className="text-xs text-[#5A6D5A] block">
                  Volume Sólido Equivalente Estimado:
                </span>
                <span className="text-2xl font-mono font-bold text-[#1B5E20] block">
                  {m3CalculadoConversor.toFixed(2)} m³
                </span>
                <span className="text-[10px] text-neutral-500 block">
                  Cálculo: {pesoEntradaT} t ÷ {fatorDensidadeValidado} t/m³
                </span>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setConversorPesoModalOpen(false)}
              >
                Fechar
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* CONFIRMAÇÃO DE EXCLUSÃO DE RASCUNHO */}
      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Medição em Rascunho?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação excluirá permanentemente a medição selecionada. Registros com status oficial
              não podem ser excluídos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Excluir Rascunho
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
