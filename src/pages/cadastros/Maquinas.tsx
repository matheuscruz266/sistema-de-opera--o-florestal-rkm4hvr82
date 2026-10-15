import React, { useEffect, useState } from 'react'
import { apiService } from '@/services/florestalApi'
import { Maquina, Fazenda } from '@/types/florestal'
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
import { Tractor, Plus, Search, Edit2, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'

export default function MaquinasPage() {
  const { fazendaAtiva } = useAuth()
  const [maquinas, setMaquinas] = useState<Maquina[]>([])
  const [fazendas, setFazendas] = useState<Fazenda[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<Maquina | null>(null)
  const [editingItem, setEditingItem] = useState<Maquina | null>(null)
  const [saving, setSaving] = useState(false)

  // Form states
  const [idMaquina, setIdMaquina] = useState('')
  const [equipamento, setEquipamento] = useState('')
  const [tipo, setTipo] = useState<Maquina['tipo']>('feller')
  const [bt, setBt] = useState('')
  const [usuarioResp, setUsuarioResp] = useState('')
  const [fazendaId, setFazendaId] = useState('')
  const [status, setStatus] = useState<Maquina['status']>('ativa')

  const loadData = async () => {
    setLoading(true)
    try {
      const [maqList, fazList] = await Promise.all([
        apiService.getMaquinas(),
        apiService.getFazendas(),
      ])
      setMaquinas(maqList)
      setFazendas(fazList)
    } catch (err) {
      console.error(err)
      toast.error('Erro ao carregar máquinas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenCreate = () => {
    setEditingItem(null)
    setIdMaquina('')
    setEquipamento('')
    setTipo('feller')
    setBt('')
    setUsuarioResp('')
    setFazendaId(fazendaAtiva ? fazendaAtiva.id : fazendas[0]?.id || '')
    setStatus('ativa')
    setModalOpen(true)
  }

  const handleOpenEdit = (m: Maquina) => {
    setEditingItem(m)
    setIdMaquina(m.id_maquina)
    setEquipamento(m.equipamento)
    setTipo(m.tipo)
    setBt(m.bt || '')
    setUsuarioResp(m.usuario_responsavel || '')
    setFazendaId(m.fazenda_id || '')
    setStatus(m.status)
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!idMaquina.trim() || !equipamento.trim()) {
      toast.error('ID Máquina e Equipamento são obrigatórios')
      return
    }

    setSaving(true)
    try {
      const payload: Partial<Maquina> = {
        id_maquina: idMaquina.trim().toUpperCase(),
        equipamento: equipamento.trim(),
        tipo,
        bt: bt.trim(),
        usuario_responsavel: usuarioResp.trim(),
        fazenda_id: fazendaId || undefined,
        status,
      }

      if (editingItem) {
        await apiService.updateMaquina(editingItem.id, payload)
        toast.success('Máquina atualizada')
      } else {
        await apiService.createMaquina(payload)
        toast.success('Máquina cadastrada')
      }

      setModalOpen(false)
      loadData()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Erro ao salvar máquina')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!itemToDelete) return
    try {
      await apiService.deleteMaquina(itemToDelete.id)
      toast.success('Máquina excluída')
      setDeleteDialogOpen(false)
      setItemToDelete(null)
      loadData()
    } catch (err: any) {
      console.error(err)
      toast.error('Erro ao excluir máquina')
    }
  }

  const filtered = maquinas.filter(
    (m) =>
      m.id_maquina.toLowerCase().includes(search.toLowerCase()) ||
      m.equipamento.toLowerCase().includes(search.toLowerCase()) ||
      (m.bt && m.bt.toLowerCase().includes(search.toLowerCase())) ||
      (m.usuario_responsavel && m.usuario_responsavel.toLowerCase().includes(search.toLowerCase())),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A2E1A] flex items-center gap-2">
            <Tractor className="w-6 h-6 text-[#1B5E20]" />
            Cadastro de Máquinas
          </h1>
          <p className="text-sm text-[#5A6D5A]">
            Controle de Fellers, Skidders, Picadores e Colhedoras florestais.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-[#1B5E20] hover:bg-[#14521A] text-white">
          <Plus className="w-4 h-4 mr-2" />
          Nova Máquina
        </Button>
      </div>

      <Card className="border-[#DDE4DE] shadow-xs">
        <CardHeader className="p-4 border-b border-[#DDE4DE] bg-neutral-50/50">
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5A6D5A]" />
              <Input
                placeholder="Buscar por ID, equipamento, BT..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 border-[#DDE4DE] text-xs"
              />
            </div>
            <span className="text-xs text-[#5A6D5A]">
              Total: <strong>{filtered.length}</strong> máquinas
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-[#5A6D5A] gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#1B5E20]" />
              <span className="text-xs">Carregando máquinas...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-[#5A6D5A] text-xs">
              Nenhuma máquina encontrada.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F7F5] border-b border-[#DDE4DE] text-[#5A6D5A] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">ID Máquina</th>
                  <th className="py-3 px-4">Equipamento</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">BT</th>
                  <th className="py-3 px-4">Operador / Resp.</th>
                  <th className="py-3 px-4">Fazenda</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE4DE]">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#1B5E20]">
                      {item.id_maquina}
                    </td>
                    <td className="py-3 px-4 font-medium text-[#1A2E1A]">{item.equipamento}</td>
                    <td className="py-3 px-4 uppercase text-[11px] font-semibold text-[#5A6D5A]">
                      {item.tipo}
                    </td>
                    <td className="py-3 px-4 font-mono text-[#5A6D5A]">{item.bt || '-'}</td>
                    <td className="py-3 px-4 text-[#1A2E1A]">{item.usuario_responsavel || '-'}</td>
                    <td className="py-3 px-4 text-[#5A6D5A]">
                      {item.expand?.fazenda_id?.nome || '-'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge
                        variant="outline"
                        className={
                          item.status === 'ativa'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : item.status === 'manutencao'
                              ? 'bg-amber-50 text-amber-700 border-amber-300'
                              : 'bg-neutral-100 text-neutral-600 border-neutral-300'
                        }
                      >
                        {item.status === 'ativa'
                          ? 'Ativa'
                          : item.status === 'manutencao'
                            ? 'Manutenção'
                            : 'Inativa'}
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
              {editingItem ? 'Editar Máquina' : 'Nova Máquina'}
            </DialogTitle>
            <DialogDescription className="text-xs text-[#5A6D5A]">
              Identificação do equipamento florestal.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">ID da Máquina *</Label>
                <Input
                  placeholder="FELL-01"
                  value={idMaquina}
                  onChange={(e) => setIdMaquina(e.target.value)}
                  className="h-9 font-mono uppercase"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Tipo de Máquina</Label>
                <Select value={tipo} onValueChange={(val: any) => setTipo(val)}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feller">Feller</SelectItem>
                    <SelectItem value="skidder">Skidder</SelectItem>
                    <SelectItem value="picador">Picador</SelectItem>
                    <SelectItem value="colhedora">Colhedora</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Equipamento (Modelo / Marca) *</Label>
              <Input
                placeholder="Ex: CAT 541 / John Deere 648L"
                value={equipamento}
                onChange={(e) => setEquipamento(e.target.value)}
                className="h-9"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">BT (Bancada/Ident.)</Label>
                <Input
                  placeholder="BT-01"
                  value={bt}
                  onChange={(e) => setBt(e.target.value)}
                  className="h-9 font-mono"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Operador / Resp.</Label>
                <Input
                  placeholder="Nome do operador"
                  value={usuarioResp}
                  onChange={(e) => setUsuarioResp(e.target.value)}
                  className="h-9"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Fazenda Base</Label>
                <Select value={fazendaId} onValueChange={setFazendaId}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Opcional" />
                  </SelectTrigger>
                  <SelectContent>
                    {fazendas.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.codigo} - {f.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Situação</Label>
                <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativa">Ativa</SelectItem>
                    <SelectItem value="manutencao">Manutenção</SelectItem>
                    <SelectItem value="inativa">Inativa</SelectItem>
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
                Salvar Máquina
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#C62828]">Excluir Máquina?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Tem certeza que deseja excluir a máquina <strong>{itemToDelete?.id_maquina}</strong>?
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
