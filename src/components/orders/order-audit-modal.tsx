'use client'

import * as React from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import {
  X,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FileText,
  MessageSquare,
  UploadCloud,
  CheckCircle2,
  Building2,
  Calendar,
  Hash,
  User,
  Key,
  Fingerprint as FingerprintIcon,
  ExternalLink,
  ShieldX,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn, formatPrice } from '@/lib/utils'
import { ModerationDialog } from '@/components/orders/moderation-dialog'
import type { DisputeModerationAction } from '@/lib/api-helpers'

export interface OrderAuditModalProps {
  open: boolean
  onClose: () => void
  orderNumber: string
  orderId?: string
  orderTotal?: number
  expectedCode?: string
  validationStatus?: string
  validationResult?: any
  receiptImage?: string | null
  receiptAttempts?: number
  role?: 'CLIENT' | 'SELLER' | 'ADMIN'
  onResubmit?: () => void
  onOpenDispute?: () => void
  onModerated?: () => void
}

const receiptDisplayUrl = (url?: string) => {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  const base = (
    process.env.NEXT_PUBLIC_API_URL || 'https://pambala-api.monait.workers.dev'
  ).replace(/\/api\/?$/, '')
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`
}

const isPdfUrl = (url?: string) => {
  if (!url) return false
  const clean = url.split('?')[0].toLowerCase()
  return clean.endsWith('.pdf')
}

export function OrderAuditModal({
  open,
  onClose,
  orderNumber,
  orderId,
  orderTotal,
  expectedCode,
  validationStatus,
  validationResult,
  receiptImage,
  receiptAttempts,
  role = 'CLIENT',
  onResubmit,
  onOpenDispute,
  onModerated,
}: OrderAuditModalProps) {
  const t = useTranslations('orderAudit')
  const tc = useTranslations('common')
  const [showReceiptLightbox, setShowReceiptLightbox] = React.useState(false)
  const [moderationAction, setModerationAction] = React.useState<DisputeModerationAction | null>(null)
  const [moderating, setModerating] = React.useState(false)

  const parsedResult = React.useMemo(() => {
    if (!validationResult) return null
    if (typeof validationResult === 'object') return validationResult
    try {
      return JSON.parse(validationResult)
    } catch {
      return null
    }
  }, [validationResult])

  if (!open) return null

  const isModerable = role === 'ADMIN' && !!orderId
  const isRejected =
    validationStatus === 'PROOF_REJECTED' ||
    validationStatus === 'FAIL' ||
    parsedResult?.status === 'PROOF_REJECTED' ||
    parsedResult?.status === 'FAIL' ||
    (parsedResult?.score != null && parsedResult.score < 70)

  const isAccepted =
    validationStatus === 'PROOF_ACCEPTED' ||
    validationStatus === 'PASS' ||
    parsedResult?.status === 'PROOF_ACCEPTED' ||
    (parsedResult?.score != null && parsedResult.score >= 90)

  const score = parsedResult?.score ?? (isAccepted ? 100 : isRejected ? 30 : null)
  const tx = parsedResult?.transaction
  const flags: string[] = Array.isArray(parsedResult?.flags) ? parsedResult.flags : []
  const reasons: string[] = Array.isArray(parsedResult?.reasons) ? parsedResult.reasons : []
  const remainingAttempts = Math.max(0, 3 - (receiptAttempts || 1))
  const canResubmit = role === 'CLIENT' && remainingAttempts > 0 && typeof onResubmit === 'function'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-xl w-full rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          className={cn(
            'flex items-center justify-between border-b px-6 py-4',
            isRejected
              ? 'border-red-100 bg-red-50/80 dark:border-red-900/40 dark:bg-red-950/40'
              : isAccepted
              ? 'border-emerald-100 bg-emerald-50/80 dark:border-emerald-900/40 dark:bg-emerald-950/40'
              : 'border-amber-100 bg-amber-50/80 dark:border-amber-900/40 dark:bg-amber-950/40'
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full',
                isRejected
                  ? 'bg-red-100 text-red-600 dark:bg-red-900/60 dark:text-red-300'
                  : isAccepted
                  ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/60 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300'
              )}
            >
              {isRejected ? (
                <ShieldAlert className="h-5 w-5" />
              ) : isAccepted ? (
                <ShieldCheck className="h-5 w-5" />
              ) : (
                <AlertTriangle className="h-5 w-5" />
              )}
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                {isRejected
                  ? t('titleRejected')
                  : isAccepted
                  ? t('titleAccepted')
                  : t('titleAudit')}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('subtitle', { orderNumber })}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200 cursor-pointer"
            aria-label={tc('close')}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[72vh] overflow-y-auto">
          {/* Status and Score Banner */}
          <div
            className={cn(
              'rounded-xl border p-4 space-y-2',
              isRejected
                ? 'bg-red-50 dark:bg-red-950/25 border-red-200 dark:border-red-900/40 text-red-900 dark:text-red-200'
                : isAccepted
                ? 'bg-emerald-50 dark:bg-emerald-950/25 border-emerald-200 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200'
                : 'bg-amber-50 dark:bg-amber-950/25 border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-200'
            )}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm flex items-center gap-1.5">
                {isRejected ? (
                  <AlertTriangle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                ) : isAccepted ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                )}
                {isRejected
                  ? t('rejectedNoticeTitle')
                  : isAccepted
                  ? t('acceptedNoticeTitle')
                  : t('reviewNoticeTitle')}
              </span>
              {score != null && (
                <span
                  className={cn(
                    'px-2.5 py-0.5 rounded-full font-mono text-xs font-bold border',
                    isRejected
                      ? 'bg-red-100 border-red-300 text-red-800 dark:bg-red-900/60 dark:border-red-700 dark:text-red-200'
                      : isAccepted
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-800 dark:bg-emerald-900/60 dark:border-emerald-700 dark:text-emerald-200'
                      : 'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-900/60 dark:border-amber-700 dark:text-amber-200'
                  )}
                >
                  Score: {score}/100
                </span>
              )}
            </div>
            <p className="text-xs opacity-90 leading-relaxed">
              {isRejected
                ? t('rejectedNoticeDesc')
                : isAccepted
                ? t('acceptedNoticeDesc')
                : t('reviewNoticeDesc')}
            </p>
            {receiptAttempts != null && (
              <div className="pt-1 text-[11px] font-medium opacity-80">
                {remainingAttempts > 0
                  ? t('attemptsRemaining', { remaining: remainingAttempts, max: 3 })
                  : t('attemptsExceeded')}
              </div>
            )}
          </div>

          {/* Justificativas identificadas */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              {t('reasonsHeader')}
            </h4>
            {reasons.length > 0 ? (
              <div className="space-y-1.5">
                {reasons.map((reason, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 p-2.5 text-xs text-gray-700 dark:text-gray-200"
                  >
                    <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                    <span className="leading-snug">{reason}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 dark:text-gray-400 italic bg-gray-50 dark:bg-gray-800/40 p-3 rounded-lg border border-gray-200 dark:border-gray-800">
                {t('noReasons')}
              </p>
            )}
          </div>

          {/* Sinalizadores de Risco (Flags) */}
          {flags.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                {t('flagsHeader')}
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {flags.map((flag, idx) => {
                  const isCrit =
                    flag.includes('MISMATCH') ||
                    flag.includes('DUPLICATE') ||
                    flag === 'EDITED_REGIONS' ||
                    flag === 'MAGIC_MISMATCH' ||
                    flag === 'SUSPICIOUS_DOCUMENT'
                  return (
                    <span
                      key={idx}
                      className={cn(
                        'px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide border uppercase',
                        isCrit
                          ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-950/40 dark:border-red-800 dark:text-red-300'
                          : 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300'
                      )}
                    >
                      {flag}
                    </span>
                  )
                })}
              </div>
            </div>
          )}

          {/* Transação Bancária Detetada */}
          {tx && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-indigo-500" />
                {t('detectedBankHeader')}
              </h4>
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-800/40 p-3.5 space-y-2.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-600 dark:text-gray-300">
                  {tx.transactionId && (
                    <div className="flex items-center gap-1.5">
                      <Hash className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                      <span className="text-gray-500 dark:text-gray-400">{t('txId')}:</span>
                      <span className="font-mono font-medium text-gray-900 dark:text-white">
                        {tx.transactionId}
                      </span>
                    </div>
                  )}

                  {tx.amount != null && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-500 dark:text-gray-400">{t('txAmount')}:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {Number(tx.amount).toLocaleString('pt-AO')} Kz
                      </span>
                      {orderTotal != null && (
                        <span className="text-[10px] text-gray-400">
                          ({t('orderAmount')}: {formatPrice(orderTotal)})
                        </span>
                      )}
                    </div>
                  )}

                  {tx.date && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                      <span className="text-gray-500 dark:text-gray-400">{t('txDate')}:</span>
                      <span className="text-gray-900 dark:text-white">{tx.date}</span>
                    </div>
                  )}

                  {tx.bank && (
                    <div className="flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                      <span className="text-gray-500 dark:text-gray-400">{t('txBank')}:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{tx.bank}</span>
                    </div>
                  )}

                  {tx.beneficiary && (
                    <div className="sm:col-span-2 flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                      <span className="text-gray-500 dark:text-gray-400">{t('txBeneficiary')}:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {tx.beneficiary}
                      </span>
                    </div>
                  )}

                  {(tx.validationCodeFound || expectedCode) && (
                    <div className="sm:col-span-2 flex flex-wrap items-center gap-2 pt-1 border-t border-gray-200/60 dark:border-gray-700/60">
                      <Key className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                      {expectedCode && (
                        <span className="text-gray-500 dark:text-gray-400">
                          {t('txCodeExpected')}:{' '}
                          <span className="font-mono font-bold text-amber-700 dark:text-amber-300">
                            {expectedCode}
                          </span>
                        </span>
                      )}
                      {tx.validationCodeFound && (
                        <span className="text-gray-500 dark:text-gray-400">
                          · {t('txCodeFound')}:{' '}
                          <span className="font-mono font-bold text-gray-800 dark:text-gray-200">
                            {tx.validationCodeFound}
                          </span>
                        </span>
                      )}
                    </div>
                  )}

                  {tx.fingerprint && (
                    <div className="sm:col-span-2 flex items-center gap-1.5 pt-1 text-[10px] text-gray-400 font-mono">
                      <FingerprintIcon className="h-3 w-3 shrink-0" />
                      <span>{t('fingerprint')}: {tx.fingerprint}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Ficheiro do Comprovativo */}
          {receiptImage && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-emerald-500" />
                {t('receiptTitle')}
              </h4>
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/60">
                <span className="flex items-center gap-2 min-w-0 text-xs font-medium text-gray-700 dark:text-gray-200">
                  <FileText className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span className="truncate">{receiptImage.split('/').pop() || 'comprovativo'}</span>
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReceiptLightbox(true)}
                  className="shrink-0 h-7 text-xs cursor-pointer"
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-1" />
                  {t('openReceipt')}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40 px-6 py-3.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {typeof onOpenDispute === 'function' && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onOpenDispute}
                className="text-xs text-indigo-700 border-indigo-200 hover:bg-indigo-50 dark:text-indigo-300 dark:border-indigo-900 dark:hover:bg-indigo-950/50 cursor-pointer"
              >
                <MessageSquare className="h-3.5 w-3.5 mr-1 text-indigo-600" />
                {t('openChat')}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isModerable && !moderating && (
              <>
                <Button
                  type="button"
                  size="sm"
                  className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                  onClick={() => setModerationAction('MANUAL_OVERRIDE_ACCEPT')}
                >
                  <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                  {t('moderateApprove')}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="text-xs cursor-pointer"
                  onClick={() => setModerationAction('DEFINITIVE_REJECT')}
                >
                  <ShieldX className="h-3.5 w-3.5 mr-1" />
                  {t('moderateReject')}
                </Button>
              </>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs cursor-pointer"
            >
              {t('close')}
            </Button>
            {canResubmit && (
              <Button
                type="button"
                size="sm"
                onClick={onResubmit}
                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
              >
                <UploadCloud className="h-3.5 w-3.5 mr-1" />
                {t('resubmit')}
              </Button>
            )}
          </div>
        </div>
      </div>

      <ModerationDialog
        key={moderationAction ?? 'closed'}
        open={moderationAction !== null}
        orderId={orderId || ''}
        action={moderationAction}
        onClose={() => setModerationAction(null)}
        onSuccess={async () => {
          setModerating(true)
          onModerated?.()
          setModerating(false)
        }}
      />

      {/* Lightbox for Receipt Document */}
      {showReceiptLightbox && receiptImage && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/75 p-4"
          onClick={() => setShowReceiptLightbox(false)}
        >
          <div className="relative max-h-[90vh] max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setShowReceiptLightbox(false)}
              className="absolute -top-3 -right-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-700 shadow hover:bg-gray-100 cursor-pointer"
              aria-label={tc('close')}
            >
              <X className="h-5 w-5" />
            </button>
            {isPdfUrl(receiptImage) ? (
              <iframe
                src={receiptDisplayUrl(receiptImage)}
                title="Comprovativo"
                className="h-[80vh] w-full rounded-lg bg-white"
              />
            ) : (
              <Image
                src={receiptDisplayUrl(receiptImage)}
                alt="Comprovativo"
                width={1200}
                height={900}
                unoptimized
                className="max-h-[90vh] w-full rounded-lg object-contain bg-white"
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
