import api from './api'
import type {
  ContratoRead,
  ContratoWrite,
  ContratoFilters,
  PaginatedResponse,
} from '../types/api'

export const contratosService = {
  list: (params?: ContratoFilters): Promise<PaginatedResponse<ContratoRead>> =>
    api.get('/api/v1/contratos/', { params }).then((r) => r.data),

  listSelect: (): Promise<ContratoRead[]> =>
    api
      .get('/api/v1/contratos/', { params: { estado: 'activo', page_size: 200 } })
      .then((r) => r.data.results),

  create: (data: ContratoWrite): Promise<ContratoRead> =>
    api.post('/api/v1/contratos/', data).then((r) => r.data),

  update: (id: number, data: Partial<ContratoWrite>): Promise<ContratoRead> =>
    api.patch(`/api/v1/contratos/${id}/`, data).then((r) => r.data),

  remove: (id: number): Promise<void> =>
    api.delete(`/api/v1/contratos/${id}/`),
}
