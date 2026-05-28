import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const schema = z.object({
  nombre:              z.string().min(1, 'Requerido'),
  apellido:            z.string().min(1, 'Requerido'),
  telefono:            z.string().min(1, 'Requerido'),
  email:               z.string().email('Email inválido'),
  documento:           z.string().min(1, 'Requerido'),
  fecha_ingreso:       z.string().min(1, 'Requerido'),
  contacto_emergencia: z.string().min(1, 'Requerido'),
})

const inp = 'w-full border border-[#2a2a2a] rounded px-3.5 py-2.5 text-sm bg-[#1a1a1a] text-[#e5e5e5] placeholder:text-[#555553] focus:outline-none focus:ring-2 focus:ring-[#D85A30] focus:border-[#D85A30] transition-all'

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1.5" style={{ color: '#e5e5e5' }}>{label}</label>
      {children}
      {error && <p className="text-xs mt-1.5 font-medium" style={{ color: '#f87171' }}>{error.message}</p>}
    </div>
  )
}

export default function InquilinoForm({ defaultValues, onSubmit, isLoading, apiError }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? {},
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Nombre" error={errors.nombre}>
          <input {...register('nombre')} className={inp} placeholder="Juan" />
        </Field>
        <Field label="Apellido" error={errors.apellido}>
          <input {...register('apellido')} className={inp} placeholder="Pérez" />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Documento" error={errors.documento}>
          <input {...register('documento')} className={inp} placeholder="4.567.890" />
        </Field>
        <Field label="Fecha de ingreso" error={errors.fecha_ingreso}>
          <input {...register('fecha_ingreso')} type="date" className={inp} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Teléfono" error={errors.telefono}>
          <input {...register('telefono')} className={inp} placeholder="0981 123456" />
        </Field>
        <Field label="Email" error={errors.email}>
          <input {...register('email')} type="email" className={inp} placeholder="juan@mail.com" />
        </Field>
      </div>

      <Field label="Contacto de emergencia" error={errors.contacto_emergencia}>
        <input {...register('contacto_emergencia')} className={inp} placeholder="María Pérez — 0982 654321" />
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
