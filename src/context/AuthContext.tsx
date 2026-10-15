import React, { createContext, useContext, useEffect, useState } from 'react'
import pb from '@/lib/pocketbase/client'
import { UserRecord, Fazenda } from '@/types/florestal'
import { apiService } from '@/services/florestalApi'

interface AuthContextType {
  user: UserRecord | null
  isLoading: boolean
  fazendaAtiva: Fazenda | null
  fazendas: Fazenda[]
  setFazendaAtiva: (f: Fazenda | null) => void
  refreshFazendas: () => Promise<void>
  logout: () => void
  alertasPendentesCount: number
  refreshAlertasCount: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  fazendaAtiva: null,
  fazendas: [],
  setFazendaAtiva: () => {},
  refreshFazendas: async () => {},
  logout: () => {},
  alertasPendentesCount: 0,
  refreshAlertasCount: async () => {},
})

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [fazendas, setFazendas] = useState<Fazenda[]>([])
  const [fazendaAtiva, setFazendaAtivaState] = useState<Fazenda | null>(null)
  const [alertasPendentesCount, setAlertasPendentesCount] = useState(0)

  const refreshAlertasCount = async () => {
    try {
      const alertas = await apiService.getAlertas()
      const pendentes = alertas.filter(
        (a) => a.status === 'pendente' || a.status === 'em_investigacao',
      )
      setAlertasPendentesCount(pendentes.length)
    } catch (_) {
      // silencioso
    }
  }

  const refreshFazendas = async () => {
    try {
      const list = await apiService.getFazendas()
      setFazendas(list)
      const salvo = localStorage.getItem('siof_fazenda_ativa_id')
      if (salvo) {
        const encontrada = list.find((f) => f.id === salvo)
        if (encontrada) {
          setFazendaAtivaState(encontrada)
          return
        }
      }
      if (list.length > 0 && !fazendaAtiva) {
        setFazendaAtivaState(list[0])
      }
    } catch (err) {
      console.error('Erro ao carregar fazendas:', err)
    }
  }

  const setFazendaAtiva = (f: Fazenda | null) => {
    setFazendaAtivaState(f)
    if (f) {
      localStorage.setItem('siof_fazenda_ativa_id', f.id)
    } else {
      localStorage.removeItem('siof_fazenda_ativa_id')
    }
  }

  useEffect(() => {
    const authRecord = pb.authStore.record
    if (authRecord) {
      setUser({
        id: authRecord.id,
        email: authRecord.email,
        name: authRecord.name || authRecord.email,
        papel: (authRecord.papel as any) || 'operador',
        status: authRecord.status ?? true,
      })
    } else {
      setUser(null)
    }
    setIsLoading(false)

    // Ouvinte do authStore
    const unsub = pb.authStore.onChange((token, model) => {
      if (model) {
        setUser({
          id: model.id,
          email: model.email,
          name: model.name || model.email,
          papel: (model.papel as any) || 'operador',
          status: model.status ?? true,
        })
      } else {
        setUser(null)
      }
    })

    return () => {
      unsub()
    }
  }, [])

  useEffect(() => {
    if (user) {
      refreshFazendas()
      refreshAlertasCount()
    }
  }, [user])

  const logout = () => {
    pb.authStore.clear()
    setUser(null)
    setFazendaAtivaState(null)
    localStorage.removeItem('siof_fazenda_ativa_id')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        fazendaAtiva,
        fazendas,
        setFazendaAtiva,
        refreshFazendas,
        logout,
        alertasPendentesCount,
        refreshAlertasCount,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
