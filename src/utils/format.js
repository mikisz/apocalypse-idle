export function formatRate({ amountPerHarvest, intervalSec }) {
  if (amountPerHarvest == null || intervalSec == null) return '+0/s'
  return `+${amountPerHarvest}/${intervalSec}s`
}

export function formatAmount(n) {
  const rounded = Math.round(n)
  if (rounded >= 1000000)
    return `${parseFloat((rounded / 1000000).toFixed(1))}m`
  if (rounded >= 1000) return `${parseFloat((rounded / 1000).toFixed(1))}k`
  return `${rounded}`
}
