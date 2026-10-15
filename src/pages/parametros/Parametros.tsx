import React, { useEffect, useState } from 'react'
import { apiService } from '@/services/florestalApi'
import { useAuth } from '@/context/AuthContext'
import { ParametroOperacional } from '@/types/florestal'
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
import { Settings, Plus, Loader2, Info, Pencil, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'

export default function ParametrosPage() {
  const { user } = useAuth()
  const isAdmin = user?.papel === 'admin'

  const [parametros, setParametros] = useState<ParametroOperacional[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingItem, setEditingItem] = useState<ParametroOperacional | null>(null)

  // Form states
  const [chave, setChave] = useState('')
  const [descricao, setDescricao] = useState('')
  const [etapaOrigem, setEtapaOrigem] = useState('')
  const [etapaDestino, setEtapaDestino] = useState('')
  const [baseComparacao, setBaseComparacao] = useState('')
  const [fatorValor, setFatorValor] = useState<number | ''>(1.0)
  const [unidade, setUnidade] = useState('fator')
  const [versao, setVersao] = useState('v1')
  const [vigenciaInicio, setVigenciaInicio] = useState(new Date().toISOString().split('T')[0])
  const [vigenciaFim, setVigenciaFim] = useState('')
  const [isVigente, setIsVigente] = useState(true)
  const [emailAlertas, setEmailAlertas] = useState('')

  const loadData = async () => {
    setLoading(true)
    try {
      const list = await apiService.getParametrosOperacionais()
      setParametros(list)
    } catch (err) {
      console.error(err)
      toast.error('Erro ao carregar parâmetros operacionais')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenCreate = () => {
    setEditingItem(null)
    setChave('')
    setDescricao('')
    setEtapaOrigem('')
    setEtapaDestino('')
    setBaseComparacao('')
    setFatorValor(1.0)
    setUnidade('fator')
    setVersao(`v${parametros.length + 1}`)
    setVigenciaInicio(new Date().toISOString().split('T')[0])
    setVigenciaFim('')
    setIsVigente(true)
    setEmailAlertas(user?.email || '')
    setModalOpen(true)
  }

  const handleOpenEdit = (item: ParametroOperacional) => {
    setEditingItem(item)
    setChave(item.chave)
    setDescricao(item.descricao)
    setEtapaOrigem(item.etapa_origem || '')
    setEtapaDestino(item.etapa_destino || '')
    setBaseComparacao(item.base_comparacao || '')
    setFatorValor(item.fator_valor)
    setUnidade(item.unidade || 'fator')
    setVersao(item.versao || 'v1')
    setVigenciaInicio(item.vigencia_inicio || new Date().toISOString().split('T')[0])
    setVigenciaFim(item.vigencia_fim || '')
    setIsVigente(item.is_vigente)
    setEmailAlertas(item.email_alertas || '')
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAdmin) {
      toast.error('Permissão negada. Apenas Administradores podem alterar parâmetros operacionais.')
      return
    }

    if (!chave.trim() || !descricao.trim() || fatorValor === '') {
      toast.error('Preencha os campos obrigatórios')
      return
    }

    setSaving(true)
    try {
      await apiService.saveParametroOperacional({
        chave: chave.trim().toLowerCase(),
        descricao: descricao.trim(),
        etapa_origem: etapaOrigem.trim() || undefined,
        etapa_destino: etapaDestino.trim() || undefined,
        base_comparacao: baseComparacao.trim() || undefined,
        fator_valor: Number(fatorValor),
        unidade: unidade.trim() || undefined,
        versao: versao.trim() || 'v1',
        vigencia_inicio: vigenciaInicio,
        vigencia_fim: vigenciaFim || undefined,
        is_vigente: isVigente,
        email_alertas: emailAlertas.trim() || undefined,
      })
      toast.success('Parâmetro operacional salvo com sucesso!')
      setModalOpen(false)
      loadData()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Erro ao salvar parâmetro operacional')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A2E1A] flex items-center gap-2">
            <Settings className="w-6 h-6 text-[#1B5E20]" />
            Parâmetros Operacionais & Fatores Florestais (Núcleo B)
          </h1>
          <p className="text-sm text-[#5A6D5A]">
            Fatores configuráveis de quebra, umidade e acomodação com etapas de origem/destino,
            bases de comparação e vigência.
          </p>
        </div>
        {isAdmin && (
          <Button onClick={handleOpenCreate} className="bg-[#1B5E20] hover:bg-[#14521A] text-white">
            <Plus className="w-4 h-4 mr-2" />
            Novo Fator / Parâmetro
          </Button>
        )}
      </div>

      {!isAdmin && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-xs text-amber-800">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
          <span>
            <strong>Acesso Somente Leitura:</strong> A edição de fatores físicos e limites
            operacionais é restrita a usuários com perfil de Administrador Florestal.
          </span>
        </div>
      )}

      {/* Referências já semeadas no Backend */}
      <div className="p-4 bg-[#E8F5E9] border border-emerald-200 rounded-xl flex items-start gap-3">
        <Info className="w-5 h-5 text-[#1B5E20] shrink-0 mt-0.5" />
        <div className="text-xs text-[#1A2E1A] leading-relaxed">
          <strong>Valores Oficiais de Referência:</strong> Redução de peso por umidade no pátio ≈{' '}
          <strong>16%</strong> (fator multiplicador <strong>0,84</strong>); Redução volumétrica por
          acomodação/casca ≈ <strong>5%</strong> (fator <strong>0,95</strong>); Limiar para alertas
          automáticos de divergência no inventário: <strong>5,0%</strong>.
        </div>
      </div>

      <Card className="border-[#DDE4DE] shadow-xs">
        <CardHeader className="p-4 border-b border-[#DDE4DE] bg-neutral-50/50 flex flex-row items-center justify-between">
          <span className="text-xs font-semibold text-[#1A2E1A]">
            Fatores Operacionais Cadastrados ({parametros.length})
          </span>
          <span className="text-xs text-[#5A6D5A]">
            Restrito a Admin: <strong className="text-[#1B5E20]">Sim</strong>
          </span>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-[#5A6D5A] gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#1B5E20]" />
              <span className="text-xs">Carregando parâmetros operacionais...</span>
            </div>
          ) : parametros.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#5A6D5A]">
              Nenhum parâmetro operacional cadastrado.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F7F5] border-b border-[#DDE4DE] text-[#5A6D5A] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Chave / Parâmetro</th>
                  <th className="py-3 px-4">Descrição</th>
                  <th className="py-3 px-4">Etapa Origem</th>
                  <th className="py-3 px-4">Etapa Destino</th>
                  <th className="py-3 px-4">Base Comparação</th>
                  <th className="py-3 px-4 text-right">Fator / Valor</th>
                  <th className="py-3 px-4 text-center">Versão</th>
                  <th className="py-3 px-4 text-center">Vigência</th>
                  {isAdmin && <th className="py-3 px-4 text-right">Ação</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE4DE]">
                {parametros.map((item) => (
                  <tr
                    key={item.id}
                    className={`transition-colors ${
                      item.is_vigente ? 'bg-emerald-50/20' : 'hover:bg-neutral-50/80 opacity-75'
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-[#1B5E20]">{item.chave}</td>
                    <td className="py-3 px-4 font-medium text-[#1A2E1A] max-w-xs">
                      {item.descricao}
                    </td>
                    <td className="py-3 px-4 text-[#5A6D5A]">{item.etapa_origem || 'Geral'}</td>
                    <td className="py-3 px-4 text-[#5A6D5A]">{item.etapa_destino || 'Geral'}</td>
                    <td className="py-3 px-4 text-[#1A2E1A] font-medium">
                      {item.base_comparacao || '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#1A2E1A]">
                      {item.fator_valor} {item.unidade || ''}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-[#5A6D5A]">
                      {item.versao || 'v1'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {item.is_vigente ? (
                        <Badge className="bg-emerald-600 text-white text-[10px] font-bold">
                          Vigente
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-neutral-500">
                          Inativo
                        </Badge>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(item)}
                          className="h-7 text-xs text-[#1B5E20] hover:bg-emerald-50"
                        >
                          <Pencil className="w-3 h-3 mr-1" />
                          Editar
                        </Button>
                      </td>
                    )}
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
              {editingItem ? 'Editar Parâmetro Operacional' : 'Novo Parâmetro Operacional'}
            </DialogTitle>
            <DialogDescription className="text-xs text-[#5A6D5A]">
              Defina fatores de conversão física e regras de alerta da cadeia florestal.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Chave Única do Parâmetro *</Label>
                <Input
                  placeholder="ex: reducao_peso_umidade"
                  value={chave}
                  onChange={(e) => setChave(e.target.value)}
                  disabled={!!editingItem}
                  className="h-9 font-mono lowercase"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Versão do Parâmetro</Label>
                <Input
                  placeholder="v1"
                  value={versao}
                  onChange={(e) => setVersao(e.target.value)}
                  className="h-9 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Descrição do Parâmetro *</Label>
              <Input
                placeholder="Ex: Redução de peso por perda de umidade no pátio (~16%)"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="h-9"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Etapa de Origem</Label>
                <Input
                  placeholder="Ex: Talhão / Baldeio"
                  value={etapaOrigem}
                  onChange={(e) => setEtapaOrigem(e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Etapa de Destino</Label>
                <Input
                  placeholder="Ex: Pátio / Descarga"
                  value={etapaDestino}
                  onChange={(e) => setEtapaDestino(e.target.value)}
                  className="h-9"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Base de Comparação</Label>
                <Input
                  placeholder="Ex: Peso em Toneladas"
                  value={baseComparacao}
                  onChange={(e) => setBaseComparacao(e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Fator / Valor *</Label>
                <Input
                  type="number"
                  step="0.0001"
                  placeholder="0.84"
                  value={fatorValor}
                  onChange={(e) =>
                    setFatorValor(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="h-9 font-mono font-bold"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Unidade</Label>
                <Input
                  placeholder="fator ou %"
                  value={unidade}
                  onChange={(e) => setUnidade(e.target.value)}
                  className="h-9"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Início da Vigência</Label>
                <Input
                  type="date"
                  value={vigenciaInicio}
                  onChange={(e) => setVigenciaInicio(e.target.value)}
                  className="h-9"
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

            <div className="space-y-1">
              <Label className="text-xs">E-mail para Notificação de Divergência</Label>
              <Input
                type="email"
                placeholder="gerencia.florestal@julitago.com.br"
                value={emailAlertas}
                onChange={(e) => setEmailAlertas(e.target.value)}
                className="h-9"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="is_vigente_param"
                checked={isVigente}
                onChange={(e) => setIsVigente(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-[#1B5E20] focus:ring-[#1B5E20]"
              />
              <Label htmlFor="is_vigente_param" className="text-xs cursor-pointer">
                Parâmetro operacional vigente e ativo para regras de cálculo
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
                Salvar Parâmetro
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
