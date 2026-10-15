migrate(
  (app) => {
    // 1. CONVERSAO_SR_TORAS
    // Parametriza equivalência entre SR de toras, volume m³ e toneladas estimadas
    // Versão, vigência (início/fim), fator m³/SR, fator t/m³, método utilizado, is_vigente
    const conversaoSrToras = new Collection({
      name: 'conversao_sr_toras',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'versao', type: 'text', required: true },
        { name: 'vigencia_inicio', type: 'text', required: true },
        { name: 'vigencia_fim', type: 'text' },
        { name: 'fator_m3_sr', type: 'number', required: true }, // ex: 0.84 m³ por SR
        { name: 'fator_t_m3', type: 'number', required: true }, // ex: 0.95 t por m³
        { name: 'metodo', type: 'text' }, // ex: "Cubagem geométrica rigorosa Huber / Smalian"
        { name: 'is_vigente', type: 'bool' },
        { name: 'observacoes', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_conv_toras_vigente ON conversao_sr_toras (is_vigente)'],
    })
    app.save(conversaoSrToras)

    // 2. CONVERSAO_SR_CAVACO
    // Parametriza capacidade das carretas cavaqueiras e conversões: ID_carreta, capacidade m³, fator de peso (t/m³), vigência, is_vigente
    const conversaoSrCavaco = new Collection({
      name: 'conversao_sr_cavaco',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'id_carreta', type: 'text', required: true },
        { name: 'modelo_carreta', type: 'text' },
        { name: 'capacidade_m3', type: 'number', required: true }, // ex: 90 m³
        { name: 'fator_t_m3', type: 'number', required: true }, // densidade cavaco ex: 0.32 t/m³
        { name: 'vigencia_inicio', type: 'text', required: true },
        { name: 'vigencia_fim', type: 'text' },
        { name: 'is_vigente', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_conv_cavaco_carreta ON conversao_sr_cavaco (id_carreta)'],
    })
    app.save(conversaoSrCavaco)

    // 3. PARAMETROS_OPERACIONAIS (Núcleo E)
    // Etapa origem, etapa destino, base comparação, vigência, versão, fator, limiar_alerta_perc
    const parametrosOperacionais = new Collection({
      name: 'parametros_operacionais',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'chave', type: 'text', required: true }, // ex: "reducao_peso_umidade", "reducao_volumetrica", "limiar_divergencia"
        { name: 'descricao', type: 'text', required: true },
        { name: 'etapa_origem', type: 'text' },
        { name: 'etapa_destino', type: 'text' },
        { name: 'base_comparacao', type: 'text' },
        { name: 'fator_valor', type: 'number', required: true }, // ex: 0.84, 0.95, 5.0
        { name: 'unidade', type: 'text' }, // ex: "fator", "%", "dias"
        { name: 'versao', type: 'text' },
        { name: 'vigencia_inicio', type: 'text' },
        { name: 'vigencia_fim', type: 'text' },
        { name: 'is_vigente', type: 'bool' },
        { name: 'email_alertas', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_param_chave_versao ON parametros_operacionais (chave, versao)',
      ],
    })
    app.save(parametrosOperacionais)
  },
  (app) => {
    const toDelete = ['parametros_operacionais', 'conversao_sr_cavaco', 'conversao_sr_toras']
    for (const name of toDelete) {
      try {
        const col = app.findCollectionByNameOrId(name)
        app.delete(col)
      } catch (_) {}
    }
  },
)
