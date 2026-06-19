import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import type { Resolver, Control, FieldValues } from 'react-hook-form'
import { MoneyInput } from '../ui/MoneyInput'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Habitacion, HabitacionWrite } from '../../types/api'
import { Switch } from '../ui/Switch'
import { FormField, FormSection, FormFooter, inputClass, SelectInput } from '../ui/ModalParts'
import { useTiposHabitacion } from '../../hooks/queries/useHabitaciones'

const schema = z.object({
  numero:              z.string().min(1, 'Requerido'),
  piso:                z.coerce.number().int().min(1, 'Mínimo 1'),
  precio:              z.coerce.number().int().min(1, 'Requerido'),
  estado:              z.enum(['disponible', 'ocupada', 'reservada', 'mantenimiento']),
  capacidad:           z.coerce.number().int().min(1, 'Mínimo 1'),
  tiene_banio_privado: z.boolean().default(false),
  descripcion:         z.string().optional().default(''),
})

type FormValues = z.infer<typeof schema>

interface HabitacionFormProps {
  defaultValues?: Partial<Omit<Habitacion, 'tipo'> & { tipo?: number | string }>
  onSubmit: (data: HabitacionWrite & { tipo: number | null }) => void
  onCancel?: () => void
  isLoading?: boolean
  apiError?: string
}

export default function HabitacionForm({ defaultValues, onSubmit, onCancel, isLoading, apiError }: HabitacionFormProps) {
  const { data: tipos = [] } = useTiposHabitacion()
  const [selectedTipoId, setSelectedTipoId] = useState<number | ''>(defaultValues?.tipo ? Number(defaultValues.tipo) : '')
  const [autoFilled, setAutoFilled] = useState(false)

  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: defaultValues ?? { estado: 'disponible', capacidad: 1, tiene_banio_privado: true, descripcion: '' },
  })

  const handleTipoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value ? Number(e.target.value) : ''
    setSelectedTipoId(id)
    if (id) {
      const tipo = tipos.find((t) => t.id === id)
      if (tipo) {
        setValue('precio', tipo.precio, { shouldValidate: true })
        setValue('capacidad', tipo.capacidad)
        setValue('tiene_banio_privado', tipo.tiene_banio_privado)
        setValue('descripcion', tipo.descripcion ?? '')
        setAutoFilled(true)
      }
    } else {
      setAutoFilled(false)
    }
  }

  const doSubmit = (data: FormValues) => onSubmit({ ...data as unknown as HabitacionWrite, tipo: selectedTipoId || null })

  const selectedTipo = tipos.find((t) => t.id === Number(selectedTipoId))

  return (
    <form onSubmit={handleSubmit(doSubmit)} className="flex flex-col gap-6">

      <FormSection label="Tipo de habitación">
        <FormField label="Tipo (opcional)">
          <SelectInput value={selectedTipoId} onChange={handleTipoChange}>
            <option value="">Sin tipo / manual</option>
            {tipos.map((t) => (
              <option key={t.id} value={t.id}>{t.nombre}</option>
            ))}
          </SelectInput>
        </FormField>
        {selectedTipo && (
          <div className="flex flex-wrap gap-2">
            {[
              `Gs. ${Number(selectedTipo.precio).toLocaleString('es-PY')}`,
              `${selectedTipo.capacidad} persona${selectedTipo.capacidad !== 1 ? 's' : ''}`,
              selectedTipo.tiene_banio_privado ? 'Baño privado' : 'Baño compartido',
            ].map((item) => (
              <span key={item} className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: '#2a1200', color: 'var(--color-brand)' }}>
                {item}
              </span>
            ))}
          </div>
        )}
        {autoFilled && (
          <p className="text-xs" style={{ color: 'var(--color-stone-text)' }}>
            Campos completados automáticamente — podés modificarlos.
          </p>
        )}
      </FormSection>

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
            <MoneyInput name="precio" control={control as unknown as Control<FieldValues>} placeholder="1.500.000" />
          </FormField>
          <FormField label="Capacidad" error={errors.capacidad}>
            <input {...register('capacidad')} type="number" className={inputClass} placeholder="1" />
          </FormField>
        </div>
      </FormSection>

      <FormSection label="Configuración">
        <FormField label="Estado" error={errors.estado}>
          <SelectInput {...register('estado')}>
            <option value="disponible">Disponible</option>
            <option value="ocupada">Ocupada</option>
            <option value="reservada">Reservada</option>
            <option value="mantenimiento">Mantenimiento</option>
          </SelectInput>
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
