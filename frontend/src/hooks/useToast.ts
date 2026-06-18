import { useState, useEffect } from 'react'

export interface ToastItem {
  id: number
  type: 'success' | 'error' | 'info'
  message: string
  duration?: number
}

type ToastOptions = Partial<Pick<ToastItem, 'duration'>>
type Listener = (toast: ToastItem) => void

let listeners: Listener[] = []
let nextId = 1

const emitter = {
  subscribe: (fn: Listener) => {
    listeners.push(fn)
    return () => { listeners = listeners.filter((l) => l !== fn) }
  },
  emit: (toast: ToastItem) => listeners.forEach((fn) => fn(toast)),
}

export const toast = {
  success: (message: string, opts: ToastOptions = {}) =>
    emitter.emit({ id: nextId++, type: 'success', message, ...opts }),
  error: (message: string, opts: ToastOptions = {}) =>
    emitter.emit({ id: nextId++, type: 'error', message, ...opts }),
  info: (message: string, opts: ToastOptions = {}) =>
    emitter.emit({ id: nextId++, type: 'info', message, ...opts }),
}

export function useToastListener() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  useEffect(() => {
    return emitter.subscribe((incoming) => {
      setToasts((prev) => [...prev, incoming])
      const ttl = (incoming.duration ?? 4000) + 320
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== incoming.id))
      }, ttl)
    })
  }, [])

  const dismiss = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id))

  return { toasts, dismiss }
}
