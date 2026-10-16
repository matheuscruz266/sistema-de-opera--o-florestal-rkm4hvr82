/// <reference path="../pb_data/types.d.ts" />

// Hook para histórico de descarga - atualiza estoque da pilha destino
onRecordAfterCreateSuccess((e) => {
  try {
    const pilhaId = e.record.getString('pilha_destino_id')
    if (pilhaId) {
      const pilha = e.app.findRecordById('pilhas', pilhaId)
      const descargas = e.app.findRecordsByFilter(
        'historico_descarga',
        `pilha_destino_id = '${pilhaId}' && status_aceite = 'aceito'`,
        '',
        1000,
        0,
      )
      let totalEntradas = 0
      for (let i = 0; i < descargas.length; i++) {
        totalEntradas += descargas[i].getFloat('volume_m3_calculado') || 0
      }
      const picadores = e.app.findRecordsByFilter(
        'historico_picador',
        `pilha_origem_id = '${pilhaId}'`,
        '',
        1000,
        0,
      )
      let totalSaidas = 0
      for (let i = 0; i < picadores.length; i++) {
        totalSaidas += picadores[i].getFloat('volume_tora_consumido_m3') || 0
      }
      let totalAjustes = 0
      try {
        const ajustes = e.app.findRecordsByFilter(
          'conciliacao_ajustes',
          `pilha_id = '${pilhaId}' && status_ajuste = 'aprovado'`,
          '',
          1000,
          0,
        )
        for (let i = 0; i < ajustes.length; i++) {
          totalAjustes += ajustes[i].getFloat('volume_ajustado_m3') || 0
        }
      } catch (_) {}
      const volumeCalculado = Math.max(
        0,
        Number((totalEntradas - totalSaidas + totalAjustes).toFixed(2)),
      )
      pilha.set('volume_atual_m3', volumeCalculado)
      e.app.save(pilha)
    }
  } catch (err) {
    console.log('Erro ao atualizar estoque em descarga:', err)
  } finally {
    e.next()
  }
}, 'historico_descarga')

onRecordAfterUpdateSuccess((e) => {
  try {
    const pilhaId = e.record.getString('pilha_destino_id')
    if (pilhaId) {
      const pilha = e.app.findRecordById('pilhas', pilhaId)
      const descargas = e.app.findRecordsByFilter(
        'historico_descarga',
        `pilha_destino_id = '${pilhaId}' && status_aceite = 'aceito'`,
        '',
        1000,
        0,
      )
      let totalEntradas = 0
      for (let i = 0; i < descargas.length; i++) {
        totalEntradas += descargas[i].getFloat('volume_m3_calculado') || 0
      }
      const picadores = e.app.findRecordsByFilter(
        'historico_picador',
        `pilha_origem_id = '${pilhaId}'`,
        '',
        1000,
        0,
      )
      let totalSaidas = 0
      for (let i = 0; i < picadores.length; i++) {
        totalSaidas += picadores[i].getFloat('volume_tora_consumido_m3') || 0
      }
      let totalAjustes = 0
      try {
        const ajustes = e.app.findRecordsByFilter(
          'conciliacao_ajustes',
          `pilha_id = '${pilhaId}' && status_ajuste = 'aprovado'`,
          '',
          1000,
          0,
        )
        for (let i = 0; i < ajustes.length; i++) {
          totalAjustes += ajustes[i].getFloat('volume_ajustado_m3') || 0
        }
      } catch (_) {}
      const volumeCalculado = Math.max(
        0,
        Number((totalEntradas - totalSaidas + totalAjustes).toFixed(2)),
      )
      pilha.set('volume_atual_m3', volumeCalculado)
      e.app.save(pilha)
    }
  } catch (err) {
    console.log('Erro ao atualizar estoque em update descarga:', err)
  } finally {
    e.next()
  }
}, 'historico_descarga')

// Hook para histórico de picador - atualiza consumo da pilha origem
onRecordAfterCreateSuccess((e) => {
  try {
    const pilhaId = e.record.getString('pilha_origem_id')
    if (pilhaId) {
      const pilha = e.app.findRecordById('pilhas', pilhaId)
      const descargas = e.app.findRecordsByFilter(
        'historico_descarga',
        `pilha_destino_id = '${pilhaId}' && status_aceite = 'aceito'`,
        '',
        1000,
        0,
      )
      let totalEntradas = 0
      for (let i = 0; i < descargas.length; i++) {
        totalEntradas += descargas[i].getFloat('volume_m3_calculado') || 0
      }
      const picadores = e.app.findRecordsByFilter(
        'historico_picador',
        `pilha_origem_id = '${pilhaId}'`,
        '',
        1000,
        0,
      )
      let totalSaidas = 0
      for (let i = 0; i < picadores.length; i++) {
        totalSaidas += picadores[i].getFloat('volume_tora_consumido_m3') || 0
      }
      let totalAjustes = 0
      try {
        const ajustes = e.app.findRecordsByFilter(
          'conciliacao_ajustes',
          `pilha_id = '${pilhaId}' && status_ajuste = 'aprovado'`,
          '',
          1000,
          0,
        )
        for (let i = 0; i < ajustes.length; i++) {
          totalAjustes += ajustes[i].getFloat('volume_ajustado_m3') || 0
        }
      } catch (_) {}
      const volumeCalculado = Math.max(
        0,
        Number((totalEntradas - totalSaidas + totalAjustes).toFixed(2)),
      )
      pilha.set('volume_atual_m3', volumeCalculado)
      e.app.save(pilha)
    }
  } catch (err) {
    console.log('Erro ao atualizar consumo em picador:', err)
  } finally {
    e.next()
  }
}, 'historico_picador')

onRecordAfterUpdateSuccess((e) => {
  try {
    const pilhaId = e.record.getString('pilha_origem_id')
    if (pilhaId) {
      const pilha = e.app.findRecordById('pilhas', pilhaId)
      const descargas = e.app.findRecordsByFilter(
        'historico_descarga',
        `pilha_destino_id = '${pilhaId}' && status_aceite = 'aceito'`,
        '',
        1000,
        0,
      )
      let totalEntradas = 0
      for (let i = 0; i < descargas.length; i++) {
        totalEntradas += descargas[i].getFloat('volume_m3_calculado') || 0
      }
      const picadores = e.app.findRecordsByFilter(
        'historico_picador',
        `pilha_origem_id = '${pilhaId}'`,
        '',
        1000,
        0,
      )
      let totalSaidas = 0
      for (let i = 0; i < picadores.length; i++) {
        totalSaidas += picadores[i].getFloat('volume_tora_consumido_m3') || 0
      }
      let totalAjustes = 0
      try {
        const ajustes = e.app.findRecordsByFilter(
          'conciliacao_ajustes',
          `pilha_id = '${pilhaId}' && status_ajuste = 'aprovado'`,
          '',
          1000,
          0,
        )
        for (let i = 0; i < ajustes.length; i++) {
          totalAjustes += ajustes[i].getFloat('volume_ajustado_m3') || 0
        }
      } catch (_) {}
      const volumeCalculado = Math.max(
        0,
        Number((totalEntradas - totalSaidas + totalAjustes).toFixed(2)),
      )
      pilha.set('volume_atual_m3', volumeCalculado)
      e.app.save(pilha)
    }
  } catch (err) {
    console.log('Erro ao atualizar consumo em update picador:', err)
  } finally {
    e.next()
  }
}, 'historico_picador')

// Hook para inventário oficial ToraCerta - verifica divergência e gera alerta
onRecordAfterCreateSuccess((e) => {
  try {
    const pilhaId = e.record.getString('pilha_id')
    const statusReg = e.record.getString('status_registro')
    if (pilhaId && statusReg === 'oficial') {
      const pilha = e.app.findRecordById('pilhas', pilhaId)
      const volumeCalculado = pilha.getFloat('volume_atual_m3') || 0
      const invFisico = e.record.getFloat('volume_oficial_m3') || 0

      const diff = Math.abs(volumeCalculado - invFisico)
      const baseRef = Math.max(volumeCalculado, invFisico)
      const diffPerc = baseRef > 0 ? (diff / baseRef) * 100 : 0

      let limiar = 5.0
      try {
        const param = e.app.findRecordsByFilter(
          'parametros_operacionais',
          "chave = 'limiar_divergencia' && is_vigente = true",
          '',
          1,
          0,
        )
        if (param.length > 0) {
          limiar = param[0].getFloat('fator_valor') || 5.0
        }
      } catch (_) {}

      if (diffPerc > limiar) {
        const alertasCol = e.app.findCollectionByNameOrId('conciliacao_alertas')
        const novoAlerta = new Record(alertasCol)
        novoAlerta.set('pilha_id', pilhaId)
        novoAlerta.set('data_identificacao', new Date().toISOString().split('T')[0])
        novoAlerta.set('saldo_calculado_m3', volumeCalculado)
        novoAlerta.set('inventario_fisico_m3', invFisico)
        novoAlerta.set('diferenca_m3', Number((volumeCalculado - invFisico).toFixed(2)))
        novoAlerta.set('diferenca_perc', Number(diffPerc.toFixed(2)))
        novoAlerta.set('limiar_aplicado_perc', limiar)
        novoAlerta.set('status', 'pendente')
        novoAlerta.set(
          'motivo_divergencia',
          'Divergência detectada entre saldo calculado e inventário ToraCerta',
        )
        novoAlerta.set('responsavel_investigacao', 'Aguardando atribuição')
        e.app.save(novoAlerta)

        const histCol = e.app.findCollectionByNameOrId('conciliacao_divergencias_hist')
        const hist = new Record(histCol)
        hist.set('alerta_id', novoAlerta.id)
        hist.set('etapa_evento', 'alerta_criado')
        hist.set(
          'descricao',
          `Alerta gerado automaticamente. Divergência calculada de ${diffPerc.toFixed(1)}% (limiar: ${limiar}%).`,
        )
        hist.set('usuario_nome', 'Sistema Operacional')
        hist.set('data_hora', new Date().toISOString())
        e.app.save(hist)
      }
    }
  } catch (err) {
    console.log('Erro ao checar divergência em inventario:', err)
  } finally {
    e.next()
  }
}, 'inventario_pilha')

// Bloqueio de duplicidade de Nota Fiscal no Picador
onRecordCreateRequest((e) => {
  const nota = (e.record.getString('nota_fiscal') || '').trim()
  if (!nota) {
    throw new BadRequestError('O número da Nota Fiscal é obrigatório.')
  }
  const existentes = e.app.findRecordsByFilter(
    'historico_picador',
    `nota_fiscal = '${nota}'`,
    '',
    1,
    0,
  )
  if (existentes.length > 0) {
    throw new BadRequestError(`A Nota Fiscal "${nota}" já foi registrada em outra expedição.`)
  }
  return e.next()
}, 'historico_picador')

// Bloqueio de exclusão de Medição Oficial ToraCerta (auditoria)
onRecordDeleteRequest((e) => {
  const statusReg = e.record.getString('status_registro')
  if (statusReg === 'oficial') {
    throw new BadRequestError(
      'Registros oficiais de inventário ToraCerta não podem ser excluídos por regra de auditoria. Crie uma nova medição de correção com justificativa.',
    )
  }
  return e.next()
}, 'inventario_pilha')

// ==============================================================================
// ENDPOINT DE INGESTÃO DE DADOS - PICADOR BRF TOLEDO (D2) E APP DE CAMPO
// Autenticação: Header Authorization: Bearer <API_KEY> ou X-API-Key: <API_KEY>
// ATENÇÃO: Todas as funções auxiliares são declaradas inline nos callbacks
// ==============================================================================

// Rota de Ingestão de Produção D2 (Picador BRF Toledo)
routerAdd('POST', '/backend/v1/ingestao/d2', (e) => {
  const gravarLog = (
    credencial,
    origemNome,
    endpoint,
    ipOrigem,
    totalRecebidos,
    totalAceitos,
    totalRejeitados,
    status,
    msgErro,
    detalhes,
  ) => {
    try {
      const logsCol = e.app.findCollectionByNameOrId('integracao_logs')
      const logRec = new Record(logsCol)
      if (credencial && credencial.id) {
        logRec.set('credencial_id', credencial.id)
      }
      logRec.set(
        'origem_nome',
        origemNome || (credencial ? credencial.getString('nome') : 'Desconhecido'),
      )
      logRec.set('endpoint', endpoint || '/backend/v1/ingestao/d2')
      logRec.set('ip_origem', ipOrigem || '')
      logRec.set('timestamp_evento', new Date().toISOString())
      logRec.set('registros_recebidos', totalRecebidos || 0)
      logRec.set('registros_aceitos', totalAceitos || 0)
      logRec.set('registros_rejeitados', totalRejeitados || 0)
      logRec.set('status', status || 'erro')
      logRec.set('mensagem_erro', msgErro || '')
      logRec.set(
        'detalhes_json',
        typeof detalhes === 'string' ? detalhes : JSON.stringify(detalhes || {}),
      )
      e.app.save(logRec)

      if (credencial && credencial.id) {
        credencial.set('ultimo_uso', new Date().toISOString())
        e.app.save(credencial)
      }
    } catch (err) {
      console.log('Falha ao gravar log de ingestao:', err)
    }
  }

  const validarAuth = () => {
    const headerAuth = e.request.header.get('Authorization') || ''
    const headerApiKey = e.request.header.get('X-API-Key') || ''
    let key = ''

    if (headerApiKey && headerApiKey.trim()) {
      key = headerApiKey.trim()
    } else if (headerAuth.startsWith('Bearer ')) {
      key = headerAuth.substring(7).trim()
    } else if (headerAuth.trim()) {
      key = headerAuth.trim()
    }

    if (!key) {
      return {
        autenticado: false,
        erro: 'Chave de API não informada no header (esperado X-API-Key ou Authorization: Bearer <chave>)',
      }
    }

    try {
      const creds = e.app.findRecordsByFilter(
        'integracao_credenciais',
        `api_key = '${key}'`,
        '',
        1,
        0,
      )
      if (creds.length === 0) {
        return { autenticado: false, erro: 'Chave de API inválida' }
      }
      const c = creds[0]
      if (!c.getBool('is_ativa')) {
        return { autenticado: false, credencial: c, erro: 'Chave de API inativa ou suspensa' }
      }
      return { autenticado: true, credencial: c }
    } catch (err) {
      return { autenticado: false, erro: 'Erro interno ao validar credencial: ' + err }
    }
  }

  const clientIp = e.remoteIP()
  const auth = validarAuth()

  if (!auth.autenticado) {
    gravarLog(
      auth.credencial || null,
      auth.credencial ? auth.credencial.getString('nome') : 'Origem Não Autenticada',
      '/backend/v1/ingestao/d2',
      clientIp,
      0,
      0,
      0,
      'rejeitado',
      auth.erro,
      { ip: clientIp, rota: '/backend/v1/ingestao/d2' },
    )
    return e.json(401, {
      sucesso: false,
      erro: auth.erro,
      instrucoes:
        'Informe sua chave no header Authorization: Bearer <API_KEY> ou X-API-Key: <API_KEY>',
    })
  }

  const cred = auth.credencial
  let rawBody
  try {
    rawBody = e.requestInfo().body || {}
  } catch (_) {
    rawBody = {}
  }

  // O payload pode vir como { dados: [...] } ou diretamente como um array [ ... ] ou um objeto único
  let itens = []
  if (Array.isArray(rawBody)) {
    itens = rawBody
  } else if (
    Array.isArray(rawBody.itens) ||
    Array.isArray(rawBody.dados) ||
    Array.isArray(rawBody.producao)
  ) {
    itens = rawBody.itens || rawBody.dados || rawBody.producao
  } else if (rawBody && typeof rawBody === 'object' && Object.keys(rawBody).length > 0) {
    itens = [rawBody]
  }

  if (itens.length === 0) {
    gravarLog(
      cred,
      cred.getString('nome'),
      '/backend/v1/ingestao/d2',
      clientIp,
      0,
      0,
      0,
      'erro',
      'Payload vazio ou formato incompatível. Esperado JSON com objeto ou lista de registros.',
      rawBody,
    )
    return e.json(400, {
      sucesso: false,
      erro: 'Nenhum registro de produção encontrado no payload.',
    })
  }

  const picadorCol = e.app.findCollectionByNameOrId('historico_picador')
  const pilhasCol = e.app.findCollectionByNameOrId('pilhas')
  const caminhoesCol = e.app.findCollectionByNameOrId('caminhoes')
  const convCavacoCol = e.app.findCollectionByNameOrId('conversao_sr_cavaco')

  // Obtem conversao de cavaco vigente padrão se necessária
  let defaultConvCavacoId = ''
  try {
    const vigentes = e.app.findRecordsByFilter(
      'conversao_sr_cavaco',
      'is_vigente = true',
      '-created',
      1,
      0,
    )
    if (vigentes.length > 0) {
      defaultConvCavacoId = vigentes[0].id
    }
  } catch (_) {}

  // Obtem pilha ativa padrão de toras/mista se o payload não especificar
  let defaultPilhaId = ''
  try {
    const pilhas = e.app.findRecordsByFilter('pilhas', "status = 'ativa'", '-created', 1, 0)
    if (pilhas.length > 0) {
      defaultPilhaId = pilhas[0].id
    }
  } catch (_) {}

  // Obtem caminhão padrão se não informado
  let defaultCaminhaoId = ''
  try {
    const cams = e.app.findRecordsByFilter('caminhoes', "status = 'ativo'", 'placa', 1, 0)
    if (cams.length > 0) {
      defaultCaminhaoId = cams[0].id
    }
  } catch (_) {}

  let aceitos = 0
  let rejeitados = 0
  const detalhesItens = []

  for (let i = 0; i < itens.length; i++) {
    const item = itens[i]
    const idx = i + 1

    // Validações básicas de campos essenciais
    // Nota Fiscal ou Identificador de Lote/Expedição (chave de unicidade e rastreabilidade)
    let notaFiscal = (
      item.nota_fiscal ||
      item.notaFiscal ||
      item.nf ||
      item.id_producao ||
      item.numero_ticket ||
      item.ticket ||
      ''
    )
      .toString()
      .trim()

    const dataHora = (
      item.data_hora_expedicao ||
      item.data_hora ||
      item.timestamp ||
      item.data ||
      new Date().toISOString()
    ).toString()

    const volumeCavaco = Number(
      item.volume_cavaco_m3 ?? item.volume_cavaco ?? item.volume_m3 ?? item.volume ?? 0,
    )

    const pesoCavaco =
      item.peso_cavaco_t != null
        ? Number(item.peso_cavaco_t)
        : item.peso_t != null
          ? Number(item.peso_t)
          : item.peso_kg != null
            ? Number(item.peso_kg) / 1000
            : null

    // Fator de consumo de tora: por padrão, ~1 m³ cavaco consome ~0.35-0.45 m³ de tora sólida, ou usa valor enviado
    let volumeTora =
      item.volume_tora_consumido_m3 != null
        ? Number(item.volume_tora_consumido_m3)
        : Number((volumeCavaco * 0.4).toFixed(2))

    if (!notaFiscal) {
      // Gera chave determinística baseada em data + volume + index para garantir rastreabilidade
      notaFiscal = 'D2-AUT-' + dataHora.replace(/[^0-9]/g, '').slice(0, 14) + '-' + idx
    }

    if (volumeCavaco <= 0) {
      rejeitados++
      detalhesItens.push({
        indice: idx,
        nota_fiscal: notaFiscal,
        status: 'rejeitado',
        motivo: 'Volume de cavaco deve ser maior que 0 m³',
      })
      continue
    }

    // Idempotência: Se a nota fiscal já foi registrada, trata como duplicada e aceita sem duplicar
    try {
      const duplicados = e.app.findRecordsByFilter(
        'historico_picador',
        `nota_fiscal = '${notaFiscal}'`,
        '',
        1,
        0,
      )
      if (duplicados.length > 0) {
        aceitos++
        detalhesItens.push({
          indice: idx,
          nota_fiscal: notaFiscal,
          status: 'ignorado_idempotente',
          id_existente: duplicados[0].id,
          mensagem: 'Registro já processado anteriormente (idempotência preservada)',
        })
        continue
      }
    } catch (_) {}

    // Resolução de Pilha
    let pilhaId = defaultPilhaId
    if (item.pilha_origem_id || item.pilha_id) {
      pilhaId = (item.pilha_origem_id || item.pilha_id).toString()
    } else if (item.pilha_codigo) {
      try {
        const pRec = e.app.findFirstRecordByData('pilhas', 'codigo', item.pilha_codigo)
        pilhaId = pRec.id
      } catch (_) {}
    }

    // Resolução de Caminhão
    let caminhaoId = defaultCaminhaoId
    if (item.caminhao_id) {
      caminhaoId = item.caminhao_id.toString()
    } else if (item.placa) {
      try {
        const cRec = e.app.findFirstRecordByData(
          'caminhoes',
          'placa',
          item.placa.trim().toUpperCase(),
        )
        caminhaoId = cRec.id
      } catch (_) {}
    }

    // Resolução de Conversão Cavaco
    let convCavacoId = defaultConvCavacoId
    if (item.conversao_cavaco_id) {
      convCavacoId = item.conversao_cavaco_id.toString()
    }

    try {
      const novoPicador = new Record(picadorCol)
      novoPicador.set('nota_fiscal', notaFiscal)
      novoPicador.set('data_hora_expedicao', dataHora)
      novoPicador.set('volume_cavaco_m3', volumeCavaco)
      if (pesoCavaco != null && !isNaN(pesoCavaco)) {
        novoPicador.set('peso_cavaco_t', Number(pesoCavaco.toFixed(2)))
      }
      novoPicador.set('volume_tora_consumido_m3', volumeTora)
      novoPicador.set('cliente', (item.cliente || 'BRF Toledo — D2 Ingestão').toString())
      if (item.umidade_perc != null) {
        novoPicador.set('umidade_perc', Number(item.umidade_perc))
      }
      novoPicador.set(
        'operador_nome',
        (item.operador_nome || item.operador || 'Integração D2 Automação').toString(),
      )
      if (pilhaId) novoPicador.set('pilha_origem_id', pilhaId)
      if (caminhaoId) novoPicador.set('caminhao_id', caminhaoId)
      if (convCavacoId) novoPicador.set('conversao_cavaco_id', convCavacoId)

      e.app.save(novoPicador)

      aceitos++
      detalhesItens.push({
        indice: idx,
        nota_fiscal: notaFiscal,
        status: 'aceito',
        id_registro: novoPicador.id,
        volume_cavaco_m3: volumeCavaco,
      })
    } catch (saveErr) {
      rejeitados++
      detalhesItens.push({
        indice: idx,
        nota_fiscal: notaFiscal,
        status: 'erro_salvar',
        motivo: '' + saveErr,
      })
    }
  }

  const statusGeral = rejeitados === 0 ? 'sucesso' : aceitos > 0 ? 'parcial' : 'erro'
  const msgResumo = `Processados: ${itens.length}. Aceitos: ${aceitos}, Rejeitados: ${rejeitados}.`

  gravarLog(
    cred,
    cred.getString('nome'),
    '/backend/v1/ingestao/d2',
    clientIp,
    itens.length,
    aceitos,
    rejeitados,
    statusGeral,
    rejeitados > 0 ? msgResumo : '',
    detalhesItens,
  )

  const httpCode = statusGeral === 'erro' ? 400 : statusGeral === 'parcial' ? 207 : 200

  return e.json(httpCode, {
    sucesso: aceitos > 0,
    status: statusGeral,
    mensagem: msgResumo,
    recebidos: itens.length,
    aceitos: aceitos,
    rejeitados: rejeitados,
    itens: detalhesItens,
    timestamp: new Date().toISOString(),
  })
})

// ==============================================================================
// ROTAS DE INTEGRAÇÃO GOOGLE SHEETS (D2 PICADOR BRF TOLEDO)
// Toda a lógica é estritamente declarada inline em cada callback
// ==============================================================================

// ==============================================================================
// IMPORTADOR MULTI-BASE & GOOGLE SHEETS
// ==============================================================================

// 1. Rota para testar conexão com o Google Sheets no backend (/backend/v1/sheets/testar)
routerAdd('POST', '/backend/v1/sheets/testar', (e) => {
  const authRecord = e.auth
  if (!authRecord || authRecord.getString('papel') !== 'admin') {
    return e.json(403, {
      sucesso: false,
      erro: 'Apenas Administradores podem testar a integração com Google Sheets.',
    })
  }

  let body = {}
  try {
    body = e.requestInfo().body || {}
  } catch (_) {}

  const spreadsheetId = (body.spreadsheet_id || '').trim()
  const sheetRange = (body.sheet_range || 'A1:Z50').trim()
  const signedJwt = (body.signed_jwt || '').trim()
  let directToken = (body.access_token || '').trim()

  if (!spreadsheetId) {
    return e.json(400, {
      sucesso: false,
      erro: 'ID da planilha Google (Spreadsheet ID) não informado.',
    })
  }

  // Troca JWT por Access Token do Google se fornecido signed_jwt
  if (!directToken && signedJwt) {
    try {
      const tokenUrl = 'https://oauth2.googleapis.com/token'
      const postBody =
        'grant_type=' +
        encodeURIComponent('urn:ietf:params:oauth:grant-type:jwt-bearer') +
        '&assertion=' +
        encodeURIComponent(signedJwt)

      const tokenRes = $http.send({
        method: 'POST',
        url: tokenUrl,
        body: postBody,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 30,
      })

      if (tokenRes.statusCode !== 200) {
        let errDesc = 'Erro ' + tokenRes.statusCode + ' ao obter token do Google'
        try {
          if (tokenRes.json && tokenRes.json.error_description)
            errDesc = tokenRes.json.error_description
          else if (tokenRes.json && tokenRes.json.error) errDesc = tokenRes.json.error
        } catch (_) {}
        return e.json(400, {
          sucesso: false,
          erro: 'Falha na autenticação OAuth2 com o Google: ' + errDesc,
          instrucao:
            'Verifique se a credencial de conta de serviço é válida e se o relógio está sincronizado.',
        })
      }
      directToken = tokenRes.json.access_token
    } catch (tErr) {
      return e.json(400, {
        sucesso: false,
        erro: 'Erro ao trocar JWT por Access Token: ' + (tErr.message || tErr),
      })
    }
  }

  if (!directToken) {
    return e.json(400, {
      sucesso: false,
      erro: 'Token de acesso ou asserção JWT não informada para autenticar com o Google.',
    })
  }

  // Faz a chamada na API do Google Sheets para validar a planilha e aba
  const rangeEncoded = encodeURIComponent(sheetRange || 'A1:Z20')
  const urlSheets = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${rangeEncoded}`

  const res = $http.send({
    method: 'GET',
    url: urlSheets,
    headers: {
      Authorization: `Bearer ${directToken}`,
      Accept: 'application/json',
    },
    timeout: 30,
  })

  if (res.statusCode === 403 || res.statusCode === 404) {
    let detalhe = 'Permissão negada ou planilha não encontrada.'
    try {
      if (res.json && res.json.error && res.json.error.message) {
        detalhe = res.json.error.message
      }
    } catch (_) {}

    return e.json(res.statusCode, {
      sucesso: false,
      erro: detalhe,
      instrucao:
        'Compartilhe a planilha no Google Sheets como Leitor ou Editor com o e-mail da Conta de Serviço (client_email).',
    })
  }

  if (res.statusCode !== 200) {
    let detalhe = 'Erro HTTP ' + res.statusCode
    try {
      if (res.json && res.json.error && res.json.error.message) {
        detalhe = res.json.error.message
      }
    } catch (_) {}
    return e.json(res.statusCode, {
      sucesso: false,
      erro: detalhe,
    })
  }

  const valores = res.json.values || []
  const linhasTotal = valores.length
  const colunasTotal = linhasTotal > 0 ? (valores[0] || []).length : 0

  return e.json(200, {
    sucesso: true,
    planilha_id: spreadsheetId,
    range: res.json.range || sheetRange,
    linhas_detectadas: linhasTotal,
    colunas_detectadas: colunasTotal,
    amostra_cabecalho: linhasTotal > 0 ? valores[0] : [],
    mensagem: `Conexão estabelecida com sucesso! Aba validada com ${linhasTotal} linha(s) e ${colunasTotal} coluna(s).`,
  })
})

// 1.1 Rota para listar metadados da planilha: títulos de todas as abas (/backend/v1/sheets/abas)
routerAdd('POST', '/backend/v1/sheets/abas', (e) => {
  const authRecord = e.auth
  if (!authRecord || authRecord.getString('papel') !== 'admin') {
    return e.json(403, {
      sucesso: false,
      erro: 'Apenas Administradores podem consultar as abas da planilha.',
    })
  }

  let body = {}
  try {
    body = e.requestInfo().body || {}
  } catch (_) {}
  const spreadsheetId = (body.spreadsheet_id || '').trim()
  const signedJwt = (body.signed_jwt || '').trim()
  let directToken = (body.access_token || '').trim()

  if (!spreadsheetId) {
    return e.json(400, { sucesso: false, erro: 'ID da planilha Google não informado.' })
  }

  if (!directToken && signedJwt) {
    try {
      const tokenUrl = 'https://oauth2.googleapis.com/token'
      const postBody =
        'grant_type=' +
        encodeURIComponent('urn:ietf:params:oauth:grant-type:jwt-bearer') +
        '&assertion=' +
        encodeURIComponent(signedJwt)
      const tokenRes = $http.send({
        method: 'POST',
        url: tokenUrl,
        body: postBody,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 30,
      })
      if (tokenRes.statusCode === 200 && tokenRes.json && tokenRes.json.access_token) {
        directToken = tokenRes.json.access_token
      } else {
        return e.json(400, { sucesso: false, erro: 'Falha ao autenticar com Google OAuth2.' })
      }
    } catch (err) {
      return e.json(400, { sucesso: false, erro: 'Erro ao obter token do Google: ' + err })
    }
  }

  if (!directToken) {
    return e.json(400, { sucesso: false, erro: 'Token de acesso ou JWT não informado.' })
  }

  // Consulta metadados da planilha
  const urlMeta = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties.title`
  const res = $http.send({
    method: 'GET',
    url: urlMeta,
    headers: { Authorization: `Bearer ${directToken}`, Accept: 'application/json' },
    timeout: 30,
  })

  if (res.statusCode !== 200) {
    let errDesc = 'Erro ' + res.statusCode
    try {
      if (res.json && res.json.error && res.json.error.message) errDesc = res.json.error.message
    } catch (_) {}
    return e.json(res.statusCode, { sucesso: false, erro: errDesc })
  }

  const sheetsList = (res.json && res.json.sheets) || []
  const abas = []
  for (let s = 0; s < sheetsList.length; s++) {
    const prop = sheetsList[s].properties
    if (prop && prop.title) {
      abas.push(prop.title)
    }
  }

  return e.json(200, {
    sucesso: true,
    spreadsheet_id: spreadsheetId,
    abas: abas,
  })
})

// 1.2 Rota para inspecionar cabeçalhos de uma aba específica (/backend/v1/sheets/cabecalhos)
routerAdd('POST', '/backend/v1/sheets/cabecalhos', (e) => {
  const authRecord = e.auth
  if (!authRecord || authRecord.getString('papel') !== 'admin') {
    return e.json(403, { sucesso: false, erro: 'Apenas Administradores podem ler cabeçalhos.' })
  }

  let body = {}
  try {
    body = e.requestInfo().body || {}
  } catch (_) {}
  const spreadsheetId = (body.spreadsheet_id || '').trim()
  const abaNome = (body.aba || '').trim()
  const signedJwt = (body.signed_jwt || '').trim()
  let directToken = (body.access_token || '').trim()

  if (!spreadsheetId || !abaNome) {
    return e.json(400, { sucesso: false, erro: 'ID da planilha e nome da aba são obrigatórios.' })
  }

  if (!directToken && signedJwt) {
    try {
      const tokenUrl = 'https://oauth2.googleapis.com/token'
      const postBody =
        'grant_type=' +
        encodeURIComponent('urn:ietf:params:oauth:grant-type:jwt-bearer') +
        '&assertion=' +
        encodeURIComponent(signedJwt)
      const tokenRes = $http.send({
        method: 'POST',
        url: tokenUrl,
        body: postBody,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 30,
      })
      if (tokenRes.statusCode === 200 && tokenRes.json && tokenRes.json.access_token) {
        directToken = tokenRes.json.access_token
      }
    } catch (_) {}
  }

  if (!directToken) {
    return e.json(400, { sucesso: false, erro: 'Token de acesso ou JWT não informado.' })
  }

  // Lê as primeiras 5 linhas para detecção de cabeçalho e amostra
  const rangeStr = abaNome.includes('!') ? abaNome : `${abaNome}!1:5`
  const urlSheets = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(rangeStr)}`
  const res = $http.send({
    method: 'GET',
    url: urlSheets,
    headers: { Authorization: `Bearer ${directToken}`, Accept: 'application/json' },
    timeout: 30,
  })

  if (res.statusCode !== 200) {
    let errDesc = 'Erro ao ler aba: ' + res.statusCode
    try {
      if (res.json && res.json.error && res.json.error.message) errDesc = res.json.error.message
    } catch (_) {}
    return e.json(res.statusCode, { sucesso: false, erro: errDesc })
  }

  const values = (res.json && res.json.values) || []
  const cabecalhos =
    values.length > 0
      ? (values[0] || []).map((h) => (h || '').toString().trim()).filter((h) => h.length > 0)
      : []
  const amostraLinha1 = values.length > 1 ? values[1] || [] : []

  // Sugere qual coluna é o ID único (AppSheet / primary key)
  let idSugerido = ''
  for (let c = 0; c < cabecalhos.length; c++) {
    const h = cabecalhos[c]
    const hLower = h.toLowerCase().replace(/[^a-z0-9_]/g, '')
    if (
      hLower === '_id_' ||
      hLower === 'id' ||
      hLower.startsWith('id_') ||
      hLower.endsWith('_id') ||
      hLower.includes('uniqueid') ||
      hLower.includes('key')
    ) {
      idSugerido = h
      break
    }
  }

  return e.json(200, {
    sucesso: true,
    aba: abaNome,
    cabecalhos: cabecalhos,
    id_sugerido: idSugerido,
    amostra_primeira_linha: amostraLinha1,
  })
})

// 2. Rota para sincronização via token ou JWT Google (/backend/v1/sheets/sincronizar)
routerAdd('POST', '/backend/v1/sheets/sincronizar', (e) => {
  const authRecord = e.auth
  if (!authRecord || authRecord.getString('papel') !== 'admin') {
    return e.json(403, {
      sucesso: false,
      erro: 'Apenas Administradores podem sincronizar a planilha Google.',
    })
  }

  let body = {}
  try {
    body = e.requestInfo().body || {}
  } catch (_) {}

  const spreadsheetId = (body.spreadsheet_id || '').trim()
  const sheetRange = (body.sheet_range || 'A1:Z500').trim()
  const signedJwt = (body.signed_jwt || '').trim()
  let directToken = (body.access_token || '').trim()

  if (!spreadsheetId) {
    return e.json(400, { sucesso: false, erro: 'ID da planilha Google não informado.' })
  }

  if (!directToken && signedJwt) {
    try {
      const tokenUrl = 'https://oauth2.googleapis.com/token'
      const postBody =
        'grant_type=' +
        encodeURIComponent('urn:ietf:params:oauth:grant-type:jwt-bearer') +
        '&assertion=' +
        encodeURIComponent(signedJwt)

      const tokenRes = $http.send({
        method: 'POST',
        url: tokenUrl,
        body: postBody,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 30,
      })

      if (tokenRes.statusCode !== 200) {
        let errDesc = 'Erro ' + tokenRes.statusCode + ' ao obter token do Google'
        try {
          if (tokenRes.json && tokenRes.json.error_description)
            errDesc = tokenRes.json.error_description
          else if (tokenRes.json && tokenRes.json.error) errDesc = tokenRes.json.error
        } catch (_) {}
        return e.json(400, {
          sucesso: false,
          erro: 'Falha ao autenticar com Google OAuth2: ' + errDesc,
        })
      }
      directToken = tokenRes.json.access_token
    } catch (tErr) {
      return e.json(400, {
        sucesso: false,
        erro: 'Erro ao autenticar com Google: ' + (tErr.message || tErr),
      })
    }
  }

  if (!directToken) {
    return e.json(400, { sucesso: false, erro: 'Token de acesso ou asserção JWT não informada.' })
  }

  // Busca dados na API do Sheets
  const rangeEncoded = encodeURIComponent(sheetRange || 'A1:Z1000')
  const urlSheets = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${rangeEncoded}`

  const res = $http.send({
    method: 'GET',
    url: urlSheets,
    headers: {
      Authorization: `Bearer ${directToken}`,
      Accept: 'application/json',
    },
    timeout: 45,
  })

  const clientIp = e.remoteIP()

  const gravarLog = (
    origemNome,
    totalRecebidos,
    totalAceitos,
    totalRejeitados,
    status,
    msgErro,
    detalhes,
  ) => {
    try {
      const logsCol = e.app.findCollectionByNameOrId('integracao_logs')
      const logRec = new Record(logsCol)
      logRec.set('origem_nome', origemNome || 'Google Sheets')
      logRec.set('endpoint', '/backend/v1/sheets/sincronizar')
      logRec.set('ip_origem', clientIp || '')
      logRec.set('timestamp_evento', new Date().toISOString())
      logRec.set('registros_recebidos', totalRecebidos || 0)
      logRec.set('registros_aceitos', totalAceitos || 0)
      logRec.set('registros_rejeitados', totalRejeitados || 0)
      logRec.set('status', status || 'erro')
      logRec.set('mensagem_erro', msgErro || '')
      logRec.set(
        'detalhes_json',
        typeof detalhes === 'string' ? detalhes : JSON.stringify(detalhes || {}),
      )
      e.app.save(logRec)
    } catch (err) {
      console.log('Falha ao gravar log sheets:', err)
    }
  }

  if (res.statusCode !== 200) {
    let msg = 'Erro ao ler dados da planilha no Google'
    try {
      if (res.json && res.json.error && res.json.error.message) msg = res.json.error.message
    } catch (_) {}

    gravarLog('Google Sheets', 0, 0, 0, 'erro', msg, { statusHttp: res.statusCode })

    return e.json(res.statusCode, {
      sucesso: false,
      erro: msg,
      instrucao:
        'Verifique se a planilha está compartilhada com o client_email da Conta de Serviço.',
    })
  }

  const valores = res.json.values || []
  if (valores.length === 0) {
    return e.json(200, {
      sucesso: true,
      status: 'sucesso',
      mensagem: 'Planilha vazia ou sem dados na aba informada.',
      linhas_lidas: 0,
      registros_processados: 0,
      aceitos: 0,
      rejeitados: 0,
      itens: [],
    })
  }

  // Converte 2D array em objetos
  const cabecalho = valores[0].map((h) =>
    (h || '')
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[\s\-\/\.]+/g, '_'),
  )
  const objetos = []

  for (let r = 1; r < valores.length; r++) {
    const row = valores[r]
    if (!row || row.length === 0) continue
    const obj = {}
    let temDado = false
    for (let c = 0; c < cabecalho.length; c++) {
      const colName = cabecalho[c]
      if (!colName) continue
      const val = row[c] !== undefined ? row[c] : ''
      if (val !== '' && val !== null) temDado = true

      if (colName.includes('nota') || colName.includes('ticket') || colName === 'nf') {
        obj.nota_fiscal = val
      } else if (
        colName.includes('volume') &&
        (colName.includes('cavaco') || !colName.includes('tora'))
      ) {
        obj.volume_cavaco_m3 = parseFloat(String(val).replace(',', '.'))
      } else if (colName.includes('peso')) {
        obj.peso_cavaco_t = parseFloat(String(val).replace(',', '.'))
      } else if (colName.includes('tora') && colName.includes('consum')) {
        obj.volume_tora_consumido_m3 = parseFloat(String(val).replace(',', '.'))
      } else if (colName.includes('data') || colName.includes('hora')) {
        obj.data_hora_expedicao = val
      } else if (colName.includes('cliente') || colName.includes('destinatario')) {
        obj.cliente = val
      } else if (colName.includes('umidade')) {
        obj.umidade_perc = parseFloat(String(val).replace(',', '.'))
      } else if (colName.includes('operador')) {
        obj.operador_nome = val
      } else if (colName.includes('pilha')) {
        obj.pilha_codigo = val
      } else if (colName.includes('placa')) {
        obj.placa = val
      } else {
        obj[colName] = val
      }
    }
    if (temDado && (obj.volume_cavaco_m3 || obj.nota_fiscal)) {
      objetos.push(obj)
    }
  }

  // Ingestão no historico_picador
  const picadorCol = e.app.findCollectionByNameOrId('historico_picador')
  let defaultConvCavacoId = ''
  try {
    const vigentes = e.app.findRecordsByFilter(
      'conversao_sr_cavaco',
      'is_vigente = true',
      '-created',
      1,
      0,
    )
    if (vigentes.length > 0) defaultConvCavacoId = vigentes[0].id
  } catch (_) {}

  let defaultPilhaId = ''
  try {
    const pilhas = e.app.findRecordsByFilter('pilhas', "status = 'ativa'", '-created', 1, 0)
    if (pilhas.length > 0) defaultPilhaId = pilhas[0].id
  } catch (_) {}

  let defaultCaminhaoId = ''
  try {
    const cams = e.app.findRecordsByFilter('caminhoes', "status = 'ativo'", 'placa', 1, 0)
    if (cams.length > 0) defaultCaminhaoId = cams[0].id
  } catch (_) {}

  let aceitos = 0
  let rejeitados = 0
  const detalhesItens = []

  for (let i = 0; i < objetos.length; i++) {
    const item = objetos[i]
    const idx = i + 1

    let notaFiscal = (
      item.nota_fiscal ||
      item.notaFiscal ||
      item.nf ||
      item.id_producao ||
      item.numero_ticket ||
      item.ticket ||
      ''
    )
      .toString()
      .trim()

    const dataHora = (
      item.data_hora_expedicao ||
      item.data_hora ||
      item.timestamp ||
      item.data ||
      new Date().toISOString()
    ).toString()

    const volumeCavaco = Number(
      item.volume_cavaco_m3 ?? item.volume_cavaco ?? item.volume_m3 ?? item.volume ?? 0,
    )

    const pesoCavaco =
      item.peso_cavaco_t != null
        ? Number(item.peso_cavaco_t)
        : item.peso_t != null
          ? Number(item.peso_t)
          : item.peso_kg != null
            ? Number(item.peso_kg) / 1000
            : null

    let volumeTora =
      item.volume_tora_consumido_m3 != null
        ? Number(item.volume_tora_consumido_m3)
        : Number((volumeCavaco * 0.4).toFixed(2))

    if (!notaFiscal) {
      notaFiscal = 'D2-GS-' + dataHora.replace(/[^0-9]/g, '').slice(0, 14) + '-' + idx
    }

    if (volumeCavaco <= 0) {
      rejeitados++
      detalhesItens.push({
        indice: idx,
        nota_fiscal: notaFiscal,
        status: 'rejeitado',
        motivo: 'Volume de cavaco deve ser maior que 0 m³',
      })
      continue
    }

    // Idempotência
    try {
      const duplicados = e.app.findRecordsByFilter(
        'historico_picador',
        `nota_fiscal = '${notaFiscal}'`,
        '',
        1,
        0,
      )
      if (duplicados.length > 0) {
        aceitos++
        detalhesItens.push({
          indice: idx,
          nota_fiscal: notaFiscal,
          status: 'ignorado_idempotente',
          id_existente: duplicados[0].id,
          mensagem: 'Registro já existente (idempotência preservada)',
        })
        continue
      }
    } catch (_) {}

    let pilhaId = defaultPilhaId
    if (item.pilha_origem_id || item.pilha_id) {
      pilhaId = (item.pilha_origem_id || item.pilha_id).toString()
    } else if (item.pilha_codigo) {
      try {
        const pRec = e.app.findFirstRecordByData('pilhas', 'codigo', item.pilha_codigo)
        pilhaId = pRec.id
      } catch (_) {}
    }

    let caminhaoId = defaultCaminhaoId
    if (item.caminhao_id) {
      caminhaoId = item.caminhao_id.toString()
    } else if (item.placa) {
      try {
        const cRec = e.app.findFirstRecordByData(
          'caminhoes',
          'placa',
          item.placa.trim().toUpperCase(),
        )
        caminhaoId = cRec.id
      } catch (_) {}
    }

    let convCavacoId = defaultConvCavacoId
    if (item.conversao_cavaco_id) {
      convCavacoId = item.conversao_cavaco_id.toString()
    }

    try {
      const novoPicador = new Record(picadorCol)
      novoPicador.set('nota_fiscal', notaFiscal)
      novoPicador.set('data_hora_expedicao', dataHora)
      novoPicador.set('volume_cavaco_m3', volumeCavaco)
      if (pesoCavaco != null && !isNaN(pesoCavaco)) {
        novoPicador.set('peso_cavaco_t', Number(pesoCavaco.toFixed(2)))
      }
      novoPicador.set('volume_tora_consumido_m3', volumeTora)
      novoPicador.set('cliente', (item.cliente || 'BRF Toledo — Google Sheets D2').toString())
      if (item.umidade_perc != null) {
        novoPicador.set('umidade_perc', Number(item.umidade_perc))
      }
      novoPicador.set(
        'operador_nome',
        (item.operador_nome || item.operador || 'Google Sheets D2 Ingestão').toString(),
      )
      if (pilhaId) novoPicador.set('pilha_origem_id', pilhaId)
      if (caminhaoId) novoPicador.set('caminhao_id', caminhaoId)
      if (convCavacoId) novoPicador.set('conversao_cavaco_id', convCavacoId)

      e.app.save(novoPicador)

      aceitos++
      detalhesItens.push({
        indice: idx,
        nota_fiscal: notaFiscal,
        status: 'aceito',
        id_registro: novoPicador.id,
        volume_cavaco_m3: volumeCavaco,
      })
    } catch (saveErr) {
      rejeitados++
      detalhesItens.push({
        indice: idx,
        nota_fiscal: notaFiscal,
        status: 'erro_salvar',
        motivo: '' + saveErr,
      })
    }
  }

  const statusGeral = rejeitados === 0 ? 'sucesso' : aceitos > 0 ? 'parcial' : 'erro'
  const msgResumo = `Sincronização concluída: ${valores.length} linhas lidas, ${aceitos} aceitas/processadas, ${rejeitados} rejeitadas.`

  gravarLog(
    'Google Sheets',
    objetos.length,
    aceitos,
    rejeitados,
    statusGeral,
    rejeitados > 0 ? msgResumo : '',
    detalhesItens,
  )

  // Atualiza métricas na config
  try {
    const configs = e.app.findRecordsByFilter('google_sheets_config', '', '-created', 1, 0)
    if (configs.length > 0) {
      const cfg = configs[0]
      const totalAntigo = cfg.getInt('linhas_ingeridas_total') || 0
      cfg.set('linhas_ingeridas_total', totalAntigo + aceitos)
      cfg.set('ultima_sincronizacao', new Date().toISOString())
      cfg.set('ultimo_status', statusGeral)
      cfg.set('ultimo_erro', '')
      e.app.save(cfg)
    }
  } catch (_) {}

  return e.json(200, {
    sucesso: true,
    status: statusGeral,
    mensagem: msgResumo,
    linhas_lidas: valores.length,
    registros_processados: objetos.length,
    aceitos: aceitos,
    rejeitados: rejeitados,
    itens: detalhesItens,
  })
})

// ==============================================================================
// 3. MOTOR DE IMPORTAÇÃO MULTI-BASE: PRÉVIA E IMPORTAÇÃO COMPLETA
// Ordem de execução: Cadastros primeiro, Históricos depois.
// Suporte a 14 bases com chave de upsert por AppSheet ID e resolução de FKs.
// ==============================================================================

// Rota para analisar a planilha e gerar prévia detalhada (/backend/v1/importador/previa)
routerAdd('POST', '/backend/v1/importador/previa', (e) => {
  const authRecord = e.auth
  if (!authRecord || authRecord.getString('papel') !== 'admin') {
    return e.json(403, {
      sucesso: false,
      erro: 'Apenas Administradores podem gerar prévias de importação.',
    })
  }

  let body = {}
  try {
    body = e.requestInfo().body || {}
  } catch (_) {}
  const spreadsheetId = (body.spreadsheet_id || '').trim()
  const signedJwt = (body.signed_jwt || '').trim()
  let directToken = (body.access_token || '').trim()
  const basesConfigs = Array.isArray(body.bases) ? body.bases : []

  if (!spreadsheetId) {
    return e.json(400, { sucesso: false, erro: 'ID da planilha Google não informado.' })
  }

  if (!directToken && signedJwt) {
    try {
      const tokenUrl = 'https://oauth2.googleapis.com/token'
      const postBody =
        'grant_type=' +
        encodeURIComponent('urn:ietf:params:oauth:grant-type:jwt-bearer') +
        '&assertion=' +
        encodeURIComponent(signedJwt)
      const tokenRes = $http.send({
        method: 'POST',
        url: tokenUrl,
        body: postBody,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 30,
      })
      if (tokenRes.statusCode === 200 && tokenRes.json && tokenRes.json.access_token) {
        directToken = tokenRes.json.access_token
      }
    } catch (_) {}
  }

  if (!directToken) {
    return e.json(400, { sucesso: false, erro: 'Token de autenticação Google não disponível.' })
  }

  // Prepara mapas em memória dos registros já existentes no sistema (por app_sheet_id e identificadores naturais)
  const mapasExistentes = {}
  const tabelasParaChecar = [
    'fazendas',
    'talhoes',
    'maquinas',
    'caminhoes',
    'caminhao_baldeio',
    'pilhas',
    'motivos',
    'users',
    'historico_feller',
    'historico_skidder',
    'historico_baldeio',
    'historico_descarga',
    'historico_picador',
  ]

  for (let t = 0; t < tabelasParaChecar.length; t++) {
    const tabName = tabelasParaChecar[t]
    mapasExistentes[tabName] = { porAppSheetId: {}, porId: {}, total: 0 }
    try {
      const recs = e.app.findRecordsByFilter(tabName, '', '', 5000, 0)
      mapasExistentes[tabName].total = recs.length
      for (let r = 0; r < recs.length; r++) {
        const rec = recs[r]
        const asId = (rec.getString('app_sheet_id') || '').trim()
        if (asId) mapasExistentes[tabName].porAppSheetId[asId] = rec.id
        mapasExistentes[tabName].porId[rec.id] = true
        // Indexa chaves naturais se existirem
        if (tabName === 'fazendas') {
          const cod = (rec.getString('codigo') || '').trim().toLowerCase()
          if (cod) mapasExistentes[tabName].porAppSheetId[cod] = rec.id
        } else if (tabName === 'talhoes') {
          const tNome = (rec.getString('talhao') || '').trim().toLowerCase()
          if (tNome) mapasExistentes[tabName].porAppSheetId[tNome] = rec.id
        } else if (tabName === 'maquinas') {
          const mId = (rec.getString('id_maquina') || '').trim().toLowerCase()
          if (mId) mapasExistentes[tabName].porAppSheetId[mId] = rec.id
        } else if (tabName === 'caminhoes') {
          const plc = (rec.getString('placa') || '').trim().toUpperCase()
          if (plc) mapasExistentes[tabName].porAppSheetId[plc] = rec.id
        } else if (tabName === 'caminhao_baldeio') {
          const plcB = (rec.getString('placa_baldeio') || '').trim().toUpperCase()
          if (plcB) mapasExistentes[tabName].porAppSheetId[plcB] = rec.id
        } else if (tabName === 'pilhas') {
          const pCod = (rec.getString('codigo') || '').trim().toLowerCase()
          if (pCod) mapasExistentes[tabName].porAppSheetId[pCod] = rec.id
        } else if (tabName === 'motivos') {
          const motId = (rec.getString('id_motivo') || '').trim().toLowerCase()
          if (motId) mapasExistentes[tabName].porAppSheetId[motId] = rec.id
        } else if (tabName === 'users') {
          const eml = (rec.getString('email') || '').trim().toLowerCase()
          if (eml) mapasExistentes[tabName].porAppSheetId[eml] = rec.id
        } else if (tabName === 'historico_picador') {
          const nf = (rec.getString('nota_fiscal') || '').trim().toLowerCase()
          if (nf) mapasExistentes[tabName].porAppSheetId[nf] = rec.id
        }
      }
    } catch (_) {}
  }

  // Ordena bases pela ordem de execução configurada (cadastros antes de históricos)
  const basesOrdenadas = basesConfigs
    .slice()
    .sort((a, b) => Number(a.ordem || 99) - Number(b.ordem || 99))

  const previaResultado = {
    sucesso: true,
    total_bases_analisadas: 0,
    resumo_geral: {
      total_linhas: 0,
      total_inserir: 0,
      total_atualizar: 0,
      total_ignorar: 0,
      total_rejeitar: 0,
    },
    bases: [],
  }

  for (let b = 0; b < basesOrdenadas.length; b++) {
    const bCfg = basesOrdenadas[b]
    if (!bCfg.ativo || !bCfg.aba) continue

    previaResultado.total_bases_analisadas++
    const baseKey = bCfg.key || bCfg.nome
    const destinoTabela = bCfg.destino || baseKey
    const colunaId = (bCfg.coluna_id || '').trim()
    const regraDuplicidade = bCfg.regra || 'atualizar' // 'atualizar', 'inserir_apenas', 'substituir'
    const mapeamento = bCfg.mapeamento || {}

    const basePrevia = {
      key: baseKey,
      nome: bCfg.nome,
      destino: destinoTabela,
      aba: bCfg.aba,
      coluna_id: colunaId,
      regra: regraDuplicidade,
      total_linhas: 0,
      inserir: 0,
      atualizar: 0,
      ignorar: 0,
      rejeitar: 0,
      rejeitados_lista: [],
      amostra_processada: [],
    }

    // Busca linhas da aba correspondente
    const rangeStr = bCfg.aba.includes('!') ? bCfg.aba : `${bCfg.aba}!A:ZZ`
    const urlSheets = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(rangeStr)}`
    const resSheet = $http.send({
      method: 'GET',
      url: urlSheets,
      headers: { Authorization: `Bearer ${directToken}`, Accept: 'application/json' },
      timeout: 45,
    })

    if (resSheet.statusCode !== 200) {
      let errSheet = 'Erro ' + resSheet.statusCode
      try {
        if (resSheet.json && resSheet.json.error && resSheet.json.error.message)
          errSheet = resSheet.json.error.message
      } catch (_) {}
      basePrevia.erro = errSheet
      basePrevia.rejeitar = 1
      basePrevia.rejeitados_lista.push({
        linha: 0,
        motivo: `Falha ao ler aba "${bCfg.aba}": ${errSheet}`,
      })
      previaResultado.bases.push(basePrevia)
      continue
    }

    const rows = (resSheet.json && resSheet.json.values) || []
    if (rows.length <= 1) {
      basePrevia.total_linhas = 0
      previaResultado.bases.push(basePrevia)
      continue
    }

    const cabecalhos = rows[0].map((h) => (h || '').toString().trim())
    const numRows = rows.length - 1
    basePrevia.total_linhas = numRows
    previaResultado.resumo_geral.total_linhas += numRows

    // Localiza o índice da coluna ID único
    let idxColId = -1
    if (colunaId) {
      idxColId = cabecalhos.findIndex((h) => h.toLowerCase() === colunaId.toLowerCase())
    }
    if (idxColId === -1) {
      // Tenta inferir se não encontrada
      idxColId = cabecalhos.findIndex((h) => {
        const hl = h.toLowerCase().replace(/[^a-z0-9_]/g, '')
        return (
          hl === '_id_' ||
          hl === 'id' ||
          hl.startsWith('id_') ||
          hl.endsWith('_id') ||
          hl.includes('key')
        )
      })
    }

    const cacheTabela = mapasExistentes[destinoTabela] || { porAppSheetId: {}, porId: {}, total: 0 }

    for (let r = 1; r < rows.length; r++) {
      const row = rows[r]
      const linhaNum = r + 1
      if (!row || row.length === 0 || row.every((c) => !c || c.toString().trim() === '')) {
        continue
      }

      // Extrai ID único da linha
      const rawIdVal =
        idxColId >= 0 && row[idxColId] !== undefined ? row[idxColId].toString().trim() : ''
      const appSheetIdVal = rawIdVal || `LINHA_${linhaNum}`

      // Validação de campos obrigatórios conforme destino
      let motivoRejeicao = ''
      if (destinoTabela === 'fazendas') {
        const nomeIdx = cabecalhos.findIndex(
          (h) =>
            mapeamento[h] === 'nome' ||
            h.toLowerCase().includes('nome') ||
            h.toLowerCase().includes('fazenda'),
        )
        const codIdx = cabecalhos.findIndex(
          (h) => mapeamento[h] === 'codigo' || h.toLowerCase().includes('cod'),
        )
        if (nomeIdx >= 0 && (!row[nomeIdx] || !row[nomeIdx].toString().trim())) {
          motivoRejeicao = 'Nome da Fazenda obrigatório está vazio'
        } else if (codIdx >= 0 && (!row[codIdx] || !row[codIdx].toString().trim())) {
          motivoRejeicao = 'Código da Fazenda obrigatório está vazio'
        }
      } else if (destinoTabela === 'talhoes') {
        const tIdx = cabecalhos.findIndex(
          (h) => mapeamento[h] === 'talhao' || h.toLowerCase().includes('talhao'),
        )
        if (tIdx >= 0 && (!row[tIdx] || !row[tIdx].toString().trim())) {
          motivoRejeicao = 'Identificador do Talhão obrigatório está vazio'
        }
      } else if (destinoTabela === 'maquinas') {
        const mIdx = cabecalhos.findIndex(
          (h) =>
            mapeamento[h] === 'id_maquina' ||
            h.toLowerCase().includes('maquina') ||
            h.toLowerCase().includes('frota'),
        )
        if (mIdx >= 0 && (!row[mIdx] || !row[mIdx].toString().trim())) {
          motivoRejeicao = 'Identificador da Máquina está vazio'
        }
      } else if (destinoTabela === 'caminhoes' || destinoTabela === 'caminhao_baldeio') {
        const pIdx = cabecalhos.findIndex(
          (h) =>
            mapeamento[h] === 'placa' ||
            mapeamento[h] === 'placa_baldeio' ||
            h.toLowerCase().includes('placa'),
        )
        if (pIdx >= 0 && (!row[pIdx] || !row[pIdx].toString().trim())) {
          motivoRejeicao = 'Placa do veículo é obrigatória'
        }
      } else if (destinoTabela === 'pilhas') {
        const cIdx = cabecalhos.findIndex(
          (h) =>
            mapeamento[h] === 'codigo' ||
            h.toLowerCase().includes('cod') ||
            h.toLowerCase().includes('pilha'),
        )
        if (cIdx >= 0 && (!row[cIdx] || !row[cIdx].toString().trim())) {
          motivoRejeicao = 'Código da Pilha é obrigatório'
        }
      } else if (destinoTabela === 'historico_picador') {
        // Na importação da aba picador, não recusa por falta de nota fiscal/ticket
        // Campo vazio é aceito na importação e preenchido com identificador automático se vazio
      }

      if (motivoRejeicao) {
        basePrevia.rejeitar++
        previaResultado.resumo_geral.total_rejeitar++
        if (basePrevia.rejeitados_lista.length < 20) {
          basePrevia.rejeitados_lista.push({
            linha: linhaNum,
            id_planilha: appSheetIdVal,
            motivo: motivoRejeicao,
          })
        }
        continue
      }

      // Verifica se o registro já existe
      const idExistente =
        cacheTabela.porAppSheetId[appSheetIdVal] ||
        (rawIdVal ? cacheTabela.porAppSheetId[rawIdVal.toLowerCase()] : null)

      if (idExistente) {
        if (regraDuplicidade === 'inserir_apenas') {
          basePrevia.ignorar++
          previaResultado.resumo_geral.total_ignorar++
        } else {
          // 'atualizar' (upsert) ou 'substituir'
          basePrevia.atualizar++
          previaResultado.resumo_geral.total_atualizar++
        }
      } else {
        basePrevia.inserir++
        previaResultado.resumo_geral.total_inserir++
        // Marca na memória para que referências filhas subsequentes consigam resolver
        if (rawIdVal) {
          cacheTabela.porAppSheetId[rawIdVal] = `PREVIEW_NEW_${appSheetIdVal}`
        }
      }

      if (basePrevia.amostra_processada.length < 3) {
        basePrevia.amostra_processada.push({
          linha: linhaNum,
          id_chave: appSheetIdVal,
          tipo_acao: idExistente
            ? regraDuplicidade === 'inserir_apenas'
              ? 'ignorar'
              : 'atualizar'
            : 'inserir',
        })
      }
    }

    previaResultado.bases.push(basePrevia)
  }

  return e.json(200, previaResultado)
})

// Rota de execução completa da Importação Multi-Base (/backend/v1/importador/executar)
routerAdd('POST', '/backend/v1/importador/executar', (e) => {
  const authRecord = e.auth
  if (!authRecord || authRecord.getString('papel') !== 'admin') {
    return e.json(403, {
      sucesso: false,
      erro: 'Apenas Administradores podem executar a importação multi-base.',
    })
  }

  let body = {}
  try {
    body = e.requestInfo().body || {}
  } catch (_) {}
  const spreadsheetId = (body.spreadsheet_id || '').trim()
  const signedJwt = (body.signed_jwt || '').trim()
  let directToken = (body.access_token || '').trim()
  const basesConfigs = Array.isArray(body.bases) ? body.bases : []

  if (!spreadsheetId) {
    return e.json(400, { sucesso: false, erro: 'ID da planilha Google não informado.' })
  }

  if (!directToken && signedJwt) {
    try {
      const tokenUrl = 'https://oauth2.googleapis.com/token'
      const postBody =
        'grant_type=' +
        encodeURIComponent('urn:ietf:params:oauth:grant-type:jwt-bearer') +
        '&assertion=' +
        encodeURIComponent(signedJwt)
      const tokenRes = $http.send({
        method: 'POST',
        url: tokenUrl,
        body: postBody,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 30,
      })
      if (tokenRes.statusCode === 200 && tokenRes.json && tokenRes.json.access_token) {
        directToken = tokenRes.json.access_token
      }
    } catch (_) {}
  }

  if (!directToken) {
    return e.json(400, { sucesso: false, erro: 'Token de autenticação Google não disponível.' })
  }

  const clientIp = e.remoteIP()

  // Mapeamento em memória de entidades para resolver FKs entre tabelas
  // Ex: mapasFK.fazendas[app_sheet_id_fazenda] = pocketbase_id
  const mapasFK = {
    fazendas: {},
    talhoes: {},
    maquinas: {},
    caminhoes: {},
    caminhao_baldeio: {},
    pilhas: {},
    motivos: {},
    users: {},
    conversao_sr_toras: {},
    conversao_sr_cavaco: {},
  }

  // Pre-carrega todas as entidades existentes para resolução de FKs e checagem de upsert
  const colecoesCarregar = Object.keys(mapasFK)
  for (let c = 0; c < colecoesCarregar.length; c++) {
    const colName = colecoesCarregar[c]
    try {
      const recs = e.app.findRecordsByFilter(colName, '', '', 5000, 0)
      for (let r = 0; r < recs.length; r++) {
        const rec = recs[r]
        mapasFK[colName][rec.id] = rec.id
        const asId = (rec.getString('app_sheet_id') || '').trim()
        if (asId) mapasFK[colName][asId] = rec.id

        if (colName === 'fazendas') {
          const cod = (rec.getString('codigo') || '').trim().toLowerCase()
          if (cod) mapasFK[colName][cod] = rec.id
          const nm = (rec.getString('nome') || '').trim().toLowerCase()
          if (nm) mapasFK[colName][nm] = rec.id
        } else if (colName === 'talhoes') {
          const t = (rec.getString('talhao') || '').trim().toLowerCase()
          if (t) mapasFK[colName][t] = rec.id
        } else if (colName === 'maquinas') {
          const m = (rec.getString('id_maquina') || '').trim().toLowerCase()
          if (m) mapasFK[colName][m] = rec.id
        } else if (colName === 'caminhoes') {
          const p = (rec.getString('placa') || '').trim().toUpperCase()
          if (p) mapasFK[colName][p] = rec.id
        } else if (colName === 'caminhao_baldeio') {
          const pb = (rec.getString('placa_baldeio') || '').trim().toUpperCase()
          if (pb) mapasFK[colName][pb] = rec.id
        } else if (colName === 'pilhas') {
          const pk = (rec.getString('codigo') || '').trim().toLowerCase()
          if (pk) mapasFK[colName][pk] = rec.id
        } else if (colName === 'motivos') {
          const mt = (rec.getString('id_motivo') || '').trim().toLowerCase()
          if (mt) mapasFK[colName][mt] = rec.id
        } else if (colName === 'users') {
          const em = (rec.getString('email') || '').trim().toLowerCase()
          if (em) mapasFK[colName][em] = rec.id
          const nm = (rec.getString('name') || '').trim().toLowerCase()
          if (nm) mapasFK[colName][nm] = rec.id
        }
      }
    } catch (_) {}
  }

  // Pre-carrega conversão padrão de Toras e Cavaco vigentes
  let defaultConvTorasId = ''
  try {
    const cvt = e.app.findRecordsByFilter(
      'conversao_sr_toras',
      'is_vigente = true',
      '-created',
      1,
      0,
    )
    if (cvt.length > 0) defaultConvTorasId = cvt[0].id
  } catch (_) {}

  let defaultConvCavacoId = ''
  try {
    const cvc = e.app.findRecordsByFilter(
      'conversao_sr_cavaco',
      'is_vigente = true',
      '-created',
      1,
      0,
    )
    if (cvc.length > 0) defaultConvCavacoId = cvc[0].id
  } catch (_) {}

  // Ordena bases: Cadastros primeiro, depois Históricos
  const basesOrdenadas = basesConfigs
    .slice()
    .sort((a, b) => Number(a.ordem || 99) - Number(b.ordem || 99))

  const resultadoGeral = {
    sucesso: true,
    total_bases_processadas: 0,
    total_linhas_processadas: 0,
    total_inseridos: 0,
    total_atualizados: 0,
    total_ignorados: 0,
    total_rejeitados: 0,
    bases: [],
    erros: [],
  }

  // Helper inline para resolver foreign key
  const resolverFK = (tabela, valorBruto) => {
    if (!valorBruto) return ''
    const str = valorBruto.toString().trim()
    if (!str) return ''
    const mapa = mapasFK[tabela] || {}
    if (mapa[str]) return mapa[str]
    const lower = str.toLowerCase()
    if (mapa[lower]) return mapa[lower]
    const upper = str.toUpperCase()
    if (mapa[upper]) return mapa[upper]
    // Tenta busca direta no banco se não estiver em memória
    try {
      const rec = e.app.findRecordById(tabela, str)
      if (rec && rec.id) {
        mapa[str] = rec.id
        return rec.id
      }
    } catch (_) {}
    return ''
  }

  for (let b = 0; b < basesOrdenadas.length; b++) {
    const bCfg = basesOrdenadas[b]
    if (!bCfg.ativo || !bCfg.aba) continue

    resultadoGeral.total_bases_processadas++
    const baseKey = bCfg.key || bCfg.nome
    const destinoTabela = bCfg.destino || baseKey
    const colunaId = (bCfg.coluna_id || '').trim()
    const regraDuplicidade = bCfg.regra || 'atualizar'
    const mapeamento = bCfg.mapeamento || {}

    const baseRes = {
      key: baseKey,
      nome: bCfg.nome,
      destino: destinoTabela,
      aba: bCfg.aba,
      linhas_lidas: 0,
      inseridos: 0,
      atualizados: 0,
      ignorados: 0,
      rejeitados: 0,
      status: 'sucesso',
      detalhes: [],
    }

    // Leitura das linhas da aba
    const rangeStr = bCfg.aba.includes('!') ? bCfg.aba : `${bCfg.aba}!A:ZZ`
    const urlSheets = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(rangeStr)}`
    const resSheet = $http.send({
      method: 'GET',
      url: urlSheets,
      headers: { Authorization: `Bearer ${directToken}`, Accept: 'application/json' },
      timeout: 60,
    })

    if (resSheet.statusCode !== 200) {
      let errSheet = 'Erro ' + resSheet.statusCode
      try {
        if (resSheet.json && resSheet.json.error && resSheet.json.error.message)
          errSheet = resSheet.json.error.message
      } catch (_) {}
      baseRes.status = 'erro'
      baseRes.rejeitados = 1
      baseRes.erro = errSheet
      resultadoGeral.erros.push(`Aba ${bCfg.aba}: ${errSheet}`)
      resultadoGeral.bases.push(baseRes)
      continue
    }

    const rows = (resSheet.json && resSheet.json.values) || []
    if (rows.length <= 1) {
      baseRes.linhas_lidas = 0
      resultadoGeral.bases.push(baseRes)
      continue
    }

    const cabecalhos = rows[0].map((h) => (h || '').toString().trim())
    baseRes.linhas_lidas = rows.length - 1
    resultadoGeral.total_linhas_processadas += rows.length - 1

    // Localiza índice da coluna ID do AppSheet
    let idxColId = -1
    if (colunaId) {
      idxColId = cabecalhos.findIndex((h) => h.toLowerCase() === colunaId.toLowerCase())
    }
    if (idxColId === -1) {
      idxColId = cabecalhos.findIndex((h) => {
        const hl = h.toLowerCase().replace(/[^a-z0-9_]/g, '')
        return (
          hl === '_id_' ||
          hl === 'id' ||
          hl.startsWith('id_') ||
          hl.endsWith('_id') ||
          hl.includes('key')
        )
      })
    }

    let targetCol = null
    try {
      targetCol = e.app.findCollectionByNameOrId(destinoTabela)
    } catch (colErr) {
      baseRes.status = 'erro'
      baseRes.erro = `Coleção "${destinoTabela}" não encontrada no banco de dados.`
      resultadoGeral.erros.push(baseRes.erro)
      resultadoGeral.bases.push(baseRes)
      continue
    }

    for (let r = 1; r < rows.length; r++) {
      const row = rows[r]
      const linhaNum = r + 1
      if (!row || row.length === 0 || row.every((c) => !c || c.toString().trim() === '')) {
        continue
      }

      const rawIdVal =
        idxColId >= 0 && row[idxColId] !== undefined ? row[idxColId].toString().trim() : ''
      const appSheetId = rawIdVal || `LINHA_${linhaNum}`

      // Monta objeto de dados a partir do mapeamento ou heurística
      const dados = {}
      for (let c = 0; c < cabecalhos.length; c++) {
        const colHeader = cabecalhos[c]
        if (!colHeader) continue
        const val = row[c] !== undefined ? row[c] : ''
        const campoMapeado = mapeamento[colHeader]

        if (campoMapeado && campoMapeado !== '__ignorar__') {
          dados[campoMapeado] = val
        } else if (!campoMapeado) {
          // Heurística de fallback inteligente
          const colClean = colHeader.toLowerCase().replace(/[\s\-\/\.]+/g, '_')
          dados[colClean] = val
        }
      }

      // Procura se já existe no PocketBase
      let recordExistente = null
      if (rawIdVal) {
        try {
          const porAS = e.app.findRecordsByFilter(
            destinoTabela,
            `app_sheet_id = '${rawIdVal}'`,
            '',
            1,
            0,
          )
          if (porAS.length > 0) recordExistente = porAS[0]
        } catch (_) {}
      }

      // Se não achou pelo app_sheet_id, tenta chave natural única de cada entidade
      if (!recordExistente) {
        try {
          if (destinoTabela === 'fazendas' && (dados.codigo || dados.nome)) {
            const cod = (dados.codigo || '').trim()
            if (cod) {
              const f = e.app.findRecordsByFilter('fazendas', `codigo = '${cod}'`, '', 1, 0)
              if (f.length > 0) recordExistente = f[0]
            }
          } else if (destinoTabela === 'talhoes' && dados.talhao) {
            const t = (dados.talhao || '').trim()
            if (t) {
              const th = e.app.findRecordsByFilter('talhoes', `talhao = '${t}'`, '', 1, 0)
              if (th.length > 0) recordExistente = th[0]
            }
          } else if (destinoTabela === 'maquinas' && dados.id_maquina) {
            const m = (dados.id_maquina || '').trim()
            if (m) {
              const mq = e.app.findRecordsByFilter('maquinas', `id_maquina = '${m}'`, '', 1, 0)
              if (mq.length > 0) recordExistente = mq[0]
            }
          } else if (destinoTabela === 'caminhoes' && dados.placa) {
            const p = (dados.placa || '').trim().toUpperCase()
            if (p) {
              const cm = e.app.findRecordsByFilter('caminhoes', `placa = '${p}'`, '', 1, 0)
              if (cm.length > 0) recordExistente = cm[0]
            }
          } else if (destinoTabela === 'caminhao_baldeio' && (dados.placa_baldeio || dados.placa)) {
            const pb = (dados.placa_baldeio || dados.placa || '').trim().toUpperCase()
            if (pb) {
              const cb = e.app.findRecordsByFilter(
                'caminhao_baldeio',
                `placa_baldeio = '${pb}'`,
                '',
                1,
                0,
              )
              if (cb.length > 0) recordExistente = cb[0]
            }
          } else if (destinoTabela === 'pilhas' && (dados.codigo || dados.nome)) {
            const pk = (dados.codigo || dados.nome || '').trim()
            if (pk) {
              const pi = e.app.findRecordsByFilter('pilhas', `codigo = '${pk}'`, '', 1, 0)
              if (pi.length > 0) recordExistente = pi[0]
            }
          } else if (destinoTabela === 'motivos' && dados.id_motivo) {
            const mt = (dados.id_motivo || '').trim()
            if (mt) {
              const mo = e.app.findRecordsByFilter('motivos', `id_motivo = '${mt}'`, '', 1, 0)
              if (mo.length > 0) recordExistente = mo[0]
            }
          } else if (destinoTabela === 'users' && dados.email) {
            const em = (dados.email || '').trim().toLowerCase()
            if (em) {
              const us = e.app.findRecordsByFilter('users', `email = '${em}'`, '', 1, 0)
              if (us.length > 0) recordExistente = us[0]
            }
          } else if (destinoTabela === 'historico_picador' && (dados.nota_fiscal || dados.ticket)) {
            const nf = (dados.nota_fiscal || dados.ticket || '').trim()
            if (nf) {
              const hp = e.app.findRecordsByFilter(
                'historico_picador',
                `nota_fiscal = '${nf}'`,
                '',
                1,
                0,
              )
              if (hp.length > 0) recordExistente = hp[0]
            }
          }
        } catch (_) {}
      }

      if (recordExistente && regraDuplicidade === 'inserir_apenas') {
        baseRes.ignorados++
        resultadoGeral.total_ignorados++
        continue
      }

      // Criação ou Edição
      try {
        const isUpdate = Boolean(recordExistente)
        const rec = isUpdate ? recordExistente : new Record(targetCol)

        // Seta app_sheet_id
        if (rawIdVal) {
          rec.set('app_sheet_id', rawIdVal)
        }

        // Popula campos específicos da entidade
        if (destinoTabela === 'fazendas') {
          if (dados.nome) rec.set('nome', dados.nome.toString().trim())
          if (dados.codigo) rec.set('codigo', dados.codigo.toString().trim())
          else if (!isUpdate && dados.nome)
            rec.set('codigo', dados.nome.toString().slice(0, 10).toUpperCase())
          if (dados.uf) rec.set('uf', dados.uf.toString().slice(0, 2).toUpperCase())
          else if (!isUpdate) rec.set('uf', 'PR')
          if (dados.cidade) rec.set('cidade', dados.cidade.toString().trim())
          if (dados.area_total != null)
            rec.set('area_total', parseFloat(String(dados.area_total).replace(',', '.')) || 0)
          if (dados.area_plantada != null)
            rec.set('area_plantada', parseFloat(String(dados.area_plantada).replace(',', '.')) || 0)
          rec.set('status', dados.status === 'inativa' ? 'inativa' : 'ativa')
        } else if (destinoTabela === 'talhoes') {
          if (dados.talhao) rec.set('talhao', dados.talhao.toString().trim())
          const fzId = resolverFK(
            'fazendas',
            dados.fazenda_id || dados.fazenda || dados.codigo_fazenda,
          )
          if (fzId) rec.set('fazenda_id', fzId)
          if (dados.area_ha != null)
            rec.set('area_ha', parseFloat(String(dados.area_ha).replace(',', '.')) || 0)
          if (dados.especie) rec.set('especie', dados.especie.toString().trim())
          if (dados.data_plantio) rec.set('data_plantio', dados.data_plantio.toString())
          const st = (dados.status || '').toLowerCase()
          rec.set(
            'status',
            ['ativo', 'cultivo', 'colheita', 'concluido'].includes(st) ? st : 'ativo',
          )
        } else if (destinoTabela === 'maquinas') {
          if (dados.id_maquina) rec.set('id_maquina', dados.id_maquina.toString().trim())
          if (dados.equipamento) rec.set('equipamento', dados.equipamento.toString().trim())
          else if (!isUpdate) rec.set('equipamento', dados.id_maquina || 'Máquina Operacional')
          const tp = (dados.tipo || '').toLowerCase()
          rec.set(
            'tipo',
            ['feller', 'skidder', 'picador', 'colhedora', 'outros'].includes(tp) ? tp : 'outros',
          )
          if (dados.bt) rec.set('bt', dados.bt.toString().trim())
          if (dados.usuario_responsavel)
            rec.set('usuario_responsavel', dados.usuario_responsavel.toString().trim())
          const fzId = resolverFK('fazendas', dados.fazenda_id || dados.fazenda)
          if (fzId) rec.set('fazenda_id', fzId)
          const st = (dados.status || '').toLowerCase()
          rec.set('status', ['ativa', 'manutencao', 'inativa'].includes(st) ? st : 'ativa')
        } else if (destinoTabela === 'caminhoes') {
          if (dados.placa) rec.set('placa', dados.placa.toString().trim().toUpperCase())
          if (dados.modelo) rec.set('modelo', dados.modelo.toString().trim())
          else if (!isUpdate) rec.set('modelo', 'Caminhão Rodoviário')
          if (dados.capacidade_m3 != null)
            rec.set('capacidade_m3', parseFloat(String(dados.capacidade_m3).replace(',', '.')) || 0)
          if (dados.renavam) rec.set('renavam', dados.renavam.toString().trim())
          const st = (dados.status || '').toLowerCase()
          rec.set('status', ['ativo', 'manutencao', 'inativo'].includes(st) ? st : 'ativo')
        } else if (destinoTabela === 'caminhao_baldeio') {
          const plc = (dados.placa_baldeio || dados.placa || '').toString().trim().toUpperCase()
          if (plc) rec.set('placa_baldeio', plc)
          if (dados.modelo) rec.set('modelo', dados.modelo.toString().trim())
          else if (!isUpdate) rec.set('modelo', 'Trator/Carreta Baldeio')
          if (dados.capacidade_m3 != null)
            rec.set('capacidade_m3', parseFloat(String(dados.capacidade_m3).replace(',', '.')) || 0)
          if (dados.tipo_carreta) rec.set('tipo_carreta', dados.tipo_carreta.toString().trim())
          const st = (dados.status || '').toLowerCase()
          rec.set('status', ['ativo', 'manutencao', 'inativo'].includes(st) ? st : 'ativo')
        } else if (destinoTabela === 'pilhas') {
          if (dados.codigo) rec.set('codigo', dados.codigo.toString().trim())
          if (dados.nome) rec.set('nome', dados.nome.toString().trim())
          const fzId = resolverFK('fazendas', dados.fazenda_id || dados.fazenda)
          if (fzId) rec.set('fazenda_id', fzId)
          const thId = resolverFK('talhoes', dados.talhao_id || dados.talhao)
          if (thId) rec.set('talhao_id', thId)
          if (dados.is_mista !== undefined) rec.set('is_mista', Boolean(dados.is_mista))
          const prod = (dados.produto || '').toLowerCase()
          rec.set('produto', ['tora', 'cavaco', 'misto'].includes(prod) ? prod : 'tora')
          if (dados.volume_atual_m3 != null)
            rec.set(
              'volume_atual_m3',
              parseFloat(String(dados.volume_atual_m3).replace(',', '.')) || 0,
            )
          const st = (dados.status || '').toLowerCase()
          rec.set(
            'status',
            ['ativa', 'inativa', 'em_consumo', 'concluida'].includes(st) ? st : 'ativa',
          )
        } else if (destinoTabela === 'motivos') {
          if (dados.id_motivo) rec.set('id_motivo', dados.id_motivo.toString().trim())
          if (dados.motivo) rec.set('motivo', dados.motivo.toString().trim())
          if (dados.equipamento) rec.set('equipamento', dados.equipamento.toString().trim())
          const cat = (dados.categoria || '').toLowerCase()
          rec.set(
            'categoria',
            [
              'rejeicao_tora',
              'recusa_cavaco',
              'parada_maquina',
              'divergencia_estoque',
              'outros',
            ].includes(cat)
              ? cat
              : 'outros',
          )
          rec.set('status', dados.status === 'inativo' ? 'inativo' : 'ativo')
        } else if (destinoTabela === 'users') {
          if (dados.name) rec.set('name', dados.name.toString().trim())
          if (dados.email && !isUpdate) {
            rec.setEmail(dados.email.toString().trim().toLowerCase())
            rec.setPassword('Skip@Pass123')
            rec.setVerified(true)
          }
          const papel = (dados.papel || '').toLowerCase()
          if (['admin', 'operador', 'conferente'].includes(papel)) rec.set('papel', papel)
          rec.set('status', dados.status !== false)
        } else if (destinoTabela === 'historico_feller') {
          const thId = resolverFK('talhoes', dados.talhao_id || dados.talhao)
          if (thId) rec.set('talhao_id', thId)
          const mqId = resolverFK('maquinas', dados.maquina_id || dados.maquina || dados.id_maquina)
          if (mqId) rec.set('maquina_id', mqId)
          rec.set(
            'data_operacao',
            (dados.data_operacao || dados.data || new Date().toISOString()).toString(),
          )
          rec.set(
            'horas_trabalhadas',
            parseFloat(String(dados.horas_trabalhadas || dados.horas || 0).replace(',', '.')) || 0,
          )
          rec.set(
            'combustivel_litros',
            parseFloat(
              String(dados.combustivel_litros || dados.combustivel || 0).replace(',', '.'),
            ) || 0,
          )
          if (dados.arvores_derrubadas != null)
            rec.set('arvores_derrubadas', parseInt(String(dados.arvores_derrubadas), 10) || 0)
          if (dados.observacoes) rec.set('observacoes', dados.observacoes.toString())
        } else if (destinoTabela === 'historico_skidder') {
          const thId = resolverFK('talhoes', dados.talhao_id || dados.talhao)
          if (thId) rec.set('talhao_id', thId)
          const mqId = resolverFK('maquinas', dados.maquina_id || dados.maquina || dados.id_maquina)
          if (mqId) rec.set('maquina_id', mqId)
          rec.set(
            'data_operacao',
            (dados.data_operacao || dados.data || new Date().toISOString()).toString(),
          )
          rec.set(
            'horas_trabalhadas',
            parseFloat(String(dados.horas_trabalhadas || dados.horas || 0).replace(',', '.')) || 0,
          )
          rec.set(
            'combustivel_litros',
            parseFloat(
              String(dados.combustivel_litros || dados.combustivel || 0).replace(',', '.'),
            ) || 0,
          )
          if (dados.ciclos_arraste != null)
            rec.set('ciclos_arraste', parseInt(String(dados.ciclos_arraste), 10) || 0)
          if (dados.observacoes) rec.set('observacoes', dados.observacoes.toString())
        } else if (destinoTabela === 'historico_baldeio') {
          const cbId = resolverFK(
            'caminhao_baldeio',
            dados.caminhao_baldeio_id || dados.placa_baldeio || dados.caminhao,
          )
          if (cbId) rec.set('caminhao_baldeio_id', cbId)
          const thOrigem = resolverFK(
            'talhoes',
            dados.talhao_origem_id || dados.talhao || dados.origem,
          )
          if (thOrigem) rec.set('talhao_origem_id', thOrigem)
          const plDest = resolverFK(
            'pilhas',
            dados.pilha_destino_id || dados.pilha || dados.destino,
          )
          if (plDest) rec.set('pilha_destino_id', plDest)
          if (defaultConvTorasId) rec.set('conversao_sr_id', defaultConvTorasId)
          rec.set(
            'data_hora_saida',
            (
              dados.data_hora_saida ||
              dados.data_hora ||
              dados.data ||
              new Date().toISOString()
            ).toString(),
          )
          if (dados.data_hora_chegada)
            rec.set('data_hora_chegada', dados.data_hora_chegada.toString())
          rec.set(
            'volume_sr',
            parseFloat(String(dados.volume_sr || dados.volume || 0).replace(',', '.')) || 0,
          )
          if (dados.volume_m3_estimado != null)
            rec.set(
              'volume_m3_estimado',
              parseFloat(String(dados.volume_m3_estimado).replace(',', '.')) || 0,
            )
          if (dados.motorista) rec.set('motorista', dados.motorista.toString())
          if (dados.numero_viagem) rec.set('numero_viagem', dados.numero_viagem.toString())
          rec.set(
            'status_baldeio',
            ['em_transito', 'concluido', 'cancelado'].includes(dados.status_baldeio)
              ? dados.status_baldeio
              : 'concluido',
          )
        } else if (destinoTabela === 'historico_descarga') {
          const cbId = resolverFK(
            'caminhao_baldeio',
            dados.caminhao_baldeio_id || dados.placa_baldeio || dados.caminhao,
          )
          if (cbId) rec.set('caminhao_baldeio_id', cbId)
          const plDest = resolverFK(
            'pilhas',
            dados.pilha_destino_id || dados.pilha || dados.destino,
          )
          if (plDest) rec.set('pilha_destino_id', plDest)
          if (defaultConvTorasId) rec.set('conversao_sr_id', defaultConvTorasId)
          rec.set(
            'data_hora_descarga',
            (
              dados.data_hora_descarga ||
              dados.data_hora ||
              dados.data ||
              new Date().toISOString()
            ).toString(),
          )
          rec.set(
            'volume_sr',
            parseFloat(String(dados.volume_sr || dados.volume || 0).replace(',', '.')) || 0,
          )
          rec.set(
            'volume_m3_calculado',
            parseFloat(
              String(dados.volume_m3_calculado || dados.volume_m3 || 0).replace(',', '.'),
            ) || 0,
          )
          if (dados.peso_bruto_t != null)
            rec.set('peso_bruto_t', parseFloat(String(dados.peso_bruto_t).replace(',', '.')) || 0)
          if (dados.peso_tara_t != null)
            rec.set('peso_tara_t', parseFloat(String(dados.peso_tara_t).replace(',', '.')) || 0)
          if (dados.peso_liquido_t != null)
            rec.set(
              'peso_liquido_t',
              parseFloat(String(dados.peso_liquido_t).replace(',', '.')) || 0,
            )
          rec.set(
            'status_aceite',
            ['aceito', 'rejeitado', 'pendente'].includes(dados.status_aceite)
              ? dados.status_aceite
              : 'aceito',
          )
          if (dados.motivo_rejeicao) rec.set('motivo_rejeicao', dados.motivo_rejeicao.toString())
          if (dados.conferente_nome) rec.set('conferente_nome', dados.conferente_nome.toString())
        } else if (destinoTabela === 'historico_picador') {
          let nf = (dados.nota_fiscal || dados.ticket || dados.nf || '').toString().trim()
          if (!nf) {
            // Nota fiscal vazia na planilha deve ser aceita sem recusa
            // Para garantir unicidade no banco (índice UNIQUE), gera código determinístico com base no appSheetId ou timestamp/linha
            const refId = rawIdVal || `${new Date().getTime()}-${linhaNum}`
            nf = `PIC-S-NOTA-${refId}`
          }
          rec.set('nota_fiscal', nf)
          const cmId = resolverFK('caminhoes', dados.caminhao_id || dados.placa || dados.caminhao)
          if (cmId) rec.set('caminhao_id', cmId)
          const plOrig = resolverFK('pilhas', dados.pilha_origem_id || dados.pilha || dados.origem)
          if (plOrig) rec.set('pilha_origem_id', plOrig)
          if (defaultConvCavacoId) rec.set('conversao_cavaco_id', defaultConvCavacoId)
          rec.set(
            'data_hora_expedicao',
            (
              dados.data_hora_expedicao ||
              dados.data_hora ||
              dados.data ||
              new Date().toISOString()
            ).toString(),
          )
          const vCav =
            parseFloat(String(dados.volume_cavaco_m3 || dados.volume || 0).replace(',', '.')) || 0
          rec.set('volume_cavaco_m3', vCav)
          if (dados.peso_cavaco_t != null)
            rec.set('peso_cavaco_t', parseFloat(String(dados.peso_cavaco_t).replace(',', '.')) || 0)
          rec.set(
            'volume_tora_consumido_m3',
            parseFloat(String(dados.volume_tora_consumido_m3 || vCav * 0.4).replace(',', '.')) || 0,
          )
          if (dados.cliente) rec.set('cliente', dados.cliente.toString())
          if (dados.umidade_perc != null)
            rec.set('umidade_perc', parseFloat(String(dados.umidade_perc).replace(',', '.')) || 0)
          if (dados.operador_nome) rec.set('operador_nome', dados.operador_nome.toString())
        }

        e.app.save(rec)

        // Guarda no mapa de FKs para registros subsequentes
        if (mapasFK[destinoTabela]) {
          mapasFK[destinoTabela][rec.id] = rec.id
          if (rawIdVal) mapasFK[destinoTabela][rawIdVal] = rec.id
        }

        if (isUpdate) {
          baseRes.atualizados++
          resultadoGeral.total_atualizados++
        } else {
          baseRes.inseridos++
          resultadoGeral.total_inseridos++
        }
      } catch (errSave) {
        baseRes.rejeitados++
        resultadoGeral.total_rejeitados++
        if (baseRes.detalhes.length < 15) {
          baseRes.detalhes.push({
            linha: linhaNum,
            id_chave: appSheetId,
            status: 'erro_salvar',
            motivo: '' + errSave,
          })
        }
      }
    }

    baseRes.status =
      baseRes.rejeitados === 0
        ? 'sucesso'
        : baseRes.inseridos > 0 || baseRes.atualizados > 0
          ? 'parcial'
          : 'erro'
    resultadoGeral.bases.push(baseRes)

    // Atualiza registro de configuração da base se existir
    try {
      const cfgRecs = e.app.findRecordsByFilter(
        'importador_bases_config',
        `base_key = '${baseKey}'`,
        '',
        1,
        0,
      )
      if (cfgRecs.length > 0) {
        const c = cfgRecs[0]
        c.set('ultima_importacao', new Date().toISOString())
        c.set(
          'total_importados',
          (c.getInt('total_importados') || 0) + baseRes.inseridos + baseRes.atualizados,
        )
        c.set('ultimo_status', baseRes.status)
        c.set('ultimo_erro', baseRes.erro || '')
        e.app.save(c)
      }
    } catch (_) {}
  }

  // Grava log de auditoria no histórico
  try {
    const logsCol = e.app.findCollectionByNameOrId('integracao_logs')
    const logRec = new Record(logsCol)
    logRec.set('origem_nome', 'Importador Multi-Base Google Sheets')
    logRec.set('endpoint', '/backend/v1/importador/executar')
    logRec.set('ip_origem', clientIp || '')
    logRec.set('timestamp_evento', new Date().toISOString())
    logRec.set('registros_recebidos', resultadoGeral.total_linhas_processadas)
    logRec.set(
      'registros_aceitos',
      resultadoGeral.total_inseridos + resultadoGeral.total_atualizados,
    )
    logRec.set('registros_rejeitados', resultadoGeral.total_rejeitados)
    const stGeral =
      resultadoGeral.total_rejeitados === 0
        ? 'sucesso'
        : resultadoGeral.total_inseridos + resultadoGeral.total_atualizados > 0
          ? 'parcial'
          : 'erro'
    logRec.set('status', stGeral)
    logRec.set('mensagem_erro', resultadoGeral.erros.join('; ').slice(0, 500))
    logRec.set(
      'detalhes_json',
      JSON.stringify({
        bases_processadas: resultadoGeral.total_bases_processadas,
        inseridos: resultadoGeral.total_inseridos,
        atualizados: resultadoGeral.total_atualizados,
        ignorados: resultadoGeral.total_ignorados,
        rejeitados: resultadoGeral.total_rejeitados,
        resumo_por_base: resultadoGeral.bases.map((b) => ({
          base: b.nome,
          inseridos: b.inseridos,
          atualizados: b.atualizados,
          rejeitados: b.rejeitados,
        })),
      }),
    )
    e.app.save(logRec)
  } catch (errLog) {
    console.log('Erro ao gravar log importador:', errLog)
  }

  // Atualiza também na google_sheets_config
  try {
    const configs = e.app.findRecordsByFilter('google_sheets_config', '', '-created', 1, 0)
    if (configs.length > 0) {
      const cfg = configs[0]
      const totalAntigo = cfg.getInt('linhas_ingeridas_total') || 0
      cfg.set(
        'linhas_ingeridas_total',
        totalAntigo + resultadoGeral.total_inseridos + resultadoGeral.total_atualizados,
      )
      cfg.set('ultima_sincronizacao', new Date().toISOString())
      cfg.set('ultimo_status', resultadoGeral.total_rejeitados === 0 ? 'sucesso' : 'parcial')
      cfg.set('ultimo_erro', resultadoGeral.erros.join('; ').slice(0, 300))
      e.app.save(cfg)
    }
  } catch (_) {}

  return e.json(200, resultadoGeral)
})

// Cron job para sincronização periódica da planilha (a cada 15 min)
// Nota: Em pb_hooks PocketBase v0.36 o app global é disponibilizado via e.app (em handlers de eventos) ou por app global
cronAdd('sync_google_sheets_d2', '*/15 * * * *', (e) => {
  try {
    const pocketApp =
      typeof e !== 'undefined' && e && e.app
        ? e.app
        : typeof app !== 'undefined'
          ? app
          : typeof $app !== 'undefined'
            ? $app
            : null
    if (!pocketApp || typeof pocketApp.findRecordsByFilter !== 'function') {
      return
    }

    const configs = pocketApp.findRecordsByFilter(
      'google_sheets_config',
      'is_ativa = true && sincronizacao_automatica = true',
      '-created',
      1,
      0,
    )
    if (configs.length === 0) return

    const cfg = configs[0]
    const spreadsheetId = cfg.getString('spreadsheet_id')
    const privKey = cfg.getString('private_key')
    const clientEmail = cfg.getString('client_email')

    if (!spreadsheetId || !privKey || !clientEmail) return

    cfg.set('ultimo_status', 'agendado_ativo')
    pocketApp.save(cfg)
  } catch (cronErr) {
    console.log('Erro no cron de sincronizacao google sheets:', cronErr)
  }
})

// Rota para testar e verificar status da integração / conectividade
routerAdd('GET', '/backend/v1/ingestao/status', (e) => {
  const headerAuth = e.request.header.get('Authorization') || ''
  const headerApiKey = e.request.header.get('X-API-Key') || ''
  let key = ''

  if (headerApiKey && headerApiKey.trim()) {
    key = headerApiKey.trim()
  } else if (headerAuth.startsWith('Bearer ')) {
    key = headerAuth.substring(7).trim()
  } else if (headerAuth.trim()) {
    key = headerAuth.trim()
  }

  if (!key) {
    return e.json(401, {
      autenticado: false,
      erro: 'Chave de API não informada no header (esperado X-API-Key ou Authorization: Bearer <chave>)',
    })
  }

  let cred = null
  try {
    const creds = e.app.findRecordsByFilter(
      'integracao_credenciais',
      `api_key = '${key}'`,
      '',
      1,
      0,
    )
    if (creds.length === 0) {
      return e.json(401, {
        autenticado: false,
        erro: 'Chave de API inválida',
      })
    }
    cred = creds[0]
    if (!cred.getBool('is_ativa')) {
      return e.json(401, {
        autenticado: false,
        erro: 'Chave de API inativa ou suspensa',
      })
    }
  } catch (err) {
    return e.json(500, {
      autenticado: false,
      erro: 'Erro interno ao validar credencial: ' + err,
    })
  }

  return e.json(200, {
    autenticado: true,
    integracao: {
      id: cred.id,
      nome: cred.getString('nome'),
      tipo: cred.getString('tipo'),
      is_ativa: cred.getBool('is_ativa'),
      ultimo_uso: cred.getString('ultimo_uso'),
    },
    servidor_timestamp: new Date().toISOString(),
    status: 'online',
    versao: '1.1-florestal',
  })
})
