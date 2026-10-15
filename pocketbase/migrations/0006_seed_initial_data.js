migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')

    // Helper para criar ou atualizar usuário
    const seedUser = (email, name, role) => {
      try {
        const existing = app.findAuthRecordByEmail('users', email)
        existing.set('name', name)
        existing.set('papel', role)
        existing.set('status', true)
        app.save(existing)
        return existing
      } catch (_) {
        const record = new Record(users)
        record.setEmail(email)
        record.setPassword('Skip@Pass')
        record.setVerified(true)
        record.set('name', name)
        record.set('papel', role)
        record.set('status', true)
        app.save(record)
        return record
      }
    }

    const adminUser = seedUser('henrique@julitago.com.br', 'Henrique Julitago', 'admin')
    const operadorUser = seedUser('joao.silva@operacao.com.br', 'João da Silva', 'operador')
    const conferenteUser = seedUser(
      'maria.oliveira@operacao.com.br',
      'Maria Oliveira',
      'conferente',
    )

    // 1. FAZENDAS
    const fazendasCol = app.findCollectionByNameOrId('fazendas')
    const seedFazenda = (nome, codigo, uf, cidade, areaTotal, areaPlantada) => {
      try {
        return app.findFirstRecordByData('fazendas', 'codigo', codigo)
      } catch (_) {
        const rec = new Record(fazendasCol)
        rec.set('nome', nome)
        rec.set('codigo', codigo)
        rec.set('uf', uf)
        rec.set('cidade', cidade)
        rec.set('area_total', areaTotal)
        rec.set('area_plantada', areaPlantada)
        rec.set('status', 'ativa')
        app.save(rec)
        return rec
      }
    }

    const faz1 = seedFazenda('Fazenda Boa Esperança', 'FAZ-001', 'PR', 'Toledo', 1250, 980)
    const faz2 = seedFazenda('Fazenda Santa Clara', 'FAZ-002', 'PR', 'Palotina', 860, 640)

    // 2. TALHOES
    const talhoesCol = app.findCollectionByNameOrId('talhoes')
    const seedTalhao = (talhao, fazendaId, areaHa, especie, dataPlantio, status) => {
      const existing = app.findRecordsByFilter(
        'talhoes',
        `talhao = '${talhao}' && fazenda_id = '${fazendaId}'`,
        '',
        1,
        0,
      )
      if (existing.length > 0) return existing[0]
      const rec = new Record(talhoesCol)
      rec.set('talhao', talhao)
      rec.set('fazenda_id', fazendaId)
      rec.set('area_ha', areaHa)
      rec.set('especie', especie)
      rec.set('data_plantio', dataPlantio)
      rec.set('status', status)
      app.save(rec)
      return rec
    }

    const tal1 = seedTalhao(
      'TAL-001',
      faz1.id,
      35.5,
      'Eucalyptus grandis',
      '2018-05-10',
      'colheita',
    )
    const tal2 = seedTalhao(
      'TAL-002',
      faz1.id,
      42.0,
      'Eucalyptus urophylla',
      '2019-03-15',
      'cultivo',
    )
    const tal3 = seedTalhao('TAL-003', faz2.id, 50.0, 'Pinus taeda', '2017-09-20', 'colheita')
    const tal4 = seedTalhao('TAL-004', faz2.id, 38.0, 'Eucalyptus dunnii', '2020-02-12', 'cultivo')

    // 3. MAQUINAS
    const maquinasCol = app.findCollectionByNameOrId('maquinas')
    const seedMaquina = (idMaq, equip, tipo, bt, userResp, fazId, status) => {
      try {
        return app.findFirstRecordByData('maquinas', 'id_maquina', idMaq)
      } catch (_) {
        const rec = new Record(maquinasCol)
        rec.set('id_maquina', idMaq)
        rec.set('equipamento', equip)
        rec.set('tipo', tipo)
        rec.set('bt', bt)
        rec.set('usuario_responsavel', userResp)
        rec.set('fazenda_id', fazId)
        rec.set('status', status)
        app.save(rec)
        return rec
      }
    }

    const fell1 = seedMaquina(
      'FELL-01',
      'Feller Buncher CAT 541',
      'feller',
      'BT-01',
      'João da Silva',
      faz1.id,
      'ativa',
    )
    const skid1 = seedMaquina(
      'SKID-01',
      'Skidder John Deere 648L',
      'skidder',
      'BT-02',
      'Pedro Santos',
      faz1.id,
      'ativa',
    )
    const pic1 = seedMaquina(
      'PIC-01',
      'Picador Móvel Morbark 50/48',
      'picador',
      'BT-03',
      'Carlos Mendes',
      faz1.id,
      'ativa',
    )

    // 4. CAMINHOES
    const camCol = app.findCollectionByNameOrId('caminhoes')
    const seedCaminhao = (placa, modelo, cap) => {
      try {
        return app.findFirstRecordByData('caminhoes', 'placa', placa)
      } catch (_) {
        const rec = new Record(camCol)
        rec.set('placa', placa)
        rec.set('modelo', modelo)
        rec.set('capacidade_m3', cap)
        rec.set('status', 'ativo')
        app.save(rec)
        return rec
      }
    }

    const cam1 = seedCaminhao('ABC1D23', 'Volvo FH 540 6x4', 90)
    const cam2 = seedCaminhao('DEF2E34', 'Scania R450 Cavaqueiro', 85)
    const cam3 = seedCaminhao('GHI3F45', 'Mercedes-Benz Actros 2651', 90)

    // 5. CAMINHAO_BALDEIO
    const camBCol = app.findCollectionByNameOrId('caminhao_baldeio')
    const seedCaminhaoB = (placa, modelo, cap, tipo) => {
      try {
        return app.findFirstRecordByData('caminhao_baldeio', 'placa_baldeio', placa)
      } catch (_) {
        const rec = new Record(camBCol)
        rec.set('placa_baldeio', placa)
        rec.set('modelo', modelo)
        rec.set('capacidade_m3', cap)
        rec.set('tipo_carreta', tipo)
        rec.set('status', 'ativo')
        app.save(rec)
        return rec
      }
    }

    const camB1 = seedCaminhaoB(
      'BAL0A11',
      'Transbordo Tratorizado Massey',
      35,
      'Carreta Transbordo Florestal',
    )
    const camB2 = seedCaminhaoB(
      'BAL0A22',
      'Forwarder Ponsse Elephant',
      40,
      'Forwarder Autocarregável',
    )

    // 6. PILHAS (3 a 4 pilhas, incluindo pilha MISTA)
    const pilhasCol = app.findCollectionByNameOrId('pilhas')
    const seedPilha = (cod, nome, fazId, talId, isMista, prod, vol, status) => {
      try {
        return app.findFirstRecordByData('pilhas', 'codigo', cod)
      } catch (_) {
        const rec = new Record(pilhasCol)
        rec.set('codigo', cod)
        rec.set('nome', nome)
        rec.set('fazenda_id', fazId)
        if (talId) rec.set('talhao_id', talId)
        rec.set('is_mista', isMista)
        rec.set('produto', prod)
        rec.set('volume_atual_m3', vol)
        rec.set('status', status)
        app.save(rec)
        return rec
      }
    }

    const pil1 = seedPilha(
      'PIL-01',
      'Pilha Pátio Principal - Eucalipto',
      faz1.id,
      tal1.id,
      false,
      'tora',
      320.5,
      'ativa',
    )
    const pil2 = seedPilha(
      'PIL-02',
      'Pilha Secundária - Talhão 2',
      faz1.id,
      tal2.id,
      false,
      'tora',
      185.0,
      'ativa',
    )
    const pil3 = seedPilha(
      'PIL-03-MISTA',
      'Pilha Mista de Pátio Central',
      faz1.id,
      null,
      true,
      'misto',
      450.0,
      'ativa',
    )
    const pil4 = seedPilha(
      'PIL-04',
      'Pilha Pátio Santa Clara',
      faz2.id,
      tal3.id,
      false,
      'tora',
      210.0,
      'ativa',
    )

    // 7. MOTIVOS
    const motivosCol = app.findCollectionByNameOrId('motivos')
    const seedMotivo = (idMot, equip, motivo, cat) => {
      try {
        return app.findFirstRecordByData('motivos', 'id_motivo', idMot)
      } catch (_) {
        const rec = new Record(motivosCol)
        rec.set('id_motivo', idMot)
        rec.set('equipamento', equip)
        rec.set('motivo', motivo)
        rec.set('categoria', cat)
        rec.set('status', 'ativo')
        app.save(rec)
        return rec
      }
    }

    seedMotivo('MOT-01', 'Geral', 'Diâmetro fora de padrão comercial (< 10cm)', 'rejeicao_tora')
    seedMotivo('MOT-02', 'Geral', 'Presença de pragas / podridão avançada', 'rejeicao_tora')
    seedMotivo('MOT-03', 'Cavaqueiro', 'Umidade acima do teto contratual (> 50%)', 'recusa_cavaco')
    seedMotivo('MOT-04', 'Feller / Skidder', 'Manutenção preventiva programada', 'parada_maquina')
    seedMotivo(
      'MOT-05',
      'Pátio',
      'Divergência dimensional por compactação de pilha',
      'divergencia_estoque',
    )

    // 8. CONVERSOES
    const convTorasCol = app.findCollectionByNameOrId('conversao_sr_toras')
    try {
      app.findFirstRecordByData('conversao_sr_toras', 'versao', 'V1.0-2025')
    } catch (_) {
      const rec = new Record(convTorasCol)
      rec.set('versao', 'V1.0-2025')
      rec.set('vigencia_inicio', '2025-01-01')
      rec.set('fator_m3_sr', 0.84) // 1 SR ≈ 0.84 m³
      rec.set('fator_t_m3', 0.95) // 1 m³ ≈ 0.95 toneladas
      rec.set('metodo', 'Cubagem Huber com calibração empírica de empilhamento')
      rec.set('is_vigente', true)
      rec.set('observacoes', 'Tabela padrão oficial da safra 2025')
      app.save(rec)
    }

    const convCavacoCol = app.findCollectionByNameOrId('conversao_sr_cavaco')
    try {
      app.findFirstRecordByData('conversao_sr_cavaco', 'id_carreta', 'CARRETA-90M3')
    } catch (_) {
      const rec = new Record(convCavacoCol)
      rec.set('id_carreta', 'CARRETA-90M3')
      rec.set('modelo_carreta', 'Cavaqueira Randon 90m³ Basculante')
      rec.set('capacidade_m3', 90)
      rec.set('fator_t_m3', 0.32) // Densidade granel cavaco seco/verde médio
      rec.set('vigencia_inicio', '2025-01-01')
      rec.set('is_vigente', true)
      app.save(rec)
    }

    // 9. PARAMETROS_OPERACIONAIS
    const paramCol = app.findCollectionByNameOrId('parametros_operacionais')
    const seedParam = (chave, desc, origem, destino, base, fator, unidade, versao) => {
      const existing = app.findRecordsByFilter(
        'parametros_operacionais',
        `chave = '${chave}' && versao = '${versao}'`,
        '',
        1,
        0,
      )
      if (existing.length > 0) return existing[0]
      const rec = new Record(paramCol)
      rec.set('chave', chave)
      rec.set('descricao', desc)
      rec.set('etapa_origem', origem)
      rec.set('etapa_destino', destino)
      rec.set('base_comparacao', base)
      rec.set('fator_valor', fator)
      rec.set('unidade', unidade)
      rec.set('versao', versao)
      rec.set('vigencia_inicio', '2025-01-01')
      rec.set('is_vigente', true)
      rec.set('email_alertas', 'henrique@julitago.com.br')
      app.save(rec)
      return rec
    }

    seedParam(
      'reducao_peso_umidade',
      'Redução de peso por perda de umidade no pátio (~16%)',
      'Talhão / Baldeio',
      'Pátio / Descarga',
      'Peso em Toneladas',
      0.84,
      'fator',
      'v1',
    )
    seedParam(
      'reducao_volumetrica',
      'Acomodação e redução volumétrica de empilhamento (~5%)',
      'Descarga',
      'Inventário Pilha',
      'Volume m³',
      0.95,
      'fator',
      'v1',
    )
    seedParam(
      'limiar_divergencia',
      'Limiar percentual para disparo de alerta de conciliação',
      'Saldo Calculado',
      'Inventário Físico',
      '% de divergência',
      5.0,
      '%',
      'v1',
    )

    // 10. Exemplos operacionais de Históricos para testes iniciais
    const convToras = app.findFirstRecordByData('conversao_sr_toras', 'versao', 'V1.0-2025')
    const histBaldeioCol = app.findCollectionByNameOrId('historico_baldeio')
    const histDescargaCol = app.findCollectionByNameOrId('historico_descarga')

    const existingBaldeio = app.findRecordsByFilter(
      'historico_baldeio',
      `numero_viagem = 'VG-001'`,
      '',
      1,
      0,
    )
    if (existingBaldeio.length === 0) {
      const b1 = new Record(histBaldeioCol)
      b1.set('conversao_sr_id', convToras.id)
      b1.set('caminhao_baldeio_id', camB1.id)
      b1.set('talhao_origem_id', tal1.id)
      b1.set('pilha_destino_id', pil1.id)
      b1.set('data_hora_saida', '2025-05-10T08:00')
      b1.set('data_hora_chegada', '2025-05-10T08:45')
      b1.set('volume_sr', 42.0)
      b1.set('volume_m3_estimado', 35.28)
      b1.set('motorista', 'Valdir Moreira')
      b1.set('numero_viagem', 'VG-001')
      b1.set('status_baldeio', 'concluido')
      app.save(b1)
    }

    const existingDescarga = app.findRecordsByFilter(
      'historico_descarga',
      `pilha_destino_id = '${pil1.id}'`,
      '',
      1,
      0,
    )
    if (existingDescarga.length === 0) {
      const d1 = new Record(histDescargaCol)
      d1.set('conversao_sr_id', convToras.id)
      d1.set('caminhao_baldeio_id', camB1.id)
      d1.set('pilha_destino_id', pil1.id)
      d1.set('data_hora_descarga', '2025-05-10T09:00')
      d1.set('volume_sr', 42.0)
      d1.set('volume_m3_calculado', 35.28)
      d1.set('peso_bruto_t', 48.5)
      d1.set('peso_tara_t', 15.0)
      d1.set('peso_liquido_t', 33.5)
      d1.set('status_aceite', 'aceito')
      d1.set('conferente_nome', 'Maria Oliveira')
      app.save(d1)
    }

    // Inventário ToraCerta inicial
    const invCol = app.findCollectionByNameOrId('inventario_pilha')
    const existingInv = app.findRecordsByFilter(
      'inventario_pilha',
      `pilha_id = '${pil1.id}'`,
      '',
      1,
      0,
    )
    if (existingInv.length === 0) {
      const inv1 = new Record(invCol)
      inv1.set('pilha_id', pil1.id)
      inv1.set('talhao_referencia_id', tal1.id)
      inv1.set('data_inventario', '2025-05-10')
      inv1.set('responsavel_nome', 'Henrique Julitago')
      inv1.set('metodo_escolhido', 'geometrico')
      inv1.set('status_registro', 'oficial')
      inv1.set('comp_pilha_m', 45.0)
      inv1.set('alt_media_pilha_m', 3.2)
      inv1.set('comp_toras_m', 3.3)
      inv1.set('v_aparente_m3', 475.2)
      inv1.set('fator_calibracao', 0.7)
      inv1.set('v_solido_geometrico_m3', 332.64)
      inv1.set('volume_oficial_m3', 332.64)
      inv1.set('observacoes', 'Fotografia inicial de calibração do pátio')
      app.save(inv1)
    }
  },
  (app) => {
    // down
  },
)
