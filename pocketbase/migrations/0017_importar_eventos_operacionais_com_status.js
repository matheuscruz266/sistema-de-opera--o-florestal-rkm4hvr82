migrate(
  (app) => {
    const camposOpcionais = {
      historico_baldeio: [
        'caminhao_baldeio_id',
        'talhao_origem_id',
        'pilha_destino_id',
        'data_hora_saida',
        'volume_sr',
        'status_baldeio',
      ],
      historico_descarga: [
        'caminhao_baldeio_id',
        'pilha_destino_id',
        'data_hora_descarga',
        'volume_sr',
        'volume_m3_calculado',
      ],
      historico_picador: [
        'data_hora_expedicao',
        'volume_cavaco_m3',
        'volume_tora_consumido_m3',
      ],
    }

    for (const [nomeColecao, nomesCampos] of Object.entries(camposOpcionais)) {
      const collection = app.findCollectionByNameOrId(nomeColecao)
      for (const nomeCampo of nomesCampos) {
        const field = collection.fields.getByName(nomeCampo)
        if (field) field.required = false
      }
      app.save(collection)
    }

    const baldeio = app.findCollectionByNameOrId('historico_baldeio')
    if (!baldeio.fields.getByName('sr_toras_tipo')) {
      baldeio.fields.add(new TextField({ name: 'sr_toras_tipo' }))
      app.save(baldeio)
    }
  },
  (app) => {
    const camposObrigatorios = {
      historico_baldeio: [
        'caminhao_baldeio_id',
        'talhao_origem_id',
        'pilha_destino_id',
        'data_hora_saida',
        'status_baldeio',
      ],
      historico_descarga: [
        'caminhao_baldeio_id',
        'pilha_destino_id',
        'data_hora_descarga',
      ],
      historico_picador: ['data_hora_expedicao'],
    }

    for (const [nomeColecao, nomesCampos] of Object.entries(camposObrigatorios)) {
      for (const nomeCampo of nomesCampos) {
        const registrosSemValor = app.findRecordsByFilter(
          nomeColecao,
          `${nomeCampo} = ""`,
          '',
          1,
          0,
        )
        if (registrosSemValor.length > 0) {
          throw new Error(
            `Cannot restore required ${nomeCampo}: ${nomeColecao} contains records without it.`,
          )
        }
      }
    }

    const baldeioComTipoSr = app.findRecordsByFilter(
      'historico_baldeio',
      `sr_toras_tipo != ""`,
      '',
      1,
      0,
    )
    if (baldeioComTipoSr.length > 0) {
      throw new Error(
        'Cannot remove sr_toras_tipo: historico_baldeio contains records using this field.',
      )
    }

    const camposRestaurar = {
      historico_baldeio: [
        'caminhao_baldeio_id',
        'talhao_origem_id',
        'pilha_destino_id',
        'data_hora_saida',
        'volume_sr',
        'status_baldeio',
      ],
      historico_descarga: [
        'caminhao_baldeio_id',
        'pilha_destino_id',
        'data_hora_descarga',
        'volume_sr',
        'volume_m3_calculado',
      ],
      historico_picador: [
        'data_hora_expedicao',
        'volume_cavaco_m3',
        'volume_tora_consumido_m3',
      ],
    }

    for (const [nomeColecao, nomesCampos] of Object.entries(camposRestaurar)) {
      const collection = app.findCollectionByNameOrId(nomeColecao)
      for (const nomeCampo of nomesCampos) {
        const field = collection.fields.getByName(nomeCampo)
        if (field) field.required = true
      }
      app.save(collection)
    }

    const baldeio = app.findCollectionByNameOrId('historico_baldeio')
    if (baldeio.fields.getByName('sr_toras_tipo')) {
      baldeio.fields.removeByName('sr_toras_tipo')
      app.save(baldeio)
    }
  },
)
