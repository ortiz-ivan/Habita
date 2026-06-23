import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useQuickPago } from '../../hooks/useQuickPago'

vi.mock('../../hooks/queries/usePagos', () => ({
  useCreatePago: vi.fn(),
}))

import { useCreatePago } from '../../hooks/queries/usePagos'

describe('useQuickPago', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useCreatePago).mockReturnValue({ mutate: vi.fn(), isPending: false } as any)
  })

  it('starts closed with no error', () => {
    const { result } = renderHook(() => useQuickPago())
    expect(result.current.isOpen).toBe(false)
    expect(result.current.apiError).toBe('')
  })

  it('open() sets isOpen to true and clears any prior error', () => {
    const { result } = renderHook(() => useQuickPago())
    act(() => { result.current.open() })
    expect(result.current.isOpen).toBe(true)
    expect(result.current.apiError).toBe('')
  })

  it('close() sets isOpen to false', () => {
    const { result } = renderHook(() => useQuickPago())
    act(() => { result.current.open() })
    act(() => { result.current.close() })
    expect(result.current.isOpen).toBe(false)
  })

  it('onSuccess callback closes modal and clears error', () => {
    let capturedOnSuccess: (() => void) | undefined
    vi.mocked(useCreatePago).mockImplementation(({ onSuccess }: any) => {
      capturedOnSuccess = onSuccess
      return { mutate: vi.fn(), isPending: false } as any
    })
    const { result } = renderHook(() => useQuickPago())
    act(() => { result.current.open() })
    act(() => { capturedOnSuccess!() })
    expect(result.current.isOpen).toBe(false)
    expect(result.current.apiError).toBe('')
  })

  it('onError callback sets apiError from parsed response', () => {
    let capturedOnError: ((err: unknown) => void) | undefined
    vi.mocked(useCreatePago).mockImplementation(({ onError }: any) => {
      capturedOnError = onError
      return { mutate: vi.fn(), isPending: false } as any
    })
    const { result } = renderHook(() => useQuickPago())
    act(() => {
      capturedOnError!({ response: { data: { monto: ['El monto es requerido'] } } })
    })
    expect(result.current.apiError).toBe('monto: El monto es requerido')
  })

  it('exposes the mutation object from useCreatePago', () => {
    const mockMutation = { mutate: vi.fn(), isPending: false }
    vi.mocked(useCreatePago).mockReturnValue(mockMutation as any)
    const { result } = renderHook(() => useQuickPago())
    expect(result.current.mutation).toBe(mockMutation)
  })
})
