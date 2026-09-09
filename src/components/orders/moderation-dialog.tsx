'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { ShieldCheck, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { moderateOrderDispute, type DisputeModerationAction } from '@/lib/api-helpers'
import { toast } from '@/components/ui/toast'

interface ModerationDialogProps {
  open: boolean
  orderId: string
  action: DisputeModerationAction | null
  onClose: () => void
  onSuccess?: () => void
}

export function ModerationDialog({
  open,
  orderId,
  action,
  onClose,
  onSuccess,
}: ModerationDialogProps) {
  const t = useTranslations('moderation')
  const tc = useTranslations('common')
  const [note, setNote] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)

  if (!action) return null

  const isApprove = action === 'MANUAL_OVERRIDE_ACCEPT'

  const handleConfirm = async () => {
    setSubmitting(true)
    try {
      await moderateOrderDispute(orderId, action, note.trim() || undefined)
      toast(t('success'), 'success')
      onClose()
      onSuccess?.()
    } catch {
      toast(t('error'), 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                isApprove
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
              )}
            >
              {isApprove ? <ShieldCheck className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
            </span>
            <DialogTitle>
              {isApprove ? t('approveTitle') : t('rejectTitle')}
            </DialogTitle>
          </div>
        </DialogHeader>
        <DialogDescription className="mt-2">
          {isApprove ? t('approvePrompt') : t('rejectPrompt')}
        </DialogDescription>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t('notePlaceholder')}
          rows={3}
          className="mt-3 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
        />
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            {tc('cancel')}
          </Button>
          <Button
            variant={isApprove ? 'default' : 'destructive'}
            onClick={handleConfirm}
            disabled={submitting}
          >
            {submitting ? tc('loading') : isApprove ? t('approveConfirm') : t('rejectConfirm')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}