export const formatGs = (value: number | string | null | undefined): string =>
  `Gs. ${Number(value).toLocaleString('es-PY')}`

export const formatDate = (iso: string | null | undefined): string => {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}-${m}-${y}`
}

export const parseApiError = (err: unknown): string => {
  const data = (err as { response?: { data?: unknown } })?.response?.data
  if (!data) return 'Error inesperado'
  if (typeof data === 'string') return data
  return Object.entries(data as Record<string, unknown>)
    .flatMap(([k, v]) => (Array.isArray(v) ? v : [v]).map((m) => `${k}: ${m}`))
    .join(' | ')
}
