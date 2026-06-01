import api from './api'

export const inquilinosService = {
  list:      (params) => api.get('/api/v1/inquilinos/', { params }).then((r) => r.data),
  listSelect:()       => api.get('/api/v1/inquilinos/', { params: { page_size: 200 } }).then((r) => r.data.results),
  create:    (data)   => api.post('/api/v1/inquilinos/', data).then((r) => r.data),
  update:    (id, data) => api.patch(`/api/v1/inquilinos/${id}/`, data).then((r) => r.data),
  remove:    (id)     => api.delete(`/api/v1/inquilinos/${id}/`),
}
