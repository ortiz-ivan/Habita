import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import api from '../../services/api'
import { queryKeys } from '../../lib/queryKeys'

const schema = z.object({
  habitacion:    z.coerce.number().int().min(1, 'Seleccioná una habitación'),
  inquilino:     z.coerce.number().int().min(1, 'Seleccioná un inquilino'),
  fecha_inicio:  z.string().min(1, 'Requerido'),
  fecha_fin:     z.string().optional(),
  monto_mensual: z.coerce.number().int().min(1, 'Requerido'),
  deposito:      z.coerce.number().int().min(0, 'Mínimo 0'),
  estado:        z.enum(['activo', 'finalizado', 'cancelado', 'moroso']),
  observacion:   z.string().optional().default(''),
})

const inp = 'w-full border border-[#2a2a2a] rounded px-3.5 py-2.5 text-sm bg-[#1a1a1a] text-[#e5e5e5] placeholder:text-[#555553] focus:outline-none focus:ring-2 focus:ring-[#D85A30] focus:border-[#D85A30] transition-all'
const sel = `${inp} cursor-pointer`

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1.5" style={{ color: '#e5e5e5' }}>{label}</label>
      {children}
      {error && <p className="text-xs mt-1.5 font-medium" style={{ color: '#f87171' }}>{error.message}</p>}
    </div>
  )
}

export default function ContratoForm({ defaultValues, onSubmit, isLoading, apiError }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues
      ? {
          ...defaultValues,
          habitacion: defaultValues.habitacion?.id ?? defaultValues.habitacion,
          inquilino:  defaultValues.inquilino?.id  ?? defaultValues.inquilino,
        }
      : { estado: 'activo', deposito: 0, observacion: '' },
  })

  const { data: habitaciones } = useQuery({
    queryKey: queryKeys.habitaciones.select(),
    queryFn: () => api.get('/api/habitaciones/?page_size=200').then((r) => r.data.results),
  })

  const { data: inquilinos } = useQuery({
    queryKey: queryKeys.inquilinos.select(),
    queryFn: () => api.get('/api/inquilinos/?page_size=200').then((r) => r.data.results),
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Habitación" error={errors.habitacion}>
          <select {...register('habitacion')} className={sel}>
            <option value="">Seleccionar...</option>
            {habitaciones?.map((h) => (
              <option key={h.id} value={h.id}>
                {h.numero} — Piso {h.piso} ({h.estado})
              </option>
            ))}
          </select>
        </Field>
        <Field label="Inquilino" error={errors.inquilino}>
          <select {...register('inquilino')} className={sel}>
            <option value="">Seleccionar...</option>
            {inquilinos?.map((i) => (
              <option key={i.id} value={i.id}>
                {i.apellido}, {i.nombre}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Fecha inicio" error={errors.fecha_inicio}>
          <input {...register('fecha_inicio')} type="date" className={inp} />
        </Field>
        <Field label="Fecha fin (opcional)" error={errors.fecha_fin}>
          <input {...register('fecha_fin')} type="date" className={inp} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Monto mensual (Gs.)" error={errors.monto_mensual}>
          <input {...register('monto_mensual')} type="number" className={inp} placeholder="1500000" />
        </Field>
        <Field label="Depósito (Gs.)" error={errors.deposito}>
          <input {...register('deposito')} type="number" className={inp} placeholder="0" />
        </Field>
      </div>

      <Field label="Estado" error={errors.estado}>
        <select {...register('estado')} className={sel}>
          <option value="activo">Activo</option>
          <option value="finalizado">Finalizado</option>
          <option value="cancelado">Cancelado</option>
          <option value="moroso">Moroso</option>
        </select>
      </Field>

      <Field label="Observación" error={errors.observacion}>
        <textarea {...register('observacion')} className={inp} rows={2} placeholder="Opcional" />
      </Field>

      {apiError && (
        <p className="text-sm font-medium" style={{ color: '#f87171' }}>{apiError}</p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2.5 rounded text-sm font-semibold text-white cursor-pointer disabled:opacity-50 transition-colors mt-1"
        style={{ backgroundColor: '#D85A30' }}
        onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.backgroundColor = '#C04E27' }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#D85A30' }}
      >
        {isLoading ? 'Guardando...' : 'Guardar'}
      </button>
    </form>
  )
}
