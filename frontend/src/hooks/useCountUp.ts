import { useState, useEffect, useRef } from 'react'

interface UseCountUpOptions {
  duration?: number
  enabled?: boolean
}

export function useCountUp(target: number, { duration = 1100, enabled = true }: UseCountUpOptions = {}): number {
  const [display, setDisplay] = useState(enabled ? 0 : target)
  const frameRef = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)

  useEffect(() => {
    if (!enabled || typeof target !== 'number') {
      setDisplay(target)
      return
    }

    startRef.current = null

    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts
      const progress = Math.min((ts - startRef.current) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(eased * target))
      if (progress < 1) frameRef.current = requestAnimationFrame(animate)
    }

    frameRef.current = requestAnimationFrame(animate)
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [target, duration, enabled])

  return display
}
