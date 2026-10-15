import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import {
  Trees,
  LayoutDashboard,
  Building2,
  MapPin,
  Tractor,
  Truck,
  Layers,
  HelpCircle,
  Users,
  Clock,
  ArrowRightLeft,
  ArrowDownToLine,
  Flame,
  Scale,
  ClipboardCheck,
  Settings,
  GitBranch,
  Bell,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Compass,
  FileSpreadsheet,
  KeyRound,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function Layout() {
  const { user, fazendaAtiva, fazendas, setFazendaAtiva, logout, alertasPendentesCount } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [cadastrosOpen, setCadastrosOpen] = useState(true)
  const [historicosOpen, setHistoricosOpen] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const closeMobile = () => setMobileMenuOpen(false)

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F5F7F5] text-[#1A2E1A]">
      {/* SIDEBAR DESKTOP */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-[#DDE4DE] shrink-0 select-none shadow-sm">
        {/* Topo / Logo */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-[#DDE4DE]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#1B5E20] text-white flex items-center justify-center shadow-sm">
              <Trees className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-[#1A2E1A] block leading-tight">
                Operação Florestal
              </span>
              <span className="text-[10px] text-[#5A6D5A] font-medium tracking-wider uppercase block">
                Fase 1 • Núcleos A+B+C+E
              </span>
            </div>
          </div>
        </div>

        {/* Links de navegação com scroll suave */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 text-xs">
          {/* Dashboard Geral */}
          <div>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-all ${
                  isActive
                    ? 'bg-[#E8F5E9] text-[#1B5E20] shadow-xs'
                    : 'text-[#5A6D5A] hover:bg-neutral-100 hover:text-[#1A2E1A]'
                }`
              }
            >
              <LayoutDashboard className="w-4 h-4 text-[#1B5E20]" />
              <span className="text-sm">Dashboard</span>
            </NavLink>
          </div>

          {/* NÚCLEO C & E: OPERAÇÃO, CONCILIAÇÃO & RASTREABILIDADE */}
          <div className="space-y-1">
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#5A6D5A]">
              Operação & Controle
            </span>
            <NavLink
              to="/toracerta"
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-all ${
                  isActive
                    ? 'bg-[#E8F5E9] text-[#1B5E20]'
                    : 'text-[#5A6D5A] hover:bg-neutral-100 hover:text-[#1A2E1A]'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <Compass className="w-4 h-4 text-[#FF8F00]" />
                <span className="text-sm">Inventário ToraCerta</span>
              </div>
              <Badge
                variant="outline"
                className="text-[9px] px-1.5 py-0 border-[#FF8F00] text-[#FF8F00]"
              >
                C
              </Badge>
            </NavLink>

            <NavLink
              to="/conciliacao"
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-all ${
                  isActive
                    ? 'bg-[#E8F5E9] text-[#1B5E20]'
                    : 'text-[#5A6D5A] hover:bg-neutral-100 hover:text-[#1A2E1A]'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <Scale className="w-4 h-4 text-[#C62828]" />
                <span className="text-sm">Conciliação de Estoque</span>
              </div>
              {alertasPendentesCount > 0 && (
                <Badge className="bg-[#C62828] text-white text-[10px] px-1.5 py-0">
                  {alertasPendentesCount}
                </Badge>
              )}
            </NavLink>

            <NavLink
              to="/rastreabilidade"
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-all ${
                  isActive
                    ? 'bg-[#E8F5E9] text-[#1B5E20]'
                    : 'text-[#5A6D5A] hover:bg-neutral-100 hover:text-[#1A2E1A]'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <GitBranch className="w-4 h-4 text-[#1565C0]" />
                <span className="text-sm">Rastreabilidade Cadeia</span>
              </div>
            </NavLink>
          </div>

          {/* NÚCLEO B: TABELAS DE CONVERSÃO */}
          <div className="space-y-1">
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#5A6D5A]">
              Núcleo B • Conversões
            </span>
            <NavLink
              to="/conversoes/sr-toras"
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-all ${
                  isActive
                    ? 'bg-[#E8F5E9] text-[#1B5E20]'
                    : 'text-[#5A6D5A] hover:bg-neutral-100 hover:text-[#1A2E1A]'
                }`
              }
            >
              <FileSpreadsheet className="w-4 h-4 text-[#1B5E20]" />
              <span className="text-sm">SR_Toras (m³ e t)</span>
            </NavLink>
            <NavLink
              to="/conversoes/sr-cavaco"
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-all ${
                  isActive
                    ? 'bg-[#E8F5E9] text-[#1B5E20]'
                    : 'text-[#5A6D5A] hover:bg-neutral-100 hover:text-[#1A2E1A]'
                }`
              }
            >
              <Truck className="w-4 h-4 text-[#1B5E20]" />
              <span className="text-sm">SR_Cavaco (Carretas)</span>
            </NavLink>
            <NavLink
              to="/parametros"
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-all ${
                  isActive
                    ? 'bg-[#E8F5E9] text-[#1B5E20]'
                    : 'text-[#5A6D5A] hover:bg-neutral-100 hover:text-[#1A2E1A]'
                }`
              }
            >
              <Settings className="w-4 h-4 text-[#5A6D5A]" />
              <span className="text-sm">Parâmetros Operacionais</span>
            </NavLink>
          </div>

          {/* HISTÓRICOS OPERACIONAIS (NÚCLEO A) */}
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setHistoricosOpen(!historicosOpen)}
              className="w-full flex items-center justify-between px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#5A6D5A] hover:text-[#1A2E1A]"
            >
              <span>Históricos Operacionais (5)</span>
              <ChevronDown
                className={`w-3 h-3 transition-transform ${historicosOpen ? '' : '-rotate-90'}`}
              />
            </button>
            {historicosOpen && (
              <div className="space-y-0.5 pl-1">
                <NavLink
                  to="/historicos/feller"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-[#E8F5E9] text-[#1B5E20] font-semibold'
                        : 'text-[#5A6D5A] hover:bg-neutral-100'
                    }`
                  }
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Histórico Feller</span>
                </NavLink>
                <NavLink
                  to="/historicos/skidder"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-[#E8F5E9] text-[#1B5E20] font-semibold'
                        : 'text-[#5A6D5A] hover:bg-neutral-100'
                    }`
                  }
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Histórico Skidder</span>
                </NavLink>
                <NavLink
                  to="/historicos/baldeio"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-[#E8F5E9] text-[#1B5E20] font-semibold'
                        : 'text-[#5A6D5A] hover:bg-neutral-100'
                    }`
                  }
                >
                  <ArrowRightLeft className="w-3.5 h-3.5 text-[#1565C0]" />
                  <span>Baldeio (Saída Talhão)</span>
                </NavLink>
                <NavLink
                  to="/historicos/descarga"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-[#E8F5E9] text-[#1B5E20] font-semibold'
                        : 'text-[#5A6D5A] hover:bg-neutral-100'
                    }`
                  }
                >
                  <ArrowDownToLine className="w-3.5 h-3.5 text-[#2E7D32]" />
                  <span>Descarga (Pátio/Aceite)</span>
                </NavLink>
                <NavLink
                  to="/historicos/picador"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-[#E8F5E9] text-[#1B5E20] font-semibold'
                        : 'text-[#5A6D5A] hover:bg-neutral-100'
                    }`
                  }
                >
                  <Flame className="w-3.5 h-3.5 text-[#FF8F00]" />
                  <span>Picador / NF Expedição</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* CADASTROS BASE (NÚCLEO A) */}
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setCadastrosOpen(!cadastrosOpen)}
              className="w-full flex items-center justify-between px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#5A6D5A] hover:text-[#1A2E1A]"
            >
              <span>Cadastros Base (8)</span>
              <ChevronDown
                className={`w-3 h-3 transition-transform ${cadastrosOpen ? '' : '-rotate-90'}`}
              />
            </button>
            {cadastrosOpen && (
              <div className="space-y-0.5 pl-1">
                <NavLink
                  to="/cadastros/fazendas"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-[#E8F5E9] text-[#1B5E20] font-semibold'
                        : 'text-[#5A6D5A] hover:bg-neutral-100'
                    }`
                  }
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Fazendas</span>
                </NavLink>
                <NavLink
                  to="/cadastros/talhoes"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-[#E8F5E9] text-[#1B5E20] font-semibold'
                        : 'text-[#5A6D5A] hover:bg-neutral-100'
                    }`
                  }
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Talhões</span>
                </NavLink>
                <NavLink
                  to="/cadastros/maquinas"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-[#E8F5E9] text-[#1B5E20] font-semibold'
                        : 'text-[#5A6D5A] hover:bg-neutral-100'
                    }`
                  }
                >
                  <Tractor className="w-3.5 h-3.5" />
                  <span>Máquinas</span>
                </NavLink>
                <NavLink
                  to="/cadastros/caminhoes"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-[#E8F5E9] text-[#1B5E20] font-semibold'
                        : 'text-[#5A6D5A] hover:bg-neutral-100'
                    }`
                  }
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Caminhões Rodoviários</span>
                </NavLink>
                <NavLink
                  to="/cadastros/caminhao-baldeio"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-[#E8F5E9] text-[#1B5E20] font-semibold'
                        : 'text-[#5A6D5A] hover:bg-neutral-100'
                    }`
                  }
                >
                  <Truck className="w-3.5 h-3.5 text-[#1565C0]" />
                  <span>Caminhões Baldeio</span>
                </NavLink>
                <NavLink
                  to="/cadastros/pilhas"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-[#E8F5E9] text-[#1B5E20] font-semibold'
                        : 'text-[#5A6D5A] hover:bg-neutral-100'
                    }`
                  }
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Pilhas (Pátio & Mistas)</span>
                </NavLink>
                <NavLink
                  to="/cadastros/motivos"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-[#E8F5E9] text-[#1B5E20] font-semibold'
                        : 'text-[#5A6D5A] hover:bg-neutral-100'
                    }`
                  }
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Motivos de Ocorrência</span>
                </NavLink>
                <NavLink
                  to="/cadastros/usuarios"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-[#E8F5E9] text-[#1B5E20] font-semibold'
                        : 'text-[#5A6D5A] hover:bg-neutral-100'
                    }`
                  }
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Usuários & Papéis</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* ADMINISTRAÇÃO & INTEGRAÇÕES */}
          <div className="space-y-1">
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#5A6D5A]">
              Administração
            </span>
            <NavLink
              to="/integracoes"
              className={({ isActive }) =>
                `flex items-center justify-between gap-2.5 px-3 py-2 rounded-lg font-medium transition-all ${
                  isActive
                    ? 'bg-[#E8F5E9] text-[#1B5E20]'
                    : 'text-[#5A6D5A] hover:bg-neutral-100 hover:text-[#1A2E1A]'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <KeyRound className="w-4 h-4 text-[#1B5E20]" />
                <span className="text-sm">Integração & API</span>
              </div>
              <Badge
                variant="outline"
                className="text-[9px] px-1.5 py-0 border-emerald-600 text-emerald-700 bg-emerald-50"
              >
                D2 Toledo
              </Badge>
            </NavLink>
          </div>
        </div>

        {/* Rodapé Usuário */}
        <div className="p-3 border-t border-[#DDE4DE] bg-neutral-50 flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-[#1B5E20] text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
              {user?.name ? user.name.slice(0, 2) : 'OF'}
            </div>
            <div className="overflow-hidden">
              <span className="text-xs font-semibold text-[#1A2E1A] truncate block">
                {user?.name || user?.email}
              </span>
              <span className="text-[10px] text-[#5A6D5A] capitalize block">
                Papel: {user?.papel || 'operador'}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            title="Sair do sistema"
            className="text-[#5A6D5A] hover:text-[#C62828] hover:bg-red-50 h-8 w-8"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* HEADER SUPERIOR */}
        <header className="h-16 bg-white border-b border-[#DDE4DE] px-4 lg:px-6 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-[#1A2E1A]"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>

            {/* Seletor de Fazenda Global */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#5A6D5A] hidden sm:inline">
                Fazenda Ativa:
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-2 text-xs font-semibold border-[#DDE4DE] text-[#1A2E1A] hover:bg-[#E8F5E9]"
                  >
                    <Building2 className="w-3.5 h-3.5 text-[#1B5E20]" />
                    <span>
                      {fazendaAtiva
                        ? `${fazendaAtiva.codigo} - ${fazendaAtiva.nome}`
                        : 'Todas as Fazendas'}
                    </span>
                    <ChevronDown className="w-3 h-3 text-[#5A6D5A]" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64">
                  <DropdownMenuLabel className="text-xs text-[#5A6D5A]">
                    Filtrar visão operacional por fazenda
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setFazendaAtiva(null)}
                    className="text-xs font-medium cursor-pointer"
                  >
                    Visualizar Todas as Fazendas
                  </DropdownMenuItem>
                  {fazendas.map((f) => (
                    <DropdownMenuItem
                      key={f.id}
                      onClick={() => setFazendaAtiva(f)}
                      className={`text-xs cursor-pointer ${fazendaAtiva?.id === f.id ? 'bg-[#E8F5E9] font-bold text-[#1B5E20]' : ''}`}
                    >
                      <span className="font-mono text-[11px] mr-1.5 opacity-70">[{f.codigo}]</span>
                      {f.nome} ({f.uf})
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Lado direito do Header: Badge de alertas + Usuário */}
          <div className="flex items-center gap-3">
            <NavLink
              to="/conciliacao"
              className="relative p-2 rounded-lg text-[#5A6D5A] hover:bg-neutral-100 hover:text-[#1A2E1A] transition-colors"
              title="Alertas de divergência de estoque"
            >
              <Bell className="w-5 h-5" />
              {alertasPendentesCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#C62828] text-[9px] font-bold text-white animate-pulse">
                  {alertasPendentesCount}
                </span>
              )}
            </NavLink>

            <div className="h-6 w-px bg-[#DDE4DE] hidden sm:block" />

            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs text-[#5A6D5A]">
                Olá,{' '}
                <strong className="text-[#1A2E1A]">{user?.name?.split(' ')[0] || 'Usuário'}</strong>
              </span>
              <Badge
                variant="outline"
                className="text-[10px] uppercase font-semibold border-[#1B5E20] text-[#1B5E20]"
              >
                {user?.papel || 'operador'}
              </Badge>
            </div>
          </div>
        </header>

        {/* CONTEÚDO PRINCIPAL (ROTA) */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-[#F5F7F5]">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>

        {/* RODAPÉ DO SISTEMA */}
        <footer className="h-8 border-t border-[#DDE4DE] bg-white px-4 flex items-center justify-between text-[11px] text-[#5A6D5A] shrink-0">
          <span>Sistema Integrado de Operação Florestal • v1.1</span>
          <span className="hidden sm:inline">
            Rastreabilidade Florestal • Sem balança própria • Núcleos A+B+C+E
          </span>
        </footer>
      </div>

      {/* DRAWER MOBILE */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={closeMobile} />
          <div className="relative w-72 bg-white h-full flex flex-col z-10 shadow-2xl">
            <div className="h-16 px-4 flex items-center justify-between border-b border-[#DDE4DE]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#1B5E20] text-white flex items-center justify-center">
                  <Trees className="w-5 h-5" />
                </div>
                <span className="font-bold text-sm text-[#1A2E1A]">Operação Florestal</span>
              </div>
              <Button variant="ghost" size="icon" onClick={closeMobile}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs" onClick={closeMobile}>
              <NavLink
                to="/dashboard"
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium text-sm text-[#1B5E20] bg-[#E8F5E9]"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard Geral
              </NavLink>

              <div className="space-y-1">
                <span className="px-3 text-[10px] font-bold uppercase text-[#5A6D5A]">
                  Operação
                </span>
                <NavLink
                  to="/toracerta"
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-[#1A2E1A]"
                >
                  <Compass className="w-4 h-4 text-[#FF8F00]" />
                  Inventário ToraCerta
                </NavLink>
                <NavLink
                  to="/conciliacao"
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-[#1A2E1A]"
                >
                  <Scale className="w-4 h-4 text-[#C62828]" />
                  Conciliação & Alertas
                </NavLink>
                <NavLink
                  to="/rastreabilidade"
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-[#1A2E1A]"
                >
                  <GitBranch className="w-4 h-4 text-[#1565C0]" />
                  Rastreabilidade Cadeia
                </NavLink>
              </div>

              <div className="space-y-1">
                <span className="px-3 text-[10px] font-bold uppercase text-[#5A6D5A]">
                  Conversões
                </span>
                <NavLink
                  to="/conversoes/sr-toras"
                  className="flex items-center gap-2 px-3 py-1.5 text-xs text-[#1A2E1A]"
                >
                  SR_Toras
                </NavLink>
                <NavLink
                  to="/conversoes/sr-cavaco"
                  className="flex items-center gap-2 px-3 py-1.5 text-xs text-[#1A2E1A]"
                >
                  SR_Cavaco
                </NavLink>
                <NavLink
                  to="/parametros"
                  className="flex items-center gap-2 px-3 py-1.5 text-xs text-[#1A2E1A]"
                >
                  Parâmetros
                </NavLink>
              </div>

              <div className="space-y-1">
                <span className="px-3 text-[10px] font-bold uppercase text-[#5A6D5A]">
                  Históricos
                </span>
                <NavLink to="/historicos/feller" className="block px-3 py-1 text-xs text-[#5A6D5A]">
                  Feller
                </NavLink>
                <NavLink
                  to="/historicos/skidder"
                  className="block px-3 py-1 text-xs text-[#5A6D5A]"
                >
                  Skidder
                </NavLink>
                <NavLink
                  to="/historicos/baldeio"
                  className="block px-3 py-1 text-xs text-[#5A6D5A]"
                >
                  Baldeio
                </NavLink>
                <NavLink
                  to="/historicos/descarga"
                  className="block px-3 py-1 text-xs text-[#5A6D5A]"
                >
                  Descarga
                </NavLink>
                <NavLink
                  to="/historicos/picador"
                  className="block px-3 py-1 text-xs text-[#5A6D5A]"
                >
                  Picador
                </NavLink>
              </div>

              <div className="space-y-1">
                <span className="px-3 text-[10px] font-bold uppercase text-[#5A6D5A]">
                  Cadastros
                </span>
                <NavLink
                  to="/cadastros/fazendas"
                  className="block px-3 py-1 text-xs text-[#5A6D5A]"
                >
                  Fazendas
                </NavLink>
                <NavLink to="/cadastros/talhoes" className="block px-3 py-1 text-xs text-[#5A6D5A]">
                  Talhões
                </NavLink>
                <NavLink
                  to="/cadastros/maquinas"
                  className="block px-3 py-1 text-xs text-[#5A6D5A]"
                >
                  Máquinas
                </NavLink>
                <NavLink
                  to="/cadastros/caminhoes"
                  className="block px-3 py-1 text-xs text-[#5A6D5A]"
                >
                  Caminhões
                </NavLink>
                <NavLink
                  to="/cadastros/caminhao-baldeio"
                  className="block px-3 py-1 text-xs text-[#5A6D5A]"
                >
                  Caminhões Baldeio
                </NavLink>
                <NavLink to="/cadastros/pilhas" className="block px-3 py-1 text-xs text-[#5A6D5A]">
                  Pilhas
                </NavLink>
                <NavLink to="/cadastros/motivos" className="block px-3 py-1 text-xs text-[#5A6D5A]">
                  Motivos
                </NavLink>
                <NavLink
                  to="/cadastros/usuarios"
                  className="block px-3 py-1 text-xs text-[#5A6D5A]"
                >
                  Usuários
                </NavLink>
              </div>

              <div className="space-y-1">
                <span className="px-3 text-[10px] font-bold uppercase text-[#5A6D5A]">
                  Administração
                </span>
                <NavLink
                  to="/integracoes"
                  className="block px-3 py-1 text-xs font-semibold text-[#1B5E20]"
                >
                  Integração & API (D2 Toledo)
                </NavLink>
              </div>
            </div>

            <div className="p-3 border-t border-[#DDE4DE] flex items-center justify-between">
              <span className="text-xs font-semibold text-[#1A2E1A]">{user?.name}</span>
              <Button size="sm" variant="ghost" onClick={handleLogout} className="text-red-600">
                Sair
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
