const PALETTE = [
  { bg: '#2a1200', text: '#D85A30' },
  { bg: '#0a1f00', text: '#7dc947' },
  { bg: '#0d1a2e', text: '#60a5fa' },
  { bg: '#1a0d2e', text: '#a78bfa' },
  { bg: '#2a1400', text: '#FAC775' },
  { bg: '#091a18', text: '#2dd4bf' },
  { bg: '#1f0d2e', text: '#c084fc' },
  { bg: '#041a10', text: '#34d399' },
]

export function avatarColor(str = '') {
  if (!str) return PALETTE[0]
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return PALETTE[Math.abs(hash) % PALETTE.length]
}
