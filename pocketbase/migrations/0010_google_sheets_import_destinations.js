migrate(
  (app) => {
    const sourceIdCollections = [
      'talhoes',
      'caminhao_baldeio',
      'historico_feller',
      'historico_skidder',
      'historico_baldeio',
      'historico_descarga',
      'historico_picador',
      'caminhoes',
      'pilhas',
    ]

    for (const collectionName of sourceIdCollections) {
      const collection = app.findCollectionByNameOrId(collectionName)
      if (!collection.fields.getByName('origem_id')) {
        collection.fields.add(new TextField({ name: 'origem_id', required: false }))
      }
      collection.indexes = collection.indexes || []
      const sourceIndex = `idx_${collectionName}_origem_id`
      if (!collection.indexes.some((index) => index.includes(sourceIndex))) {
        collection.indexes.push(
          `CREATE UNIQUE INDEX ${sourceIndex} ON ${collectionName} (origem_id) WHERE origem_id != ''`,
        )
      }
      app.save(collection)
    }

    const talhoes = app.findCollectionByNameOrId('talhoes')
    const talhaoStatus = talhoes.fields.getByName('status')
    if (talhaoStatus && talhaoStatus.values.indexOf('inativa') === -1) {
      talhaoStatus.values.push('inativa')
      app.save(talhoes)
    }

    const historicoBaldeio = app.findCollectionByNameOrId('historico_baldeio')
    const pilhaDestinoField = historicoBaldeio.fields.getByName('pilha_destino_id')
    if (pilhaDestinoField) {
      pilhaDestinoField.required = false
      app.save(historicoBaldeio)
    }

    const fazendasId = app.findCollectionByNameOrId('fazendas').id
    const maquinasId = app.findCollectionByNameOrId('maquinas').id
    const talhoesId = app.findCollectionByNameOrId('talhoes').id

    const trabalho = new Collection({
      name: 'trabalho',
      type: 'base',
      listRule: "@request.auth.id != '' && @request.auth.papel = 'admin'",
      viewRule: "@request.auth.id != '' && @request.auth.papel = 'admin'",
      createRule: "@request.auth.id != '' && @request.auth.papel = 'admin'",
      updateRule: "@request.auth.id != '' && @request.auth.papel = 'admin'",
      deleteRule: "@request.auth.id != '' && @request.auth.papel = 'admin'",
      fields: [
        { name: 'origem_id', type: 'text', required: true },
        { name: 'email_trabalho', type: 'email', required: false },
        { name: 'colaborador', type: 'text', required: false },
        { name: 'data_trabalho', type: 'text', required: false },
        { name: 'fazenda_origem', type: 'text', required: false },
        { name: 'maquina_origem', type: 'text', required: false },
        { name: 'talhao_origem', type: 'text', required: false },
        {
          name: 'fazenda_id',
          type: 'relation',
          collectionId: fazendasId,
          cascadeDelete: false,
          maxSelect: 1,
          required: false,
        },
        {
          name: 'maquina_id',
          type: 'relation',
          collectionId: maquinasId,
          cascadeDelete: false,
          maxSelect: 1,
          required: false,
        },
        {
          name: 'talhao_id',
          type: 'relation',
          collectionId: talhoesId,
          cascadeDelete: false,
          maxSelect: 1,
          required: false,
        },
        { name: 'ordem_servico', type: 'text', required: false },
        { name: 'localizacao', type: 'text', required: false },
        { name: 'status_atual', type: 'text', required: false },
        { name: 'dados_origem_json', type: 'text', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_trabalho_origem_id ON trabalho (origem_id)',
        'CREATE INDEX idx_trabalho_data ON trabalho (data_trabalho DESC)',
      ],
    })
    app.save(trabalho)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('trabalho'))
    } catch (_) {}

    const sourceIdCollections = [
      'talhoes',
      'caminhao_baldeio',
      'historico_feller',
      'historico_skidder',
      'historico_baldeio',
      'historico_descarga',
      'historico_picador',
      'caminhoes',
      'pilhas',
    ]

    for (const collectionName of sourceIdCollections) {
      const collection = app.findCollectionByNameOrId(collectionName)
      if (collection.fields.getByName('origem_id')) {
        collection.fields.removeByName('origem_id')
      }
      collection.indexes = collection.indexes.filter(
        (index) => !index.includes(`idx_${collectionName}_origem_id`),
      )
      app.save(collection)
    }

    const talhoes = app.findCollectionByNameOrId('talhoes')
    const talhaoStatus = talhoes.fields.getByName('status')
    if (talhaoStatus) {
      talhaoStatus.values = talhaoStatus.values.filter((value) => value !== 'inativa')
      app.save(talhoes)
    }

    const historicoBaldeio = app.findCollectionByNameOrId('historico_baldeio')
    const pilhaDestinoField = historicoBaldeio.fields.getByName('pilha_destino_id')
    if (pilhaDestinoField) {
      pilhaDestinoField.required = true
      app.save(historicoBaldeio)
    }
  },
)
