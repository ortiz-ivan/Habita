import api from './api'
import type {
  PagoRead,
  PagoWrite,
  PagoFilters,
  PagosResumen,
  PaginatedResponse,
} from '../types/api'

export const pagosService = {
  list:    (params?: PagoFilters): Promise<PaginatedResponse<PagoRead>> =>
    api.get('/api/v1/pagos/', { params }).then((r) => r.data),

  create:  (data: PagoWrite): Promise<PagoRead> =>
    api.post('/api/v1/pagos/', data).then((r) => r.data),

  update:  (id: number, data: Partial<PagoWrite>): Promise<PagoRead> =>
    api.patch(`/api/v1/pagos/${id}/`, data).then((r) => r.data),

  remove:  (id: number): Promise<void> =>
    api.delete(`/api/v1/pagos/${id}/`),

  resumen: (params?: Partial<PagoFilters>): Promise<PagosResumen> =>
    api.get('/api/v1/pagos/resumen/', { params }).then((r) => r.data),
}
