'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { useAuthStore } from '@/store/auth-store'
import { useDisputeUnreadStore } from '@/store/dispute-unread-store'
import { toast } from '@/components/ui/toast'

function playChime() {
  try {
    if (typeof window === 'undefined' || typeof AudioContext === 'undefined') return
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new Ctx()
    const notes = [880, 1318.52]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + i * 0.12)
      gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + i * 0.12 + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.12 + 0.45)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(ctx.currentTime + i * 0.12)
      osc.stop(ctx.currentTime + i * 0.12 + 0.5)
    })
    setTimeout(() => ctx.close().catch(() => {}), 1200)
  } catch {
    // silencioso
  }
}

function latestKey(total: number, items: { lastMessage?: { id: string; createdAt: string } }[]) {
  if (total === 0) return '0'
  const first = items[0]
  if (!first?.lastMessage) return `t:${total}`
  return `${total}:${first.lastMessage.id}:${first.lastMessage.createdAt}`
}

export function DisputeNotifications() {
  const t = useTranslations('disputeNotifications')
  const user = useAuthStore((s) => s.user)
  const setData = useDisputeUnreadStore((s) => s.setData)
  const prevKeyRef = React.useRef<string | null>(null)
  const prevTotalRef = React.useRef<number>(0)

  React.useEffect(() => {
    if (!user) {
      prevKeyRef.current = null
      prevTotalRef.current = 0
      setData({ total: 0, items: [] })
      return
    }

    let cancelled = false

    const poll = async () => {
      try {
        const { fetchDisputeUnread } = await import('@/lib/api-helpers')
        const data = await fetchDisputeUnread()
        if (cancelled) return

        const key = latestKey(data.total, data.items)

        if (prevKeyRef.current !== null && key !== prevKeyRef.current) {
          const isVisible = typeof document !== 'undefined' && document.visibilityState === 'visible'
          if (isVisible) {
            const orderNumber = data.items[0]?.orderNumber
            if (data.total > prevTotalRef.current) {
              if (orderNumber) {
                toast(t('newMessage', { order: orderNumber }), 'info')
              } else {
                toast(t('newCount', { count: data.total }), 'info')
              }
              playChime()
            }
          }
        }

        prevKeyRef.current = key
        prevTotalRef.current = data.total
        setData({ total: data.total, items: data.items })
      } catch {
        // ignora erros silenciosos
      }
    }

    poll()
    const interval = setInterval(poll, 20000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [user, setData, t])

  return null
}