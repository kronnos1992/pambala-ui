'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/store/auth-store'
import { toast } from '@/components/ui/toast'

export default function LoginPage() {
  const router = useRouter()
  const login = useAuthStore((s) => s.login)
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [errors, setErrors] = React.useState<{ email?: string; password?: string }>({})

  const validate = () => {
    const errs: typeof errors = {}
    if (!email) errs.email = 'Email obrigatorio'
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Email invalido'
    if (!password) errs.password = 'Senha obrigatoria'
    else if (password.length < 6) errs.password = 'Minimo 6 caracteres'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await new Promise((r) => setTimeout(r, 1000))
      login(
        {
          id: '1',
          name: 'Demo User',
          email,
          role: 'buyer',
        },
        'demo-token-123'
      )
      toast('Bem-vindo ao Pambala!', 'success')
      router.push('/')
    } catch {
      toast('Credenciais invalidas', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = () => {
    setEmail('demo@pambala.ao')
    setPassword('demo123')
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 mb-1">Entrar na sua conta</h2>
      <p className="text-sm text-gray-500 mb-6">
        Bem-vindo de volta ao Pambala
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />
        <div className="relative">
          <Input
            label="Senha"
            type={showPassword ? 'text' : 'password'}
            placeholder="Sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <div className="flex justify-end">
          <button type="button" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
            Esqueceu a senha?
          </button>
        </div>
        <Button type="submit" className="w-full h-11" disabled={loading}>
          {loading ? 'A entrar...' : 'Entrar'}
        </Button>
      </form>

      <div className="mt-4 rounded-lg bg-emerald-50 border border-emerald-100 p-3">
        <button onClick={handleDemoLogin} className="w-full text-left">
          <p className="text-xs font-semibold text-emerald-700">Demo</p>
          <p className="text-xs text-emerald-600">Clique para preencher com credenciais de demonstracao</p>
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-gray-500">
        Nao tem conta?{' '}
        <Link href="/register" className="font-semibold text-emerald-600 hover:text-emerald-700">
          Registar
        </Link>
      </p>
    </div>
  )
}
