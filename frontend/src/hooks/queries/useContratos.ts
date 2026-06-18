import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { contratosService } from '../../services/contratosService'
import { queryKeys } from '../../lib/queryKeys'
import type { ContratoRead, ContratoWrite, ContratoFilters } from '../../types/api'

interface MutationOptions<TData = unknown, TVariables = unknown> {
  onSuccess?: (data: TData, variables: TVariables) => void
  onError?: (error: Error) => void
}

function invalidateContratos(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: queryKeys.contratos.all() })
  qc.invalidateQueries({ queryKey: queryKeys.contratos.select() })
  // crear/editar/eliminar contrato cambia el estado de la habitación asociada
  qc.invalidateQueries({ queryKey: queryKeys.habitaciones.all() })
}

export function useContratosList(filters?: ContratoFilters) {
  return useQuery({
    queryKey: queryKeys.contratos.list(filters),
    queryFn:  () => contratosService.list(filters),
  })
}

export function useContratosSummary() {
  return useQuery({
    queryKey:  queryKeys.contratos.all(),
    queryFn:   () => contratosService.list({ page_size: 200 }),
    staleTime: 2 * 60 * 1000,
  })
}

export function useContratosActivos() {
  return useQuery({
    queryKey: queryKeys.contratos.activos(),
    queryFn:  () => contratosService.list({ estado: 'activo', page_size: 100 }),
  })
}

export function useContratosSelect() {
  return useQuery({
    queryKey: queryKeys.contratos.select(),
    queryFn:  contratosService.listSelect,
  })
}

export function useCreateContrato(options: MutationOptions<ContratoRead, ContratoWrite> = {}) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: contratosService.create,
    onSuccess: (data, variables) => {
      invalidateContratos(qc)
      options.onSuccess?.(data, variables)
    },
    onError: options.onError,
  })
}

export function useUpdateContrato(
  options: MutationOptions<ContratoRead, { id: number; data: Partial<ContratoWrite> }> = {}
) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ContratoWrite> }) =>
      contratosService.update(id, data),
    onSuccess: (data, variables) => {
      invalidateContratos(qc)
      options.onSuccess?.(data, variables)
    },
    onError: options.onError,
  })
}

export function useDeleteContrato(options: MutationOptions<void, number> = {}) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: contratosService.remove,
    onSuccess: (data, variables) => {
      invalidateContratos(qc)
      options.onSuccess?.(data, variables)
    },
    onError: options.onError,
  })
}
