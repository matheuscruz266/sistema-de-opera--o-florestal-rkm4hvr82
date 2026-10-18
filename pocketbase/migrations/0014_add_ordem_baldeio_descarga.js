migrate(
  (app) => {
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

    // Criar campo 'ordem' (texto, opcional) na coleção 'historico_baldeio' e na coleção 'historico_descarga'
    adicionarCampoSeNaoExistir('historico_baldeio', new TextField({ name: 'ordem' }))
    adicionarCampoSeNaoExistir('historico_descarga', new TextField({ name: 'ordem' }))
  },
  (app) => {
    // Reversão opcional (remove campo se existir)
    const removerCampoSeExistir = (colName, campoNome) => {
      try {
        const col = app.findCollectionByNameOrId(colName)
        const fld = col.fields.getByName(campoNome)
        if (fld) {
          col.fields.removeByName(campoNome)
          app.save(col)
        }
      } catch (_) {}
    }

    removerCampoSeExistir('historico_baldeio', 'ordem')
    removerCampoSeExistir('historico_descarga', 'ordem')
  },
)
