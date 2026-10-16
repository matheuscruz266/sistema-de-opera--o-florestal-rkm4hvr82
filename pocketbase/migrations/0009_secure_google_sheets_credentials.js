migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('google_sheets_config')

    collection.listRule = null
    collection.viewRule = null
    collection.createRule = null
    collection.updateRule = null
    collection.deleteRule = null

    const legacyPrivateKey = collection.fields.getByName('private_key')
    if (legacyPrivateKey) {
      legacyPrivateKey.required = false
    }

    if (!collection.fields.getByName('credential_encrypted')) {
      collection.fields.add(
        new TextField({
          name: 'credential_encrypted',
          required: false,
        }),
      )
    }

    const records = app.findRecordsByFilter('google_sheets_config', '', '', 1000, 0)
    const encryptionKey = $os.getenv('GOOGLE_SHEETS_ENCRYPTION_KEY')

    for (let i = 0; i < records.length; i++) {
      const record = records[i]
      const privateKey = record.getString('private_key')
      const automaticSyncEnabled = record.getBool('sincronizacao_automatica')
      if (!privateKey && !automaticSyncEnabled) continue

      if (privateKey) {
        if (encryptionKey.length !== 32) {
          throw new Error(
            'Set GOOGLE_SHEETS_ENCRYPTION_KEY to a 32-character secret before migrating existing Google Sheets credentials.',
          )
        }

        const serviceAccount = {
          client_email: record.getString('client_email'),
          project_id: record.getString('project_id'),
          private_key: privateKey,
        }

        record.set(
          'credential_encrypted',
          $security.encrypt(JSON.stringify(serviceAccount), encryptionKey),
        )
        record.set('private_key', '')
      }

      record.set('sincronizacao_automatica', false)
      app.save(record)
    }

    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('google_sheets_config')
    const encryptedCredentialField = collection.fields.getByName('credential_encrypted')
    if (encryptedCredentialField) {
      const records = app.findRecordsByFilter('google_sheets_config', '', '', 1000, 0)
      const encryptionKey = $os.getenv('GOOGLE_SHEETS_ENCRYPTION_KEY')

      for (let i = 0; i < records.length; i++) {
        const record = records[i]
        const encryptedCredential = record.getString('credential_encrypted')
        if (!encryptedCredential) continue
        if (encryptionKey.length !== 32) {
          throw new Error(
            'Set GOOGLE_SHEETS_ENCRYPTION_KEY to the configured 32-character secret before rolling back Google Sheets credentials.',
          )
        }

        const serviceAccount = JSON.parse($security.decrypt(encryptedCredential, encryptionKey))
        record.set('client_email', serviceAccount.client_email)
        record.set('project_id', serviceAccount.project_id || '')
        record.set('private_key', serviceAccount.private_key)
        app.save(record)
      }

      collection.fields.removeByName('credential_encrypted')
    }
    app.save(collection)
  },
)
