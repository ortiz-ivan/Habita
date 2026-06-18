import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import PagoForm from '../../../components/pagos/PagoForm'

// Mock complex UI inputs to simple controlled inputs
vi.mock('../../../components/ui/DatePickerInput', () => ({
  DatePickerInput: ({ value, onChange }) => (
    <input
      data-testid="date-picker"
      type="text"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}))

vi.mock('../../../components/ui/MoneyInput', async () => {
  const { useController } = await import('react-hook-form')
  return {
    MoneyInput: ({ control, name }) => {
      const { field } = useController({ name, control })
      return (
        <input
          data-testid="money-input"
          type="number"
          value={field.value ?? ''}
          onChange={(e) => field.onChange(Number(e.target.value))}
        />
      )
    },
  }
})

// Mock the hooks/services that depend on the API
vi.mock('../../../hooks/queries/useContratos', () => ({
  useContratosSelect: () => ({
    data: [
      {
        id: 5,
        monto_mensual: 1200000,
        inquilino: { nombre: 'Juan', apellido: 'García' },
        habitacion: { numero: '101' },
      },
    ],
  }),
}))

vi.mock('../../../services/pagosService', () => ({
  pagosService: {
    list: vi.fn().mockResolvedValue({ results: [], count: 0 }),
  },
}))

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }) => <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

describe('PagoForm', () => {
  const onSubmit = vi.fn()
  const onCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the contrato select, method select, and status select', () => {
    render(
      <PagoForm onSubmit={onSubmit} onCancel={onCancel} />,
      { wrapper: createWrapper() }
    )
    expect(screen.getByText('Seleccionar...')).toBeInTheDocument()
    expect(screen.getByText('Efectivo')).toBeInTheDocument()
    expect(screen.getByText('Pagado')).toBeInTheDocument()
  })

  it('shows validation error when submitting without selecting a contrato', async () => {
    const user = userEvent.setup()
    render(
      <PagoForm onSubmit={onSubmit} onCancel={onCancel} />,
      { wrapper: createWrapper() }
    )
    await user.click(screen.getByRole('button', { name: 'Guardar' }))
    await waitFor(() => {
      expect(screen.getByText('Seleccioná un contrato')).toBeInTheDocument()
    })
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('shows validation error when monto is zero or empty', async () => {
    const user = userEvent.setup()
    render(
      <PagoForm onSubmit={onSubmit} onCancel={onCancel} />,
      { wrapper: createWrapper() }
    )
    // Set monto to 0 explicitly
    const moneyInput = screen.getByTestId('money-input')
    await user.clear(moneyInput)
    await user.type(moneyInput, '0')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))
    await waitFor(() => {
      expect(screen.getByText('Requerido')).toBeInTheDocument()
    })
  })

  it('displays apiError when provided', () => {
    render(
      <PagoForm onSubmit={onSubmit} onCancel={onCancel} apiError="Error de servidor al guardar" />,
      { wrapper: createWrapper() }
    )
    expect(screen.getByText('Error de servidor al guardar')).toBeInTheDocument()
  })

  it('disables the submit button and shows "Guardando..." when isLoading is true', () => {
    render(
      <PagoForm onSubmit={onSubmit} onCancel={onCancel} isLoading />,
      { wrapper: createWrapper() }
    )
    const submitBtn = screen.getByRole('button', { name: 'Guardando...' })
    expect(submitBtn).toBeDisabled()
  })

  it('shows "Guardar cambios" label when editing an existing pago', () => {
    const defaultValues = {
      id: 10,
      contrato: { id: 5 },
      monto: 1200000,
      fecha_pago: '2025-06-01',
      metodo_pago: 'efectivo',
      estado: 'pagado',
    }
    render(
      <PagoForm onSubmit={onSubmit} onCancel={onCancel} defaultValues={defaultValues} />,
      { wrapper: createWrapper() }
    )
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeInTheDocument()
  })

  it('calls onCancel when the Cancelar button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <PagoForm onSubmit={onSubmit} onCancel={onCancel} />,
      { wrapper: createWrapper() }
    )
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onCancel).toHaveBeenCalledOnce()
  })
})
