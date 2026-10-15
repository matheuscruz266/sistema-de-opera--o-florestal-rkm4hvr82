migrate(
  (app) => {
    // Coleção para armazenar a configuração da integração Google Sheets da D2 (Picador Toledo)
    // Apenas Admin pode ler e alterar; a private_key é armazenada no banco para uso do servidor
    const googleSheetsCol = new Collection({
      name: 'google_sheets_config',
      type: 'base',
      listRule: "@request.auth.id != '' && @request.auth.papel = 'admin'",
      viewRule: "@request.auth.id != '' && @request.auth.papel = 'admin'",
      createRule: "@request.auth.id != '' && @request.auth.papel = 'admin'",
      updateRule: "@request.auth.id != '' && @request.auth.papel = 'admin'",
      deleteRule: "@request.auth.id != '' && @request.auth.papel = 'admin'",
      fields: [
        { name: 'nome', type: 'text', required: true },
        { name: 'spreadsheet_id', type: 'text', required: true },
        { name: 'sheet_range', type: 'text' }, // Ex.: 'P1!A:Z' ou 'Dados!A:Z'
        { name: 'client_email', type: 'text' },
        { name: 'project_id', type: 'text' },
        { name: 'private_key', type: 'text', required: true }, // Armazenada no banco para os hooks realizarem JWT; nunca retornada no GET público
        { name: 'is_ativa', type: 'bool' },
        { name: 'sincronizacao_automatica', type: 'bool' }, // Se true, roda no cron periódico
        { name: 'intervalo_minutos', type: 'number' },
        { name: 'ultima_sincronizacao', type: 'text' },
        { name: 'linhas_ingeridas_total', type: 'number' },
        { name: 'ultimo_status', type: 'text' }, // 'sucesso', 'erro', 'pendente'
        { name: 'ultimo_erro', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_sheets_cfg_ativa ON google_sheets_config (is_ativa)'],
    })
    app.save(googleSheetsCol)
  },
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('google_sheets_config')
      app.delete(col)
    } catch (_) {}
  },
)
