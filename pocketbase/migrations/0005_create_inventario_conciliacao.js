migrate(
  (app) => {
    const pilhasId = app.findCollectionByNameOrId('pilhas').id
    const talhoesId = app.findCollectionByNameOrId('talhoes').id
    const conversaoSrTorasId = app.findCollectionByNameOrId('conversao_sr_toras').id

    // 1. INVENTARIO_PILHA (ToraCerta)
    // Condição física estimada da pilha em uma data.
    // Métodos: geometrico (comprimento, altura, comp toras, fator calibração) e amostragem (amostras toras, diametro médio, comp médio)
    // Status: rascunho / oficial. Registro oficial nunca excluído diretamente (correção exige justificativa e marca como 'substituido')
    const inventarioPilha = new Collection({
      name: 'inventario_pilha',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'pilha_id',
          type: 'relation',
          collectionId: pilhasId,
          cascadeDelete: false,
          maxSelect: 1,
          required: true,
        },
        {
          name: 'talhao_referencia_id',
          type: 'relation',
          collectionId: talhoesId,
          cascadeDelete: false,
          maxSelect: 1,
          required: false,
        },
        { name: 'data_inventario', type: 'text', required: true },
        { name: 'responsavel_nome', type: 'text', required: true },
        {
          name: 'metodo_escolhido',
          type: 'select',
          values: ['geometrico', 'amostragem_diametros'],
          maxSelect: 1,
          required: true,
        },
        {
          name: 'status_registro',
          type: 'select',
          values: ['rascunho', 'oficial', 'substituido'],
          maxSelect: 1,
          required: true,
        },

        // Campos do método geométrico
        { name: 'comp_pilha_m', type: 'number' },
        { name: 'alt_media_pilha_m', type: 'number' },
        { name: 'comp_toras_m', type: 'number' },
        { name: 'v_aparente_m3', type: 'number' },
        { name: 'fator_calibracao', type: 'number' }, // padrão 0.70
        { name: 'v_solido_geometrico_m3', type: 'number' },

        // Campos do método de amostragem
        { name: 'qtd_toras_amostradas', type: 'number' },
        { name: 'diametro_medio_cm', type: 'number' },
        { name: 'comp_medio_toras_m', type: 'number' },
        { name: 'v_individual_medio_m3', type: 'number' },
        { name: 'v_solido_amostragem_m3', type: 'number' },

        // Volume oficial final adotado
        { name: 'volume_oficial_m3', type: 'number', required: true },
        { name: 'justificativa_correcao', type: 'text' },
        { name: 'registro_substituido_id', type: 'text' }, // ID da medição anterior quando corrigida
        { name: 'observacoes', type: 'text' },

        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_inv_pilha_data ON inventario_pilha (pilha_id, data_inventario DESC)',
        'CREATE INDEX idx_inv_status ON inventario_pilha (status_registro)',
      ],
    })
    app.save(inventarioPilha)

    // 2. CONCILIACAO_ALERTAS
    // Divergências entre saldo calculado e inventário físico estimado
    // Alertas automáticos (quando divergência > limiar) - NUNCA correção silenciosa
    const conciliacaoAlertas = new Collection({
      name: 'conciliacao_alertas',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'pilha_id',
          type: 'relation',
          collectionId: pilhasId,
          cascadeDelete: false,
          maxSelect: 1,
          required: true,
        },
        { name: 'data_identificacao', type: 'text', required: true },
        { name: 'saldo_calculado_m3', type: 'number', required: true },
        { name: 'inventario_fisico_m3', type: 'number', required: true },
        { name: 'diferenca_m3', type: 'number', required: true },
        { name: 'diferenca_perc', type: 'number', required: true },
        { name: 'limiar_aplicado_perc', type: 'number', required: true }, // ex 5.0%
        {
          name: 'status',
          type: 'select',
          values: ['pendente', 'em_investigacao', 'ajuste_solicitado', 'resolvido', 'descartado'],
          maxSelect: 1,
          required: true,
        },
        { name: 'motivo_divergencia', type: 'text' }, // perda, erro_registro, diferenca_metodo
        { name: 'responsavel_investigacao', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_alertas_pilha_status ON conciliacao_alertas (pilha_id, status)'],
    })
    app.save(conciliacaoAlertas)

    const alertasId = app.findCollectionByNameOrId('conciliacao_alertas').id

    // 3. CONCILIACAO_AJUSTES
    // Ajustes de estoque autorizados e documentados com justificativa
    const conciliacaoAjustes = new Collection({
      name: 'conciliacao_ajustes',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'alerta_id',
          type: 'relation',
          collectionId: alertasId,
          cascadeDelete: false,
          maxSelect: 1,
        },
        {
          name: 'pilha_id',
          type: 'relation',
          collectionId: pilhasId,
          cascadeDelete: false,
          maxSelect: 1,
          required: true,
        },
        {
          name: 'tipo_ajuste',
          type: 'select',
          values: ['entrada_correcao', 'baixa_perda', 'recalibracao_metodo', 'outros'],
          maxSelect: 1,
          required: true,
        },
        { name: 'volume_ajustado_m3', type: 'number', required: true }, // Positivo ou negativo
        { name: 'justificativa', type: 'text', required: true },
        { name: 'aprovado_por', type: 'text', required: true },
        { name: 'data_aprovacao', type: 'text', required: true },
        {
          name: 'status_ajuste',
          type: 'select',
          values: ['pendente_aprovacao', 'aprovado', 'rejeitado'],
          maxSelect: 1,
          required: true,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_ajustes_pilha ON conciliacao_ajustes (pilha_id, status_ajuste)'],
    })
    app.save(conciliacaoAjustes)

    // 4. CONCILIACAO_DIVERGENCIAS_HIST
    // Histórico imutável de eventos por alerta (timeline: criado -> investigação -> ajuste solicitado/aprovado -> resolvido)
    const conciliacaoHist = new Collection({
      name: 'conciliacao_divergencias_hist',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'alerta_id',
          type: 'relation',
          collectionId: alertasId,
          cascadeDelete: false,
          maxSelect: 1,
          required: true,
        },
        { name: 'etapa_evento', type: 'text', required: true }, // "alerta_criado", "investigacao_iniciada", "ajuste_solicitado", "ajuste_aprovado", "alerta_resolvido"
        { name: 'descricao', type: 'text', required: true },
        { name: 'usuario_nome', type: 'text', required: true },
        { name: 'data_hora', type: 'text', required: true },
        { name: 'dados_adicionais', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_hist_alerta_data ON conciliacao_divergencias_hist (alerta_id, created ASC)',
      ],
    })
    app.save(conciliacaoHist)
  },
  (app) => {
    const toDelete = [
      'conciliacao_divergencias_hist',
      'conciliacao_ajustes',
      'conciliacao_alertas',
      'inventario_pilha',
    ]
    for (const name of toDelete) {
      try {
        const col = app.findCollectionByNameOrId(name)
        app.delete(col)
      } catch (_) {}
    }
  },
)
