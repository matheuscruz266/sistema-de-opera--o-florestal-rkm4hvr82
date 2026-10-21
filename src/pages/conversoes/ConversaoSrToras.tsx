import React, { useEffect, useState } from 'react'
import { apiService } from '@/services/florestalApi'
import { ConversaoSrToras } from '@/types/florestal'
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
import { FileSpreadsheet, Plus, CheckCircle, Loader2, Info } from 'lucide-react'
import { toast } from 'sonner'

export default function ConversaoSrTorasPage() {
  const [conversoes, setConversoes] = useState<ConversaoSrToras[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form states
  const [identificadorSrToras, setIdentificadorSrToras] = useState('')
  const [vigenciaInicio, setVigenciaInicio] = useState(new Date().toISOString().split('T')[0])
  const [vigenciaFim, setVigenciaFim] = useState('')
  const [volumeM3Atribuido, setVolumeM3Atribuido] = useState<number | ''>('')
  const [toneladasAtribuidas, setToneladasAtribuidas] = useState<number | ''>('')
  const [isVigente, setIsVigente] = useState(true)
  const [obs, setObs] = useState('')

  const loadData = async () => {
    setLoading(true)
    try {
      const list = await apiService.getConversoesSrToras()
      setConversoes(list)
    } catch (err) {
      console.error(err)
      toast.error('Erro ao carregar conversões SR_Toras')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenCreate = () => {
    setIdentificadorSrToras('')
    setVigenciaInicio(new Date().toISOString().split('T')[0])
    setVigenciaFim('')
    setVolumeM3Atribuido('')
    setToneladasAtribuidas('')
    setIsVigente(true)
    setObs('')
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (
      !identificadorSrToras.trim() ||
      volumeM3Atribuido === '' ||
      toneladasAtribuidas === '' ||
      volumeM3Atribuido <= 0 ||
      toneladasAtribuidas <= 0
    ) {
      toast.error('Informe o identificador SR_Toras e os valores positivos de m³ e toneladas.')
      return
    }

    setSaving(true)
    try {
      await apiService.createConversaoSrToras({
        versao: identificadorSrToras.trim(),
        vigencia_inicio: vigenciaInicio,
        vigencia_fim: vigenciaFim || undefined,
        fator_m3_sr: Number(volumeM3Atribuido),
        fator_t_m3: Number(toneladasAtribuidas),
        metodo: 'Atribuição operacional por identificador SR_Toras',
        is_vigente: isVigente,
        observacoes: obs.trim(),
      })
      toast.success('Atribuição SR_Toras salva com sucesso!')
      setModalOpen(false)
      await loadData()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Erro ao salvar atribuição SR_Toras')
    } finally {
      setSaving(false)
    }
  }

  const handleAtivar = async (id: string) => {
    try {
      await apiService.setConversaoSrTorasVigente(id)
      toast.success('Atribuição definida como vigente para o identificador SR_Toras.')
      await loadData()
    } catch (err) {
      console.error(err)
      toast.error('Erro ao ativar atribuição SR_Toras')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A2E1A] flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-[#1B5E20]" />
            Atribuição por SR_Toras
          </h1>
          <p className="text-sm text-[#5A6D5A]">
            Associa cada identificador recebido pela integração a um volume e uma quantidade em
            toneladas atribuídos por evento.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-[#1B5E20] hover:bg-[#14521A] text-white">
          <Plus className="w-4 h-4 mr-2" />
          Novo Identificador
        </Button>
      </div>

      {/* Explicação da Unidade Operacional */}
      <div className="p-4 bg-[#E8F5E9] border border-emerald-200 rounded-xl flex items-start gap-3">
        <Info className="w-5 h-5 text-[#1B5E20] shrink-0 mt-0.5" />
        <div className="text-xs text-[#1A2E1A] leading-relaxed">
          <strong>Atribuição operacional:</strong> cadastre valores por identificador exatamente
          como chega em <code>sr_toras</code> (por exemplo, Bitrem ou Tritrem). Os m³ e as toneladas
          são valores atribuídos por evento, não fatores de conversão nem pesagem de balança.
        </div>
      </div>

      <Card className="border-[#DDE4DE] shadow-xs">
        <CardHeader className="p-4 border-b border-[#DDE4DE] bg-neutral-50/50">
          <span className="text-xs font-semibold text-[#1A2E1A]">
            Histórico de atribuições por identificador
          </span>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-[#5A6D5A] gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#1B5E20]" />
              <span className="text-xs">Carregando tabelas de conversão...</span>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F7F5] border-b border-[#DDE4DE] text-[#5A6D5A] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Identificador SR_Toras</th>
                  <th className="py-3 px-4">Vigência Início</th>
                  <th className="py-3 px-4">Vigência Fim</th>
                  <th className="py-3 px-4 text-right">m³ atribuídos</th>
                  <th className="py-3 px-4 text-right">Toneladas atribuídas</th>
                  <th className="py-3 px-4">Observações</th>
                  <th className="py-3 px-4 text-center">Situação</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE4DE]">
                {conversoes.map((item) => (
                  <tr
                    key={item.id}
                    className={`transition-colors ${
                      item.is_vigente ? 'bg-emerald-50/40 font-medium' : 'hover:bg-neutral-50/80'
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-[#1B5E20]">{item.versao}</td>
                    <td className="py-3 px-4 font-mono text-[#5A6D5A]">{item.vigencia_inicio}</td>
                    <td className="py-3 px-4 font-mono text-[#5A6D5A]">
                      {item.vigencia_fim || 'Em aberto'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#1A2E1A]">
                      {item.fator_m3_sr.toFixed(2)} m³
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#1A2E1A]">
                      {item.fator_t_m3.toFixed(2)} t
                    </td>
                    <td className="py-3 px-4 text-[#5A6D5A]">{item.observacoes || '—'}</td>
                    <td className="py-3 px-4 text-center">
                      {item.is_vigente ? (
                        <Badge className="bg-emerald-600 text-white text-[10px] font-bold">
                          Vigente para este identificador
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-[10px] text-neutral-500 border-neutral-300"
                        >
                          Histórico
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {!item.is_vigente && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAtivar(item.id)}
                          className="h-7 text-xs border-[#1B5E20] text-[#1B5E20] hover:bg-[#E8F5E9]"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Ativar atribuição
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* MODAL NOVA VERSÃO */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg text-[#1A2E1A]">Nova atribuição — SR_Toras</DialogTitle>
            <DialogDescription className="text-xs text-[#5A6D5A]">
              Use o mesmo identificador de texto enviado pela integração.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Identificador SR_Toras *</Label>
                <Input
                  placeholder="Bitrem"
                  value={identificadorSrToras}
                  onChange={(e) => setIdentificadorSrToras(e.target.value)}
                  className="h-9 font-mono uppercase font-bold"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Início de Vigência *</Label>
                <Input
                  type="date"
                  value={vigenciaInicio}
                  onChange={(e) => setVigenciaInicio(e.target.value)}
                  className="h-9"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">m³ atribuídos por evento *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="Informe o valor"
                  value={volumeM3Atribuido}
                  onChange={(e) =>
                    setVolumeM3Atribuido(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="h-9 font-mono font-bold"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Toneladas atribuídas por evento *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="Informe o valor"
                  value={toneladasAtribuidas}
                  onChange={(e) =>
                    setToneladasAtribuidas(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="h-9 font-mono font-bold"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Observações / Justificativa</Label>
              <Input
                placeholder="Ex: Ajuste após auditoria dimensional do lote"
                value={obs}
                onChange={(e) => setObs(e.target.value)}
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
                Salvar atribuição
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
