import { useForm, Controller } from 'react-hook-form'
import { MoneyInput } from '../ui/MoneyInput'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Switch } from '../ui/Switch'
import { FormField, FormSection, FormFooter, inputClass, selectClass } from '../ui/ModalParts'

const schema = z.object({
  numero:              z.string().min(1, 'Requerido'),
  piso:                z.coerce.number().int().min(1, 'Mínimo 1'),
  precio:              z.coerce.number().int().min(1, 'Requerido'),
  estado:              z.enum(['disponible', 'ocupada', 'reservada', 'mantenimiento']),
  capacidad:           z.coerce.number().int().min(1, 'Mínimo 1'),
  tiene_banio_privado: z.boolean().default(false),
  descripcion:         z.string().optional().default(''),
})

export default function HabitacionForm({ defaultValues, onSubmit, onCancel, isLoading, apiError }) {
  const { register, handleSubmit, control, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? { estado: 'disponible', capacidad: 1, tiene_banio_privado: true, descripcion: '' },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">

      <FormSection label="Información general">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Número" error={errors.numero}>
            <input {...register('numero')} className={inputClass} placeholder="101" />
          </FormField>
          <FormField label="Piso" error={errors.piso}>
            <input {...register('piso')} type="number" className={inputClass} placeholder="1" />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Precio (Gs.)" error={errors.precio}>
            <MoneyInput name="precio" control={control} placeholder="1.500.000" />
          </FormField>
          <FormField label="Capacidad" error={errors.capacidad}>
            <input {...register('capacidad')} type="number" className={inputClass} placeholder="1" />
          </FormField>
        </div>
      </FormSection>

      <FormSection label="Configuración">
        <FormField label="Estado" error={errors.estado}>
          <select {...register('estado')} className={selectClass}>
            <option value="disponible">Disponible</option>
            <option value="ocupada">Ocupada</option>
            <option value="reservada">Reservada</option>
            <option value="mantenimiento">Mantenimiento</option>
          </select>
        </FormField>
        <Controller
          name="tiene_banio_privado"
          control={control}
          render={({ field }) => (
            <Switch checked={field.value} onChange={field.onChange} label="Tiene baño privado" />
          )}
        />
      </FormSection>

      <FormSection label="Descripción">
        <FormField label="Descripción" error={errors.descripcion}>
          <textarea {...register('descripcion')} className={inputClass} rows={3} placeholder="Opcional — características adicionales" />
        </FormField>
      </FormSection>

      <FormFooter apiError={apiError} onCancel={onCancel} isLoading={isLoading} isEdit={!!defaultValues?.id} />
    </form>
  )
}
