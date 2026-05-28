export const queryKeys = {
  pagos: {
    all:          () => ['pagos'],
    list:         (filters) => ['pagos', filters],
    pendientes:   () => ['pagos-pendientes'],
    vencidos:     () => ['pagos-vencidos'],
    vencidosCount:() => ['pagos-vencidos-count'],
    dashboard:    (filter) => ['pagos-dashboard', filter],
  },
  habitaciones: {
    all:   () => ['habitaciones'],
    list:  (filters) => ['habitaciones', filters],
    pisos: () => ['habitaciones-pisos'],
    select:() => ['habitaciones-select'],
  },
  inquilinos: {
    all:   () => ['inquilinos'],
    list:  (filters) => ['inquilinos', filters],
    select:() => ['inquilinos-select'],
  },
  contratos: {
    all:   () => ['contratos'],
    list:  (filters) => ['contratos', filters],
    activos:() => ['contratos-activos'],
    select: () => ['contratos-select'],
  },
}
