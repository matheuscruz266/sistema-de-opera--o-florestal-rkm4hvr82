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
  IntegracaoCredencial,
  IntegracaoLog,
  IngestaoD2ItemPayload,
  IngestaoD2Response,
  GoogleSheetsConfigRecord,
  GoogleSheetsTestResponse,
  GoogleSheetsSyncResponse,
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

  // ==========================================
  // Integrações de Dados & Ingestão API
  // ==========================================
  async getIntegracoes(): Promise<IntegracaoCredencial[]> {
    return await pb
      .collection('integracao_credenciais')
      .getFullList<IntegracaoCredencial>({ sort: '-created' })
  },

  async createIntegracao(data: {
    nome: string
    tipo: 'picador_d2' | 'app_campo' | 'balanca_terceiros' | 'outro'
    descricao?: string
    api_key?: string
  }): Promise<IntegracaoCredencial> {
    // Se não informada chave, gera aleatória segura com prefixo sof_
    const randomSuffix = Array.from(crypto.getRandomValues(new Uint8Array(18)))
      .map((b) => b.toString(36))
      .join('')
      .slice(0, 24)
    const apiKey =
      data.api_key || `sof_live_${data.tipo === 'picador_d2' ? 'd2' : 'api'}_${randomSuffix}`

    return await pb.collection('integracao_credenciais').create<IntegracaoCredencial>({
      nome: data.nome,
      tipo: data.tipo,
      api_key: apiKey,
      is_ativa: true,
      descricao: data.descricao || '',
    })
  },

  async updateIntegracao(
    id: string,
    data: Partial<IntegracaoCredencial>,
  ): Promise<IntegracaoCredencial> {
    return await pb.collection('integracao_credenciais').update<IntegracaoCredencial>(id, data)
  },

  async toggleIntegracaoAtiva(id: string, is_ativa: boolean): Promise<IntegracaoCredencial> {
    return await pb
      .collection('integracao_credenciais')
      .update<IntegracaoCredencial>(id, { is_ativa })
  },

  async deleteIntegracao(id: string): Promise<boolean> {
    return await pb.collection('integracao_credenciais').delete(id)
  },

  async getLogsIngestao(filtro?: {
    credencialId?: string
    status?: string
    limite?: number
    page?: number
  }): Promise<{ items: IntegracaoLog[]; totalItems: number; totalPages: number }> {
    const filters: string[] = []
    if (filtro?.credencialId && filtro.credencialId !== 'todas') {
      filters.push(`credencial_id = '${filtro.credencialId}'`)
    }
    if (filtro?.status && filtro.status !== 'todos') {
      filters.push(`status = '${filtro.status}'`)
    }
    const filterStr = filters.join(' && ')
    const page = filtro?.page || 1
    const perPage = filtro?.limite || 20

    const res = await pb.collection('integracao_logs').getList<IntegracaoLog>(page, perPage, {
      filter: filterStr,
      sort: '-timestamp_evento',
      expand: 'credencial_id',
    })

    return {
      items: res.items,
      totalItems: res.totalItems,
      totalPages: res.totalPages,
    }
  },

  // Testar conectividade do endpoint via SDK send
  async testarConectividadeApiKey(apiKey: string): Promise<{
    autenticado: boolean
    integracao?: {
      id: string
      nome: string
      tipo: string
      is_ativa: boolean
      ultimo_uso?: string
    }
    servidor_timestamp?: string
    status?: string
    erro?: string
  }> {
    try {
      const res = await pb.send('/backend/v1/ingestao/status', {
        headers: {
          'X-API-Key': apiKey,
        },
      })
      return res
    } catch (err: any) {
      return {
        autenticado: false,
        erro: err?.data?.erro || err?.message || 'Falha ao conectar com o endpoint de status',
      }
    }
  },

  // Simular/Enviar Ingestão manual via SDK
  async enviarIngestaoD2(
    apiKey: string,
    payload: IngestaoD2ItemPayload | IngestaoD2ItemPayload[],
  ): Promise<IngestaoD2Response> {
    const res = await pb.send<IngestaoD2Response>('/backend/v1/ingestao/d2', {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
      },
      body: payload,
    })
    return res
  },

  // ==========================================
  // GOOGLE SHEETS D2 (PICADOR BRF TOLEDO)
  // ==========================================

  // Obter ou criar configuração da integração Google Sheets
  async getGoogleSheetsConfig(): Promise<GoogleSheetsConfigRecord | null> {
    try {
      const records = await pb
        .collection('google_sheets_config')
        .getList<GoogleSheetsConfigRecord>(1, 1, {
          sort: '-created',
        })
      if (records.items.length > 0) {
        return records.items[0]
      }
      return null
    } catch (err) {
      console.warn('Erro ao carregar google_sheets_config:', err)
      return null
    }
  },

  // Salvar configuração (cria ou atualiza)
  async salvarGoogleSheetsConfig(
    dados: Partial<GoogleSheetsConfigRecord>,
  ): Promise<GoogleSheetsConfigRecord> {
    const configs = await pb
      .collection('google_sheets_config')
      .getList<GoogleSheetsConfigRecord>(1, 1, {
        sort: '-created',
      })
    if (configs.items.length > 0) {
      return await pb
        .collection('google_sheets_config')
        .update<GoogleSheetsConfigRecord>(configs.items[0].id, dados)
    } else {
      return await pb.collection('google_sheets_config').create<GoogleSheetsConfigRecord>({
        nome: dados.nome || 'D2 Picador BRF Toledo',
        spreadsheet_id: dados.spreadsheet_id || '',
        sheet_range: dados.sheet_range || 'A1:Z50',
        client_email: dados.client_email || '',
        project_id: dados.project_id || '',
        private_key: dados.private_key || '',
        is_ativa: dados.is_ativa !== undefined ? dados.is_ativa : true,
        sincronizacao_automatica: dados.sincronizacao_automatica || false,
        intervalo_minutos: dados.intervalo_minutos || 15,
        linhas_ingeridas_total: 0,
        ultimo_status: 'pendente',
      })
    }
  },

  // Testar conexão com a API Google Sheets no backend
  async testarGoogleSheets(params: {
    spreadsheet_id: string
    sheet_range?: string
    signed_jwt?: string
    access_token?: string
  }): Promise<GoogleSheetsTestResponse> {
    try {
      const res = await pb.send<GoogleSheetsTestResponse>('/backend/v1/sheets/testar', {
        method: 'POST',
        body: params,
      })
      return res
    } catch (err: any) {
      return {
        sucesso: false,
        erro: err?.data?.erro || err?.message || 'Falha ao testar conexão com o Google Sheets.',
        instrucao: err?.data?.instrucao,
      }
    }
  },

  // Sincronizar planilha Google Sheets com o histórico de picador
  async sincronizarGoogleSheets(params: {
    spreadsheet_id: string
    sheet_range?: string
    signed_jwt?: string
    access_token?: string
  }): Promise<GoogleSheetsSyncResponse> {
    try {
      const res = await pb.send<GoogleSheetsSyncResponse>('/backend/v1/sheets/sincronizar', {
        method: 'POST',
        body: params,
      })
      return res
    } catch (err: any) {
      return {
        sucesso: false,
        status: 'erro',
        mensagem: err?.data?.erro || err?.message || 'Falha ao sincronizar dados da planilha.',
        aceitos: 0,
        rejeitados: 0,
        itens: [],
        erro: err?.data?.erro || err?.message,
        instrucao: err?.data?.instrucao,
      }
    }
  },
}
