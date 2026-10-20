migrate(
  (app) => {
    const optionalFieldsByCollection = {
      historico_feller: ['horas_trabalhadas', 'combustivel_litros'],
      historico_skidder: ['horas_trabalhadas', 'combustivel_litros'],
      historico_baldeio: ['volume_sr', 'status_baldeio'],
      historico_descarga: ['volume_sr', 'volume_m3_calculado', 'status_aceite'],
    }

    for (const [collectionName, fieldNames] of Object.entries(optionalFieldsByCollection)) {
      const collection = app.findCollectionByNameOrId(collectionName)
      let changed = false

      for (const fieldName of fieldNames) {
        const field = collection.fields.getByName(fieldName)
        if (field && field.required) {
          field.required = false
          changed = true
        }
      }

      if (changed) app.save(collection)
    }
  },
  (app) => {
    const requiredFieldsByCollection = {
      historico_feller: ['horas_trabalhadas', 'combustivel_litros'],
      historico_skidder: ['horas_trabalhadas', 'combustivel_litros'],
      historico_baldeio: ['volume_sr', 'status_baldeio'],
      historico_descarga: ['volume_sr', 'volume_m3_calculado', 'status_aceite'],
    }

    for (const [collectionName, fieldNames] of Object.entries(requiredFieldsByCollection)) {
      const collection = app.findCollectionByNameOrId(collectionName)
      let changed = false

      for (const fieldName of fieldNames) {
        const field = collection.fields.getByName(fieldName)
        if (field && !field.required) {
          field.required = true
          changed = true
        }
      }

      if (changed) app.save(collection)
    }
  },
)
