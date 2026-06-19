import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { habitacionesService, tiposService } from '../../services/habitacionesService'
import { queryKeys } from '../../lib/queryKeys'
import type {
  Habitacion,
  HabitacionWrite,
  HabitacionFilters,
  TipoHabitacion,
  TipoHabitacionWrite,
  BulkCreateHabitacionPayload,
  BulkCreateResult,
} from '../../types/api'

interface MutationOptions<TData = unknown, TVariables = unknown> {
  onSuccess?: (data: TData, variables: TVariables) => void
  onError?: (error: Error) => void
}

function invalidateHabitaciones(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: queryKeys.habitaciones.all() })
  qc.invalidateQueries({ queryKey: queryKeys.habitaciones.pisos() })
}

function invalidateTipos(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: queryKeys.tiposHabitacion.all() })
}

// ── Habitaciones ──────────────────────────────────────────────────────────────

export function useHabitacionesList(filters?: HabitacionFilters) {
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

export function useCreateHabitacion(
  options: MutationOptions<Habitacion, HabitacionWrite> = {}
) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: habitacionesService.create,
    onSuccess: (data, variables) => {
      invalidateHabitaciones(qc)
      options.onSuccess?.(data, variables)
    },
    onError: options.onError,
  })
}

export function useUpdateHabitacion(
  options: MutationOptions<Habitacion, { id: number; data: Partial<HabitacionWrite> }> = {}
) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<HabitacionWrite> }) =>
      habitacionesService.update(id, data),
    onSuccess: (data, variables) => {
      invalidateHabitaciones(qc)
      options.onSuccess?.(data, variables)
    },
    onError: options.onError,
  })
}

export function useDeleteHabitacion(options: MutationOptions<void, number> = {}) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: habitacionesService.remove,
    onSuccess: (data, variables) => {
      invalidateHabitaciones(qc)
      options.onSuccess?.(data, variables)
    },
    onError: options.onError,
  })
}

export function useBulkCreateHabitaciones() {
  const qc = useQueryClient()
  return useMutation<BulkCreateResult, Error, BulkCreateHabitacionPayload>({
    mutationFn: habitacionesService.bulkCreate,
    onSuccess: () => invalidateHabitaciones(qc),
  })
}

// ── Tipos ─────────────────────────────────────────────────────────────────────

export function useTiposHabitacion() {
  return useQuery({
    queryKey: queryKeys.tiposHabitacion.list(),
    queryFn:  tiposService.list,
  })
}

export function useCreateTipoHabitacion() {
  const qc = useQueryClient()
  return useMutation<TipoHabitacion, Error, TipoHabitacionWrite>({
    mutationFn: tiposService.create,
    onSuccess: () => invalidateTipos(qc),
  })
}

export function useUpdateTipoHabitacion() {
  const qc = useQueryClient()
  return useMutation<TipoHabitacion, Error, { id: number; data: Partial<TipoHabitacionWrite> }>({
    mutationFn: ({ id, data }) => tiposService.update(id, data),
    onSuccess: () => invalidateTipos(qc),
  })
}

export function useDeleteTipoHabitacion() {
  const qc = useQueryClient()
  return useMutation<void, Error, number>({
    mutationFn: tiposService.remove,
    onSuccess: () => invalidateTipos(qc),
  })
}

export function useApplyTipoToAll() {
  const qc = useQueryClient()
  return useMutation<Habitacion[], Error, number>({
    mutationFn: tiposService.applyToAll,
    onSuccess: () => invalidateHabitaciones(qc),
  })
}
