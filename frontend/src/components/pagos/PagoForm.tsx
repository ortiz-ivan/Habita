import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import type { Resolver, Control, FieldValues } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import type { PagoRead, PagoWrite } from '../../types/api'
import { formatGs } from '../../utils/format'
import { useContratosSelect } from '../../hooks/queries/useContratos'
import { pagosService } from '../../services/pagosService'
import { FormField, FormSection, FormFooter, inputClass, SelectInput } from '../ui/ModalParts'
import { DatePickerInput } from '../ui/DatePickerInput'
import { MoneyInput } from '../ui/MoneyInput'

const schema = z.object({
  contrato:    z.coerce.number().int().min(1, 'Seleccioná un contrato'),
  monto:       z.coerce.number().int().min(1, 'Requerido'),
  fecha_pago:  z.string().min(1, 'Requerido'),
  metodo_pago: z.enum(['efectivo', 'transferencia', 'tarjeta', 'qr']),
  estado:      z.enum(['pendiente', 'pagado', 'parcial', 'vencido']),
  observacion: z.string().optional().default(''),
})

type FormValues = z.infer<typeof schema>

const NEW_DEFAULTS = { metodo_pago: 'efectivo' as const, estado: 'pagado' as const, observacion: '' }

interface PagoFormProps {
  defaultValues?: Partial<Omit<PagoRead, 'contrato'> & { contrato?: number | { id: number } | null }>
  onSubmit: (data: PagoWrite) => void
  onCancel?: () => void
  isLoading?: boolean
  apiError?: string
}

export default function PagoForm({ defaultValues, onSubmit, onCancel, isLoading, apiError }: PagoFormProps) {
  const today = new Date().toISOString().slice(0, 10)
  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: (defaultValues
      ? { ...NEW_DEFAULTS, ...defaultValues, contrato: typeof defaultValues.contrato === 'object' && defaultValues.contrato != null ? defaultValues.contrato.id : defaultValues.contrato as number | undefined }
      : { ...NEW_DEFAULTS, fecha_pago: today }) as unknown as Partial<FormValues>,
  })

  const { data: contratos } = useContratosSelect()

  const selectedContratoId = watch('contrato')

  const { data: garantiasPendientes } = useQuery({
    queryKey: ['pagos-garantia-pendiente', selectedContratoId],
    queryFn:  () => pagosService.list({
      contrato:  selectedContratoId,
      tipo:      'garantia',
      estado:    'pendiente',
      ordering:  'fecha_pago',
      page_size: 1,
    }),
    enabled: !!selectedContratoId && !defaultValues?.id,
  })

  useEffect(() => {
    if (defaultValues?.id) return
    const contrato = contratos?.find(c => c.id === Number(selectedContratoId))
    if (!contrato) return
    const garantia = garantiasPendientes?.results?.[0]?.monto ?? 0
    setValue('monto', contrato.monto_mensual + garantia)
  }, [selectedContratoId, garantiasPendientes, contratos]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <form onSubmit={handleSubmit(onSubmit as (data: FormValues) => void)} className="flex flex-col gap-6">

      <FormSection label="Contrato">
        <FormField label="Contrato" error={errors.contrato}>
          <SelectInput {...register('contrato')}>
            <option value="">Seleccionar...</option>
            {contratos?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id} — {c.inquilino.apellido}, {c.inquilino.nombre} / Hab. {c.habitacion.numero} ({formatGs(c.monto_mensual)})
              </option>
            ))}
          </SelectInput>
        </FormField>
      </FormSection>

      <FormSection label="Detalle del pago">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Monto (Gs.)" error={errors.monto}>
            <MoneyInput name="monto" control={control as unknown as Control<FieldValues>} placeholder="1.500.000" />
          </FormField>
          <FormField label="Fecha de pago" error={errors.fecha_pago}>
            <Controller
              name="fecha_pago"
              control={control}
              render={({ field }) => (
                <DatePickerInput value={field.value} onChange={field.onChange} />
              )}
            />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Método de pago" error={errors.metodo_pago}>
            <SelectInput {...register('metodo_pago')}>
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="qr">QR</option>
            </SelectInput>
          </FormField>
          <FormField label="Estado" error={errors.estado}>
            <SelectInput {...register('estado')}>
              <option value="pagado">Pagado</option>
              <option value="pendiente">Pendiente</option>
              <option value="parcial">Parcial</option>
              <option value="vencido">Vencido</option>
            </SelectInput>
          </FormField>
        </div>
      </FormSection>

      <FormSection label="Observaciones">
        <FormField label="Observación" error={errors.observacion}>
          <textarea {...register('observacion')} className={inputClass} rows={3} placeholder="Opcional" />
        </FormField>
      </FormSection>

      <FormFooter apiError={apiError} onCancel={onCancel} isLoading={isLoading} isEdit={!!defaultValues?.id} />
    </form>
  )
}
