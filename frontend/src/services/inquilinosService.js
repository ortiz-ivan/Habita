import api from './api'

export const inquilinosService = {
  list:      (params) => api.get('/api/inquilinos/', { params }).then((r) => r.data),
  listSelect:()       => api.get('/api/inquilinos/', { params: { page_size: 200 } }).then((r) => r.data.results),
  create:    (data)   => api.post('/api/inquilinos/', data).then((r) => r.data),
  update:    (id, data) => api.patch(`/api/inquilinos/${id}/`, data).then((r) => r.data),
  remove:    (id)     => api.delete(`/api/inquilinos/${id}/`),
}
