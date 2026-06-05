export const formatGs = (value) =>
  `Gs. ${Number(value).toLocaleString('es-PY')}`

export const formatDate = (iso) => {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}-${m}-${y}`
}

export const parseApiError = (err) => {
  const data = err?.response?.data
  if (!data) return 'Error inesperado'
  if (typeof data === 'string') return data
  return Object.entries(data)
    .flatMap(([k, v]) => (Array.isArray(v) ? v : [v]).map((m) => `${k}: ${m}`))
    .join(' | ')
}
