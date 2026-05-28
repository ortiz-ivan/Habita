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

      <label className="flex items-center gap-2.5 text-sm font-medium cursor-pointer select-none" style={{ color: '#e5e5e5' }}>
        <input {...register('tiene_banio_privado')} type="checkbox" className="w-4 h-4 rounded accent-[#D85A30]" />
        Tiene baño privado
      </label>

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
