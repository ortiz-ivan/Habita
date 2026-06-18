import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useHabitacionesSelect, useCreateHabitacion } from '../../hooks/queries/useHabitaciones'
import { useInquilinosSelect, useCreateInquilino } from '../../hooks/queries/useInquilinos'
import { useContratosSummary } from '../../hooks/queries/useContratos'
import { FormField, FormSection, FormFooter, inputClass, SelectInput } from '../ui/ModalParts'
import { DatePickerInput } from '../ui/DatePickerInput'
import { MoneyInput } from '../ui/MoneyInput'
import { Modal } from '../ui/Modal'
import HabitacionForm from '../habitaciones/HabitacionForm'
import InquilinoForm from '../inquilinos/InquilinoForm'
import { parseApiError } from '../../utils/format'

const schema = z.object({
  habitacion:    z.coerce.number().int().min(1, 'Seleccioná una habitación'),
  inquilino:     z.coerce.number().int().min(1, 'Seleccioná un inquilino'),
  fecha_inicio:  z.string().min(1, 'Requerido'),
  fecha_fin:     z.string().min(1, 'Requerido'),
  monto_mensual: z.coerce.number().int().min(1, 'Requerido'),
  deposito:      z.coerce.number().int().min(0, 'Mínimo 0'),
  estado:        z.enum(['activo', 'finalizado', 'cancelado', 'moroso']),
  observacion:   z.string().optional().default(''),
})

const IconPlus = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
)

export default function ContratoForm({ defaultValues, onSubmit, onCancel, isLoading, apiError }) {
  const [submodal, setSubmodal]           = useState(null)
  const [subError, setSubError]           = useState('')
  const [cuotasGarantia, setCuotasGarantia] = useState(1)

  const { register, handleSubmit, setValue, watch, control, formState: { errors, dirtyFields } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues
      ? {
          ...defaultValues,
          habitacion: defaultValues.habitacion?.id ?? defaultValues.habitacion,
          inquilino:  defaultValues.inquilino?.id  ?? defaultValues.inquilino,
        }
      : (() => {
          const today = new Date()
          const fin   = new Date(today)
          fin.setMonth(fin.getMonth() + 6)
          const fmt = (d) => d.toISOString().slice(0, 10)
          return { estado: 'activo', deposito: 0, observacion: '', fecha_inicio: fmt(today), fecha_fin: fmt(fin) }
        })(),
  })

  const { data: allHabitaciones }                        = useHabitacionesSelect()
  const { data: allInquilinos }                          = useInquilinosSelect()
  const { data: contratosData, isLoading: loadingContratos } = useContratosSummary()

  const currentHabId  = defaultValues?.habitacion?.id ?? defaultValues?.habitacion
  const currentInqId  = defaultValues?.inquilino?.id  ?? defaultValues?.inquilino

  const habitaciones  = allHabitaciones?.filter(h => h.estado !== 'ocupada' || h.id === currentHabId)

  const occupiedInqIds = new Set(
    (contratosData?.results ?? [])
      .filter(c => (c.estado === 'activo' || c.estado === 'moroso') && c.id !== defaultValues?.id)
      .map(c => c.inquilino?.id ?? c.inquilino)
  )
  const inquilinos = loadingContratos
    ? []
    : allInquilinos?.filter(i => !occupiedInqIds.has(i.id) || i.id === currentInqId)

  const habitacionId = watch('habitacion')
  useEffect(() => {
    const hab = allHabitaciones?.find(h => h.id === Number(habitacionId))
    if (hab?.precio && !dirtyFields.monto_mensual) setValue('monto_mensual', hab.precio)
  }, [habitacionId, allHabitaciones])

  const montoMensual = watch('monto_mensual')
  useEffect(() => {
    if (!dirtyFields.deposito) setValue('deposito', montoMensual || 0)
  }, [montoMensual])

  const closeSubmodal = () => { setSubmodal(null); setSubError('') }

  const createHabitacion = useCreateHabitacion({
    onSuccess: (data) => { setValue('habitacion', data.id, { shouldValidate: true }); closeSubmodal() },
    onError:   (err)  => setSubError(parseApiError(err)),
  })

  const createInquilino = useCreateInquilino({
    onSuccess: (data) => { setValue('inquilino', data.id, { shouldValidate: true }); closeSubmodal() },
    onError:   (err)  => setSubError(parseApiError(err)),
  })

  return (
    <>
      <form onSubmit={handleSubmit((data) => onSubmit(data, cuotasGarantia))} className="flex flex-col gap-6">

        <FormSection label="Partes">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Habitación" error={errors.habitacion}>
              <div className="flex items-center gap-2">
                <SelectInput {...register('habitacion')} wrapperClassName="min-w-0 flex-1">
                  <option value="">Seleccionar...</option>
                  {habitaciones?.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.numero} — Piso {h.piso} ({h.estado})
                    </option>
                  ))}
                </SelectInput>
                <button
                  type="button"
                  title="Nueva habitación"
                  onClick={() => { setSubError(''); setSubmodal('habitacion') }}
                  className="flex items-center justify-center w-10 h-10 rounded shrink-0 transition-colors cursor-pointer"
                  style={{ backgroundColor: 'var(--color-brand)', color: '#fff' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-brand-hover)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-brand)' }}
                >
                  <IconPlus />
                </button>
              </div>
            </FormField>
            <FormField label="Inquilino" error={errors.inquilino}>
              <div className="flex items-center gap-2">
                <SelectInput {...register('inquilino')} wrapperClassName="min-w-0 flex-1" disabled={loadingContratos}>
                  <option value="">{loadingContratos ? 'Cargando...' : 'Seleccionar...'}</option>
                  {inquilinos?.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.apellido}, {i.nombre}
                    </option>
                  ))}
                </SelectInput>
                <button
                  type="button"
                  title="Nuevo inquilino"
                  onClick={() => { setSubError(''); setSubmodal('inquilino') }}
                  className="flex items-center justify-center w-10 h-10 rounded shrink-0 transition-colors cursor-pointer"
                  style={{ backgroundColor: 'var(--color-brand)', color: '#fff' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-brand-hover)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-brand)' }}
                >
                  <IconPlus />
                </button>
              </div>
            </FormField>
          </div>
        </FormSection>

        <FormSection label="Vigencia">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Fecha inicio" error={errors.fecha_inicio}>
              <Controller
                name="fecha_inicio"
                control={control}
                render={({ field }) => (
                  <DatePickerInput value={field.value} onChange={field.onChange} />
                )}
              />
            </FormField>
            <FormField label="Fecha fin" error={errors.fecha_fin}>
              <Controller
                name="fecha_fin"
                control={control}
                render={({ field }) => (
                  <DatePickerInput value={field.value} onChange={field.onChange} />
                )}
              />
            </FormField>
          </div>
        </FormSection>

        <FormSection label="Condiciones económicas">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Monto mensual (Gs.)" error={errors.monto_mensual}>
              <MoneyInput name="monto_mensual" control={control} placeholder="1.500.000" />
            </FormField>
            <FormField label="Garantía (Gs.)" error={errors.deposito}>
              <MoneyInput name="deposito" control={control} placeholder="0" />
            </FormField>
          </div>
          {!defaultValues?.id && watch('deposito') > 0 && (
            <div>
              <p className="text-sm font-semibold mb-2 text-stone-dark">Cuotas de garantía</p>
              <div className="flex gap-2">
                {[1, 2, 3].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setCuotasGarantia(n)}
                    className="flex-1 py-2 rounded text-sm font-semibold transition-colors cursor-pointer"
                    style={cuotasGarantia === n
                      ? { backgroundColor: 'var(--color-brand)', color: '#fff' }
                      : { backgroundColor: 'var(--color-surface-2)', color: 'var(--color-stone-text)' }
                    }
                    onMouseEnter={(e) => { if (cuotasGarantia !== n) e.currentTarget.style.color = 'var(--color-fg)' }}
                    onMouseLeave={(e) => { if (cuotasGarantia !== n) e.currentTarget.style.color = 'var(--color-stone-text)' }}
                  >
                    {n} {n === 1 ? 'pago' : 'pagos'}
                  </button>
                ))}
              </div>
            </div>
          )}
          <FormField label="Estado" error={errors.estado}>
            <SelectInput {...register('estado')}>
              <option value="activo">Activo</option>
              <option value="finalizado">Finalizado</option>
              <option value="cancelado">Cancelado</option>
              <option value="moroso">Moroso</option>
            </SelectInput>
          </FormField>
        </FormSection>

        <FormSection label="Observaciones">
          <FormField label="Observación" error={errors.observacion}>
            <textarea {...register('observacion')} className={inputClass} rows={3} placeholder="Opcional" />
          </FormField>
        </FormSection>

        <FormFooter apiError={apiError} onCancel={onCancel} isLoading={isLoading} isEdit={!!defaultValues?.id} />
      </form>

      <Modal isOpen={submodal === 'habitacion'} onClose={closeSubmodal} title="Nueva habitación">
        <HabitacionForm
          onSubmit={(data) => createHabitacion.mutate(data)}
          onCancel={closeSubmodal}
          isLoading={createHabitacion.isPending}
          apiError={subError}
        />
      </Modal>

      <Modal isOpen={submodal === 'inquilino'} onClose={closeSubmodal} title="Nuevo inquilino">
        <InquilinoForm
          onSubmit={(data) => createInquilino.mutate(data)}
          onCancel={closeSubmodal}
          isLoading={createInquilino.isPending}
          apiError={subError}
        />
      </Modal>
    </>
  )
}
