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
