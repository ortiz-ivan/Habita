import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useHabitacionesSelect } from '../../hooks/queries/useHabitaciones'
import { useInquilinosSelect } from '../../hooks/queries/useInquilinos'
import { Button } from '../ui/Button'

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

const inp = 'w-full border border-border-strong rounded px-3.5 py-2.5 text-sm bg-surface-2 text-stone-dark placeholder:text-[#555553] focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all'
const sel = `${inp} cursor-pointer`

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1.5 text-stone-dark">{label}</label>
      {children}
      {error && <p className="text-xs mt-1.5 font-medium text-red-text">{error.message}</p>}
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

  const { data: habitaciones } = useHabitacionesSelect()
  const { data: inquilinos }   = useInquilinosSelect()

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
        <p className="text-sm font-medium text-red-text">{apiError}</p>
      )}

      <Button type="submit" disabled={isLoading} className="w-full mt-1">
        {isLoading ? 'Guardando...' : 'Guardar'}
      </Button>
    </form>
  )
}
