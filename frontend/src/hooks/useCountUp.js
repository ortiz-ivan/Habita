import { useState, useEffect, useRef } from 'react'

export function useCountUp(target, { duration = 1100, enabled = true } = {}) {
  const [display, setDisplay] = useState(enabled ? 0 : target)
  const frameRef = useRef(null)
  const startRef = useRef(null)

  useEffect(() => {
    if (!enabled || typeof target !== 'number') {
      setDisplay(target)
      return
    }

    startRef.current = null

    const animate = (ts) => {
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
