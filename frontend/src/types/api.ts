// ─── Common ───────────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

// ─── Usuarios ─────────────────────────────────────────────────────────────────

export type UserRole = 'administrador' | 'recepcionista' | 'supervisor'

export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  rol: UserRole
}

// ─── Inquilinos ───────────────────────────────────────────────────────────────

// Contrato anidado dentro de un Inquilino (para la tarjeta de inquilino)
export interface ContratoInquilino {
  id: number
  habitacion: string | number
  monto_mensual: number
  fecha_fin: string | null
  estado: string
  garantia_info?: {
    cancelada: boolean
    pagadas: number
    total: number
  }
}

export interface Inquilino {
  id: number
  nombre: string
  apellido: string
  email: string
  documento: string
  telefono?: string
  fecha_nacimiento?: string | null
  fecha_ingreso?: string | null
  contrato_activo?: ContratoInquilino | null
}

export type InquilinoWrite = Omit<Inquilino, 'id' | 'contrato_activo'>

export interface InquilinoFilters {
  search?: string
  ordering?: string
  page?: number
  page_size?: number
}

// ─── Habitaciones ─────────────────────────────────────────────────────────────

export type EstadoHabitacion = 'disponible' | 'ocupada' | 'reservada' | 'mantenimiento'

export interface TipoHabitacion {
  id: number
  nombre: string
  descripcion?: string
  precio: number
  tiene_banio_privado: boolean
  capacidad: number
  habitaciones_count?: number
}

export type TipoHabitacionWrite = Omit<TipoHabitacion, 'id'>

export interface HabitacionContratoActivo {
  id: number
  inquilino_nombre: string
  fecha_fin: string | null
  pagos_pendientes: number
}

export interface Habitacion {
  id: number
  numero: string
  piso: number
  estado: EstadoHabitacion
  tipo: TipoHabitacion | null
  tiene_banio_privado: boolean
  capacidad: number
  precio: number
  descripcion?: string
  contrato_activo?: HabitacionContratoActivo | null
}

export interface HabitacionWrite {
  numero: string
  piso: number
  precio: number
  estado?: EstadoHabitacion
  capacidad?: number
  tiene_banio_privado?: boolean
  descripcion?: string
  tipo?: number | null
}

export interface HabitacionFilters {
  piso?: number
  estado?: EstadoHabitacion
  tiene_banio_privado?: boolean
  tipo?: number
  search?: string
  ordering?: string
  page?: number
  page_size?: number
}

export interface BulkCreateHabitacionPayload {
  tipo_id: number
  habitaciones: Array<{ numero: string; piso: number }>
}

export interface BulkCreateResult {
  created: number
  errors?: Array<{ numero: string; error: string }>
}

// ─── Contratos ────────────────────────────────────────────────────────────────

export type EstadoContrato = 'activo' | 'finalizado' | 'cancelado' | 'moroso'

export type EstadoPago = 'pendiente' | 'pagado' | 'parcial' | 'vencido'

// Inquilino anidado dentro de ContratoRead
export interface ContratoInquilinoNested {
  id: number
  nombre: string
  apellido: string
}

export interface ContratoHabitacion {
  id: number
  numero: string
}

export interface GarantiaInfo {
  monto: number
  estado: EstadoPago
  pagos_count: number
  cancelada: boolean
  pagadas: number
  total: number
}

export interface ContratoRead {
  id: number
  inquilino: ContratoInquilinoNested
  habitacion: ContratoHabitacion
  monto_mensual: number
  deposito: number
  estado: EstadoContrato
  fecha_inicio: string
  fecha_fin: string | null
  dia_pago: number
  observacion?: string
  garantia_info?: GarantiaInfo
}

export interface ContratoWrite {
  inquilino: number
  habitacion: number
  monto_mensual: number
  deposito: number
  fecha_inicio: string
  fecha_fin?: string | null
  dia_pago?: number
  estado?: EstadoContrato
  observacion?: string
}

export interface ContratoFilters {
  estado?: EstadoContrato
  inquilino?: number
  habitacion?: number
  search?: string
  ordering?: string
  page?: number
  page_size?: number
}

// ─── Pagos ────────────────────────────────────────────────────────────────────

export type MetodoPago = 'efectivo' | 'transferencia' | 'tarjeta' | 'qr'
export type TipoPago = 'mensualidad' | 'alquiler' | 'garantia' | 'otro'

export interface PagoContrato {
  id: number
  inquilino_nombre: string
  habitacion_numero: string
  monto_mensual: number
}

export interface PagoRead {
  id: number
  contrato: PagoContrato | null
  monto: number
  fecha_pago: string
  metodo_pago: MetodoPago
  estado: EstadoPago
  tipo: TipoPago
  observacion: string
}

export interface PagoWrite {
  contrato: number
  tipo: TipoPago
  monto: number
  fecha_pago: string
  metodo_pago: MetodoPago
  estado: EstadoPago
  observacion?: string
}

export interface PagoFilters {
  contrato?: number | string
  estado?: EstadoPago | string
  tipo?: TipoPago
  metodo_pago?: MetodoPago | string
  fecha_desde?: string
  fecha_hasta?: string
  search?: string
  ordering?: string
  page?: number
  page_size?: number
}

export interface PagosResumen {
  ingresos_mes: number
  ingresos_mes_anterior: number
  monto_adeudado: number
  total_cobrado: number
  total_pendiente: number
  total_vencido: number
  count_pagados: number
  count_pendientes: number
  count_vencidos: number
}
