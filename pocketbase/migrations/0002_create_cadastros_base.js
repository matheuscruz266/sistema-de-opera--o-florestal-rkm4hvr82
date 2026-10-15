migrate(
  (app) => {
    // 1. FAZENDAS
    const fazendas = new Collection({
      name: 'fazendas',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'nome', type: 'text', required: true },
        { name: 'codigo', type: 'text', required: true },
        { name: 'uf', type: 'text', required: true },
        { name: 'cidade', type: 'text' },
        { name: 'area_total', type: 'number' },
        { name: 'area_plantada', type: 'number' },
        {
          name: 'status',
          type: 'select',
          values: ['ativa', 'inativa'],
          maxSelect: 1,
          required: true,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_fazendas_codigo ON fazendas (codigo)'],
    })
    app.save(fazendas)

    const fazendasId = app.findCollectionByNameOrId('fazendas').id

    // 2. TALHOES
    const talhoes = new Collection({
      name: 'talhoes',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'talhao', type: 'text', required: true },
        {
          name: 'fazenda_id',
          type: 'relation',
          collectionId: fazendasId,
          cascadeDelete: false,
          maxSelect: 1,
          required: true,
        },
        { name: 'area_ha', type: 'number' },
        { name: 'especie', type: 'text' },
        { name: 'data_plantio', type: 'text' },
        {
          name: 'status',
          type: 'select',
          values: ['ativo', 'cultivo', 'colheita', 'concluido'],
          maxSelect: 1,
          required: true,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_talhoes_fazenda ON talhoes (fazenda_id)'],
    })
    app.save(talhoes)

    // 3. MAQUINAS
    const maquinas = new Collection({
      name: 'maquinas',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'id_maquina', type: 'text', required: true },
        { name: 'equipamento', type: 'text', required: true },
        {
          name: 'tipo',
          type: 'select',
          values: ['feller', 'skidder', 'picador', 'colhedora', 'outros'],
          maxSelect: 1,
          required: true,
        },
        { name: 'bt', type: 'text' },
        { name: 'usuario_responsavel', type: 'text' },
        {
          name: 'fazenda_id',
          type: 'relation',
          collectionId: fazendasId,
          cascadeDelete: false,
          maxSelect: 1,
        },
        {
          name: 'status',
          type: 'select',
          values: ['ativa', 'manutencao', 'inativa'],
          maxSelect: 1,
          required: true,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_maquinas_id_maquina ON maquinas (id_maquina)'],
    })
    app.save(maquinas)

    // 4. CAMINHOES
    const caminhoes = new Collection({
      name: 'caminhoes',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'placa', type: 'text', required: true },
        { name: 'modelo', type: 'text', required: true },
        { name: 'capacidade_m3', type: 'number' },
        { name: 'renavam', type: 'text' },
        {
          name: 'status',
          type: 'select',
          values: ['ativo', 'manutencao', 'inativo'],
          maxSelect: 1,
          required: true,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_caminhoes_placa ON caminhoes (placa)'],
    })
    app.save(caminhoes)

    // 5. CAMINHAO_BALDEIO
    const caminhaoBaldeio = new Collection({
      name: 'caminhao_baldeio',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'placa_baldeio', type: 'text', required: true },
        { name: 'modelo', type: 'text', required: true },
        { name: 'capacidade_m3', type: 'number' },
        { name: 'tipo_carreta', type: 'text' },
        {
          name: 'status',
          type: 'select',
          values: ['ativo', 'manutencao', 'inativo'],
          maxSelect: 1,
          required: true,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_cam_baldeio_placa ON caminhao_baldeio (placa_baldeio)'],
    })
    app.save(caminhaoBaldeio)

    // 6. PILHAS (EXPANDIDA: Fazenda, Mista, status ativo/inativo, volume calculado)
    const talhoesId = app.findCollectionByNameOrId('talhoes').id
    const pilhas = new Collection({
      name: 'pilhas',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'codigo', type: 'text', required: true },
        { name: 'nome', type: 'text' },
        {
          name: 'fazenda_id',
          type: 'relation',
          collectionId: fazendasId,
          cascadeDelete: false,
          maxSelect: 1,
          required: true,
        },
        {
          name: 'talhao_id',
          type: 'relation',
          collectionId: talhoesId,
          cascadeDelete: false,
          maxSelect: 1,
          required: false,
        },
        { name: 'is_mista', type: 'bool' },
        {
          name: 'produto',
          type: 'select',
          values: ['tora', 'cavaco', 'misto'],
          maxSelect: 1,
          required: true,
        },
        { name: 'volume_atual_m3', type: 'number' },
        {
          name: 'status',
          type: 'select',
          values: ['ativa', 'inativa', 'em_consumo', 'concluida'],
          maxSelect: 1,
          required: true,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_pilhas_codigo ON pilhas (codigo)'],
    })
    app.save(pilhas)

    // 7. MOTIVOS
    const motivos = new Collection({
      name: 'motivos',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'id_motivo', type: 'text', required: true },
        { name: 'equipamento', type: 'text' },
        { name: 'motivo', type: 'text', required: true },
        {
          name: 'categoria',
          type: 'select',
          values: [
            'rejeicao_tora',
            'recusa_cavaco',
            'parada_maquina',
            'divergencia_estoque',
            'outros',
          ],
          maxSelect: 1,
          required: true,
        },
        {
          name: 'status',
          type: 'select',
          values: ['ativo', 'inativo'],
          maxSelect: 1,
          required: true,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_motivos_id ON motivos (id_motivo)'],
    })
    app.save(motivos)
  },
  (app) => {
    const toDelete = [
      'motivos',
      'pilhas',
      'caminhao_baldeio',
      'caminhoes',
      'maquinas',
      'talhoes',
      'fazendas',
    ]
    for (const name of toDelete) {
      try {
        const col = app.findCollectionByNameOrId(name)
        app.delete(col)
      } catch (_) {}
    }
  },
)
