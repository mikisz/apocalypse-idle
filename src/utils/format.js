export function formatRate({ amountPerHarvest, intervalSec }) {
  if (amountPerHarvest == null || intervalSec == null) return '+0/s'
  return `+${amountPerHarvest}/${intervalSec}s`
}

export function formatAmount(n) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}m`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return `${n}`
}
