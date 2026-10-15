import React, { useEffect, useState } from 'react'
import { apiService } from '@/services/florestalApi'
import { HistoricoPicador, Caminhao, Pilha, ConversaoSrCavaco } from '@/types/florestal'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Flame, Plus, Search, Edit2, Trash2, Loader2, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'

export default function HistoricoPicadorPage() {
  const { user } = useAuth()
  const [registros, setRegistros] = useState<HistoricoPicador[]>([])
  const [caminhoes, setCaminhoes] = useState<Caminhao[]>([])
  const [pilhas, setPilhas] = useState<Pilha[]>([])
  const [conversoesCavaco, setConversoesCavaco] = useState<ConversaoSrCavaco[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<HistoricoPicador | null>(null)
  const [editingItem, setEditingItem] = useState<HistoricoPicador | null>(null)
  const [saving, setSaving] = useState(false)

  // Form states
  const [caminhaoId, setCaminhaoId] = useState('')
  const [pilhaOrigemId, setPilhaOrigemId] = useState('')
  const [conversaoCavacoId, setConversaoCavacoId] = useState('')
  const [notaFiscal, setNotaFiscal] = useState('')
  const [dataHoraExpedicao, setDataHoraExpedicao] = useState(new Date().toISOString().slice(0, 16))
  const [volumeCavacoM3, setVolumeCavacoM3] = useState<number | ''>('')
  const [pesoCavacoT, setPesoCavacoT] = useState<number | ''>('')
  const [volumeToraConsumidoM3, setVolumeToraConsumidoM3] = useState<number | ''>('')
  const [cliente, setCliente] = useState('')
  const [umidadePerc, setUmidadePerc] = useState<number | ''>('')
  const [operadorNome, setOperadorNome] = useState(user?.name || '')

  const loadData = async () => {
    setLoading(true)
    try {
      const [histList, camList, pilList, convList] = await Promise.all([
        apiService.getHistoricoPicador(),
        apiService.getCaminhoes(),
        apiService.getPilhas(),
        apiService.getConversoesSrCavaco(),
      ])
      setRegistros(histList)
      setCaminhoes(camList)
      setPilhas(pilList)
      setConversoesCavaco(convList)
    } catch (err) {
      console.error(err)
      toast.error('Erro ao carregar histórico do picador')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenCreate = () => {
    setEditingItem(null)
    setCaminhaoId(caminhoes[0]?.id || '')
    setPilhaOrigemId(pilhas[0]?.id || '')
    setConversaoCavacoId(conversoesCavaco[0]?.id || '')
    setNotaFiscal('')
    setDataHoraExpedicao(new Date().toISOString().slice(0, 16))
    setVolumeCavacoM3(90)
    setPesoCavacoT(28.8)
    setVolumeToraConsumidoM3(36.0) // Redução de densidade empírica ~2.5x volume solto
    setCliente('Klabin S.A. / Berneck')
    setUmidadePerc(42)
    setOperadorNome(user?.name || '')
    setModalOpen(true)
  }

  const handleOpenEdit = (item: HistoricoPicador) => {
    setEditingItem(item)
    setCaminhaoId(item.caminhao_id)
    setPilhaOrigemId(item.pilha_origem_id)
    setConversaoCavacoId(item.conversao_cavaco_id || '')
    setNotaFiscal(item.nota_fiscal)
    setDataHoraExpedicao(item.data_hora_expedicao)
    setVolumeCavacoM3(item.volume_cavaco_m3)
    setPesoCavacoT(item.peso_cavaco_t ?? '')
    setVolumeToraConsumidoM3(item.volume_tora_consumido_m3)
    setCliente(item.cliente || '')
    setUmidadePerc(item.umidade_perc ?? '')
    setOperadorNome(item.operador_nome || '')
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (
      !caminhaoId ||
      !pilhaOrigemId ||
      !notaFiscal.trim() ||
      volumeCavacoM3 === '' ||
      volumeToraConsumidoM3 === ''
    ) {
      toast.error(
        'Preencha os campos obrigatórios (Caminhão, Pilha de Origem, Nota Fiscal e Volumes).',
      )
      return
    }

    setSaving(true)
    try {
      const payload: Partial<HistoricoPicador> = {
        conversao_cavaco_id: conversaoCavacoId || undefined,
        caminhao_id: caminhaoId,
        pilha_origem_id: pilhaOrigemId,
        nota_fiscal: notaFiscal.trim().toUpperCase(),
        data_hora_expedicao: dataHoraExpedicao,
        volume_cavaco_m3: Number(volumeCavacoM3),
        peso_cavaco_t: pesoCavacoT === '' ? undefined : Number(pesoCavacoT),
        volume_tora_consumido_m3: Number(volumeToraConsumidoM3),
        cliente: cliente.trim(),
        umidade_perc: umidadePerc === '' ? undefined : Number(umidadePerc),
        operador_nome: operadorNome.trim() || user?.name || 'Operador',
      }

      if (editingItem) {
        await apiService.updateHistoricoPicador(editingItem.id, payload)
        toast.success('Expedição de cavaco atualizada')
      } else {
        await apiService.createHistoricoPicador(payload)
        toast.success('Expedição registrada com sucesso! Saída de toras computada na pilha.')
      }

      setModalOpen(false)
      loadData()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Erro ao registrar expedição (Nota Fiscal já existente?)')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!itemToDelete) return
    try {
      await apiService.deleteHistoricoPicador(itemToDelete.id)
      toast.success('Registro de expedição excluído')
      setDeleteDialogOpen(false)
      setItemToDelete(null)
      loadData()
    } catch (err: any) {
      console.error(err)
      toast.error('Erro ao excluir registro')
    }
  }

  const filtered = registros.filter((r) => {
    const cam = r.expand?.caminhao_id?.placa || ''
    const pil = r.expand?.pilha_origem_id?.codigo || ''
    const nf = r.nota_fiscal || ''
    const cli = r.cliente || ''
    return (
      cam.toLowerCase().includes(search.toLowerCase()) ||
      pil.toLowerCase().includes(search.toLowerCase()) ||
      nf.toLowerCase().includes(search.toLowerCase()) ||
      cli.toLowerCase().includes(search.toLowerCase())
    )
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A2E1A] flex items-center gap-2">
            <Flame className="w-6 h-6 text-[#FF8F00]" />
            Consumo no Picador & Expedição de Cavaco
          </h1>
          <p className="text-sm text-[#5A6D5A]">
            Ponto de consumo e expedição final: baixa de toras na pilha e saída comercial com Nota
            Fiscal Única.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-[#1B5E20] hover:bg-[#14521A] text-white">
          <Plus className="w-4 h-4 mr-2" />
          Nova Expedição / Picagem
        </Button>
      </div>

      <Card className="border-[#DDE4DE] shadow-xs">
        <CardHeader className="p-4 border-b border-[#DDE4DE] bg-neutral-50/50">
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5A6D5A]" />
              <Input
                placeholder="Buscar NF, placa, pilha ou cliente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 border-[#DDE4DE] text-xs"
              />
            </div>
            <span className="text-xs text-[#5A6D5A]">
              Total: <strong>{filtered.length}</strong> expedições
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-[#5A6D5A] gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#1B5E20]" />
              <span className="text-xs">Carregando expedições...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-[#5A6D5A] text-xs">
              Nenhuma expedição do picador registrada.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F7F5] border-b border-[#DDE4DE] text-[#5A6D5A] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Nota Fiscal</th>
                  <th className="py-3 px-4">Data/Hora</th>
                  <th className="py-3 px-4">Caminhão / Placa</th>
                  <th className="py-3 px-4">Pilha Origem</th>
                  <th className="py-3 px-4 text-right">Cavaco (m³)</th>
                  <th className="py-3 px-4 text-right">Peso Cavaco (t)</th>
                  <th className="py-3 px-4 text-right">Tora Consumida (m³)</th>
                  <th className="py-3 px-4">Cliente Destino</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE4DE]">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#1B5E20] flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#5A6D5A]" />
                      {item.nota_fiscal}
                    </td>
                    <td className="py-3 px-4 font-mono text-[#5A6D5A]">
                      {item.data_hora_expedicao.replace('T', ' ')}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-[#1A2E1A]">
                      {item.expand?.caminhao_id?.placa || '-'}
                    </td>
                    <td className="py-3 px-4 font-mono text-[#1A2E1A]">
                      {item.expand?.pilha_origem_id?.codigo || '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#FF8F00]">
                      {item.volume_cavaco_m3.toFixed(1)} m³
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[#5A6D5A]">
                      {item.peso_cavaco_t ? `${item.peso_cavaco_t.toFixed(1)} t` : '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#C62828]">
                      -{item.volume_tora_consumido_m3.toFixed(2)} m³
                    </td>
                    <td className="py-3 px-4 text-[#1A2E1A] font-medium">{item.cliente || '-'}</td>
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
              {editingItem ? 'Editar Expedição' : 'Nova Expedição de Cavaco / Picador'}
            </DialogTitle>
            <DialogDescription className="text-xs text-[#5A6D5A]">
              Bloqueio automático de Nota Fiscal duplicada no sistema.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Nota Fiscal (Única) *</Label>
                <Input
                  placeholder="NF-001248"
                  value={notaFiscal}
                  onChange={(e) => setNotaFiscal(e.target.value)}
                  className="h-9 font-mono uppercase font-bold"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Data/Hora Expedição *</Label>
                <Input
                  type="datetime-local"
                  value={dataHoraExpedicao}
                  onChange={(e) => setDataHoraExpedicao(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Caminhão Rodoviário *</Label>
                <Select value={caminhaoId} onValueChange={setCaminhaoId}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {caminhoes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.placa} ({c.capacidade_m3 ? `${c.capacidade_m3}m³` : c.modelo})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Pilha de Origem das Toras *</Label>
                <Select value={pilhaOrigemId} onValueChange={setPilhaOrigemId}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {pilhas.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.codigo} - Saldo:{' '}
                        {p.volume_atual_m3 ? `${p.volume_atual_m3.toFixed(1)}m³` : '0m³'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Volume Cavaco e Volume Tora Consumido */}
            <div className="p-3 bg-neutral-50 rounded-lg border border-[#DDE4DE] space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-[#1A2E1A]">
                    Volume Cavaco (m³) *
                  </Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="90"
                    value={volumeCavacoM3}
                    onChange={(e) =>
                      setVolumeCavacoM3(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    className="h-9 font-mono font-bold text-[#FF8F00]"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-[#1A2E1A]">
                    Tora Consumida (m³) *
                  </Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="36.0"
                    value={volumeToraConsumidoM3}
                    onChange={(e) =>
                      setVolumeToraConsumidoM3(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    className="h-9 font-mono font-bold text-[#C62828]"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px]">Peso Cavaco (t)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="28.8"
                    value={pesoCavacoT}
                    onChange={(e) =>
                      setPesoCavacoT(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    className="h-9 font-mono text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px]">Umidade (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="42"
                    value={umidadePerc}
                    onChange={(e) =>
                      setUmidadePerc(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    className="h-9 font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Cliente / Destino</Label>
                <Input
                  placeholder="Ex: Klabin S.A. / BRF"
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Operador Responsável</Label>
                <Input
                  placeholder="Nome do operador"
                  value={operadorNome}
                  onChange={(e) => setOperadorNome(e.target.value)}
                  className="h-9"
                />
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
                Registrar Expedição
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#C62828]">Excluir Expedição?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Tem certeza que deseja excluir o registro da NF{' '}
              <strong>{itemToDelete?.nota_fiscal}</strong>?
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
