import api from './api'

export const habitacionesService = {
  list:      (params) => api.get('/api/habitaciones/', { params }).then((r) => r.data),
  listSelect:()       => api.get('/api/habitaciones/', { params: { page_size: 200 } }).then((r) => r.data.results),
  create:    (data)   => api.post('/api/habitaciones/', data).then((r) => r.data),
  update:    (id, data) => api.patch(`/api/habitaciones/${id}/`, data).then((r) => r.data),
  remove:    (id)     => api.delete(`/api/habitaciones/${id}/`),
}
