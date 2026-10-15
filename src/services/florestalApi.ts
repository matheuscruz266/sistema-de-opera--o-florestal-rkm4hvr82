import pb from '@/lib/pocketbase/client'
import {
  Fazenda,
  Talhao,
  Maquina,
  Caminhao,
  CaminhaoBaldeio,
  Pilha,
  Motivo,
  ConversaoSrToras,
  ConversaoSrCavaco,
  ParametroOperacional,
  HistoricoFeller,
  HistoricoSkidder,
  HistoricoBaldeio,
  HistoricoDescarga,
  HistoricoPicador,
  InventarioPilha,
  ConciliacaoAlerta,
  ConciliacaoAjuste,
  ConciliacaoDivergenciaHist,
  UserRecord,
} from '@/types/florestal'

export const apiService = {
  // Usuários
  async getUsuarios(): Promise<UserRecord[]> {
    return await pb.collection('users').getFullList<UserRecord>({ sort: 'name' })
  },
  async createUsuario(data: Partial<UserRecord> & { password?: string }): Promise<UserRecord> {
    return await pb.collection('users').create<UserRecord>(data)
  },
  async updateUsuario(id: string, data: Partial<UserRecord>): Promise<UserRecord> {
    return await pb.collection('users').update<UserRecord>(id, data)
  },
  async deleteUsuario(id: string): Promise<boolean> {
    return await pb.collection('users').delete(id)
  },

  // Fazendas
  async getFazendas(): Promise<Fazenda[]> {
    return await pb.collection('fazendas').getFullList<Fazenda>({ sort: 'nome' })
  },
  async createFazenda(data: Partial<Fazenda>): Promise<Fazenda> {
    return await pb.collection('fazendas').create<Fazenda>(data)
  },
  async updateFazenda(id: string, data: Partial<Fazenda>): Promise<Fazenda> {
    return await pb.collection('fazendas').update<Fazenda>(id, data)
  },
  async deleteFazenda(id: string): Promise<boolean> {
    return await pb.collection('fazendas').delete(id)
  },

  // Talhões
  async getTalhoes(fazendaId?: string): Promise<Talhao[]> {
    const filter = fazendaId ? `fazenda_id = '${fazendaId}'` : ''
    return await pb.collection('talhoes').getFullList<Talhao>({
      filter,
      sort: 'talhao',
      expand: 'fazenda_id',
    })
  },
  async createTalhao(data: Partial<Talhao>): Promise<Talhao> {
    return await pb.collection('talhoes').create<Talhao>(data)
  },
  async updateTalhao(id: string, data: Partial<Talhao>): Promise<Talhao> {
    return await pb.collection('talhoes').update<Talhao>(id, data)
  },
  async deleteTalhao(id: string): Promise<boolean> {
    return await pb.collection('talhoes').delete(id)
  },

  // Máquinas
  async getMaquinas(fazendaId?: string): Promise<Maquina[]> {
    const filter = fazendaId ? `fazenda_id = '${fazendaId}'` : ''
    return await pb.collection('maquinas').getFullList<Maquina>({
      filter,
      sort: 'id_maquina',
      expand: 'fazenda_id',
    })
  },
  async createMaquina(data: Partial<Maquina>): Promise<Maquina> {
    return await pb.collection('maquinas').create<Maquina>(data)
  },
  async updateMaquina(id: string, data: Partial<Maquina>): Promise<Maquina> {
    return await pb.collection('maquinas').update<Maquina>(id, data)
  },
  async deleteMaquina(id: string): Promise<boolean> {
    return await pb.collection('maquinas').delete(id)
  },

  // Caminhões
  async getCaminhoes(): Promise<Caminhao[]> {
    return await pb.collection('caminhoes').getFullList<Caminhao>({ sort: 'placa' })
  },
  async createCaminhao(data: Partial<Caminhao>): Promise<Caminhao> {
    return await pb.collection('caminhoes').create<Caminhao>(data)
  },
  async updateCaminhao(id: string, data: Partial<Caminhao>): Promise<Caminhao> {
    return await pb.collection('caminhoes').update<Caminhao>(id, data)
  },
  async deleteCaminhao(id: string): Promise<boolean> {
    return await pb.collection('caminhoes').delete(id)
  },

  // Caminhões de Baldeio
  async getCaminhoesBaldeio(): Promise<CaminhaoBaldeio[]> {
    return await pb
      .collection('caminhao_baldeio')
      .getFullList<CaminhaoBaldeio>({ sort: 'placa_baldeio' })
  },
  async createCaminhaoBaldeio(data: Partial<CaminhaoBaldeio>): Promise<CaminhaoBaldeio> {
    return await pb.collection('caminhao_baldeio').create<CaminhaoBaldeio>(data)
  },
  async updateCaminhaoBaldeio(
    id: string,
    data: Partial<CaminhaoBaldeio>,
  ): Promise<CaminhaoBaldeio> {
    return await pb.collection('caminhao_baldeio').update<CaminhaoBaldeio>(id, data)
  },
  async deleteCaminhaoBaldeio(id: string): Promise<boolean> {
    return await pb.collection('caminhao_baldeio').delete(id)
  },

  // Pilhas
  async getPilhas(fazendaId?: string): Promise<Pilha[]> {
    const filter = fazendaId ? `fazenda_id = '${fazendaId}'` : ''
    return await pb.collection('pilhas').getFullList<Pilha>({
      filter,
      sort: 'codigo',
      expand: 'fazenda_id,talhao_id',
    })
  },
  async getPilhaById(id: string): Promise<Pilha> {
    return await pb.collection('pilhas').getOne<Pilha>(id, {
      expand: 'fazenda_id,talhao_id',
    })
  },
  async createPilha(data: Partial<Pilha>): Promise<Pilha> {
    return await pb.collection('pilhas').create<Pilha>(data)
  },
  async updatePilha(id: string, data: Partial<Pilha>): Promise<Pilha> {
    return await pb.collection('pilhas').update<Pilha>(id, data)
  },
  async deletePilha(id: string): Promise<boolean> {
    return await pb.collection('pilhas').delete(id)
  },

  // Motivos
  async getMotivos(): Promise<Motivo[]> {
    return await pb.collection('motivos').getFullList<Motivo>({ sort: 'id_motivo' })
  },
  async createMotivo(data: Partial<Motivo>): Promise<Motivo> {
    return await pb.collection('motivos').create<Motivo>(data)
  },
  async updateMotivo(id: string, data: Partial<Motivo>): Promise<Motivo> {
    return await pb.collection('motivos').update<Motivo>(id, data)
  },
  async deleteMotivo(id: string): Promise<boolean> {
    return await pb.collection('motivos').delete(id)
  },

  // Conversões SR_Toras
  async getConversoesSrToras(): Promise<ConversaoSrToras[]> {
    return await pb
      .collection('conversao_sr_toras')
      .getFullList<ConversaoSrToras>({ sort: '-created' })
  },
  async getConversaoSrTorasVigente(): Promise<ConversaoSrToras | null> {
    const res = await pb.collection('conversao_sr_toras').getList<ConversaoSrToras>(1, 1, {
      filter: 'is_vigente = true',
      sort: '-created',
    })
    return res.items[0] || null
  },
  async createConversaoSrToras(data: Partial<ConversaoSrToras>): Promise<ConversaoSrToras> {
    if (data.is_vigente) {
      // Desativa anteriores
      const all = await this.getConversoesSrToras()
      for (const c of all) {
        if (c.is_vigente) {
          await pb.collection('conversao_sr_toras').update(c.id, { is_vigente: false })
        }
      }
    }
    return await pb.collection('conversao_sr_toras').create<ConversaoSrToras>(data)
  },
  async setConversaoSrTorasVigente(id: string): Promise<void> {
    const all = await this.getConversoesSrToras()
    for (const c of all) {
      await pb.collection('conversao_sr_toras').update(c.id, { is_vigente: c.id === id })
    }
  },

  // Conversões SR_Cavaco
  async getConversoesSrCavaco(): Promise<ConversaoSrCavaco[]> {
    return await pb
      .collection('conversao_sr_cavaco')
      .getFullList<ConversaoSrCavaco>({ sort: 'id_carreta' })
  },
  async createConversaoSrCavaco(data: Partial<ConversaoSrCavaco>): Promise<ConversaoSrCavaco> {
    return await pb.collection('conversao_sr_cavaco').create<ConversaoSrCavaco>(data)
  },
  async updateConversaoSrCavaco(
    id: string,
    data: Partial<ConversaoSrCavaco>,
  ): Promise<ConversaoSrCavaco> {
    return await pb.collection('conversao_sr_cavaco').update<ConversaoSrCavaco>(id, data)
  },
  async deleteConversaoSrCavaco(id: string): Promise<boolean> {
    return await pb.collection('conversao_sr_cavaco').delete(id)
  },

  // Parâmetros Operacionais
  async getParametrosOperacionais(): Promise<ParametroOperacional[]> {
    return await pb
      .collection('parametros_operacionais')
      .getFullList<ParametroOperacional>({ sort: 'chave' })
  },
  async saveParametroOperacional(
    data: Partial<ParametroOperacional> & { chave: string },
  ): Promise<ParametroOperacional> {
    const existing = await pb
      .collection('parametros_operacionais')
      .getList<ParametroOperacional>(1, 1, {
        filter: `chave = '${data.chave}'`,
      })
    if (existing.items.length > 0) {
      return await pb
        .collection('parametros_operacionais')
        .update<ParametroOperacional>(existing.items[0].id, data)
    }
    return await pb.collection('parametros_operacionais').create<ParametroOperacional>(data)
  },

  // Históricos
  async getHistoricoFeller(): Promise<HistoricoFeller[]> {
    return await pb.collection('historico_feller').getFullList<HistoricoFeller>({
      sort: '-data_operacao',
      expand: 'talhao_id,maquina_id',
    })
  },
  async createHistoricoFeller(data: Partial<HistoricoFeller>): Promise<HistoricoFeller> {
    return await pb.collection('historico_feller').create<HistoricoFeller>(data)
  },
  async updateHistoricoFeller(
    id: string,
    data: Partial<HistoricoFeller>,
  ): Promise<HistoricoFeller> {
    return await pb.collection('historico_feller').update<HistoricoFeller>(id, data)
  },
  async deleteHistoricoFeller(id: string): Promise<boolean> {
    return await pb.collection('historico_feller').delete(id)
  },

  async getHistoricoSkidder(): Promise<HistoricoSkidder[]> {
    return await pb.collection('historico_skidder').getFullList<HistoricoSkidder>({
      sort: '-data_operacao',
      expand: 'talhao_id,maquina_id',
    })
  },
  async createHistoricoSkidder(data: Partial<HistoricoSkidder>): Promise<HistoricoSkidder> {
    return await pb.collection('historico_skidder').create<HistoricoSkidder>(data)
  },
  async updateHistoricoSkidder(
    id: string,
    data: Partial<HistoricoSkidder>,
  ): Promise<HistoricoSkidder> {
    return await pb.collection('historico_skidder').update<HistoricoSkidder>(id, data)
  },
  async deleteHistoricoSkidder(id: string): Promise<boolean> {
    return await pb.collection('historico_skidder').delete(id)
  },

  async getHistoricoBaldeio(): Promise<HistoricoBaldeio[]> {
    return await pb.collection('historico_baldeio').getFullList<HistoricoBaldeio>({
      sort: '-data_hora_saida',
      expand: 'conversao_sr_id,caminhao_baldeio_id,talhao_origem_id,pilha_destino_id',
    })
  },
  async createHistoricoBaldeio(data: Partial<HistoricoBaldeio>): Promise<HistoricoBaldeio> {
    return await pb.collection('historico_baldeio').create<HistoricoBaldeio>(data)
  },
  async updateHistoricoBaldeio(
    id: string,
    data: Partial<HistoricoBaldeio>,
  ): Promise<HistoricoBaldeio> {
    return await pb.collection('historico_baldeio').update<HistoricoBaldeio>(id, data)
  },
  async deleteHistoricoBaldeio(id: string): Promise<boolean> {
    return await pb.collection('historico_baldeio').delete(id)
  },

  async getHistoricoDescarga(): Promise<HistoricoDescarga[]> {
    return await pb.collection('historico_descarga').getFullList<HistoricoDescarga>({
      sort: '-data_hora_descarga',
      expand: 'conversao_sr_id,caminhao_baldeio_id,pilha_destino_id',
    })
  },
  async createHistoricoDescarga(data: Partial<HistoricoDescarga>): Promise<HistoricoDescarga> {
    return await pb.collection('historico_descarga').create<HistoricoDescarga>(data)
  },
  async updateHistoricoDescarga(
    id: string,
    data: Partial<HistoricoDescarga>,
  ): Promise<HistoricoDescarga> {
    return await pb.collection('historico_descarga').update<HistoricoDescarga>(id, data)
  },
  async deleteHistoricoDescarga(id: string): Promise<boolean> {
    return await pb.collection('historico_descarga').delete(id)
  },

  async getHistoricoPicador(): Promise<HistoricoPicador[]> {
    return await pb.collection('historico_picador').getFullList<HistoricoPicador>({
      sort: '-data_hora_expedicao',
      expand: 'conversao_cavaco_id,caminhao_id,pilha_origem_id',
    })
  },
  async createHistoricoPicador(data: Partial<HistoricoPicador>): Promise<HistoricoPicador> {
    return await pb.collection('historico_picador').create<HistoricoPicador>(data)
  },
  async updateHistoricoPicador(
    id: string,
    data: Partial<HistoricoPicador>,
  ): Promise<HistoricoPicador> {
    return await pb.collection('historico_picador').update<HistoricoPicador>(id, data)
  },
  async deleteHistoricoPicador(id: string): Promise<boolean> {
    return await pb.collection('historico_picador').delete(id)
  },

  // Inventário ToraCerta
  async getInventariosPilha(pilhaId?: string): Promise<InventarioPilha[]> {
    const filter = pilhaId ? `pilha_id = '${pilhaId}'` : ''
    return await pb.collection('inventario_pilha').getFullList<InventarioPilha>({
      filter,
      sort: '-data_inventario',
      expand: 'pilha_id,talhao_referencia_id',
    })
  },
  async createInventarioPilha(data: Partial<InventarioPilha>): Promise<InventarioPilha> {
    return await pb.collection('inventario_pilha').create<InventarioPilha>(data)
  },
  async updateInventarioPilha(
    id: string,
    data: Partial<InventarioPilha>,
  ): Promise<InventarioPilha> {
    return await pb.collection('inventario_pilha').update<InventarioPilha>(id, data)
  },
  async deleteInventarioPilha(id: string): Promise<boolean> {
    return await pb.collection('inventario_pilha').delete(id)
  },

  // Conciliação e Alertas
  async getAlertas(pilhaId?: string): Promise<ConciliacaoAlerta[]> {
    const filter = pilhaId ? `pilha_id = '${pilhaId}'` : ''
    return await pb.collection('conciliacao_alertas').getFullList<ConciliacaoAlerta>({
      filter,
      sort: '-created',
      expand: 'pilha_id',
    })
  },
  async updateAlerta(id: string, data: Partial<ConciliacaoAlerta>): Promise<ConciliacaoAlerta> {
    return await pb.collection('conciliacao_alertas').update<ConciliacaoAlerta>(id, data)
  },
  async getHistoricoAlerta(alertaId: string): Promise<ConciliacaoDivergenciaHist[]> {
    return await pb
      .collection('conciliacao_divergencias_hist')
      .getFullList<ConciliacaoDivergenciaHist>({
        filter: `alerta_id = '${alertaId}'`,
        sort: 'created',
      })
  },
  async addEventoHistAlerta(
    data: Partial<ConciliacaoDivergenciaHist>,
  ): Promise<ConciliacaoDivergenciaHist> {
    return await pb
      .collection('conciliacao_divergencias_hist')
      .create<ConciliacaoDivergenciaHist>(data)
  },
  async getAjustesConciliacao(pilhaId?: string): Promise<ConciliacaoAjuste[]> {
    const filter = pilhaId ? `pilha_id = '${pilhaId}'` : ''
    return await pb.collection('conciliacao_ajustes').getFullList<ConciliacaoAjuste>({
      filter,
      sort: '-created',
      expand: 'alerta_id,pilha_id',
    })
  },
  async createAjusteConciliacao(data: Partial<ConciliacaoAjuste>): Promise<ConciliacaoAjuste> {
    return await pb.collection('conciliacao_ajustes').create<ConciliacaoAjuste>(data)
  },
  async updateAjusteConciliacao(
    id: string,
    data: Partial<ConciliacaoAjuste>,
  ): Promise<ConciliacaoAjuste> {
    return await pb.collection('conciliacao_ajustes').update<ConciliacaoAjuste>(id, data)
  },
}
