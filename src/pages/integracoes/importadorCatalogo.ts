/**
 * Catálogo canônico das bases de dados para importação da planilha "Operação Minas"
 *
 * Mapeamento coluna -> campo destino exato para cada uma das abas da planilha AppSheet:
 * 1. Fazendas (Id_Fazenda, UF, Fazenda, Situação)
 * 2. Maquinas (ID_Maquina, E-mail, Usuario, BT, Equipamento, P_Ordens, Situação)
 * 3. Talhao (Id_talhao, Talhao)
 * 4. Usuarios (ID_Usuario, email, acesso, Colaborador)
 * 5. Motivo (ID_Motivo, Equipamento, Motivo, Status_motivo)
 * 6. Trabalho (ID_trabalho, email_trabalho, Data, Fazenda, P_Ordens, Talhao, Localizacao, Status_Atual)
 * 7. Caminhao_Baldeio (ID_cam_baldeio, Placa_Baldeio, Modelo, Situação)
 * 8. Historico_Feller (id_historico, Email, Operador, Fazenda, Equipamento, Status, veiculo_Abastecimento, Horimetro, Litros, Motivo, Inicio, Fim, Tempo, Talhao, Localizacao, Status_his)
 * 9. Historico_Skidder (id_historico, Email, Operador, Fazenda, Equipamento, Status, veiculo_Abastecimento, Horimetro, Litros, Motivo, Inicio, Fim, Tempo, Talhao, Localizacao, Status_his)
 * 10. Historico_Descarga (id_historico, Email, Operador, Fazenda, Equipamento, Status, veiculo_Abastecimento, Placa_Baldeio, SR_Toras, Horimetro, Litros, Motivo, Inicio, Fim, Tempo, Pilha, Localizacao, Status_his)
 * 11. Historico_picador (id_historico, Email, Fazenda, Picador, Status, veiculo_Abastecimento, Caminhao, SR_Cavaco, Horimetro, Litros, Motivo, Inicio, Fim, Tempo, Pilha, Localizacao, Nota, Status_his)
 * 12. Caminhao (ID_caminhao, Placa, Modelo, Situação)
 * 13. Pilha (Id_pilha, Pilha)
 * 14. Historico_Baldeio (base complementar para baldeio ponto de saída)
 */

export interface CampoCatalogo {
  campo: string
  label: string
  tipo?: 'string' | 'number' | 'date' | 'bool' | 'relation' | 'select' | 'json'
  obrigatorio?: boolean
  sugestoesCabecalho: string[]
}

export interface BaseImportadorCatalogo {
  key: string
  nome: string
  destino: string
  tela: string
  categoria: 'cadastro' | 'operacao' | 'historico'
  ordemPadrao: number
  abaSugerida?: string
  camposDestino: CampoCatalogo[]
}

export const BASES_IMPORTADOR_CATALOGO: BaseImportadorCatalogo[] = [
  // 1. FAZENDAS
  {
    key: 'fazendas',
    nome: 'Fazendas',
    destino: 'fazendas',
    tela: 'Cadastro de Fazendas / Unidades',
    categoria: 'cadastro',
    ordemPadrao: 1,
    abaSugerida: 'Fazendas',
    camposDestino: [
      {
        campo: 'id_appsheet',
        label: 'ID AppSheet (Id_Fazenda)',
        obrigatorio: false,
        sugestoesCabecalho: ['Id_Fazenda', 'id_fazenda', 'IdFazenda', 'ID_Fazenda', 'id_appsheet'],
      },
      {
        campo: 'uf',
        label: 'UF (Estado)',
        obrigatorio: false,
        sugestoesCabecalho: ['UF', 'uf', 'Estado'],
      },
      {
        campo: 'nome',
        label: 'Nome da Fazenda (Fazenda)',
        obrigatorio: true,
        sugestoesCabecalho: ['Fazenda', 'nome', 'fazenda', 'Nome', 'Descricao', 'Propriedade'],
      },
      {
        campo: 'situacao',
        label: 'Situação / Status (Situação)',
        tipo: 'select',
        obrigatorio: false,
        sugestoesCabecalho: ['Situação', 'Situacao', 'situacao', 'status', 'Status', 'Ativo'],
      },
      {
        campo: 'codigo',
        label: 'Código Interno',
        obrigatorio: false,
        sugestoesCabecalho: ['codigo', 'cod', 'sigla', 'tag'],
      },
      {
        campo: 'cidade',
        label: 'Cidade / Município',
        obrigatorio: false,
        sugestoesCabecalho: ['cidade', 'municipio'],
      },
      {
        campo: 'extras',
        label: 'Campos Extras (JSON)',
        tipo: 'json',
        obrigatorio: false,
        sugestoesCabecalho: ['extras'],
      },
    ],
  },

  // 2. MÁQUINAS
  {
    key: 'maquinas',
    nome: 'Maquinas',
    destino: 'maquinas',
    tela: 'Cadastro de Máquinas e Equipamentos',
    categoria: 'cadastro',
    ordemPadrao: 2,
    abaSugerida: 'Maquinas',
    camposDestino: [
      {
        campo: 'id_appsheet',
        label: 'ID AppSheet (ID_Maquina)',
        obrigatorio: false,
        sugestoesCabecalho: ['ID_Maquina', 'id_maquina', 'Id_Maquina', 'IDMaquina'],
      },
      {
        campo: 'email_operador',
        label: 'E-mail do Operador (E-mail)',
        obrigatorio: false,
        sugestoesCabecalho: ['E-mail', 'email', 'Email', 'email_operador'],
      },
      {
        campo: 'usuario_operador',
        label: 'Usuário Operador (Usuario)',
        obrigatorio: false,
        sugestoesCabecalho: ['Usuario', 'usuario', 'usuario_operador', 'operador', 'Operador'],
      },
      {
        campo: 'bt',
        label: 'Código BT / Horímetro Inicial (BT)',
        obrigatorio: false,
        sugestoesCabecalho: ['BT', 'bt', 'Bt'],
      },
      {
        campo: 'equipamento',
        label: 'Equipamento / Descrição (Equipamento)',
        obrigatorio: true,
        sugestoesCabecalho: ['Equipamento', 'equipamento', 'nome', 'descricao', 'modelo'],
      },
      {
        campo: 'p_ordens',
        label: 'P_Ordens Composto (P_Ordens)',
        obrigatorio: false,
        sugestoesCabecalho: ['P_Ordens', 'p_ordens', 'POrdens', 'p_ordem'],
      },
      {
        campo: 'situacao',
        label: 'Situação / Status (Situação)',
        tipo: 'select',
        obrigatorio: false,
        sugestoesCabecalho: ['Situação', 'Situacao', 'situacao', 'status', 'Status'],
      },
      {
        campo: 'tipo',
        label: 'Tipo de Máquina (feller, skidder, picador, etc.)',
        tipo: 'select',
        obrigatorio: false,
        sugestoesCabecalho: ['tipo', 'categoria'],
      },
      {
        campo: 'localizacao',
        label: 'Localização (lat/long ou texto)',
        obrigatorio: false,
        sugestoesCabecalho: ['localizacao', 'Localizacao', 'Localização', 'coordenadas'],
      },
      {
        campo: 'extras',
        label: 'Campos Extras (JSON)',
        tipo: 'json',
        obrigatorio: false,
        sugestoesCabecalho: ['extras'],
      },
    ],
  },

  // 3. TALHÕES
  {
    key: 'talhoes',
    nome: 'Talhao',
    destino: 'talhoes',
    tela: 'Cadastro de Talhões Florestais',
    categoria: 'cadastro',
    ordemPadrao: 3,
    abaSugerida: 'Talhao',
    camposDestino: [
      {
        campo: 'id_appsheet',
        label: 'ID AppSheet (Id_talhao)',
        obrigatorio: false,
        sugestoesCabecalho: ['Id_talhao', 'id_talhao', 'IdTalhao', 'ID_Talhao'],
      },
      {
        campo: 'talhao',
        label: 'Talhão / Identificação (Talhao)',
        obrigatorio: true,
        sugestoesCabecalho: ['Talhao', 'talhao', 'Talhão', 'nome', 'codigo'],
      },
      {
        campo: 'fazenda_id',
        label: 'Fazenda (ID ou Nome)',
        tipo: 'relation',
        obrigatorio: false,
        sugestoesCabecalho: ['fazenda_id', 'fazenda', 'Fazenda', 'id_fazenda'],
      },
      {
        campo: 'area_ha',
        label: 'Área (Hectares)',
        tipo: 'number',
        obrigatorio: false,
        sugestoesCabecalho: ['area_ha', 'area', 'areaha', 'ha'],
      },
      {
        campo: 'especie',
        label: 'Espécie / Clone',
        obrigatorio: false,
        sugestoesCabecalho: ['especie', 'clone', 'variedade'],
      },
      {
        campo: 'localizacao',
        label: 'Localização (lat/long ou texto)',
        obrigatorio: false,
        sugestoesCabecalho: ['localizacao', 'Localizacao', 'Localização'],
      },
      {
        campo: 'extras',
        label: 'Campos Extras (JSON)',
        tipo: 'json',
        obrigatorio: false,
        sugestoesCabecalho: ['extras'],
      },
    ],
  },

  // 4. USUÁRIOS
  {
    key: 'usuarios',
    nome: 'Usuarios',
    destino: 'users',
    tela: 'Usuário e Papéis de Acesso',
    categoria: 'cadastro',
    ordemPadrao: 4,
    abaSugerida: 'Usuarios',
    camposDestino: [
      {
        campo: 'id_appsheet',
        label: 'ID AppSheet (ID_Usuario)',
        obrigatorio: false,
        sugestoesCabecalho: ['ID_Usuario', 'id_usuario', 'IDUsuario', 'Id_Usuario'],
      },
      {
        campo: 'email',
        label: 'E-mail de Acesso (email)',
        obrigatorio: true,
        sugestoesCabecalho: ['email', 'Email', 'E-mail', 'login'],
      },
      {
        campo: 'acesso',
        label: 'Papel de Acesso (acesso)',
        tipo: 'select',
        obrigatorio: false,
        sugestoesCabecalho: ['acesso', 'Acesso', 'papel', 'role', 'perfil'],
      },
      {
        campo: 'name',
        label: 'Nome do Colaborador (Colaborador)',
        obrigatorio: true,
        sugestoesCabecalho: ['Colaborador', 'colaborador', 'name', 'nome', 'Usuario'],
      },
      {
        campo: 'colaborador',
        label: 'Identificação Colaborador',
        obrigatorio: false,
        sugestoesCabecalho: ['Colaborador', 'colaborador'],
      },
      {
        campo: 'extras',
        label: 'Campos Extras (JSON)',
        tipo: 'json',
        obrigatorio: false,
        sugestoesCabecalho: ['extras'],
      },
    ],
  },

  // 5. MOTIVOS
  {
    key: 'motivos',
    nome: 'Motivo',
    destino: 'motivos',
    tela: 'Motivos e Justificativas de Ocorrência',
    categoria: 'cadastro',
    ordemPadrao: 5,
    abaSugerida: 'Motivo',
    camposDestino: [
      {
        campo: 'id_appsheet',
        label: 'ID AppSheet (ID_Motivo)',
        obrigatorio: false,
        sugestoesCabecalho: ['ID_Motivo', 'id_motivo', 'Id_Motivo', 'IDMotivo'],
      },
      {
        campo: 'id_motivo',
        label: 'Código do Motivo',
        obrigatorio: false,
        sugestoesCabecalho: ['ID_Motivo', 'id_motivo', 'codigo'],
      },
      {
        campo: 'equipamento_categoria',
        label: 'Equipamento Categoria (Equipamento: Picador / Feller-Skidder)',
        obrigatorio: false,
        sugestoesCabecalho: [
          'Equipamento',
          'equipamento',
          'equipamento_categoria',
          'categoria_equipamento',
        ],
      },
      {
        campo: 'motivo',
        label: 'Descrição do Motivo (Motivo)',
        obrigatorio: true,
        sugestoesCabecalho: ['Motivo', 'motivo', 'descricao', 'nome'],
      },
      {
        campo: 'status_motivo',
        label: 'Status do Motivo (Status_motivo)',
        tipo: 'select',
        obrigatorio: false,
        sugestoesCabecalho: [
          'Status_motivo',
          'status_motivo',
          'StatusMotivo',
          'status',
          'situacao',
        ],
      },
      {
        campo: 'extras',
        label: 'Campos Extras (JSON)',
        tipo: 'json',
        obrigatorio: false,
        sugestoesCabecalho: ['extras'],
      },
    ],
  },

  // 6. TRABALHO (APONTAMENTOS DE ENTRADA NO APP)
  {
    key: 'trabalho',
    nome: 'Trabalho',
    destino: 'trabalho',
    tela: 'Trabalho / Apontamentos de Entrada',
    categoria: 'operacao',
    ordemPadrao: 6,
    abaSugerida: 'Trabalho',
    camposDestino: [
      {
        campo: 'id_appsheet',
        label: 'ID AppSheet (ID_trabalho)',
        obrigatorio: true,
        sugestoesCabecalho: ['ID_trabalho', 'id_trabalho', 'Id_trabalho', 'IDTrabalho'],
      },
      {
        campo: 'email_trabalho',
        label: 'E-mail do Apontamento (email_trabalho)',
        obrigatorio: false,
        sugestoesCabecalho: ['email_trabalho', 'email', 'Email_Trabalho', 'Email'],
      },
      {
        campo: 'data',
        label: 'Data do Apontamento (Data)',
        tipo: 'date',
        obrigatorio: false,
        sugestoesCabecalho: ['Data', 'data', 'Data_Hora', 'data_trabalho'],
      },
      {
        campo: 'fazenda_id',
        label: 'Fazenda (Ref por ID ou Nome)',
        tipo: 'relation',
        obrigatorio: false,
        sugestoesCabecalho: ['Fazenda', 'fazenda', 'id_fazenda', 'fazenda_id'],
      },
      {
        campo: 'p_ordens',
        label: 'P_Ordens (Código BT / Máquina)',
        obrigatorio: false,
        sugestoesCabecalho: ['P_Ordens', 'p_ordens', 'POrdens', 'p_ordem'],
      },
      {
        campo: 'talhao_id',
        label: 'Talhão (Ref por ID ou Nome)',
        tipo: 'relation',
        obrigatorio: false,
        sugestoesCabecalho: ['Talhao', 'talhao', 'Talhão', 'id_talhao', 'talhao_id'],
      },
      {
        campo: 'localizacao',
        label: 'Localização (Localizacao lat/long)',
        obrigatorio: false,
        sugestoesCabecalho: ['Localizacao', 'localizacao', 'Localização', 'coordenadas'],
      },
      {
        campo: 'status_atual',
        label: 'Status Atual (Status_Atual)',
        obrigatorio: false,
        sugestoesCabecalho: ['Status_Atual', 'status_atual', 'StatusAtual', 'status'],
      },
      {
        campo: 'extras',
        label: 'Campos Extras (JSON)',
        tipo: 'json',
        obrigatorio: false,
        sugestoesCabecalho: ['extras'],
      },
    ],
  },

  // 7. CAMINHÃO BALDEIO
  {
    key: 'caminhao_baldeio',
    nome: 'Caminhao_Baldeio',
    destino: 'caminhao_baldeio',
    tela: 'Caminhões / Tratores de Baldeio',
    categoria: 'cadastro',
    ordemPadrao: 7,
    abaSugerida: 'Caminhao_Baldeio',
    camposDestino: [
      {
        campo: 'id_appsheet',
        label: 'ID AppSheet (ID_cam_baldeio)',
        obrigatorio: false,
        sugestoesCabecalho: ['ID_cam_baldeio', 'id_cam_baldeio', 'Id_cam_baldeio', 'ID_baldeio'],
      },
      {
        campo: 'placa_baldeio',
        label: 'Placa Baldeio (Placa_Baldeio)',
        obrigatorio: true,
        sugestoesCabecalho: ['Placa_Baldeio', 'placa_baldeio', 'Placa', 'placa'],
      },
      {
        campo: 'modelo',
        label: 'Modelo do Veículo (Modelo)',
        obrigatorio: false,
        sugestoesCabecalho: ['Modelo', 'modelo', 'equipamento', 'descricao'],
      },
      {
        campo: 'situacao',
        label: 'Situação / Status (Situação)',
        tipo: 'select',
        obrigatorio: false,
        sugestoesCabecalho: ['Situação', 'Situacao', 'situacao', 'status', 'Status'],
      },
      {
        campo: 'extras',
        label: 'Campos Extras (JSON)',
        tipo: 'json',
        obrigatorio: false,
        sugestoesCabecalho: ['extras'],
      },
    ],
  },

  // 8. HISTÓRICO FELLER
  {
    key: 'historico_feller',
    nome: 'Historico_Feller',
    destino: 'historico_feller',
    tela: 'Histórico Operacional - Feller Buncher',
    categoria: 'historico',
    ordemPadrao: 8,
    abaSugerida: 'Historico_Feller',
    camposDestino: [
      {
        campo: 'id_appsheet',
        label: 'ID Histórico AppSheet (id_historico)',
        obrigatorio: false,
        sugestoesCabecalho: ['id_historico', 'id_historico_feller', 'ID_Historico', 'Id_Historico'],
      },
      {
        campo: 'email_registro',
        label: 'Email do Registro (Email)',
        obrigatorio: false,
        sugestoesCabecalho: ['Email', 'email', 'E-mail', 'email_registro'],
      },
      {
        campo: 'operador',
        label: 'Operador Responsável (Operador)',
        obrigatorio: false,
        sugestoesCabecalho: ['Operador', 'operador', 'motorista', 'usuario'],
      },
      {
        campo: 'fazenda_id',
        label: 'Fazenda (Fazenda)',
        tipo: 'relation',
        obrigatorio: false,
        sugestoesCabecalho: ['Fazenda', 'fazenda', 'id_fazenda', 'fazenda_id'],
      },
      {
        campo: 'maquina_id',
        label: 'Equipamento / Máquina (Equipamento)',
        tipo: 'relation',
        obrigatorio: false,
        sugestoesCabecalho: ['Equipamento', 'equipamento', 'maquina', 'maquina_id'],
      },
      {
        campo: 'status_evento',
        label: 'Status do Evento (Status)',
        obrigatorio: false,
        sugestoesCabecalho: ['Status', 'status', 'status_evento'],
      },
      {
        campo: 'veiculo_abastecimento',
        label: 'Veículo de Abastecimento (veiculo_Abastecimento)',
        obrigatorio: false,
        sugestoesCabecalho: [
          'veiculo_Abastecimento',
          'veiculo_abastecimento',
          'Veiculo_Abastecimento',
        ],
      },
      {
        campo: 'horimetro',
        label: 'Horímetro (Horimetro)',
        tipo: 'number',
        obrigatorio: false,
        sugestoesCabecalho: ['Horimetro', 'horimetro', 'Horímetro'],
      },
      {
        campo: 'litros',
        label: 'Litros Combustível (Litros)',
        tipo: 'number',
        obrigatorio: false,
        sugestoesCabecalho: ['Litros', 'litros', 'diesel', 'combustivel'],
      },
      {
        campo: 'motivo_id',
        label: 'Motivo de Parada (Motivo)',
        tipo: 'relation',
        obrigatorio: false,
        sugestoesCabecalho: ['Motivo', 'motivo', 'id_motivo', 'motivo_id'],
      },
      {
        campo: 'inicio',
        label: 'Início do Evento (Inicio)',
        tipo: 'date',
        obrigatorio: false,
        sugestoesCabecalho: ['Inicio', 'inicio', 'Início', 'data_inicio', 'data_hora'],
      },
      {
        campo: 'fim',
        label: 'Fim do Evento (Fim)',
        tipo: 'date',
        obrigatorio: false,
        sugestoesCabecalho: ['Fim', 'fim', 'data_fim'],
      },
      {
        campo: 'tempo',
        label: 'Tempo / Duração HH:MM:SS (Tempo)',
        obrigatorio: false,
        sugestoesCabecalho: ['Tempo', 'tempo', 'duracao'],
      },
      {
        campo: 'talhao_id',
        label: 'Talhão (Talhao)',
        tipo: 'relation',
        obrigatorio: false,
        sugestoesCabecalho: ['Talhao', 'talhao', 'Talhão', 'id_talhao', 'talhao_id'],
      },
      {
        campo: 'localizacao',
        label: 'Localização lat/long (Localizacao)',
        obrigatorio: false,
        sugestoesCabecalho: ['Localizacao', 'localizacao', 'Localização'],
      },
      {
        campo: 'status_his',
        label: 'Status Histórico (Status_his)',
        obrigatorio: false,
        sugestoesCabecalho: ['Status_his', 'status_his', 'StatusHis', 'status'],
      },
      {
        campo: 'extras',
        label: 'Campos Extras (JSON)',
        tipo: 'json',
        obrigatorio: false,
        sugestoesCabecalho: ['extras'],
      },
    ],
  },

  // 9. HISTÓRICO SKIDDER
  {
    key: 'historico_skidder',
    nome: 'Historico_Skidder',
    destino: 'historico_skidder',
    tela: 'Histórico Operacional - Skidder (Arraste)',
    categoria: 'historico',
    ordemPadrao: 9,
    abaSugerida: 'Historico_Skidder',
    camposDestino: [
      {
        campo: 'id_appsheet',
        label: 'ID Histórico AppSheet (id_historico)',
        obrigatorio: false,
        sugestoesCabecalho: [
          'id_historico',
          'id_historico_skidder',
          'ID_Historico',
          'Id_Historico',
        ],
      },
      {
        campo: 'email_registro',
        label: 'Email do Registro (Email)',
        obrigatorio: false,
        sugestoesCabecalho: ['Email', 'email', 'E-mail', 'email_registro'],
      },
      {
        campo: 'operador',
        label: 'Operador Responsável (Operador)',
        obrigatorio: false,
        sugestoesCabecalho: ['Operador', 'operador', 'motorista', 'usuario'],
      },
      {
        campo: 'fazenda_id',
        label: 'Fazenda (Fazenda)',
        tipo: 'relation',
        obrigatorio: false,
        sugestoesCabecalho: ['Fazenda', 'fazenda', 'id_fazenda', 'fazenda_id'],
      },
      {
        campo: 'maquina_id',
        label: 'Equipamento / Máquina (Equipamento)',
        tipo: 'relation',
        obrigatorio: false,
        sugestoesCabecalho: ['Equipamento', 'equipamento', 'maquina', 'maquina_id'],
      },
      {
        campo: 'status_evento',
        label: 'Status do Evento (Status)',
        obrigatorio: false,
        sugestoesCabecalho: ['Status', 'status', 'status_evento'],
      },
      {
        campo: 'veiculo_abastecimento',
        label: 'Veículo de Abastecimento (veiculo_Abastecimento)',
        obrigatorio: false,
        sugestoesCabecalho: [
          'veiculo_Abastecimento',
          'veiculo_abastecimento',
          'Veiculo_Abastecimento',
        ],
      },
      {
        campo: 'horimetro',
        label: 'Horímetro (Horimetro)',
        tipo: 'number',
        obrigatorio: false,
        sugestoesCabecalho: ['Horimetro', 'horimetro', 'Horímetro'],
      },
      {
        campo: 'litros',
        label: 'Litros Combustível (Litros)',
        tipo: 'number',
        obrigatorio: false,
        sugestoesCabecalho: ['Litros', 'litros', 'diesel', 'combustivel'],
      },
      {
        campo: 'motivo_id',
        label: 'Motivo de Parada (Motivo)',
        tipo: 'relation',
        obrigatorio: false,
        sugestoesCabecalho: ['Motivo', 'motivo', 'id_motivo', 'motivo_id'],
      },
      {
        campo: 'inicio',
        label: 'Início do Evento (Inicio)',
        tipo: 'date',
        obrigatorio: false,
        sugestoesCabecalho: ['Inicio', 'inicio', 'Início', 'data_inicio', 'data_hora'],
      },
      {
        campo: 'fim',
        label: 'Fim do Evento (Fim)',
        tipo: 'date',
        obrigatorio: false,
        sugestoesCabecalho: ['Fim', 'fim', 'data_fim'],
      },
      {
        campo: 'tempo',
        label: 'Tempo / Duração HH:MM:SS (Tempo)',
        obrigatorio: false,
        sugestoesCabecalho: ['Tempo', 'tempo', 'duracao'],
      },
      {
        campo: 'talhao_id',
        label: 'Talhão (Talhao)',
        tipo: 'relation',
        obrigatorio: false,
        sugestoesCabecalho: ['Talhao', 'talhao', 'Talhão', 'id_talhao', 'talhao_id'],
      },
      {
        campo: 'localizacao',
        label: 'Localização lat/long (Localizacao)',
        obrigatorio: false,
        sugestoesCabecalho: ['Localizacao', 'localizacao', 'Localização'],
      },
      {
        campo: 'status_his',
        label: 'Status Histórico (Status_his)',
        obrigatorio: false,
        sugestoesCabecalho: ['Status_his', 'status_his', 'StatusHis', 'status'],
      },
      {
        campo: 'extras',
        label: 'Campos Extras (JSON)',
        tipo: 'json',
        obrigatorio: false,
        sugestoesCabecalho: ['extras'],
      },
    ],
  },

  // 10. HISTÓRICO DE DESCARGA
  {
    key: 'historico_descarga',
    nome: 'Historico_Descarga',
    destino: 'historico_descarga',
    tela: 'Histórico de Descarga (Recebimento no Pátio)',
    categoria: 'historico',
    ordemPadrao: 10,
    abaSugerida: 'Historico_Descarga',
    camposDestino: [
      {
        campo: 'id_appsheet',
        label: 'ID Histórico AppSheet (id_historico)',
        obrigatorio: false,
        sugestoesCabecalho: ['id_historico', 'ID_Historico', 'Id_Historico'],
      },
      {
        campo: 'email_registro',
        label: 'Email do Registro (Email)',
        obrigatorio: false,
        sugestoesCabecalho: ['Email', 'email', 'E-mail', 'email_registro'],
      },
      {
        campo: 'operador',
        label: 'Operador Responsável (Operador)',
        obrigatorio: false,
        sugestoesCabecalho: ['Operador', 'operador', 'motorista', 'usuario'],
      },
      {
        campo: 'fazenda_id',
        label: 'Fazenda (Fazenda)',
        tipo: 'relation',
        obrigatorio: false,
        sugestoesCabecalho: ['Fazenda', 'fazenda', 'id_fazenda', 'fazenda_id'],
      },
      {
        campo: 'maquina_id',
        label: 'Equipamento / Máquina (Equipamento)',
        tipo: 'relation',
        obrigatorio: false,
        sugestoesCabecalho: ['Equipamento', 'equipamento', 'maquina', 'maquina_id'],
      },
      {
        campo: 'status_evento',
        label: 'Status do Evento (Status: Descargar, etc.)',
        obrigatorio: false,
        sugestoesCabecalho: ['Status', 'status', 'status_evento'],
      },
      {
        campo: 'veiculo_abastecimento',
        label: 'Veículo de Abastecimento (veiculo_Abastecimento)',
        obrigatorio: false,
        sugestoesCabecalho: ['veiculo_Abastecimento', 'veiculo_abastecimento'],
      },
      {
        campo: 'caminhao_baldeio_id',
        label: 'Caminhão de Baldeio por Placa (Placa_Baldeio)',
        tipo: 'relation',
        obrigatorio: false,
        sugestoesCabecalho: ['Placa_Baldeio', 'placa_baldeio', 'caminhao_baldeio_id', 'caminhao'],
      },
      {
        campo: 'sr_toras_tipo',
        label: 'Tipo ou Volume de SR Toras (SR_Toras)',
        obrigatorio: false,
        sugestoesCabecalho: ['SR_Toras', 'sr_toras', 'sr_toras_tipo', 'volume_sr'],
      },
      {
        campo: 'horimetro',
        label: 'Horímetro (Horimetro)',
        tipo: 'number',
        obrigatorio: false,
        sugestoesCabecalho: ['Horimetro', 'horimetro', 'Horímetro'],
      },
      {
        campo: 'litros',
        label: 'Litros Combustível (Litros)',
        tipo: 'number',
        obrigatorio: false,
        sugestoesCabecalho: ['Litros', 'litros', 'combustivel'],
      },
      {
        campo: 'motivo_id',
        label: 'Motivo (Motivo)',
        tipo: 'relation',
        obrigatorio: false,
        sugestoesCabecalho: ['Motivo', 'motivo', 'id_motivo'],
      },
      {
        campo: 'inicio',
        label: 'Início do Evento (Inicio)',
        tipo: 'date',
        obrigatorio: false,
        sugestoesCabecalho: ['Inicio', 'inicio', 'data_hora_descarga', 'data_hora'],
      },
      {
        campo: 'fim',
        label: 'Fim do Evento (Fim)',
        tipo: 'date',
        obrigatorio: false,
        sugestoesCabecalho: ['Fim', 'fim'],
      },
      {
        campo: 'tempo',
        label: 'Tempo / Duração HH:MM:SS (Tempo)',
        obrigatorio: false,
        sugestoesCabecalho: ['Tempo', 'tempo'],
      },
      {
        campo: 'pilha_destino_id',
        label: 'Pilha Destino (Pilha)',
        tipo: 'relation',
        obrigatorio: false,
        sugestoesCabecalho: ['Pilha', 'pilha', 'pilha_destino_id', 'codigo_pilha'],
      },
      {
        campo: 'localizacao',
        label: 'Localização lat/long (Localizacao)',
        obrigatorio: false,
        sugestoesCabecalho: ['Localizacao', 'localizacao', 'Localização'],
      },
      {
        campo: 'status_his',
        label: 'Status Histórico (Status_his)',
        obrigatorio: false,
        sugestoesCabecalho: ['Status_his', 'status_his', 'StatusHis', 'status'],
      },
      {
        campo: 'extras',
        label: 'Campos Extras (JSON)',
        tipo: 'json',
        obrigatorio: false,
        sugestoesCabecalho: ['extras'],
      },
    ],
  },

  // 11. HISTÓRICO PICADOR
  {
    key: 'historico_picador',
    nome: 'Historico_picador',
    destino: 'historico_picador',
    tela: 'Consumo no Picador & Expedição de Cavaco',
    categoria: 'historico',
    ordemPadrao: 11,
    abaSugerida: 'Historico_picador',
    camposDestino: [
      {
        campo: 'id_appsheet',
        label: 'ID Histórico AppSheet (id_historico)',
        obrigatorio: false,
        sugestoesCabecalho: ['id_historico', 'ID_Historico', 'Id_Historico'],
      },
      {
        campo: 'email_registro',
        label: 'Email do Registro (Email)',
        obrigatorio: false,
        sugestoesCabecalho: ['Email', 'email', 'E-mail', 'email_registro'],
      },
      {
        campo: 'fazenda_id',
        label: 'Fazenda (Fazenda)',
        tipo: 'relation',
        obrigatorio: false,
        sugestoesCabecalho: ['Fazenda', 'fazenda', 'id_fazenda', 'fazenda_id'],
      },
      {
        campo: 'picador_maquina_id',
        label: 'Picador Máquina por BT/P_Ordens (Picador)',
        tipo: 'relation',
        obrigatorio: false,
        sugestoesCabecalho: ['Picador', 'picador', 'maquina_picador', 'bt_picador'],
      },
      {
        campo: 'status_evento',
        label: 'Status do Evento (Status: Carregamento, Sem Operação, etc.)',
        obrigatorio: false,
        sugestoesCabecalho: ['Status', 'status', 'status_evento'],
      },
      {
        campo: 'veiculo_abastecimento',
        label: 'Veículo de Abastecimento (veiculo_Abastecimento)',
        obrigatorio: false,
        sugestoesCabecalho: ['veiculo_Abastecimento', 'veiculo_abastecimento'],
      },
      {
        campo: 'caminhao_id',
        label: 'Caminhão Rodoviário por Placa (Caminhao)',
        tipo: 'relation',
        obrigatorio: false,
        sugestoesCabecalho: ['Caminhao', 'caminhao', 'placa', 'Caminhão'],
      },
      {
        campo: 'sr_cavaco_texto',
        label: 'SR Cavaco / Tipo Carreta (SR_Cavaco)',
        obrigatorio: false,
        sugestoesCabecalho: ['SR_Cavaco', 'sr_cavaco', 'SR Cavaco'],
      },
      {
        campo: 'horimetro',
        label: 'Horímetro (Horimetro)',
        tipo: 'number',
        obrigatorio: false,
        sugestoesCabecalho: ['Horimetro', 'horimetro', 'Horímetro'],
      },
      {
        campo: 'litros',
        label: 'Litros Combustível (Litros)',
        tipo: 'number',
        obrigatorio: false,
        sugestoesCabecalho: ['Litros', 'litros', 'combustivel'],
      },
      {
        campo: 'motivo_id',
        label: 'Motivo (Motivo)',
        tipo: 'relation',
        obrigatorio: false,
        sugestoesCabecalho: ['Motivo', 'motivo', 'id_motivo'],
      },
      {
        campo: 'inicio',
        label: 'Início do Evento (Inicio)',
        tipo: 'date',
        obrigatorio: false,
        sugestoesCabecalho: ['Inicio', 'inicio', 'data_hora_expedicao', 'data_hora'],
      },
      {
        campo: 'fim',
        label: 'Fim do Evento (Fim)',
        tipo: 'date',
        obrigatorio: false,
        sugestoesCabecalho: ['Fim', 'fim'],
      },
      {
        campo: 'tempo',
        label: 'Tempo / Duração HH:MM:SS (Tempo)',
        obrigatorio: false,
        sugestoesCabecalho: ['Tempo', 'tempo'],
      },
      {
        campo: 'pilha_origem_id',
        label: 'Pilha Origem (Pilha)',
        tipo: 'relation',
        obrigatorio: false,
        sugestoesCabecalho: ['Pilha', 'pilha', 'pilha_origem_id', 'codigo_pilha'],
      },
      {
        campo: 'localizacao',
        label: 'Localização lat/long (Localizacao)',
        obrigatorio: false,
        sugestoesCabecalho: ['Localizacao', 'localizacao', 'Localização'],
      },
      {
        campo: 'nota_fiscal',
        label: 'Nota Fiscal / Ticket (Nota)',
        obrigatorio: false,
        sugestoesCabecalho: ['Nota', 'nota', 'nota_fiscal', 'ticket', 'nf'],
      },
      {
        campo: 'status_his',
        label: 'Status Histórico (Status_his)',
        obrigatorio: false,
        sugestoesCabecalho: ['Status_his', 'status_his', 'StatusHis', 'status'],
      },
      {
        campo: 'extras',
        label: 'Campos Extras (JSON)',
        tipo: 'json',
        obrigatorio: false,
        sugestoesCabecalho: ['extras'],
      },
    ],
  },

  // 12. CAMINHÃO RODOVIÁRIO
  {
    key: 'caminhao',
    nome: 'Caminhao',
    destino: 'caminhoes',
    tela: 'Caminhões Rodoviários (Cavaco / Toras)',
    categoria: 'cadastro',
    ordemPadrao: 12,
    abaSugerida: 'Caminhao',
    camposDestino: [
      {
        campo: 'id_appsheet',
        label: 'ID AppSheet (ID_caminhao)',
        obrigatorio: false,
        sugestoesCabecalho: ['ID_caminhao', 'id_caminhao', 'Id_caminhao', 'IDCaminhao'],
      },
      {
        campo: 'placa',
        label: 'Placa do Veículo (Placa)',
        obrigatorio: true,
        sugestoesCabecalho: ['Placa', 'placa', 'placa_caminhao', 'veiculo'],
      },
      {
        campo: 'modelo',
        label: 'Modelo do Caminhão (Modelo)',
        obrigatorio: false,
        sugestoesCabecalho: ['Modelo', 'modelo', 'marca', 'tipo_veiculo'],
      },
      {
        campo: 'situacao',
        label: 'Situação / Status (Situação)',
        tipo: 'select',
        obrigatorio: false,
        sugestoesCabecalho: ['Situação', 'Situacao', 'situacao', 'status', 'Status'],
      },
      {
        campo: 'capacidade_m3',
        label: 'Capacidade (m³)',
        tipo: 'number',
        obrigatorio: false,
        sugestoesCabecalho: ['capacidade_m3', 'capacidade', 'volume'],
      },
      {
        campo: 'extras',
        label: 'Campos Extras (JSON)',
        tipo: 'json',
        obrigatorio: false,
        sugestoesCabecalho: ['extras'],
      },
    ],
  },

  // 13. PILHA
  {
    key: 'pilha',
    nome: 'Pilha',
    destino: 'pilhas',
    tela: 'Cadastro de Pilhas (Pátio Florestal)',
    categoria: 'cadastro',
    ordemPadrao: 13,
    abaSugerida: 'Pilha',
    camposDestino: [
      {
        campo: 'id_appsheet',
        label: 'ID AppSheet (Id_pilha)',
        obrigatorio: false,
        sugestoesCabecalho: ['Id_pilha', 'id_pilha', 'IdPilha', 'ID_Pilha'],
      },
      {
        campo: 'nome',
        label: 'Nome / Identificação da Pilha (Pilha)',
        obrigatorio: true,
        sugestoesCabecalho: ['Pilha', 'pilha', 'nome', 'descricao', 'codigo'],
      },
      {
        campo: 'codigo',
        label: 'Código da Pilha',
        obrigatorio: false,
        sugestoesCabecalho: ['codigo', 'codigo_pilha', 'Pilha', 'pilha'],
      },
      {
        campo: 'fazenda_id',
        label: 'Fazenda (ID ou Nome)',
        tipo: 'relation',
        obrigatorio: false,
        sugestoesCabecalho: ['fazenda_id', 'fazenda', 'id_fazenda'],
      },
      {
        campo: 'localizacao',
        label: 'Localização lat/long',
        obrigatorio: false,
        sugestoesCabecalho: ['localizacao', 'Localizacao', 'Localização'],
      },
      {
        campo: 'extras',
        label: 'Campos Extras (JSON)',
        tipo: 'json',
        obrigatorio: false,
        sugestoesCabecalho: ['extras'],
      },
    ],
  },

  // 14. HISTÓRICO DE BALDEIO COMPLEMENTAR
  {
    key: 'historico_baldeio',
    nome: 'Historico_Baldeio',
    destino: 'historico_baldeio',
    tela: 'Histórico de Baldeio (Ponto de Saída do Talhão)',
    categoria: 'historico',
    ordemPadrao: 14,
    abaSugerida: 'Historico_Baldeio',
    camposDestino: [
      {
        campo: 'id_appsheet',
        label: 'ID Histórico AppSheet',
        obrigatorio: false,
        sugestoesCabecalho: ['id_historico', 'ID_Historico', 'Id_Historico'],
      },
      {
        campo: 'caminhao_baldeio_id',
        label: 'Caminhão/Trator de Baldeio (Placa ou Ref)',
        tipo: 'relation',
        obrigatorio: false,
        sugestoesCabecalho: ['caminhao_baldeio_id', 'caminhao_baldeio', 'placa_baldeio', 'baldeio'],
      },
      {
        campo: 'talhao_origem_id',
        label: 'Talhão Origem',
        tipo: 'relation',
        obrigatorio: false,
        sugestoesCabecalho: ['talhao_origem_id', 'talhao', 'talhao_origem', 'origem'],
      },
      {
        campo: 'pilha_destino_id',
        label: 'Pilha Destino',
        tipo: 'relation',
        obrigatorio: false,
        sugestoesCabecalho: ['pilha_destino_id', 'pilha', 'pilha_destino', 'destino'],
      },
      {
        campo: 'data_hora_saida',
        label: 'Data/Hora de Saída',
        obrigatorio: false,
        sugestoesCabecalho: ['data_hora_saida', 'data_saida', 'data_hora', 'data', 'inicio'],
      },
      {
        campo: 'volume_sr',
        label: 'Volume Estéreo (SR)',
        tipo: 'number',
        obrigatorio: false,
        sugestoesCabecalho: ['volume_sr', 'volume', 'sr', 'volume_estereo', 'sr_toras'],
      },
      {
        campo: 'localizacao',
        label: 'Localização lat/long',
        obrigatorio: false,
        sugestoesCabecalho: ['localizacao', 'Localizacao', 'Localização'],
      },
      {
        campo: 'extras',
        label: 'Campos Extras (JSON)',
        tipo: 'json',
        obrigatorio: false,
        sugestoesCabecalho: ['extras'],
      },
    ],
  },
]
