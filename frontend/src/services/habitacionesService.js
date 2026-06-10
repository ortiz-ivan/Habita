import api from './api'

export const habitacionesService = {
  list:       (params)   => api.get('/api/v1/habitaciones/', { params }).then((r) => r.data),
  listSelect: ()         => api.get('/api/v1/habitaciones/', { params: { page_size: 200 } }).then((r) => r.data.results),
  create:     (data)     => api.post('/api/v1/habitaciones/', data).then((r) => r.data),
  update:     (id, data) => api.patch(`/api/v1/habitaciones/${id}/`, data).then((r) => r.data),
  remove:     (id)       => api.delete(`/api/v1/habitaciones/${id}/`),
  bulkCreate: (data)     => api.post('/api/v1/habitaciones/bulk_create/', data).then((r) => r.data),
}

export const tiposService = {
  list:       ()         => api.get('/api/v1/habitaciones/tipos/', { params: { page_size: 100 } }).then((r) => r.data.results),
  create:     (data)     => api.post('/api/v1/habitaciones/tipos/', data).then((r) => r.data),
  update:     (id, data) => api.patch(`/api/v1/habitaciones/tipos/${id}/`, data).then((r) => r.data),
  remove:     (id)       => api.delete(`/api/v1/habitaciones/tipos/${id}/`),
  applyToAll: (id)       => api.post(`/api/v1/habitaciones/tipos/${id}/apply_to_all/`).then((r) => r.data),
}
