import React, { useEffect, useState } from 'react'
import { apiService } from '@/services/florestalApi'
import { Trabalho, Fazenda, Talhao } from '@/types/florestal'
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
import { ClipboardList, Plus, Search, Edit2, Trash2, Loader2, MapPin } from 'lucide-react'
import { toast } from 'sonner'

export default function TrabalhoPage() {
  const [trabalhos, setTrabalhos] = useState<Trabalho[]>([])
  const [fazendas, setFazendas] = useState<Fazenda[]>([])
  const [talhoes, setTalhoes] = useState<Talhao[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<Trabalho | null>(null)
  const [editingItem, setEditingItem] = useState<Trabalho | null>(null)
  const [saving, setSaving] = useState(false)

  // Form states
  const [appSheetId, setAppSheetId] = useState('')
  const [emailTrabalho, setEmailTrabalho] = useState('')
  const [data, setData] = useState('')
  const [fazendaId, setFazendaId] = useState('')
  const [pOrdens, setPOrdens] = useState('')
  const [talhaoId, setTalhaoId] = useState('')
  const [localizacao, setLocalizacao] = useState('')
  const [statusAtual, setStatusAtual] = useState('Ativo')

  const loadData = async () => {
    setLoading(true)
    try {
      const [trabalhosRes, fazendasRes, talhoesRes] = await Promise.all([
        apiService.getTrabalhos(),
        apiService.getFazendas(),
        apiService.getTalhoes(),
      ])
      setTrabalhos(trabalhosRes)
      setFazendas(fazendasRes)
      setTalhoes(talhoesRes)
    } catch (err) {
      console.error(err)
      toast.error('Erro ao carregar apontamentos de trabalho')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenCreate = () => {
    setEditingItem(null)
    setAppSheetId('')
    setEmailTrabalho('')
    setData(new Date().toISOString().slice(0, 10))
    setFazendaId('')
    setPOrdens('')
    setTalhaoId('')
    setLocalizacao('')
    setStatusAtual('Ativo')
    setModalOpen(true)
  }

  const handleOpenEdit = (t: Trabalho) => {
    setEditingItem(t)
    setAppSheetId(t.app_sheet_id || '')
    setEmailTrabalho(t.email_trabalho || '')
    setData(t.data || '')
    setFazendaId(t.fazenda_id || '')
    setPOrdens(t.p_ordens || '')
    setTalhaoId(t.talhao_id || '')
    setLocalizacao(t.localizacao || '')
    setStatusAtual(t.status_atual || 'Ativo')
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    setSaving(true)
    try {
      const payload: Partial<Trabalho> = {
        app_sheet_id: appSheetId.trim() || undefined,
        email_trabalho: emailTrabalho.trim(),
        data: data.trim(),
        fazenda_id: fazendaId || undefined,
        p_ordens: pOrdens.trim(),
        talhao_id: talhaoId || undefined,
        localizacao: localizacao.trim(),
        status_atual: statusAtual.trim(),
      }

      if (editingItem) {
        await apiService.updateTrabalho(editingItem.id, payload)
        toast.success('Apontamento de trabalho atualizado com sucesso')
      } else {
        await apiService.createTrabalho(payload)
        toast.success('Apontamento de trabalho cadastrado com sucesso')
      }

      setModalOpen(false)
      loadData()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Erro ao salvar apontamento de trabalho')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!itemToDelete) return
    try {
      await apiService.deleteTrabalho(itemToDelete.id)
      toast.success('Apontamento removido com sucesso')
      setDeleteDialogOpen(false)
      setItemToDelete(null)
      loadData()
    } catch (err: any) {
      console.error(err)
      toast.error('Não foi possível excluir o apontamento')
    }
  }

  const filtered = trabalhos.filter((t) => {
    const q = search.toLowerCase()
    const emailMatch = (t.email_trabalho || '').toLowerCase().includes(q)
    const pOrdensMatch = (t.p_ordens || '').toLowerCase().includes(q)
    const idMatch = (t.app_sheet_id || '').toLowerCase().includes(q)
    const fazendaNome = t.expand?.fazenda_id?.nome || ''
    const talhaoNome = t.expand?.talhao_id?.talhao || ''
    return (
      emailMatch ||
      pOrdensMatch ||
      idMatch ||
      fazendaNome.toLowerCase().includes(q) ||
      talhaoNome.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6">
      {/* Header da Tela */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A2E1A] flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-[#1B5E20]" />
            Trabalho / Apontamentos
          </h1>
          <p className="text-sm text-[#5A6D5A]">
            Apontamentos e registros de início de jornada dos operadores sincronizados do AppSheet.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-[#1B5E20] hover:bg-[#14521A] text-white">
          <Plus className="w-4 h-4 mr-2" />
          Novo Apontamento
        </Button>
      </div>

      {/* Card da Tabela com Filtros */}
      <Card className="border-[#DDE4DE] shadow-xs">
        <CardHeader className="p-4 border-b border-[#DDE4DE] bg-neutral-50/50">
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5A6D5A]" />
              <Input
                placeholder="Buscar por e-mail, P_Ordens, fazenda ou ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 border-[#DDE4DE] text-xs"
              />
            </div>
            <span className="text-xs text-[#5A6D5A]">
              Total: <strong>{filtered.length}</strong>{' '}
              {filtered.length === 1 ? 'registro' : 'registros'}
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
              Nenhum apontamento encontrado.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F7F5] border-b border-[#DDE4DE] text-[#5A6D5A] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">ID AppSheet</th>
                  <th className="py-3 px-4">E-mail Operador</th>
                  <th className="py-3 px-4">Data</th>
                  <th className="py-3 px-4">Fazenda</th>
                  <th className="py-3 px-4">Talhão</th>
                  <th className="py-3 px-4">P_Ordens</th>
                  <th className="py-3 px-4">Localização</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE4DE]">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-[#1B5E20]">
                      {item.app_sheet_id || item.id.slice(0, 8)}
                    </td>
                    <td className="py-3 px-4 text-[#1A2E1A]">{item.email_trabalho || '-'}</td>
                    <td className="py-3 px-4 text-[#5A6D5A]">
                      {item.data ? item.data.slice(0, 10) : '-'}
                    </td>
                    <td className="py-3 px-4 text-[#1A2E1A]">
                      {item.expand?.fazenda_id?.nome || '-'}
                    </td>
                    <td className="py-3 px-4 text-[#1A2E1A]">
                      {item.expand?.talhao_id?.talhao || '-'}
                    </td>
                    <td className="py-3 px-4 font-mono text-[#5A6D5A]">{item.p_ordens || '-'}</td>
                    <td className="py-3 px-4 text-[#5A6D5A]">
                      {item.localizacao ? (
                        <span
                          className="flex items-center gap-1 font-mono text-[11px]"
                          title={item.localizacao}
                        >
                          <MapPin className="w-3 h-3 text-[#1B5E20] shrink-0" />
                          <span className="truncate max-w-[140px]">{item.localizacao}</span>
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge
                        variant="outline"
                        className={
                          item.status_atual?.toLowerCase() === 'ativo'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : 'bg-neutral-100 text-neutral-600 border-neutral-300'
                        }
                      >
                        {item.status_atual || 'Ativo'}
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg text-[#1A2E1A]">
              {editingItem ? 'Editar Apontamento' : 'Novo Apontamento'}
            </DialogTitle>
            <DialogDescription className="text-xs text-[#5A6D5A]">
              Preencha os dados do registro de trabalho operacional.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">ID AppSheet (chave única)</Label>
                <Input
                  placeholder="Ex: 04c4100b"
                  value={appSheetId}
                  onChange={(e) => setAppSheetId(e.target.value)}
                  className="h-9 font-mono text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Data</Label>
                <Input
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">E-mail Operador</Label>
              <Input
                type="email"
                placeholder="operador@exemplo.com"
                value={emailTrabalho}
                onChange={(e) => setEmailTrabalho(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Fazenda</Label>
                <Select value={fazendaId} onValueChange={setFazendaId}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Selecione a Fazenda" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__nenhuma__">(Nenhuma)</SelectItem>
                    {fazendas.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.nome} ({f.codigo})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Talhão</Label>
                <Select value={talhaoId} onValueChange={setTalhaoId}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Selecione o Talhão" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__nenhum__">(Nenhum)</SelectItem>
                    {talhoes.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.talhao}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">P_Ordens (Código BT)</Label>
                <Input
                  placeholder="Ex: BT 015"
                  value={pOrdens}
                  onChange={(e) => setPOrdens(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Status Atual</Label>
                <Input
                  placeholder="Ex: Ativo"
                  value={statusAtual}
                  onChange={(e) => setStatusAtual(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Localização (lat, long)</Label>
              <Input
                placeholder="Ex: -24.942238, -53.397991"
                value={localizacao}
                onChange={(e) => setLocalizacao(e.target.value)}
                className="h-9 font-mono text-xs"
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
                Salvar Apontamento
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* CONFIRMAÇÃO EXCLUSÃO */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-[#1A2E1A]">
              Confirmar Exclusão de Apontamento
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-[#5A6D5A]">
              Tem certeza que deseja excluir o apontamento{' '}
              <strong>{itemToDelete?.app_sheet_id || itemToDelete?.id}</strong>? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-[#C62828] hover:bg-[#B71C1C] text-white"
            >
              Excluir Registro
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
