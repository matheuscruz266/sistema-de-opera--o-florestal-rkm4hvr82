import React, { useEffect, useState } from 'react'
import { apiService } from '@/services/florestalApi'
import { Motivo } from '@/types/florestal'
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
import { HelpCircle, Plus, Search, Edit2, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function MotivosPage() {
  const [motivos, setMotivos] = useState<Motivo[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<Motivo | null>(null)
  const [editingItem, setEditingItem] = useState<Motivo | null>(null)
  const [saving, setSaving] = useState(false)

  // Form states
  const [idMotivo, setIdMotivo] = useState('')
  const [equipamento, setEquipamento] = useState('')
  const [motivoTexto, setMotivoTexto] = useState('')
  const [categoria, setCategoria] = useState<Motivo['categoria']>('rejeicao_tora')
  const [status, setStatus] = useState<Motivo['status']>('ativo')

  const loadData = async () => {
    setLoading(true)
    try {
      const list = await apiService.getMotivos()
      setMotivos(list)
    } catch (err) {
      console.error(err)
      toast.error('Erro ao carregar motivos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenCreate = () => {
    setEditingItem(null)
    setIdMotivo(`MOT-0${motivos.length + 1}`)
    setEquipamento('Geral')
    setMotivoTexto('')
    setCategoria('rejeicao_tora')
    setStatus('ativo')
    setModalOpen(true)
  }

  const handleOpenEdit = (m: Motivo) => {
    setEditingItem(m)
    setIdMotivo(m.id_motivo)
    setEquipamento(m.equipamento || '')
    setMotivoTexto(m.motivo)
    setCategoria(m.categoria)
    setStatus(m.status)
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!idMotivo.trim() || !motivoTexto.trim()) {
      toast.error('ID do Motivo e Descrição são obrigatórios')
      return
    }

    setSaving(true)
    try {
      const payload: Partial<Motivo> = {
        id_motivo: idMotivo.trim().toUpperCase(),
        equipamento: equipamento.trim(),
        motivo: motivoTexto.trim(),
        categoria,
        status,
      }

      if (editingItem) {
        await apiService.updateMotivo(editingItem.id, payload)
        toast.success('Motivo atualizado')
      } else {
        await apiService.createMotivo(payload)
        toast.success('Motivo cadastrado')
      }

      setModalOpen(false)
      loadData()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Erro ao salvar motivo')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!itemToDelete) return
    try {
      await apiService.deleteMotivo(itemToDelete.id)
      toast.success('Motivo excluído')
      setDeleteDialogOpen(false)
      setItemToDelete(null)
      loadData()
    } catch (err: any) {
      console.error(err)
      toast.error('Erro ao excluir motivo')
    }
  }

  const filtered = motivos.filter(
    (m) =>
      m.id_motivo.toLowerCase().includes(search.toLowerCase()) ||
      m.motivo.toLowerCase().includes(search.toLowerCase()) ||
      (m.equipamento && m.equipamento.toLowerCase().includes(search.toLowerCase())),
  )

  const getCategoriaLabel = (cat: Motivo['categoria']) => {
    switch (cat) {
      case 'rejeicao_tora':
        return 'Rejeição de Tora'
      case 'recusa_cavaco':
        return 'Recusa de Cavaco'
      case 'parada_maquina':
        return 'Parada de Máquina'
      case 'divergencia_estoque':
        return 'Divergência de Estoque'
      default:
        return 'Outros'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A2E1A] flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-[#1B5E20]" />
            Motivos e Justificativas de Ocorrência
          </h1>
          <p className="text-sm text-[#5A6D5A]">
            Tabela padrão para rejeição de toras, recusa de cargas, paradas de equipamentos e
            divergências.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-[#1B5E20] hover:bg-[#14521A] text-white">
          <Plus className="w-4 h-4 mr-2" />
          Novo Motivo
        </Button>
      </div>

      <Card className="border-[#DDE4DE] shadow-xs">
        <CardHeader className="p-4 border-b border-[#DDE4DE] bg-neutral-50/50">
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5A6D5A]" />
              <Input
                placeholder="Buscar por ID ou descrição..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 border-[#DDE4DE] text-xs"
              />
            </div>
            <span className="text-xs text-[#5A6D5A]">
              Total: <strong>{filtered.length}</strong> motivos
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-[#5A6D5A] gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#1B5E20]" />
              <span className="text-xs">Carregando motivos...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-[#5A6D5A] text-xs">
              Nenhum motivo cadastrado.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F7F5] border-b border-[#DDE4DE] text-[#5A6D5A] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">ID Motivo</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4">Descrição do Motivo</th>
                  <th className="py-3 px-4">Equipamento / Aplicação</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE4DE]">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#1B5E20]">
                      {item.id_motivo}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant="outline"
                        className="text-[10px] font-medium border-[#DDE4DE] text-[#1A2E1A]"
                      >
                        {getCategoriaLabel(item.categoria)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-medium text-[#1A2E1A]">{item.motivo}</td>
                    <td className="py-3 px-4 text-[#5A6D5A]">{item.equipamento || '-'}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge
                        variant="outline"
                        className={
                          item.status === 'ativo'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : 'bg-neutral-100 text-neutral-600 border-neutral-300'
                        }
                      >
                        {item.status === 'ativo' ? 'Ativo' : 'Inativo'}
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
              {editingItem ? 'Editar Motivo' : 'Novo Motivo'}
            </DialogTitle>
            <DialogDescription className="text-xs text-[#5A6D5A]">
              Cadastre a justificativa operacional padronizada.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">ID do Motivo *</Label>
                <Input
                  placeholder="MOT-01"
                  value={idMotivo}
                  onChange={(e) => setIdMotivo(e.target.value)}
                  className="h-9 font-mono uppercase font-bold"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Categoria</Label>
                <Select value={categoria} onValueChange={(val: any) => setCategoria(val)}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rejeicao_tora">Rejeição de Tora</SelectItem>
                    <SelectItem value="recusa_cavaco">Recusa de Cavaco</SelectItem>
                    <SelectItem value="parada_maquina">Parada de Máquina</SelectItem>
                    <SelectItem value="divergencia_estoque">Divergência de Estoque</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Descrição do Motivo *</Label>
              <Input
                placeholder="Ex: Diâmetro fora de padrão comercial (< 10cm)"
                value={motivoTexto}
                onChange={(e) => setMotivoTexto(e.target.value)}
                className="h-9"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Equipamento / Aplicação</Label>
                <Input
                  placeholder="Ex: Geral / Feller / Pátio"
                  value={equipamento}
                  onChange={(e) => setEquipamento(e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Status</Label>
                <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
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
                Salvar Motivo
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#C62828]">Excluir Motivo?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Tem certeza que deseja remover o motivo <strong>{itemToDelete?.motivo}</strong>?
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
