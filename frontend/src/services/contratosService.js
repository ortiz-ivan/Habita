import api from './api'

export const contratosService = {
  list:      (params) => api.get('/api/v1/contratos/', { params }).then((r) => r.data),
  listSelect:()       => api.get('/api/v1/contratos/', { params: { estado: 'activo', page_size: 200 } }).then((r) => r.data.results),
  create:    (data)   => api.post('/api/v1/contratos/', data).then((r) => r.data),
  update:    (id, data) => api.patch(`/api/v1/contratos/${id}/`, data).then((r) => r.data),
  remove:    (id)     => api.delete(`/api/v1/contratos/${id}/`),
}
