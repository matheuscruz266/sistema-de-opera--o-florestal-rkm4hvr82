import React, { useEffect, useState } from 'react'
import { apiService } from '@/services/florestalApi'
import { CaminhaoBaldeio } from '@/types/florestal'
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
import { Truck, Plus, Search, Edit2, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function CaminhaoBaldeioPage() {
  const [caminhoes, setCaminhoes] = useState<CaminhaoBaldeio[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<CaminhaoBaldeio | null>(null)
  const [editingItem, setEditingItem] = useState<CaminhaoBaldeio | null>(null)
  const [saving, setSaving] = useState(false)

  // Form states
  const [placa, setPlaca] = useState('')
  const [modelo, setModelo] = useState('')
  const [capacidadeM3, setCapacidadeM3] = useState<number | ''>('')
  const [tipoCarreta, setTipoCarreta] = useState('')
  const [status, setStatus] = useState<CaminhaoBaldeio['status']>('ativo')

  const loadData = async () => {
    setLoading(true)
    try {
      const list = await apiService.getCaminhoesBaldeio()
      setCaminhoes(list)
    } catch (err) {
      console.error(err)
      toast.error('Erro ao carregar caminhões de baldeio')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenCreate = () => {
    setEditingItem(null)
    setPlaca('')
    setModelo('')
    setCapacidadeM3(35)
    setTipoCarreta('Transbordo Florestal / Forwarder')
    setStatus('ativo')
    setModalOpen(true)
  }

  const handleOpenEdit = (c: CaminhaoBaldeio) => {
    setEditingItem(c)
    setPlaca(c.placa_baldeio)
    setModelo(c.modelo)
    setCapacidadeM3(c.capacidade_m3 ?? '')
    setTipoCarreta(c.tipo_carreta || '')
    setStatus(c.status)
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const placaClean = placa.trim().toUpperCase()
    if (!placaClean) {
      toast.error('A identificação/placa de baldeio é obrigatória.')
      return
    }
    if (!modelo.trim()) {
      toast.error('O modelo é obrigatório.')
      return
    }

    setSaving(true)
    try {
      const payload: Partial<CaminhaoBaldeio> = {
        placa_baldeio: placaClean,
        modelo: modelo.trim(),
        capacidade_m3: capacidadeM3 === '' ? 0 : Number(capacidadeM3),
        tipo_carreta: tipoCarreta.trim(),
        status,
      }

      if (editingItem) {
        await apiService.updateCaminhaoBaldeio(editingItem.id, payload)
        toast.success('Caminhão de baldeio atualizado')
      } else {
        await apiService.createCaminhaoBaldeio(payload)
        toast.success('Caminhão de baldeio cadastrado')
      }

      setModalOpen(false)
      loadData()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Erro ao salvar (identificador já existente?)')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!itemToDelete) return
    try {
      await apiService.deleteCaminhaoBaldeio(itemToDelete.id)
      toast.success('Veículo de baldeio excluído')
      setDeleteDialogOpen(false)
      setItemToDelete(null)
      loadData()
    } catch (err: any) {
      console.error(err)
      toast.error('Erro ao excluir veículo de baldeio')
    }
  }

  const filtered = caminhoes.filter(
    (c) =>
      c.placa_baldeio.toLowerCase().includes(search.toLowerCase()) ||
      c.modelo.toLowerCase().includes(search.toLowerCase()) ||
      (c.tipo_carreta && c.tipo_carreta.toLowerCase().includes(search.toLowerCase())),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A2E1A] flex items-center gap-2">
            <Truck className="w-6 h-6 text-[#1565C0]" />
            Caminhões e Transbordos de Baldeio
          </h1>
          <p className="text-sm text-[#5A6D5A]">
            Veículos operacionais dedicados ao transporte interno (Talhão → Pátio de Madeira).
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-[#1B5E20] hover:bg-[#14521A] text-white">
          <Plus className="w-4 h-4 mr-2" />
          Novo Baldeio
        </Button>
      </div>

      <Card className="border-[#DDE4DE] shadow-xs">
        <CardHeader className="p-4 border-b border-[#DDE4DE] bg-neutral-50/50">
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5A6D5A]" />
              <Input
                placeholder="Buscar por placa ou modelo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 border-[#DDE4DE] text-xs"
              />
            </div>
            <span className="text-xs text-[#5A6D5A]">
              Total: <strong>{filtered.length}</strong> veículos de baldeio
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
              Nenhum veículo de baldeio cadastrado.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F7F5] border-b border-[#DDE4DE] text-[#5A6D5A] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Placa / ID Baldeio</th>
                  <th className="py-3 px-4">Modelo</th>
                  <th className="py-3 px-4 text-right">Capacidade (m³)</th>
                  <th className="py-3 px-4">Tipo de Implemento</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE4DE]">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#1565C0] text-sm">
                      {item.placa_baldeio}
                    </td>
                    <td className="py-3 px-4 font-medium text-[#1A2E1A]">{item.modelo}</td>
                    <td className="py-3 px-4 text-right font-mono text-[#1A2E1A]">
                      {item.capacidade_m3 ? `${item.capacidade_m3} m³` : '-'}
                    </td>
                    <td className="py-3 px-4 text-[#5A6D5A]">{item.tipo_carreta || '-'}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge
                        variant="outline"
                        className={
                          item.status === 'ativo'
                            ? 'bg-blue-50 text-blue-700 border-blue-300'
                            : 'bg-neutral-100 text-neutral-600 border-neutral-300'
                        }
                      >
                        {item.status === 'ativo'
                          ? 'Ativo'
                          : item.status === 'manutencao'
                            ? 'Manutenção'
                            : 'Inativo'}
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
              {editingItem ? 'Editar Veículo de Baldeio' : 'Novo Veículo de Baldeio'}
            </DialogTitle>
            <DialogDescription className="text-xs text-[#5A6D5A]">
              Identificação do caminhão ou trator de baldeio de campo.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Placa / Prefixo Único *</Label>
                <Input
                  placeholder="BAL-01 / ABC1D23"
                  value={placa}
                  onChange={(e) => setPlaca(e.target.value)}
                  className="h-9 font-mono uppercase font-bold"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Capacidade (m³)</Label>
                <Input
                  type="number"
                  placeholder="35"
                  value={capacidadeM3}
                  onChange={(e) =>
                    setCapacidadeM3(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="h-9 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Modelo do Veículo *</Label>
              <Input
                placeholder="Ex: Forwarder Ponsse / Transbordo Massey"
                value={modelo}
                onChange={(e) => setModelo(e.target.value)}
                className="h-9"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Tipo de Carreta / Implemento</Label>
              <Input
                placeholder="Ex: Bitrem Florestal / Reboque Cavaqueiro"
                value={tipoCarreta}
                onChange={(e) => setTipoCarreta(e.target.value)}
                className="h-9"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Status Operacional</Label>
              <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="manutencao">Manutenção</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
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
                Salvar Baldeio
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#C62828]">Excluir Veículo?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Deseja remover o registro <strong>{itemToDelete?.placa_baldeio}</strong>?
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
