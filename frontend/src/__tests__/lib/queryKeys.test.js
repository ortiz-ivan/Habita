import { describe, it, expect } from 'vitest'
import { queryKeys } from '../../lib/queryKeys'

describe('queryKeys', () => {
  describe('pagos', () => {
    it('all() returns stable key', () => {
      expect(queryKeys.pagos.all()).toEqual(['pagos'])
    })

    it('list(filters) includes filters', () => {
      const filters = { estado: 'pagado' }
      expect(queryKeys.pagos.list(filters)).toEqual(['pagos', { estado: 'pagado' }])
    })

    it('dashboard(filter, fechaParams) builds composite key', () => {
      const key = queryKeys.pagos.dashboard('pagado', { fecha_desde: '2025-01-01' })
      expect(key).toEqual(['pagos-dashboard', 'pagado', { fecha_desde: '2025-01-01' }])
    })

    it('dashboard without fechaParams defaults to empty object', () => {
      const key = queryKeys.pagos.dashboard('all', undefined)
      expect(key[2]).toEqual({})
    })
  })

  describe('habitaciones', () => {
    it('all() returns stable key', () => {
      expect(queryKeys.habitaciones.all()).toEqual(['habitaciones'])
    })

    it('list(filters) includes filters', () => {
      expect(queryKeys.habitaciones.list({ piso: 2 })).toEqual(['habitaciones', { piso: 2 }])
    })
  })

  describe('contratos', () => {
    it('activos() returns dedicated key', () => {
      expect(queryKeys.contratos.activos()).toEqual(['contratos-activos'])
    })

    it('select() returns dedicated key', () => {
      expect(queryKeys.contratos.select()).toEqual(['contratos-select'])
    })
  })

  describe('key uniqueness', () => {
    it('pagos.all and contratos.all are different', () => {
      expect(queryKeys.pagos.all()).not.toEqual(queryKeys.contratos.all())
    })

    it('pagos.list with different filters produces different keys', () => {
      const a = queryKeys.pagos.list({ estado: 'pagado' })
      const b = queryKeys.pagos.list({ estado: 'pendiente' })
      expect(a).not.toEqual(b)
    })
  })
})
