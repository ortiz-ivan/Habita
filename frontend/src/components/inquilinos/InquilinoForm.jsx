import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const schema = z.object({
  nombre:               z.string().min(1, 'Requerido'),
  apellido:             z.string().min(1, 'Requerido'),
  telefono:             z.string().min(1, 'Requerido'),
  email:                z.string().email('Email inválido'),
  documento:            z.string().min(1, 'Requerido'),
  fecha_ingreso:        z.string().min(1, 'Requerido'),
  contacto_emergencia:  z.string().min(1, 'Requerido'),
})

const inp = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
    </div>
  )
}

export default function InquilinoForm({ defaultValues, onSubmit, isLoading, apiError }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? {},
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Nombre" error={errors.nombre}>
          <input {...register('nombre')} className={inp} placeholder="Juan" />
        </Field>
        <Field label="Apellido" error={errors.apellido}>
          <input {...register('apellido')} className={inp} placeholder="Pérez" />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Documento" error={errors.documento}>
          <input {...register('documento')} className={inp} placeholder="4.567.890" />
        </Field>
        <Field label="Fecha de ingreso" error={errors.fecha_ingreso}>
          <input {...register('fecha_ingreso')} type="date" className={inp} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
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
