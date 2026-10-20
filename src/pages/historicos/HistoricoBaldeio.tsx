import React, { useEffect, useState } from 'react'
import { apiService } from '@/services/florestalApi'
import {
  HistoricoBaldeio,
  CaminhaoBaldeio,
  Talhao,
  Pilha,
  ConversaoSrToras,
} from '@/types/florestal'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ArrowRightLeft, Plus, Search, Edit2, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  formatHorimetro,
  formatLitros,
  formatStatusOperacao,
} from '@/lib/historicoOperacional'

export default function HistoricoBaldeioPage() {
  const [registros, setRegistros] = useState<HistoricoBaldeio[]>([])
  const [caminhoes, setCaminhoes] = useState<CaminhaoBaldeio[]>([])
  const [talhoes, setTalhoes] = useState<Talhao[]>([])
  const [pilhas, setPilhas] = useState<Pilha[]>([])
  const [conversaoVigente, setConversaoVigente] = useState<ConversaoSrToras | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<HistoricoBaldeio | null>(null)
  const [editingItem, setEditingItem] = useState<HistoricoBaldeio | null>(null)
  const [saving, setSaving] = useState(false)

  // Form states
  const [caminhaoBaldeioId, setCaminhaoBaldeioId] = useState('')
  const [talhaoOrigemId, setTalhaoOrigemId] = useState('')
  const [pilhaDestinoId, setPilhaDestinoId] = useState('')
  const [dataHoraSaida, setDataHoraSaida] = useState(new Date().toISOString().slice(0, 16))
  const [dataHoraChegada, setDataHoraChegada] = useState('')
  const [volumeSr, setVolumeSr] = useState<number | ''>('')
  const [motorista, setMotorista] = useState('')
  const [numeroViagem, setNumeroViagem] = useState('')
  const [statusBaldeio, setStatusBaldeio] =
    useState<HistoricoBaldeio['status_baldeio']>('em_transito')

  const loadData = async () => {
    setLoading(true)
    try {
      const [histList, camList, talList, pilList, conv] = await Promise.all([
        apiService.getHistoricoBaldeio(),
        apiService.getCaminhoesBaldeio(),
        apiService.getTalhoes(),
        apiService.getPilhas(),
        apiService.getConversaoSrTorasVigente(),
      ])
      setRegistros(histList)
      setCaminhoes(camList)
      setTalhoes(talList)
      setPilhas(pilList)
      setConversaoVigente(conv)
    } catch (err) {
      console.error(err)
      toast.error('Erro ao carregar histórico de baldeio')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Cálculo de volume m³ em tempo real
  const fatorConversao = conversaoVigente?.fator_m3_sr || 0.84
  const volumeM3Estimado =
    volumeSr !== '' ? Number((Number(volumeSr) * fatorConversao).toFixed(2)) : 0

  const handleOpenCreate = () => {
    setEditingItem(null)
    setCaminhaoBaldeioId(caminhoes[0]?.id || '')
    setTalhaoOrigemId(talhoes[0]?.id || '')
    setPilhaDestinoId(pilhas[0]?.id || '')
    setDataHoraSaida(new Date().toISOString().slice(0, 16))
    setDataHoraChegada('')
    setVolumeSr(40)
    setMotorista('')
    setNumeroViagem(`VG-${String(registros.length + 1).padStart(3, '0')}`)
    setStatusBaldeio('em_transito')
    setModalOpen(true)
  }

  const handleOpenEdit = (item: HistoricoBaldeio) => {
    setEditingItem(item)
    setCaminhaoBaldeioId(item.caminhao_baldeio_id)
    setTalhaoOrigemId(item.talhao_origem_id)
    setPilhaDestinoId(item.pilha_destino_id)
    setDataHoraSaida(item.data_hora_saida)
    setDataHoraChegada(item.data_hora_chegada || '')
    setVolumeSr(item.volume_sr)
    setMotorista(item.motorista || '')
    setNumeroViagem(item.numero_viagem || '')
    setStatusBaldeio(item.status_baldeio)
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!caminhaoBaldeioId || !talhaoOrigemId || !pilhaDestinoId || volumeSr === '') {
      toast.error(
        'Preencha os campos obrigatórios (veículo, talhão de origem, pilha de destino e volume SR).',
      )
      return
    }

    setSaving(true)
    try {
      const payload: Partial<HistoricoBaldeio> = {
        conversao_sr_id: conversaoVigente?.id,
        caminhao_baldeio_id: caminhaoBaldeioId,
        talhao_origem_id: talhaoOrigemId,
        pilha_destino_id: pilhaDestinoId,
        data_hora_saida: dataHoraSaida,
        data_hora_chegada: dataHoraChegada || undefined,
        volume_sr: Number(volumeSr),
        volume_m3_estimado: volumeM3Estimado,
        motorista: motorista.trim(),
        numero_viagem: numeroViagem.trim(),
        status_baldeio: statusBaldeio,
      }

      if (editingItem) {
        await apiService.updateHistoricoBaldeio(editingItem.id, payload)
        toast.success('Movimentação de baldeio atualizada')
      } else {
        await apiService.createHistoricoBaldeio(payload)
        toast.success('Saída do talhão registrada com sucesso')
      }

      setModalOpen(false)
      loadData()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Erro ao salvar registro de baldeio')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!itemToDelete) return
    try {
      await apiService.deleteHistoricoBaldeio(itemToDelete.id)
      toast.success('Registro de baldeio excluído')
      setDeleteDialogOpen(false)
      setItemToDelete(null)
      loadData()
    } catch (err: any) {
      console.error(err)
      toast.error('Erro ao excluir registro')
    }
  }

  const filtered = registros.filter((r) => {
    const cam = r.expand?.caminhao_baldeio_id?.placa_baldeio || ''
    const tal = r.expand?.talhao_origem_id?.talhao || ''
    const pil = r.expand?.pilha_destino_id?.codigo || ''
    const num = r.numero_viagem || ''
    const ord = r.ordem || ''
    return (
      cam.toLowerCase().includes(search.toLowerCase()) ||
      tal.toLowerCase().includes(search.toLowerCase()) ||
      pil.toLowerCase().includes(search.toLowerCase()) ||
      num.toLowerCase().includes(search.toLowerCase()) ||
      ord.toLowerCase().includes(search.toLowerCase())
    )
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A2E1A] flex items-center gap-2">
            <ArrowRightLeft className="w-6 h-6 text-[#1565C0]" />
            Histórico de Baldeio (Ponto de Saída do Talhão)
          </h1>
          <p className="text-sm text-[#5A6D5A]">
            Rastreamento de saída de madeira do talhão com volume em SR_Toras, destino no pátio e
            viagem.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-[#1B5E20] hover:bg-[#14521A] text-white">
          <Plus className="w-4 h-4 mr-2" />
          Nova Saída (Baldeio)
        </Button>
      </div>

      <Card className="border-[#DDE4DE] shadow-xs">
        <CardHeader className="p-4 border-b border-[#DDE4DE] bg-neutral-50/50">
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5A6D5A]" />
              <Input
                placeholder="Buscar viagem, veículo, talhão ou pilha..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 border-[#DDE4DE] text-xs"
              />
            </div>
            <span className="text-xs text-[#5A6D5A]">
              Total: <strong>{filtered.length}</strong> saídas registradas
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-[#5A6D5A] gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#1B5E20]" />
              <span className="text-xs">Carregando baldeios...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-[#5A6D5A] text-xs">
              Nenhuma movimentação de baldeio registrada.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F7F5] border-b border-[#DDE4DE] text-[#5A6D5A] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Viagem</th>
                  <th className="py-3 px-4">Ordem</th>
                  <th className="py-3 px-4">Veículo Baldeio</th>
                  <th className="py-3 px-4 text-right">Horímetro</th>
                  <th className="py-3 px-4 text-right">Litragem</th>
                  <th className="py-3 px-4">Status Operação</th>
                  <th className="py-3 px-4">Origem (Talhão)</th>
                  <th className="py-3 px-4">Destino (Pilha)</th>
                  <th className="py-3 px-4 text-right">Volume SR</th>
                  <th className="py-3 px-4 text-right">Volume m³ (Est.)</th>
                  <th className="py-3 px-4">Saída / Chegada</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE4DE]">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#1565C0]">
                      {item.numero_viagem || '-'}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs font-semibold text-[#1A2E1A]">
                      {item.ordem || '-'}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-[#1A2E1A]">
                      {item.expand?.caminhao_baldeio_id?.placa_baldeio || 'Veículo'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      {formatHorimetro(item.horimetro)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">{formatLitros(item)}</td>
                    <td className="py-3 px-4 text-[#5A6D5A]">{formatStatusOperacao(item)}</td>
                    <td className="py-3 px-4 text-[#1B5E20] font-semibold">
                      {item.expand?.talhao_origem_id?.talhao || '-'}
                    </td>
                    <td className="py-3 px-4 font-mono text-[#1A2E1A]">
                      {item.expand?.pilha_destino_id?.codigo || '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#1A2E1A]">
                      {item.volume_sr.toFixed(1)} SR
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[#5A6D5A]">
                      {item.volume_m3_estimado ? `${item.volume_m3_estimado.toFixed(2)} m³` : '-'}
                    </td>
                    <td className="py-3 px-4 text-[#5A6D5A]">
                      <div>{item.data_hora_saida.replace('T', ' ')}</div>
                      {item.data_hora_chegada && (
                        <div className="text-[10px] text-emerald-700">
                          Chegada: {item.data_hora_chegada.replace('T', ' ')}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge
                        variant="outline"
                        className={
                          item.status_baldeio === 'concluido'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : item.status_baldeio === 'em_transito'
                              ? 'bg-blue-50 text-blue-700 border-blue-300'
                              : 'bg-neutral-100 text-neutral-600 border-neutral-300'
                        }
                      >
                        {item.status_baldeio === 'concluido'
                          ? 'Concluído'
                          : item.status_baldeio === 'em_transito'
                            ? 'Em Trânsito'
                            : 'Cancelado'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(item)}
                          className="h-7 w-7 text-[#5A6D5A] hover:text-[#1B5E20]"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setItemToDelete(item)
                            setDeleteDialogOpen(true)
                          }}
                          className="h-7 w-7 text-[#5A6D5A] hover:text-[#C62828]"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* MODAL */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg text-[#1A2E1A]">
              {editingItem ? 'Editar Registro de Baldeio' : 'Nova Saída do Talhão (Baldeio)'}
            </DialogTitle>
            <DialogDescription className="text-xs text-[#5A6D5A]">
              Ponto de carregamento e saída de toras do talhão.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Número da Viagem</Label>
                <Input
                  placeholder="VG-001"
                  value={numeroViagem}
                  onChange={(e) => setNumeroViagem(e.target.value)}
                  className="h-9 font-mono uppercase"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Veículo de Baldeio *</Label>
                <Select value={caminhaoBaldeioId} onValueChange={setCaminhaoBaldeioId}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {caminhoes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.placa_baldeio} - {c.modelo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Origem (Talhão) *</Label>
                <Select value={talhaoOrigemId} onValueChange={setTalhaoOrigemId}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Talhão" />
                  </SelectTrigger>
                  <SelectContent>
                    {talhoes.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.talhao} ({t.especie || 'Talhão'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Destino (Pilha do Pátio) *</Label>
                <Select value={pilhaDestinoId} onValueChange={setPilhaDestinoId}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Pilha" />
                  </SelectTrigger>
                  <SelectContent>
                    {pilhas.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.codigo} {p.is_mista ? '(Mista)' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Data/Hora Saída *</Label>
                <Input
                  type="datetime-local"
                  value={dataHoraSaida}
                  onChange={(e) => setDataHoraSaida(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Data/Hora Chegada</Label>
                <Input
                  type="datetime-local"
                  value={dataHoraChegada}
                  onChange={(e) => setDataHoraChegada(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            {/* Volume SR e Conversão Estimada */}
            <div className="p-3 bg-neutral-50 rounded-lg border border-[#DDE4DE] space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-[#1A2E1A]">
                  Volume em SR (Sólido Real) *
                </Label>
                <span className="text-[11px] text-[#5A6D5A]">
                  Fator vigente: {fatorConversao} m³/SR
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 items-center">
                <Input
                  type="number"
                  step="0.1"
                  placeholder="40"
                  value={volumeSr}
                  onChange={(e) => setVolumeSr(e.target.value === '' ? '' : Number(e.target.value))}
                  className="h-9 font-mono font-bold"
                  required
                />
                <div className="text-xs font-mono bg-white p-2 rounded border border-[#DDE4DE] text-right">
                  ≈ <strong>{volumeM3Estimado.toFixed(2)}</strong> m³ estim.
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Motorista / Operador</Label>
                <Input
                  placeholder="Nome do motorista"
                  value={motorista}
                  onChange={(e) => setMotorista(e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Status da Viagem</Label>
                <Select value={statusBaldeio} onValueChange={(val: any) => setStatusBaldeio(val)}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="em_transito">Em Trânsito</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-[#1B5E20] hover:bg-[#14521A] text-white"
              >
                {saving && <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />}
                Registrar Saída
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#C62828]">
              Excluir Viagem de Baldeio?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Tem certeza que deseja excluir esta movimentação de baldeio?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-[#C62828] hover:bg-red-700 text-white"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
