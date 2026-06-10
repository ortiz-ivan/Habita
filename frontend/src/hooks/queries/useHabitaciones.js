import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { habitacionesService, tiposService } from '../../services/habitacionesService'
import { queryKeys } from '../../lib/queryKeys'

function invalidateHabitaciones(qc) {
  qc.invalidateQueries({ queryKey: queryKeys.habitaciones.all() })
  qc.invalidateQueries({ queryKey: queryKeys.habitaciones.pisos() })
}

function invalidateTipos(qc) {
  qc.invalidateQueries({ queryKey: queryKeys.tiposHabitacion.all() })
}

// ── Habitaciones ────────────────────────────────────────────────────────────

export function useHabitacionesList(filters) {
  return useQuery({
    queryKey: queryKeys.habitaciones.list(filters),
    queryFn:  () => habitacionesService.list(filters),
  })
}

export function useHabitacionesSummary() {
  return useQuery({
    queryKey: queryKeys.habitaciones.all(),
    queryFn:  () => habitacionesService.list({ page_size: 100 }),
  })
}

export function useHabitacionesPisos() {
  return useQuery({
    queryKey:  queryKeys.habitaciones.pisos(),
    queryFn:   () => habitacionesService.list({ page_size: 200 }),
    staleTime: 2 * 60 * 1000,
  })
}

export function useHabitacionesSelect() {
  return useQuery({
    queryKey: queryKeys.habitaciones.select(),
    queryFn:  habitacionesService.listSelect,
  })
}

export function useCreateHabitacion({ onSuccess, onError } = {}) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: habitacionesService.create,
    onSuccess: (...args) => { invalidateHabitaciones(qc); onSuccess?.(...args) },
    onError,
  })
}

export function useUpdateHabitacion({ onSuccess, onError } = {}) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => habitacionesService.update(id, data),
    onSuccess: (...args) => { invalidateHabitaciones(qc); onSuccess?.(...args) },
    onError,
  })
}

export function useDeleteHabitacion({ onSuccess, onError } = {}) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: habitacionesService.remove,
    onSuccess: (...args) => { invalidateHabitaciones(qc); onSuccess?.(...args) },
    onError,
  })
}

export function useBulkCreateHabitaciones() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: habitacionesService.bulkCreate,
    onSuccess: () => invalidateHabitaciones(qc),
  })
}

// ── Tipos ────────────────────────────────────────────────────────────────────

export function useTiposHabitacion() {
  return useQuery({
    queryKey: queryKeys.tiposHabitacion.list(),
    queryFn:  tiposService.list,
  })
}

export function useCreateTipoHabitacion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: tiposService.create,
    onSuccess: () => invalidateTipos(qc),
  })
}

export function useUpdateTipoHabitacion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => tiposService.update(id, data),
    onSuccess: () => invalidateTipos(qc),
  })
}

export function useDeleteTipoHabitacion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: tiposService.remove,
    onSuccess: () => invalidateTipos(qc),
  })
}

export function useApplyTipoToAll() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: tiposService.applyToAll,
    onSuccess: () => invalidateHabitaciones(qc),
  })
}
