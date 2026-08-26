'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import { ChevronRight, Copy, Check, Clock, CheckCircle2, XCircle, Loader2, Smartphone, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatPrice, cn } from '@/lib/utils'
import { getAppyPayStatus, fetchOrderById } from '@/lib/api-helpers'

export default function PaymentPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const orderNumber = params.orderNumber as string
  const chargeId = searchParams.get('chargeId') || ''
  const method = searchParams.get('method') || 'APPY_PAY_GPO'

  const [paymentStatus, setPaymentStatus] = React.useState<'loading' | 'pending' | 'confirmed' | 'failed' | 'expired'>('loading')
  const [referenceNumber, setReferenceNumber] = React.useState('')
  const [ussdCode, setUssdCode] = React.useState('')
  const [orderTotal, setOrderTotal] = React.useState(0)
  const [copied, setCopied] = React.useState(false)
  const [elapsed, setElapsed] = React.useState(0)

  React.useEffect(() => {
    const loadOrder = async () => {
      try {
        const order = await fetchOrderById(orderNumber)
        setOrderTotal(order.total)
      } catch {
        setPaymentStatus('failed')
      }
    }
    if (orderNumber) loadOrder()
  }, [orderNumber])

  React.useEffect(() => {
    if (paymentStatus !== 'loading' && paymentStatus !== 'pending') return

    const interval = setInterval(async () => {
      setElapsed((e) => e + 1)
      try {
        const status = await getAppyPayStatus(orderNumber)
        if (status.referenceNumber) setReferenceNumber(status.referenceNumber)
        if (status.ussdCode) setUssdCode(status.ussdCode)

        if (status.paymentStatus === 'CONFIRMED') {
          setPaymentStatus('confirmed')
          clearInterval(interval)
        } else if (status.paymentStatus === 'FAILED' || status.paymentStatus === 'CANCELLED') {
          setPaymentStatus('failed')
          clearInterval(interval)
        } else if (status.paymentStatus === 'EXPIRED') {
          setPaymentStatus('expired')
          clearInterval(interval)
        }
      } catch {
        // keep polling
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [paymentStatus, orderNumber])

  React.useEffect(() => {
    if (chargeId) {
      setPaymentStatus('pending')
    }
  }, [chargeId])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isGpo = method === 'APPY_PAY_GPO'

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-6">
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-emerald-600 transition-colors">Inicio</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/carrinho" className="hover:text-emerald-600 transition-colors">Carrinho</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-gray-900 dark:text-white font-medium">Pagamento</span>
      </nav>

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 sm:p-8">
        {/* Status Header */}
        <div className="text-center mb-8">
          {paymentStatus === 'loading' && (
            <>
              <Loader2 className="h-12 w-12 text-emerald-600 mx-auto mb-4 animate-spin" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">A carregar pagamento...</h1>
            </>
          )}
          {paymentStatus === 'pending' && (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30 mx-auto mb-4">
                {isGpo ? (
                  <Smartphone className="h-8 w-8 text-amber-600" />
                ) : (
                  <FileText className="h-8 w-8 text-amber-600" />
                )}
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {isGpo ? 'Confirme o pagamento no telemovel' : 'Efectue o pagamento'}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Pedido: <span className="font-mono font-medium text-gray-900 dark:text-white">{orderNumber}</span>
              </p>
            </>
          )}
          {paymentStatus === 'confirmed' && (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              <h1 className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mb-2">Pagamento Confirmado!</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">O seu pagamento foi processado com sucesso.</p>
            </>
          )}
          {paymentStatus === 'failed' && (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mx-auto mb-4">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <h1 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">Pagamento nao realizado</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">O pagamento nao foi concluido. Pode tentar novamente.</p>
            </>
          )}
          {paymentStatus === 'expired' && (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 mx-auto mb-4">
                <Clock className="h-8 w-8 text-gray-500" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Pagamento expirado</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">A referencia de pagamento expirou. Crie um novo pedido.</p>
            </>
          )}
        </div>

        {/* Payment Details - GPO */}
        {paymentStatus === 'pending' && isGpo && (
          <div className="space-y-4">
            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-6 text-center">
              <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300 mb-2">
                Abra o Multicaixa Express e confirme o pedido
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                Um pedido de pagamento foi enviado para o seu telemovel. Confirme com a sua senha no aplicativo Multicaixa Express.
              </p>
            </div>

            {ussdCode && (
              <div className="rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Codigo USSD:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-lg font-mono font-bold text-gray-900 dark:text-white bg-white dark:bg-gray-900 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                    {ussdCode}
                  </code>
                  <button
                    onClick={() => copyToClipboard(ussdCode)}
                    className="h-10 w-10 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4 text-gray-500" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  Ou disque o codigo acima no seu telemovel
                </p>
              </div>
            )}
          </div>
        )}

        {/* Payment Details - Reference */}
        {paymentStatus === 'pending' && !isGpo && (
          <div className="space-y-4">
            <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-6 text-center">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                Utilise a referencia abaixo para pagar
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-400">
                Pague no Multicaixa Express, ATM ou na aplicacao do seu banco
              </p>
            </div>

            {referenceNumber && (
              <div className="rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Referencia de Pagamento:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xl font-mono font-bold text-gray-900 dark:text-white bg-white dark:bg-gray-900 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 text-center tracking-wider">
                    {referenceNumber}
                  </code>
                  <button
                    onClick={() => copyToClipboard(referenceNumber)}
                    className="h-10 w-10 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4 text-gray-500" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Amount */}
        {orderTotal > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Valor a pagar:</span>
              <span className="text-xl font-bold text-emerald-700">{formatPrice(orderTotal)}</span>
            </div>
          </div>
        )}

        {/* Timer / Status */}
        {paymentStatus === 'pending' && (
          <div className="mt-6 text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>A aguardar confirmacao do pagamento...</span>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              Este processo pode demorar alguns segundos. A pagina actualiza automaticamente.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 space-y-3">
          {paymentStatus === 'confirmed' && (
            <Button className="w-full h-12 text-base" onClick={() => router.push(`/pedidos/${orderNumber}`)}>
              Ver Pedido
            </Button>
          )}
          {(paymentStatus === 'failed' || paymentStatus === 'expired') && (
            <>
              <Button className="w-full h-12 text-base" onClick={() => router.push('/checkout')}>
                Tentar Novamente
              </Button>
              <Button variant="outline" className="w-full" onClick={() => router.push('/minha-conta/pedidos')}>
                Ver Meus Pedidos
              </Button>
            </>
          )}
          {paymentStatus === 'pending' && (
            <Button variant="outline" className="w-full" onClick={() => router.push('/minha-conta/pedidos')}>
              Pagar Mais Tarde
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
