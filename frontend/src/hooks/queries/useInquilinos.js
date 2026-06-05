import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { inquilinosService } from '../../services/inquilinosService'
import { queryKeys } from '../../lib/queryKeys'

export function useInquilinosList(filters) {
  return useQuery({
    queryKey: queryKeys.inquilinos.list(filters),
    queryFn:  () => inquilinosService.list(filters),
  })
}

export function useInquilinosSummary() {
  return useQuery({
    queryKey: queryKeys.inquilinos.all(),
    queryFn:  () => inquilinosService.list({ page_size: 200 }),
    staleTime: 2 * 60 * 1000,
  })
}

export function useInquilinosSelect() {
  return useQuery({
    queryKey: queryKeys.inquilinos.select(),
    queryFn:  inquilinosService.listSelect,
  })
}

export function useCreateInquilino({ onSuccess, onError } = {}) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: inquilinosService.create,
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: queryKeys.inquilinos.all() })
      onSuccess?.(...args)
    },
    onError,
  })
}

export function useUpdateInquilino({ onSuccess, onError } = {}) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => inquilinosService.update(id, data),
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: queryKeys.inquilinos.all() })
      onSuccess?.(...args)
    },
    onError,
  })
}

export function useDeleteInquilino({ onSuccess, onError } = {}) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: inquilinosService.remove,
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: queryKeys.inquilinos.all() })
      onSuccess?.(...args)
    },
    onError,
  })
}
