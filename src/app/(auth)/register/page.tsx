'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, User, Store } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/store/auth-store'
import { toast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'

export default function RegisterPage() {
  const router = useRouter()
  const registerWithApi = useAuthStore((s) => s.registerWithApi)
  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [phone, setPhone] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [role, setRole] = React.useState<'buyer' | 'seller'>('buyer')
  const [showPassword, setShowPassword] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = 'Nome obrigatorio'
    if (!email) errs.email = 'Email obrigatorio'
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Email invalido'
    if (password.length < 6) errs.password = 'Minimo 6 caracteres'
    if (password !== confirmPassword) errs.confirmPassword = 'As senhas nao coincidem'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await registerWithApi({
        name,
        email,
        password,
        phone: phone || undefined,
        role: role === 'seller' ? 'SELLER' : 'BUYER',
      })
      toast('Conta criada com sucesso!', 'success')
      router.push('/')
    } catch {
      toast('Erro ao criar conta', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 mb-1">Criar uma conta</h2>
      <p className="text-sm text-gray-500 mb-6">
        Junte-se a milhares de angolanos no Pambala
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nome completo"
          placeholder="Seu nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
        />
        <Input
          label="Email"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />
        <Input
          label="Telefone (opcional)"
          type="tel"
          placeholder="+244 900 000 000"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <div className="relative">
          <Input
            label="Senha"
            type={showPassword ? 'text' : 'password'}
            placeholder="Minimo 6 caracteres"
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
        <Input
          label="Confirmar senha"
          type="password"
          placeholder="Repita a senha"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de conta</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('buyer')}
              className={cn(
                'flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all',
                role === 'buyer'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              )}
            >
              <User className="h-6 w-6" />
              <span className="text-sm font-medium">Comprador</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('seller')}
              className={cn(
                'flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all',
                role === 'seller'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              )}
            >
              <Store className="h-6 w-6" />
              <span className="text-sm font-medium">Vendedor</span>
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full h-11" disabled={loading}>
          {loading ? 'A criar conta...' : 'Criar Conta'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Ja tem conta?{' '}
        <Link href="/login" className="font-semibold text-emerald-600 hover:text-emerald-700">
          Entrar
        </Link>
      </p>
    </div>
  )
}
