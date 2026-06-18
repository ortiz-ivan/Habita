import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { getPeriodoFechas } from '../../../lib/constants/pagos'

describe('getPeriodoFechas', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('returns empty object for empty period string', () => {
    expect(getPeriodoFechas('')).toEqual({})
  })

  it('returns empty object for unknown period', () => {
    expect(getPeriodoFechas('unknown')).toEqual({})
  })

  describe('este_anio', () => {
    it('returns Jan 1 to Dec 31 of the current year', () => {
      vi.setSystemTime(new Date('2025-06-20T12:00:00Z'))
      expect(getPeriodoFechas('este_anio')).toEqual({
        fecha_desde: '2025-01-01',
        fecha_hasta: '2025-12-31',
      })
    })
  })

  describe('este_mes — day >= diaInicio (dentro del ciclo activo)', () => {
    it('cycle starts on diaInicio of current month (dia=1)', () => {
      // June 20: day(20) >= dia(1) → cycleOffset=0 → Jun 1 to Jun 30
      vi.setSystemTime(new Date('2025-06-20T12:00:00Z'))
      const result = getPeriodoFechas('este_mes', 1)
      expect(result).toEqual({
        fecha_desde: '2025-06-01',
        fecha_hasta: '2025-06-30',
      })
    })

    it('cycle spans two months when diaInicio > 1', () => {
      // June 20: day(20) >= dia(15) → cycleOffset=0 → Jun 15 to Jul 14
      vi.setSystemTime(new Date('2025-06-20T12:00:00Z'))
      const result = getPeriodoFechas('este_mes', 15)
      expect(result).toEqual({
        fecha_desde: '2025-06-15',
        fecha_hasta: '2025-07-14',
      })
    })
  })

  describe('este_mes — day < diaInicio (pre-ciclo, retrocede un mes)', () => {
    it('cycle goes back one month when day < diaInicio', () => {
      // June 5: day(5) < dia(10) → cycleOffset=-1 → May 10 to Jun 9
      vi.setSystemTime(new Date('2025-06-05T12:00:00Z'))
      const result = getPeriodoFechas('este_mes', 10)
      expect(result).toEqual({
        fecha_desde: '2025-05-10',
        fecha_hasta: '2025-06-09',
      })
    })
  })

  describe('mes_anterior', () => {
    it('returns the cycle before the current active cycle', () => {
      // June 20, dia=1: current cycle=Jun 1–30, previous=May 1–31
      vi.setSystemTime(new Date('2025-06-20T12:00:00Z'))
      const result = getPeriodoFechas('mes_anterior', 1)
      expect(result).toEqual({
        fecha_desde: '2025-05-01',
        fecha_hasta: '2025-05-31',
      })
    })

    it('handles year boundary correctly (January → December previous year)', () => {
      // Jan 20, dia=1: current cycle=Jan 1–31, previous=Dec 1–31
      vi.setSystemTime(new Date('2025-01-20T12:00:00Z'))
      const result = getPeriodoFechas('mes_anterior', 1)
      expect(result).toEqual({
        fecha_desde: '2024-12-01',
        fecha_hasta: '2024-12-31',
      })
    })
  })

  describe('diaInicio clamping', () => {
    it('clamps diaInicio below 1 to 1', () => {
      vi.setSystemTime(new Date('2025-06-20T12:00:00Z'))
      // dia=0 clamped to 1 → same as dia=1
      const clamped = getPeriodoFechas('este_mes', 0)
      const expected = getPeriodoFechas('este_mes', 1)
      expect(clamped).toEqual(expected)
    })

    it('clamps diaInicio above 28 to 28', () => {
      vi.setSystemTime(new Date('2025-06-20T12:00:00Z'))
      const clamped = getPeriodoFechas('este_mes', 31)
      const expected = getPeriodoFechas('este_mes', 28)
      expect(clamped).toEqual(expected)
    })
  })
})
