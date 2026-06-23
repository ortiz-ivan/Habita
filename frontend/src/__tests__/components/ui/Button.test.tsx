import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '../../../components/ui/Button'

describe('Button', () => {
  it('renders its children', () => {
    render(<Button>Guardar</Button>)
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Click</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('does not call onClick when disabled', () => {
    const onClick = vi.fn()
    render(<Button disabled onClick={onClick}>Click</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('is marked as disabled in the DOM when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('applies small text size class for size="sm"', () => {
    render(<Button size="sm">Small</Button>)
    expect(screen.getByRole('button').className).toContain('text-xs')
  })

  it('applies medium text size class for size="md" (default)', () => {
    render(<Button>Medium</Button>)
    expect(screen.getByRole('button').className).toContain('text-sm')
  })

  it('sets white color for primary variant (default)', () => {
    render(<Button>Primary</Button>)
    expect(screen.getByRole('button').style.color).toBe('rgb(255, 255, 255)')
  })

  it('sets transparent background for ghost variant', () => {
    render(<Button variant="ghost">Ghost</Button>)
    expect(screen.getByRole('button').style.backgroundColor).toBe('transparent')
  })

  it('forwards additional props to the button element', () => {
    render(<Button data-testid="my-btn" type="submit">Submit</Button>)
    const btn = screen.getByTestId('my-btn')
    expect(btn.getAttribute('type')).toBe('submit')
  })

  it('merges custom className', () => {
    render(<Button className="w-full">Full Width</Button>)
    expect(screen.getByRole('button').className).toContain('w-full')
  })
})
