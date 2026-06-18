import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { inquilinosService } from '../../services/inquilinosService'
import { queryKeys } from '../../lib/queryKeys'
import type { Inquilino, InquilinoWrite, InquilinoFilters } from '../../types/api'

interface MutationOptions<TData = unknown, TVariables = unknown> {
  onSuccess?: (data: TData, variables: TVariables) => void
  onError?: (error: Error) => void
}

export function useInquilinosList(filters?: InquilinoFilters) {
  return useQuery({
    queryKey: queryKeys.inquilinos.list(filters),
    queryFn:  () => inquilinosService.list(filters),
  })
}

export function useInquilinosSummary() {
  return useQuery({
    queryKey:  queryKeys.inquilinos.all(),
    queryFn:   () => inquilinosService.list({ page_size: 200 }),
    staleTime: 2 * 60 * 1000,
  })
}

export function useInquilinosSelect() {
  return useQuery({
    queryKey: queryKeys.inquilinos.select(),
    queryFn:  inquilinosService.listSelect,
  })
}

export function useCreateInquilino(options: MutationOptions<Inquilino, InquilinoWrite> = {}) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: inquilinosService.create,
    onSuccess: (data, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.inquilinos.all() })
      options.onSuccess?.(data, variables)
    },
    onError: options.onError,
  })
}

export function useUpdateInquilino(
  options: MutationOptions<Inquilino, { id: number; data: Partial<InquilinoWrite> }> = {}
) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InquilinoWrite> }) =>
      inquilinosService.update(id, data),
    onSuccess: (data, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.inquilinos.all() })
      options.onSuccess?.(data, variables)
    },
    onError: options.onError,
  })
}

export function useDeleteInquilino(options: MutationOptions<void, number> = {}) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: inquilinosService.remove,
    onSuccess: (data, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.inquilinos.all() })
      options.onSuccess?.(data, variables)
    },
    onError: options.onError,
  })
}
