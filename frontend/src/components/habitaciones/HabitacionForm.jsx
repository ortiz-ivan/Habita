import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const schema = z.object({
  numero:             z.string().min(1, 'Requerido'),
  piso:               z.coerce.number().int().min(1, 'Mínimo 1'),
  precio:             z.coerce.number().int().min(1, 'Requerido'),
  estado:             z.enum(['disponible', 'ocupada', 'reservada', 'mantenimiento']),
  capacidad:          z.coerce.number().int().min(1, 'Mínimo 1'),
  tiene_banio_privado: z.boolean().default(false),
  descripcion:        z.string().optional().default(''),
})

const inp = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
const sel = `${inp} bg-white`

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
    </div>
  )
}

export default function HabitacionForm({ defaultValues, onSubmit, isLoading, apiError }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? { estado: 'disponible', capacidad: 1, tiene_banio_privado: false, descripcion: '' },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Número" error={errors.numero}>
          <input {...register('numero')} className={inp} placeholder="101" />
        </Field>
        <Field label="Piso" error={errors.piso}>
          <input {...register('piso')} type="number" className={inp} placeholder="1" />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
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

      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
        <input {...register('tiene_banio_privado')} type="checkbox" className="rounded" />
        Tiene baño privado
      </label>

      {apiError && <p className="text-red-500 text-sm">{apiError}</p>}

      <button
        type="submit"
        disabled={isLoading}
        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium rounded-lg py-2 text-sm transition-colors"
      >
        {isLoading ? 'Guardando...' : 'Guardar'}
      </button>
    </form>
  )
}
