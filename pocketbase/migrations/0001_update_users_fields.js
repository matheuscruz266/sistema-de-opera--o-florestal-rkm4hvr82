migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')

    if (!users.fields.getByName('papel')) {
      users.fields.add(
        new SelectField({
          name: 'papel',
          values: ['admin', 'operador', 'conferente'],
          maxSelect: 1,
          required: false,
        }),
      )
    }

    if (!users.fields.getByName('status')) {
      users.fields.add(
        new BoolField({
          name: 'status',
        }),
      )
    }

    app.save(users)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    if (users.fields.getByName('papel')) {
      users.fields.removeByName('papel')
    }
    if (users.fields.getByName('status')) {
      users.fields.removeByName('status')
    }
    app.save(users)
  },
)
