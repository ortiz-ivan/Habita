import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { contratosService } from '../../services/contratosService'
import { queryKeys } from '../../lib/queryKeys'

function invalidateContratos(qc) {
  qc.invalidateQueries({ queryKey: queryKeys.contratos.all() })
  qc.invalidateQueries({ queryKey: queryKeys.contratos.select() })
  // crear/editar/eliminar contrato cambia el estado de la habitación asociada
  qc.invalidateQueries({ queryKey: queryKeys.habitaciones.all() })
}

export function useContratosList(filters) {
  return useQuery({
    queryKey: queryKeys.contratos.list(filters),
    queryFn:  () => contratosService.list(filters),
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

export function useCreateContrato({ onSuccess, onError } = {}) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: contratosService.create,
    onSuccess: (...args) => { invalidateContratos(qc); onSuccess?.(...args) },
    onError,
  })
}

export function useUpdateContrato({ onSuccess, onError } = {}) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => contratosService.update(id, data),
    onSuccess: (...args) => { invalidateContratos(qc); onSuccess?.(...args) },
    onError,
  })
}

export function useDeleteContrato({ onSuccess, onError } = {}) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: contratosService.remove,
    onSuccess: (...args) => { invalidateContratos(qc); onSuccess?.(...args) },
    onError,
  })
}
