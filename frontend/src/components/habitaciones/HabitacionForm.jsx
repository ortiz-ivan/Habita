import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '../ui/Button'

const schema = z.object({
  numero:              z.string().min(1, 'Requerido'),
  piso:                z.coerce.number().int().min(1, 'Mínimo 1'),
  precio:              z.coerce.number().int().min(1, 'Requerido'),
  estado:              z.enum(['disponible', 'ocupada', 'reservada', 'mantenimiento']),
  capacidad:           z.coerce.number().int().min(1, 'Mínimo 1'),
  tiene_banio_privado: z.boolean().default(false),
  descripcion:         z.string().optional().default(''),
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

export default function HabitacionForm({ defaultValues, onSubmit, isLoading, apiError }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? { estado: 'disponible', capacidad: 1, tiene_banio_privado: false, descripcion: '' },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Número" error={errors.numero}>
          <input {...register('numero')} className={inp} placeholder="101" />
        </Field>
        <Field label="Piso" error={errors.piso}>
          <input {...register('piso')} type="number" className={inp} placeholder="1" />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Precio (Gs.)" error={errors.precio}>
          <input {...register('precio')} type="number" className={inp} placeholder="1500000" />
        </Field>
        <Field label="Capacidad" error={errors.capacidad}>
          <input {...register('capacidad')} type="number" className={inp} placeholder="1" />
        </Field>
      </div>

      <Field label="Estado" error={errors.estado}>
        <select {...register('estado')} className={sel}>
          <option value="disponible">Disponible</option>
          <option value="ocupada">Ocupada</option>
          <option value="reservada">Reservada</option>
          <option value="mantenimiento">Mantenimiento</option>
        </select>
      </Field>

      <Field label="Descripción" error={errors.descripcion}>
        <textarea {...register('descripcion')} className={inp} rows={2} placeholder="Opcional" />
      </Field>

      <label className="flex items-center gap-2.5 text-sm font-medium cursor-pointer select-none" style={{ color: 'var(--color-stone-dark)' }}>
        <input {...register('tiene_banio_privado')} type="checkbox" className="w-4 h-4 rounded accent-brand" />
        Tiene baño privado
      </label>

      {apiError && (
        <p className="text-sm font-medium text-red-text">{apiError}</p>
      )}

      <Button type="submit" disabled={isLoading} className="w-full mt-1">
        {isLoading ? 'Guardando...' : 'Guardar'}
      </Button>
    </form>
  )
}
