import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const schema = z.object({
  numero:              z.string().min(1, 'Requerido'),
  piso:                z.coerce.number().int().min(1, 'Mínimo 1'),
  precio:              z.coerce.number().int().min(1, 'Requerido'),
  estado:              z.enum(['disponible', 'ocupada', 'reservada', 'mantenimiento']),
  capacidad:           z.coerce.number().int().min(1, 'Mínimo 1'),
  tiene_banio_privado: z.boolean().default(false),
  descripcion:         z.string().optional().default(''),
})

const inp = 'w-full border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm bg-white text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#D85A30] focus:border-[#D85A30] transition-all'
const sel = `${inp} cursor-pointer`

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-stone-700 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-xs mt-1.5 font-medium" style={{ color: '#A32D2D' }}>{error.message}</p>}
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

      <label className="flex items-center gap-2.5 text-sm font-medium text-stone-700 cursor-pointer select-none">
        <input {...register('tiene_banio_privado')} type="checkbox" className="w-4 h-4 rounded accent-[#D85A30]" />
        Tiene baño privado
      </label>

      {apiError && (
        <p className="text-sm font-medium" style={{ color: '#A32D2D' }}>{apiError}</p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer disabled:opacity-50 transition-colors mt-1"
        style={{ backgroundColor: '#D85A30' }}
        onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.backgroundColor = '#C04E27' }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#D85A30' }}
      >
        {isLoading ? 'Guardando...' : 'Guardar'}
      </button>
    </form>
  )
}
