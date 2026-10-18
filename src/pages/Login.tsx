import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Trees, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setErrorMsg('Por favor, preencha o e-mail e a senha.')
      return
    }

    setLoading(true)
    setErrorMsg('')
    try {
      const auth = await pb.collection('users').authWithPassword(email.trim(), password)
      toast.success('Login realizado com sucesso!')
      navigate(auth.record.must_change_password ? '/alterar-senha' : '/')
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message || 'Credenciais inválidas. Verifique seu e-mail e senha.')
      toast.error('Falha na autenticação')
    } finally {
      setLoading(false)
    }
  }

  const fillCreds = (demoEmail: string) => {
    setEmail(demoEmail)
    setPassword('Skip@Pass')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7F5] p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#1B5E20] text-white shadow-lg mb-3">
            <Trees className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A2E1A]">Operação Florestal</h1>
          <p className="text-sm text-[#5A6D5A] mt-1">
            Sistema Integrado de Rastreabilidade e Gestão Florestal
          </p>
        </div>

        <Card className="border-[#DDE4DE] shadow-md bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-[#1A2E1A]">Acessar Conta</CardTitle>
            <CardDescription className="text-[#5A6D5A]">
              Informe suas credenciais para acessar o painel operacional.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-[#1A2E1A]">
                  E-mail institucional
                </Label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5A6D5A]" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu.email@julitago.com.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 border-[#DDE4DE] focus-visible:ring-[#1B5E20]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-semibold text-[#1A2E1A]">
                    Senha
                  </Label>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5A6D5A]" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 border-[#DDE4DE] focus-visible:ring-[#1B5E20]"
                    required
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1B5E20] hover:bg-[#14521A] text-white font-medium py-2 h-10 shadow-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Validando acesso...
                  </>
                ) : (
                  'Entrar no Sistema'
                )}
              </Button>

              {/* Acesso rápido para testes de perfil */}
              <div className="w-full pt-3 border-t border-[#DDE4DE]/70 text-center">
                <span className="text-xs text-[#5A6D5A] block mb-2 font-medium">
                  Acesso rápido de demonstração:
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-[11px] h-7 border-[#DDE4DE] text-[#1B5E20] hover:bg-[#E8F5E9]"
                    onClick={() => fillCreds('henrique@julitago.com.br')}
                  >
                    Admin
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-[11px] h-7 border-[#DDE4DE] text-[#1B5E20] hover:bg-[#E8F5E9]"
                    onClick={() => fillCreds('joao.silva@operacao.com.br')}
                  >
                    Operador
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-[11px] h-7 border-[#DDE4DE] text-[#1B5E20] hover:bg-[#E8F5E9]"
                    onClick={() => fillCreds('maria.oliveira@operacao.com.br')}
                  >
                    Conferente
                  </Button>
                </div>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
