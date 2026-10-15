migrate(
  (app) => {
    const talhoesId = app.findCollectionByNameOrId('talhoes').id
    const maquinasId = app.findCollectionByNameOrId('maquinas').id
    const pilhasId = app.findCollectionByNameOrId('pilhas').id
    const caminhoesId = app.findCollectionByNameOrId('caminhoes').id
    const caminhaoBaldeioId = app.findCollectionByNameOrId('caminhao_baldeio').id
    const conversaoSrTorasId = app.findCollectionByNameOrId('conversao_sr_toras').id
    const conversaoSrCavacoId = app.findCollectionByNameOrId('conversao_sr_cavaco').id

    // 1. HISTORICO_FELLER (tempo e combustível do feller)
    const histFeller = new Collection({
      name: 'historico_feller',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'talhao_id',
          type: 'relation',
          collectionId: talhoesId,
          cascadeDelete: false,
          maxSelect: 1,
          required: true,
        },
        {
          name: 'maquina_id',
          type: 'relation',
          collectionId: maquinasId,
          cascadeDelete: false,
          maxSelect: 1,
          required: true,
        },
        { name: 'data_operacao', type: 'text', required: true },
        { name: 'horas_trabalhadas', type: 'number', required: true },
        { name: 'combustivel_litros', type: 'number', required: true },
        { name: 'arvores_derrubadas', type: 'number' },
        { name: 'observacoes', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_feller_data ON historico_feller (data_operacao DESC)'],
    })
    app.save(histFeller)

    // 2. HISTORICO_SKIDDER (tempo e combustível do skidder)
    const histSkidder = new Collection({
      name: 'historico_skidder',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'talhao_id',
          type: 'relation',
          collectionId: talhoesId,
          cascadeDelete: false,
          maxSelect: 1,
          required: true,
        },
        {
          name: 'maquina_id',
          type: 'relation',
          collectionId: maquinasId,
          cascadeDelete: false,
          maxSelect: 1,
          required: true,
        },
        { name: 'data_operacao', type: 'text', required: true },
        { name: 'horas_trabalhadas', type: 'number', required: true },
        { name: 'combustivel_litros', type: 'number', required: true },
        { name: 'ciclos_arraste', type: 'number' },
        { name: 'observacoes', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_skidder_data ON historico_skidder (data_operacao DESC)'],
    })
    app.save(histSkidder)

    // 3. HISTORICO_BALDEIO: PONTO DE SAÍDA DO TALHÃO
    // SR_Toras (relação à conversão), Placa_Baldeio, origem (talhão), destino (pilha), data/hora saída e chegada, volume_sr
    const histBaldeio = new Collection({
      name: 'historico_baldeio',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'conversao_sr_id',
          type: 'relation',
          collectionId: conversaoSrTorasId,
          cascadeDelete: false,
          maxSelect: 1,
        },
        {
          name: 'caminhao_baldeio_id',
          type: 'relation',
          collectionId: caminhaoBaldeioId,
          cascadeDelete: false,
          maxSelect: 1,
          required: true,
        },
        {
          name: 'talhao_origem_id',
          type: 'relation',
          collectionId: talhoesId,
          cascadeDelete: false,
          maxSelect: 1,
          required: true,
        },
        {
          name: 'pilha_destino_id',
          type: 'relation',
          collectionId: pilhasId,
          cascadeDelete: false,
          maxSelect: 1,
          required: true,
        },
        { name: 'data_hora_saida', type: 'text', required: true },
        { name: 'data_hora_chegada', type: 'text' },
        { name: 'volume_sr', type: 'number', required: true },
        { name: 'volume_m3_estimado', type: 'number' },
        { name: 'motorista', type: 'text' },
        { name: 'numero_viagem', type: 'text' },
        {
          name: 'status_baldeio',
          type: 'select',
          values: ['em_transito', 'concluido', 'cancelado'],
          maxSelect: 1,
          required: true,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_baldeio_data ON historico_baldeio (data_hora_saida DESC)'],
    })
    app.save(histBaldeio)

    // 4. HISTORICO_DESCARGA: PONTO DE RECEBIMENTO NO PÁTIO
    // SR_Toras, Placa_Baldeio, data/hora, pilha de destino, pesos (bruto/tara/líquido) e volume
    // Com status de aceite (Aceito/Rejeitado): somente movimentos ACEITOS entram no estoque calculado
    const histDescarga = new Collection({
      name: 'historico_descarga',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'conversao_sr_id',
          type: 'relation',
          collectionId: conversaoSrTorasId,
          cascadeDelete: false,
          maxSelect: 1,
        },
        {
          name: 'caminhao_baldeio_id',
          type: 'relation',
          collectionId: caminhaoBaldeioId,
          cascadeDelete: false,
          maxSelect: 1,
          required: true,
        },
        {
          name: 'pilha_destino_id',
          type: 'relation',
          collectionId: pilhasId,
          cascadeDelete: false,
          maxSelect: 1,
          required: true,
        },
        { name: 'data_hora_descarga', type: 'text', required: true },
        { name: 'volume_sr', type: 'number', required: true },
        { name: 'volume_m3_calculado', type: 'number', required: true },
        { name: 'peso_bruto_t', type: 'number' },
        { name: 'peso_tara_t', type: 'number' },
        { name: 'peso_liquido_t', type: 'number' },
        {
          name: 'status_aceite',
          type: 'select',
          values: ['aceito', 'rejeitado', 'pendente'],
          maxSelect: 1,
          required: true,
        },
        { name: 'motivo_rejeicao', type: 'text' },
        { name: 'conferente_nome', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_descarga_pilha ON historico_descarga (pilha_destino_id, status_aceite)',
      ],
    })
    app.save(histDescarga)

    // 5. HISTORICO_PICADOR: PONTO DE CONSUMO E EXPEDIÇÃO (saída de estoque da pilha)
    // SR_Cavaco, Caminhao, Nota (única), pilha de origem, peso, volume, cliente
    const histPicador = new Collection({
      name: 'historico_picador',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'conversao_cavaco_id',
          type: 'relation',
          collectionId: conversaoSrCavacoId,
          cascadeDelete: false,
          maxSelect: 1,
        },
        {
          name: 'caminhao_id',
          type: 'relation',
          collectionId: caminhoesId,
          cascadeDelete: false,
          maxSelect: 1,
          required: true,
        },
        {
          name: 'pilha_origem_id',
          type: 'relation',
          collectionId: pilhasId,
          cascadeDelete: false,
          maxSelect: 1,
          required: true,
        },
        { name: 'nota_fiscal', type: 'text', required: true },
        { name: 'data_hora_expedicao', type: 'text', required: true },
        { name: 'volume_cavaco_m3', type: 'number', required: true },
        { name: 'peso_cavaco_t', type: 'number' },
        { name: 'volume_tora_consumido_m3', type: 'number', required: true }, // Saída da pilha de toras
        { name: 'cliente', type: 'text' },
        { name: 'umidade_perc', type: 'number' },
        { name: 'operador_nome', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_picador_nota ON historico_picador (nota_fiscal)'],
    })
    app.save(histPicador)
  },
  (app) => {
    const toDelete = [
      'historico_picador',
      'historico_descarga',
      'historico_baldeio',
      'historico_skidder',
      'historico_feller',
    ]
    for (const name of toDelete) {
      try {
        const col = app.findCollectionByNameOrId(name)
        app.delete(col)
      } catch (_) {}
    }
  },
)
