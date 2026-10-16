migrate(
  (app) => {
    // 1. Tabela para configurações do importador multi-base
    // Guarda o mapeamento de cada base (aba, regra de duplicidade, coluna chave de upsert, mapeamentos coluna->campo, habilitado)
    const importadorConfig = new Collection({
      name: 'importador_bases_config',
      type: 'base',
      listRule: "@request.auth.id != '' && @request.auth.papel = 'admin'",
      viewRule: "@request.auth.id != '' && @request.auth.papel = 'admin'",
      createRule: "@request.auth.id != '' && @request.auth.papel = 'admin'",
      updateRule: "@request.auth.id != '' && @request.auth.papel = 'admin'",
      deleteRule: "@request.auth.id != '' && @request.auth.papel = 'admin'",
      fields: [
        { name: 'base_key', type: 'text', required: true }, // ex: 'fazendas', 'historico_feller'
        { name: 'base_nome', type: 'text', required: true }, // ex: 'Fazendas', 'Historico_Feller'
        { name: 'destino_tabela', type: 'text', required: true }, // ex: 'fazendas'
        { name: 'aba_planilha', type: 'text' }, // ex: 'Fazendas' ou 'Fazendas!A:Z'
        { name: 'coluna_id_unico', type: 'text' }, // ex: '_ID_' ou 'ID' ou 'Id_Fazenda'
        { name: 'regra_duplicidade', type: 'text' }, // 'atualizar' (upsert), 'inserir_apenas', 'substituir'
        { name: 'ordem_execucao', type: 'number' }, // 1 a 14
        { name: 'is_ativa', type: 'bool' }, // se participa do sync automático e em lote
        { name: 'mapeamento_campos', type: 'json' }, // { [colunaPlanilha]: campoColecao }
        { name: 'cabecalhos_detectados', type: 'json' }, // lista de colunas encontradas na última leitura
        { name: 'ultima_importacao', type: 'text' },
        { name: 'total_importados', type: 'number' },
        { name: 'ultimo_status', type: 'text' },
        { name: 'ultimo_erro', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_importador_base_key ON importador_bases_config (base_key)',
        'CREATE INDEX idx_importador_ordem ON importador_bases_config (ordem_execucao)',
      ],
    })
    app.save(importadorConfig)

    // 2. Adicionar campo app_sheet_id em todas as coleções que receberão dados do AppSheet
    const colecoesAlvo = [
      'fazendas',
      'talhoes',
      'maquinas',
      'caminhoes',
      'caminhao_baldeio',
      'pilhas',
      'motivos',
      'users',
      'historico_feller',
      'historico_skidder',
      'historico_baldeio',
      'historico_descarga',
      'historico_picador',
    ]

    for (let i = 0; i < colecoesAlvo.length; i++) {
      const colName = colecoesAlvo[i]
      try {
        const col = app.findCollectionByNameOrId(colName)
        if (!col.fields.getByName('app_sheet_id')) {
          col.fields.add(new TextField({ name: 'app_sheet_id' }))
          app.save(col)
        }
      } catch (err) {
        console.log(`Erro ao adicionar app_sheet_id em ${colName}:`, err)
      }
    }
  },
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('importador_bases_config')
      app.delete(col)
    } catch (_) {}

    const colecoesAlvo = [
      'fazendas',
      'talhoes',
      'maquinas',
      'caminhoes',
      'caminhao_baldeio',
      'pilhas',
      'motivos',
      'users',
      'historico_feller',
      'historico_skidder',
      'historico_baldeio',
      'historico_descarga',
      'historico_picador',
    ]
    for (let i = 0; i < colecoesAlvo.length; i++) {
      try {
        const col = app.findCollectionByNameOrId(colecoesAlvo[i])
        const field = col.fields.getByName('app_sheet_id')
        if (field) {
          col.fields.removeByName('app_sheet_id')
          app.save(col)
        }
      } catch (_) {}
    }
  },
)
