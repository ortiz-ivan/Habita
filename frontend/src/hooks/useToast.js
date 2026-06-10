import { useState, useEffect } from 'react'

let listeners = []
let nextId = 1

const emitter = {
  subscribe: (fn) => {
    listeners.push(fn)
    return () => { listeners = listeners.filter((l) => l !== fn) }
  },
  emit: (toast) => listeners.forEach((fn) => fn(toast)),
}

export const toast = {
  success: (message, opts = {}) => emitter.emit({ id: nextId++, type: 'success', message, ...opts }),
  error:   (message, opts = {}) => emitter.emit({ id: nextId++, type: 'error',   message, ...opts }),
  info:    (message, opts = {}) => emitter.emit({ id: nextId++, type: 'info',    message, ...opts }),
}

export function useToastListener() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    return emitter.subscribe((incoming) => {
      setToasts((prev) => [...prev, incoming])
      const ttl = (incoming.duration ?? 4000) + 320
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== incoming.id))
      }, ttl)
    })
  }, [])

  const dismiss = (id) => setToasts((prev) => prev.filter((t) => t.id !== id))

  return { toasts, dismiss }
}
