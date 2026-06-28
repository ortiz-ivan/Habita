import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebounce } from '../../hooks/ui/useDebounce'

describe('useDebounce', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('returns the initial value immediately on mount', () => {
    const { result } = renderHook(() => useDebounce('hello', 350))
    expect(result.current).toBe('hello')
  })

  it('does not update before the delay elapses', () => {
    const { result, rerender } = renderHook(({ val }) => useDebounce(val, 350), {
      initialProps: { val: 'hello' },
    })
    rerender({ val: 'world' })
    act(() => vi.advanceTimersByTime(200))
    expect(result.current).toBe('hello')
  })

  it('updates to the new value after the delay elapses', () => {
    const { result, rerender } = renderHook(({ val }) => useDebounce(val, 350), {
      initialProps: { val: 'hello' },
    })
    rerender({ val: 'world' })
    act(() => vi.advanceTimersByTime(350))
    expect(result.current).toBe('world')
  })

  it('resets the timer on each new value (only last value wins)', () => {
    const { result, rerender } = renderHook(({ val }) => useDebounce(val, 350), {
      initialProps: { val: 'a' },
    })
    rerender({ val: 'ab' })
    act(() => vi.advanceTimersByTime(200))
    rerender({ val: 'abc' })
    act(() => vi.advanceTimersByTime(200))
    expect(result.current).toBe('a')
    act(() => vi.advanceTimersByTime(150))
    expect(result.current).toBe('abc')
  })

  it('respects a custom delay parameter', () => {
    const { result, rerender } = renderHook(({ val }) => useDebounce(val, 1000), {
      initialProps: { val: 'start' },
    })
    rerender({ val: 'end' })
    act(() => vi.advanceTimersByTime(999))
    expect(result.current).toBe('start')
    act(() => vi.advanceTimersByTime(1))
    expect(result.current).toBe('end')
  })
})
