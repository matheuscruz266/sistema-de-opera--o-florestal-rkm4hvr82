import React, { useEffect, useState } from 'react'
import { apiService } from '@/services/florestalApi'
import { ConversaoSrCavaco } from '@/types/florestal'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Truck, Plus, CheckCircle, Loader2, Info, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export default function ConversaoSrCavacoPage() {
  const [conversoes, setConversoes] = useState<ConversaoSrCavaco[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingItem, setEditingItem] = useState<ConversaoSrCavaco | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Form states
  const [idCarreta, setIdCarreta] = useState('')
  const [modeloCarreta, setModeloCarreta] = useState('')
  const [capacidadeM3, setCapacidadeM3] = useState<number | ''>(90)
  const [fatorTM3, setFatorTM3] = useState<number | ''>(0.32)
  const [vigenciaInicio, setVigenciaInicio] = useState(new Date().toISOString().split('T')[0])
  const [vigenciaFim, setVigenciaFim] = useState('')
  const [isVigente, setIsVigente] = useState(true)

  const loadData = async () => {
    setLoading(true)
    try {
      const list = await apiService.getConversoesSrCavaco()
      setConversoes(list)
    } catch (err) {
      console.error(err)
      toast.error('Erro ao carregar parametrizações de carretas cavaqueiras')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenCreate = () => {
    setEditingItem(null)
    setIdCarreta(`CARRETA-${(conversoes.length + 1).toString().padStart(2, '0')}`)
    setModeloCarreta('')
    setCapacidadeM3(90)
    setFatorTM3(0.32)
    setVigenciaInicio(new Date().toISOString().split('T')[0])
    setVigenciaFim('')
    setIsVigente(true)
    setModalOpen(true)
  }

  const handleOpenEdit = (item: ConversaoSrCavaco) => {
    setEditingItem(item)
    setIdCarreta(item.id_carreta)
    setModeloCarreta(item.modelo_carreta || '')
    setCapacidadeM3(item.capacidade_m3)
    setFatorTM3(item.fator_t_m3)
    setVigenciaInicio(item.vigencia_inicio || new Date().toISOString().split('T')[0])
    setVigenciaFim(item.vigencia_fim || '')
    setIsVigente(item.is_vigente)
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!idCarreta.trim() || capacidadeM3 === '' || fatorTM3 === '') {
      toast.error('Preencha os campos obrigatórios')
      return
    }

    setSaving(true)
    try {
      if (editingItem) {
        await apiService.updateConversaoSrCavaco(editingItem.id, {
          id_carreta: idCarreta.trim().toUpperCase(),
          modelo_carreta: modeloCarreta.trim() || undefined,
          capacidade_m3: Number(capacidadeM3),
          fator_t_m3: Number(fatorTM3),
          vigencia_inicio: vigenciaInicio,
          vigencia_fim: vigenciaFim || undefined,
          is_vigente: isVigente,
        })
        toast.success('Parametrização da carreta atualizada com sucesso!')
      } else {
        await apiService.createConversaoSrCavaco({
          id_carreta: idCarreta.trim().toUpperCase(),
          modelo_carreta: modeloCarreta.trim() || undefined,
          capacidade_m3: Number(capacidadeM3),
          fator_t_m3: Number(fatorTM3),
          vigencia_inicio: vigenciaInicio,
          vigencia_fim: vigenciaFim || undefined,
          is_vigente: isVigente,
        })
        toast.success('Nova carreta cavaqueira cadastrada com sucesso!')
      }
      setModalOpen(false)
      loadData()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Erro ao salvar parametrização da carreta')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingId) return
    try {
      await apiService.deleteConversaoSrCavaco(deletingId)
      toast.success('Carreta cavaqueira removida do cadastro.')
      setDeletingId(null)
      loadData()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Erro ao excluir carreta')
    }
  }

  const handleToggleVigente = async (item: ConversaoSrCavaco) => {
    try {
      await apiService.updateConversaoSrCavaco(item.id, {
        is_vigente: !item.is_vigente,
      })
      toast.success(item.is_vigente ? 'Vigência desativada.' : 'Carreta ativada como vigente.')
      loadData()
    } catch (err) {
      console.error(err)
      toast.error('Erro ao alternar vigência')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A2E1A] flex items-center gap-2">
            <Truck className="w-6 h-6 text-[#1B5E20]" />
            Tabela de Conversão SR_Cavaco (Núcleo B)
          </h1>
          <p className="text-sm text-[#5A6D5A]">
            Parametrização das carretas cavaqueiras: capacidade nominal em m³, fator de densidade a
            granel (t/m³) e período de vigência.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-[#1B5E20] hover:bg-[#14521A] text-white">
          <Plus className="w-4 h-4 mr-2" />
          Nova Carreta Cavaqueira
        </Button>
      </div>

      {/* Informativo de Engenharia Florestal */}
      <div className="p-4 bg-[#E8F5E9] border border-emerald-200 rounded-xl flex items-start gap-3">
        <Info className="w-5 h-5 text-[#1B5E20] shrink-0 mt-0.5" />
        <div className="text-xs text-[#1A2E1A] leading-relaxed">
          <strong>Densidade de Cavaco a Granel:</strong> No picador, a medição é volumétrica pela
          carreta (m³) associada à pesagem de saída. O fator de peso de referência típico varia
          entre <strong>0,28 e 0,38 t/m³</strong> dependendo do teor de umidade do lote e
          compactação no baú.
        </div>
      </div>

      <Card className="border-[#DDE4DE] shadow-xs">
        <CardHeader className="p-4 border-b border-[#DDE4DE] bg-neutral-50/50 flex flex-row items-center justify-between">
          <span className="text-xs font-semibold text-[#1A2E1A]">
            Carretas Cavaqueiras Cadastradas ({conversoes.length})
          </span>
          <span className="text-xs text-[#5A6D5A]">
            Vigentes:{' '}
            <strong className="text-[#1B5E20]">
              {conversoes.filter((c) => c.is_vigente).length}
            </strong>
          </span>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-[#5A6D5A] gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#1B5E20]" />
              <span className="text-xs">Carregando carretas cavaqueiras...</span>
            </div>
          ) : conversoes.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#5A6D5A]">
              Nenhuma carreta cavaqueira cadastrada até o momento.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F7F5] border-b border-[#DDE4DE] text-[#5A6D5A] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">ID Carreta</th>
                  <th className="py-3 px-4">Modelo / Descrição</th>
                  <th className="py-3 px-4 text-right">Capacidade (m³)</th>
                  <th className="py-3 px-4 text-right">Fator Peso (t/m³)</th>
                  <th className="py-3 px-4 text-right">Carga Est. (t)</th>
                  <th className="py-3 px-4">Início Vigência</th>
                  <th className="py-3 px-4">Fim Vigência</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE4DE]">
                {conversoes.map((item) => {
                  const cargaEstimadaT = (item.capacidade_m3 * item.fator_t_m3).toFixed(2)
                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors ${
                        item.is_vigente ? 'bg-emerald-50/30' : 'hover:bg-neutral-50/80 opacity-80'
                      }`}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-[#1B5E20]">
                        {item.id_carreta}
                      </td>
                      <td className="py-3 px-4 font-medium text-[#1A2E1A]">
                        {item.modelo_carreta || 'Sem modelo informado'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#1A2E1A]">
                        {item.capacidade_m3.toFixed(1)} m³
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#1A2E1A]">
                        {item.fator_t_m3.toFixed(4)} t/m³
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[#5A6D5A]">
                        ≈ {cargaEstimadaT} t
                      </td>
                      <td className="py-3 px-4 font-mono text-[#5A6D5A]">{item.vigencia_inicio}</td>
                      <td className="py-3 px-4 font-mono text-[#5A6D5A]">
                        {item.vigencia_fim || 'Indeterminada'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {item.is_vigente ? (
                          <Badge className="bg-emerald-600 text-white text-[10px] font-bold">
                            Vigente
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[10px] text-neutral-500 border-neutral-300"
                          >
                            Inativo
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleVigente(item)}
                            title={item.is_vigente ? 'Desativar vigência' : 'Tornar vigente'}
                            className="h-7 w-7 text-emerald-700 hover:bg-emerald-50"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(item)}
                            title="Editar parametrização"
                            className="h-7 w-7 text-[#5A6D5A] hover:text-[#1A2E1A] hover:bg-neutral-100"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingId(item.id)}
                            title="Excluir carreta"
                            className="h-7 w-7 text-neutral-400 hover:text-red-600 hover:bg-red-50"
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

      {/* MODAL CRIAR / EDITAR */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg text-[#1A2E1A]">
              {editingItem ? 'Editar Carreta Cavaqueira' : 'Nova Carreta Cavaqueira'}
            </DialogTitle>
            <DialogDescription className="text-xs text-[#5A6D5A]">
              Configure a volumetria e densidade média para o cálculo de expedição de cavaco.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Identificador Carreta *</Label>
                <Input
                  placeholder="CARRETA-90M3"
                  value={idCarreta}
                  onChange={(e) => setIdCarreta(e.target.value)}
                  className="h-9 font-mono uppercase font-bold"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Capacidade Nominal (m³) *</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="90"
                  value={capacidadeM3}
                  onChange={(e) =>
                    setCapacidadeM3(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="h-9 font-mono font-bold"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Modelo / Marca da Carreta</Label>
              <Input
                placeholder="Ex: Cavaqueira Randon 90m³ Basculante"
                value={modeloCarreta}
                onChange={(e) => setModeloCarreta(e.target.value)}
                className="h-9"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Fator Peso (t/m³) *</Label>
                <Input
                  type="number"
                  step="0.0001"
                  placeholder="0.32"
                  value={fatorTM3}
                  onChange={(e) => setFatorTM3(e.target.value === '' ? '' : Number(e.target.value))}
                  className="h-9 font-mono font-bold"
                  required
                />
                <span className="text-[10px] text-[#5A6D5A] block">Referência: 0.32 t/m³</span>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Carga Estimada p/ Viagem</Label>
                <div className="h-9 px-3 rounded-md bg-neutral-100 border border-[#DDE4DE] flex items-center font-mono text-xs font-bold text-[#1A2E1A]">
                  {capacidadeM3 && fatorTM3
                    ? `${(Number(capacidadeM3) * Number(fatorTM3)).toFixed(2)} toneladas`
                    : '—'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Início da Vigência *</Label>
                <Input
                  type="date"
                  value={vigenciaInicio}
                  onChange={(e) => setVigenciaInicio(e.target.value)}
                  className="h-9"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Fim da Vigência</Label>
                <Input
                  type="date"
                  value={vigenciaFim}
                  onChange={(e) => setVigenciaFim(e.target.value)}
                  className="h-9"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="is_vigente_cavaco"
                checked={isVigente}
                onChange={(e) => setIsVigente(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-[#1B5E20] focus:ring-[#1B5E20]"
              />
              <Label htmlFor="is_vigente_cavaco" className="text-xs cursor-pointer">
                Carreta ativa para operações de expedição (vigente)
              </Label>
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
                {editingItem ? 'Salvar Alterações' : 'Cadastrar Carreta'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* CONFIRMAÇÃO DE EXCLUSÃO */}
      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Carreta Cavaqueira?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover esta carreta da tabela de parametrização? Se houver
              registros vinculados no histórico de picador, a exclusão poderá ser impedida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Confirmar Exclusão
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
