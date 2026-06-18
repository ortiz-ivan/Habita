import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pagosService } from '../../services/pagosService'
import { queryKeys } from '../../lib/queryKeys'
import type { PagoRead, PagoWrite, PagoFilters } from '../../types/api'

interface MutationOptions<TData = unknown, TVariables = unknown> {
  onSuccess?: (data: TData, variables: TVariables) => void
  onError?: (error: Error) => void
}

function invalidatePagos(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: queryKeys.pagos.all() })
  qc.invalidateQueries({ queryKey: queryKeys.pagos.pendientes() })
  qc.invalidateQueries({ queryKey: queryKeys.pagos.vencidos() })
  qc.invalidateQueries({ queryKey: queryKeys.pagos.vencidosCount() })
  qc.invalidateQueries({ queryKey: ['pagos-dashboard'] })
  qc.invalidateQueries({ queryKey: ['pagos-resumen'] })
  // garantia_info se calcula en el serializer de contratos, invalidar también
  qc.invalidateQueries({ queryKey: queryKeys.contratos.all() })
  qc.invalidateQueries({ queryKey: queryKeys.contratos.activos() })
  qc.invalidateQueries({ queryKey: queryKeys.contratos.select() })
}

export function usePagosList(filters?: PagoFilters) {
  return useQuery({
    queryKey: queryKeys.pagos.list(filters),
    queryFn:  () => pagosService.list(filters),
  })
}

export function usePagosSummary() {
  return useQuery({
    queryKey: queryKeys.pagos.all(),
    queryFn:  () => pagosService.list({ page_size: 200 }),
    staleTime: 2 * 60 * 1000,
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

export function usePagosDashboard(filter: string, fechaParams: Partial<PagoFilters> = {}) {
  return useQuery({
    queryKey: queryKeys.pagos.dashboard(filter, fechaParams),
    queryFn:  () => {
      const params: PagoFilters = { page_size: 20, ...fechaParams }
      if (filter !== 'all') params.estado = filter as PagoFilters['estado']
      return pagosService.list(params)
    },
  })
}

export function usePagosResumen(params: Partial<PagoFilters> = {}) {
  return useQuery({
    queryKey: ['pagos-resumen', params],
    queryFn:  () => pagosService.resumen(params),
  })
}

export function useCreatePago(options: MutationOptions<PagoRead, PagoWrite> = {}) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: pagosService.create,
    onSuccess: (data, variables) => {
      invalidatePagos(qc)
      options.onSuccess?.(data, variables)
    },
    onError: options.onError,
  })
}

export function useUpdatePago(
  options: MutationOptions<PagoRead, { id: number; data: Partial<PagoWrite> }> = {}
) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<PagoWrite> }) =>
      pagosService.update(id, data),
    onSuccess: (data, variables) => {
      invalidatePagos(qc)
      options.onSuccess?.(data, variables)
    },
    onError: options.onError,
  })
}

export function useDeletePago(options: MutationOptions<void, number> = {}) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: pagosService.remove,
    onSuccess: (data, variables) => {
      invalidatePagos(qc)
      options.onSuccess?.(data, variables)
    },
    onError: options.onError,
  })
}
