import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PagoCard } from '../../../components/pagos/PagoCard'

const basePago = {
  id: 1,
  contrato: {
    inquilino_nombre: 'García, Juan',
    habitacion_numero: '101',
  },
  monto: 1500000,
  fecha_pago: '2025-06-01',
  estado: 'pagado',
  metodo_pago: 'efectivo',
}

const handlers = {
  onView: vi.fn(),
  onEdit: vi.fn(),
  onCobrar: vi.fn(),
}

function renderCard(pago = basePago, props = {}) {
  return render(<PagoCard p={pago} {...handlers} {...props} />)
}

describe('PagoCard', () => {
  it('renders the inquilino name', () => {
    renderCard()
    expect(screen.getByText('García, Juan')).toBeInTheDocument()
  })

  it('renders the habitacion number', () => {
    renderCard()
    expect(screen.getByText('Hab. 101')).toBeInTheDocument()
  })

  it('renders the formatted monto', () => {
    renderCard()
    expect(screen.getByText(/Gs\./)).toBeInTheDocument()
  })

  it('renders the formatted date', () => {
    renderCard()
    expect(screen.getByText('01-06-2025')).toBeInTheDocument()
  })

  it('renders the estado label from estadoConfig', () => {
    renderCard()
    expect(screen.getByText('Pagado')).toBeInTheDocument()
  })

  it('renders the metodo_pago text', () => {
    renderCard()
    expect(screen.getByText('efectivo')).toBeInTheDocument()
  })

  it('does NOT show the Cobrar button when estado is "pagado"', () => {
    renderCard()
    expect(screen.queryByText('Cobrar')).not.toBeInTheDocument()
  })

  it('shows Cobrar button when estado is "pendiente" and onCobrar is provided', () => {
    renderCard({ ...basePago, estado: 'pendiente' })
    expect(screen.getByText('Cobrar')).toBeInTheDocument()
  })

  it('does NOT show Cobrar button when estado is "pendiente" but onCobrar is absent', () => {
    render(<PagoCard p={{ ...basePago, estado: 'pendiente' }} onView={vi.fn()} onEdit={vi.fn()} />)
    expect(screen.queryByText('Cobrar')).not.toBeInTheDocument()
  })

  it('calls onView with the pago when Ver is clicked', () => {
    renderCard()
    fireEvent.click(screen.getByText('Ver'))
    expect(handlers.onView).toHaveBeenCalledWith(basePago)
  })

  it('calls onEdit with the pago when Editar is clicked', () => {
    renderCard()
    fireEvent.click(screen.getByText('Editar'))
    expect(handlers.onEdit).toHaveBeenCalledWith(basePago)
  })

  it('calls onCobrar with the pago when Cobrar is clicked', () => {
    const pendientePago = { ...basePago, estado: 'pendiente' }
    renderCard(pendientePago)
    fireEvent.click(screen.getByText('Cobrar'))
    expect(handlers.onCobrar).toHaveBeenCalledWith(pendientePago)
  })

  it('handles unknown estado with a fallback label (raw value)', () => {
    renderCard({ ...basePago, estado: 'desconocido' })
    expect(screen.getByText('desconocido')).toBeInTheDocument()
  })
})
