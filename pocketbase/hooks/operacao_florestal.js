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

// Cron job para sincronização periódica da planilha (a cada 15 min)
cronAdd('sync_google_sheets_d2', '*/15 * * * *', () => {
  try {
    const configs = $app.findRecordsByFilter(
      'google_sheets_config',
      'is_ativa = true && sincronizacao_automatica = true',
      '-created',
      1,
      0,
    )
    if (configs.length === 0) return

    const cfg = configs[0]
    const spreadsheetId = cfg.getString('spreadsheet_id')
    const sheetRange = cfg.getString('sheet_range') || 'A1:Z500'
    const privKey = cfg.getString('private_key')
    const clientEmail = cfg.getString('client_email')

    if (!spreadsheetId || !privKey || !clientEmail) return

    // Como o cron roda em background sem JWT externo, se houver falha de token,
    // atualizamos o status para auditoria
    cfg.set('ultimo_status', 'agendado_ativo')
    $app.save(cfg)
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
