const PALETTE = [
  { bg: '#FAECE7', text: '#C04E27' },
  { bg: '#F0FDF4', text: '#15803D' },
  { bg: '#EFF6FF', text: '#1D4ED8' },
  { bg: '#F5F3FF', text: '#6D28D9' },
  { bg: '#FFF7ED', text: '#C2410C' },
  { bg: '#F0FDFA', text: '#0F766E' },
  { bg: '#FDF4FF', text: '#7E22CE' },
  { bg: '#ECFDF5', text: '#065F46' },
]

export function avatarColor(str = '') {
  if (!str) return PALETTE[0]
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return PALETTE[Math.abs(hash) % PALETTE.length]
}
