import React, { useEffect, useState } from 'react'
import { apiService } from '@/services/florestalApi'
import { HistoricoFeller, Talhao, Maquina } from '@/types/florestal'
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
import { Clock, Plus, Search, Edit2, Trash2, Loader2, Fuel, Trees } from 'lucide-react'
import { toast } from 'sonner'
import {
  formatHorimetro,
  formatLitros,
  formatStatusOperacao,
} from '@/lib/historicoOperacional'

export default function HistoricoFellerPage() {
  const [registros, setRegistros] = useState<HistoricoFeller[]>([])
  const [talhoes, setTalhoes] = useState<Talhao[]>([])
  const [maquinas, setMaquinas] = useState<Maquina[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<HistoricoFeller | null>(null)
  const [editingItem, setEditingItem] = useState<HistoricoFeller | null>(null)
  const [saving, setSaving] = useState(false)

  // Form states
  const [talhaoId, setTalhaoId] = useState('')
  const [maquinaId, setMaquinaId] = useState('')
  const [dataOperacao, setDataOperacao] = useState(new Date().toISOString().split('T')[0])
  const [horas, setHoras] = useState<number | ''>('')
  const [combustivel, setCombustivel] = useState<number | ''>('')
  const [arvores, setArvores] = useState<number | ''>('')
  const [obs, setObs] = useState('')

  const loadData = async () => {
    setLoading(true)
    try {
      const [histList, talList, maqList] = await Promise.all([
        apiService.getHistoricoFeller(),
        apiService.getTalhoes(),
        apiService.getMaquinas(),
      ])
      setRegistros(histList)
      setTalhoes(talList)
      setMaquinas(maqList.filter((m) => m.tipo === 'feller' || m.tipo === 'outros'))
    } catch (err) {
      console.error(err)
      toast.error('Erro ao carregar histórico do feller')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenCreate = () => {
    setEditingItem(null)
    setTalhaoId(talhoes[0]?.id || '')
    setMaquinaId(maquinas[0]?.id || '')
    setDataOperacao(new Date().toISOString().split('T')[0])
    setHoras(8)
    setCombustivel(180)
    setArvores('')
    setObs('')
    setModalOpen(true)
  }

  const handleOpenEdit = (item: HistoricoFeller) => {
    setEditingItem(item)
    setTalhaoId(item.talhao_id)
    setMaquinaId(item.maquina_id)
    setDataOperacao(item.data_operacao)
    setHoras(item.horas_trabalhadas)
    setCombustivel(item.combustivel_litros)
    setArvores(item.arvores_derrubadas ?? '')
    setObs(item.observacoes || '')
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!talhaoId || !maquinaId || horas === '' || combustivel === '') {
      toast.error('Preencha os campos obrigatórios (talhão, máquina, horas e combustível).')
      return
    }

    setSaving(true)
    try {
      const payload: Partial<HistoricoFeller> = {
        talhao_id: talhaoId,
        maquina_id: maquinaId,
        data_operacao: dataOperacao,
        horas_trabalhadas: Number(horas),
        combustivel_litros: Number(combustivel),
        arvores_derrubadas: arvores === '' ? undefined : Number(arvores),
        observacoes: obs.trim(),
      }

      if (editingItem) {
        await apiService.updateHistoricoFeller(editingItem.id, payload)
        toast.success('Apontamento de Feller atualizado')
      } else {
        await apiService.createHistoricoFeller(payload)
        toast.success('Apontamento de Feller registrado com sucesso')
      }

      setModalOpen(false)
      loadData()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Erro ao registrar apontamento')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!itemToDelete) return
    try {
      await apiService.deleteHistoricoFeller(itemToDelete.id)
      toast.success('Registro excluído')
      setDeleteDialogOpen(false)
      setItemToDelete(null)
      loadData()
    } catch (err: any) {
      console.error(err)
      toast.error('Erro ao excluir registro')
    }
  }

  const filtered = registros.filter((r) => {
    const maq = r.expand?.maquina_id?.id_maquina || ''
    const tal = r.expand?.talhao_id?.talhao || ''
    return (
      maq.toLowerCase().includes(search.toLowerCase()) ||
      tal.toLowerCase().includes(search.toLowerCase()) ||
      r.data_operacao.includes(search)
    )
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A2E1A] flex items-center gap-2">
            <Clock className="w-6 h-6 text-[#1B5E20]" />
            Histórico Operacional — Feller Buncher
          </h1>
          <p className="text-sm text-[#5A6D5A]">
            Apontamento diário de horas trabalhadas, combustível (diesel) e árvores derrubadas por
            talhão.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-[#1B5E20] hover:bg-[#14521A] text-white">
          <Plus className="w-4 h-4 mr-2" />
          Novo Apontamento Feller
        </Button>
      </div>

      <Card className="border-[#DDE4DE] shadow-xs">
        <CardHeader className="p-4 border-b border-[#DDE4DE] bg-neutral-50/50">
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5A6D5A]" />
              <Input
                placeholder="Buscar data, máquina ou talhão..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 border-[#DDE4DE] text-xs"
              />
            </div>
            <span className="text-xs text-[#5A6D5A]">
              Total: <strong>{filtered.length}</strong> registros
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-[#5A6D5A] gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#1B5E20]" />
              <span className="text-xs">Carregando apontamentos...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-[#5A6D5A] text-xs">
              Nenhum apontamento do Feller registrado.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F7F5] border-b border-[#DDE4DE] text-[#5A6D5A] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Data Operação</th>
                  <th className="py-3 px-4">Talhão</th>
                  <th className="py-3 px-4">P. Ordens</th>
                  <th className="py-3 px-4 text-right">Horímetro</th>
                  <th className="py-3 px-4">Status Operação</th>
                  <th className="py-3 px-4 text-right">Horas Trab.</th>
                  <th className="py-3 px-4 text-right">Diesel (Litros)</th>
                  <th className="py-3 px-4 text-right">Consumo (L/h)</th>
                  <th className="py-3 px-4 text-right">Árvores</th>
                  <th className="py-3 px-4">Obs.</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE4DE]">
                {filtered.map((item) => {
                  const consumoLh =
                    item.horas_trabalhadas > 0
                      ? (item.combustivel_litros / item.horas_trabalhadas).toFixed(1)
                      : '-'
                  return (
                    <tr key={item.id} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-[#1A2E1A]">
                        {item.data_operacao}
                      </td>
                      <td className="py-3 px-4 font-bold text-[#1B5E20]">
                        {item.expand?.talhao_id?.talhao || 'Talhão'}
                      </td>
                      <td className="py-3 px-4 text-[#1A2E1A] font-medium">
                        {item.expand?.maquina_id?.p_ordens || '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono">
                        {formatHorimetro(item.horimetro)}
                      </td>
                      <td className="py-3 px-4 text-[#5A6D5A]">
                        {formatStatusOperacao(item)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-[#1A2E1A]">
                        {item.horas_trabalhadas.toFixed(1)} h
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[#1A2E1A]">
                        {formatLitros(item)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[#5A6D5A]">
                        {consumoLh} L/h
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[#1A2E1A]">
                        {item.arvores_derrubadas
                          ? item.arvores_derrubadas.toLocaleString('pt-BR')
                          : '-'}
                      </td>
                      <td className="py-3 px-4 text-[#5A6D5A] truncate max-w-[150px]">
                        {item.observacoes || '-'}
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
                  )
                })}
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
              {editingItem ? 'Editar Apontamento Feller' : 'Novo Apontamento — Feller Buncher'}
            </DialogTitle>
            <DialogDescription className="text-xs text-[#5A6D5A]">
              Registro de tempo e consumo de combustível da máquina.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Data da Operação *</Label>
                <Input
                  type="date"
                  value={dataOperacao}
                  onChange={(e) => setDataOperacao(e.target.value)}
                  className="h-9"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Talhão de Corte *</Label>
                <Select value={talhaoId} onValueChange={setTalhaoId}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Selecione o talhão" />
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
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Máquina Feller *</Label>
              <Select value={maquinaId} onValueChange={setMaquinaId}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Selecione a máquina" />
                </SelectTrigger>
                <SelectContent>
                  {maquinas.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.id_maquina} - {m.equipamento}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Horas Trabalhadas (h) *</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="8.5"
                  value={horas}
                  onChange={(e) => setHoras(e.target.value === '' ? '' : Number(e.target.value))}
                  className="h-9 font-mono"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Combustível (Litros) *</Label>
                <Input
                  type="number"
                  step="1"
                  placeholder="180"
                  value={combustivel}
                  onChange={(e) =>
                    setCombustivel(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="h-9 font-mono"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Árvores Derrubadas (Opcional)</Label>
              <Input
                type="number"
                placeholder="Ex: 850"
                value={arvores}
                onChange={(e) => setArvores(e.target.value === '' ? '' : Number(e.target.value))}
                className="h-9 font-mono"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Observações Operacionais</Label>
              <Input
                placeholder="Ex: Terreno com declive acentuado; troca de dente de serra"
                value={obs}
                onChange={(e) => setObs(e.target.value)}
                className="h-9"
              />
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
                Salvar Registro
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#C62828]">Excluir Registro?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Tem certeza que deseja excluir o apontamento selecionado?
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
