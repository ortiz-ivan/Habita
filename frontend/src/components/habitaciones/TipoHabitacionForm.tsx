import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import type { TipoHabitacion, TipoHabitacionWrite } from '../../types/api'
import { MoneyInput } from '../ui/MoneyInput'
import { Switch } from '../ui/Switch'
import { FormField, FormSection, FormFooter, inputClass } from '../ui/ModalParts'

const schema = z.object({
  nombre:              z.string().min(1, 'Requerido'),
  precio:              z.coerce.number().int().min(1, 'Requerido'),
  capacidad:           z.coerce.number().int().min(1, 'Mínimo 1'),
  tiene_banio_privado: z.boolean().default(false),
  descripcion:         z.string().optional().default(''),
})

type FormValues = z.infer<typeof schema>

interface TipoHabitacionFormProps {
  defaultValues?: Partial<TipoHabitacion>
  onSubmit: (data: TipoHabitacionWrite, applyToAll: boolean) => void
  onCancel?: () => void
  isLoading?: boolean
  apiError?: string
}

export default function TipoHabitacionForm({ defaultValues, onSubmit, onCancel, isLoading, apiError }: TipoHabitacionFormProps) {
  const isEdit = !!defaultValues?.id
  const [applyToAll, setApplyToAll] = useState(false)

  const { register, handleSubmit, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? {
      nombre: '', precio: 0, capacidad: 1, tiene_banio_privado: false, descripcion: '',
    },
  })

  const doSubmit = (data: FormValues) => onSubmit(data as TipoHabitacionWrite, applyToAll)

  return (
    <form onSubmit={handleSubmit(doSubmit)} className="flex flex-col gap-6">

      <FormSection label="Información">
        <FormField label="Nombre del tipo" error={errors.nombre}>
          <input {...register('nombre')} className={inputClass} placeholder='Ej: "Estándar simple", "Suite doble"' />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Precio (Gs.)" error={errors.precio}>
            <MoneyInput name="precio" control={control} placeholder="500.000" />
          </FormField>
          <FormField label="Capacidad" error={errors.capacidad}>
            <input {...register('capacidad')} type="number" min="1" className={inputClass} placeholder="1" />
          </FormField>
        </div>
      </FormSection>

      <FormSection label="Configuración">
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
          <textarea
            {...register('descripcion')}
            className={inputClass}
            rows={3}
            placeholder="Opcional — características adicionales"
          />
        </FormField>
      </FormSection>

      {isEdit && (
        <label
          className="flex items-start gap-3 p-3 rounded-lg cursor-pointer select-none"
          style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}
        >
          <input
            type="checkbox"
            checked={applyToAll}
            onChange={(e) => setApplyToAll(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded cursor-pointer"
            style={{ accentColor: 'var(--color-brand)' }}
          />
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--color-stone-dark)' }}>
              Aplicar a todas las habitaciones de este tipo
            </p>
            {defaultValues?.habitaciones_count != null && defaultValues.habitaciones_count > 0 && (
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-stone-text)' }}>
                Actualizará precio, capacidad, baño y descripción en {defaultValues.habitaciones_count} habitación{defaultValues.habitaciones_count !== 1 ? 'es' : ''}
              </p>
            )}
          </div>
        </label>
      )}

      <FormFooter apiError={apiError} onCancel={onCancel} isLoading={isLoading} isEdit={isEdit} />
    </form>
  )
}
