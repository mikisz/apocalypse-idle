import { computeProductionPerSec } from './mechanics.js'

export function tick(prev, dt) {
  const rates = computeProductionPerSec(prev)
  const next = {
    ...prev,
    resources: { ...prev.resources },
  }

  for (const [resId, res] of Object.entries(prev.resources)) {
    const rate = rates[resId] || 0
    const newAmount = Math.min(res.capacity, res.amount + rate * dt)
    next.resources[resId] = { ...res, amount: newAmount }
  }
  return next
}
