import React, { useEffect, useState } from 'react'
import { apiService } from '@/services/florestalApi'
import { Pilha, Fazenda, Talhao } from '@/types/florestal'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
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
import { Layers, Plus, Search, Edit2, Trash2, Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'

export default function PilhasPage() {
  const { fazendaAtiva } = useAuth()
  const [pilhas, setPilhas] = useState<Pilha[]>([])
  const [fazendas, setFazendas] = useState<Fazenda[]>([])
  const [talhoes, setTalhoes] = useState<Talhao[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<Pilha | null>(null)
  const [editingItem, setEditingItem] = useState<Pilha | null>(null)
  const [saving, setSaving] = useState(false)

  // Form states
  const [codigo, setCodigo] = useState('')
  const [nome, setNome] = useState('')
  const [fazendaId, setFazendaId] = useState('')
  const [talhaoId, setTalhaoId] = useState<string>('nenhum')
  const [isMista, setIsMista] = useState(false)
  const [produto, setProduto] = useState<Pilha['produto']>('tora')
  const [status, setStatus] = useState<Pilha['status']>('ativa')

  const loadData = async () => {
    setLoading(true)
    try {
      const [pilhasList, fazList, talList] = await Promise.all([
        apiService.getPilhas(),
        apiService.getFazendas(),
        apiService.getTalhoes(),
      ])
      setPilhas(pilhasList)
      setFazendas(fazList)
      setTalhoes(talList)
    } catch (err) {
      console.error(err)
      toast.error('Erro ao carregar pilhas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenCreate = () => {
    setEditingItem(null)
    setCodigo('')
    setNome('')
    setFazendaId(fazendaAtiva ? fazendaAtiva.id : fazendas[0]?.id || '')
    setTalhaoId('nenhum')
    setIsMista(false)
    setProduto('tora')
    setStatus('ativa')
    setModalOpen(true)
  }

  const handleOpenEdit = (p: Pilha) => {
    setEditingItem(p)
    setCodigo(p.codigo)
    setNome(p.nome || '')
    setFazendaId(p.fazenda_id)
    setTalhaoId(p.talhao_id || 'nenhum')
    setIsMista(p.is_mista || false)
    setProduto(p.produto)
    setStatus(p.status)
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!codigo.trim() || !fazendaId) {
      toast.error('Código e Fazenda são obrigatórios')
      return
    }

    setSaving(true)
    try {
      const payload: Partial<Pilha> = {
        codigo: codigo.trim().toUpperCase(),
        nome: nome.trim(),
        fazenda_id: fazendaId,
        talhao_id: isMista || talhaoId === 'nenhum' ? undefined : talhaoId,
        is_mista: isMista,
        produto,
        status,
      }

      if (editingItem) {
        await apiService.updatePilha(editingItem.id, payload)
        toast.success('Pilha atualizada com sucesso')
      } else {
        await apiService.createPilha(payload)
        toast.success('Pilha cadastrada com sucesso')
      }

      setModalOpen(false)
      loadData()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Erro ao salvar pilha (código duplicado?)')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!itemToDelete) return
    try {
      await apiService.deletePilha(itemToDelete.id)
      toast.success('Pilha excluída')
      setDeleteDialogOpen(false)
      setItemToDelete(null)
      loadData()
    } catch (err: any) {
      console.error(err)
      toast.error('Erro ao excluir pilha')
    }
  }

  const talhoesDaFazenda = talhoes.filter((t) => t.fazenda_id === fazendaId)

  const filtered = pilhas.filter((p) => {
    const matchesSearch =
      p.codigo.toLowerCase().includes(search.toLowerCase()) ||
      (p.nome && p.nome.toLowerCase().includes(search.toLowerCase()))
    return matchesSearch
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A2E1A] flex items-center gap-2">
            <Layers className="w-6 h-6 text-[#1B5E20]" />
            Cadastro de Pilhas (Pátio Florestal)
          </h1>
          <p className="text-sm text-[#5A6D5A]">
            Controle de lotes e pilhas de toras e cavaco, com suporte a{' '}
            <strong>Pilhas Mistas</strong> (sem talhão único).
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-[#1B5E20] hover:bg-[#14521A] text-white">
          <Plus className="w-4 h-4 mr-2" />
          Nova Pilha
        </Button>
      </div>

      <Card className="border-[#DDE4DE] shadow-xs">
        <CardHeader className="p-4 border-b border-[#DDE4DE] bg-neutral-50/50">
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5A6D5A]" />
              <Input
                placeholder="Buscar por código ou descrição..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 border-[#DDE4DE] text-xs"
              />
            </div>
            <span className="text-xs text-[#5A6D5A]">
              Total: <strong>{filtered.length}</strong> pilhas
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-[#5A6D5A] gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#1B5E20]" />
              <span className="text-xs">Carregando pilhas do pátio...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-[#5A6D5A] text-xs">
              Nenhuma pilha cadastrada.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F7F5] border-b border-[#DDE4DE] text-[#5A6D5A] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Código</th>
                  <th className="py-3 px-4">Identificação / Nome</th>
                  <th className="py-3 px-4">Fazenda</th>
                  <th className="py-3 px-4">Talhão de Origem</th>
                  <th className="py-3 px-4">Tipo / Produto</th>
                  <th className="py-3 px-4 text-right">Saldo Atual (m³)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE4DE]">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#1B5E20]">{item.codigo}</td>
                    <td className="py-3 px-4 font-medium text-[#1A2E1A]">{item.nome || '-'}</td>
                    <td className="py-3 px-4 text-[#5A6D5A]">
                      {item.expand?.fazenda_id?.nome || '-'}
                    </td>
                    <td className="py-3 px-4">
                      {item.is_mista ? (
                        <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-[10px] font-semibold flex items-center gap-1 w-fit">
                          <Sparkles className="w-3 h-3" />
                          Pilha Mista
                        </Badge>
                      ) : (
                        <span className="font-mono text-[#1A2E1A]">
                          {item.expand?.talhao_id?.talhao || 'Não vinculado'}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 uppercase text-[11px] font-medium text-[#5A6D5A]">
                      {item.produto}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#1A2E1A]">
                      {item.volume_atual_m3 ? `${item.volume_atual_m3.toFixed(2)} m³` : '0.00 m³'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge
                        variant="outline"
                        className={
                          item.status === 'ativa'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : item.status === 'em_consumo'
                              ? 'bg-amber-50 text-amber-700 border-amber-300'
                              : 'bg-neutral-100 text-neutral-600 border-neutral-300'
                        }
                      >
                        {item.status === 'ativa'
                          ? 'Ativa'
                          : item.status === 'em_consumo'
                            ? 'Em Consumo'
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
              {editingItem ? 'Editar Pilha' : 'Nova Pilha de Pátio'}
            </DialogTitle>
            <DialogDescription className="text-xs text-[#5A6D5A]">
              Identificação do lote ou pilha de madeira.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Código da Pilha *</Label>
                <Input
                  placeholder="PIL-01"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  className="h-9 font-mono uppercase font-bold"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Fazenda do Pátio *</Label>
                <Select value={fazendaId} onValueChange={setFazendaId}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
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
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Descrição / Identificação</Label>
              <Input
                placeholder="Ex: Pilha Principal - Eucalipto Safra 2025"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="h-9"
              />
            </div>

            {/* Checkbox Pilha Mista */}
            <div className="p-3 bg-neutral-50 rounded-lg border border-[#DDE4DE] flex items-center justify-between">
              <div>
                <Label className="text-xs font-semibold block text-[#1A2E1A]">Pilha Mista?</Label>
                <span className="text-[11px] text-[#5A6D5A]">
                  Recebe madeira de múltiplos talhões sem origem única exclusiva.
                </span>
              </div>
              <Switch checked={isMista} onCheckedChange={setIsMista} />
            </div>

            {!isMista && (
              <div className="space-y-1">
                <Label className="text-xs">Talhão de Referência</Label>
                <Select value={talhaoId} onValueChange={setTalhaoId}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Selecione o talhão" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nenhum">Nenhum talhão específico</SelectItem>
                    {talhoesDaFazenda.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.talhao} ({t.especie || 'Sem espécie'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Produto Armazenado</Label>
                <Select value={produto} onValueChange={(val: any) => setProduto(val)}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tora">Tora</SelectItem>
                    <SelectItem value="cavaco">Cavaco</SelectItem>
                    <SelectItem value="misto">Misto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Status da Pilha</Label>
                <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativa">Ativa</SelectItem>
                    <SelectItem value="em_consumo">Em Consumo</SelectItem>
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
                Salvar Pilha
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#C62828]">Excluir Pilha?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Tem certeza que deseja excluir a pilha <strong>{itemToDelete?.codigo}</strong>?
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
