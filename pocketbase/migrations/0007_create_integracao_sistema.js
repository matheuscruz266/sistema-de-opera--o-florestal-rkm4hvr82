migrate(
  (app) => {
    // 1. Coleção: integracao_credenciais
    // Gerencia credenciais e chaves de API das integrações externas (D2 Toledo, App de Campo, etc.)
    const credenciaisCol = new Collection({
      name: 'integracao_credenciais',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != '' && @request.auth.papel = 'admin'",
      updateRule: "@request.auth.id != '' && @request.auth.papel = 'admin'",
      deleteRule: "@request.auth.id != '' && @request.auth.papel = 'admin'",
      fields: [
        { name: 'nome', type: 'text', required: true },
        {
          name: 'tipo',
          type: 'select',
          values: ['picador_d2', 'app_campo', 'balanca_terceiros', 'outro'],
          maxSelect: 1,
          required: true,
        },
        { name: 'api_key', type: 'text', required: true },
        { name: 'is_ativa', type: 'bool' },
        { name: 'ultimo_uso', type: 'text' },
        { name: 'descricao', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_integracao_cred_key ON integracao_credenciais (api_key)',
        'CREATE INDEX idx_integracao_cred_tipo ON integracao_credenciais (tipo)',
      ],
    })
    app.save(credenciaisCol)

    const credenciaisId = app.findCollectionByNameOrId('integracao_credenciais').id

    // 2. Coleção: integracao_logs
    // Registra cada chamada feita nos endpoints de ingestão com auditoria completa
    const logsCol = new Collection({
      name: 'integracao_logs',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: '', // Permite inserção pelo hook ou por chamadas públicas com log de erro
      updateRule: "@request.auth.id != '' && @request.auth.papel = 'admin'",
      deleteRule: "@request.auth.id != '' && @request.auth.papel = 'admin'",
      fields: [
        {
          name: 'credencial_id',
          type: 'relation',
          collectionId: credenciaisId,
          cascadeDelete: false,
          maxSelect: 1,
        },
        { name: 'origem_nome', type: 'text', required: true },
        { name: 'endpoint', type: 'text', required: true },
        { name: 'ip_origem', type: 'text' },
        { name: 'timestamp_evento', type: 'text', required: true },
        { name: 'registros_recebidos', type: 'number' },
        { name: 'registros_aceitos', type: 'number' },
        { name: 'registros_rejeitados', type: 'number' },
        {
          name: 'status',
          type: 'select',
          values: ['sucesso', 'parcial', 'erro', 'rejeitado'],
          maxSelect: 1,
          required: true,
        },
        { name: 'mensagem_erro', type: 'text' },
        { name: 'detalhes_json', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_integracao_logs_data ON integracao_logs (timestamp_evento DESC)',
        'CREATE INDEX idx_integracao_logs_status ON integracao_logs (status)',
        'CREATE INDEX idx_integracao_logs_cred ON integracao_logs (credencial_id)',
      ],
    })
    app.save(logsCol)

    // Seed de credencial inicial para "D2 — Picador BRF Toledo" e "App de Campo Offline"
    const seedCredencial = (nome, tipo, chave, descricao) => {
      try {
        app.findFirstRecordByData('integracao_credenciais', 'api_key', chave)
      } catch (_) {
        const rec = new Record(credenciaisCol)
        rec.set('nome', nome)
        rec.set('tipo', tipo)
        rec.set('api_key', chave)
        rec.set('is_ativa', true)
        rec.set('descricao', descricao)
        app.save(rec)
      }
    }

    seedCredencial(
      'D2 — Picador BRF Toledo',
      'picador_d2',
      'sof_live_d2_toledo_' + $security.randomString(24),
      'Integração direta com o PLC/Automação do Picador BRF Toledo (produção e expedição de cavaco)',
    )

    seedCredencial(
      'App de Campo Offline',
      'app_campo',
      'sof_live_campo_' + $security.randomString(24),
      'Sincronização do aplicativo móvel de apontamento florestal de campo',
    )
  },
  (app) => {
    try {
      const logsCol = app.findCollectionByNameOrId('integracao_logs')
      app.delete(logsCol)
    } catch (_) {}
    try {
      const credCol = app.findCollectionByNameOrId('integracao_credenciais')
      app.delete(credCol)
    } catch (_) {}
  },
)
