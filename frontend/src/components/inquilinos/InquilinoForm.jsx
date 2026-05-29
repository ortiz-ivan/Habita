import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '../ui/Button'

const schema = z.object({
  nombre:              z.string().min(1, 'Requerido'),
  apellido:            z.string().min(1, 'Requerido'),
  telefono:            z.string().min(1, 'Requerido'),
  email:               z.string().email('Email inválido'),
  documento:           z.string().min(1, 'Requerido'),
  fecha_ingreso:       z.string().min(1, 'Requerido'),
  contacto_emergencia: z.string().min(1, 'Requerido'),
})

const inp = 'w-full border border-border-strong rounded px-3.5 py-2.5 text-sm bg-surface-2 text-stone-dark placeholder:text-[#555553] focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all'

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1.5 text-stone-dark">{label}</label>
      {children}
      {error && <p className="text-xs mt-1.5 font-medium text-red-text">{error.message}</p>}
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
        <p className="text-sm font-medium text-red-text">{apiError}</p>
      )}

      <Button type="submit" disabled={isLoading} className="w-full mt-1">
        {isLoading ? 'Guardando...' : 'Guardar'}
      </Button>
    </form>
  )
}
