import api from './api'
import type {
  Habitacion,
  HabitacionWrite,
  HabitacionFilters,
  TipoHabitacion,
  TipoHabitacionWrite,
  BulkCreateHabitacionPayload,
  BulkCreateResult,
  PaginatedResponse,
} from '../types/api'

export const habitacionesService = {
  list: (params?: HabitacionFilters): Promise<PaginatedResponse<Habitacion>> =>
    api.get('/api/v1/habitaciones/', { params }).then((r) => r.data),

  listSelect: (): Promise<Habitacion[]> =>
    api
      .get('/api/v1/habitaciones/', { params: { page_size: 200 } })
      .then((r) => r.data.results),

  create: (data: HabitacionWrite): Promise<Habitacion> =>
    api.post('/api/v1/habitaciones/', data).then((r) => r.data),

  update: (id: number, data: Partial<HabitacionWrite>): Promise<Habitacion> =>
    api.patch(`/api/v1/habitaciones/${id}/`, data).then((r) => r.data),

  remove: (id: number): Promise<void> =>
    api.delete(`/api/v1/habitaciones/${id}/`),

  bulkCreate: (data: BulkCreateHabitacionPayload): Promise<BulkCreateResult> =>
    api.post('/api/v1/habitaciones/bulk_create/', data).then((r) => r.data),
}

export const tiposService = {
  list: (): Promise<TipoHabitacion[]> =>
    api
      .get('/api/v1/habitaciones/tipos/', { params: { page_size: 100 } })
      .then((r) => r.data.results),

  create: (data: TipoHabitacionWrite): Promise<TipoHabitacion> =>
    api.post('/api/v1/habitaciones/tipos/', data).then((r) => r.data),

  update: (id: number, data: Partial<TipoHabitacionWrite>): Promise<TipoHabitacion> =>
    api.patch(`/api/v1/habitaciones/tipos/${id}/`, data).then((r) => r.data),

  remove: (id: number): Promise<void> =>
    api.delete(`/api/v1/habitaciones/tipos/${id}/`),

  applyToAll: (id: number): Promise<Habitacion[]> =>
    api.post(`/api/v1/habitaciones/tipos/${id}/apply_to_all/`).then((r) => r.data),
}
