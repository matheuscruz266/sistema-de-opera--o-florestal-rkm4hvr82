import React, { useEffect, useState } from 'react'
import { apiService } from '@/services/florestalApi'
import { UserRecord, PapelUsuario } from '@/types/florestal'
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
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  ShieldCheck,
  HardHat,
  FileCheck,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'

export default function UsuariosPage() {
  const { user: currentUser } = useAuth()
  const [usuarios, setUsuarios] = useState<UserRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<UserRecord | null>(null)
  const [editingItem, setEditingItem] = useState<UserRecord | null>(null)
  const [saving, setSaving] = useState(false)

  // Form states
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [papel, setPapel] = useState<PapelUsuario>('operador')
  const [status, setStatus] = useState<boolean>(true)

  const loadData = async () => {
    setLoading(true)
    try {
      const list = await apiService.getUsuarios()
      setUsuarios(list)
    } catch (err) {
      console.error(err)
      toast.error('Erro ao carregar usuários')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenCreate = () => {
    setEditingItem(null)
    setName('')
    setEmail('')
    setPassword('Skip@Pass')
    setPapel('operador')
    setStatus(true)
    setModalOpen(true)
  }

  const handleOpenEdit = (u: UserRecord) => {
    setEditingItem(u)
    setName(u.name || '')
    setEmail(u.email)
    setPassword('')
    setPapel(u.papel || 'operador')
    setStatus(u.status ?? true)
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      toast.error('O e-mail é obrigatório')
      return
    }

    setSaving(true)
    try {
      if (editingItem) {
        const payload: Partial<UserRecord> = {
          name: name.trim(),
          papel,
          status,
        }
        await apiService.updateUsuario(editingItem.id, payload)
        toast.success('Usuário atualizado com sucesso')
      } else {
        await apiService.createUsuario({
          name: name.trim(),
          email: email.trim(),
          password: password || 'Skip@Pass',
          papel,
          status: true,
        })
        toast.success('Novo usuário cadastrado com sucesso')
      }

      setModalOpen(false)
      loadData()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Erro ao salvar usuário')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!itemToDelete) return
    if (itemToDelete.id === currentUser?.id) {
      toast.error('Você não pode excluir seu próprio usuário logado.')
      return
    }

    try {
      await apiService.deleteUsuario(itemToDelete.id)
      toast.success('Usuário removido')
      setDeleteDialogOpen(false)
      setItemToDelete(null)
      loadData()
    } catch (err: any) {
      console.error(err)
      toast.error('Erro ao excluir usuário')
    }
  }

  const filtered = usuarios.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.name && u.name.toLowerCase().includes(search.toLowerCase())),
  )

  const getPapelBadge = (p?: PapelUsuario) => {
    switch (p) {
      case 'admin':
        return (
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 flex items-center gap-1 w-fit">
            <ShieldCheck className="w-3 h-3" />
            Administrador
          </Badge>
        )
      case 'conferente':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-300 flex items-center gap-1 w-fit">
            <FileCheck className="w-3 h-3" />
            Conferente
          </Badge>
        )
      default:
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-300 flex items-center gap-1 w-fit">
            <HardHat className="w-3 h-3" />
            Operador
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A2E1A] flex items-center gap-2">
            <Users className="w-6 h-6 text-[#1B5E20]" />
            Usuários e Papéis de Acesso
          </h1>
          <p className="text-sm text-[#5A6D5A]">
            Controle de permissões da equipe operacional (Admin, Operador e Conferente).
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-[#1B5E20] hover:bg-[#14521A] text-white">
          <Plus className="w-4 h-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      <Card className="border-[#DDE4DE] shadow-xs">
        <CardHeader className="p-4 border-b border-[#DDE4DE] bg-neutral-50/50">
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5A6D5A]" />
              <Input
                placeholder="Buscar por nome ou e-mail..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 border-[#DDE4DE] text-xs"
              />
            </div>
            <span className="text-xs text-[#5A6D5A]">
              Total: <strong>{filtered.length}</strong> usuários
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-[#5A6D5A] gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#1B5E20]" />
              <span className="text-xs">Carregando usuários...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-[#5A6D5A] text-xs">
              Nenhum usuário encontrado.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F7F5] border-b border-[#DDE4DE] text-[#5A6D5A] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Nome</th>
                  <th className="py-3 px-4">E-mail Institucional</th>
                  <th className="py-3 px-4">Papel / Perfil</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE4DE]">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3 px-4 font-medium text-[#1A2E1A]">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#1B5E20]/15 text-[#1B5E20] font-bold flex items-center justify-center text-[10px]">
                          {item.name ? item.name.slice(0, 2).toUpperCase() : 'U'}
                        </div>
                        <span>{item.name || 'Sem nome informado'}</span>
                        {item.id === currentUser?.id && (
                          <span className="text-[10px] text-[#1B5E20] font-semibold">(Você)</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[#5A6D5A] font-mono">{item.email}</td>
                    <td className="py-3 px-4">{getPapelBadge(item.papel)}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge
                        variant="outline"
                        className={
                          item.status !== false
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : 'bg-neutral-100 text-neutral-600 border-neutral-300'
                        }
                      >
                        {item.status !== false ? 'Ativo' : 'Inativo'}
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
                          disabled={item.id === currentUser?.id}
                          onClick={() => {
                            setItemToDelete(item)
                            setDeleteDialogOpen(true)
                          }}
                          className="h-7 w-7 text-[#5A6D5A] hover:text-[#C62828] disabled:opacity-40"
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
              {editingItem ? 'Editar Usuário' : 'Novo Usuário do Sistema'}
            </DialogTitle>
            <DialogDescription className="text-xs text-[#5A6D5A]">
              Defina o papel operacional do colaborador.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1">
              <Label className="text-xs">Nome Completo</Label>
              <Input
                placeholder="Ex: João da Silva"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-9"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">E-mail Institucional *</Label>
              <Input
                type="email"
                placeholder="joao.silva@julitago.com.br"
                value={email}
                disabled={!!editingItem}
                onChange={(e) => setEmail(e.target.value)}
                className="h-9 font-mono"
                required
              />
            </div>

            {!editingItem && (
              <div className="space-y-1">
                <Label className="text-xs">Senha Inicial (mínimo 8 caracteres)</Label>
                <Input
                  type="password"
                  placeholder="Skip@Pass"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-9 font-mono"
                  required
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Papel Operacional</Label>
                <Select value={papel} onValueChange={(val: any) => setPapel(val)}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador (Total)</SelectItem>
                    <SelectItem value="operador">Operador de Campo</SelectItem>
                    <SelectItem value="conferente">Conferente de Pátio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Status da Conta</Label>
                <Select
                  value={status ? 'ativo' : 'inativo'}
                  onValueChange={(val) => setStatus(val === 'ativo')}
                >
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
                Salvar Usuário
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#C62828]">Excluir Usuário?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Tem certeza que deseja remover o usuário{' '}
              <strong>{itemToDelete?.name || itemToDelete?.email}</strong>?
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
