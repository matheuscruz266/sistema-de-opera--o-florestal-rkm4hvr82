/* Tipos do Sistema Integrado de Operação Florestal - Fase 1 (Núcleos A, B, C, E) */

export type PapelUsuario = 'admin' | 'operador' | 'conferente'

export interface UserRecord {
  id: string
  email: string
  name?: string
  papel?: PapelUsuario
  status?: boolean
  created?: string
  updated?: string
}

export interface Fazenda {
  id: string
  nome: string
  codigo: string
  uf: string
  cidade?: string
  area_total?: number
  area_plantada?: number
  status: 'ativa' | 'inativa'
  created?: string
  updated?: string
}

export interface Talhao {
  id: string
  talhao: string
  fazenda_id: string
  area_ha?: number
  especie?: string
  data_plantio?: string
  status: 'ativo' | 'cultivo' | 'colheita' | 'concluido' | 'inativa'
  created?: string
  updated?: string
  expand?: {
    fazenda_id?: Fazenda
  }
}

export interface Maquina {
  id: string
  id_maquina: string
  equipamento: string
  tipo: 'feller' | 'skidder' | 'picador' | 'colhedora' | 'outros'
  bt?: string
  usuario_responsavel?: string
  fazenda_id?: string
  status: 'ativa' | 'manutencao' | 'inativa'
  created?: string
  updated?: string
  expand?: {
    fazenda_id?: Fazenda
  }
}

export interface Caminhao {
  id: string
  placa: string
  modelo: string
  capacidade_m3?: number
  renavam?: string
  status: 'ativo' | 'manutencao' | 'inativo'
  created?: string
  updated?: string
}

export interface CaminhaoBaldeio {
  id: string
  placa_baldeio: string
  modelo: string
  capacidade_m3?: number
  tipo_carreta?: string
  status: 'ativo' | 'manutencao' | 'inativo'
  created?: string
  updated?: string
}

export interface Pilha {
  id: string
  codigo: string
  nome?: string
  fazenda_id: string
  talhao_id?: string
  is_mista?: boolean
  produto: 'tora' | 'cavaco' | 'misto'
  volume_atual_m3?: number
  status: 'ativa' | 'inativa' | 'em_consumo' | 'concluido'
  created?: string
  updated?: string
  expand?: {
    fazenda_id?: Fazenda
    talhao_id?: Talhao
  }
}

export interface Motivo {
  id: string
  id_motivo: string
  equipamento?: string
  motivo: string
  categoria: 'rejeicao_tora' | 'recusa_cavaco' | 'parada_maquina' | 'divergencia_estoque' | 'outros'
  status: 'ativo' | 'inativo'
  created?: string
  updated?: string
}

export interface ConversaoSrToras {
  id: string
  versao: string
  vigencia_inicio: string
  vigencia_fim?: string
  fator_m3_sr: number
  fator_t_m3: number
  metodo?: string
  is_vigente: boolean
  observacoes?: string
  created?: string
  updated?: string
}

export interface ConversaoSrCavaco {
  id: string
  id_carreta: string
  modelo_carreta?: string
  capacidade_m3: number
  fator_t_m3: number
  vigencia_inicio: string
  vigencia_fim?: string
  is_vigente: boolean
  created?: string
  updated?: string
}

export interface ParametroOperacional {
  id: string
  chave: string
  descricao: string
  etapa_origem?: string
  etapa_destino?: string
  base_comparacao?: string
  fator_valor: number
  unidade?: string
  versao?: string
  vigencia_inicio?: string
  vigencia_fim?: string
  is_vigente: boolean
  email_alertas?: string
  created?: string
  updated?: string
}

export interface HistoricoFeller {
  id: string
  talhao_id: string
  maquina_id: string
  data_operacao: string
  horas_trabalhadas: number
  combustivel_litros: number
  arvores_derrubadas?: number
  observacoes?: string
  created?: string
  updated?: string
  expand?: {
    talhao_id?: Talhao
    maquina_id?: Maquina
  }
}

export interface HistoricoSkidder {
  id: string
  talhao_id: string
  maquina_id: string
  data_operacao: string
  horas_trabalhadas: number
  combustivel_litros: number
  ciclos_arraste?: number
  observacoes?: string
  created?: string
  updated?: string
  expand?: {
    talhao_id?: Talhao
    maquina_id?: Maquina
  }
}

export interface HistoricoBaldeio {
  id: string
  conversao_sr_id?: string
  caminhao_baldeio_id: string
  talhao_origem_id: string
  pilha_destino_id: string
  data_hora_saida: string
  data_hora_chegada?: string
  volume_sr: number
  volume_m3_estimado?: number
  motorista?: string
  numero_viagem?: string
  status_baldeio: 'em_transito' | 'concluido' | 'cancelado'
  created?: string
  updated?: string
  expand?: {
    conversao_sr_id?: ConversaoSrToras
    caminhao_baldeio_id?: CaminhaoBaldeio
    talhao_origem_id?: Talhao
    pilha_destino_id?: Pilha
  }
}

export interface HistoricoDescarga {
  id: string
  conversao_sr_id?: string
  caminhao_baldeio_id: string
  pilha_destino_id: string
  data_hora_descarga: string
  volume_sr: number
  volume_m3_calculado: number
  peso_bruto_t?: number
  peso_tara_t?: number
  peso_liquido_t?: number
  status_aceite: 'aceito' | 'rejeitado' | 'pendente'
  motivo_rejeicao?: string
  conferente_nome?: string
  created?: string
  updated?: string
  expand?: {
    conversao_sr_id?: ConversaoSrToras
    caminhao_baldeio_id?: CaminhaoBaldeio
    pilha_destino_id?: Pilha
  }
}

export interface HistoricoPicador {
  id: string
  conversao_cavaco_id?: string
  caminhao_id: string
  pilha_origem_id: string
  nota_fiscal: string
  data_hora_expedicao: string
  volume_cavaco_m3: number
  peso_cavaco_t?: number
  volume_tora_consumido_m3: number
  cliente?: string
  umidade_perc?: number
  operador_nome?: string
  created?: string
  updated?: string
  expand?: {
    conversao_cavaco_id?: ConversaoSrCavaco
    caminhao_id?: Caminhao
    pilha_origem_id?: Pilha
  }
}

export interface InventarioPilha {
  id: string
  pilha_id: string
  talhao_referencia_id?: string
  data_inventario: string
  responsavel_nome: string
  metodo_escolhido: 'geometrico' | 'amostragem_diametros'
  status_registro: 'rascunho' | 'oficial' | 'substituido'
  comp_pilha_m?: number
  alt_media_pilha_m?: number
  comp_toras_m?: number
  v_aparente_m3?: number
  fator_calibracao?: number
  v_solido_geometrico_m3?: number
  qtd_toras_amostradas?: number
  diametro_medio_cm?: number
  comp_medio_toras_m?: number
  v_individual_medio_m3?: number
  v_solido_amostragem_m3?: number
  volume_oficial_m3: number
  justificativa_correcao?: string
  registro_substituido_id?: string
  observacoes?: string
  created?: string
  updated?: string
  expand?: {
    pilha_id?: Pilha
    talhao_referencia_id?: Talhao
  }
}

export interface ConciliacaoAlerta {
  id: string
  pilha_id: string
  data_identificacao: string
  saldo_calculado_m3: number
  inventario_fisico_m3: number
  diferenca_m3: number
  diferenca_perc: number
  limiar_aplicado_perc: number
  status: 'pendente' | 'em_investigacao' | 'ajuste_solicitado' | 'resolvido' | 'descartado'
  motivo_divergencia?: string
  responsavel_investigacao?: string
  created?: string
  updated?: string
  expand?: {
    pilha_id?: Pilha
  }
}

export interface ConciliacaoAjuste {
  id: string
  alerta_id?: string
  pilha_id: string
  tipo_ajuste: 'entrada_correcao' | 'baixa_perda' | 'recalibracao_metodo' | 'outros'
  volume_ajustado_m3: number
  justificativa: string
  aprovado_por: string
  data_aprovacao: string
  status_ajuste: 'pendente_aprovacao' | 'aprovado' | 'rejeitado'
  created?: string
  updated?: string
  expand?: {
    alerta_id?: ConciliacaoAlerta
    pilha_id?: Pilha
  }
}

export interface ConciliacaoDivergenciaHist {
  id: string
  alerta_id: string
  etapa_evento: string
  descricao: string
  usuario_nome: string
  data_hora: string
  dados_adicionais?: string
  created?: string
  updated?: string
}

export type TipoIntegracao = 'picador_d2' | 'app_campo' | 'balanca_terceiros' | 'outro'

export interface IntegracaoCredencial {
  id: string
  nome: string
  tipo: TipoIntegracao
  api_key: string
  is_ativa: boolean
  ultimo_uso?: string
  descricao?: string
  created?: string
  updated?: string
}

export type StatusIngestaoLog = 'sucesso' | 'parcial' | 'erro' | 'rejeitado'

export interface IntegracaoLog {
  id: string
  credencial_id?: string
  origem_nome: string
  endpoint: string
  ip_origem?: string
  timestamp_evento: string
  registros_recebidos: number
  registros_aceitos: number
  registros_rejeitados: number
  status: StatusIngestaoLog
  mensagem_erro?: string
  detalhes_json?: string
  created?: string
  updated?: string
  expand?: {
    credencial_id?: IntegracaoCredencial
  }
}

export interface IngestaoD2ItemPayload {
  nota_fiscal?: string
  data_hora_expedicao?: string
  volume_cavaco_m3: number
  peso_cavaco_t?: number
  volume_tora_consumido_m3?: number
  pilha_codigo?: string
  pilha_origem_id?: string
  caminhao_id?: string
  placa?: string
  conversao_cavaco_id?: string
  cliente?: string
  umidade_perc?: number
  operador_nome?: string
}

export interface IngestaoD2Response {
  sucesso: boolean
  status: 'sucesso' | 'parcial' | 'erro'
  mensagem: string
  recebidos: number
  aceitos: number
  rejeitados: number
  itens: Array<{
    indice: number
    nota_fiscal: string
    status: string
    id_registro?: string
    volume_cavaco_m3?: number
    motivo?: string
    mensagem?: string
  }>
  timestamp?: string
}

export interface GoogleSheetsConfigRecord {
  id: string
  nome: string
  spreadsheet_id: string
  sheet_range?: string
  client_email?: string
  project_id?: string
  has_credentials: boolean
  is_ativa: boolean
  sincronizacao_automatica: boolean
  intervalo_minutos?: number
  ultima_sincronizacao?: string
  linhas_ingeridas_total?: number
  ultimo_status?: 'sucesso' | 'erro' | 'parcial' | 'pendente' | string
  ultimo_erro?: string
  created?: string
  updated?: string
}

export interface GoogleServiceAccountKey {
  type: string
  project_id: string
  private_key_id?: string
  private_key: string
  client_email: string
  client_id?: string
  auth_uri?: string
  token_uri?: string
  auth_provider_x509_cert_url?: string
  client_x509_cert_url?: string
  universe_domain?: string
}

export interface GoogleSheetsTestResponse {
  sucesso: boolean
  planilha_id?: string
  range?: string
  linhas_detectadas?: number
  colunas_detectadas?: number
  amostra_cabecalho?: string[]
  mensagem?: string
  erro?: string
  instrucao?: string
}

export interface GoogleSheetsSyncResponse {
  sucesso: boolean
  status: 'sucesso' | 'parcial' | 'erro'
  mensagem: string
  linhas_lidas?: number
  registros_processados?: number
  aceitos: number
  rejeitados: number
  itens: Array<{
    indice: number
    nota_fiscal: string
    status: string
    id_registro?: string
    volume_cavaco_m3?: number
    motivo?: string
    mensagem?: string
  }>
  erro?: string
  instrucao?: string
}

export interface GoogleSheetsImportPreviewSheet {
  name: string
  target: string
  destination: string
  key: string
  mapping: string
  headers: string[]
  rows: number
  creates: number
  updates: number
  skipped: number
  errors: number
  issues: Array<{ row: number; message: string }>
  catalog: boolean
  replacementNote: string
}

export interface GoogleSheetsImportPreview {
  sucesso: boolean
  planilha_id: string
  total_linhas: number
  novos: number
  atualizacoes: number
  ignorados: number
  erros: number
  abas: GoogleSheetsImportPreviewSheet[]
  ordem_importacao: string[]
  observacao: string
}

export interface GoogleSheetsImportResult {
  sucesso: boolean
  status: 'sucesso' | 'parcial' | 'erro'
  mensagem: string
  total: {
    criados: number
    atualizados: number
    ignorados: number
    rejeitados: number
    inativados: number
  }
  abas: Array<{
    name: string
    target: string
    criados: number
    atualizados: number
    ignorados: number
    rejeitados: number
    inativados: number
    issues: Array<{ row: number; message: string }>
  }>
  timestamp: string
  observacao: string
}
