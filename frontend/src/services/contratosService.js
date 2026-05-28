import api from './api'

export const contratosService = {
  list:      (params) => api.get('/api/contratos/', { params }).then((r) => r.data),
  listSelect:()       => api.get('/api/contratos/', { params: { estado: 'activo', page_size: 200 } }).then((r) => r.data.results),
  create:    (data)   => api.post('/api/contratos/', data).then((r) => r.data),
  update:    (id, data) => api.patch(`/api/contratos/${id}/`, data).then((r) => r.data),
  remove:    (id)     => api.delete(`/api/contratos/${id}/`),
}
