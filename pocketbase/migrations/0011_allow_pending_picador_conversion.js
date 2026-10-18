migrate(
  (app) => {
    const picador = app.findCollectionByNameOrId('historico_picador')
    let altered = false
    const volumeCavaco = picador.fields.getByName('volume_cavaco_m3')
    const volumeTora = picador.fields.getByName('volume_tora_consumido_m3')

    if (volumeCavaco && volumeCavaco.required) {
      volumeCavaco.required = false
      altered = true
    }
    if (volumeTora && volumeTora.required) {
      volumeTora.required = false
      altered = true
    }
    if (!picador.fields.getByName('status_calculo')) {
      picador.fields.add(
        new SelectField({
          name: 'status_calculo',
          values: ['pendente', 'calculado'],
          maxSelect: 1,
          required: false,
        }),
      )
      altered = true
    }

    if (altered) {
      app.save(picador)
    }
  },
  (app) => {
    const picador = app.findCollectionByNameOrId('historico_picador')
    const statusCalculo = picador.fields.getByName('status_calculo')

    if (statusCalculo) {
      picador.fields.removeByName('status_calculo')
      app.save(picador)
    }
  },
)
