import { describe, it, expect } from 'vitest'
import { formatGs, formatDate, parseApiError } from '../../utils/format'

describe('formatGs', () => {
  it('formats zero', () => {
    expect(formatGs(0)).toBe('Gs. 0')
  })

  it('formats integer with locale thousands separator', () => {
    const result = formatGs(1500000)
    expect(result).toMatch(/^Gs\. 1[.,]500[.,]000$/)
  })

  it('coerces string input', () => {
    expect(formatGs('500')).toBe('Gs. 500')
  })

  it('formats negative numbers', () => {
    expect(formatGs(-1000)).toMatch(/^Gs\. -1[.,]000$/)
  })
})

describe('formatDate', () => {
  it('formats ISO date as dd-mm-yyyy', () => {
    expect(formatDate('2025-03-15')).toBe('15-03-2025')
  })

  it('returns em dash for null', () => {
    expect(formatDate(null)).toBe('—')
  })

  it('returns em dash for undefined', () => {
    expect(formatDate(undefined)).toBe('—')
  })

  it('returns em dash for empty string', () => {
    expect(formatDate('')).toBe('—')
  })

  it('handles end-of-year date', () => {
    expect(formatDate('2025-12-31')).toBe('31-12-2025')
  })
})

describe('parseApiError', () => {
  it('returns fallback when there is no response', () => {
    expect(parseApiError({})).toBe('Error inesperado')
  })

  it('returns fallback for null/undefined error', () => {
    expect(parseApiError(null)).toBe('Error inesperado')
    expect(parseApiError(undefined)).toBe('Error inesperado')
  })

  it('returns string data directly', () => {
    expect(parseApiError({ response: { data: 'No autorizado' } })).toBe('No autorizado')
  })

  it('flattens array field errors', () => {
    const err = { response: { data: { monto: ['Requerido'], fecha: ['Inválida'] } } }
    const result = parseApiError(err)
    expect(result).toContain('monto: Requerido')
    expect(result).toContain('fecha: Inválida')
  })

  it('handles single string per field', () => {
    const err = { response: { data: { detail: 'Token expirado' } } }
    expect(parseApiError(err)).toBe('detail: Token expirado')
  })

  it('joins multiple field errors with |', () => {
    const err = { response: { data: { campo: ['Error 1', 'Error 2'] } } }
    const result = parseApiError(err)
    expect(result).toBe('campo: Error 1 | campo: Error 2')
  })
})
