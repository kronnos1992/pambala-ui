'use client'

import * as React from 'react'

export function useCountdown() {
  const [remaining, setRemaining] = React.useState(0)
  const timer = React.useRef<ReturnType<typeof setInterval> | null>(null)

  const start = React.useCallback((seconds: number) => {
    const s = Math.max(1, Math.ceil(seconds))
    setRemaining(s)
    if (timer.current) clearInterval(timer.current)
    timer.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          if (timer.current) clearInterval(timer.current)
          return 0
        }
        return r - 1
      })
    }, 1000)
  }, [])

  React.useEffect(() => {
    return () => {
      if (timer.current) clearInterval(timer.current)
    }
  }, [])

  return { remaining, start }
}