'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import {
  Send,
  Paperclip,
  ShieldAlert,
  User,
  Store,
  CheckCircle2,
  Lock,
  RefreshCw,
  FileText,
  ExternalLink,
  Bot,
  AlertCircle,
  ShieldCheck,
  ShieldX,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn, isPdfUrl } from '@/lib/utils'
import { toast } from '@/components/ui/toast'
import { useDisputeUnreadStore } from '@/store/dispute-unread-store'
import {
  fetchOrderDispute,
  sendOrderDisputeMessage,
  updateOrderDisputeStatus,
  uploadFile,
  markOrderDisputeRead,
  subscribeOrderDispute,
  type OrderDispute,
  type OrderDisputeMessage,
  type DisputeModerationAction,
  type DisputeDetailsResponse,
} from '@/lib/api-helpers'
import { ModerationDialog } from '@/components/orders/moderation-dialog'

interface OrderDisputeChatProps {
  orderId: string
  orderNumber?: string
  compact?: boolean
  className?: string
  onClose?: () => void
}

export function OrderDisputeChat({
  orderId,
  orderNumber,
  compact = false,
  className,
}: OrderDisputeChatProps) {
  const t = useTranslations('disputeChat')
  const tc = useTranslations('common')

  const [dispute, setDispute] = React.useState<OrderDispute | null>(null)
  const [currentUserRole, setCurrentUserRole] = React.useState<'CLIENT' | 'SELLER' | 'ADMIN'>('CLIENT')
  const [loading, setLoading] = React.useState(true)
  const [sending, setSending] = React.useState(false)
  const [uploadingAttachment, setUploadingAttachment] = React.useState(false)
  const [content, setContent] = React.useState('')
  const [attachment, setAttachment] = React.useState<string | null>(null)
  const [statusUpdating, setStatusUpdating] = React.useState(false)
  const [moderationAction, setModerationAction] = React.useState<DisputeModerationAction | null>(null)
  const [moderating, setModerating] = React.useState(false)

  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const lastMarkedIdRef = React.useRef<string | null>(null)

  const applyDisputeSnapshot = React.useCallback(
    (snapshot: DisputeDetailsResponse) => {
      setDispute(snapshot.dispute)
      setCurrentUserRole(snapshot.currentUserRole)
      const lastId =
        snapshot.dispute?.messages?.[snapshot.dispute.messages.length - 1]?.id || null
      if (snapshot.dispute?.messages?.length && lastId !== lastMarkedIdRef.current) {
        lastMarkedIdRef.current = lastId
        markOrderDisputeRead(orderId).catch(() => {})
        void useDisputeUnreadStore.getState().refresh()
      }
    },
    [orderId]
  )

  const loadData = React.useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true)
      try {
        applyDisputeSnapshot(await fetchOrderDispute(orderId))
      } catch {
        // Ignorar erros silenciosos (a reconexão do stream trata o resto)
      } finally {
        if (!silent) setLoading(false)
      }
    },
    [orderId, applyDisputeSnapshot]
  )

  // Tempo real via SSE (substitui o polling de 4s): o servidor empurra o snapshot
  // completo da disputa quando há mensagens/estado/ações de moderação novas.
  React.useEffect(() => {
    loadData(false)
    const unsubscribe = subscribeOrderDispute(orderId, {
      onUpdate: applyDisputeSnapshot,
      onError: () => {
        // A reconexão com backoff é gerida pelo stream; apenas refresca em falha
        void loadData(true)
      },
    })
    return unsubscribe
  }, [orderId, loadData, applyDisputeSnapshot])

  // Refresca ao voltar a focar o separador (o navegador suspende streams em segundo plano)
  React.useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') void loadData(true)
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [loadData])

  // Scroll automático para a mensagem mais recente
  React.useEffect(() => {
    if (dispute?.messages?.length) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [dispute?.messages?.length])

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if ((!content.trim() && !attachment) || sending) return

    setSending(true)
    try {
      await sendOrderDisputeMessage(orderId, content.trim(), attachment || undefined)
      setContent('')
      setAttachment(null)
      await loadData(true)
    } catch {
      toast(t('sendError'), 'error')
    } finally {
      setSending(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingAttachment(true)
    try {
      const { url } = await uploadFile(file)
      setAttachment(url)
      toast(t('attachmentSuccess'), 'success')
    } catch {
      toast(t('attachmentError'), 'error')
    } finally {
      setUploadingAttachment(false)
      e.target.value = ''
    }
  }

  const handleStatusChange = async (newStatus: 'OPEN' | 'RESOLVED' | 'CLOSED') => {
    setStatusUpdating(true)
    try {
      const { dispute: updated } = await updateOrderDisputeStatus(orderId, newStatus)
      setDispute(updated)
      toast(t('statusUpdatedSuccess'), 'success')
      await loadData(true)
    } catch {
      toast(t('statusUpdatedError'), 'error')
    } finally {
      setStatusUpdating(false)
    }
  }

  const renderRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
            <ShieldAlert className="h-3 w-3" />
            {t('roleAdmin')}
          </span>
        )
      case 'SELLER':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300">
            <Store className="h-3 w-3" />
            {t('roleSeller')}
          </span>
        )
      case 'CLIENT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            <User className="h-3 w-3" />
            {t('roleClient')}
          </span>
        )
      case 'SYSTEM':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
            <Bot className="h-3 w-3" />
            {t('roleSystem')}
          </span>
        )
    }
  }

  const isClosed = dispute?.status === 'CLOSED'
  const isResolved = dispute?.status === 'RESOLVED'

  return (
    <div
      className={cn(
        'flex flex-col bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden',
        compact ? 'h-[500px]' : 'h-[620px]',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 shrink-0">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate flex items-center gap-2">
              <span>{t('title')}</span>
              {orderNumber && (
                <span className="font-mono text-xs text-gray-500 font-normal">
                  #{orderNumber}
                </span>
              )}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {t('subtitle')}
            </p>
          </div>
        </div>

        {/* Status + Ações de Admin */}
        <div className="flex items-center gap-2 shrink-0">
          {dispute ? (
            <span
              className={cn(
                'px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1',
                isResolved
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : isClosed
                  ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
              )}
            >
              {isResolved ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : isClosed ? (
                <Lock className="h-3.5 w-3.5" />
              ) : (
                <AlertCircle className="h-3.5 w-3.5" />
              )}
              {isResolved ? t('resolved') : isClosed ? t('closed') : t('open')}
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
              {t('open')}
            </span>
          )}

          {currentUserRole === 'ADMIN' && dispute && (
            <div className="flex items-center gap-1">
              {!isResolved && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs px-2.5 text-emerald-600 border-emerald-300 hover:bg-emerald-50 dark:border-emerald-800"
                  onClick={() => handleStatusChange('RESOLVED')}
                  disabled={statusUpdating}
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                  {t('resolveDispute')}
                </Button>
              )}
              {isClosed ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs px-2"
                  onClick={() => handleStatusChange('OPEN')}
                  disabled={statusUpdating}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  {t('reopenDispute')}
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs px-2 text-gray-500 hover:text-gray-700"
                  onClick={() => handleStatusChange('CLOSED')}
                  disabled={statusUpdating}
                >
                  <Lock className="h-3 w-3 mr-1" />
                  {t('closeDispute')}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tripartite Participants Legend */}
      <div className="flex items-center justify-between px-5 py-2 border-b border-gray-100 dark:border-gray-800/80 bg-gray-50/30 text-[11px] text-gray-500 dark:text-gray-400 flex-wrap gap-2">
        <span className="font-medium text-gray-600 dark:text-gray-300">{t('participantsLabel')}:</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {t('roleClient')}
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            {t('roleSeller')}
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            {t('roleAdmin')}
          </span>
        </div>
      </div>

      {/* Ações de Moderação Manual (Admin) */}
      {currentUserRole === 'ADMIN' && dispute && dispute.status === 'OPEN' && (
        <div className="flex items-center justify-between gap-2 px-5 py-2.5 border-b border-gray-100 dark:border-gray-800 bg-amber-50/60 dark:bg-amber-950/20 flex-wrap">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-800 dark:text-amber-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            {t('moderationBarTitle')}
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs px-2.5 text-emerald-700 border-emerald-300 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300"
              onClick={() => setModerationAction('MANUAL_OVERRIDE_ACCEPT')}
              disabled={moderating}
            >
              <ShieldCheck className="h-3.5 w-3.5 mr-1" />
              {t('moderateApprove')}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs px-2.5 text-red-700 border-red-300 hover:bg-red-50 dark:border-red-800 dark:text-red-300"
              onClick={() => setModerationAction('DEFINITIVE_REJECT')}
              disabled={moderating}
            >
              <ShieldX className="h-3.5 w-3.5 mr-1" />
              {t('moderateReject')}
            </Button>
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        {loading && !dispute ? (
          <div className="flex items-center justify-center h-full text-xs text-gray-400 space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>{tc('loading')}</span>
          </div>
        ) : !dispute?.messages || dispute.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-2 text-gray-400">
            <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {t('empty')}
            </p>
            <p className="text-xs max-w-sm">
              {t('emptyHint')}
            </p>
          </div>
        ) : (
          dispute.messages.map((msg: OrderDisputeMessage) => {
            const isSystem = msg.senderRole === 'SYSTEM'
            const isSelf = msg.senderRole === currentUserRole

            if (isSystem) {
              return (
                <div key={msg.id} className="flex justify-center my-3">
                  <div className="max-w-md rounded-xl bg-gray-100/90 dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-700/60 px-4 py-2.5 text-center text-xs text-gray-600 dark:text-gray-300 space-y-1 shadow-sm">
                    <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <Bot className="h-3 w-3" />
                      <span>{t('roleSystem')}</span>
                    </div>
                    <p className="leading-relaxed">{msg.content}</p>
                    <span className="block text-[10px] text-gray-400 pt-0.5">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              )
            }

            return (
              <div
                key={msg.id}
                className={cn('flex flex-col max-w-[85%] sm:max-w-[75%]', isSelf ? 'ml-auto items-end' : 'mr-auto items-start')}
              >
                {/* Header da Mensagem (Nome + Role + Data) */}
                <div className="flex items-center gap-1.5 mb-1 px-1 text-xs">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {msg.sender?.name || (isSelf ? t('you') : msg.senderRole)}
                  </span>
                  {renderRoleBadge(msg.senderRole)}
                  <span className="text-[10px] text-gray-400 ml-1">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Balão de Mensagem */}
                <div
                  className={cn(
                    'rounded-2xl px-4 py-2.5 text-sm shadow-sm break-words',
                    isSelf
                      ? 'bg-emerald-600 text-white rounded-tr-none'
                      : msg.senderRole === 'ADMIN'
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-gray-900 dark:text-amber-100 border border-amber-200 dark:border-amber-900/60 rounded-tl-none'
                      : msg.senderRole === 'SELLER'
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 text-gray-900 dark:text-indigo-100 border border-indigo-200 dark:border-indigo-900/60 rounded-tl-none'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-none'
                  )}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                  {/* Anexo de Imagem ou Ficheiro */}
                  {msg.attachment && (
                    <div className="mt-2 pt-2 border-t border-black/10 dark:border-white/10">
                      {isPdfUrl(msg.attachment) ? (
                        <a
                          href={msg.attachment}
                          target="_blank"
                          rel="noreferrer"
                          className={cn(
                            'inline-flex items-center gap-1.5 text-xs font-medium underline',
                            isSelf ? 'text-white hover:text-emerald-100' : 'text-emerald-600 dark:text-emerald-400'
                          )}
                        >
                          <FileText className="h-4 w-4" />
                          <span>{t('viewPdfAttachment')}</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <a
                          href={msg.attachment}
                          target="_blank"
                          rel="noreferrer"
                          className="block rounded-lg overflow-hidden border border-black/10 hover:opacity-90 transition-opacity"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={msg.attachment}
                            alt={t('attachmentAlt')}
                            className="max-h-48 rounded-lg object-contain bg-black/5"
                          />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Preview de Anexo selecionado para envio */}
      {attachment && (
        <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-emerald-600 font-medium truncate max-w-xs">
            <Paperclip className="h-3.5 w-3.5 shrink-0" />
            {t('attachmentReady')}
          </span>
          <button
            type="button"
            onClick={() => setAttachment(null)}
            className="text-gray-400 hover:text-red-500 font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Input de Mensagem */}
      {isClosed ? (
        <div className="p-3.5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/60 text-center text-xs text-gray-500">
          <Lock className="h-3.5 w-3.5 inline mr-1" />
          {t('disputeClosedNotice')}
        </div>
      ) : (
        <form
          onSubmit={handleSendMessage}
          className="p-3 sm:p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center gap-2"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={handleFileUpload}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingAttachment || sending}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
            title={uploadingAttachment ? t('uploadingAttachment') : t('attach')}
          >
            {uploadingAttachment ? (
              <RefreshCw className="h-4 w-4 animate-spin text-emerald-600" />
            ) : (
              <Paperclip className="h-4 w-4" />
            )}
          </button>

          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t('inputPlaceholder')}
            disabled={sending}
            className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:text-white"
          />

          <Button
            type="submit"
            size="sm"
            disabled={(!content.trim() && !attachment) || sending}
            className="rounded-xl px-3.5 shrink-0"
          >
            {sending ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="hidden sm:inline ml-1">{t('send')}</span>
          </Button>
        </form>
      )}

      <ModerationDialog
        key={moderationAction ?? 'closed'}
        open={moderationAction !== null}
        orderId={orderId}
        action={moderationAction}
        onClose={() => setModerationAction(null)}
        onSuccess={async () => {
          setModerating(true)
          await loadData(true)
          setModerating(false)
        }}
      />
    </div>
  )
}
