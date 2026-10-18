import React, { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { AlertCircle, KeyRound, Loader2, Trees } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import pb from '@/lib/pocketbase/client'
import { apiService } from '@/services/florestalApi'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function getPasswordErrorMessage(error: any): string {
  const details = error?.data?.data || error?.response?.data?.data
  if (details?.password?.message) return `Senha: ${details.password.message}`
  if (details?.passwordConfirm?.message)
    return `Confirmação de senha: ${details.passwordConfirm.message}`
  return error?.message || 'Não foi possível alterar a senha.'
}

export default function AlterarSenhaPrimeiroAcessoPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const authRecord = pb.authStore.record
  const accountId = user?.id || authRecord?.id
  const accountEmail = user?.email || authRecord?.email
  const mustChangePassword =
    user?.must_change_password ?? authRecord?.must_change_password ?? false

  if (!accountId) return <Navigate to="/login" replace />
  if (!mustChangePassword) return <Navigate to="/" replace />

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setErrorMessage('')

    if (password.length < 12) {
      setErrorMessage('A nova senha deve ter pelo menos 12 caracteres.')
      return
    }
    if (password !== passwordConfirm) {
      setErrorMessage('As senhas informadas não são iguais.')
      return
    }

    setSaving(true)
    try {
      await apiService.alterarSenhaPrimeiroAcesso(accountId, password)
      logout()
      toast.success('Senha alterada. Entre novamente com sua nova senha.')
      navigate('/login', { replace: true })
    } catch (error: any) {
      console.error('Erro ao concluir alteração de senha:', error)
      setErrorMessage(getPasswordErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F5F7F5] p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#1B5E20] text-white shadow-lg mb-3">
            <Trees className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A2E1A]">
            Operação Florestal
          </h1>
        </div>

        <Card className="border-[#DDE4DE] shadow-md bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#1A2E1A]">
              <KeyRound className="w-5 h-5 text-[#1B5E20]" />
              Crie sua senha pessoal
            </CardTitle>
            <CardDescription className="text-[#5A6D5A]">
              Este é seu primeiro acesso. Para continuar, substitua a senha temporária por uma senha
              pessoal com pelo menos 12 caracteres.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="text-sm text-[#5A6D5A]">
                Conta: <strong className="text-[#1A2E1A]">{accountEmail}</strong>
              </div>

              {errorMessage && (
                <div
                  role="alert"
                  className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="new-password">Nova senha</Label>
                <Input
                  autoComplete="new-password"
                  id="new-password"
                  minLength={12}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  type="password"
                  value={password}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirm-password">Confirme a nova senha</Label>
                <Input
                  autoComplete="new-password"
                  id="confirm-password"
                  minLength={12}
                  onChange={(event) => setPasswordConfirm(event.target.value)}
                  required
                  type="password"
                  value={passwordConfirm}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full bg-[#1B5E20] hover:bg-[#14521A] text-white"
                disabled={saving}
                type="submit"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando senha...
                  </>
                ) : (
                  'Salvar senha e continuar'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </main>
  )
}
