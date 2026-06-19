import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Inquilino, InquilinoWrite } from '../../types/api'
import { FormField, FormSection, FormFooter, inputClass } from '../ui/ModalParts'
import { DatePickerInput } from '../ui/DatePickerInput'

const schema = z.object({
  nombre:              z.string().min(1, 'Requerido'),
  apellido:            z.string().min(1, 'Requerido'),
  telefono:            z.string().min(1, 'Requerido'),
  email:               z.string().email('Email inválido'),
  documento:           z.string().min(1, 'Requerido'),
  fecha_ingreso:       z.string().min(1, 'Requerido'),
  contacto_emergencia: z.string().min(1, 'Requerido'),
})

type FormValues = z.infer<typeof schema>

interface InquilinoFormProps {
  defaultValues?: Partial<Inquilino>
  onSubmit: (data: InquilinoWrite) => void
  onCancel?: () => void
  isLoading?: boolean
  apiError?: string
}

export default function InquilinoForm({ defaultValues, onSubmit, onCancel, isLoading, apiError }: InquilinoFormProps) {
  const { register, handleSubmit, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: (defaultValues ?? {}) as Partial<FormValues>,
  })

  return (
    <form onSubmit={handleSubmit(onSubmit as (data: FormValues) => void)} className="flex flex-col gap-6">

      <FormSection label="Datos personales">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Nombre" error={errors.nombre}>
            <input {...register('nombre')} className={inputClass} placeholder="Juan" />
          </FormField>
          <FormField label="Apellido" error={errors.apellido}>
            <input {...register('apellido')} className={inputClass} placeholder="Pérez" />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Documento" error={errors.documento}>
            <input {...register('documento')} className={inputClass} placeholder="4.567.890" />
          </FormField>
          <FormField label="Fecha de ingreso" error={errors.fecha_ingreso}>
            <Controller
              name="fecha_ingreso"
              control={control}
              render={({ field }) => (
                <DatePickerInput value={field.value ?? ''} onChange={field.onChange} />
              )}
            />
          </FormField>
        </div>
      </FormSection>

      <FormSection label="Contacto">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Teléfono" error={errors.telefono}>
            <input {...register('telefono')} className={inputClass} placeholder="0981 123456" />
          </FormField>
          <FormField label="Email" error={errors.email}>
            <input {...register('email')} type="email" className={inputClass} placeholder="juan@mail.com" />
          </FormField>
        </div>
        <FormField label="Contacto de emergencia" error={errors.contacto_emergencia}>
          <input {...register('contacto_emergencia')} className={inputClass} placeholder="María Pérez — 0982 654321" />
        </FormField>
      </FormSection>

      <FormFooter apiError={apiError} onCancel={onCancel} isLoading={isLoading} isEdit={!!defaultValues?.id} />
    </form>
  )
}
