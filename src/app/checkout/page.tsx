'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronRight, CreditCard, Banknote, Truck, Check, Smartphone, FileText } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCartStore } from '@/store/cart-store'
import { useAuthStore } from '@/store/auth-store'
import { formatPrice, cn } from '@/lib/utils'
import { toast } from '@/components/ui/toast'
import { createOrder, createAppyPayCharge } from '@/lib/api-helpers'

const provinces = [
  'Bengo', 'Benguela', 'Bié', 'Cabinda', 'Cuando-Cubango', 'Cuanza Norte',
  'Cuanza Sul', 'Cunene', 'Huambo', 'Huíla', 'Icolo e Bengo', 'Luanda',
  'Lunda Norte', 'Lunda Sul', 'Malanje', 'Moxico', 'Namibe', 'Uíge', 'Zaire',
]

const paymentMethods = [
  { id: 'APPY_PAY_GPO', name: 'Multicaixa Express', icon: Smartphone, description: 'Pagamento rapido via Multicaixa Express - recebera um pedido no telemovel' },
  { id: 'APPY_PAY_REF', name: 'Pagamento por Referencia', icon: FileText, description: 'Gere uma referencia de pagamento para efectuar no multicaixa ou banco' },
  { id: 'TRANSFER', name: 'Transferencia Bancaria', icon: Banknote, description: 'Transferencia para conta bancaria do vendedor' },
  { id: 'CASH_ON_DELIVERY', name: 'Pagamento na Entrega', icon: Truck, description: 'Pague quando receber o produto' },
]

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total, clearCart } = useCartStore()
  const user = useAuthStore((s) => s.user)
  const [loading, setLoading] = React.useState(false)
  const [paymentMethod, setPaymentMethod] = React.useState('APPY_PAY_GPO')
  const [paymentPhone, setPaymentPhone] = React.useState(user?.phone || '')
  const [form, setForm] = React.useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: '',
    province: 'Luanda',
    district: '',
  })
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const validateShipping = () => {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = 'Nome obrigatorio'
    if (!form.phone.trim()) errs.phone = 'Telefone obrigatorio'
    if (!form.address.trim()) errs.address = 'Endereco obrigatorio'
    if (!form.district.trim()) errs.district = 'Distrito/bairro obrigatorio'
    if ((paymentMethod === 'APPY_PAY_GPO') && !paymentPhone.trim()) {
      errs.paymentPhone = 'Telefone de pagamento obrigatorio'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async () => {
    if (!validateShipping()) return
    setLoading(true)
    try {
      const order = await createOrder({
        shippingName: form.name,
        shippingPhone: form.phone,
        shippingAddress: form.address,
        shippingProvince: form.province,
        shippingDistrict: form.district,
        paymentMethod: paymentMethod as any,
      })

      if (paymentMethod === 'APPY_PAY_GPO' || paymentMethod === 'APPY_PAY_REF') {
        try {
          const charge = await createAppyPayCharge(order.id, paymentPhone || undefined)
          await clearCart()
          router.push(`/pagamento/${order.orderNumber}?chargeId=${charge.chargeId}&method=${paymentMethod}`)
          return
        } catch (chargeErr: any) {
          toast(chargeErr?.message || 'Erro ao criar cobranca AppyPay', 'error')
          setLoading(false)
          return
        }
      }

      await clearCart()
      toast('Pedido realizado com sucesso!', 'success')
      router.push('/minha-conta/pedidos')
    } catch {
      toast('Erro ao processar pedido', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-emerald-600 transition-colors">Inicio</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-gray-900 dark:text-white font-medium">Checkout</span>
        </nav>
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">O seu carrinho esta vazio.</p>
          <Link href="/produtos">
            <Button>Explorar Produtos</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-emerald-600 transition-colors">Inicio</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/carrinho" className="hover:text-emerald-600 transition-colors">Carrinho</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-gray-900 dark:text-white font-medium">Checkout</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Finalizar Compra</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informacoes de Envio</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nome completo"
                value={form.name}
                onChange={(e) => updateForm('name', e.target.value)}
                error={errors.name}
              />
              <Input
                label="Telefone"
                type="tel"
                placeholder="+244 900 000 000"
                value={form.phone}
                onChange={(e) => updateForm('phone', e.target.value)}
                error={errors.phone}
              />
              <div className="sm:col-span-2">
                <Input
                  label="Endereco completo"
                  placeholder="Rua, numero, referencia..."
                  value={form.address}
                  onChange={(e) => updateForm('address', e.target.value)}
                  error={errors.address}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Provincia</label>
                <select
                  value={form.province}
                  onChange={(e) => updateForm('province', e.target.value)}
                  className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white px-4 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  {provinces.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <Input
                label="Distrito/Bairro"
                value={form.district}
                onChange={(e) => updateForm('district', e.target.value)}
                error={errors.district}
              />
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Metodo de Pagamento</h2>
            <div className="space-y-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon
                return (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={cn(
                      'flex items-center gap-4 w-full rounded-xl border-2 p-4 text-left transition-all',
                      paymentMethod === method.id
                        ? 'border-emerald-500 bg-gray-100 dark:bg-gray-800'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    )}
                  >
                    <div className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-lg',
                      paymentMethod === method.id ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300'
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{method.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-300">{method.description}</p>
                    </div>
                    {paymentMethod === method.id && (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600">
                        <Check className="h-3.5 w-3.5 text-white" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {paymentMethod === 'APPY_PAY_GPO' && (
              <div className="mt-4 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300 mb-3">
                  Numero para receber o pedido de pagamento
                </p>
                <Input
                  label="Telemovel Multicaixa Express"
                  type="tel"
                  placeholder="+244 923 000 000"
                  value={paymentPhone}
                  onChange={(e) => setPaymentPhone(e.target.value)}
                  error={errors.paymentPhone}
                />
                <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-2">
                  Recebera um pedido de pagamento no numero indicado. Confirme com a sua senha no Multicaixa Express.
                </p>
              </div>
            )}

            {paymentMethod === 'APPY_PAY_REF' && (
              <div className="mt-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  Sera gerada uma referencia de pagamento unica. Utilize essa referencia no Multicaixa Express, no ATM ou na app do banco para efectuar o pagamento.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Resumo do Pedido</h2>
            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <Image src={item.image} alt={item.name} width={48} height={48} unoptimized loading="lazy" className="rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">Qtd: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <hr className="my-4 border-gray-100 dark:border-gray-700" />
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                <span className="font-medium text-gray-900 dark:text-white">{formatPrice(total())}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Envio</span>
                <span className="font-medium text-emerald-600">Gratis</span>
              </div>
            </div>
            <hr className="my-4 border-gray-100 dark:border-gray-700" />
            <div className="flex justify-between mb-6">
              <span className="text-base font-semibold text-gray-900 dark:text-white">Total</span>
              <span className="text-xl font-bold text-emerald-700">{formatPrice(total())}</span>
            </div>
            <Button className="w-full h-12 text-base" onClick={handleSubmit} disabled={loading}>
              {loading ? 'A processar...' : (paymentMethod === 'APPY_PAY_GPO' || paymentMethod === 'APPY_PAY_REF') ? 'Efectuar Pagamento' : 'Confirmar Pedido'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
