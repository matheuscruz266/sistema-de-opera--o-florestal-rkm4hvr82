import React, { useEffect, useState } from 'react'
import { apiService } from '@/services/florestalApi'
import { Fazenda } from '@/types/florestal'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
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
import { Building2, Plus, Search, Edit2, Trash2, Loader2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'

export default function FazendasPage() {
  const { refreshFazendas } = useAuth()
  const [fazendas, setFazendas] = useState<Fazenda[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<Fazenda | null>(null)
  const [editingItem, setEditingItem] = useState<Fazenda | null>(null)
  const [saving, setSaving] = useState(false)

  // Form states
  const [nome, setNome] = useState('')
  const [codigo, setCodigo] = useState('')
  const [uf, setUf] = useState('PR')
  const [cidade, setCidade] = useState('')
  const [areaTotal, setAreaTotal] = useState<number | ''>('')
  const [areaPlantada, setAreaPlantada] = useState<number | ''>('')
  const [status, setStatus] = useState<'ativa' | 'inativa'>('ativa')

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await apiService.getFazendas()
      setFazendas(data)
    } catch (err) {
      console.error(err)
      toast.error('Erro ao carregar fazendas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenCreate = () => {
    setEditingItem(null)
    setNome('')
    setCodigo('')
    setUf('PR')
    setCidade('')
    setAreaTotal('')
    setAreaPlantada('')
    setStatus('ativa')
    setModalOpen(true)
  }

  const handleOpenEdit = (f: Fazenda) => {
    setEditingItem(f)
    setNome(f.nome)
    setCodigo(f.codigo)
    setUf(f.uf)
    setCidade(f.cidade || '')
    setAreaTotal(f.area_total ?? '')
    setAreaPlantada(f.area_plantada ?? '')
    setStatus(f.status)
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nome.trim() || !codigo.trim()) {
      toast.error('Nome e Código são obrigatórios')
      return
    }

    setSaving(true)
    try {
      const payload: Partial<Fazenda> = {
        nome: nome.trim(),
        codigo: codigo.trim().toUpperCase(),
        uf: uf.trim().toUpperCase(),
        cidade: cidade.trim(),
        area_total: areaTotal === '' ? 0 : Number(areaTotal),
        area_plantada: areaPlantada === '' ? 0 : Number(areaPlantada),
        status,
      }

      if (editingItem) {
        await apiService.updateFazenda(editingItem.id, payload)
        toast.success('Fazenda atualizada com sucesso')
      } else {
        await apiService.createFazenda(payload)
        toast.success('Fazenda cadastrada com sucesso')
      }

      setModalOpen(false)
      loadData()
      refreshFazendas()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Erro ao salvar fazenda')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!itemToDelete) return
    try {
      await apiService.deleteFazenda(itemToDelete.id)
      toast.success('Fazenda removida com sucesso')
      setDeleteDialogOpen(false)
      setItemToDelete(null)
      loadData()
      refreshFazendas()
    } catch (err: any) {
      console.error(err)
      toast.error('Não foi possível excluir a fazenda (pode conter talhões vinculados)')
    }
  }

  const filtered = fazendas.filter(
    (f) =>
      f.nome.toLowerCase().includes(search.toLowerCase()) ||
      f.codigo.toLowerCase().includes(search.toLowerCase()) ||
      (f.cidade && f.cidade.toLowerCase().includes(search.toLowerCase())),
  )

  return (
    <div className="space-y-6">
      {/* Header da Tela */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A2E1A] flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[#1B5E20]" />
            Cadastro de Fazendas
          </h1>
          <p className="text-sm text-[#5A6D5A]">
            Gerenciamento das unidades de produção e áreas de cultivo florestal.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-[#1B5E20] hover:bg-[#14521A] text-white">
          <Plus className="w-4 h-4 mr-2" />
          Nova Fazenda
        </Button>
      </div>

      {/* Card da Tabela com Filtros */}
      <Card className="border-[#DDE4DE] shadow-xs">
        <CardHeader className="p-4 border-b border-[#DDE4DE] bg-neutral-50/50">
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5A6D5A]" />
              <Input
                placeholder="Buscar por nome, código ou cidade..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 border-[#DDE4DE] text-xs"
              />
            </div>
            <span className="text-xs text-[#5A6D5A]">
              Total: <strong>{filtered.length}</strong>{' '}
              {filtered.length === 1 ? 'fazenda' : 'fazendas'}
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-[#5A6D5A] gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#1B5E20]" />
              <span className="text-xs">Carregando fazendas...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-[#5A6D5A] text-xs">
              Nenhuma fazenda encontrada.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F7F5] border-b border-[#DDE4DE] text-[#5A6D5A] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Código</th>
                  <th className="py-3 px-4">Fazenda</th>
                  <th className="py-3 px-4">UF / Cidade</th>
                  <th className="py-3 px-4 text-right">Área Total (ha)</th>
                  <th className="py-3 px-4 text-right">Área Plantada (ha)</th>
                  <th className="py-3 px-4 text-center">Situação</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE4DE]">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-[#1B5E20]">
                      {item.codigo}
                    </td>
                    <td className="py-3 px-4 font-medium text-[#1A2E1A]">{item.nome}</td>
                    <td className="py-3 px-4 text-[#5A6D5A]">
                      {item.cidade ? `${item.cidade} - ${item.uf}` : item.uf}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[#1A2E1A]">
                      {item.area_total ? item.area_total.toLocaleString('pt-BR') : '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[#1A2E1A]">
                      {item.area_plantada ? item.area_plantada.toLocaleString('pt-BR') : '-'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge
                        variant="outline"
                        className={
                          item.status === 'ativa'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : 'bg-neutral-100 text-neutral-600 border-neutral-300'
                        }
                      >
                        {item.status === 'ativa' ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(item)}
                          className="h-7 w-7 text-[#5A6D5A] hover:text-[#1B5E20]"
                          title="Editar"
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
                          title="Excluir"
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

      {/* MODAL CRIAR / EDITAR */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg text-[#1A2E1A]">
              {editingItem ? 'Editar Fazenda' : 'Nova Fazenda'}
            </DialogTitle>
            <DialogDescription className="text-xs text-[#5A6D5A]">
              Preencha os dados da unidade florestal.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Código *</Label>
                <Input
                  placeholder="FAZ-001"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  className="h-9 uppercase"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">UF *</Label>
                <Input
                  placeholder="PR"
                  value={uf}
                  maxLength={2}
                  onChange={(e) => setUf(e.target.value)}
                  className="h-9 uppercase"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Nome da Fazenda *</Label>
              <Input
                placeholder="Ex: Fazenda Boa Esperança"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="h-9"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Município / Cidade</Label>
              <Input
                placeholder="Ex: Toledo"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                className="h-9"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Área Total (ha)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="1250"
                  value={areaTotal}
                  onChange={(e) =>
                    setAreaTotal(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="h-9 font-mono"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Área Plantada (ha)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="980"
                  value={areaPlantada}
                  onChange={(e) =>
                    setAreaPlantada(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="h-9 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Situação</Label>
              <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativa">Ativa</SelectItem>
                  <SelectItem value="inativa">Inativa</SelectItem>
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
                Salvar Fazenda
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* CONFIRMAÇÃO EXCLUSÃO */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#C62828]">Confirmar Exclusão?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Tem certeza que deseja excluir a fazenda{' '}
              <strong>
                {itemToDelete?.nome} ({itemToDelete?.codigo})
              </strong>
              ? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-[#C62828] hover:bg-red-700 text-white"
            >
              Excluir Definitivamente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
