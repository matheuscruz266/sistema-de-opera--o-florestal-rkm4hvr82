import React, { useEffect, useState } from 'react'
import { apiService } from '@/services/florestalApi'
import { Talhao, Fazenda } from '@/types/florestal'
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
import { MapPin, Plus, Search, Edit2, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'

export default function TalhoesPage() {
  const { fazendaAtiva } = useAuth()
  const [talhoes, setTalhoes] = useState<Talhao[]>([])
  const [fazendas, setFazendas] = useState<Fazenda[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedFazendaFilter, setSelectedFazendaFilter] = useState<string>('todas')

  const [modalOpen, setModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<Talhao | null>(null)
  const [editingItem, setEditingItem] = useState<Talhao | null>(null)
  const [saving, setSaving] = useState(false)

  // Form states
  const [talhaoNome, setTalhaoNome] = useState('')
  const [fazendaId, setFazendaId] = useState('')
  const [areaHa, setAreaHa] = useState<number | ''>('')
  const [especie, setEspecie] = useState('')
  const [dataPlantio, setDataPlantio] = useState('')
  const [status, setStatus] = useState<Talhao['status']>('ativo')

  const loadData = async () => {
    setLoading(true)
    try {
      const [talList, fazList] = await Promise.all([
        apiService.getTalhoes(),
        apiService.getFazendas(),
      ])
      setTalhoes(talList)
      setFazendas(fazList)
    } catch (err) {
      console.error(err)
      toast.error('Erro ao carregar talhões')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (fazendaAtiva) {
      setSelectedFazendaFilter(fazendaAtiva.id)
    }
  }, [fazendaAtiva])

  const handleOpenCreate = () => {
    setEditingItem(null)
    setTalhaoNome('')
    setFazendaId(fazendaAtiva ? fazendaAtiva.id : fazendas[0]?.id || '')
    setAreaHa('')
    setEspecie('Eucalyptus grandis')
    setDataPlantio('')
    setStatus('ativo')
    setModalOpen(true)
  }

  const handleOpenEdit = (t: Talhao) => {
    setEditingItem(t)
    setTalhaoNome(t.talhao)
    setFazendaId(t.fazenda_id)
    setAreaHa(t.area_ha ?? '')
    setEspecie(t.especie || '')
    setDataPlantio(t.data_plantio || '')
    setStatus(t.status)
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!talhaoNome.trim() || !fazendaId) {
      toast.error('Identificação do talhão e Fazenda são obrigatórios')
      return
    }

    setSaving(true)
    try {
      const payload: Partial<Talhao> = {
        talhao: talhaoNome.trim(),
        fazenda_id: fazendaId,
        area_ha: areaHa === '' ? 0 : Number(areaHa),
        especie: especie.trim(),
        data_plantio: dataPlantio,
        status,
      }

      if (editingItem) {
        await apiService.updateTalhao(editingItem.id, payload)
        toast.success('Talhão atualizado com sucesso')
      } else {
        await apiService.createTalhao(payload)
        toast.success('Talhão cadastrado com sucesso')
      }

      setModalOpen(false)
      loadData()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Erro ao salvar talhão')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!itemToDelete) return
    try {
      await apiService.deleteTalhao(itemToDelete.id)
      toast.success('Talhão excluído com sucesso')
      setDeleteDialogOpen(false)
      setItemToDelete(null)
      loadData()
    } catch (err: any) {
      console.error(err)
      toast.error('Erro ao excluir talhão')
    }
  }

  const filtered = talhoes.filter((t) => {
    const matchesSearch =
      t.talhao.toLowerCase().includes(search.toLowerCase()) ||
      (t.especie && t.especie.toLowerCase().includes(search.toLowerCase()))
    const matchesFazenda =
      selectedFazendaFilter === 'todas' || t.fazenda_id === selectedFazendaFilter
    return matchesSearch && matchesFazenda
  })

  const getStatusBadge = (st: Talhao['status']) => {
    switch (st) {
      case 'colheita':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-300">Em Colheita</Badge>
      case 'cultivo':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">Cultivo</Badge>
      case 'concluido':
        return (
          <Badge className="bg-neutral-100 text-neutral-700 border-neutral-300">Concluído</Badge>
        )
      default:
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">Ativo</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A2E1A] flex items-center gap-2">
            <MapPin className="w-6 h-6 text-[#1B5E20]" />
            Cadastro de Talhões
          </h1>
          <p className="text-sm text-[#5A6D5A]">
            Identificação de talhões com área (ha) e espécie florestal plantada.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-[#1B5E20] hover:bg-[#14521A] text-white">
          <Plus className="w-4 h-4 mr-2" />
          Novo Talhão
        </Button>
      </div>

      <Card className="border-[#DDE4DE] shadow-xs">
        <CardHeader className="p-4 border-b border-[#DDE4DE] bg-neutral-50/50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5A6D5A]" />
                <Input
                  placeholder="Buscar talhão ou espécie..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 border-[#DDE4DE] text-xs"
                />
              </div>
              <Select value={selectedFazendaFilter} onValueChange={setSelectedFazendaFilter}>
                <SelectTrigger className="h-9 w-48 text-xs border-[#DDE4DE]">
                  <SelectValue placeholder="Filtrar Fazenda" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as Fazendas</SelectItem>
                  {fazendas.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.codigo} - {f.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <span className="text-xs text-[#5A6D5A]">
              Total: <strong>{filtered.length}</strong> talhões
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-[#5A6D5A] gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#1B5E20]" />
              <span className="text-xs">Carregando talhões...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-[#5A6D5A] text-xs">
              Nenhum talhão encontrado.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F7F5] border-b border-[#DDE4DE] text-[#5A6D5A] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Talhão</th>
                  <th className="py-3 px-4">Fazenda</th>
                  <th className="py-3 px-4 text-right">Área (ha)</th>
                  <th className="py-3 px-4">Espécie Florestal</th>
                  <th className="py-3 px-4">Plantio</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE4DE]">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-[#1B5E20]">
                      {item.talhao}
                    </td>
                    <td className="py-3 px-4 text-[#1A2E1A]">
                      {item.expand?.fazenda_id?.nome || 'Fazenda vinculada'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[#1A2E1A]">
                      {item.area_ha ? item.area_ha.toFixed(2) : '-'}
                    </td>
                    <td className="py-3 px-4 italic text-[#5A6D5A]">{item.especie || '-'}</td>
                    <td className="py-3 px-4 text-[#5A6D5A]">{item.data_plantio || '-'}</td>
                    <td className="py-3 px-4 text-center">{getStatusBadge(item.status)}</td>
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
              {editingItem ? 'Editar Talhão' : 'Novo Talhão'}
            </DialogTitle>
            <DialogDescription className="text-xs text-[#5A6D5A]">
              Dados cadastrais do talhão florestal.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1">
              <Label className="text-xs">Fazenda Pertencente *</Label>
              <Select value={fazendaId} onValueChange={setFazendaId}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Selecione a fazenda" />
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

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Identificação do Talhão *</Label>
                <Input
                  placeholder="Ex: TAL-001"
                  value={talhaoNome}
                  onChange={(e) => setTalhaoNome(e.target.value)}
                  className="h-9 uppercase font-mono"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Área (ha)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="35.5"
                  value={areaHa}
                  onChange={(e) => setAreaHa(e.target.value === '' ? '' : Number(e.target.value))}
                  className="h-9 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Espécie Florestal</Label>
              <Input
                placeholder="Ex: Eucalyptus grandis / Pinus taeda"
                value={especie}
                onChange={(e) => setEspecie(e.target.value)}
                className="h-9"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Data de Plantio</Label>
                <Input
                  type="date"
                  value={dataPlantio}
                  onChange={(e) => setDataPlantio(e.target.value)}
                  className="h-9 text-xs"
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
                    <SelectItem value="cultivo">Cultivo</SelectItem>
                    <SelectItem value="colheita">Em Colheita</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
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
                Salvar Talhão
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* CONFIRMAÇÃO EXCLUSÃO */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#C62828]">Excluir Talhão?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Tem certeza que deseja excluir o talhão <strong>{itemToDelete?.talhao}</strong>?
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
