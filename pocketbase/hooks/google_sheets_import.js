const GOOGLE_SHEETS_IMPORT_SHEETS = [
  {
    name: 'Fazendas',
    target: 'Cadastro de Fazendas',
    destination: 'fazendas',
    key: 'ID_Fazenda',
    mapping: 'ID_Fazenda → codigo; Fazenda → nome; UF → uf; Situação → status',
    required: ['ID_Fazenda', 'Fazenda', 'UF'],
    catalog: true,
  },
  {
    name: 'Maquinas',
    target: 'Cadastro de Máquinas',
    destination: 'maquinas',
    key: 'ID_Maquina',
    mapping:
      'ID_Maquina → id_maquina; Equipamento → equipamento; BT → bt; Usuario → usuario_responsavel; P_Ordens e Equipamento → tipo',
    required: ['ID_Maquina', 'Equipamento'],
    catalog: true,
  },
  {
    name: 'Talhao',
    target: 'Cadastro de Talhões',
    destination: 'talhoes',
    key: 'ID_talhao',
    mapping:
      'ID_talhao → origem_id; Talhao → talhao; Fazenda inferida pelas abas de Trabalho e históricos',
    required: ['ID_talhao', 'Talhao'],
    catalog: true,
  },
  {
    name: 'Usuarios',
    target: 'Usuários e Papéis de Acesso',
    destination: 'users',
    key: 'email',
    mapping:
      'email → conta existente; Colaborador → name; acesso → papel; não cria contas nem altera senhas',
    required: ['email', 'Colaborador', 'acesso'],
  },
  {
    name: 'Motivo',
    target: 'Motivos e Justificativas',
    destination: 'motivos',
    key: 'ID_Motivo',
    mapping:
      'ID_Motivo → id_motivo; Equipamento → equipamento; Motivo → motivo; Status_motivo → status; categoria classificada pelo texto',
    required: ['ID_Motivo', 'Motivo'],
    catalog: true,
  },
  {
    name: 'Trabalho',
    target: 'Registros de Trabalho no App',
    destination: 'trabalho',
    key: 'ID_trabalho',
    mapping:
      'ID_trabalho, email, Data, Fazenda, P_Ordens, Talhao, Localizacao e Status_Atual → registro de Trabalho; linha original restrita a administradores',
    required: ['ID_trabalho'],
  },
  {
    name: 'Caminhao_Baldeio',
    target: 'Caminhões de Baldeio',
    destination: 'caminhao_baldeio',
    key: 'ID_cam_baldeio',
    mapping:
      'ID_cam_baldeio → origem_id; Placa_Baldeio → placa_baldeio; Modelo → modelo; Situação → status',
    required: ['ID_cam_baldeio', 'Placa_Baldeio', 'Modelo'],
    catalog: true,
  },
  {
    name: 'Historico_Feller',
    target: 'Histórico Operacional — Feller Buncher',
    destination: 'historico_feller',
    key: 'id_historico',
    mapping:
      'id_historico → origem_id; Equipamento + Talhao + Fazenda → relações; Inicio → data_operacao; Tempo → horas_trabalhadas; Litros → combustivel_litros; Status, Motivo, Horimetro e Localizacao → observacoes',
    required: ['id_historico', 'Inicio', 'Talhao', 'Equipamento'],
  },
  {
    name: 'Historico_Skidder',
    target: 'Histórico Operacional — Skidder',
    destination: 'historico_skidder',
    key: 'id_historico',
    mapping:
      'id_historico → origem_id; Equipamento + Talhao + Fazenda → relações; Inicio → data_operacao; Tempo → horas_trabalhadas; Litros → combustivel_litros; Status, Motivo, Horimetro e Localizacao → observacoes',
    required: ['id_historico', 'Inicio', 'Talhao', 'Equipamento'],
  },
  {
    name: 'Historico_Baldeio',
    target: 'Histórico de Baldeio — Saída do Talhão',
    destination: 'historico_baldeio',
    key: 'id_historico',
    mapping:
      'id_historico → origem_id; Placa_Baldeio + Talhao + Fazenda → relações; Inicio/Fim → saída/chegada; SR_Toras → volume_sr; Ordem → numero_viagem; Pilha destino fica vazia quando não existe na origem',
    required: ['id_historico', 'Inicio', 'Talhao', 'Placa_Baldeio', 'SR_Toras'],
  },
  {
    name: 'Historico_Descarga',
    target: 'Histórico de Descarga — Recebimento no Pátio',
    destination: 'historico_descarga',
    key: 'id_historico',
    mapping:
      'id_historico → origem_id; Placa_Baldeio + Pilha → relações; Fim (ou Inicio) → data_hora_descarga; SR_Toras → volume_sr; conversão vigente (ou padrão do sistema 0,84) → volume_m3_calculado; status de aceite explícito → status_aceite',
    required: ['id_historico', 'Placa_Baldeio', 'Pilha', 'SR_Toras', 'Inicio'],
  },
  {
    name: 'Historico_picador',
    target: 'Consumo no Picador e Expedição de Cavaco',
    destination: 'historico_picador',
    key: 'id_historico',
    mapping:
      'id_historico → origem_id; Caminhao + Pilha → relações; Nota → nota_fiscal; Inicio → data_hora_expedicao; SR_Cavaco → volume_cavaco_m3; fator operacional existente 0,4 → volume_tora_consumido_m3',
    required: ['id_historico', 'Caminhao', 'Pilha', 'Inicio', 'SR_Cavaco'],
  },
  {
    name: 'Caminhao',
    target: 'Caminhões Rodoviários — Expedição',
    destination: 'caminhoes',
    key: 'ID_caminhao',
    mapping: 'ID_caminhao → origem_id; Placa → placa; Modelo → modelo; Situação → status',
    required: ['ID_caminhao', 'Placa', 'Modelo'],
    catalog: true,
  },
  {
    name: 'Pilha',
    target: 'Cadastro de Pilhas',
    destination: 'pilhas',
    key: 'Id_pilha',
    mapping:
      'Id_pilha → origem_id; Pilha → codigo/nome; Fazenda inferida pelos históricos; produto inferido pelos movimentos relacionados',
    required: ['Id_pilha', 'Pilha'],
    catalog: true,
  },
]

const GOOGLE_SHEETS_REFERENCE_SHEETS = [
  'Fazendas',
  'Maquinas',
  'Talhao',
  'Motivo',
  'Caminhao_Baldeio',
  'Caminhao',
  'Pilha',
]

const GOOGLE_SHEETS_IMPORT_ORDER = [
  'Fazendas',
  'Maquinas',
  'Motivo',
  'Caminhao_Baldeio',
  'Caminhao',
  'Usuarios',
  'Talhao',
  'Pilha',
  'Trabalho',
  'Historico_Feller',
  'Historico_Skidder',
  'Historico_Baldeio',
  'Historico_Descarga',
  'Historico_picador',
]

function gsNormalize(value) {
  return String(value === null || value === undefined ? '' : value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

function gsIsDuration(value) {
  if (typeof value === 'number') return Number.isFinite(value)
  const raw = gsString(value)
  if (!raw) return false
  if (Number.isFinite(Number(raw))) return true
  return /^\d{1,3}:\d{2}(?::\d{2})?$/.test(raw)
}

function gsValue(row, name) {
  return row.values[gsNormalize(name)] ?? ''
}

function gsString(value) {
  return value === null || value === undefined ? '' : String(value).trim()
}

function gsNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  const raw = gsString(value)
  if (!raw) return null
  const normalized =
    raw.includes(',') && raw.includes('.')
      ? raw.replace(/\./g, '').replace(',', '.')
      : raw.replace(',', '.')
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

function gsDateTime(value) {
  if (typeof value === 'number' && value > 0) {
    if (value > 2958465) return ''
    return new Date(Date.UTC(1899, 11, 30) + Math.round(value * 86400000)).toISOString()
  }
  const raw = gsString(value)
  if (!raw) return ''
  const numeric = Number(raw)
  if (Number.isFinite(numeric) && numeric > 0) {
    if (numeric > 2958465) return ''
    return new Date(Date.UTC(1899, 11, 30) + Math.round(numeric * 86400000)).toISOString()
  }
  const parsed = new Date(raw)
  return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString()
}

function gsDurationHours(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.max(0, value * 24)
  const raw = gsString(value)
  if (!raw) return 0
  const excelDuration = Number(raw)
  if (Number.isFinite(excelDuration)) return Math.max(0, excelDuration * 24)
  const match = raw.match(/^(\d{1,3}):(\d{2})(?::(\d{2}))?$/)
  if (!match) return 0
  return Number(match[1]) + Number(match[2]) / 60 + Number(match[3] || 0) / 3600
}

function gsActiveStatus(value, inactiveValue) {
  const status = gsNormalize(value)
  return status === 'inativo' || status === 'inativa' || status === 'inactive'
    ? inactiveValue
    : inactiveValue === 'inativa'
      ? 'ativa'
      : 'ativo'
}

function gsStatusApproved(value) {
  const status = gsNormalize(value)
  if (status.includes('rejeit')) return 'rejeitado'
  if (status.includes('aceit') || status === 'concluido' || status === 'concluida') return 'aceito'
  return 'pendente'
}

function gsGetRows(sheetName, sheets) {
  return sheets[sheetName] ? sheets[sheetName].rows : []
}

function gsSheetRows(sheets, name) {
  return gsGetRows(name, sheets)
}

function gsHeaderIssues(sheet, spec) {
  const issues = []
  if (!sheet.headers.length) return ['A aba está vazia ou não possui cabeçalho na primeira linha.']
  const seen = {}
  for (const header of sheet.headers) {
    const key = gsNormalize(header)
    if (!key) issues.push('Existe um cabeçalho vazio na primeira linha.')
    else if (seen[key]) issues.push(`Cabeçalho duplicado: ${header}.`)
    else seen[key] = true
  }
  for (const requiredField of spec.required) {
    if (!seen[gsNormalize(requiredField)]) {
      issues.push(`Cabeçalho obrigatório ausente: ${requiredField}.`)
    }
  }
  return issues
}

function gsPreviewHasValue(sheetRows, fields, value) {
  const target = gsNormalize(value)
  if (!target) return false
  return sheetRows.some((row) =>
    fields.some((field) => gsNormalize(gsValue(row, field)) === target),
  )
}

function gsPreviewHasExisting(records, fields, value) {
  const target = gsNormalize(value)
  if (!target) return false
  return records.some((record) => {
    if (gsNormalize(record.id) === target) return true
    return fields.some((field) => gsNormalize(record.getString(field)) === target)
  })
}

function gsPreviewRelationIssues(existing, sheets, spec, row) {
  const issues = []
  const hasFarm = (value) =>
    gsPreviewHasValue(gsSheetRows(sheets, 'Fazendas'), ['ID_Fazenda', 'Fazenda'], value) ||
    gsPreviewHasExisting(existing.fazendas, ['codigo', 'nome'], value)
  const hasTalhao = (value) =>
    gsPreviewHasValue(gsSheetRows(sheets, 'Talhao'), ['ID_talhao', 'Talhao'], value) ||
    gsPreviewHasExisting(existing.talhoes, ['origem_id', 'talhao'], value)
  const hasMachine = (value) =>
    gsPreviewHasValue(
      gsSheetRows(sheets, 'Maquinas'),
      ['ID_Maquina', 'Equipamento', 'BT', 'P_Ordens'],
      value,
    ) || gsPreviewHasExisting(existing.maquinas, ['id_maquina', 'equipamento', 'bt'], value)
  const hasRoadTruck = (value) =>
    gsPreviewHasValue(gsSheetRows(sheets, 'Caminhao'), ['ID_caminhao', 'Placa', 'Modelo'], value) ||
    gsPreviewHasExisting(existing.caminhoes, ['origem_id', 'placa', 'modelo'], value)
  const hasBaldeioTruck = (value) =>
    gsPreviewHasValue(
      gsSheetRows(sheets, 'Caminhao_Baldeio'),
      ['ID_cam_baldeio', 'Placa_Baldeio', 'Modelo'],
      value,
    ) ||
    gsPreviewHasExisting(existing.caminhao_baldeio, ['origem_id', 'placa_baldeio', 'modelo'], value)
  const hasPile = (value) =>
    gsPreviewHasValue(gsSheetRows(sheets, 'Pilha'), ['Id_pilha', 'Pilha'], value) ||
    gsPreviewHasExisting(existing.pilhas, ['origem_id', 'codigo', 'nome'], value)

  if (spec.name === 'Talhao') {
    const farmName = gsInferFarmForValue(sheets, 'Talhao', gsValue(row, 'Talhao'))
    if (!farmName || !hasFarm(farmName)) {
      issues.push('Não foi possível associar o Talhão a uma única Fazenda.')
    } else {
      const duplicateSourceNames = gsSheetRows(sheets, 'Talhao').filter(
        (item) =>
          gsNormalize(gsValue(item, 'Talhao')) === gsNormalize(gsValue(row, 'Talhao')) &&
          gsNormalize(gsInferFarmForValue(sheets, 'Talhao', gsValue(item, 'Talhao'))) ===
            gsNormalize(farmName),
      )
      if (duplicateSourceNames.length > 1) {
        issues.push('Há mais de uma linha de origem com este Talhão e Fazenda.')
      }
      const farm = existing.fazendas.find(
        (record) =>
          gsNormalize(record.getString('codigo')) === gsNormalize(farmName) ||
          gsNormalize(record.getString('nome')) === gsNormalize(farmName),
      )
      const sameFarmTalhoes = farm
        ? existing.talhoes.filter(
            (record) =>
              gsNormalize(record.getString('talhao')) === gsNormalize(gsValue(row, 'Talhao')) &&
              record.getString('fazenda_id') === farm.id,
          )
        : []
      if (sameFarmTalhoes.length > 1) {
        issues.push('Há mais de um cadastro existente com este Talhão e Fazenda.')
      }
    }
  } else if (spec.name === 'Pilha') {
    const farmName = gsInferFarmForValue(sheets, 'Pilha', gsValue(row, 'Pilha'))
    if (!farmName || !hasFarm(farmName)) {
      issues.push('Não foi possível associar a Pilha a uma única Fazenda.')
    }
    const pileName = gsNormalize(gsValue(row, 'Pilha'))
    const hasCavaco = gsSheetRows(sheets, 'Historico_picador').some(
      (item) => gsNormalize(gsValue(item, 'Pilha')) === pileName,
    )
    const hasToras = ['Historico_Baldeio', 'Historico_Descarga'].some((sheetName) =>
      gsSheetRows(sheets, sheetName).some(
        (item) => gsNormalize(gsValue(item, 'Pilha')) === pileName,
      ),
    )
    if (!hasCavaco && !hasToras)
      issues.push('Não foi possível inferir o produto da Pilha pelos históricos.')
  } else if (spec.name === 'Historico_Feller' || spec.name === 'Historico_Skidder') {
    if (!hasMachine(gsValue(row, 'Equipamento'))) {
      issues.push('Equipamento não corresponde a uma Máquina cadastrada ou importada.')
    }
    if (!hasTalhao(gsValue(row, 'Talhao'))) {
      issues.push('Talhão não corresponde a um cadastro existente ou importado.')
    }
    const farmName = gsInferFarmForValue(sheets, 'Talhao', gsValue(row, 'Talhao'))
    if (farmName && !hasFarm(farmName))
      issues.push('Fazenda relacionada ao Talhão não foi localizada.')
    if (!gsDateTime(gsValue(row, 'Inicio'))) issues.push('Inicio não contém uma data reconhecida.')
    if (!gsIsDuration(gsValue(row, 'Tempo')))
      issues.push('Tempo não contém uma duração reconhecida.')
    if (gsNumber(gsValue(row, 'Litros')) === null)
      issues.push('Litros não contém um número reconhecido.')
  } else if (spec.name === 'Historico_Baldeio') {
    const volume = gsNumber(gsValue(row, 'SR_Toras'))
    if (volume === null || volume <= 0)
      issues.push('SR_Toras precisa ser um número maior que zero.')
    if (!hasBaldeioTruck(gsValue(row, 'Placa_Baldeio'))) {
      issues.push('Placa_Baldeio não corresponde a um caminhão de baldeio.')
    }
    if (!hasTalhao(gsValue(row, 'Talhao'))) {
      issues.push('Talhão não corresponde a um cadastro existente ou importado.')
    }
    if (!gsDateTime(gsValue(row, 'Inicio'))) issues.push('Inicio não contém uma data reconhecida.')
  } else if (spec.name === 'Historico_Descarga') {
    const volume = gsNumber(gsValue(row, 'SR_Toras'))
    if (volume === null || volume <= 0)
      issues.push('SR_Toras precisa ser um número maior que zero.')
    if (!hasBaldeioTruck(gsValue(row, 'Placa_Baldeio'))) {
      issues.push('Placa_Baldeio não corresponde a um caminhão de baldeio.')
    }
    if (!hasPile(gsValue(row, 'Pilha'))) {
      issues.push('Pilha não corresponde a um cadastro existente ou importado.')
    }
    if (!gsDateTime(gsValue(row, 'Fim') || gsValue(row, 'Inicio'))) {
      issues.push('Fim/Inicio não contém uma data reconhecida.')
    }
  } else if (spec.name === 'Historico_picador') {
    const volume = gsNumber(gsValue(row, 'SR_Cavaco'))
    if (volume === null || volume <= 0)
      issues.push('SR_Cavaco precisa ser um número maior que zero.')
    if (!hasRoadTruck(gsValue(row, 'Caminhao'))) {
      issues.push('Caminhao não corresponde a um caminhão rodoviário.')
    }
    if (!hasPile(gsValue(row, 'Pilha'))) {
      issues.push('Pilha não corresponde a um cadastro existente ou importado.')
    }
    if (!gsDateTime(gsValue(row, 'Inicio'))) issues.push('Inicio não contém uma data reconhecida.')
  } else if (spec.name === 'Usuarios') {
    const role = gsNormalize(gsValue(row, 'acesso'))
    if (!['admin', 'operador', 'conferente'].includes(role)) {
      issues.push('Papel de acesso precisa ser admin, operador ou conferente.')
    }
  }
  return issues
}

function gsBuildWorkbook(e, config) {
  const encryptionKey = $os.getenv('GOOGLE_SHEETS_ENCRYPTION_KEY')
  if (!encryptionKey || encryptionKey.length !== 32) {
    throw new Error(
      'Configure GOOGLE_SHEETS_ENCRYPTION_KEY com exatamente 32 caracteres no PocketBase.',
    )
  }

  const encryptedCredential = config.getString('credential_encrypted')
  if (!encryptedCredential)
    throw new Error('A credencial da conta de serviço não está configurada.')

  let serviceAccount
  try {
    serviceAccount = JSON.parse($security.decrypt(encryptedCredential, encryptionKey))
  } catch (_) {
    throw new Error('Não foi possível descriptografar a credencial armazenada no PocketBase.')
  }

  const jwtSigner = require(`${__hooks}/google_jwt.js`)
  const signedJwt = jwtSigner.signGoogleServiceAccountJwt(
    serviceAccount.client_email,
    serviceAccount.private_key,
  )

  const tokenResponse = $http.send({
    method: 'POST',
    url: 'https://oauth2.googleapis.com/token',
    body:
      'grant_type=' +
      encodeURIComponent('urn:ietf:params:oauth:grant-type:jwt-bearer') +
      '&assertion=' +
      encodeURIComponent(signedJwt),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    timeout: 30,
  })
  if (tokenResponse.statusCode !== 200 || !tokenResponse.json.access_token) {
    const detail =
      (tokenResponse.json && (tokenResponse.json.error_description || tokenResponse.json.error)) ||
      'O Google não emitiu um token de acesso.'
    throw new Error(`Falha na autenticação com Google: ${detail}`)
  }

  const ranges = GOOGLE_SHEETS_IMPORT_SHEETS.map((sheet) => `'${sheet.name}'!A:Z`)
  const query = ranges.map((range) => `ranges=${encodeURIComponent(range)}`).join('&')
  const response = $http.send({
    method: 'GET',
    url:
      `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(config.getString('spreadsheet_id'))}/values:batchGet?` +
      query +
      '&valueRenderOption=UNFORMATTED_VALUE&dateTimeRenderOption=SERIAL_NUMBER',
    headers: { Authorization: `Bearer ${tokenResponse.json.access_token}` },
    timeout: 60,
  })
  if (response.statusCode !== 200) {
    const detail =
      (response.json && response.json.error && response.json.error.message) ||
      `Google Sheets respondeu HTTP ${response.statusCode}.`
    throw new Error(detail)
  }

  const sheets = {}
  const valueRanges = response.json.valueRanges || []
  for (let sheetIndex = 0; sheetIndex < GOOGLE_SHEETS_IMPORT_SHEETS.length; sheetIndex++) {
    const spec = GOOGLE_SHEETS_IMPORT_SHEETS[sheetIndex]
    const values = (valueRanges[sheetIndex] && valueRanges[sheetIndex].values) || []
    const headers = (values[0] || []).map((header) => gsString(header))
    const rows = []
    for (let rowIndex = 1; rowIndex < values.length; rowIndex++) {
      const cells = values[rowIndex] || []
      if (!cells.some((cell) => gsString(cell) !== '')) continue
      const normalized = {}
      headers.forEach((header, columnIndex) => {
        const key = gsNormalize(header)
        if (key) normalized[key] = cells[columnIndex] === undefined ? '' : cells[columnIndex]
      })
      rows.push({
        line: rowIndex + 1,
        values: normalized,
      })
    }
    sheets[spec.name] = { headers, rows }
  }

  return { sheets, serviceAccount }
}

function gsFindRecords(app, collectionName) {
  return app.findRecordsByFilter(collectionName, '', '', 20000, 0)
}

function gsCollectionRecords(app, collectionName, cache) {
  if (!cache[collectionName]) cache[collectionName] = gsFindRecords(app, collectionName)
  return cache[collectionName]
}

function gsSaveRecord(app, collectionName, record, existing, cache) {
  app.save(record)
  if (!existing) gsCollectionRecords(app, collectionName, cache).push(record)
}

function gsExistingKey(sheetName, record) {
  if (sheetName === 'Fazendas') return [record.getString('codigo')]
  if (sheetName === 'Maquinas') return [record.getString('id_maquina')]
  if (sheetName === 'Motivo') return [record.getString('id_motivo')]
  if (sheetName === 'Usuarios') return [record.getString('email')]
  if (sheetName === 'Caminhao') return [record.getString('origem_id'), record.getString('placa')]
  if (sheetName === 'Caminhao_Baldeio') {
    return [record.getString('origem_id'), record.getString('placa_baldeio')]
  }
  if (sheetName === 'Pilha') {
    return [record.getString('origem_id'), record.getString('codigo')]
  }
  return [record.getString('origem_id')]
}

function gsPreviewIdentity(spec, row) {
  const values = [gsValue(row, spec.key)]
  if (spec.name === 'Caminhao') values.push(gsValue(row, 'Placa'))
  if (spec.name === 'Caminhao_Baldeio') values.push(gsValue(row, 'Placa_Baldeio'))
  if (spec.name === 'Pilha') values.push(gsValue(row, 'Pilha'))
  return values.map(gsNormalize).filter(Boolean)
}

function gsPreviewMatchesExisting(spec, row, existingBySheet, existing, sheets) {
  if (gsPreviewIdentity(spec, row).some((identity) => existingBySheet[spec.name][identity])) {
    return true
  }
  if (spec.name !== 'Talhao') return false

  const farmName = gsInferFarmForValue(sheets, 'Talhao', gsValue(row, 'Talhao'))
  const farms = existing.fazendas.filter(
    (record) =>
      gsNormalize(record.getString('codigo')) === gsNormalize(farmName) ||
      gsNormalize(record.getString('nome')) === gsNormalize(farmName),
  )
  if (farms.length !== 1) return false
  return existing.talhoes.some(
    (record) =>
      gsNormalize(record.getString('talhao')) === gsNormalize(gsValue(row, 'Talhao')) &&
      record.getString('fazenda_id') === farms[0].id,
  )
}

function gsCreatePreview(e, sheets) {
  const existingBySheet = {}
  const existingRelations = {
    fazendas: gsFindRecords(e.app, 'fazendas'),
    maquinas: gsFindRecords(e.app, 'maquinas'),
    talhoes: gsFindRecords(e.app, 'talhoes'),
    caminhoes: gsFindRecords(e.app, 'caminhoes'),
    caminhao_baldeio: gsFindRecords(e.app, 'caminhao_baldeio'),
    pilhas: gsFindRecords(e.app, 'pilhas'),
  }
  for (const spec of GOOGLE_SHEETS_IMPORT_SHEETS) {
    const records = existingRelations[spec.destination] || gsFindRecords(e.app, spec.destination)
    const keys = {}
    records.forEach((record) => {
      for (const key of gsExistingKey(spec.name, record)) {
        if (key) keys[gsNormalize(key)] = true
      }
    })
    existingBySheet[spec.name] = keys
  }

  const summary = []
  let totalRows = 0
  let totalUpdates = 0
  let totalCreates = 0
  let totalErrors = 0
  let totalSkipped = 0

  for (const spec of GOOGLE_SHEETS_IMPORT_SHEETS) {
    const sheet = sheets[spec.name]
    const headerIssues = gsHeaderIssues(sheet, spec)
    const rows = sheet.rows
    const seen = {}
    let creates = 0
    let updates = 0
    let errors = 0
    let skipped = 0
    const issues = headerIssues.map((message) => ({ row: 1, message }))

    if (headerIssues.length) errors += 1
    for (const row of rows) {
      const key = gsString(gsValue(row, spec.key))
      const rowErrors = []
      if (!key) rowErrors.push(`Identificador de origem ausente (${spec.key}).`)
      const duplicateKey = gsNormalize(key)
      if (duplicateKey && seen[duplicateKey]) {
        rowErrors.push(`Identificador duplicado na origem (${spec.key}).`)
      } else if (duplicateKey) {
        seen[duplicateKey] = true
      }
      for (const requiredField of spec.required) {
        if (!gsString(gsValue(row, requiredField))) {
          rowErrors.push(`Campo obrigatório vazio: ${requiredField}.`)
        }
      }

      if (spec.name === 'Historico_picador' && !gsString(gsValue(row, 'Nota'))) {
        skipped++
        continue
      }
      rowErrors.push(...gsPreviewRelationIssues(existingRelations, sheets, spec, row))
      if (spec.name === 'Usuarios' && key && !existingBySheet[spec.name][duplicateKey]) {
        skipped++
        continue
      }

      if (rowErrors.length) {
        errors++
        if (issues.length < 12) {
          issues.push({ row: row.line, message: rowErrors.join(' ') })
        }
      } else if (gsPreviewMatchesExisting(spec, row, existingBySheet, existingRelations, sheets)) {
        updates++
      } else {
        creates++
      }
    }

    const counts = {
      name: spec.name,
      target: spec.target,
      destination: spec.destination,
      key: spec.key,
      mapping: spec.mapping,
      headers: sheet.headers,
      rows: rows.length,
      creates,
      updates,
      skipped,
      errors,
      issues,
      catalog: spec.catalog === true,
      replacementNote: spec.catalog
        ? 'Registros de origem ausentes serão inativados, não excluídos.'
        : '',
    }
    summary.push(counts)
    totalRows += rows.length
    totalCreates += creates
    totalUpdates += updates
    totalErrors += errors
    totalSkipped += skipped
  }

  return {
    sucesso: totalErrors === 0,
    planilha_id: '',
    total_linhas: totalRows,
    novos: totalCreates,
    atualizacoes: totalUpdates,
    ignorados: totalSkipped,
    erros: totalErrors,
    abas: summary,
    ordem_importacao: [
      'Fazendas, máquinas, caminhões e motivos',
      'Usuários existentes e cadastros de Talhões e Pilhas',
      'Trabalho e históricos operacionais',
    ],
    observacao:
      'A prévia valida cabeçalhos, identificadores e campos obrigatórios. A importação valida também relações e formatos antes de salvar cada linha.',
  }
}

function gsMakeLookup(records, fieldNames) {
  const lookup = {}
  const add = (value, record) => {
    const key = gsNormalize(value)
    if (!key) return
    if (!lookup[key]) lookup[key] = []
    if (!lookup[key].some((item) => item.id === record.id)) lookup[key].push(record)
  }
  for (const record of records) {
    add(record.id, record)
    for (const fieldName of fieldNames) add(record.getString(fieldName), record)
  }
  return lookup
}

function gsLookup(lookup, value) {
  const key = gsNormalize(value)
  if (!key || !lookup[key] || lookup[key].length !== 1) return null
  return lookup[key][0]
}

function gsFindBySource(app, collectionName, originId, cache) {
  if (!originId) return null
  const records = cache
    ? gsCollectionRecords(app, collectionName, cache)
    : gsFindRecords(app, collectionName)
  for (const record of records) {
    if (record.getString('origem_id') === originId) return record
  }
  return null
}

function gsRowIsEmpty(row) {
  return Object.keys(row.values).every((key) => gsString(row.values[key]) === '')
}

function gsCreateRecord(app, collectionName, existing) {
  const collection = app.findCollectionByNameOrId(collectionName)
  return existing || new Record(collection)
}

function gsInferFarmForValue(sheetData, targetField, targetValue) {
  const target = gsNormalize(targetValue)
  if (!target) return ''
  const references = {}
  const historySheets = [
    'Trabalho',
    'Historico_Feller',
    'Historico_Skidder',
    'Historico_Baldeio',
    'Historico_Descarga',
    'Historico_picador',
  ]
  for (const sheetName of historySheets) {
    for (const row of gsSheetRows(sheetData, sheetName)) {
      if (gsNormalize(gsValue(row, targetField)) !== target) continue
      const farm = gsString(gsValue(row, 'Fazenda'))
      if (farm) references[gsNormalize(farm)] = farm
    }
  }
  const farms = Object.keys(references)
  return farms.length === 1 ? references[farms[0]] : ''
}

function gsLookupFarm(app, value, cache) {
  const records = cache
    ? gsCollectionRecords(app, 'fazendas', cache)
    : gsFindRecords(app, 'fazendas')
  const lookup = gsMakeLookup(records, ['codigo', 'nome'])
  return gsLookup(lookup, value)
}

function gsLookupTalhao(app, value, farmId, cache) {
  const records = cache ? gsCollectionRecords(app, 'talhoes', cache) : gsFindRecords(app, 'talhoes')
  const matches = records.filter(
    (record) =>
      gsNormalize(record.getString('origem_id')) === gsNormalize(value) ||
      gsNormalize(record.getString('talhao')) === gsNormalize(value),
  )
  const sameFarm = farmId
    ? matches.filter((record) => record.getString('fazenda_id') === farmId)
    : matches
  return sameFarm.length === 1 ? sameFarm[0] : null
}

function gsLookupMachine(app, value, cache) {
  const records = cache
    ? gsCollectionRecords(app, 'maquinas', cache)
    : gsFindRecords(app, 'maquinas')
  return gsLookup(gsMakeLookup(records, ['id_maquina', 'equipamento', 'bt']), value)
}

function gsLookupMachineFromSheets(app, sheets, value, cache) {
  const direct = gsLookupMachine(app, value, cache)
  if (direct) return direct
  const matches = gsSheetRows(sheets, 'Maquinas').filter((row) =>
    ['ID_Maquina', 'Equipamento', 'BT', 'P_Ordens'].some(
      (field) => gsNormalize(gsValue(row, field)) === gsNormalize(value),
    ),
  )
  if (matches.length !== 1) return null
  return gsLookupMachine(app, gsValue(matches[0], 'ID_Maquina'), cache)
}

function gsLookupTruck(app, value, baldeio, cache) {
  const collectionName = baldeio ? 'caminhao_baldeio' : 'caminhoes'
  const fields = baldeio ? ['origem_id', 'placa_baldeio'] : ['origem_id', 'placa']
  const records = cache
    ? gsCollectionRecords(app, collectionName, cache)
    : gsFindRecords(app, collectionName)
  return gsLookup(gsMakeLookup(records, fields), value)
}

function gsLookupTruckFromSheets(app, sheets, value, baldeio, cache) {
  const direct = gsLookupTruck(app, value, baldeio, cache)
  if (direct) return direct
  const sheetName = baldeio ? 'Caminhao_Baldeio' : 'Caminhao'
  const idField = baldeio ? 'ID_cam_baldeio' : 'ID_caminhao'
  const plateField = baldeio ? 'Placa_Baldeio' : 'Placa'
  const matches = gsSheetRows(sheets, sheetName).filter(
    (row) =>
      gsNormalize(gsValue(row, idField)) === gsNormalize(value) ||
      gsNormalize(gsValue(row, plateField)) === gsNormalize(value) ||
      gsNormalize(gsValue(row, 'Modelo')) === gsNormalize(value),
  )
  if (matches.length !== 1) return null
  return gsLookupTruck(app, gsValue(matches[0], idField), baldeio, cache)
}

function gsLookupPile(app, value, farmId, cache) {
  const records = cache ? gsCollectionRecords(app, 'pilhas', cache) : gsFindRecords(app, 'pilhas')
  const matches = records.filter(
    (record) =>
      gsNormalize(record.getString('origem_id')) === gsNormalize(value) ||
      gsNormalize(record.getString('codigo')) === gsNormalize(value) ||
      gsNormalize(record.getString('nome')) === gsNormalize(value),
  )
  const sameFarm = farmId
    ? matches.filter((record) => record.getString('fazenda_id') === farmId)
    : matches
  return sameFarm.length === 1 ? sameFarm[0] : null
}

function gsResolveFarmForRow(app, sheets, row, cache) {
  const farmValue = gsString(gsValue(row, 'Fazenda'))
  return farmValue ? gsLookupFarm(app, farmValue, cache) : null
}

function gsResolveTalhaoForRow(app, sheets, row, cache) {
  const farmValue = gsString(gsValue(row, 'Fazenda'))
  const farm = farmValue ? gsLookupFarm(app, farmValue, cache) : null
  const talhaoValue = gsString(gsValue(row, 'Talhao'))
  if (!talhaoValue) return null
  const direct = gsLookupTalhao(app, talhaoValue, farm ? farm.id : '', cache)
  if (direct) return direct
  const inferredFarm = gsInferFarmForValue(sheets, 'Talhao', talhaoValue)
  const inferred = inferredFarm ? gsLookupFarm(app, inferredFarm, cache) : null
  return gsLookupTalhao(app, talhaoValue, inferred ? inferred.id : '', cache)
}

function gsResolvePileForRow(app, sheets, row, cache) {
  const farmValue = gsString(gsValue(row, 'Fazenda'))
  const farm = farmValue ? gsLookupFarm(app, farmValue, cache) : null
  const pileValue = gsString(gsValue(row, 'Pilha'))
  if (!pileValue) return null
  const direct = gsLookupPile(app, pileValue, farm ? farm.id : '', cache)
  if (direct) return direct
  const inferredFarm = gsInferFarmForValue(sheets, 'Pilha', pileValue)
  const inferred = inferredFarm ? gsLookupFarm(app, inferredFarm, cache) : null
  return gsLookupPile(app, pileValue, inferred ? inferred.id : '', cache)
}

function gsMapMachineType(value) {
  const text = gsNormalize(value)
  if (text.includes('feller') || text.startsWith('fb_') || text.includes('tigercat'))
    return 'feller'
  if (text.includes('skidder') || text.startsWith('sk_')) return 'skidder'
  if (text.includes('picador')) return 'picador'
  if (text.includes('colhedora')) return 'colhedora'
  return 'outros'
}

function gsMapMotivoCategory(value) {
  const text = gsNormalize(value)
  if (text.includes('cavaco') || text.includes('rejeic') || text.includes('recusa')) {
    return 'recusa_cavaco'
  }
  if (
    text.includes('parada') ||
    text.includes('sem_operacao') ||
    text.includes('troca') ||
    text.includes('manutencao')
  ) {
    return 'parada_maquina'
  }
  return 'outros'
}

function gsSourceStatus(value, inactiveValue) {
  return gsActiveStatus(value, inactiveValue)
}

function gsObservation(row) {
  const details = {}
  for (const sourceField of ['Status', 'Motivo', 'Horimetro', 'Localizacao', 'Operador']) {
    const value = gsString(gsValue(row, sourceField))
    if (value) details[sourceField] = value
  }
  return JSON.stringify(details)
}

function gsImportRow(app, sheets, spec, row, cache) {
  const sourceKey = gsString(gsValue(row, spec.key))
  const destination = spec.destination

  if (spec.name === 'Usuarios') {
    const email = gsString(gsValue(row, 'email')).toLowerCase()
    const users = gsCollectionRecords(app, 'users', cache)
    const user = users.find((record) => record.getString('email').toLowerCase() === email)
    if (!user) return { skipped: true, message: 'Conta de login não existe; não foi criada.' }
    const roleValue = gsNormalize(gsValue(row, 'acesso'))
    const role =
      roleValue === 'admin'
        ? 'admin'
        : roleValue === 'operador'
          ? 'operador'
          : roleValue === 'conferente'
            ? 'conferente'
            : ''
    if (!role) return { error: 'Papel de acesso da planilha não reconhecido.' }
    user.set('name', gsString(gsValue(row, 'Colaborador')))
    user.set('papel', role)
    app.save(user)
    return { updated: true }
  }

  if (spec.name === 'Fazendas') {
    const records = gsCollectionRecords(app, destination, cache)
    const existing = records.find((record) => record.getString('codigo') === sourceKey)
    const record = gsCreateRecord(app, destination, existing)
    record.set('codigo', sourceKey)
    record.set('nome', gsString(gsValue(row, 'Fazenda')))
    record.set('uf', gsString(gsValue(row, 'UF')).toUpperCase())
    record.set('status', gsSourceStatus(gsValue(row, 'Situação'), 'inativa'))
    gsSaveRecord(app, destination, record, existing, cache)
    return { updated: !!existing }
  }

  if (spec.name === 'Maquinas') {
    const records = gsCollectionRecords(app, destination, cache)
    const existing = records.find((record) => record.getString('id_maquina') === sourceKey)
    const record = gsCreateRecord(app, destination, existing)
    const equipment = gsString(gsValue(row, 'Equipamento'))
    record.set('id_maquina', sourceKey)
    record.set('equipamento', equipment)
    record.set('tipo', gsMapMachineType(`${equipment} ${gsValue(row, 'P_Ordens')}`))
    record.set('bt', gsString(gsValue(row, 'BT')))
    record.set('usuario_responsavel', gsString(gsValue(row, 'Usuario')))
    record.set('status', gsSourceStatus(gsValue(row, 'Situação'), 'inativa'))
    gsSaveRecord(app, destination, record, existing, cache)
    return { updated: !!existing }
  }

  if (spec.name === 'Caminhao' || spec.name === 'Caminhao_Baldeio') {
    const isBaldeio = spec.name === 'Caminhao_Baldeio'
    const plateField = isBaldeio ? 'placa_baldeio' : 'placa'
    const records = gsCollectionRecords(app, destination, cache)
    const existing = records.find(
      (record) =>
        gsNormalize(record.getString('origem_id')) === gsNormalize(sourceKey) ||
        gsNormalize(record.getString(plateField)) ===
          gsNormalize(gsValue(row, isBaldeio ? 'Placa_Baldeio' : 'Placa')),
    )
    const record = gsCreateRecord(app, destination, existing)
    record.set('origem_id', sourceKey)
    record.set(
      plateField,
      gsString(gsValue(row, isBaldeio ? 'Placa_Baldeio' : 'Placa')).toUpperCase(),
    )
    record.set('modelo', gsString(gsValue(row, 'Modelo')))
    record.set('status', gsSourceStatus(gsValue(row, 'Situação'), 'inativo'))
    gsSaveRecord(app, destination, record, existing, cache)
    return { updated: !!existing }
  }

  if (spec.name === 'Motivo') {
    const records = gsCollectionRecords(app, destination, cache)
    const existing = records.find((record) => record.getString('id_motivo') === sourceKey)
    const record = gsCreateRecord(app, destination, existing)
    const reason = gsString(gsValue(row, 'Motivo'))
    record.set('id_motivo', sourceKey)
    record.set('equipamento', gsString(gsValue(row, 'Equipamento')))
    record.set('motivo', reason)
    record.set('categoria', gsMapMotivoCategory(reason))
    record.set('status', gsSourceStatus(gsValue(row, 'Status_motivo'), 'inativo'))
    gsSaveRecord(app, destination, record, existing, cache)
    return { updated: !!existing }
  }

  if (spec.name === 'Talhao') {
    const label = gsString(gsValue(row, 'Talhao'))
    const farmName = gsInferFarmForValue(sheets, 'Talhao', label)
    const farm = farmName ? gsLookupFarm(app, farmName, cache) : null
    if (!farm) return { error: 'Não foi possível determinar uma única Fazenda para este Talhão.' }
    const records = gsCollectionRecords(app, destination, cache)
    const sourceRecord = gsFindBySource(app, destination, sourceKey, cache)
    const sameName = records.filter(
      (item) =>
        gsNormalize(item.getString('talhao')) === gsNormalize(label) &&
        item.getString('fazenda_id') === farm.id,
    )
    if (sameName.length > 1) {
      return { error: 'Há mais de um cadastro existente com este Talhão e Fazenda.' }
    }
    const existing = sourceRecord || sameName[0] || null
    const record = gsCreateRecord(app, destination, existing)
    record.set('origem_id', sourceKey)
    record.set('talhao', label)
    record.set('fazenda_id', farm.id)
    record.set('status', 'ativo')
    gsSaveRecord(app, destination, record, existing, cache)
    return { updated: !!existing }
  }

  if (spec.name === 'Pilha') {
    const label = gsString(gsValue(row, 'Pilha'))
    const existing =
      gsFindBySource(app, destination, sourceKey, cache) ||
      gsCollectionRecords(app, destination, cache).find(
        (item) => gsNormalize(item.getString('codigo')) === gsNormalize(label),
      )
    const record = gsCreateRecord(app, destination, existing)
    const farmName = gsInferFarmForValue(sheets, 'Pilha', label)
    const farm = farmName ? gsLookupFarm(app, farmName, cache) : null
    if (!farm) return { error: 'Não foi possível determinar uma única Fazenda para esta Pilha.' }

    const picadorUsage = gsSheetRows(sheets, 'Historico_picador').some(
      (item) => gsNormalize(gsValue(item, 'Pilha')) === gsNormalize(label),
    )
    const toraUsage = ['Historico_Baldeio', 'Historico_Descarga'].some((sheetName) =>
      gsSheetRows(sheets, sheetName).some(
        (item) => gsNormalize(gsValue(item, 'Pilha')) === gsNormalize(label),
      ),
    )
    record.set('origem_id', sourceKey)
    record.set('codigo', label)
    record.set('nome', label)
    record.set('fazenda_id', farm.id)
    record.set('produto', picadorUsage && toraUsage ? 'misto' : picadorUsage ? 'cavaco' : 'tora')
    record.set('is_mista', picadorUsage && toraUsage)
    record.set('status', 'ativa')
    gsSaveRecord(app, destination, record, existing, cache)
    return { updated: !!existing }
  }

  if (spec.name === 'Trabalho') {
    const existing = gsFindBySource(app, destination, sourceKey, cache)
    const record = gsCreateRecord(app, destination, existing)
    const farmValue = gsString(gsValue(row, 'Fazenda'))
    const farm = farmValue ? gsLookupFarm(app, farmValue, cache) : null
    const machineValue = gsString(gsValue(row, 'P_Ordens'))
    const machine = machineValue
      ? gsLookupMachineFromSheets(app, sheets, machineValue, cache)
      : null
    const talhaoValue = gsString(gsValue(row, 'Talhao'))
    const talhao = talhaoValue ? gsResolveTalhaoForRow(app, sheets, row, cache) : null
    const userEmail = gsString(gsValue(row, 'email_trabalho')).toLowerCase()
    const user = gsCollectionRecords(app, 'users', cache).find(
      (item) => item.getString('email').toLowerCase() === userEmail,
    )
    record.set('origem_id', sourceKey)
    record.set('email_trabalho', userEmail)
    record.set('colaborador', user ? user.getString('name') : '')
    record.set('data_trabalho', gsDateTime(gsValue(row, 'Data')))
    record.set('fazenda_id', farm ? farm.id : '')
    record.set('fazenda_origem', farmValue)
    record.set('maquina_id', machine ? machine.id : '')
    record.set('maquina_origem', machineValue)
    record.set('talhao_id', talhao ? talhao.id : '')
    record.set('talhao_origem', talhaoValue)
    record.set('ordem_servico', machineValue)
    record.set('localizacao', gsString(gsValue(row, 'Localizacao')))
    record.set('status_atual', gsString(gsValue(row, 'Status_Atual')))
    record.set('dados_origem_json', JSON.stringify(row.values))
    gsSaveRecord(app, destination, record, existing, cache)
    return { updated: !!existing }
  }

  if (spec.name === 'Historico_Feller' || spec.name === 'Historico_Skidder') {
    const existing = gsFindBySource(app, destination, sourceKey, cache)
    const record = gsCreateRecord(app, destination, existing)
    const talhao = gsResolveTalhaoForRow(app, sheets, row, cache)
    const machineValue = gsString(gsValue(row, 'Equipamento'))
    const machine = gsLookupMachineFromSheets(app, sheets, machineValue, cache)
    if (!talhao) return { error: 'Talhão ou Fazenda sem correspondência única.' }
    if (!machine) return { error: 'Máquina sem correspondência única.' }
    record.set('origem_id', sourceKey)
    record.set('talhao_id', talhao.id)
    record.set('maquina_id', machine.id)
    record.set('data_operacao', gsDateTime(gsValue(row, 'Inicio')))
    record.set('horas_trabalhadas', gsDurationHours(gsValue(row, 'Tempo')))
    record.set('combustivel_litros', gsNumber(gsValue(row, 'Litros')) || 0)
    record.set('observacoes', gsObservation(row))
    gsSaveRecord(app, destination, record, existing, cache)
    return { updated: !!existing }
  }

  if (spec.name === 'Historico_Baldeio') {
    const volume = gsNumber(gsValue(row, 'SR_Toras'))
    if (!volume || volume <= 0)
      return { skipped: true, message: 'Linha sem movimentação de toras.' }
    const existing = gsFindBySource(app, destination, sourceKey, cache)
    const record = gsCreateRecord(app, destination, existing)
    const truck = gsLookupTruckFromSheets(app, sheets, gsValue(row, 'Placa_Baldeio'), true, cache)
    const talhao = gsResolveTalhaoForRow(app, sheets, row, cache)
    if (!truck) return { error: 'Caminhão de baldeio sem correspondência única.' }
    if (!talhao) return { error: 'Talhão ou Fazenda sem correspondência única.' }
    const pileValue = gsString(gsValue(row, 'Pilha'))
    const pile = pileValue ? gsResolvePileForRow(app, sheets, row, cache) : null
    const conversion = app.findRecordsByFilter(
      'conversao_sr_toras',
      'is_vigente = true',
      '-created',
      1,
      0,
    )
    const factor = conversion.length ? conversion[0].getFloat('fator_m3_sr') : 0.84
    record.set('origem_id', sourceKey)
    record.set('caminhao_baldeio_id', truck.id)
    record.set('talhao_origem_id', talhao.id)
    record.set('pilha_destino_id', pile ? pile.id : '')
    record.set('conversao_sr_id', conversion.length ? conversion[0].id : '')
    record.set('data_hora_saida', gsDateTime(gsValue(row, 'Inicio')))
    record.set('data_hora_chegada', gsDateTime(gsValue(row, 'Fim')))
    record.set('volume_sr', volume)
    record.set('volume_m3_estimado', Number((volume * factor).toFixed(2)))
    record.set('motorista', gsString(gsValue(row, 'Operador')))
    record.set('numero_viagem', gsString(gsValue(row, 'Ordem')))
    record.set('status_baldeio', gsString(gsValue(row, 'Fim')) ? 'concluido' : 'em_transito')
    gsSaveRecord(app, destination, record, existing, cache)
    return { updated: !!existing }
  }

  if (spec.name === 'Historico_Descarga') {
    const volume = gsNumber(gsValue(row, 'SR_Toras'))
    if (!volume || volume <= 0) return { skipped: true, message: 'Linha sem volume de descarga.' }
    const existing = gsFindBySource(app, destination, sourceKey, cache)
    const record = gsCreateRecord(app, destination, existing)
    const truck = gsLookupTruckFromSheets(app, sheets, gsValue(row, 'Placa_Baldeio'), true, cache)
    const pile = gsResolvePileForRow(app, sheets, row, cache)
    if (!truck) return { error: 'Caminhão de baldeio sem correspondência única.' }
    if (!pile) return { error: 'Pilha ou Fazenda sem correspondência única.' }
    const conversion = app.findRecordsByFilter(
      'conversao_sr_toras',
      'is_vigente = true',
      '-created',
      1,
      0,
    )
    const factor = conversion.length ? conversion[0].getFloat('fator_m3_sr') : 0.84
    record.set('origem_id', sourceKey)
    record.set('caminhao_baldeio_id', truck.id)
    record.set('pilha_destino_id', pile.id)
    record.set('conversao_sr_id', conversion.length ? conversion[0].id : '')
    record.set('data_hora_descarga', gsDateTime(gsValue(row, 'Fim') || gsValue(row, 'Inicio')))
    record.set('volume_sr', volume)
    record.set('volume_m3_calculado', Number((volume * factor).toFixed(2)))
    record.set('status_aceite', gsStatusApproved(gsValue(row, 'Status_his')))
    record.set('motivo_rejeicao', gsString(gsValue(row, 'Motivo')))
    record.set('conferente_nome', gsString(gsValue(row, 'Operador')))
    gsSaveRecord(app, destination, record, existing, cache)
    return { updated: !!existing }
  }

  if (spec.name === 'Historico_picador') {
    const invoice = gsString(gsValue(row, 'Nota'))
    const volume = gsNumber(gsValue(row, 'SR_Cavaco'))
    if (!invoice) return { skipped: true, message: 'Evento sem Nota não é uma expedição.' }
    if (!volume || volume <= 0) return { error: 'SR_Cavaco deve ser maior que zero.' }
    const records = gsCollectionRecords(app, destination, cache)
    const existing =
      records.find((record) => record.getString('origem_id') === sourceKey) ||
      records.find((record) => record.getString('nota_fiscal') === invoice)
    const record = gsCreateRecord(app, destination, existing)
    const truck = gsLookupTruckFromSheets(app, sheets, gsValue(row, 'Caminhao'), false, cache)
    const pile = gsResolvePileForRow(app, sheets, row, cache)
    if (!truck) return { error: 'Caminhão rodoviário sem correspondência única.' }
    if (!pile) return { error: 'Pilha ou Fazenda sem correspondência única.' }
    record.set('origem_id', sourceKey)
    record.set('caminhao_id', truck.id)
    record.set('pilha_origem_id', pile.id)
    record.set('nota_fiscal', invoice)
    record.set('data_hora_expedicao', gsDateTime(gsValue(row, 'Inicio')))
    record.set('volume_cavaco_m3', volume)
    record.set('volume_tora_consumido_m3', Number((volume * 0.4).toFixed(2)))
    record.set('cliente', gsString(gsValue(row, 'Fazenda')))
    record.set('operador_nome', '')
    gsSaveRecord(app, destination, record, existing, cache)
    return { updated: !!existing }
  }

  return { error: 'Aba sem regra de importação.' }
}

function gsImportSheets(app, workbook) {
  const { sheets } = workbook
  const preview = gsCreatePreview({ app }, sheets)
  if (!preview.sucesso) {
    return {
      sucesso: false,
      status: 'erro',
      mensagem: 'A prévia encontrou erros; corrija os dados antes de iniciar a importação.',
      total: {
        criados: 0,
        atualizados: 0,
        ignorados: preview.ignorados,
        rejeitados: preview.erros,
        inativados: 0,
      },
      abas: preview.abas.map((sheet) => ({
        name: sheet.name,
        target: sheet.target,
        criados: 0,
        atualizados: 0,
        ignorados: sheet.skipped,
        rejeitados: sheet.errors,
        inativados: 0,
        issues: sheet.issues,
      })),
      timestamp: new Date().toISOString(),
      observacao: 'Nenhum registro foi gravado.',
    }
  }
  const cache = {}
  const results = {}
  const total = { criados: 0, atualizados: 0, ignorados: 0, rejeitados: 0, inativados: 0 }

  const orderedSpecs = GOOGLE_SHEETS_IMPORT_ORDER.map((name) =>
    GOOGLE_SHEETS_IMPORT_SHEETS.find((sheet) => sheet.name === name),
  )
  for (const spec of orderedSpecs) {
    const sheet = sheets[spec.name]
    const result = {
      name: spec.name,
      target: spec.target,
      criados: 0,
      atualizados: 0,
      ignorados: 0,
      rejeitados: 0,
      inativados: 0,
      issues: [],
    }
    const headerIssues = gsHeaderIssues(sheet, spec)
    if (headerIssues.length) {
      result.rejeitados++
      result.issues.push({ row: 1, message: headerIssues.join(' ') })
      results[spec.name] = result
      total.rejeitados++
      continue
    }

    const seen = {}
    const importedKeys = {}
    for (const row of sheet.rows) {
      if (gsRowIsEmpty(row)) continue
      const key = gsString(gsValue(row, spec.key))
      const normalizedKey = gsNormalize(key)
      if (!key || seen[normalizedKey]) {
        result.rejeitados++
        if (result.issues.length < 12) {
          result.issues.push({
            row: row.line,
            message: !key
              ? `Identificador de origem ausente (${spec.key}).`
              : `Identificador duplicado na aba (${spec.key}).`,
          })
        }
        continue
      }
      seen[normalizedKey] = true

      let missingRequired = ''
      for (const field of spec.required) {
        if (!gsString(gsValue(row, field))) {
          missingRequired = `Campo obrigatório vazio: ${field}.`
          break
        }
      }
      if (missingRequired) {
        result.rejeitados++
        if (result.issues.length < 12)
          result.issues.push({ row: row.line, message: missingRequired })
        continue
      }

      try {
        if (spec.name === 'Historico_picador' && !gsString(gsValue(row, 'Nota'))) {
          result.ignorados++
          continue
        }
        const outcome = gsImportRow(app, sheets, spec, row, cache)
        if (outcome.error) {
          result.rejeitados++
          if (result.issues.length < 12) {
            result.issues.push({ row: row.line, message: outcome.error })
          }
        } else if (outcome.skipped) {
          result.ignorados++
        } else if (outcome.updated) {
          result.atualizados++
          importedKeys[normalizedKey] = true
        } else {
          result.criados++
          importedKeys[normalizedKey] = true
        }
      } catch (err) {
        result.rejeitados++
        console.log(`Erro ao importar linha ${row.line} da aba ${spec.name}:`, err)
        if (result.issues.length < 12) {
          result.issues.push({ row: row.line, message: 'Não foi possível salvar o registro.' })
        }
      }
    }

    if (spec.catalog && sheet.rows.length > 0 && result.rejeitados === 0) {
      const keyFieldBySheet = {
        Fazendas: 'codigo',
        Maquinas: 'id_maquina',
        Talhao: 'origem_id',
        Motivo: 'id_motivo',
        Caminhao_Baldeio: 'origem_id',
        Caminhao: 'origem_id',
        Pilha: 'origem_id',
      }
      const statusField = 'status'
      const inactiveStatus = ['Fazendas', 'Maquinas', 'Talhao', 'Pilha'].includes(spec.name)
        ? 'inativa'
        : 'inativo'
      const records = gsCollectionRecords(app, spec.destination, cache)
      for (const record of records) {
        const identity = gsNormalize(record.getString(keyFieldBySheet[spec.name]))
        if (!identity || importedKeys[identity]) continue
        if (spec.name === 'Talhao') {
          record.set(statusField, 'inativa')
        } else {
          record.set(statusField, inactiveStatus)
        }
        app.save(record)
        result.inativados++
      }
    }

    results[spec.name] = result
    total.criados += result.criados
    total.atualizados += result.atualizados
    total.ignorados += result.ignorados
    total.rejeitados += result.rejeitados
    total.inativados += result.inativados
  }

  return {
    sucesso: total.rejeitados === 0,
    status:
      total.rejeitados === 0 ? 'sucesso' : total.criados + total.atualizados ? 'parcial' : 'erro',
    mensagem: `Criados: ${total.criados}; atualizados: ${total.atualizados}; ignorados: ${total.ignorados}; rejeitados: ${total.rejeitados}; inativados: ${total.inativados}.`,
    total,
    abas: GOOGLE_SHEETS_IMPORT_SHEETS.map((spec) => results[spec.name]),
    timestamp: new Date().toISOString(),
    observacao:
      'A origem foi lida sem alterações no Google Sheets. Usuários, Trabalho e históricos não são excluídos; registros de referência ausentes são inativados.',
  }
}

routerAdd('POST', '/backend/v1/sheets/importacao/preview', (e) => {
  const authRecord = e.auth
  if (!authRecord || authRecord.getString('papel') !== 'admin') {
    return e.json(403, {
      sucesso: false,
      erro: 'Apenas Administradores podem validar a importação.',
    })
  }

  let config
  try {
    const records = e.app.findRecordsByFilter('google_sheets_config', '', '-created', 1, 0)
    if (!records.length)
      return e.json(400, { sucesso: false, erro: 'Configure a planilha primeiro.' })
    config = records[0]
    const body = e.requestInfo().body || {}
    if (body.spreadsheet_id && body.spreadsheet_id !== config.getString('spreadsheet_id')) {
      return e.json(400, {
        sucesso: false,
        erro: 'Salve o ID da planilha antes de solicitar a prévia.',
      })
    }
    if (!config.getBool('is_ativa')) {
      return e.json(400, { sucesso: false, erro: 'A integração está desativada.' })
    }

    const workbook = gsBuildWorkbook(e, config)
    const preview = gsCreatePreview(e, workbook.sheets)
    preview.planilha_id = config.getString('spreadsheet_id')
    return e.json(200, preview)
  } catch (err) {
    console.log('Erro ao validar prévia de importação Google Sheets:', err)
    return e.json(502, {
      sucesso: false,
      erro: err instanceof Error ? err.message : 'Não foi possível validar a planilha.',
    })
  }
})

routerAdd('POST', '/backend/v1/sheets/importacao/importar', (e) => {
  const authRecord = e.auth
  if (!authRecord || authRecord.getString('papel') !== 'admin') {
    return e.json(403, { sucesso: false, erro: 'Apenas Administradores podem importar dados.' })
  }

  try {
    const records = e.app.findRecordsByFilter('google_sheets_config', '', '-created', 1, 0)
    if (!records.length)
      return e.json(400, { sucesso: false, erro: 'Configure a planilha primeiro.' })
    const config = records[0]
    const body = e.requestInfo().body || {}
    if (body.spreadsheet_id && body.spreadsheet_id !== config.getString('spreadsheet_id')) {
      return e.json(400, {
        sucesso: false,
        erro: 'A planilha foi alterada desde a prévia. Gere uma nova prévia antes de importar.',
      })
    }
    if (!config.getBool('is_ativa')) {
      return e.json(400, { sucesso: false, erro: 'A integração está desativada.' })
    }

    const workbook = gsBuildWorkbook(e, config)
    const result = gsImportSheets(e.app, workbook)
    config.set('ultima_sincronizacao', result.timestamp)
    config.set(
      'linhas_ingeridas_total',
      config.getFloat('linhas_ingeridas_total') + result.total.criados,
    )
    config.set('ultimo_status', result.status)
    config.set('ultimo_erro', result.total.rejeitados ? result.mensagem : '')
    e.app.save(config)

    return e.json(result.sucesso ? 200 : 207, result)
  } catch (err) {
    console.log('Erro durante importação Google Sheets:', err)
    return e.json(502, {
      sucesso: false,
      erro: err instanceof Error ? err.message : 'Não foi possível importar os dados da planilha.',
    })
  }
})
