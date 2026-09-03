'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronRight, CreditCard, Banknote, Hash, Truck, Check, Store } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCartStore } from '@/store/cart-store'
import { useAuthStore } from '@/store/auth-store'
import { formatPrice, cn } from '@/lib/utils'
import { toast } from '@/components/ui/toast'
import { createOrder, fetchStoreBySlug, paymentLabels, type PaymentMethod, type PaymentType } from '@/lib/api-helpers'

const provinces = [
  'Bengo', 'Benguela', 'Bié', 'Cabinda', 'Cuando-Cubango', 'Cuanza Norte',
  'Cuanza Sul', 'Cunene', 'Huambo', 'Huíla', 'Icolo e Bengo', 'Luanda',
  'Lunda Norte', 'Lunda Sul', 'Malanje', 'Moxico', 'Namibe', 'Uíge', 'Zaire',
]

const methodIcons: Record<string, any> = {
  EXPRESS: CreditCard,
  TRANSFER: Banknote,
  REFERENCE: Hash,
  CASH_ON_DELIVERY: Truck,
}

interface StoreGroup {
  storeId: string
  storeName: string
  items: any[]
  subtotal: number
  paymentMethods: PaymentMethod[]
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, clearCart, syncWithApi } = useCartStore()
  const user = useAuthStore((s) => s.user)
  const [loading, setLoading] = React.useState(false)
  const [groups, setGroups] = React.useState<StoreGroup[]>([])
  const [form, setForm] = React.useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: '',
    province: 'Luanda',
    district: '',
  })
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  React.useEffect(() => {
    let active = true
    const load = async () => {
      const storeMap = new Map<string, { storeId: string; storeName: string; items: any[]; subtotal: number }>()
      for (const item of items) {
        const key = item.storeId || 'local'
        if (!storeMap.has(key)) {
          storeMap.set(key, { storeId: key, storeName: item.storeName || 'Loja', items: [], subtotal: 0 })
        }
        const g = storeMap.get(key)!
        g.items.push(item)
        g.subtotal += item.price * item.quantity
      }
      const loaded: StoreGroup[] = []
      for (const g of storeMap.values()) {
        let paymentMethods: PaymentMethod[] = [{ type: 'CASH_ON_DELIVERY', enabled: true }]
        if (g.storeId !== 'local') {
          try {
            const store = await fetchStoreBySlug(g.storeId)
            if (store.paymentMethods && store.paymentMethods.length > 0) {
              paymentMethods = store.paymentMethods
            }
          } catch {}
        }
        loaded.push({ ...g, paymentMethods })
      }
      if (active) setGroups(loaded)
    }
    load()
    return () => { active = false }
  }, [items])

  const [selected, setSelected] = React.useState<Record<string, PaymentType>>({})

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const validateShipping = () => {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = 'Nome obrigatorio'
    if (!form.phone.trim()) errs.phone = 'Telefone obrigatorio'
    if (!form.address.trim()) errs.address = 'Endereco obrigatorio'
    if (!form.district.trim()) errs.district = 'Distrito/bairro obrigatorio'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async () => {
    if (!validateShipping()) return
    for (const g of groups) {
      const method = selected[g.storeId]
      if (!method) {
        toast(`Escolha o método de pagamento para ${g.storeName}`, 'error')
        return
      }
    }
    setLoading(true)
    try {
      for (const g of groups) {
        const method = selected[g.storeId]!
        await createOrder({
          shippingName: form.name,
          shippingPhone: form.phone,
          shippingAddress: form.address,
          shippingProvince: form.province,
          shippingDistrict: form.district,
          storeId: g.storeId,
          paymentMethod: method,
        })
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
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informações de Envio</h2>
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
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Provincia</label>
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

          {groups.map((group) => (
            <div key={group.storeId} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Store className="h-5 w-5 text-emerald-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{group.storeName}</h2>
              </div>

              <div className="space-y-2 mb-4">
                {group.items.map((item) => (
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

              <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">Metodo de Pagamento</p>
                <div className="space-y-3">
                  {group.paymentMethods.filter((m) => m.enabled !== false).map((method) => {
                    const Icon = methodIcons[method.type] || CreditCard
                    const isSel = selected[group.storeId] === method.type
                    return (
                      <button
                        key={method.type}
                        onClick={() => setSelected((prev) => ({ ...prev, [group.storeId]: method.type }))}
                        className={cn(
                          'flex items-center gap-4 w-full rounded-xl border-2 p-4 text-left transition-all',
                          isSel
                            ? 'border-emerald-500 bg-gray-100 dark:bg-gray-800'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        )}
                      >
                        <div className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-lg',
                          isSel ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300'
                        )}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">{paymentLabels[method.type] || method.type}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-300">{methodTypeDetail(method)}</p>
                        </div>
                        {isSel && (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600">
                            <Check className="h-3.5 w-3.5 text-white" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>

                {selected[group.storeId] && (
                  <PaymentInfo method={group.paymentMethods.find((m) => m.type === selected[group.storeId])!} />
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Resumo do Pedido</h2>
            {groups.map((group) => (
              <div key={group.storeId} className="mb-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{group.storeName}</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatPrice(group.subtotal)}</span>
                </div>
              </div>
            ))}
            <hr className="my-4 border-gray-100 dark:border-gray-700" />
            <div className="flex justify-between mb-6">
              <span className="text-base font-semibold text-gray-900 dark:text-white">Total</span>
              <span className="text-xl font-bold text-emerald-700">{formatPrice(groups.reduce((s, g) => s + g.subtotal, 0))}</span>
            </div>
            <Button className="w-full h-12 text-base" onClick={handleSubmit} disabled={loading}>
              {loading ? 'A processar...' : 'Confirmar Pedidos'}
            </Button>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
              Será criado um pedido por loja. Após o pedido, faça o upload do comprovativo de pagamento.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function methodTypeDetail(method: PaymentMethod): string {
  switch (method.type) {
    case 'EXPRESS':
      return `Pagamento via Multicaixa Express${method.phone ? ` para ${method.phone}` : ''}`
    case 'TRANSFER':
      return method.bankName ? `Transferência para ${method.bankName}` : 'Transferência para conta bancária do vendedor'
    case 'REFERENCE':
      return `Pague com entidade ${method.entity} e referência ${method.reference}`
    case 'CASH_ON_DELIVERY':
      return 'Pague quando receber o produto'
    default:
      return ''
  }
}

function PaymentInfo({ method }: { method: PaymentMethod }) {
  if (method.type === 'CASH_ON_DELIVERY') {
    return (
      <div className="mt-4 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
        <p className="text-sm text-emerald-800 dark:text-emerald-300">
          Efectue o pagamento em dinheiro quando receber o produto.
        </p>
      </div>
    )
  }
  return (
    <div className="mt-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Dados para pagamento</p>
      <PaymentDetailRow label="Método" value={paymentLabels[method.type] || method.type} />
      {method.phone && <PaymentDetailRow label="Telefone" value={method.phone} />}
      {method.ownerName && <PaymentDetailRow label="Titular" value={method.ownerName} />}
      {method.bankName && <PaymentDetailRow label="Banco" value={method.bankName} />}
      {method.iban && <PaymentDetailRow label="IBAN" value={method.iban} />}
      {method.bankAccount && <PaymentDetailRow label="Nº de conta" value={method.bankAccount} />}
      {method.entity && <PaymentDetailRow label="Entidade" value={method.entity} />}
      {method.reference && <PaymentDetailRow label="Referência" value={method.reference} />}
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
        Após efectuar o pagamento, fará o upload do comprovativo no seu pedido.
      </p>
    </div>
  )
}

function PaymentDetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1 text-sm">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span className="font-medium text-gray-900 dark:text-white">{value}</span>
    </div>
  )
}
