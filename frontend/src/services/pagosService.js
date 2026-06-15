import api from './api'

export const pagosService = {
  list:   (params) => api.get('/api/v1/pagos/', { params }).then((r) => r.data),
  create: (data)   => api.post('/api/v1/pagos/', data).then((r) => r.data),
  update: (id, data) => api.patch(`/api/v1/pagos/${id}/`, data).then((r) => r.data),
  remove:  (id)     => api.delete(`/api/v1/pagos/${id}/`),
  resumen: (params) => api.get('/api/v1/pagos/resumen/', { params }).then((r) => r.data),
}
