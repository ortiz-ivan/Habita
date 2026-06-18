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
  rol: UserRole
}

// ─── Inquilinos ───────────────────────────────────────────────────────────────

export interface Inquilino {
  id: number
  nombre: string
  apellido: string
  email: string
  documento: string
  telefono?: string
  fecha_nacimiento?: string | null
}

export type InquilinoWrite = Omit<Inquilino, 'id'>

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
  precio_base?: number
  banio_privado?: boolean
  capacidad?: number
}

export type TipoHabitacionWrite = Omit<TipoHabitacion, 'id'>

export interface Habitacion {
  id: number
  numero: string
  piso: number
  estado: EstadoHabitacion
  tipo: TipoHabitacion | null
  banio_privado?: boolean
  capacidad?: number
  precio?: number
}

export type HabitacionWrite = Omit<Habitacion, 'id' | 'tipo' | 'estado'> & {
  tipo?: number | null
  estado?: EstadoHabitacion
}

export interface HabitacionFilters {
  piso?: number
  estado?: EstadoHabitacion
  banio_privado?: boolean
  tipo?: number
  search?: string
  ordering?: string
  page?: number
  page_size?: number
}

// Payload para bulk_create — refinar cuando se lea el backend serializer
export type BulkCreateHabitacionPayload = Record<string, unknown>

// ─── Contratos ────────────────────────────────────────────────────────────────

export type EstadoContrato = 'activo' | 'finalizado' | 'cancelado' | 'moroso'

export type EstadoPago = 'pendiente' | 'pagado' | 'parcial' | 'vencido'

export interface ContratoInquilino {
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
}

export interface ContratoRead {
  id: number
  inquilino: ContratoInquilino
  habitacion: ContratoHabitacion
  monto_mensual: number
  estado: EstadoContrato
  fecha_inicio: string
  fecha_fin: string | null
  dia_pago: number
  garantia_info?: GarantiaInfo
}

export interface ContratoWrite {
  inquilino: number
  habitacion: number
  monto_mensual: number
  fecha_inicio: string
  fecha_fin?: string | null
  dia_pago?: number
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
export type TipoPago = 'mensualidad' | 'garantia' | 'otro'

export interface PagoContrato {
  id: number
  inquilino_nombre: string
  habitacion_numero: string
}

export interface PagoRead {
  id: number
  contrato: PagoContrato
  monto: number
  fecha_pago: string
  metodo_pago: MetodoPago
  estado: EstadoPago
  tipo: TipoPago
  observacion: string
}

export interface PagoWrite {
  contrato: number
  monto: number
  fecha_pago: string
  metodo_pago: MetodoPago
  estado: EstadoPago
  observacion?: string
}

export interface PagoFilters {
  contrato?: number
  estado?: EstadoPago
  tipo?: TipoPago
  metodo_pago?: MetodoPago
  fecha_desde?: string
  fecha_hasta?: string
  search?: string
  ordering?: string
  page?: number
  page_size?: number
}

export interface PagosResumen {
  total_cobrado: number
  total_pendiente: number
  total_vencido: number
  count_pagados: number
  count_pendientes: number
  count_vencidos: number
}
