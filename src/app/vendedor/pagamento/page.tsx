'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronRight, CreditCard, Banknote, Hash, Truck, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/toast'
import { fetchStorePaymentMethods, updateStorePaymentMethods, paymentLabels, type PaymentMethod, type PaymentType } from '@/lib/api-helpers'

const methodIcons: Record<string, any> = {
  EXPRESS: CreditCard,
  TRANSFER: Banknote,
  REFERENCE: Hash,
  CASH_ON_DELIVERY: Truck,
}

const methodDescriptions: Record<string, string> = {
  EXPRESS: 'O cliente paga via Multicaixa Express para o seu telefone.',
  TRANSFER: 'O cliente transfere para a sua conta bancária.',
  REFERENCE: 'O cliente paga usando entidade e referência (multicaixa, ATM ou app do banco).',
  CASH_ON_DELIVERY: 'O cliente paga em dinheiro ao receber o produto.',
}

const initialMethods = (): PaymentMethod[] => [
  { type: 'EXPRESS', enabled: false, phone: '' },
  { type: 'TRANSFER', enabled: false, phone: '', ownerName: '', bankName: '', iban: '', bankAccount: '' },
  { type: 'REFERENCE', enabled: false, entity: '', reference: '' },
  { type: 'CASH_ON_DELIVERY', enabled: true },
]

export default function VendorPaymentPage() {
  const router = useRouter()
  const [methods, setMethods] = React.useState<PaymentMethod[]>(initialMethods())
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    fetchStorePaymentMethods()
      .then((data) => {
        if (data && data.length > 0) {
          const merged = initialMethods().map((base) => {
            const found = data.find((m) => m.type === base.type)
            return found ? { ...base, ...found } : base
          })
          setMethods(merged)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const toggle = (type: PaymentType) => {
    setMethods((prev) => prev.map((m) => (m.type === type ? { ...m, enabled: !m.enabled } : m)))
  }

  const setField = (type: PaymentType, field: string, value: string) => {
    setMethods((prev) => prev.map((m) => (m.type === type ? { ...m, [field]: value } : m)))
  }

  const handleSave = async () => {
    const payload = methods.filter((m) => m.type === 'CASH_ON_DELIVERY' || m.enabled === true)
    setSaving(true)
    try {
      await updateStorePaymentMethods(payload)
      toast('Formas de pagamento actualizadas!', 'success')
      router.push('/vendedor/pagamento')
    } catch {
      toast('Erro ao guardar formas de pagamento', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6">
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-emerald-600 transition-colors">Inicio</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/vendedor" className="hover:text-emerald-600 transition-colors">Painel do Vendedor</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-gray-900 dark:text-white font-medium">Formas de Pagamento</span>
      </nav>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Formas de Pagamento</h1>
        <Link href="/vendedor">
          <Button variant="outline" size="sm">Voltar</Button>
        </Link>
      </div>

      <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
        Configure as formas de pagamento que disponibiliza aos seus clientes. Os clientes verão apenas as opções activadas.
      </p>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {methods.map((method) => {
            const Icon = methodIcons[method.type]
            return (
              <Card key={method.type}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => toggle(method.type)}
                      className={cn(
                        'mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all',
                        method.enabled ? 'border-emerald-600 bg-emerald-600' : 'border-gray-300'
                      )}
                    >
                      {method.enabled && <Check className="h-3.5 w-3.5 text-white" />}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          'flex h-9 w-9 items-center justify-center rounded-lg',
                          method.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'
                        )}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{paymentLabels[method.type] || method.type}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{methodDescriptions[method.type]}</p>
                        </div>
                      </div>

                      {method.enabled && method.type !== 'CASH_ON_DELIVERY' && (
                        <MethodFields method={method} setField={setField} />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          <div className="flex justify-end pt-2">
            <Button onClick={handleSave} disabled={saving} className="h-11 px-8">
              {saving ? 'A guardar...' : 'Guardar Alterações'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function MethodFields({ method, setField }: { method: PaymentMethod; setField: (type: PaymentType, field: string, value: string) => void }) {
  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => setField(method.type, field, e.target.value)
  return (
    <div className="mt-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 grid grid-cols-1 sm:grid-cols-2 gap-4">
      {method.type === 'EXPRESS' && (
        <Input label="Telefone Multicaixa Express" placeholder="+244 900 000 000" value={method.phone || ''} onChange={set('phone')} />
      )}
      {method.type === 'TRANSFER' && (
        <>
          <Input label="Telefone do titular" placeholder="+244 900 000 000" value={method.phone || ''} onChange={set('phone')} />
          <Input label="Nome do titular" placeholder="Nome na conta" value={method.ownerName || ''} onChange={set('ownerName')} />
          <Input label="Banco" placeholder="Ex: BAI, BFA, BIC..." value={method.bankName || ''} onChange={set('bankName')} />
          <Input label="Nº da conta" placeholder="Ex: 123456789" value={method.bankAccount || ''} onChange={set('bankAccount')} />
          <div className="sm:col-span-2">
            <Input label="IBAN (opcional)" placeholder="AO06000000000000000000000" value={method.iban || ''} onChange={set('iban')} />
          </div>
        </>
      )}
      {method.type === 'REFERENCE' && (
        <>
          <Input label="Entidade" placeholder="Ex: 12345" value={method.entity || ''} onChange={set('entity')} />
          <Input label="Referência" placeholder="Ex: 000 123 456" value={method.reference || ''} onChange={set('reference')} />
        </>
      )}
    </div>
  )
}
