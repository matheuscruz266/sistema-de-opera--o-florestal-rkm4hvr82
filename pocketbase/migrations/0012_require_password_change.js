migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    if (!users.fields.getByName('must_change_password')) {
      users.fields.add(
        new BoolField({
          name: 'must_change_password',
          required: false,
        }),
      )
    }
    app.save(users)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    if (users.fields.getByName('must_change_password')) {
      users.fields.removeByName('must_change_password')
      app.save(users)
    }
  },
)
