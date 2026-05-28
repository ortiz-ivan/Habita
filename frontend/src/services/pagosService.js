import api from './api'

export const pagosService = {
  list:   (params) => api.get('/api/pagos/', { params }).then((r) => r.data),
  create: (data)   => api.post('/api/pagos/', data).then((r) => r.data),
  update: (id, data) => api.patch(`/api/pagos/${id}/`, data).then((r) => r.data),
  remove: (id)     => api.delete(`/api/pagos/${id}/`),
}
