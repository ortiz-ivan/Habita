import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pagosService } from '../../services/pagosService'
import { queryKeys } from '../../lib/queryKeys'

function invalidatePagos(qc) {
  qc.invalidateQueries({ queryKey: queryKeys.pagos.all() })
  qc.invalidateQueries({ queryKey: queryKeys.pagos.pendientes() })
  qc.invalidateQueries({ queryKey: queryKeys.pagos.vencidos() })
  qc.invalidateQueries({ queryKey: queryKeys.pagos.vencidosCount() })
}

export function usePagosList(filters) {
  return useQuery({
    queryKey: queryKeys.pagos.list(filters),
    queryFn:  () => pagosService.list(filters),
  })
}

export function usePagosVencidos() {
  return useQuery({
    queryKey: queryKeys.pagos.vencidos(),
    queryFn:  () => pagosService.list({ estado: 'vencido', page_size: 1 }),
  })
}

export function usePagosPendientes() {
  return useQuery({
    queryKey: queryKeys.pagos.pendientes(),
    queryFn:  () => pagosService.list({ estado: 'pendiente', page_size: 1 }),
  })
}

export function usePagosVencidosCount() {
  return useQuery({
    queryKey:        queryKeys.pagos.vencidosCount(),
    queryFn:         () => pagosService.list({ estado: 'vencido', page_size: 1 }),
    refetchInterval: 60_000,
    select:          (data) => data.count,
  })
}

export function usePagosDashboard(filter) {
  return useQuery({
    queryKey: queryKeys.pagos.dashboard(filter),
    queryFn:  () => {
      const params = { page_size: 8 }
      if (filter !== 'all') params.estado = filter
      return pagosService.list(params)
    },
  })
}

export function useCreatePago({ onSuccess, onError } = {}) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: pagosService.create,
    onSuccess: (...args) => { invalidatePagos(qc); onSuccess?.(...args) },
    onError,
  })
}

export function useUpdatePago({ onSuccess, onError } = {}) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => pagosService.update(id, data),
    onSuccess: (...args) => { invalidatePagos(qc); onSuccess?.(...args) },
    onError,
  })
}

export function useDeletePago({ onSuccess, onError } = {}) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: pagosService.remove,
    onSuccess: (...args) => { invalidatePagos(qc); onSuccess?.(...args) },
    onError,
  })
}
