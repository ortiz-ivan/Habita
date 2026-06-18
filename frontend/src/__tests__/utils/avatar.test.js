import { describe, it, expect } from 'vitest'
import { avatarColor } from '../../utils/avatar'

const FIRST_PALETTE = { bg: '#2a1200', text: '#D85A30' }

describe('avatarColor', () => {
  it('returns an object with bg and text properties', () => {
    const color = avatarColor('Juan')
    expect(color).toHaveProperty('bg')
    expect(color).toHaveProperty('text')
  })

  it('is deterministic — same input always returns the same color', () => {
    expect(avatarColor('Maria')).toEqual(avatarColor('Maria'))
    expect(avatarColor('Pedro García')).toEqual(avatarColor('Pedro García'))
  })

  it('returns PALETTE[0] for empty string', () => {
    expect(avatarColor('')).toEqual(FIRST_PALETTE)
  })

  it('returns PALETTE[0] when called with no arguments', () => {
    expect(avatarColor()).toEqual(FIRST_PALETTE)
  })

  it('returns a hex color string for bg', () => {
    const { bg } = avatarColor('Test')
    expect(bg).toMatch(/^#[0-9a-f]{6}$/i)
  })

  it('different inputs can produce different colors', () => {
    // Hash 'A' vs 'Z' — won't collide since palette has 8 entries
    const colors = ['Ana', 'Luis', 'María', 'Pedro', 'Rosa', 'Juan', 'Karla', 'Tomás']
      .map(avatarColor)
    const unique = new Set(colors.map((c) => c.bg))
    expect(unique.size).toBeGreaterThan(1)
  })
})
