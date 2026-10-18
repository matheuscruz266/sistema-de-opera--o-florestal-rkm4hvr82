migrate(
  (app) => {
    // 1. Criar nova coleção 'trabalho' (apontamentos de entrada no app AppSheet)
    const fazendasId = app.findCollectionByNameOrId('fazendas').id
    const talhoesId = app.findCollectionByNameOrId('talhoes').id

    let trabalhoCol = null
    try {
      trabalhoCol = app.findCollectionByNameOrId('trabalho')
    } catch (_) {}

    if (!trabalhoCol) {
      trabalhoCol = new Collection({
        name: 'trabalho',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.id != ''",
        fields: [
          { name: 'app_sheet_id', type: 'text' },
          { name: 'email_trabalho', type: 'text' },
          { name: 'data', type: 'text' },
          {
            name: 'fazenda_id',
            type: 'relation',
            collectionId: fazendasId,
            cascadeDelete: false,
            maxSelect: 1,
          },
          { name: 'p_ordens', type: 'text' },
          {
            name: 'talhao_id',
            type: 'relation',
            collectionId: talhoesId,
            cascadeDelete: false,
            maxSelect: 1,
          },
          { name: 'localizacao', type: 'text' },
          { name: 'status_atual', type: 'text' },
          { name: 'extras', type: 'json' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: ['CREATE UNIQUE INDEX idx_trabalho_app_sheet_id ON trabalho (app_sheet_id)'],
      })
      app.save(trabalhoCol)
    }

    // Helper para adicionar campo com segurança se ainda não existir
    const adicionarCampoSeNaoExistir = (colName, campoInstancia) => {
      try {
        const col = app.findCollectionByNameOrId(colName)
        if (!col.fields.getByName(campoInstancia.name)) {
          col.fields.add(campoInstancia)
          app.save(col)
        }
      } catch (err) {
        console.log(`Erro ao adicionar ${campoInstancia.name} em ${colName}:`, err)
      }
    }

    // 2. Adicionar 'localizacao' (texto)
    const colecoesLocalizacao = [
      'historico_feller',
      'historico_skidder',
      'historico_baldeio',
      'historico_descarga',
      'historico_picador',
      'talhoes',
      'maquinas',
      'pilhas',
    ]
    for (let i = 0; i < colecoesLocalizacao.length; i++) {
      adicionarCampoSeNaoExistir(colecoesLocalizacao[i], new TextField({ name: 'localizacao' }))
    }

    // 3. Adicionar 'extras' (JSON) nas 14 coleções de importação
    const colecoesExtras = [
      'fazendas',
      'talhoes',
      'maquinas',
      'caminhoes',
      'caminhao_baldeio',
      'pilhas',
      'motivos',
      'users',
      'trabalho',
      'historico_feller',
      'historico_skidder',
      'historico_baldeio',
      'historico_descarga',
      'historico_picador',
    ]
    for (let i = 0; i < colecoesExtras.length; i++) {
      adicionarCampoSeNaoExistir(colecoesExtras[i], new JSONField({ name: 'extras' }))
    }

    // 4. Campos novos em cadastros
    // maquinas: email_operador, usuario_operador, p_ordens, situacao (bt já existe, mas garante se faltar)
    adicionarCampoSeNaoExistir('maquinas', new TextField({ name: 'email_operador' }))
    adicionarCampoSeNaoExistir('maquinas', new TextField({ name: 'usuario_operador' }))
    adicionarCampoSeNaoExistir('maquinas', new TextField({ name: 'p_ordens' }))
    adicionarCampoSeNaoExistir('maquinas', new TextField({ name: 'situacao' }))

    // motivos: equipamento_categoria, status_motivo
    adicionarCampoSeNaoExistir('motivos', new TextField({ name: 'equipamento_categoria' }))
    adicionarCampoSeNaoExistir('motivos', new TextField({ name: 'status_motivo' }))

    // usuarios (users): acesso, colaborador
    adicionarCampoSeNaoExistir('users', new TextField({ name: 'acesso' }))
    adicionarCampoSeNaoExistir('users', new TextField({ name: 'colaborador' }))

    // fazendas: situacao (uf já existe na criação original)
    adicionarCampoSeNaoExistir('fazendas', new TextField({ name: 'situacao' }))

    // caminhoes e caminhao_baldeio: situacao (modelo já existe na criação original)
    adicionarCampoSeNaoExistir('caminhoes', new TextField({ name: 'situacao' }))
    adicionarCampoSeNaoExistir('caminhao_baldeio', new TextField({ name: 'situacao' }))

    // 5. Campos novos nos históricos operacionais
    // Comuns aos históricos: email_registro, operador, status_evento, veiculo_abastecimento, horimetro, litros, tempo, status_his
    const colecoesHistoricosComuns = [
      'historico_feller',
      'historico_skidder',
      'historico_baldeio',
      'historico_descarga',
      'historico_picador',
    ]

    for (let i = 0; i < colecoesHistoricosComuns.length; i++) {
      const colHist = colecoesHistoricosComuns[i]
      adicionarCampoSeNaoExistir(colHist, new TextField({ name: 'email_registro' }))
      adicionarCampoSeNaoExistir(colHist, new TextField({ name: 'operador' }))
      adicionarCampoSeNaoExistir(colHist, new TextField({ name: 'status_evento' }))
      adicionarCampoSeNaoExistir(colHist, new TextField({ name: 'veiculo_abastecimento' }))
      adicionarCampoSeNaoExistir(colHist, new NumberField({ name: 'horimetro' }))
      adicionarCampoSeNaoExistir(colHist, new NumberField({ name: 'litros' }))
      adicionarCampoSeNaoExistir(colHist, new TextField({ name: 'tempo' }))
      adicionarCampoSeNaoExistir(colHist, new TextField({ name: 'status_his' }))
      adicionarCampoSeNaoExistir(colHist, new TextField({ name: 'inicio' }))
      adicionarCampoSeNaoExistir(colHist, new TextField({ name: 'fim' }))

      // Relações opcionais para fazenda e motivo se aplicável
      adicionarCampoSeNaoExistir(
        colHist,
        new RelationField({
          name: 'fazenda_id',
          collectionId: fazendasId,
          cascadeDelete: false,
          maxSelect: 1,
        }),
      )
      const motivosId = app.findCollectionByNameOrId('motivos').id
      adicionarCampoSeNaoExistir(
        colHist,
        new RelationField({
          name: 'motivo_id',
          collectionId: motivosId,
          cascadeDelete: false,
          maxSelect: 1,
        }),
      )
    }

    // historico_descarga: sr_toras_tipo (texto para tipo descritivo Bitrem, etc.), pilha_id (garante se faltar)
    adicionarCampoSeNaoExistir('historico_descarga', new TextField({ name: 'sr_toras_tipo' }))

    // historico_picador: picador_maquina_id (relação à maquinas) e sr_cavaco_texto
    const maquinasColId = app.findCollectionByNameOrId('maquinas').id
    adicionarCampoSeNaoExistir(
      'historico_picador',
      new RelationField({
        name: 'picador_maquina_id',
        collectionId: maquinasColId,
        cascadeDelete: false,
        maxSelect: 1,
      }),
    )
    adicionarCampoSeNaoExistir('historico_picador', new TextField({ name: 'picador' }))
    adicionarCampoSeNaoExistir('historico_picador', new TextField({ name: 'sr_cavaco_texto' }))
  },
  (app) => {
    try {
      const colTrabalho = app.findCollectionByNameOrId('trabalho')
      app.delete(colTrabalho)
    } catch (_) {}
  },
)
