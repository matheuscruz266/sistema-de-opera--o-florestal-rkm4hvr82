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
  const [versao, setVersao] = useState('')
  const [vigenciaInicio, setVigenciaInicio] = useState(new Date().toISOString().split('T')[0])
  const [vigenciaFim, setVigenciaFim] = useState('')
  const [fatorM3Sr, setFatorM3Sr] = useState<number | ''>(0.84)
  const [fatorTM3, setFatorTM3] = useState<number | ''>(0.95)
  const [metodo, setMetodo] = useState('Cubagem Smalian / Huber com fator de empilhamento')
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
    setVersao(`V${conversoes.length + 1}.0-${new Date().getFullYear()}`)
    setVigenciaInicio(new Date().toISOString().split('T')[0])
    setVigenciaFim('')
    setFatorM3Sr(0.84)
    setFatorTM3(0.95)
    setMetodo('Cubagem Smalian / Huber com fator de empilhamento')
    setIsVigente(true)
    setObs('')
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!versao.trim() || fatorM3Sr === '' || fatorTM3 === '') {
      toast.error('Preencha os campos obrigatórios')
      return
    }

    setSaving(true)
    try {
      await apiService.createConversaoSrToras({
        versao: versao.trim(),
        vigencia_inicio: vigenciaInicio,
        vigencia_fim: vigenciaFim || undefined,
        fator_m3_sr: Number(fatorM3Sr),
        fator_t_m3: Number(fatorTM3),
        metodo: metodo.trim(),
        is_vigente: isVigente,
        observacoes: obs.trim(),
      })
      toast.success('Nova versão da tabela de conversão SR_Toras salva com sucesso!')
      setModalOpen(false)
      loadData()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Erro ao salvar tabela de conversão')
    } finally {
      setSaving(false)
    }
  }

  const handleAtivar = async (id: string) => {
    try {
      await apiService.setConversaoSrTorasVigente(id)
      toast.success('Versão definida como vigente com sucesso!')
      loadData()
    } catch (err) {
      console.error(err)
      toast.error('Erro ao ativar versão')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A2E1A] flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-[#1B5E20]" />
            Tabela de Conversão SR_Toras (Núcleo B)
          </h1>
          <p className="text-sm text-[#5A6D5A]">
            Parametriza equivalência entre <strong>SR de toras</strong>, volume em{' '}
            <strong>m³</strong> e <strong>toneladas estimadas</strong>. Apenas UMA versão vigente
            por vez.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-[#1B5E20] hover:bg-[#14521A] text-white">
          <Plus className="w-4 h-4 mr-2" />
          Nova Versão de Conversão
        </Button>
      </div>

      {/* Explicação da Unidade Operacional */}
      <div className="p-4 bg-[#E8F5E9] border border-emerald-200 rounded-xl flex items-start gap-3">
        <Info className="w-5 h-5 text-[#1B5E20] shrink-0 mt-0.5" />
        <div className="text-xs text-[#1A2E1A] leading-relaxed">
          <strong>Definição do Sistema Florestal:</strong> O SR (Sólido Real) é a unidade
          operacional primordial que percorre toda a cadeia sem depender de balança física própria.
          As grandezas de m³ e toneladas possuem caráter <em>declaradamente ESTIMADO</em> derivado
          desta parametrização.
        </div>
      </div>

      <Card className="border-[#DDE4DE] shadow-xs">
        <CardHeader className="p-4 border-b border-[#DDE4DE] bg-neutral-50/50">
          <span className="text-xs font-semibold text-[#1A2E1A]">
            Histórico Completo de Versões e Fatores de Calibração
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
                  <th className="py-3 px-4">Versão</th>
                  <th className="py-3 px-4">Vigência Início</th>
                  <th className="py-3 px-4">Vigência Fim</th>
                  <th className="py-3 px-4 text-right">Fator m³/SR</th>
                  <th className="py-3 px-4 text-right">Fator t/m³</th>
                  <th className="py-3 px-4">Método Utilizado</th>
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
                      {item.fator_m3_sr.toFixed(4)} m³/SR
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#1A2E1A]">
                      {item.fator_t_m3.toFixed(4)} t/m³
                    </td>
                    <td className="py-3 px-4 text-[#5A6D5A]">
                      {item.metodo || 'Cubagem geométrica'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {item.is_vigente ? (
                        <Badge className="bg-emerald-600 text-white text-[10px] font-bold">
                          Vigente Oficial
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
                          Ativar Versão
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
            <DialogTitle className="text-lg text-[#1A2E1A]">Nova Versão — SR_Toras</DialogTitle>
            <DialogDescription className="text-xs text-[#5A6D5A]">
              Cadastre novos fatores calculados a partir de calibrações de campo.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Identificador da Versão *</Label>
                <Input
                  placeholder="V2.0-2025"
                  value={versao}
                  onChange={(e) => setVersao(e.target.value)}
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
                <Label className="text-xs font-semibold">Fator m³/SR *</Label>
                <Input
                  type="number"
                  step="0.0001"
                  placeholder="0.84"
                  value={fatorM3Sr}
                  onChange={(e) =>
                    setFatorM3Sr(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="h-9 font-mono font-bold"
                  required
                />
                <span className="text-[10px] text-[#5A6D5A] block">Padrão florestal: 0.84 m³</span>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Fator t/m³ (Densidade) *</Label>
                <Input
                  type="number"
                  step="0.0001"
                  placeholder="0.95"
                  value={fatorTM3}
                  onChange={(e) => setFatorTM3(e.target.value === '' ? '' : Number(e.target.value))}
                  className="h-9 font-mono font-bold"
                  required
                />
                <span className="text-[10px] text-[#5A6D5A] block">Padrão madeira: 0.95 t/m³</span>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Método Utilizado</Label>
              <Input
                placeholder="Ex: Cubagem rigorosa com fator empilhamento"
                value={metodo}
                onChange={(e) => setMetodo(e.target.value)}
                className="h-9"
              />
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
                Salvar e Ativar Versão
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
