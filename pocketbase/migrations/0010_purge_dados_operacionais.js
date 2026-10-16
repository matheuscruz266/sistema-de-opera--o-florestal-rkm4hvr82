migrate(
  (app) => {
    // Ordem de dependência estrita para respeitar relações e chaves estrangeiras:
    // 1. Logs de divergência e conciliação
    // 2. Ajustes de conciliação
    // 3. Alertas de conciliação
    // 4. Medições de inventário ToraCerta
    // 5. Históricos de operação (descarga, picador, baldeio, skidder, feller)
    // 6. Cadastros dependentes (pilhas, talhoes)
    // 7. Cadastros de base (motivos, maquinas, caminhoes, caminhao_baldeio, fazendas)
    // 8. Tabelas de conversão e parâmetros operacionais
    // 9. Histórico de ingestão/integração (integracao_logs)
    //
    // PRESERVADOS INTENCIONALMENTE:
    // - users (especialmente henrique@julitago.com.br para manter acesso)
    // - integracao_credenciais (credenciais de API de parceiros/integrações)
    // - google_sheets_config (configuração de conexão da planilha D2)
    // - importador_bases_config (metadados e mapeamentos de importação do Google Sheets)

    const collectionsToPurge = [
      'conciliacao_divergencias_hist',
      'conciliacao_ajustes',
      'conciliacao_alertas',
      'inventario_pilha',
      'historico_descarga',
      'historico_picador',
      'historico_baldeio',
      'historico_skidder',
      'historico_feller',
      'pilhas',
      'talhoes',
      'motivos',
      'maquinas',
      'caminhao_baldeio',
      'caminhoes',
      'fazendas',
      'conversao_sr_cavaco',
      'conversao_sr_toras',
      'parametros_operacionais',
      'integracao_logs',
    ]

    for (let i = 0; i < collectionsToPurge.length; i++) {
      const colName = collectionsToPurge[i]
      try {
        if (app.hasTable(colName)) {
          const col = app.findCollectionByNameOrId(colName)
          app.truncateCollection(col)
        }
      } catch (err) {
        console.log('Aviso ao truncar ' + colName + ':', err)
      }
    }

    // Limpa referências a dados de operação que foram apagados mantendo a configuração intacta
    try {
      if (app.hasTable('google_sheets_config')) {
        const sheetsConfigs = app.findRecordsByFilter('google_sheets_config', '', '', 100, 0)
        for (let s = 0; s < sheetsConfigs.length; s++) {
          const sc = sheetsConfigs[s]
          sc.set('linhas_ingeridas_total', 0)
          sc.set('ultima_sincronizacao', '')
          sc.set('ultimo_status', '')
          sc.set('ultimo_erro', '')
          app.save(sc)
        }
      }
    } catch (_) {}

    try {
      if (app.hasTable('importador_bases_config')) {
        const importadorConfigs = app.findRecordsByFilter('importador_bases_config', '', '', 100, 0)
        for (let m = 0; m < importadorConfigs.length; m++) {
          const ic = importadorConfigs[m]
          ic.set('total_importados', 0)
          ic.set('ultima_importacao', '')
          ic.set('ultimo_status', '')
          ic.set('ultimo_erro', '')
          app.save(ic)
        }
      }
    } catch (_) {}
  },
  (app) => {
    // down: idempotente - não é necessário recriar os dados de seed antigos
  },
)
