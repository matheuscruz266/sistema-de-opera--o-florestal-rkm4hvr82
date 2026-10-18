import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import { Toaster } from './components/ui/sonner'

// Páginas de Autenticação e Entrada
import Index from './pages/Index'
import Login from './pages/Login'
import AlterarSenhaPrimeiroAcessoPage from './pages/AlterarSenhaPrimeiroAcesso'
import NotFound from './pages/NotFound'

// Dashboard Principal
import DashboardPage from './pages/Dashboard'

// Núcleo A: Cadastros Base
import FazendasPage from './pages/cadastros/Fazendas'
import TalhoesPage from './pages/cadastros/Talhoes'
import MaquinasPage from './pages/cadastros/Maquinas'
import CaminhoesPage from './pages/cadastros/Caminhoes'
import CaminhaoBaldeioPage from './pages/cadastros/CaminhaoBaldeio'
import PilhasPage from './pages/cadastros/Pilhas'
import MotivosPage from './pages/cadastros/Motivos'
import UsuariosPage from './pages/cadastros/Usuarios'
import TrabalhoPage from './pages/cadastros/Trabalho'

// Núcleo A: Históricos Operacionais
import HistoricoFellerPage from './pages/historicos/HistoricoFeller'
import HistoricoSkidderPage from './pages/historicos/HistoricoSkidder'
import HistoricoBaldeioPage from './pages/historicos/HistoricoBaldeio'
import HistoricoDescargaPage from './pages/historicos/HistoricoDescarga'
import HistoricoPicadorPage from './pages/historicos/HistoricoPicador'

// Núcleo B: Tabelas de Conversão & Parâmetros
import ConversaoSrTorasPage from './pages/conversoes/ConversaoSrToras'
import ConversaoSrCavacoPage from './pages/conversoes/ConversaoSrCavaco'
import ParametrosPage from './pages/parametros/Parametros'

// Núcleo C: Inventário ToraCerta & Conciliação de Estoque
import ToraCertaPage from './pages/toracerta/ToraCerta'
import ConciliacaoPage from './pages/conciliacao/Conciliacao'

// Núcleo E: Rastreabilidade Completa
import RastreabilidadePage from './pages/rastreabilidade/Rastreabilidade'

// Integrações de Dados & Ingestão API (Picador D2 & App de Campo)
import IntegracoesPage from './pages/integracoes/Integracoes'

export function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/alterar-senha" element={<AlterarSenhaPrimeiroAcessoPage />} />
          <Route path="/" element={<Index />} />

          {/* Rotas Autenticadas protegidas com Layout Global */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* Operação & Controle (Núcleo C & E) */}
            <Route path="/toracerta" element={<ToraCertaPage />} />
            {/* Alias para manter compatibilidade */}
            <Route path="/inventario" element={<Navigate to="/toracerta" replace />} />
            <Route path="/conciliacao" element={<ConciliacaoPage />} />
            <Route path="/rastreabilidade" element={<RastreabilidadePage />} />

            {/* Conversões & Parâmetros (Núcleo B) */}
            <Route path="/conversoes/sr-toras" element={<ConversaoSrTorasPage />} />
            <Route path="/conversoes/sr-cavaco" element={<ConversaoSrCavacoPage />} />
            <Route path="/parametros" element={<ParametrosPage />} />

            {/* Históricos Operacionais (Núcleo A) */}
            <Route path="/historicos/feller" element={<HistoricoFellerPage />} />
            <Route path="/historicos/skidder" element={<HistoricoSkidderPage />} />
            <Route path="/historicos/baldeio" element={<HistoricoBaldeioPage />} />
            <Route path="/historicos/descarga" element={<HistoricoDescargaPage />} />
            <Route path="/historicos/picador" element={<HistoricoPicadorPage />} />

            {/* Cadastros Base (Núcleo A) */}
            <Route path="/cadastros/fazendas" element={<FazendasPage />} />
            <Route path="/cadastros/talhoes" element={<TalhoesPage />} />
            <Route path="/cadastros/maquinas" element={<MaquinasPage />} />
            <Route path="/cadastros/caminhoes" element={<CaminhoesPage />} />
            <Route path="/cadastros/caminhao-baldeio" element={<CaminhaoBaldeioPage />} />
            <Route path="/cadastros/pilhas" element={<PilhasPage />} />
            <Route path="/cadastros/motivos" element={<MotivosPage />} />
            <Route path="/cadastros/usuarios" element={<UsuariosPage />} />
            <Route path="/cadastros/trabalho" element={<TrabalhoPage />} />

            {/* Administração & Integrações */}
            <Route path="/integracoes" element={<IntegracoesPage />} />
          </Route>

          {/* Rota 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </Router>
  )
}

export default App
