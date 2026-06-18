import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { toast, useToastListener } from '../../hooks/useToast'

describe('useToastListener', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('starts with an empty toast list', () => {
    const { result, unmount } = renderHook(() => useToastListener())
    expect(result.current.toasts).toHaveLength(0)
    unmount()
  })

  it('toast.success adds a success toast', () => {
    const { result, unmount } = renderHook(() => useToastListener())
    act(() => { toast.success('Guardado correctamente') })
    expect(result.current.toasts).toHaveLength(1)
    expect(result.current.toasts[0]).toMatchObject({
      type: 'success',
      message: 'Guardado correctamente',
    })
    unmount()
  })

  it('toast.error adds an error toast', () => {
    const { result, unmount } = renderHook(() => useToastListener())
    act(() => { toast.error('Algo falló') })
    expect(result.current.toasts[0]).toMatchObject({ type: 'error', message: 'Algo falló' })
    unmount()
  })

  it('toast.info adds an info toast', () => {
    const { result, unmount } = renderHook(() => useToastListener())
    act(() => { toast.info('Información') })
    expect(result.current.toasts[0]).toMatchObject({ type: 'info' })
    unmount()
  })

  it('multiple toasts accumulate in order', () => {
    const { result, unmount } = renderHook(() => useToastListener())
    act(() => {
      toast.success('Primero')
      toast.error('Segundo')
    })
    expect(result.current.toasts).toHaveLength(2)
    expect(result.current.toasts[0].message).toBe('Primero')
    expect(result.current.toasts[1].message).toBe('Segundo')
    unmount()
  })

  it('dismiss(id) removes only the targeted toast', () => {
    const { result, unmount } = renderHook(() => useToastListener())
    act(() => {
      toast.success('A borrar')
      toast.info('A conservar')
    })
    const idToBorrar = result.current.toasts[0].id
    act(() => { result.current.dismiss(idToBorrar) })
    expect(result.current.toasts).toHaveLength(1)
    expect(result.current.toasts[0].message).toBe('A conservar')
    unmount()
  })

  it('toast is auto-removed after duration + exit animation (320ms)', () => {
    const { result, unmount } = renderHook(() => useToastListener())
    act(() => { toast.success('Auto-remove', { duration: 100 }) })
    expect(result.current.toasts).toHaveLength(1)
    // TTL = duration(100) + animation(320) = 420ms
    act(() => vi.advanceTimersByTime(420 + 1))
    expect(result.current.toasts).toHaveLength(0)
    unmount()
  })

  it('unsubscribes on unmount — no state update errors after unmount', () => {
    const { unmount } = renderHook(() => useToastListener())
    unmount()
    // Emitting after unmount should not throw or warn about memory leaks
    expect(() => act(() => { toast.info('After unmount') })).not.toThrow()
  })
})
