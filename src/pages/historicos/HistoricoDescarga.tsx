import React, { useEffect, useState } from 'react'
import { apiService } from '@/services/florestalApi'
import { HistoricoDescarga, CaminhaoBaldeio, Pilha, ConversaoSrToras } from '@/types/florestal'
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
  ArrowDownToLine,
  Plus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import {
  formatHorimetro,
  formatLitros,
  formatStatusOperacao,
} from '@/lib/historicoOperacional'

export default function HistoricoDescargaPage() {
  const { user } = useAuth()
  const [registros, setRegistros] = useState<HistoricoDescarga[]>([])
  const [caminhoes, setCaminhoes] = useState<CaminhaoBaldeio[]>([])
  const [pilhas, setPilhas] = useState<Pilha[]>([])
  const [conversaoVigente, setConversaoVigente] = useState<ConversaoSrToras | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<HistoricoDescarga | null>(null)
  const [editingItem, setEditingItem] = useState<HistoricoDescarga | null>(null)
  const [saving, setSaving] = useState(false)

  // Form states
  const [caminhaoBaldeioId, setCaminhaoBaldeioId] = useState('')
  const [pilhaDestinoId, setPilhaDestinoId] = useState('')
  const [dataHoraDescarga, setDataHoraDescarga] = useState(new Date().toISOString().slice(0, 16))
  const [volumeSr, setVolumeSr] = useState<number | ''>('')
  const [pesoBrutoT, setPesoBrutoT] = useState<number | ''>('')
  const [pesoTaraT, setPesoTaraT] = useState<number | ''>('')
  const [statusAceite, setStatusAceite] = useState<HistoricoDescarga['status_aceite']>('aceito')
  const [motivoRejeicao, setMotivoRejeicao] = useState('')
  const [conferenteNome, setConferenteNome] = useState(user?.name || '')

  const loadData = async () => {
    setLoading(true)
    try {
      const [histList, camList, pilList, conv] = await Promise.all([
        apiService.getHistoricoDescarga(),
        apiService.getCaminhoesBaldeio(),
        apiService.getPilhas(),
        apiService.getConversaoSrTorasVigente(),
      ])
      setRegistros(histList)
      setCaminhoes(camList)
      setPilhas(pilList)
      setConversaoVigente(conv)
    } catch (err) {
      console.error(err)
      toast.error('Erro ao carregar histórico de descargas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const fatorConversao = conversaoVigente?.fator_m3_sr || 0.84
  const volumeM3Calculado =
    volumeSr !== '' ? Number((Number(volumeSr) * fatorConversao).toFixed(2)) : 0
  const pesoLiquidoT =
    pesoBrutoT !== '' && pesoTaraT !== ''
      ? Math.max(0, Number((Number(pesoBrutoT) - Number(pesoTaraT)).toFixed(2)))
      : undefined

  const handleOpenCreate = () => {
    setEditingItem(null)
    setCaminhaoBaldeioId(caminhoes[0]?.id || '')
    setPilhaDestinoId(pilhas[0]?.id || '')
    setDataHoraDescarga(new Date().toISOString().slice(0, 16))
    setVolumeSr(42)
    setPesoBrutoT(48)
    setPesoTaraT(15)
    setStatusAceite('aceito')
    setMotivoRejeicao('')
    setConferenteNome(user?.name || '')
    setModalOpen(true)
  }

  const handleOpenEdit = (item: HistoricoDescarga) => {
    setEditingItem(item)
    setCaminhaoBaldeioId(item.caminhao_baldeio_id)
    setPilhaDestinoId(item.pilha_destino_id)
    setDataHoraDescarga(item.data_hora_descarga)
    setVolumeSr(item.volume_sr)
    setPesoBrutoT(item.peso_bruto_t ?? '')
    setPesoTaraT(item.peso_tara_t ?? '')
    setStatusAceite(item.status_aceite)
    setMotivoRejeicao(item.motivo_rejeicao || '')
    setConferenteNome(item.conferente_nome || '')
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!caminhaoBaldeioId || !pilhaDestinoId || volumeSr === '') {
      toast.error('Preencha os campos obrigatórios.')
      return
    }

    setSaving(true)
    try {
      const payload: Partial<HistoricoDescarga> = {
        conversao_sr_id: conversaoVigente?.id,
        caminhao_baldeio_id: caminhaoBaldeioId,
        pilha_destino_id: pilhaDestinoId,
        data_hora_descarga: dataHoraDescarga,
        volume_sr: Number(volumeSr),
        volume_m3_calculado: volumeM3Calculado,
        peso_bruto_t: pesoBrutoT === '' ? undefined : Number(pesoBrutoT),
        peso_tara_t: pesoTaraT === '' ? undefined : Number(pesoTaraT),
        peso_liquido_t: pesoLiquidoT,
        status_aceite: statusAceite,
        motivo_rejeicao: statusAceite === 'rejeitado' ? motivoRejeicao.trim() : '',
        conferente_nome: conferenteNome.trim() || user?.name || 'Conferente',
      }

      if (editingItem) {
        await apiService.updateHistoricoDescarga(editingItem.id, payload)
        toast.success('Recebimento atualizado com sucesso')
      } else {
        await apiService.createHistoricoDescarga(payload)
        toast.success(
          statusAceite === 'aceito'
            ? 'Carga aceita! Volume incorporado ao estoque da pilha.'
            : 'Recebimento registrado com status Rejeitado/Pendente.',
        )
      }

      setModalOpen(false)
      loadData()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Erro ao salvar descarga')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!itemToDelete) return
    try {
      await apiService.deleteHistoricoDescarga(itemToDelete.id)
      toast.success('Registro de descarga excluído')
      setDeleteDialogOpen(false)
      setItemToDelete(null)
      loadData()
    } catch (err: any) {
      console.error(err)
      toast.error('Erro ao excluir descarga')
    }
  }

  const filtered = registros.filter((r) => {
    const cam = r.expand?.caminhao_baldeio_id?.placa_baldeio || ''
    const pil = r.expand?.pilha_destino_id?.codigo || ''
    const conf = r.conferente_nome || ''
    const ord = r.ordem || ''
    return (
      cam.toLowerCase().includes(search.toLowerCase()) ||
      pil.toLowerCase().includes(search.toLowerCase()) ||
      conf.toLowerCase().includes(search.toLowerCase()) ||
      ord.toLowerCase().includes(search.toLowerCase())
    )
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A2E1A] flex items-center gap-2">
            <ArrowDownToLine className="w-6 h-6 text-[#2E7D32]" />
            Histórico de Descarga (Recebimento no Pátio)
          </h1>
          <p className="text-sm text-[#5A6D5A]">
            Ponto de entrada no estoque: somente cargas com status <strong>ACEITO</strong> integram
            o saldo da pilha.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-[#1B5E20] hover:bg-[#14521A] text-white">
          <Plus className="w-4 h-4 mr-2" />
          Novo Recebimento / Descarga
        </Button>
      </div>

      <Card className="border-[#DDE4DE] shadow-xs">
        <CardHeader className="p-4 border-b border-[#DDE4DE] bg-neutral-50/50">
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5A6D5A]" />
              <Input
                placeholder="Buscar veículo, pilha ou conferente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 border-[#DDE4DE] text-xs"
              />
            </div>
            <span className="text-xs text-[#5A6D5A]">
              Total: <strong>{filtered.length}</strong> descargas
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-[#5A6D5A] gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#1B5E20]" />
              <span className="text-xs">Carregando recebimentos...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-[#5A6D5A] text-xs">
              Nenhuma descarga registrada no pátio.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F7F5] border-b border-[#DDE4DE] text-[#5A6D5A] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Data/Hora</th>
                  <th className="py-3 px-4">Ordem</th>
                  <th className="py-3 px-4">Veículo Baldeio</th>
                  <th className="py-3 px-4">Máquina (P. Ordens)</th>
                  <th className="py-3 px-4 text-right">Horímetro</th>
                  <th className="py-3 px-4 text-right">Litragem</th>
                  <th className="py-3 px-4">Status Operação</th>
                  <th className="py-3 px-4">Pilha Destino</th>
                  <th className="py-3 px-4 text-right">Volume SR</th>
                  <th className="py-3 px-4 text-right">Volume m³ (Calculado)</th>
                  <th className="py-3 px-4 text-right">Peso Líquido (t)</th>
                  <th className="py-3 px-4 text-center">Status Aceite</th>
                  <th className="py-3 px-4">Conferente</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE4DE]">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-[#5A6D5A]">
                      {item.data_hora_descarga.replace('T', ' ')}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs font-semibold text-[#1A2E1A]">
                      {item.ordem || '-'}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-[#1A2E1A]">
                      {item.expand?.caminhao_baldeio_id?.placa_baldeio || 'Veículo'}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-[#1A2E1A]">
                      {item.expand?.maquina_id?.p_ordens || '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      {formatHorimetro(item.horimetro)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">{formatLitros(item)}</td>
                    <td className="py-3 px-4 text-[#5A6D5A]">{formatStatusOperacao(item)}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-[#1B5E20]">
                      {item.expand?.pilha_destino_id?.codigo || '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#1A2E1A]">
                      {item.volume_sr.toFixed(1)} SR
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-800">
                      {item.volume_m3_calculado.toFixed(2)} m³
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[#5A6D5A]">
                      {item.peso_liquido_t ? `${item.peso_liquido_t.toFixed(1)} t` : '-'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge
                        variant="outline"
                        className={
                          item.status_aceite === 'aceito'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : item.status_aceite === 'rejeitado'
                              ? 'bg-red-50 text-red-700 border-red-300'
                              : 'bg-amber-50 text-amber-700 border-amber-300'
                        }
                      >
                        {item.status_aceite === 'aceito'
                          ? 'Aceito (No Estoque)'
                          : item.status_aceite === 'rejeitado'
                            ? 'Rejeitado'
                            : 'Pendente'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-[#1A2E1A]">{item.conferente_nome || '-'}</td>
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
              {editingItem ? 'Editar Recebimento' : 'Novo Recebimento de Descarga no Pátio'}
            </DialogTitle>
            <DialogDescription className="text-xs text-[#5A6D5A]">
              Ponto de entrada no estoque físico calculado.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Data/Hora Descarga *</Label>
                <Input
                  type="datetime-local"
                  value={dataHoraDescarga}
                  onChange={(e) => setDataHoraDescarga(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Pilha de Destino *</Label>
                <Select value={pilhaDestinoId} onValueChange={setPilhaDestinoId}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {pilhas.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.codigo} {p.is_mista ? '(Pilha Mista)' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Veículo de Baldeio *</Label>
              <Select value={caminhaoBaldeioId} onValueChange={setCaminhaoBaldeioId}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Selecione o veículo" />
                </SelectTrigger>
                <SelectContent>
                  {caminhoes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.placa_baldeio} - {c.modelo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Volume SR recebido */}
            <div className="p-3 bg-neutral-50 rounded-lg border border-[#DDE4DE] space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-[#1A2E1A]">
                  Volume Recebido em SR *
                </Label>
                <span className="text-[11px] text-[#5A6D5A]">
                  Fator vigente: {fatorConversao} m³/SR
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 items-center">
                <Input
                  type="number"
                  step="0.1"
                  placeholder="42"
                  value={volumeSr}
                  onChange={(e) => setVolumeSr(e.target.value === '' ? '' : Number(e.target.value))}
                  className="h-9 font-mono font-bold"
                  required
                />
                <div className="text-xs font-mono bg-white p-2 rounded border border-[#DDE4DE] text-right text-emerald-800">
                  = <strong>{volumeM3Calculado.toFixed(2)}</strong> m³ entrada
                </div>
              </div>
            </div>

            {/* Pesagem opcional (informativa de calibração dimensional) */}
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label className="text-[11px]">Peso Bruto (t)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="48.5"
                  value={pesoBrutoT}
                  onChange={(e) =>
                    setPesoBrutoT(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="h-9 font-mono text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px]">Tara (t)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="15.0"
                  value={pesoTaraT}
                  onChange={(e) =>
                    setPesoTaraT(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="h-9 font-mono text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px]">Líquido (t)</Label>
                <div className="h-9 flex items-center justify-end px-2 font-mono text-xs bg-neutral-100 rounded border border-[#DDE4DE]">
                  {pesoLiquidoT !== undefined ? `${pesoLiquidoT.toFixed(1)} t` : '-'}
                </div>
              </div>
            </div>

            {/* Status de Aceite */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Status de Aceite *</Label>
              <Select value={statusAceite} onValueChange={(val: any) => setStatusAceite(val)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aceito">Aceito (Lança entrada no estoque da pilha)</SelectItem>
                  <SelectItem value="rejeitado">Rejeitado (Não entra no estoque)</SelectItem>
                  <SelectItem value="pendente">Pendente de Avaliação</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {statusAceite === 'rejeitado' && (
              <div className="space-y-1">
                <Label className="text-xs text-red-700">Motivo da Rejeição *</Label>
                <Input
                  placeholder="Ex: Toras com apodrecimento / fora do padrão"
                  value={motivoRejeicao}
                  onChange={(e) => setMotivoRejeicao(e.target.value)}
                  className="h-9 border-red-300"
                  required
                />
              </div>
            )}

            <div className="space-y-1">
              <Label className="text-xs">Conferente Responsável</Label>
              <Input
                placeholder="Nome do conferente"
                value={conferenteNome}
                onChange={(e) => setConferenteNome(e.target.value)}
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
                Registrar Descarga
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#C62828]">
              Excluir Registro de Descarga?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Tem certeza que deseja excluir esta descarga? O estoque da pilha será recalculado
              automaticamente.
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
