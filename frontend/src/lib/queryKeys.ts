import type {
  PagoFilters,
  HabitacionFilters,
  ContratoFilters,
  InquilinoFilters,
} from '../types/api'

export const queryKeys = {
  pagos: {
    all:           () => ['pagos'] as const,
    list:          (filters?: PagoFilters) => ['pagos', filters] as const,
    pendientes:    () => ['pagos-pendientes'] as const,
    vencidos:      () => ['pagos-vencidos'] as const,
    vencidosCount: () => ['pagos-vencidos-count'] as const,
    dashboard:     (filter: string, fechaParams?: Partial<PagoFilters>) =>
      ['pagos-dashboard', filter, fechaParams ?? {}] as const,
    resumen:       () => ['pagos-resumen'] as const,
  },
  habitaciones: {
    all:    () => ['habitaciones'] as const,
    list:   (filters?: HabitacionFilters) => ['habitaciones', filters] as const,
    pisos:  () => ['habitaciones-pisos'] as const,
    select: () => ['habitaciones-select'] as const,
  },
  tiposHabitacion: {
    all:  () => ['tipos-habitacion'] as const,
    list: () => ['tipos-habitacion', 'list'] as const,
  },
  inquilinos: {
    all:    () => ['inquilinos'] as const,
    list:   (filters?: InquilinoFilters) => ['inquilinos', filters] as const,
    select: () => ['inquilinos-select'] as const,
  },
  contratos: {
    all:     () => ['contratos'] as const,
    list:    (filters?: ContratoFilters) => ['contratos', filters] as const,
    activos: () => ['contratos-activos'] as const,
    select:  () => ['contratos-select'] as const,
  },
}
