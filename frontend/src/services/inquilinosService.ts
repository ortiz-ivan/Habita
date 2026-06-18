import api from './api'
import type {
  Inquilino,
  InquilinoWrite,
  InquilinoFilters,
  PaginatedResponse,
} from '../types/api'

export const inquilinosService = {
  list: (params?: InquilinoFilters): Promise<PaginatedResponse<Inquilino>> =>
    api.get('/api/v1/inquilinos/', { params }).then((r) => r.data),

  listSelect: (): Promise<Inquilino[]> =>
    api
      .get('/api/v1/inquilinos/', { params: { page_size: 200 } })
      .then((r) => r.data.results),

  create: (data: InquilinoWrite): Promise<Inquilino> =>
    api.post('/api/v1/inquilinos/', data).then((r) => r.data),

  update: (id: number, data: Partial<InquilinoWrite>): Promise<Inquilino> =>
    api.patch(`/api/v1/inquilinos/${id}/`, data).then((r) => r.data),

  remove: (id: number): Promise<void> =>
    api.delete(`/api/v1/inquilinos/${id}/`),
}
