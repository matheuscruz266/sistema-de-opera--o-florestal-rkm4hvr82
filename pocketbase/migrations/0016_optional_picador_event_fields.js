migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('historico_picador')
    const optionalFields = ['caminhao_id', 'pilha_origem_id', 'nota_fiscal']

    for (const fieldName of optionalFields) {
      const field = collection.fields.getByName(fieldName)
      if (field) field.required = false
    }

    collection.indexes = collection.indexes
      .filter((index) => !index.includes('idx_picador_nota'))
      .concat(
        "CREATE UNIQUE INDEX idx_picador_nota ON historico_picador (nota_fiscal) WHERE nota_fiscal != ''",
      )
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('historico_picador')
    const requiredFields = ['caminhao_id', 'pilha_origem_id', 'nota_fiscal']

    for (const fieldName of requiredFields) {
      const records = app.findRecordsByFilter(
        'historico_picador',
        `${fieldName} = ""`,
        '',
        1,
        0,
      )
      if (records.length > 0) {
        throw new Error(
          `Cannot restore required ${fieldName}: historico_picador contains records without it.`,
        )
      }
    }

    for (const fieldName of requiredFields) {
      const field = collection.fields.getByName(fieldName)
      if (field) field.required = true
    }

    collection.indexes = collection.indexes
      .filter((index) => !index.includes('idx_picador_nota'))
      .concat('CREATE UNIQUE INDEX idx_picador_nota ON historico_picador (nota_fiscal)')
    app.save(collection)
  },
)
